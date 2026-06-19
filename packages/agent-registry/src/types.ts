import { z } from 'zod';

export const SignPaymentInputSchema = z.object({
  amount: z.string().describe('Decimal amount, e.g. "12.50"'),
  currency: z.enum(['USDC', 'ETH', 'VEIL']),
  recipient: z.string().describe('0x recipient address'),
  network: z.enum(['base', 'base-sepolia']),
});
export type SignPaymentInput = z.infer<typeof SignPaymentInputSchema>;

export interface SignPaymentOutput {
  signature: string;
  publicKey: string;
  paymentHeader: string;
  txHash: string;
}

export const VerifyPaymentInputSchema = z.object({
  paymentHeader: z.string(),
  expectedAmount: z.string(),
  expectedRecipient: z.string(),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

export interface VerifyPaymentOutput {
  valid: boolean;
  details: {
    payer?: string;
    amount?: string;
    recipient?: string;
    timestamp?: number;
    error?: string;
  };
}

export const GhostQueryInputSchema = z.object({
  instruction: z.string().describe('Natural language DeFi intent'),
  context: z
    .object({
      balances: z.record(z.string()).optional(),
      network: z.string().optional(),
    })
    .optional(),
});
export type GhostQueryInput = z.infer<typeof GhostQueryInputSchema>;

export interface GhostQueryOutput {
  intent: Record<string, unknown>;
  confidence: number;
  ghostResponse: string;
  executionPlan: {
    steps: Array<{ protocol?: string; action: string; params: Record<string, unknown> }>;
    estimatedCost: string;
  };
}

export const EncryptPayloadInputSchema = z.object({
  payload: z.string(),
  recipientPublicKey: z.string().describe('Hex-encoded ML-KEM-768 public key'),
});
export type EncryptPayloadInput = z.infer<typeof EncryptPayloadInputSchema>;

export interface EncryptPayloadOutput {
  encryptedPayload: string;
  kemCiphertext: string;
}
