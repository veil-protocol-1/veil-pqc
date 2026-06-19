import { describe, it, expect, vi, afterEach } from 'vitest';
import { generatePQCKeypair } from '@veil_/pqc-wallet';
import { createX402PQCHeader } from '@veil_/x402-pqc';
import { signPayment, verifyPayment, ghostQuery, encryptPayload } from '../src/core/handlers.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('signPayment', () => {
  it('returns a paymentHeader, signature, publicKey, and txHash', async () => {
    const result = await signPayment({
      amount: '12.50',
      currency: 'USDC',
      recipient: '0xabc0000000000000000000000000000000000a',
      network: 'base-sepolia',
    });

    expect(typeof result.paymentHeader).toBe('string');
    expect(typeof result.signature).toBe('string');
    expect(typeof result.publicKey).toBe('string');
    expect(result.txHash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('produces a header that verifies as valid for the same amount/recipient', async () => {
    const recipient = '0xabc0000000000000000000000000000000000a';
    const result = await signPayment({
      amount: '5.00',
      currency: 'ETH',
      recipient,
      network: 'base',
    });

    const verification = verifyPayment({
      paymentHeader: result.paymentHeader,
      expectedAmount: '5.00',
      expectedRecipient: recipient,
    });

    expect(verification.valid).toBe(true);
    expect(verification.details.payer).toBeDefined();
  });
});

describe('verifyPayment', () => {
  it('rejects a malformed header', () => {
    const result = verifyPayment({
      paymentHeader: 'not-a-real-header',
      expectedAmount: '1.00',
      expectedRecipient: '0xabc',
    });
    expect(result.valid).toBe(false);
    expect(result.details.error).toBeDefined();
  });

  it('rejects a valid signature when the amount does not match', async () => {
    const keypair = generatePQCKeypair();
    const header = createX402PQCHeader(
      { amount: '10.00', recipient: '0xabc', network: 'base' },
      keypair,
    );

    const result = verifyPayment({
      paymentHeader: header,
      expectedAmount: '99.00',
      expectedRecipient: '0xabc',
    });

    expect(result.valid).toBe(false);
    expect(result.details.error).toMatch(/mismatch/);
  });

  it('rejects a valid signature when the recipient does not match', async () => {
    const keypair = generatePQCKeypair();
    const header = createX402PQCHeader(
      { amount: '10.00', recipient: '0xabc', network: 'base' },
      keypair,
    );

    const result = verifyPayment({
      paymentHeader: header,
      expectedAmount: '10.00',
      expectedRecipient: '0xdef',
    });

    expect(result.valid).toBe(false);
  });
});

describe('encryptPayload', () => {
  it('encrypts a payload and returns hex kemCiphertext + base64 encryptedPayload', () => {
    const keypair = generatePQCKeypair();
    const recipientPublicKey = Array.from(keypair.publicKey.kem, b =>
      b.toString(16).padStart(2, '0'),
    ).join('');

    const result = encryptPayload({ payload: 'transfer 100 USDC', recipientPublicKey });

    expect(typeof result.encryptedPayload).toBe('string');
    expect(result.kemCiphertext).toMatch(/^[0-9a-f]+$/);
    expect(() => Buffer.from(result.encryptedPayload, 'base64')).not.toThrow();
  });

  it('throws on an odd-length hex public key', () => {
    expect(() => encryptPayload({ payload: 'x', recipientPublicKey: 'abc' })).toThrow();
  });
});

describe('ghostQuery', () => {
  it('falls back to the local mock when the Ghost API is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network unreachable'))),
    );

    const result = await ghostQuery({ instruction: 'swap 100 USDC for ETH on uniswap' });

    expect(result.intent.action).toBe('swap');
    expect(result.ghostResponse).toMatch(/^Sovereign,/);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('returns a low-confidence unknown intent for unparseable instructions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network unreachable'))),
    );

    const result = await ghostQuery({ instruction: 'what is the weather today' });

    expect(result.intent.action).toBe('unknown');
    expect(result.executionPlan.steps).toHaveLength(0);
  });

  it('uses the live Ghost API response when the request succeeds', async () => {
    const mockResponse = {
      intent: { action: 'stake', urgency: 'low' },
      confidence: 0.9,
      ghostResponse: 'Sovereign, staking planned.',
      executionPlan: { steps: [], estimatedCost: '0' },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        }),
      ),
    );

    const result = await ghostQuery({ instruction: 'stake 10 ETH' });
    expect(result).toEqual(mockResponse);
  });

  it('falls back to the mock when the Ghost API returns a non-OK status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })),
    );

    const result = await ghostQuery({ instruction: 'lend 50 USDC on aave' });
    expect(result.intent.action).toBe('lend');
  });
});
