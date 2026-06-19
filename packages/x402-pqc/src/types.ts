export type { PQCKeypair, PQCPublicKey } from '@veil_/pqc-wallet';

export interface PaymentParams {
  amount: string;
  recipient: string;
  network: string;
  nonce?: string;
  timestamp?: number;
}

export interface VerificationResult {
  valid: boolean;
  payer?: string;
  amount?: string;
  recipient?: string;
  timestamp?: number;
  error?: string;
}

export interface EncryptedMetadata {
  kemCiphertext: Uint8Array;
  aesCiphertext: Uint8Array;
  aesNonce: Uint8Array;
  payeePublicKey: Uint8Array;
}

export interface SessionOpenHeader {
  sessionId: string;
  payerPublicKey: string;
  kemPublicKey: string;
  timestamp: number;
  signature: string;
}

export interface SessionConfirmation {
  sessionId: string;
  kemCiphertext: string;
  sessionExpiry: number;
  signature: string;
}

export interface X402PQCHeader {
  version: string;
  signingAlgorithm: string;
  publicKey: string;
  nonce: string;
  timestamp: number;
  amount: string;
  recipient: string;
  network: string;
  signature: string;
}
