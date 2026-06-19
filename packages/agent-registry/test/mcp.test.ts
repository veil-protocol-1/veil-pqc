import { describe, it, expect } from 'vitest';
import { createServer, MCP_SERVER_NAME, MCP_SERVER_VERSION } from '../src/mcp/server.js';

describe('MCP server', () => {
  it('initializes without error', () => {
    expect(() => createServer()).not.toThrow();
  });

  it('reports the veil-protocol name and version', () => {
    expect(MCP_SERVER_NAME).toBe('veil-protocol');
    expect(MCP_SERVER_VERSION).toBe('1.0.0');
  });

  it('registers all four tools', async () => {
    const server = createServer();
    const registered = (
      server as unknown as { _registeredTools: Record<string, unknown> }
    )._registeredTools;
    expect(Object.keys(registered)).toEqual(
      expect.arrayContaining([
        'veil_sign_payment',
        'veil_verify_payment',
        'veil_ghost_query',
        'veil_encrypt_payload',
      ]),
    );
  });
});