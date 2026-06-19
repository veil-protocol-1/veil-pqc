import { signPayment, verifyPayment, ghostQuery, encryptPayload } from '../core/handlers.js';
import type {
  SignPaymentInput,
  VerifyPaymentInput,
  GhostQueryInput,
  EncryptPayloadInput,
} from '../types.js';

export interface OpenAIFunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const veilFunctions: OpenAIFunctionDefinition[] = [
  {
    name: 'veil_sign_payment',
    description:
      'Sign a quantum-resistant payment using ML-DSA-65 post-quantum cryptography via Veil ' +
      "Protocol's x402-pqc standard. Use this when you need to make a payment that is secure " +
      'against quantum computers.',
    parameters: {
      type: 'object',
      properties: {
        amount: { type: 'string', description: 'Decimal amount, e.g. "12.50"' },
        currency: { type: 'string', enum: ['USDC', 'ETH', 'VEIL'] },
        recipient: { type: 'string', description: '0x recipient address' },
        network: { type: 'string', enum: ['base', 'base-sepolia'] },
      },
      required: ['amount', 'currency', 'recipient', 'network'],
    },
  },
  {
    name: 'veil_verify_payment',
    description:
      'Verify a quantum-resistant x402-pqc payment signature. Use this to confirm a payment ' +
      'was properly signed with post-quantum cryptography.',
    parameters: {
      type: 'object',
      properties: {
        paymentHeader: { type: 'string' },
        expectedAmount: { type: 'string' },
        expectedRecipient: { type: 'string' },
      },
      required: ['paymentHeader', 'expectedAmount', 'expectedRecipient'],
    },
  },
  {
    name: 'veil_ghost_query',
    description:
      "Query Ghost, Veil's private AI agent, for DeFi intent parsing and execution planning. " +
      'Ghost executes inside Octra Circles — sealed FHE environments where no node sees your ' +
      'instructions in plaintext. Use this when an agent needs to execute DeFi operations privately.',
    parameters: {
      type: 'object',
      properties: {
        instruction: { type: 'string', description: 'Natural language DeFi intent' },
        context: {
          type: 'object',
          properties: {
            balances: { type: 'object', additionalProperties: { type: 'string' } },
            network: { type: 'string' },
          },
        },
      },
      required: ['instruction'],
    },
  },
  {
    name: 'veil_encrypt_payload',
    description:
      'Encrypt a payload using ML-KEM-768 post-quantum key encapsulation. Use this when you ' +
      'need quantum-resistant encryption for sensitive data.',
    parameters: {
      type: 'object',
      properties: {
        payload: { type: 'string' },
        recipientPublicKey: { type: 'string', description: 'Hex-encoded ML-KEM-768 public key' },
      },
      required: ['payload', 'recipientPublicKey'],
    },
  },
];

export const veilFunctionHandlers = {
  veil_sign_payment: async (args: SignPaymentInput) => signPayment(args),
  veil_verify_payment: async (args: VerifyPaymentInput) => verifyPayment(args),
  veil_ghost_query: async (args: GhostQueryInput) => ghostQuery(args),
  veil_encrypt_payload: async (args: EncryptPayloadInput) => encryptPayload(args),
};
