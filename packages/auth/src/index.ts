/**
 * @veil/auth — biometric SSI with ZK proof of authentication.
 * Nothing ever leaves the device.
 */

export type { PQCKeypair, EnrollmentResult, AuthResult, AuthProof, RecoveryShard } from './types.js';

export { enrollBiometric, reproduceSeed, quantize } from './fuzzy.js';
export { deriveKeypair, deriveAddress } from './key-derive.js';
export { generateAuthProof, verifyAuthProof, getVerificationKey } from './zk.js';
export { generateRecoveryShards, reconstructFromShards } from './sss.js';

import { blake2s } from '@noble/hashes/blake2s';
import { enrollBiometric, reproduceSeed } from './fuzzy.js';
import { deriveKeypair, deriveAddress } from './key-derive.js';
import { generateAuthProof, verifyAuthProof, getVerificationKey } from './zk.js';
import type { EnrollmentResult, AuthResult } from './types.js';

/**
 * VeilAuth — high-level wrapper for the full biometric auth flow.
 *
 * Typical usage:
 *   const auth = new VeilAuth();
 *   const enrollment = await auth.enroll(embedding);
 *   // store enrollment.sketch, enrollment.commitment, enrollment.verificationKey
 *
 *   const result = await auth.authenticate(embedding, sketch, commitment, vk);
 *   // result.keypair, result.address, result.proof
 */
export class VeilAuth {
  /**
   * Full enrollment flow:
   *   fuzzy extractor → seed → commitment → keypair → ZK setup
   */
  async enroll(faceEmbedding: Float32Array): Promise<EnrollmentResult> {
    const { sketch, seed, commitment } = enrollBiometric(faceEmbedding);
    const keypair = deriveKeypair(seed);
    const verificationKey = getVerificationKey();

    return {
      sketch,
      commitment,
      address: keypair.address,
      verificationKey,
    };
  }

  /**
   * Full authentication flow:
   *   reproduce seed → generate ZK proof → derive keypair
   */
  async authenticate(
    faceEmbedding: Float32Array,
    sketch: Uint8Array,
    commitment: Uint8Array,
    verificationKey: Uint8Array,
  ): Promise<AuthResult> {
    const seed = reproduceSeed(faceEmbedding, sketch);

    // Verify the reproduced seed matches the stored commitment
    const seedCommitment = blake2s(seed);
    if (!bytesEqual(seedCommitment, commitment)) {
      throw new Error('Authentication failed: seed commitment mismatch');
    }

    const keypair = deriveKeypair(seed);
    const proof = await generateAuthProof(faceEmbedding, sketch, commitment);

    if (!await verifyAuthProof(proof.proof, proof.publicInputs, verificationKey)) {
      throw new Error('Authentication failed: ZK proof invalid');
    }

    return {
      proof,
      keypair,
      address: keypair.address,
    };
  }
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
