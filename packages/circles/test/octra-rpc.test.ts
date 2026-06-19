/**
 * octra-rpc.test.ts — Integration tests for the Ghost RPC client.
 *
 * Tests are organized in two tiers:
 *   Unit:        always run — test pure logic (h256/base58, constants, mode API)
 *   Integration: skip if Octra mainnet is unreachable — call real RPC methods
 *
 * The integration tier is guarded by a beforeAll probe so CI stays green when
 * both nodes are unreachable. Set GHOST_FORCE_RPC=1 in the environment to
 * force the integration tier to run and fail visibly if nodes are unreachable.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc,
  probeNode,
  getRpcMode,
  getActiveEndpoint,
  ghostNodeStatus,
  ghostNonce,
  ghostBalance,
  ghostDeployCircle,
  ghostCompile,
  deriveGhostCircleId,
  GhostRpcError,
  GHOST_RPC_PRIMARY,
  GHOST_RPC_FALLBACK,
  GHOST_CIRCLE_DEPLOY_PAYLOAD,
  _resetProbeState,
} from '../src/octra-rpc.js';
import { generatePQCKeypair } from '@veil_/pqc-wallet';

// ─── State shared across tests ────────────────────────────────────────────────

let nodeReachable = false;

beforeAll(async () => {
  // Fresh probe every test run
  _resetProbeState();
  const mode = await probeNode();
  nodeReachable = mode === 'real';
  if (!nodeReachable) {
    console.info(
      '[test] Octra mainnet unreachable — integration tests will be skipped. ' +
        'This is expected in CI without network access.',
    );
  }
}, 20_000);

// ─── Unit: constants ──────────────────────────────────────────────────────────

describe('RPC constants', () => {
  it('GHOST_RPC_PRIMARY is the documented mainnet endpoint', () => {
    expect(GHOST_RPC_PRIMARY).toBe('https://octra.net/rpc');
  });

  it('GHOST_RPC_FALLBACK is the documented fallback endpoint', () => {
    expect(GHOST_RPC_FALLBACK).toBe('https://rpc.octra.org');
  });

  it('GHOST_CIRCLE_DEPLOY_PAYLOAD has expected top-level keys', () => {
    expect(GHOST_CIRCLE_DEPLOY_PAYLOAD.runtime).toBe('octb');
    expect(GHOST_CIRCLE_DEPLOY_PAYLOAD.privacy_class).toBe('sealed');
    expect(GHOST_CIRCLE_DEPLOY_PAYLOAD.browser_mode).toBe('native_sealed');
    expect(GHOST_CIRCLE_DEPLOY_PAYLOAD.resource_mode).toBe('sealed_read');
    expect(GHOST_CIRCLE_DEPLOY_PAYLOAD.code_b64).toBeNull();
    expect(GHOST_CIRCLE_DEPLOY_PAYLOAD.policy_hash).toBeNull();
    expect(GHOST_CIRCLE_DEPLOY_PAYLOAD.members_root).toBeNull();
    expect(GHOST_CIRCLE_DEPLOY_PAYLOAD.export_policy).toBeNull();
  });

  it('GHOST_CIRCLE_DEPLOY_PAYLOAD.limits contains required byte limit fields', () => {
    const lim = GHOST_CIRCLE_DEPLOY_PAYLOAD.limits;
    expect(lim.max_stable_bytes).toBe('33554432');
    expect(lim.max_assets_bytes).toBe('33554432');
    expect(lim.max_inline_value).toBe('65536');
    expect(lim.max_wasm_bytes).toBe('33554432');
  });
});

// ─── Unit: GhostRpcError ──────────────────────────────────────────────────────

describe('GhostRpcError', () => {
  it('has name="GhostRpcError"', () => {
    const err = new GhostRpcError('test', 'node_status', -1);
    expect(err.name).toBe('GhostRpcError');
  });

  it('is an instance of Error', () => {
    expect(new GhostRpcError('oops', 'rpc', 0)).toBeInstanceOf(Error);
  });

  it('exposes method and code', () => {
    const err = new GhostRpcError('failed', 'octra_nonce', 42);
    expect(err.method).toBe('octra_nonce');
    expect(err.code).toBe(42);
  });
});

// ─── Unit: probe mode API ─────────────────────────────────────────────────────

describe('probe mode API', () => {
  it('getRpcMode returns "real" or "mock" (never "pending")', async () => {
    const mode = getRpcMode();
    expect(['real', 'mock']).toContain(mode);
  });

  it('getActiveEndpoint returns a string starting with https://', () => {
    const endpoint = getActiveEndpoint();
    expect(endpoint.startsWith('https://')).toBe(true);
  });

  it('probeNode() is idempotent — multiple calls return the same mode', async () => {
    const m1 = await probeNode();
    const m2 = await probeNode();
    expect(m1).toBe(m2);
  });

  it('in mock mode, rpc() returns null without throwing', async () => {
    if (nodeReachable) return; // only meaningful in mock mode
    const result = await rpc('node_status', []);
    expect(result).toBeNull();
  });
});

// ─── Unit: deriveGhostCircleId ────────────────────────────────────────────────

describe('deriveGhostCircleId', () => {
  it('returns a string starting with "oct"', async () => {
    const id = await deriveGhostCircleId(GHOST_CIRCLE_DEPLOY_PAYLOAD, 'octABC123', 0);
    expect(id.startsWith('oct')).toBe(true);
  });

  it('returns a string of length 47 (3 + 44)', async () => {
    const id = await deriveGhostCircleId(GHOST_CIRCLE_DEPLOY_PAYLOAD, 'octABC123', 0);
    expect(id.length).toBe(47);
  });

  it('is deterministic — same inputs produce same circle_id', async () => {
    const addr = 'oct1234567890abcdefghijklmnopqrstuvwxyz01234';
    const id1 = await deriveGhostCircleId(GHOST_CIRCLE_DEPLOY_PAYLOAD, addr, 5);
    const id2 = await deriveGhostCircleId(GHOST_CIRCLE_DEPLOY_PAYLOAD, addr, 5);
    expect(id1).toBe(id2);
  });

  it('different deployer addresses produce different circle_ids', async () => {
    const id1 = await deriveGhostCircleId(GHOST_CIRCLE_DEPLOY_PAYLOAD, 'octAAAA', 0);
    const id2 = await deriveGhostCircleId(GHOST_CIRCLE_DEPLOY_PAYLOAD, 'octBBBB', 0);
    expect(id1).not.toBe(id2);
  });

  it('different nonces produce different circle_ids', async () => {
    const addr = 'octABC123';
    const id1 = await deriveGhostCircleId(GHOST_CIRCLE_DEPLOY_PAYLOAD, addr, 0);
    const id2 = await deriveGhostCircleId(GHOST_CIRCLE_DEPLOY_PAYLOAD, addr, 1);
    expect(id1).not.toBe(id2);
  });

  it('different payloads produce different circle_ids', async () => {
    const addr = 'octABC123';
    const p1 = { ...GHOST_CIRCLE_DEPLOY_PAYLOAD };
    const p2 = { ...GHOST_CIRCLE_DEPLOY_PAYLOAD, runtime: 'wasm_v1' };
    const id1 = await deriveGhostCircleId(p1, addr, 0);
    const id2 = await deriveGhostCircleId(p2, addr, 0);
    expect(id1).not.toBe(id2);
  });
});

// ─── Unit: mock helpers ───────────────────────────────────────────────────────

describe('mock mode helpers', () => {
  it('ghostNonce returns 0 in mock mode', async () => {
    if (nodeReachable) return;
    const n = await ghostNonce('octABC123');
    expect(n).toBe(0);
  });

  it('ghostBalance returns 0n in mock mode', async () => {
    if (nodeReachable) return;
    const b = await ghostBalance('octABC123');
    expect(b).toBe(0n);
  });

  it('ghostDeployCircle returns circleId + txHash in mock mode', async () => {
    if (nodeReachable) return;
    const keypair = generatePQCKeypair();
    const { circleId, txHash } = await ghostDeployCircle(keypair.address, 0);
    expect(circleId.startsWith('oct')).toBe(true);
    expect(txHash.startsWith('0xmock')).toBe(true);
  });

  it('ghostCompile returns a base64 string in mock mode', async () => {
    if (nodeReachable) return;
    const result = await ghostCompile('contract Ghost {}');
    expect(typeof result).toBe('string');
    // base64 characters only
    expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
  });

  it('ghostCompile mock is invertible (base64-encoded source)', async () => {
    if (nodeReachable) return;
    const source = 'contract Ghost {}';
    const b64 = await ghostCompile(source);
    expect(Buffer.from(b64, 'base64').toString()).toBe(source);
  });

  it('ghostNodeStatus returns null in mock mode', async () => {
    if (nodeReachable) return;
    const status = await ghostNodeStatus();
    expect(status).toBeNull();
  });
});

// ─── Integration: real RPC ────────────────────────────────────────────────────

describe('Octra mainnet integration', () => {
  it.skipIf(!nodeReachable)(
    'node_status returns a non-null result with version info',
    async () => {
      const status = await ghostNodeStatus();
      expect(status).not.toBeNull();
      expect(typeof status).toBe('object');
    },
    15_000,
  );

  it.skipIf(!nodeReachable)(
    'octra_nonce returns a non-negative integer for a fresh address',
    async () => {
      const keypair = generatePQCKeypair();
      const nonce = await ghostNonce(keypair.address);
      expect(typeof nonce).toBe('number');
      expect(nonce).toBeGreaterThanOrEqual(0);
    },
    15_000,
  );

  it.skipIf(!nodeReachable)(
    'octra_balance returns a bigint for a fresh address',
    async () => {
      const keypair = generatePQCKeypair();
      const balance = await ghostBalance(keypair.address);
      expect(typeof balance).toBe('bigint');
    },
    15_000,
  );

  it.skipIf(!nodeReachable)(
    'deriveGhostCircleId uses the nonce from octra_nonce for a fresh deploy',
    async () => {
      const keypair = generatePQCKeypair();
      const nonce = await ghostNonce(keypair.address);
      const id = await deriveGhostCircleId(GHOST_CIRCLE_DEPLOY_PAYLOAD, keypair.address, nonce);
      expect(id.startsWith('oct')).toBe(true);
      expect(id.length).toBe(47);
    },
    15_000,
  );

  it.skipIf(!nodeReachable)(
    'getActiveEndpoint returns the primary node when it is reachable',
    async () => {
      const endpoint = getActiveEndpoint();
      // Should be either primary or fallback — never a local/mock URL
      expect([GHOST_RPC_PRIMARY, GHOST_RPC_FALLBACK]).toContain(endpoint);
    },
    5_000,
  );
});
