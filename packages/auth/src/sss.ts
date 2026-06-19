/**
 * Shamir Secret Sharing for optional seed recovery.
 *
 * Each byte of the seed is independently split using a random
 * degree-(threshold-1) polynomial over GF(2^8). Shares indexed 1..n.
 *
 * Polynomial: f(x) = secret + a1*x + a2*x^2 + ... + a_{t-1}*x^{t-1}
 * secret = f(0) = coeffs[0]  (constant term)
 *
 * This is the ONLY path where any part of the seed can leave the device.
 */

import { gfMul, GF_EXP, GF_LOG } from './gf.js';
import type { RecoveryShard } from './types.js';

/**
 * Evaluate polynomial over GF(2^8) at x.
 * coeffs[0] = constant term (the secret), coeffs[k] = coefficient of x^k.
 */
function evalPoly(coeffs: Uint8Array, x: number): number {
  // Horner's method, iterating from highest degree down to constant
  let result = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    result = gfMul(result, x) ^ coeffs[i];
  }
  return result;
}

function gfInv(x: number): number {
  if (x === 0) throw new RangeError('GF inverse of zero');
  return GF_EXP[255 - GF_LOG[x]];
}

/**
 * Split seed into n shards, requiring threshold to reconstruct.
 */
export function generateRecoveryShards(
  seed: Uint8Array,
  threshold: number,
  total: number,
): RecoveryShard[] {
  if (threshold < 2) throw new RangeError('threshold must be ≥ 2');
  if (total < threshold) throw new RangeError('total must be ≥ threshold');
  if (total > 254) throw new RangeError('total must be ≤ 254');

  const shards: RecoveryShard[] = Array.from({ length: total }, (_, i) => ({
    index: i + 1,
    data: new Uint8Array(seed.length),
  }));

  for (let byteIdx = 0; byteIdx < seed.length; byteIdx++) {
    // coeffs[0] = secret, coeffs[1..threshold-1] = random
    const coeffs = new Uint8Array(threshold);
    coeffs[0] = seed[byteIdx];
    crypto.getRandomValues(coeffs.subarray(1));

    for (let s = 0; s < total; s++) {
      shards[s].data[byteIdx] = evalPoly(coeffs, s + 1);
    }
  }

  return shards;
}

/**
 * Reconstruct seed from any threshold shards via Lagrange interpolation at x=0.
 */
export function reconstructFromShards(shards: RecoveryShard[]): Uint8Array {
  if (shards.length < 2) throw new RangeError('Need at least 2 shards');

  const len = shards[0].data.length;
  const seed = new Uint8Array(len);

  for (let byteIdx = 0; byteIdx < len; byteIdx++) {
    let secret = 0;

    for (let i = 0; i < shards.length; i++) {
      const xi = shards[i].index;
      const yi = shards[i].data[byteIdx];

      // Lagrange basis: l_i(0) = ∏_{j≠i} (0 - x_j) / (x_i - x_j)
      // In GF(2^8): (0 - x) = x, (a - b) = a XOR b
      let num = 1;
      let den = 1;
      for (let j = 0; j < shards.length; j++) {
        if (i === j) continue;
        const xj = shards[j].index;
        num = gfMul(num, xj);        // 0 XOR xj = xj
        den = gfMul(den, xi ^ xj);   // xi - xj = xi XOR xj
      }

      const li = gfMul(num, gfInv(den));
      secret ^= gfMul(yi, li);
    }

    seed[byteIdx] = secret;
  }

  return seed;
}
