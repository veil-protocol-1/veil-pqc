import { describe, it, expect, beforeAll } from 'vitest';
import { generateAuthProof, verifyAuthProof, getVerificationKey } from '../src/zk.js';
import { enrollBiometric } from '../src/fuzzy.js';
import type { AuthProof } from '../src/types.js';

// Real enrollment data — used across all ZK tests to avoid redundant proof generation.
function mockEmbedding(): Float32Array {
  const emb = new Float32Array(128);
  for (let i = 0; i < 128; i++) emb[i] = Math.cos(i * 0.3) * 0.8;
  return emb;
}

const TEST_EMB = mockEmbedding();
const { sketch: TEST_SKETCH, commitment: TEST_COMMITMENT } = enrollBiometric(TEST_EMB);

// Generate one real proof in beforeAll and reuse it for interface-level tests.
let cachedProof: AuthProof;
let cachedVk: Uint8Array;

beforeAll(async () => {
  cachedVk = getVerificationKey();
  cachedProof = await generateAuthProof(TEST_EMB, TEST_SKETCH, TEST_COMMITMENT);
}, 120_000);

describe('ZK proof', () => {
  it('generateAuthProof returns proof and publicInputs', () => {
    expect(cachedProof.proof).toBeInstanceOf(Uint8Array);
    expect(cachedProof.proof.length).toBeGreaterThan(0);
    expect(Array.isArray(cachedProof.publicInputs)).toBe(true);
    expect(cachedProof.publicInputs.length).toBeGreaterThanOrEqual(2);
    // Public inputs encode sketch and commitment as hex field elements
    expect(cachedProof.publicInputs[0]).toMatch(/^0x/);
    expect(cachedProof.publicInputs[1]).toMatch(/^0x/);
  });

  it('valid proof passes verification', async () => {
    const valid = await verifyAuthProof(cachedProof.proof, cachedProof.publicInputs, cachedVk);
    expect(valid).toBe(true);
  });

  it('tampered proof fails verification', async () => {
    const tampered = new Uint8Array(cachedProof.proof);
    tampered[0] ^= 0xff;
    tampered[1] ^= 0xff;
    tampered[4] ^= 0xab;

    const stillValid = await verifyAuthProof(tampered, cachedProof.publicInputs, cachedVk);
    expect(stillValid).toBe(false);
  });

  it('all-zero proof fails verification', async () => {
    const zeroProof = new Uint8Array(cachedProof.proof.length);
    const valid = await verifyAuthProof(zeroProof, cachedProof.publicInputs, cachedVk);
    expect(valid).toBe(false);
  });

  it('empty publicInputs fails verification', async () => {
    const valid = await verifyAuthProof(cachedProof.proof, [], cachedVk);
    expect(valid).toBe(false);
  });

  it('getVerificationKey returns a stable 32-byte key', () => {
    const vk1 = getVerificationKey();
    const vk2 = getVerificationKey();
    expect(vk1.length).toBe(32);
    expect(vk1).toEqual(vk2);
  });

  it('different embeddings produce different proofs (proof is binding)', async () => {
    const emb2 = new Float32Array(128).fill(0.5);
    const { sketch: sk2, commitment: cm2 } = enrollBiometric(emb2);

    const { proof: p2 } = await generateAuthProof(emb2, sk2, cm2);

    expect(cachedProof.proof).not.toEqual(p2);
  }, 120_000);

  // ─── 3 new ZK-specific tests ────────────────────────────────────────────────

  it('real proof generates and verifies end-to-end', async () => {
    const emb = mockEmbedding();
    const { sketch, commitment } = enrollBiometric(emb);

    const proof = await generateAuthProof(emb, sketch, commitment);
    const vk = getVerificationKey();
    const valid = await verifyAuthProof(proof.proof, proof.publicInputs, vk);

    expect(valid).toBe(true);
  }, 120_000);

  it('proof from a different embedding fails verification against original public inputs', async () => {
    // Generate a second enrollment with a completely different embedding
    const emb2 = new Float32Array(128);
    for (let i = 0; i < 128; i++) emb2[i] = Math.sin(i * 0.7) * 0.6;
    const { sketch: sk2, commitment: cm2 } = enrollBiometric(emb2);

    const proof2 = await generateAuthProof(emb2, sk2, cm2);
    const vk = getVerificationKey();

    // Proof2's publicInputs are for (sketch2, commitment2).
    // Verifying with the original test inputs should fail because
    // the public inputs don't match what's encoded in the proof.
    const fakeValid = await verifyAuthProof(
      proof2.proof,
      cachedProof.publicInputs, // original test public inputs, not proof2's
      vk,
    );
    expect(fakeValid).toBe(false);
  }, 120_000);

  it('proof size is reasonable (UltraHonk proofs are ~14KB for this circuit)', () => {
    // UltraHonk proofs for a circuit with 287 public inputs are typically 12–20KB.
    expect(cachedProof.proof.byteLength).toBeGreaterThan(0);
    expect(cachedProof.proof.byteLength).toBeLessThan(32 * 1024);
  });
});
