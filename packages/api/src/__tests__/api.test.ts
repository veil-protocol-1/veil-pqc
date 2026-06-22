import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

// vi.mock is hoisted above static imports by vitest, so the mock is active
// before @veil_/circles is resolved in app.ts — no dynamic import needed.
vi.mock('@veil_/circles', () => {
  const mockResult = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x00, 0x01, 0x02, 0x03]);
  class CircleSession {
    isActive = false;
    async create() { this.isActive = true; }
    async private_predict(_input: Uint8Array): Promise<Uint8Array> { return mockResult; }
    async teardown() { this.isActive = false; }
  }
  return {
    CircleSession,
    CircleSessionError: class extends Error {},
    getRpcMode: () => 'mock' as const,
  };
});

// Default: all headers pass verification. Individual 402 tests override per-call with mockReturnValueOnce.
vi.mock('@veil_/x402-pqc', () => ({
  verifyX402PQCHeader: vi.fn().mockReturnValue({
    valid: true,
    payer: '0xdeadbeef',
    recipient: '0x77761912b6435287f2b4DaAe93c02611351e7750',
    amount: '0.002',
    timestamp: Math.floor(Date.now() / 1000),
  }),
}));

// pqcTransport.unseal is controlled per-test in the /ghost/steps suite.
// vi.hoisted() ensures the variable is available when the hoisted vi.mock() factory runs.
const mockUnseal = vi.hoisted(() => vi.fn());
vi.mock('@veil/ghost', () => ({
  pqcTransport: { unseal: mockUnseal },
}));

import { createApp } from '../app';
import { verifyX402PQCHeader } from '@veil_/x402-pqc';

// Dummy header value — verifyX402PQCHeader is mocked so the content is irrelevant.
// Presence satisfies the existence check in x402PQCGate before verify is called.
const MOCK_PAYMENT_HEADER = btoa(JSON.stringify({
  version: 'x402-pqc-v0.1.0',
  signingAlgorithm: 'ML-DSA-65',
  publicKey: 'aa',
  nonce: 'bb',
  timestamp: Math.floor(Date.now() / 1000),
  amount: '0.002',
  recipient: '0x77761912b6435287f2b4DaAe93c02611351e7750',
  network: 'base-sepolia',
  signature: 'cc',
}));

let app: Application;

beforeAll(() => {
  app = createApp();
});

// ─── GET /health ──────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('has status "ok"', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('ok');
  });

  it('has version field', async () => {
    const res = await request(app).get('/health');
    expect(typeof res.body.version).toBe('string');
    expect(res.body.version.length).toBeGreaterThan(0);
  });

  it('has timestamp as number', async () => {
    const res = await request(app).get('/health');
    expect(typeof res.body.timestamp).toBe('number');
    expect(res.body.timestamp).toBeGreaterThan(0);
  });

  it('has node field', async () => {
    const res = await request(app).get('/health');
    expect(typeof res.body.node).toBe('string');
  });
});

// ─── GET /.well-known/x402-bazaar.json ───────────────────────────────────────

describe('GET /.well-known/x402-bazaar.json', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/.well-known/x402-bazaar.json');
    expect(res.status).toBe(200);
  });

  it('has scheme x402-pqc', async () => {
    const res = await request(app).get('/.well-known/x402-bazaar.json');
    expect(res.body.scheme).toBe('x402-pqc');
  });

  it('explicitly labels network as base-sepolia (testnet)', async () => {
    const res = await request(app).get('/.well-known/x402-bazaar.json');
    expect(res.body.network).toBe('base-sepolia');
  });

  it('has VEILTreasury as recipient', async () => {
    const res = await request(app).get('/.well-known/x402-bazaar.json');
    expect(res.body.recipient).toBe('0x77761912b6435287f2b4DaAe93c02611351e7750');
  });

  it('has x402PQCPayments contract address', async () => {
    const res = await request(app).get('/.well-known/x402-bazaar.json');
    expect(res.body.contract).toBe('0xd56F1D27d3ba06EF46F9712d050Dc88FE933131E');
  });

  it('has tiered pricing structure and USD currency', async () => {
    const res = await request(app).get('/.well-known/x402-bazaar.json');
    expect(res.body.pricing).toHaveProperty('tiers');
    expect(res.body.pricing.tiers).toHaveProperty('simple', '0.002');
    expect(res.body.pricing.tiers).toHaveProperty('standard', '0.01');
    expect(res.body.pricing.tiers).toHaveProperty('complex', '0.05');
    expect(res.body.pricing.currency).toBe('USD');
  });

  it('has service name "Veil Ghost"', async () => {
    const res = await request(app).get('/.well-known/x402-bazaar.json');
    expect(res.body.service).toBe('Veil Ghost');
  });
});

// ─── GET /.well-known/agent.json (A2A Agent Card) ────────────────────────────

describe('GET /.well-known/agent.json', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/.well-known/agent.json');
    expect(res.status).toBe(200);
  });

  it('has name "Veil Ghost"', async () => {
    const res = await request(app).get('/.well-known/agent.json');
    expect(res.body.name).toBe('Veil Ghost');
  });

  it('has semver version string', async () => {
    const res = await request(app).get('/.well-known/agent.json');
    expect(typeof res.body.version).toBe('string');
    expect(res.body.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('has url field (A2A required)', async () => {
    const res = await request(app).get('/.well-known/agent.json');
    expect(typeof res.body.url).toBe('string');
    expect(res.body.url.length).toBeGreaterThan(0);
  });

  it('explicitly labels network as base-sepolia (testnet)', async () => {
    const res = await request(app).get('/.well-known/agent.json');
    expect(res.body.network).toBe('base-sepolia');
  });

  it('references x402-pqc payment scheme', async () => {
    const res = await request(app).get('/.well-known/agent.json');
    expect(res.body.paymentScheme).toBe('x402-pqc');
  });

  it('paymentDetails links to bazaar manifest', async () => {
    const res = await request(app).get('/.well-known/agent.json');
    expect(res.body.paymentDetails).toContain('x402-bazaar.json');
  });

  it('skills array contains ghost-query and ghost-intent', async () => {
    const res = await request(app).get('/.well-known/agent.json');
    const ids = (res.body.skills as Array<{ id: string }>).map((s) => s.id);
    expect(ids).toContain('ghost-query');
    expect(ids).toContain('ghost-intent');
  });

  it('each skill has A2A-required id, name, description fields', async () => {
    const res = await request(app).get('/.well-known/agent.json');
    for (const skill of res.body.skills as Array<Record<string, unknown>>) {
      expect(typeof skill.id).toBe('string');
      expect(typeof skill.name).toBe('string');
      expect(typeof skill.description).toBe('string');
    }
  });
});

// ─── x402-pqc payment gate — 402 behavior ────────────────────────────────────

describe('x402-pqc payment gate', () => {
  it('returns 402 on /ghost/query when payment header is absent', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'deadbeef' });
    expect(res.status).toBe(402);
  });

  it('returns 402 on /ghost/intent when payment header is absent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap ETH to USDC' });
    expect(res.status).toBe(402);
  });

  it('402 body includes scheme, recipient, network, amount', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'deadbeef' });
    expect(res.body.scheme).toBe('x402-pqc');
    expect(res.body.recipient).toBe('0x77761912b6435287f2b4DaAe93c02611351e7750');
    expect(res.body.network).toBe('base-sepolia');
    expect(res.body.amount).toBe('0.002');
  });

  it('returns 402 on /ghost/query when verification fails', async () => {
    vi.mocked(verifyX402PQCHeader).mockReturnValueOnce({ valid: false, error: 'invalid signature' });
    const res = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ encryptedQuery: 'deadbeef' });
    expect(res.status).toBe(402);
    expect(res.body.verificationError).toBe('invalid signature');
  });

  it('does NOT gate GET /health (health is open)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('does NOT gate /shards/store (shards are open)', async () => {
    const res = await request(app)
      .post('/shards/store')
      .send({ shardId: 'gate-test', encryptedShard: 'aabb', userId: 'u1' });
    expect(res.status).toBe(200);
  });
});

// ─── x402-pqc tiered pricing — 402 amount reflects query complexity ───────────

describe('x402-pqc tiered pricing', () => {
  it('swap request on /ghost/intent returns 402 with amount $0.002 (simple tier)', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.002');
  });

  it('send request on /ghost/intent returns 402 with amount $0.002 (simple tier)', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'send 10 ETH to 0xabc123' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.002');
  });

  it('balance check on /ghost/intent returns 402 with amount $0.002 (simple tier)', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'what is my ETH balance' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.002');
  });

  it('yield request on /ghost/intent returns 402 with amount $0.01 (standard tier)', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'earn yield on my USDC' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.01');
  });

  it('staking request on /ghost/intent returns 402 with amount $0.01 (standard tier)', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'stake my ETH' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.01');
  });

  it('Aave loan request on /ghost/intent returns 402 with amount $0.05 (complex — borrow action)', async () => {
    // Parser recognizes "loan" → action=borrow → complex tier.
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'get an Aave loan against my ETH collateral' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.05');
  });

  it('portfolio rebalancing on /ghost/intent returns 402 with amount $0.05 (complex — rebalance action)', async () => {
    // Parser recognizes "rebalance" → action=rebalance → complex tier.
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'rebalance my portfolio to 60% ETH 40% USDC' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.05');
  });

  it('lend request on /ghost/intent returns 402 with amount $0.01 (standard tier)', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'lend my USDC on Aave' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.01');
  });

  it('repay request on /ghost/intent returns 402 with amount $0.01 (standard tier)', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'repay my USDC loan' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.01');
  });

  it('borrow request on /ghost/intent returns 402 with amount $0.05 (complex tier)', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'borrow USDC against my ETH' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.05');
  });

  it('swap on Aave on /ghost/intent returns 402 with amount $0.002 (simple — swap action wins over protocol name)', async () => {
    // Old regex classified as complex because "aave" appeared in the string.
    // Parser correctly identifies action=swap, which is the simple tier.
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap ETH to USDC on Aave' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.002');
  });

  it('/ghost/query without complexity field defaults to simple tier $0.002', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'deadbeef' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.002');
  });

  it('/ghost/query with complexity=standard returns 402 with amount $0.01', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'deadbeef', complexity: 'standard' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.01');
  });

  it('/ghost/query with complexity=complex returns 402 with amount $0.05', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'deadbeef', complexity: 'complex' });
    expect(res.status).toBe(402);
    expect(res.body.amount).toBe('0.05');
  });
});

// ─── POST /ghost/intent — action parsing ─────────────────────────────────────

describe('POST /ghost/intent — intent parsing', () => {
  it('parses swap intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('swap');
  });

  it('parses send intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'send 100 USDC to 0xabc123def456' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('send');
  });

  it('parses transfer as send', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'transfer 10 ETH to my friend' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('send');
  });

  it('parses earn intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'earn yield on my USDC' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('earn');
  });

  it('parses stake intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'stake my ETH' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('stake');
  });

  it('parses borrow intent from "loan" keyword', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'give me an Aave loan against my ETH collateral' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('borrow');
  });

  it('parses borrow intent from "borrow" keyword', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'borrow USDC against my ETH' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('borrow');
  });

  it('parses lend intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'lend my USDC on Aave' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('lend');
  });

  it('parses repay intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'repay my USDC loan' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('repay');
  });

  it('parses rebalance intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'rebalance my portfolio to 60% ETH 40% USDC' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('rebalance');
  });

  it('parses query/balance intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'what is my ETH balance' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('query');
    expect(res.body.intent.queryType).toBe('balance');
  });

  it('parses query/history intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'show my transaction history' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('query');
    expect(res.body.intent.queryType).toBe('history');
  });

  it('parses query/price intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'what is the price of ETH' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('query');
    expect(res.body.intent.queryType).toBe('price');
  });

  it('returns clarify for ambiguous input', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'hello there' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('clarify');
  });

  it('returns clarify for empty-meaning input', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'I need something done' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('clarify');
  });
});

// ─── POST /ghost/intent — field extraction ────────────────────────────────────

describe('POST /ghost/intent — field extraction', () => {
  it('extracts amount from swap message', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.intent.amount).toBe('50');
  });

  it('extracts token (fromToken) from swap message', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.intent.token).toBe('USDC');
  });

  it('extracts toToken from swap message', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.intent.toToken).toBe('ETH');
  });

  it('extracts decimal amount', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'swap 0.5 ETH to USDC' });
    expect(res.body.intent.amount).toBe('0.5');
  });

  it('extracts percentage amount', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'earn 5% APY on USDC' });
    expect(res.body.intent.amount).toBe('5%');
  });

  it('raw field matches original message', async () => {
    const msg = 'swap 50 USDC to ETH';
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: msg });
    expect(res.body.raw).toBe(msg);
  });

  it('confidence is between 0 and 1', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.confidence).toBeGreaterThanOrEqual(0);
    expect(res.body.confidence).toBeLessThanOrEqual(1);
  });

  it('confidence is lower for ambiguous input', async () => {
    const clear = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'swap 50 USDC to ETH' });
    const ambiguous = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'do something' });
    expect(ambiguous.body.confidence).toBeLessThan(clear.body.confidence);
  });
});

// ─── POST /ghost/intent — ghostResponse ──────────────────────────────────────

describe('POST /ghost/intent — ghostResponse', () => {
  it('always addresses user as "Sovereign"', async () => {
    const messages = [
      'swap 50 USDC to ETH',
      'send 10 ETH to Alice',
      'earn yield on USDC',
      'stake my ETH',
      'what is my balance',
      'show transaction history',
      'hello',
    ];
    for (const message of messages) {
      const res = await request(app)
        .post('/ghost/intent')
        .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
        .send({ message });
      expect(res.body.ghostResponse).toContain('Sovereign');
    }
  });

  it('swap response mentions the tokens', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.ghostResponse).toContain('USDC');
    expect(res.body.ghostResponse).toContain('ETH');
  });

  it('clarify response is a string', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ message: 'gibberish xyz' });
    expect(typeof res.body.ghostResponse).toBe('string');
    expect(res.body.ghostResponse.length).toBeGreaterThan(0);
  });
});

// ─── POST /ghost/query ────────────────────────────────────────────────────────

describe('POST /ghost/query', () => {
  it('returns 200 with mock response', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(res.status).toBe(200);
  });

  it('sets X-Ghost-Mode: mock header', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(res.headers['x-ghost-mode']).toBe('mock');
  });

  it('response has encryptedResult', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(typeof res.body.encryptedResult).toBe('string');
    expect(res.body.encryptedResult.length).toBeGreaterThan(0);
  });

  it('response has sessionId', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(typeof res.body.sessionId).toBe('string');
    expect(res.body.sessionId.length).toBeGreaterThan(0);
  });

  it('response has timestamp as number', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(typeof res.body.timestamp).toBe('number');
    expect(res.body.timestamp).toBeGreaterThan(0);
  });

  it('reuses session when sessionId provided', async () => {
    const first = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ encryptedQuery: 'aabb', publicKey: 'ccdd' });
    const sid = first.body.sessionId as string;

    const second = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ encryptedQuery: 'aabb', publicKey: 'ccdd', sessionId: sid });
    expect(second.body.sessionId).toBe(sid);
  });

  it('returns 400 when encryptedQuery is missing', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ publicKey: 'aabbccdd' });
    expect(res.status).toBe(400);
  });

  it('has RateLimit headers on /ghost routes', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .set('x-402-pqc-payment', MOCK_PAYMENT_HEADER)
      .send({ encryptedQuery: 'deadbeef', publicKey: 'aabb' });
    const hasRateLimit =
      res.headers['ratelimit-limit'] !== undefined ||
      res.headers['x-ratelimit-limit'] !== undefined;
    expect(hasRateLimit).toBe(true);
  });
});

// ─── POST /shards/store + GET /shards/:shardId ───────────────────────────────

describe('Shards API', () => {
  it('stores a shard and returns { stored: true, shardId }', async () => {
    const res = await request(app)
      .post('/shards/store')
      .send({ shardId: 'shard-001', encryptedShard: 'aabbccdd1122', userId: 'user-xyz' });
    expect(res.status).toBe(200);
    expect(res.body.stored).toBe(true);
    expect(res.body.shardId).toBe('shard-001');
  });

  it('retrieves a stored shard by id', async () => {
    await request(app)
      .post('/shards/store')
      .send({ shardId: 'shard-002', encryptedShard: 'eeff99887766', userId: 'user-abc' });

    const res = await request(app).get('/shards/shard-002');
    expect(res.status).toBe(200);
    expect(res.body.shardId).toBe('shard-002');
    expect(res.body.encryptedShard).toBe('eeff99887766');
  });

  it('store/get roundtrip preserves encryptedShard exactly', async () => {
    const payload = 'f0e1d2c3b4a596870102030405060708';
    await request(app)
      .post('/shards/store')
      .send({ shardId: 'shard-roundtrip', encryptedShard: payload, userId: 'u1' });
    const res = await request(app).get('/shards/shard-roundtrip');
    expect(res.body.encryptedShard).toBe(payload);
  });

  it('returns 404 for unknown shardId', async () => {
    const res = await request(app).get('/shards/nonexistent-shard-xyz');
    expect(res.status).toBe(404);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/shards/store')
      .send({ shardId: 'incomplete' });
    expect(res.status).toBe(400);
  });
});

// ─── POST /ghost/steps ────────────────────────────────────────────────────────

describe('POST /ghost/steps', () => {
  const VALID_ENVELOPE = {
    kemCiphertext: 'aGVsbG8=',
    encryptedPayload: 'd29ybGQ=',
    senderPublicKey: 'dGVzdA==',
    signature: 'deadbeef00112233',
    timestamp: Date.now(),
    version: '1.0',
  };

  const VALID_PAYLOAD = {
    txHash: '0xabc123def456',
    step: { index: 0, protocol: 'uniswap', action: 'swap', description: 'swap ETH to USDC' },
    network: 'base-sepolia',
  };

  beforeEach(() => {
    mockUnseal.mockReset();
  });

  it('accepts a valid envelope and returns acknowledged: true with txHash', async () => {
    mockUnseal.mockResolvedValue(VALID_PAYLOAD);
    const res = await request(app).post('/ghost/steps').send(VALID_ENVELOPE);
    expect(res.status).toBe(200);
    expect(res.body.acknowledged).toBe(true);
    expect(res.body.txHash).toBe('0xabc123def456');
  });

  it('does not require an x402-pqc payment header', async () => {
    mockUnseal.mockResolvedValue(VALID_PAYLOAD);
    const res = await request(app).post('/ghost/steps').send(VALID_ENVELOPE);
    // A payment-gated route returns 402 without the header; this must return 200.
    expect(res.status).toBe(200);
  });

  it('returns 403 when envelope signature is invalid (tampered envelope)', async () => {
    mockUnseal.mockRejectedValue(new Error('PQCTransport.unseal: signature verification failed'));
    const res = await request(app).post('/ghost/steps').send(VALID_ENVELOPE);
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Envelope verification failed');
    expect(res.body.code).toBe(403);
  });

  it('403 body includes the crypto error detail', async () => {
    mockUnseal.mockRejectedValue(new Error('PQCTransport.unseal: envelope expired (possible replay)'));
    const res = await request(app).post('/ghost/steps').send(VALID_ENVELOPE);
    expect(res.status).toBe(403);
    expect(res.body.detail).toContain('envelope expired');
  });

  it('returns 400 when kemCiphertext is missing', async () => {
    const { kemCiphertext: _, ...incomplete } = VALID_ENVELOPE;
    const res = await request(app).post('/ghost/steps').send(incomplete);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(400);
  });

  it('returns 400 when encryptedPayload is missing', async () => {
    const { encryptedPayload: _, ...incomplete } = VALID_ENVELOPE;
    const res = await request(app).post('/ghost/steps').send(incomplete);
    expect(res.status).toBe(400);
  });

  it('returns 400 when version field is wrong', async () => {
    const res = await request(app)
      .post('/ghost/steps')
      .send({ ...VALID_ENVELOPE, version: '2.0' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when unsealed payload is missing txHash', async () => {
    mockUnseal.mockResolvedValue({ step: VALID_PAYLOAD.step, network: 'base-sepolia' });
    const res = await request(app).post('/ghost/steps').send(VALID_ENVELOPE);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('txHash, step, and network');
  });

  it('returns 400 when unsealed payload is missing step', async () => {
    mockUnseal.mockResolvedValue({ txHash: '0xabc', network: 'base-sepolia' });
    const res = await request(app).post('/ghost/steps').send(VALID_ENVELOPE);
    expect(res.status).toBe(400);
  });

  it('returns 400 when unsealed payload is missing network', async () => {
    mockUnseal.mockResolvedValue({ txHash: '0xabc', step: VALID_PAYLOAD.step });
    const res = await request(app).post('/ghost/steps').send(VALID_ENVELOPE);
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is completely empty', async () => {
    const res = await request(app).post('/ghost/steps').send({});
    expect(res.status).toBe(400);
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

describe('404 handler', () => {
  it('returns error shape for unknown route', async () => {
    const res = await request(app).get('/unknown-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('code', 404);
  });
});
