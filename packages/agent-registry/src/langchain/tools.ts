import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { signPayment, verifyPayment, ghostQuery, encryptPayload } from '../core/handlers.js';
import {
  SignPaymentInputSchema,
  VerifyPaymentInputSchema,
  GhostQueryInputSchema,
  EncryptPayloadInputSchema,
} from '../types.js';

export class VeilSignPaymentTool extends StructuredTool<typeof SignPaymentInputSchema> {
  name = 'veil_sign_payment';
  description =
    'Sign a quantum-resistant payment using ML-DSA-65 post-quantum cryptography via Veil ' +
    "Protocol's x402-pqc standard. Use this when you need to make a payment that is secure " +
    'against quantum computers.';
  schema = SignPaymentInputSchema;

  protected async _call(input: z.infer<typeof SignPaymentInputSchema>): Promise<string> {
    return JSON.stringify(await signPayment(input));
  }
}

export class VeilVerifyPaymentTool extends StructuredTool<typeof VerifyPaymentInputSchema> {
  name = 'veil_verify_payment';
  description =
    'Verify a quantum-resistant x402-pqc payment signature. Use this to confirm a payment was ' +
    'properly signed with post-quantum cryptography.';
  schema = VerifyPaymentInputSchema;

  protected async _call(input: z.infer<typeof VerifyPaymentInputSchema>): Promise<string> {
    return JSON.stringify(verifyPayment(input));
  }
}

export class VeilGhostQueryTool extends StructuredTool<typeof GhostQueryInputSchema> {
  name = 'veil_ghost_query';
  description =
    "Query Ghost, Veil's private AI agent, for DeFi intent parsing and execution planning. " +
    'Ghost executes inside Octra Circles — sealed FHE environments where no node sees your ' +
    'instructions in plaintext. Use this when an agent needs to execute DeFi operations privately.';
  schema = GhostQueryInputSchema;

  protected async _call(input: z.infer<typeof GhostQueryInputSchema>): Promise<string> {
    return JSON.stringify(await ghostQuery(input));
  }
}

export class VeilEncryptPayloadTool extends StructuredTool<typeof EncryptPayloadInputSchema> {
  name = 'veil_encrypt_payload';
  description =
    'Encrypt a payload using ML-KEM-768 post-quantum key encapsulation. Use this when you need ' +
    'quantum-resistant encryption for sensitive data.';
  schema = EncryptPayloadInputSchema;

  protected async _call(input: z.infer<typeof EncryptPayloadInputSchema>): Promise<string> {
    return JSON.stringify(encryptPayload(input));
  }
}

export const veilTools = [
  new VeilSignPaymentTool(),
  new VeilVerifyPaymentTool(),
  new VeilGhostQueryTool(),
  new VeilEncryptPayloadTool(),
];
