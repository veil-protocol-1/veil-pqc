/**
 * GF(2^8) arithmetic using primitive polynomial x^8+x^4+x^3+x^2+1 (0x11D).
 * All arithmetic is over this field — used by Reed-Solomon and SSS.
 */

const PRIM = 0x11d;
const FIELD_SIZE = 256;

export const GF_EXP = new Uint8Array(512);
export const GF_LOG = new Uint8Array(FIELD_SIZE);

(function buildTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x >= FIELD_SIZE) x ^= PRIM;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
  GF_EXP[255] = 1;
  GF_LOG[0] = 0;
})();

export function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255];
}

export function gfDiv(a: number, b: number): number {
  if (b === 0) throw new RangeError('GF division by zero');
  if (a === 0) return 0;
  return GF_EXP[((GF_LOG[a] - GF_LOG[b]) % 255 + 255) % 255];
}

export function gfPow(x: number, power: number): number {
  if (x === 0) return 0;
  return GF_EXP[(GF_LOG[x] * power) % 255];
}

export function gfInv(x: number): number {
  if (x === 0) throw new RangeError('GF inverse of zero');
  return GF_EXP[255 - GF_LOG[x]];
}

/** Multiply two polynomials over GF(2^8). */
export function polyMul(p: number[], q: number[]): number[] {
  const result = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      result[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return result;
}

/** Evaluate polynomial at x over GF(2^8) (Horner's method). */
export function polyEval(poly: number[], x: number): number {
  let y = poly[0];
  for (let i = 1; i < poly.length; i++) {
    y = gfMul(y, x) ^ poly[i];
  }
  return y;
}

/** Divide polynomial p by polynomial q, return [quotient, remainder]. */
export function polyDiv(dividend: number[], divisor: number[]): [number[], number[]] {
  let msg = [...dividend];
  const msgLen = msg.length;
  const divLen = divisor.length;
  for (let i = 0; i < msgLen - (divLen - 1); i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 1; j < divLen; j++) {
        if (divisor[j] !== 0) {
          msg[i + j] ^= gfMul(divisor[j], coef);
        }
      }
    }
  }
  const sep = -(divLen - 1);
  return [msg.slice(0, sep), msg.slice(sep)];
}
