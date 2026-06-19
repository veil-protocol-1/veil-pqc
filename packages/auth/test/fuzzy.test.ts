import { describe, it, expect } from 'vitest';
import { enrollBiometric, reproduceSeed, quantize } from '../src/fuzzy.js';
import { blake2s } from '@noble/hashes/blake2s';

function mockEmbedding(seed = 42): Float32Array {
  const emb = new Float32Array(128);
  // Deterministic but varied values in [-1, 1]
  for (let i = 0; i < 128; i++) {
    emb[i] = Math.sin(seed * i * 0.1) * 0.9;
  }
  return emb;
}

describe('fuzzy extractor', () => {
  it('enrollBiometric returns valid sketch, seed, commitment', () => {
    const emb = mockEmbedding();
    const { sketch, seed, commitment } = enrollBiometric(emb);

    expect(sketch).toBeInstanceOf(Uint8Array);
    expect(sketch.length).toBe(255);

    expect(seed).toBeInstanceOf(Uint8Array);
    expect(seed.length).toBe(32);
    // Seed must not be all zeros (would indicate a broken RNG)
    expect(seed.some(b => b !== 0)).toBe(true);

    expect(commitment).toBeInstanceOf(Uint8Array);
    expect(commitment.length).toBe(32);

    // Commitment must equal BLAKE2s(seed)
    const expectedCommitment = blake2s(seed);
    expect(commitment).toEqual(expectedCommitment);
  });

  it('reproduceSeed returns the same seed from the same embedding', () => {
    const emb = mockEmbedding();
    const { sketch, seed } = enrollBiometric(emb);

    const reproduced = reproduceSeed(emb, sketch);
    expect(reproduced).toEqual(seed);
  });

  it('reproduceSeed succeeds when embedding has noise within threshold', () => {
    const emb = mockEmbedding();
    const { sketch, seed } = enrollBiometric(emb);

    // Add small sub-quantization noise (does not change any quantized byte)
    const noisyEmb = new Float32Array(emb);
    for (let i = 0; i < 128; i++) {
      noisyEmb[i] += 0.001 * Math.sin(i);
    }

    const reproduced = reproduceSeed(noisyEmb, sketch);
    expect(reproduced).toEqual(seed);
  });

  it('reproduceSeed succeeds when exactly 30 bytes differ (< 42 threshold)', () => {
    const emb = mockEmbedding(7);
    const { sketch, seed } = enrollBiometric(emb);

    // Change 30 dimensions enough to flip quantized bytes
    const altEmb = new Float32Array(emb);
    for (let i = 0; i < 30; i++) {
      altEmb[i] = altEmb[i] > 0 ? -0.9 : 0.9; // flip sign
    }

    const reproduced = reproduceSeed(altEmb, sketch);
    expect(reproduced).toEqual(seed);
  });

  it('reproduceSeed throws when embedding is outside threshold', () => {
    const emb = mockEmbedding();
    const { sketch } = enrollBiometric(emb);

    // Completely different embedding (all zeros)
    const differentEmb = new Float32Array(128).fill(0.0);

    expect(() => reproduceSeed(differentEmb, sketch)).toThrow();
  });

  it('throws on wrong embedding dimension', () => {
    const emb = new Float32Array(64);
    expect(() => enrollBiometric(emb)).toThrow(RangeError);
  });

  it('two different enrollments produce different sketches and seeds', () => {
    const emb = mockEmbedding();
    const result1 = enrollBiometric(emb);
    const result2 = enrollBiometric(emb);

    // Seeds must differ (random generation)
    expect(result1.seed).not.toEqual(result2.seed);
    // Sketches must differ (seed-dependent)
    expect(result1.sketch).not.toEqual(result2.sketch);
    // But each sketch can reproduce its own seed
    expect(reproduceSeed(emb, result1.sketch)).toEqual(result1.seed);
    expect(reproduceSeed(emb, result2.sketch)).toEqual(result2.seed);
  });
});
