import { verifyX402PQCHeader } from '@veil_/x402-pqc';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

// Confirmed deployment: packages/contracts/deployments/base-x402-only.json (Base mainnet)
const VEIL_TREASURY = '0x77761912b6435287f2b4DaAe93c02611351e7750';
const X402_PAYMENTS_CONTRACT = '0x8F446afA9877C79F3CCb5eaA5b6503752817223f';
const NETWORK = 'base'; // Base mainnet, chainId 8453

export type GhostComplexity = 'simple' | 'standard' | 'complex';

export const TIER_AMOUNTS: Record<GhostComplexity, string> = {
  simple: '0.002',   // swap, send, balance check, price query — parser-only
  standard: '0.01',  // earn, stake
  complex: '0.05',   // reserved for borrow/bridge when parser supports it
};

/**
 * Classify complexity from a parsed intent action rather than raw message text.
 * Avoids false positives like "swap on Aave" being promoted to complex tier
 * just because the raw string contains "aave".
 */
export function classifyFromParsedIntent(intent: { action: string }): GhostComplexity {
  switch (intent.action) {
    case 'earn':
    case 'stake':
    case 'lend':
    case 'repay':
      return 'standard';
    case 'borrow':
    case 'bridge':
    case 'rebalance':
      return 'complex';
    default:
      return 'simple';
  }
}

const BASE_PAYMENT_REQUIRED = {
  error: 'Payment required',
  scheme: 'x402-pqc',
  network: NETWORK,
  recipient: VEIL_TREASURY,
  contract: X402_PAYMENTS_CONTRACT,
  currency: 'USD',
};

/**
 * x402PQCGate — factory that returns an Express middleware enforcing x402-pqc payment.
 *
 * getAmount is called with the request to determine the required amount for that specific
 * call — enabling per-request tiered pricing without a round-trip classify endpoint.
 * Defaults to the simple tier ($0.002) when no resolver is provided.
 */
export function x402PQCGate(
  getAmount: (req: Request) => string = () => TIER_AMOUNTS.simple,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const amount = getAmount(req);
    const paymentRequired = { ...BASE_PAYMENT_REQUIRED, amount };

    const headerValue = req.headers['x-402-pqc-payment'];

    if (!headerValue || typeof headerValue !== 'string') {
      res.status(402).json(paymentRequired);
      return;
    }

    const result = verifyX402PQCHeader(headerValue);

    if (!result.valid) {
      res.status(402).json({ ...paymentRequired, verificationError: result.error });
      return;
    }

    if (result.recipient?.toLowerCase() !== VEIL_TREASURY.toLowerCase()) {
      res.status(402).json({ ...paymentRequired, verificationError: 'wrong recipient' });
      return;
    }

    // verifyX402PQCHeader doesn't surface network in VerificationResult, so decode to check
    let claimedNetwork: string;
    try {
      const decoded = JSON.parse(atob(headerValue)) as { network: string };
      claimedNetwork = decoded.network;
    } catch {
      res.status(402).json({ ...paymentRequired, verificationError: 'malformed header' });
      return;
    }

    if (claimedNetwork !== NETWORK) {
      res.status(402).json({ ...paymentRequired, verificationError: 'wrong network — must be base' });
      return;
    }

    next();
  };
}
