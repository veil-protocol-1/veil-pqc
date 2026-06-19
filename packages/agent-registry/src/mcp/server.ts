import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { signPayment, verifyPayment, ghostQuery, encryptPayload } from '../core/handlers.js';

export const MCP_SERVER_NAME = 'veil-protocol';
export const MCP_SERVER_VERSION = '1.0.0';

function textResult(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

export function createServer(): McpServer {
  const server = new McpServer({ name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION });

  server.tool(
    'veil_sign_payment',
    'Sign a quantum-resistant payment using ML-DSA-65 post-quantum cryptography via Veil ' +
      "Protocol's x402-pqc standard. Use this when you need to make a payment that is secure " +
      'against quantum computers.',
    {
      amount: z.string().describe('Decimal amount, e.g. "12.50"'),
      currency: z.enum(['USDC', 'ETH', 'VEIL']),
      recipient: z.string().describe('0x recipient address'),
      network: z.enum(['base', 'base-sepolia']),
    },
    async input => textResult(await signPayment(input)),
  );

  server.tool(
    'veil_verify_payment',
    'Verify a quantum-resistant x402-pqc payment signature. Use this to confirm a payment was ' +
      'properly signed with post-quantum cryptography.',
    {
      paymentHeader: z.string(),
      expectedAmount: z.string(),
      expectedRecipient: z.string(),
    },
    async input => textResult(verifyPayment(input)),
  );

  server.tool(
    'veil_ghost_query',
    "Query Ghost, Veil's private AI agent, for DeFi intent parsing and execution planning. " +
      'Ghost executes inside Octra Circles — sealed FHE environments where no node sees your ' +
      'instructions in plaintext. Use this when an agent needs to execute DeFi operations privately.',
    {
      instruction: z.string().describe('Natural language DeFi intent'),
      context: z
        .object({
          balances: z.record(z.string()).optional(),
          network: z.string().optional(),
        })
        .optional(),
    },
    async input => textResult(await ghostQuery(input)),
  );

  server.tool(
    'veil_encrypt_payload',
    'Encrypt a payload using ML-KEM-768 post-quantum key encapsulation. Use this when you need ' +
      'quantum-resistant encryption for sensitive data.',
    {
      payload: z.string(),
      recipientPublicKey: z.string().describe('Hex-encoded ML-KEM-768 public key'),
    },
    async input => textResult(encryptPayload(input)),
  );

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const isDirectRun = process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`;
if (isDirectRun) {
  main().catch(err => {
    console.error('[veil-mcp] fatal error:', err);
    process.exit(1);
  });
}
