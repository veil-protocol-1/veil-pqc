/**
 * ZK proof layer for biometric authentication.
 *
 * The Noir circuit (circuits/src/main.nr) proves that the prover knows a
 * biometric embedding and seed such that BLAKE2s(seed) == commitment —
 * without revealing the embedding or the seed.
 *
 * Proof system: UltraHonk via Barretenberg (bb.js 5.x).
 * Circuit compiled with nargo 1.0.0-beta.22.
 * Typical proving time: 1–3 seconds on modern hardware.
 */

import { Noir } from '@noir-lang/noir_js';
import { Barretenberg, UltraHonkBackend } from '@aztec/bb.js';
import { blake2s } from '@noble/hashes/blake2s';
import type { CompiledCircuit } from '@noir-lang/noir_js';
import type { AuthProof } from './types.js';
import { reproduceSeed, quantize } from './fuzzy.js';

// Circuit artifact compiled by `nargo compile` — bundled with the package.
import circuitJson from '../circuits/target/biometric_auth.json';

const circuit = circuitJson as unknown as CompiledCircuit;

// Lazy singleton: Barretenberg WASM and UltraHonkBackend initialize once per process.
let _backendPromise: Promise<UltraHonkBackend> | null = null;

function getLazyBackend(): Promise<UltraHonkBackend> {
  if (!_backendPromise) {
    _backendPromise = (async () => {
      const api = await Barretenberg.new({ threads: 1 });
      return new UltraHonkBackend(circuit.bytecode, api);
    })();
  }
  return _backendPromise;
}

/**
 * Generate a ZK proof that the prover ran the fuzzy extractor correctly.
 *
 * Internally recovers the seed from the embedding + sketch, then executes
 * the Noir circuit to generate a Barretenberg UltraHonk proof.
 *
 * The proof binds (embedding, seed) to the public (sketch, commitment)
 * without revealing either private input.
 */
export async function generateAuthProof(
  faceEmbedding: Float32Array,
  sketch: Uint8Array,
  commitment: Uint8Array,
): Promise<AuthProof> {
  // Recover the seed (private circuit input) from the biometric.
  // Throws if the embedding is too far from the enrolled template.
  const seed = reproduceSeed(faceEmbedding, sketch);

  // Quantize the float embedding to bytes for the circuit.
  const embBytes = quantize(faceEmbedding);

  // Build circuit inputs — all u8 arrays passed as plain number arrays.
  const inputs = {
    embedding: Array.from(embBytes),
    seed: Array.from(seed),
    sketch: Array.from(sketch),
    commitment: Array.from(commitment),
  };

  // Execute the circuit to produce the witness.
  const noir = new Noir(circuit);
  const { witness } = await noir.execute(inputs);

  // Prove with Barretenberg UltraHonk.
  const backend = await getLazyBackend();
  const proofData = await backend.generateProof(witness);

  return proofData; // { proof: Uint8Array, publicInputs: string[] }
}

/**
 * Verify a ZK proof against public inputs.
 *
 * Uses the Barretenberg verification key derived from the circuit.
 * The verificationKey parameter is kept for API compatibility — the actual
 * ZK verification key is always derived internally from the circuit.
 */
export async function verifyAuthProof(
  proof: Uint8Array,
  publicInputs: string[],
  _verificationKey: Uint8Array,
): Promise<boolean> {
  if (publicInputs.length < 2) return false;

  try {
    const backend = await getLazyBackend();
    return await backend.verifyProof({ proof, publicInputs });
  } catch {
    // bb.js throws on malformed proofs (non-canonical field elements, bad
    // pairing points, etc.) rather than returning false.
    return false;
  }
}

/**
 * Returns a stable 32-byte circuit identity token.
 *
 * This is BLAKE2s of the first 64 characters of the circuit bytecode —
 * deterministic for a given circuit build. Callers can store this alongside
 * proofs to identify which circuit version produced them.
 *
 * The actual Barretenberg verification key is managed internally by the
 * UltraHonk backend.
 */
export function getVerificationKey(): Uint8Array {
  const marker = new TextEncoder().encode(circuit.bytecode.slice(0, 64));
  return blake2s(marker);
}
