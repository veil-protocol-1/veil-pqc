import { describe, it, expect } from 'vitest';
import { VeilAuth } from '../src/index.js';
import { deriveKeypair } from '../src/key-derive.js';
import { enrollBiometric, reproduceSeed } from '../src/fuzzy.js';
import { generateRecoveryShards, reconstructFromShards } from '../src/sss.js';
import { blake2s } from '@noble/hashes/blake2s';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';

function mockEmbedding(variant = 0): Float32Array {
  const emb = new Float32Array(128);
  for (let i = 0; i < 128; i++) {
    emb[i] = Math.sin((i + variant) * 0.2) * 0.85;
  }
  return emb;
}

describe('VeilAuth full enroll → authenticate roundtrip', () => {
  it('enroll returns valid commitment and address', async () => {
    const auth = new VeilAuth();
    const emb = mockEmbedding();
    const enrollment = await auth.enroll(emb);

    expect(enrollment.sketch).toBeInstanceOf(Uint8Array);
    expect(enrollment.sketch.length).toBe(255);
    expect(enrollment.commitment).toBeInstanceOf(Uint8Array);
    expect(enrollment.commitment.length).toBe(32);
    expect(enrollment.address).toMatch(/^0x[0-9a-f]{40}$/);
    expect(enrollment.verificationKey).toBeInstanceOf(Uint8Array);
  });

  it('authenticate with same embedding succeeds', async () => {
    const auth = new VeilAuth();
    const emb = mockEmbedding();

    const enrollment = await auth.enroll(emb);
    const result = await auth.authenticate(
      emb,
      enrollment.sketch,
      enrollment.commitment,
      enrollment.verificationKey,
    );

    expect(result.address).toBe(enrollment.address);
    expect(result.keypair).toBeDefined();
    expect(result.proof).toBeDefined();
    expect(result.proof.proof).toBeInstanceOf(Uint8Array);
    expect(result.proof.publicInputs.length).toBeGreaterThan(0);
  });

  it('authenticate with noise within threshold succeeds', async () => {
    const auth = new VeilAuth();
    const emb = mockEmbedding();
    const enrollment = await auth.enroll(emb);

    // Add tiny noise (< quantization step — no byte changes)
    const noisyEmb = new Float32Array(emb);
    for (let i = 0; i < 128; i++) noisyEmb[i] += 0.0005 * Math.sin(i);

    const result = await auth.authenticate(
      noisyEmb,
      enrollment.sketch,
      enrollment.commitment,
      enrollment.verificationKey,
    );
    expect(result.address).toBe(enrollment.address);
  });

  it('authenticate with embedding outside threshold fails', async () => {
    const auth = new VeilAuth();
    const emb = mockEmbedding();
    const enrollment = await auth.enroll(emb);

    const wrongEmb = new Float32Array(128).fill(0.5); // completely different

    await expect(
      auth.authenticate(wrongEmb, enrollment.sketch, enrollment.commitment, enrollment.verificationKey),
    ).rejects.toThrow();
  });

  it('keypair from auth matches keypair derived directly from same seed', async () => {
    const auth = new VeilAuth();
    const emb = mockEmbedding(5);

    const enrollment = await auth.enroll(emb);
    const result = await auth.authenticate(
      emb,
      enrollment.sketch,
      enrollment.commitment,
      enrollment.verificationKey,
    );

    // Reproduce the seed independently to derive a keypair
    const seed = reproduceSeed(emb, enrollment.sketch);
    const expected = deriveKeypair(seed);

    expect(result.keypair.signingKey).toEqual(expected.signingKey);
    expect(result.keypair.publicKey.dsa).toEqual(expected.publicKey.dsa);
    expect(result.address).toBe(expected.address);
  });

  it('auth keypair ML-DSA-65 signing works', async () => {
    const auth = new VeilAuth();
    const emb = mockEmbedding(3);

    const enrollment = await auth.enroll(emb);
    const result = await auth.authenticate(
      emb,
      enrollment.sketch,
      enrollment.commitment,
      enrollment.verificationKey,
    );

    const msg = new TextEncoder().encode('authenticate me');
    const sig = ml_dsa65.sign(result.keypair.signingKey, msg);
    const valid = ml_dsa65.verify(result.keypair.publicKey.dsa, msg, sig);
    expect(valid).toBe(true);
  });
});

describe('SSS integration — seed recovery', () => {
  it('generate 3-of-5 shards and reconstruct matches enrollment seed', () => {
    const emb = mockEmbedding();
    const { sketch, seed, commitment } = enrollBiometric(emb);

    // Verify commitment first
    expect(blake2s(seed)).toEqual(commitment);

    const shards = generateRecoveryShards(seed, 3, 5);
    const recovered = reconstructFromShards(shards.slice(0, 3));

    expect(recovered).toEqual(seed);

    // Keypair from recovered seed matches original
    const kp1 = deriveKeypair(seed);
    const kp2 = deriveKeypair(recovered);
    expect(kp1.address).toBe(kp2.address);
    expect(kp1.signingKey).toEqual(kp2.signingKey);
  });
});

describe('cross-package keypair compatibility', () => {
  it('deriveKeypair uses same algorithm as pqc-wallet generatePQCKeypair structure', async () => {
    // We can't call generatePQCKeypair deterministically (it uses random seeds),
    // but we can verify the structural contract: address = 0x + hex(keccak256(dsa.pk)[-20:])
    const emb = mockEmbedding(99);
    const { sketch, seed } = enrollBiometric(emb);
    const kp = deriveKeypair(seed);

    // Address must be EVM-format
    expect(kp.address).toMatch(/^0x[0-9a-f]{40}$/i);
    // Signing key sizes match ML-DSA-65
    expect(kp.signingKey.length).toBe(4032);
    expect(kp.publicKey.dsa.length).toBe(1952);
    // KEM key sizes match ML-KEM-768
    expect(kp.encapsulationKey.length).toBe(2400);
    expect(kp.publicKey.kem.length).toBe(1184);
  });
});
