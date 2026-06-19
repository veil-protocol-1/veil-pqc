import { describe, it, expect, vi, afterEach } from 'vitest';
import { generatePQCKeypair } from '@veil_/pqc-wallet';
import { veilFunctions, veilFunctionHandlers } from '../src/openai/functions.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('OpenAI function definitions', () => {
  it('defines four functions with valid JSON schema shapes', () => {
    expect(veilFunctions).toHaveLength(4);
    for (const fn of veilFunctions) {
      expect(typeof fn.name).toBe('string');
      expect(typeof fn.description).toBe('string');
      expect(fn.parameters.type).toBe('object');
      expect(typeof fn.parameters.properties).toBe('object');
      expect(Array.isArray(fn.parameters.required)).toBe(true);
    }
  });

  it('names match the handler map keys', () => {
    const names = veilFunctions.map(f => f.name).sort();
    const handlerNames = Object.keys(veilFunctionHandlers).sort();
    expect(names).toEqual(handlerNames);
  });

  it('mentions quantum-resistant in the payment tool descriptions', () => {
    const signFn = veilFunctions.find(f => f.name === 'veil_sign_payment');
    expect(signFn?.description).toMatch(/quantum-resistant/i);
  });
});

describe('veilFunctionHandlers', () => {
  it('veil_sign_payment returns the correct shape', async () => {
    const result = await veilFunctionHandlers.veil_sign_payment({
      amount: '1.00',
      currency: 'VEIL',
      recipient: '0xabc',
      network: 'base',
    });
    expect(result).toHaveProperty('signature');
    expect(result).toHaveProperty('publicKey');
    expect(result).toHaveProperty('paymentHeader');
    expect(result).toHaveProperty('txHash');
  });

  it('veil_verify_payment returns the correct shape', async () => {
    const result = await veilFunctionHandlers.veil_verify_payment({
      paymentHeader: 'garbage',
      expectedAmount: '1.00',
      expectedRecipient: '0xabc',
    });
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('details');
  });

  it('veil_ghost_query returns the correct shape', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    const result = await veilFunctionHandlers.veil_ghost_query({ instruction: 'swap 1 ETH for USDC' });
    expect(result).toHaveProperty('intent');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('ghostResponse');
    expect(result).toHaveProperty('executionPlan');
  });

  it('veil_encrypt_payload returns the correct shape', async () => {
    const keypair = generatePQCKeypair();
    const recipientPublicKey = Array.from(keypair.publicKey.kem, b =>
      b.toString(16).padStart(2, '0'),
    ).join('');
    const result = await veilFunctionHandlers.veil_encrypt_payload({
      payload: 'secret',
      recipientPublicKey,
    });
    expect(result).toHaveProperty('encryptedPayload');
    expect(result).toHaveProperty('kemCiphertext');
  });
});