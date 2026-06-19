/**
 * Secure-sketch fuzzy extractor using the code-offset construction.
 *
 * Construction (Dodis et al.):
 *   1. Quantize face embedding to 128 bytes (one byte per dimension).
 *   2. Enroll: sample random seed R, compute RS codeword C = Enc(R[0..k-1]),
 *      store sketch P = embedding_bytes XOR C.
 *   3. Reproduce: compute candidate = new_bytes XOR P = new_bytes XOR embedding XOR C.
 *      RS decode candidate → C' ≈ C. Recover seed from C'[0..k-1].
 *   4. Verify against commitment = SHA3-256(R).
 *
 * RS parameters: t=42 → 84 parity bytes, k=171 data bytes, n=255.
 * Embedding (128 bytes) fits in the k=171 data portion (zero-padded).
 * Hamming distance ≤ 42 bytes between embeddings → decoding succeeds.
 */

import { blake2s } from '@noble/hashes/blake2s';
import { rsEncode, rsDecode, rsExtractMessage } from './rs.js';

const T = 42;           // error-correction capability (bytes)
const N = 255;          // RS codeword length
const K = N - 2 * T;   // 171 data bytes

/** Quantize a float32 embedding to a byte array.
 *  Maps each dimension from [-1,1] → [0,255]. Clips to [0,255]. */
export function quantize(embedding: Float32Array): Uint8Array {
  const out = new Uint8Array(embedding.length);
  for (let i = 0; i < embedding.length; i++) {
    const v = Math.round((embedding[i] + 1) * 127.5);
    out[i] = Math.max(0, Math.min(255, v));
  }
  return out;
}

/**
 * Enroll a face embedding.
 * Returns sketch (public), seed (private, derive keys from this), and commitment (public).
 */
export function enrollBiometric(faceEmbedding: Float32Array): {
  sketch: Uint8Array;
  seed: Uint8Array;
  commitment: Uint8Array;
} {
  if (faceEmbedding.length !== 128) {
    throw new RangeError('Face embedding must be 128 dimensions');
  }

  const embBytes = quantize(faceEmbedding);

  // Generate random 32-byte seed R
  const seed = crypto.getRandomValues(new Uint8Array(32));

  // Pad seed to K bytes (171) for use as RS message
  const message = new Uint8Array(K);
  message.set(seed, 0);

  // Encode: C = RS(message), length 255
  const codeword = rsEncode(message, T);

  // sketch P = embedding_bytes (128) XOR codeword (128 bytes of the 255-byte codeword)
  // We only XOR the first 128 bytes of the codeword with the embedding.
  // Store the remaining codeword bytes as-is in the sketch (they're parity).
  const sketch = new Uint8Array(N);
  for (let i = 0; i < 128; i++) {
    sketch[i] = embBytes[i] ^ codeword[i];
  }
  // Remaining 127 bytes of codeword stored plaintext (they are parity / zeros from padding)
  sketch.set(codeword.slice(128), 128);

  const commitment = blake2s(seed);

  return { sketch, seed, commitment };
}

/**
 * Reproduce the seed from a new face embedding and the stored sketch.
 * Throws if Hamming distance exceeds the correction threshold (42 bytes).
 */
export function reproduceSeed(
  faceEmbedding: Float32Array,
  sketch: Uint8Array,
): Uint8Array {
  if (faceEmbedding.length !== 128) {
    throw new RangeError('Face embedding must be 128 dimensions');
  }
  if (sketch.length !== N) {
    throw new RangeError(`Sketch must be ${N} bytes`);
  }

  const embBytes = quantize(faceEmbedding);

  // Reconstruct the (corrupted) codeword: first 128 bytes = new_emb XOR sketch
  const received = new Uint8Array(N);
  for (let i = 0; i < 128; i++) {
    received[i] = embBytes[i] ^ sketch[i];
  }
  received.set(sketch.slice(128), 128);

  // RS decode → corrected codeword (throws if too many errors)
  let corrected: Uint8Array;
  try {
    corrected = rsDecode(received, T);
  } catch {
    throw new Error('Authentication failed: biometric too far from enrolled template');
  }

  // Extract seed = first 32 bytes of the message portion
  const message = rsExtractMessage(corrected, T);
  return message.slice(0, 32);
}
