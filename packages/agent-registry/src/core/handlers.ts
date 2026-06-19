/**
 * Core tool handlers shared by every agent-marketplace wrapper (MCP, LangChain,
 * OpenAI functions, REST). Keeping the logic in one place means each wrapper is
 * a thin adapter over the same @veil/x402-pqc and @veil/circles calls.
 */
import { createX402PQCHeader, verifyX402PQCHeader, encryptPaymentMetadata } from '@veil_/x402-pqc';
import { generatePQCKeypair } from '@veil_/pqc-wallet';
import { VeilLMClient } from '@veil_/circles';
import { sha3_256 } from '@noble/hashes/sha3';
import type {
  SignPaymentInput,
  SignPaymentOutput,
  VerifyPaymentInput,
  VerifyPaymentOutput,
  GhostQueryInput,
  GhostQueryOutput,
  EncryptPayloadInput,
  EncryptPayloadOutput,
} from '../types.js';

const GHOST_INTENT_URL = 'https://api.veilprotocol.net/ghost/intent';
const GHOST_REQUEST_TIMEOUT_MS = 5000;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('invalid hex string');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Signs a quantum-resistant x402-pqc payment header (ML-DSA-65).
 *
 * No on-chain submission happens here — this produces the signed payment
 * header per the x402-pqc spec. txHash is a deterministic placeholder
 * (sha3-256 of the header) until the header is broadcast/settled on-chain.
 */
export async function signPayment(input: SignPaymentInput): Promise<SignPaymentOutput> {
  const keypair = generatePQCKeypair();
  const paymentHeader = createX402PQCHeader(
    { amount: input.amount, recipient: input.recipient, network: input.network },
    keypair,
  );
  const decoded = JSON.parse(atob(paymentHeader)) as { publicKey: string; signature: string };

  const txHash = '0x' + toHex(sha3_256(new TextEncoder().encode(paymentHeader)));

  return {
    signature: decoded.signature,
    publicKey: decoded.publicKey,
    paymentHeader,
    txHash,
  };
}

/** Verifies an x402-pqc payment header against the expected amount/recipient. */
export function verifyPayment(input: VerifyPaymentInput): VerifyPaymentOutput {
  const result = verifyX402PQCHeader(input.paymentHeader);

  if (!result.valid) {
    return { valid: false, details: { error: result.error } };
  }

  if (result.amount !== input.expectedAmount || result.recipient !== input.expectedRecipient) {
    return {
      valid: false,
      details: {
        payer: result.payer,
        amount: result.amount,
        recipient: result.recipient,
        timestamp: result.timestamp,
        error: 'signature valid but amount/recipient mismatch',
      },
    };
  }

  return {
    valid: true,
    details: {
      payer: result.payer,
      amount: result.amount,
      recipient: result.recipient,
      timestamp: result.timestamp,
    },
  };
}

function sovereign(message: string): string {
  return `Sovereign, ${message}`;
}

/**
 * Queries Ghost for DeFi intent parsing and execution planning.
 *
 * Tries the live Ghost intent API first; if it's unreachable (the
 * distributed Ghost network is not yet fully live), falls back to the local
 * VeilLMClient mock so callers always get a usable response.
 */
export async function ghostQuery(input: GhostQueryInput): Promise<GhostQueryOutput> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GHOST_REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(GHOST_INTENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: input.instruction, context: input.context }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`ghost API returned ${response.status}`);
      return (await response.json()) as GhostQueryOutput;
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return ghostQueryMock(input);
  }
}

async function ghostQueryMock(input: GhostQueryInput): Promise<GhostQueryOutput> {
  const client = new VeilLMClient();
  const result = await client.query(input.instruction, {
    availableProtocols: [],
    userBalances: input.context?.balances ?? {},
    chainId: input.context?.network,
  });

  const steps =
    result.intent.action === 'unknown'
      ? []
      : [
          {
            protocol: result.intent.protocol,
            action: result.intent.action,
            params: {
              fromToken: result.intent.fromToken,
              toToken: result.intent.toToken,
              amount: result.intent.amount,
            },
          },
        ];

  return {
    intent: { ...result.intent } as Record<string, unknown>,
    confidence: result.confidence,
    ghostResponse: sovereign(
      result.intent.action === 'unknown'
        ? "I couldn't confidently parse that instruction. Could you rephrase it?"
        : `I've parsed your intent as a "${result.intent.action}" — sealing it inside an Octra Circle for private execution planning.`,
    ),
    executionPlan: { steps, estimatedCost: '0' },
  };
}

/** Encrypts a payload for a recipient using ML-KEM-768 + AES-256-GCM. */
export function encryptPayload(input: EncryptPayloadInput): EncryptPayloadOutput {
  const encrypted = encryptPaymentMetadata(
    { payload: input.payload },
    fromHex(input.recipientPublicKey),
  );

  const encryptedPayload = Buffer.from(
    JSON.stringify({
      aesCiphertext: toHex(encrypted.aesCiphertext),
      aesNonce: toHex(encrypted.aesNonce),
    }),
  ).toString('base64');

  return {
    encryptedPayload,
    kemCiphertext: toHex(encrypted.kemCiphertext),
  };
}
