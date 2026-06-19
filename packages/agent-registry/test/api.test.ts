import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { generatePQCKeypair } from '@veil_/pqc-wallet';
import { createX402PQCHeader } from '@veil_/x402-pqc';
import { createApp } from '../src/api/app.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('REST API', () => {
  it('GET /health returns 200', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /tools lists all available tools with schemas', async () => {
    const app = createApp();
    const res = await request(app).get('/tools');
    expect(res.status).toBe(200);
    expect(res.body.tools).toHaveLength(4);
    expect(res.body.tools.map((t: { name: string }) => t.name)).toContain('veil_sign_payment');
  });

  it('POST /tools/sign-payment returns a signed payment header', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/tools/sign-payment')
      .send({ amount: '3.00', currency: 'USDC', recipient: '0xabc', network: 'base' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result.paymentHeader).toBeDefined();
  });

  it('POST /tools/sign-payment rejects invalid input with 400', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/tools/sign-payment')
      .send({ amount: '3.00', currency: 'DOGE', recipient: '0xabc', network: 'base' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /tools/verify-payment verifies a header signed via the SDK directly', async () => {
    const app = createApp();
    const keypair = generatePQCKeypair();
    const header = createX402PQCHeader({ amount: '7.00', recipient: '0xdef', network: 'base' }, keypair);

    const res = await request(app)
      .post('/tools/verify-payment')
      .send({ paymentHeader: header, expectedAmount: '7.00', expectedRecipient: '0xdef' });

    expect(res.status).toBe(200);
    expect(res.body.result.valid).toBe(true);
  });

  it('POST /tools/ghost-query returns a parsed intent', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    const app = createApp();
    const res = await request(app)
      .post('/tools/ghost-query')
      .send({ instruction: 'stake 5 ETH on lido' });
    expect(res.status).toBe(200);
    expect(res.body.result.intent.action).toBe('stake');
  });

  it('POST /tools/encrypt-payload returns an encrypted payload', async () => {
    const app = createApp();
    const keypair = generatePQCKeypair();
    const recipientPublicKey = Array.from(keypair.publicKey.kem, b =>
      b.toString(16).padStart(2, '0'),
    ).join('');

    const res = await request(app)
      .post('/tools/encrypt-payload')
      .send({ payload: 'hello agent', recipientPublicKey });

    expect(res.status).toBe(200);
    expect(res.body.result.kemCiphertext).toBeDefined();
  });

  it('POST /tools/encrypt-payload rejects missing fields with 400', async () => {
    const app = createApp();
    const res = await request(app).post('/tools/encrypt-payload').send({ payload: 'hello' });
    expect(res.status).toBe(400);
  });
});
