import { describe, it, expect, vi, afterEach } from 'vitest';
import { generatePQCKeypair } from '@veil_/pqc-wallet';
import {
  VeilSignPaymentTool,
  VeilVerifyPaymentTool,
  VeilGhostQueryTool,
  VeilEncryptPayloadTool,
  veilTools,
} from '../src/langchain/tools.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('LangChain tool wrappers', () => {
  it('exposes four tools with the correct names', () => {
    expect(veilTools.map(t => t.name)).toEqual([
      'veil_sign_payment',
      'veil_verify_payment',
      'veil_ghost_query',
      'veil_encrypt_payload',
    ]);
  });

  it('each tool has a non-empty description and a zod schema', () => {
    for (const tool of veilTools) {
      expect(tool.description.length).toBeGreaterThan(0);
      expect(tool.schema).toBeDefined();
    }
  });

  it('VeilSignPaymentTool._call returns a JSON-stringified payment header', async () => {
    const tool = new VeilSignPaymentTool();
    const raw = await tool.invoke({
      amount: '1.00',
      currency: 'USDC',
      recipient: '0xabc',
      network: 'base-sepolia',
    });
    const parsed = JSON.parse(raw);
    expect(parsed.paymentHeader).toBeDefined();
  });

  it('VeilVerifyPaymentTool._call reports invalid for a bad header', async () => {
    const tool = new VeilVerifyPaymentTool();
    const raw = await tool.invoke({
      paymentHeader: 'garbage',
      expectedAmount: '1.00',
      expectedRecipient: '0xabc',
    });
    const parsed = JSON.parse(raw);
    expect(parsed.valid).toBe(false);
  });

  it('VeilGhostQueryTool._call returns a Sovereign-addressed response', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    const tool = new VeilGhostQueryTool();
    const raw = await tool.invoke({ instruction: 'borrow 200 USDC' });
    const parsed = JSON.parse(raw);
    expect(parsed.ghostResponse).toMatch(/^Sovereign,/);
  });

  it('VeilEncryptPayloadTool._call returns kemCiphertext as hex', async () => {
    const keypair = generatePQCKeypair();
    const recipientPublicKey = Array.from(keypair.publicKey.kem, b =>
      b.toString(16).padStart(2, '0'),
    ).join('');
    const tool = new VeilEncryptPayloadTool();
    const raw = await tool.invoke({ payload: 'hello', recipientPublicKey });
    const parsed = JSON.parse(raw);
    expect(parsed.kemCiphertext).toMatch(/^[0-9a-f]+$/);
  });
});