import { describe, it, expect, vi, beforeAll } from 'vitest';
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

import { createApp } from '../app';

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

// ─── POST /ghost/intent — action parsing ─────────────────────────────────────

describe('POST /ghost/intent — intent parsing', () => {
  it('parses swap intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('swap');
  });

  it('parses send intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'send 100 USDC to 0xabc123def456' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('send');
  });

  it('parses transfer as send', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'transfer 10 ETH to my friend' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('send');
  });

  it('parses earn intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'earn yield on my USDC' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('earn');
  });

  it('parses stake intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'stake my ETH' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('stake');
  });

  it('parses query/balance intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'what is my ETH balance' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('query');
    expect(res.body.intent.queryType).toBe('balance');
  });

  it('parses query/history intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'show my transaction history' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('query');
    expect(res.body.intent.queryType).toBe('history');
  });

  it('parses query/price intent', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'what is the price of ETH' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('query');
    expect(res.body.intent.queryType).toBe('price');
  });

  it('returns clarify for ambiguous input', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'hello there' });
    expect(res.status).toBe(200);
    expect(res.body.intent.action).toBe('clarify');
  });

  it('returns clarify for empty-meaning input', async () => {
    const res = await request(app)
      .post('/ghost/intent')
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
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.intent.amount).toBe('50');
  });

  it('extracts token (fromToken) from swap message', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.intent.token).toBe('USDC');
  });

  it('extracts toToken from swap message', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.intent.toToken).toBe('ETH');
  });

  it('extracts decimal amount', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap 0.5 ETH to USDC' });
    expect(res.body.intent.amount).toBe('0.5');
  });

  it('extracts percentage amount', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'earn 5% APY on USDC' });
    expect(res.body.intent.amount).toBe('5%');
  });

  it('raw field matches original message', async () => {
    const msg = 'swap 50 USDC to ETH';
    const res = await request(app).post('/ghost/intent').send({ message: msg });
    expect(res.body.raw).toBe(msg);
  });

  it('confidence is between 0 and 1', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.confidence).toBeGreaterThanOrEqual(0);
    expect(res.body.confidence).toBeLessThanOrEqual(1);
  });

  it('confidence is lower for ambiguous input', async () => {
    const clear = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap 50 USDC to ETH' });
    const ambiguous = await request(app)
      .post('/ghost/intent')
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
      const res = await request(app).post('/ghost/intent').send({ message });
      expect(res.body.ghostResponse).toContain('Sovereign');
    }
  });

  it('swap response mentions the tokens', async () => {
    const res = await request(app)
      .post('/ghost/intent')
      .send({ message: 'swap 50 USDC to ETH' });
    expect(res.body.ghostResponse).toContain('USDC');
    expect(res.body.ghostResponse).toContain('ETH');
  });

  it('clarify response is a string', async () => {
    const res = await request(app)
      .post('/ghost/intent')
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
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(res.status).toBe(200);
  });

  it('sets X-Ghost-Mode: mock header', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(res.headers['x-ghost-mode']).toBe('mock');
  });

  it('response has encryptedResult', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(typeof res.body.encryptedResult).toBe('string');
    expect(res.body.encryptedResult.length).toBeGreaterThan(0);
  });

  it('response has sessionId', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(typeof res.body.sessionId).toBe('string');
    expect(res.body.sessionId.length).toBeGreaterThan(0);
  });

  it('response has timestamp as number', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'deadbeef01020304', publicKey: 'aabbccdd' });
    expect(typeof res.body.timestamp).toBe('number');
    expect(res.body.timestamp).toBeGreaterThan(0);
  });

  it('reuses session when sessionId provided', async () => {
    const first = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'aabb', publicKey: 'ccdd' });
    const sid = first.body.sessionId as string;

    const second = await request(app)
      .post('/ghost/query')
      .send({ encryptedQuery: 'aabb', publicKey: 'ccdd', sessionId: sid });
    expect(second.body.sessionId).toBe(sid);
  });

  it('returns 400 when encryptedQuery is missing', async () => {
    const res = await request(app)
      .post('/ghost/query')
      .send({ publicKey: 'aabbccdd' });
    expect(res.status).toBe(400);
  });

  it('has RateLimit headers on /ghost routes', async () => {
    const res = await request(app)
      .post('/ghost/query')
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

// ─── 404 handler ─────────────────────────────────────────────────────────────

describe('404 handler', () => {
  it('returns error shape for unknown route', async () => {
    const res = await request(app).get('/unknown-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('code', 404);
  });
});
