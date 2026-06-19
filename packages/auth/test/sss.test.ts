import { describe, it, expect } from 'vitest';
import { generateRecoveryShards, reconstructFromShards } from '../src/sss.js';

const TEST_SEED = new Uint8Array(32);
for (let i = 0; i < 32; i++) TEST_SEED[i] = i * 7 + 13;

describe('Shamir Secret Sharing', () => {
  it('3-of-5: generates 5 shards with correct structure', () => {
    const shards = generateRecoveryShards(TEST_SEED, 3, 5);

    expect(shards.length).toBe(5);
    for (let i = 0; i < 5; i++) {
      expect(shards[i].index).toBe(i + 1);
      expect(shards[i].data).toBeInstanceOf(Uint8Array);
      expect(shards[i].data.length).toBe(32);
    }
  });

  it('3-of-5: reconstruct from shards 1,2,3 matches original seed', () => {
    const shards = generateRecoveryShards(TEST_SEED, 3, 5);
    const reconstructed = reconstructFromShards(shards.slice(0, 3));
    expect(reconstructed).toEqual(TEST_SEED);
  });

  it('3-of-5: reconstruct from shards 2,4,5 matches original seed', () => {
    const shards = generateRecoveryShards(TEST_SEED, 3, 5);
    const subset = [shards[1], shards[3], shards[4]];
    const reconstructed = reconstructFromShards(subset);
    expect(reconstructed).toEqual(TEST_SEED);
  });

  it('3-of-5: reconstruct from any 3 shards always matches', () => {
    const shards = generateRecoveryShards(TEST_SEED, 3, 5);

    // Try all C(5,3)=10 combinations
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        for (let k = j + 1; k < 5; k++) {
          const subset = [shards[i], shards[j], shards[k]];
          const reconstructed = reconstructFromShards(subset);
          expect(reconstructed).toEqual(TEST_SEED);
        }
      }
    }
  });

  it('2-of-3: reconstruct from both shards matches', () => {
    const shards = generateRecoveryShards(TEST_SEED, 2, 3);
    const reconstructed = reconstructFromShards([shards[0], shards[1]]);
    expect(reconstructed).toEqual(TEST_SEED);
  });

  it('different seeds produce different shards', () => {
    const seedA = new Uint8Array(32).fill(0x01);
    const seedB = new Uint8Array(32).fill(0x02);
    const shardsA = generateRecoveryShards(seedA, 2, 3);
    const shardsB = generateRecoveryShards(seedB, 2, 3);
    expect(shardsA[0].data).not.toEqual(shardsB[0].data);
  });

  it('shards themselves look random (not equal to seed)', () => {
    const shards = generateRecoveryShards(TEST_SEED, 3, 5);
    for (const shard of shards) {
      expect(shard.data).not.toEqual(TEST_SEED);
    }
  });

  it('throws on threshold < 2', () => {
    expect(() => generateRecoveryShards(TEST_SEED, 1, 3)).toThrow(RangeError);
  });

  it('throws on total < threshold', () => {
    expect(() => generateRecoveryShards(TEST_SEED, 4, 3)).toThrow(RangeError);
  });
});
