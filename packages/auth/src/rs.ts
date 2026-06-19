/**
 * Reed-Solomon encoder/decoder over GF(2^8).
 * RS(n=255, k=255-2t) corrects up to t symbol (byte) errors.
 *
 * Faithfully ported from the reedsolo reference by Tomer Filiba
 * (https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders).
 *
 * Convention: arrays are MSB-first (index 0 = highest-degree coefficient).
 * Generator: fcr=0, generator α=2  →  roots at α^0, α^1, ..., α^{2t-1}.
 */

import { GF_EXP, GF_LOG, gfMul } from './gf.js';

const GEN = 2;

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------
function gfPow(x: number, power: number): number {
  return GF_EXP[(GF_LOG[x] * power) % 255];
}
function gfInverse(x: number): number {
  return GF_EXP[255 - GF_LOG[x]];
}
function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error('GF division by zero');
  if (a === 0) return 0;
  return GF_EXP[((GF_LOG[a] - GF_LOG[b]) % 255 + 255) % 255];
}

// ---------------------------------------------------------------------------
// Polynomial helpers (MSB-first arrays)
// ---------------------------------------------------------------------------
function polyScale(p: number[], x: number): number[] {
  return p.map(c => gfMul(c, x));
}

function polyAdd(p: number[], q: number[]): number[] {
  const r = new Array(Math.max(p.length, q.length)).fill(0);
  for (let i = 0; i < p.length; i++) r[i + r.length - p.length] ^= p[i];
  for (let i = 0; i < q.length; i++) r[i + r.length - q.length] ^= q[i];
  return r;
}

function polyMul(p: number[], q: number[]): number[] {
  const r = new Array(p.length + q.length - 1).fill(0);
  for (let j = 0; j < q.length; j++) {
    for (let i = 0; i < p.length; i++) {
      r[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return r;
}

function polyEval(p: number[], x: number): number {
  let y = p[0];
  for (let i = 1; i < p.length; i++) y = gfMul(y, x) ^ p[i];
  return y;
}

function polyDiv(dividend: number[], divisor: number[]): [number[], number[]] {
  let msg = [...dividend];
  const divLen = divisor.length;
  const limit = dividend.length - (divLen - 1);
  for (let i = 0; i < limit; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 1; j < divLen; j++) {
        if (divisor[j] !== 0) msg[i + j] ^= gfMul(divisor[j], coef);
      }
    }
  }
  const sep = divLen - 1;
  return [msg.slice(0, msg.length - sep), msg.slice(msg.length - sep)];
}

// ---------------------------------------------------------------------------
// Generator polynomial: g = ∏(x + α^i) for i = 0..nsym-1   (fcr=0)
// ---------------------------------------------------------------------------
function buildGenerator(nsym: number): number[] {
  let g: number[] = [1];
  for (let i = 0; i < nsym; i++) {
    g = polyMul(g, [1, gfPow(GEN, i)]);
  }
  return g;
}

// ---------------------------------------------------------------------------
// Encode (systematic)
// ---------------------------------------------------------------------------
export function rsEncode(message: Uint8Array, t: number): Uint8Array {
  const nsym = 2 * t;
  const k = 255 - nsym;
  if (message.length > k) throw new RangeError(`Message ${message.length} > k=${k}`);

  const gen = buildGenerator(nsym);
  // Zero-pad message to k bytes
  const msg = new Array(k).fill(0);
  const offset = k - message.length;
  for (let i = 0; i < message.length; i++) msg[offset + i] = message[i];

  // Append nsym zeros for division
  const msgExt = [...msg, ...new Array(nsym).fill(0)];
  const lgen = gen.length;
  for (let i = 0; i < k; i++) {
    const coef = msgExt[i];
    if (coef !== 0) {
      for (let j = 1; j < lgen; j++) {
        msgExt[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  // Restore systematic message, append parity
  const codeword = new Uint8Array(255);
  for (let i = 0; i < k; i++) codeword[i] = msg[i];
  for (let i = 0; i < nsym; i++) codeword[k + i] = msgExt[k + i];
  return codeword;
}

// ---------------------------------------------------------------------------
// Syndromes:  S = [0, c(α^0), c(α^1), ..., c(α^{nsym-1})]   (fcr=0)
// ---------------------------------------------------------------------------
function calcSyndromes(msg: number[], nsym: number): number[] {
  const synd = [0];
  for (let i = 0; i < nsym; i++) synd.push(polyEval(msg, gfPow(GEN, i)));
  return synd;
}

// ---------------------------------------------------------------------------
// Berlekamp-Massey error-locator polynomial
// ---------------------------------------------------------------------------
function findErrorLocator(synd: number[], nsym: number): number[] {
  let errLoc: number[] = [1];
  let oldLoc: number[] = [1];

  for (let i = 0; i < nsym; i++) {
    oldLoc = [...oldLoc, 0];
    // Discrepancy
    let delta = synd[i + 1];
    for (let j = 1; j < errLoc.length; j++) {
      delta ^= gfMul(errLoc[errLoc.length - 1 - j], synd[i + 1 - j]);
    }
    if (delta === 0) continue;
    if (oldLoc.length > errLoc.length) {
      const newLoc = polyScale(oldLoc, delta);
      oldLoc = polyScale(errLoc, gfInverse(delta));
      errLoc = newLoc;
    }
    errLoc = polyAdd(errLoc, polyScale(oldLoc, delta));
  }

  const errs = errLoc.length - 1;
  if (errs * 2 > nsym) throw new Error(`Too many errors: ${errs} > ${nsym / 2}`);
  return errLoc;
}

// ---------------------------------------------------------------------------
// Chien search — note: pass err_loc REVERSED per reedsolo rs_correct_msg
// ---------------------------------------------------------------------------
function findErrors(errLocRev: number[], nmess: number): number[] {
  const errs = errLocRev.length - 1;
  const errPos: number[] = [];
  for (let i = 0; i < nmess; i++) {
    if (polyEval(errLocRev, gfPow(GEN, i)) === 0) {
      errPos.push(nmess - 1 - i);
    }
  }
  if (errPos.length !== errs) {
    throw new Error(`Chien: found ${errPos.length} roots, expected ${errs}`);
  }
  return errPos;
}

// ---------------------------------------------------------------------------
// Errata locator from array positions
// ---------------------------------------------------------------------------
function findErrataLocator(coefPos: number[]): number[] {
  let loc: number[] = [1];
  for (const cp of coefPos) {
    loc = polyMul(loc, polyAdd([1], [gfPow(GEN, cp), 0]));
  }
  return loc;
}

// ---------------------------------------------------------------------------
// Error evaluator polynomial: Ω = (synd * errataLoc) mod x^{nsym+1}
// synd passed in is synd[::-1] from the caller
// ---------------------------------------------------------------------------
function findErrorEvaluator(syndRev: number[], errataLoc: number[], nsym: number): number[] {
  const [, remainder] = polyDiv(polyMul(syndRev, errataLoc), [
    1,
    ...new Array(nsym + 1).fill(0),
  ]);
  return remainder;
}

// ---------------------------------------------------------------------------
// Correct errata at err_pos (array indices into msg)
// ---------------------------------------------------------------------------
function correctErrata(msgIn: number[], synd: number[], errPos: number[]): number[] {
  const coefPos = errPos.map(p => msgIn.length - 1 - p);
  const errataLoc = findErrataLocator(coefPos);

  // synd[::-1] per reedsolo convention, then [::-1] on result = back to forward
  const syndRev = [...synd].reverse();
  const errEvalRev = findErrorEvaluator(syndRev, errataLoc, errataLoc.length - 1);
  const errEval = [...errEvalRev].reverse();

  const X = coefPos.map(cp => gfPow(GEN, cp));
  const Xlength = X.length;
  const E = new Array(msgIn.length).fill(0);

  for (let i = 0; i < Xlength; i++) {
    const Xi = X[i];
    const XiInv = gfInverse(Xi);

    // Formal derivative of errataLoc at XiInv: ∏_{j≠i}(1 - XiInv * X[j])
    let errLocPrime = 1;
    for (let j = 0; j < Xlength; j++) {
      if (j !== i) errLocPrime = gfMul(errLocPrime, 1 ^ gfMul(XiInv, X[j]));
    }
    if (errLocPrime === 0) throw new Error('Forney: zero denominator');

    // Magnitude = Xi * Ω(XiInv) / Λ'(XiInv)   (fcr=0 → Xi^{1-0} = Xi)
    const y = gfMul(Xi, polyEval([...errEval].reverse(), XiInv));
    E[errPos[i]] = gfDiv(y, errLocPrime);
  }

  return polyAdd(msgIn, E);
}

// ---------------------------------------------------------------------------
// Public decode
// ---------------------------------------------------------------------------
export function rsDecode(received: Uint8Array, t: number): Uint8Array {
  if (received.length !== 255) {
    throw new RangeError(`Expected 255 bytes, got ${received.length}`);
  }
  const nsym = 2 * t;
  const recv = Array.from(received);

  const synd = calcSyndromes(recv, nsym);
  if (synd.slice(1).every(s => s === 0)) return new Uint8Array(recv);

  const errLoc = findErrorLocator(synd, nsym);
  const errPos = findErrors([...errLoc].reverse(), recv.length);
  const corrected = correctErrata(recv, synd, errPos);

  const checkSynd = calcSyndromes(corrected, nsym);
  if (!checkSynd.slice(1).every(s => s === 0)) {
    throw new Error('RS decode: correction verification failed');
  }

  return new Uint8Array(corrected);
}

export function rsExtractMessage(codeword: Uint8Array, t: number): Uint8Array {
  return codeword.slice(0, 255 - 2 * t);
}
