import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { CircleSession, getRpcMode } from '@veil_/circles';
import { pqcTransport } from '@veil/ghost';
import type { PQCEnvelope } from '@veil/ghost';
import { x402PQCGate, classifyFromParsedIntent, TIER_AMOUNTS, type GhostComplexity } from '../middleware/x402pqc';
import { setClassifierReady, isClassifierReady } from '../classifierState';

const VALID_COMPLEXITY = new Set<string>(['simple', 'standard', 'complex']);

function queryTierAmount(req: { body?: { complexity?: string } }): string {
  const c = req.body?.complexity;
  return TIER_AMOUNTS[(VALID_COMPLEXITY.has(c ?? '') ? c : 'simple') as GhostComplexity];
}

function intentTierAmount(req: { body?: { message?: string } }): string {
  const { intent } = parseGhostIntent(req.body?.message ?? '');
  return TIER_AMOUNTS[classifyFromParsedIntent(intent)];
}

// ─── Server keypair (mock — real key loaded from secure config in prod) ────────

const SERVER_KEYPAIR = {
  signingKey: new Uint8Array(4032),
  encapsulationKey: new Uint8Array(2400),
  publicKey: {
    dsa: new Uint8Array(1952),
    kem: new Uint8Array(1184),
  },
  address: process.env.VEIL_NODE_ID ?? 'oct_veil_api_node',
};

// ─── ML classifier singleton ──────────────────────────────────────────────────

// Shape of ParsedIntent returned by @veil/ghost IntentParser (mirrors the type
// without a static import so tests never load @xenova/transformers).
interface GhostMLIntent {
  action: string;
  confidence: number;
  params: {
    fromToken?: string;
    toToken?: string;
    amount?: string;
    amountIsPercent?: boolean;
    recipient?: string;
    protocol?: string;
    queryType?: string;
  };
  ghostResponse: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ghostParser: any = null;

/**
 * Call once at server startup.  Downloads/caches the MiniLM-L6-v2 model and
 * pre-computes embeddings for all training examples (~24 s on first run).
 * /health reports classifierReady:false until this resolves.  If init fails
 * the server continues running with the regex fallback.
 */
export async function initClassifier(): Promise<void> {
  try {
    // Dynamic import keeps @veil/ghost out of the module graph during vitest
    // runs — tests never call initClassifier(), so the model is never loaded.
    const { IntentParser } = await import('@veil/ghost');
    ghostParser = new IntentParser();
    await ghostParser.initClassifier();
    setClassifierReady();
    console.log('[ghost-api] Classifier ready (DistilBERT primary, EmbeddingClassifier fallback) — ML intent parsing active.');
  } catch (err) {
    console.error('[ghost-api] Classifier init failed — falling back to regex parser:', err);
  }
}

/**
 * Map a ghost-package ParsedIntent to the API's ParsedGhostIntent shape so the
 * response contract stays stable for existing clients and tests.
 */
function mlToApiIntent(parsed: GhostMLIntent, message: string): ParsedGhostIntent {
  let action = parsed.action as IntentAction;

  // 'lend' and 'rebalance' are API-specific concepts not in the ghost GhostAction
  // enum — detect them by keyword so tests keep passing after the ML upgrade.
  if ((action === 'earn' || action === 'clarify') && /\blend\b/i.test(message)) {
    action = 'lend';
  }
  if (((action as string) === 'complex' || action === 'clarify') && /\brebalance\b/i.test(message)) {
    action = 'rebalance';
  }

  // Restore the '5%' amount format expected by existing clients.
  const amount =
    parsed.params.amountIsPercent && parsed.params.amount
      ? `${parsed.params.amount}%`
      : parsed.params.amount;

  const intent: ParsedGhostIntent = { action };
  if (parsed.params.fromToken) intent.token = parsed.params.fromToken;
  if (parsed.params.toToken) intent.toToken = parsed.params.toToken;
  if (amount) intent.amount = amount;
  if (parsed.params.recipient) intent.to = parsed.params.recipient;
  if (parsed.params.protocol) intent.protocol = parsed.params.protocol;
  if (parsed.params.queryType) intent.queryType = parsed.params.queryType;
  if (action === 'clarify') intent.message = parsed.ghostResponse;

  return intent;
}

// ─── Session store ────────────────────────────────────────────────────────────

const sessions = new Map<string, CircleSession>();

async function getOrCreateSession(sessionId?: string): Promise<{ session: CircleSession; sid: string }> {
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    if (!session.isActive) await session.create();
    return { session, sid: sessionId };
  }
  const sid = crypto.randomUUID();
  const session = new CircleSession({ keypair: SERVER_KEYPAIR, reuse: true });
  await session.create();
  sessions.set(sid, session);
  return { session, sid };
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────

export const ghostRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', code: 429 },
});

// ─── Intent parsing ───────────────────────────────────────────────────────────

const KNOWN_TOKENS = ['ETH', 'USDC', 'USDT', 'BTC', 'VEIL', 'SOL', 'BNB', 'AVAX', 'OP', 'FTM'];

type IntentAction = 'swap' | 'send' | 'earn' | 'stake' | 'query' | 'pay' | 'borrow' | 'lend' | 'repay' | 'rebalance' | 'clarify';

interface ParsedGhostIntent {
  action: IntentAction;
  token?: string;
  toToken?: string;
  amount?: string;
  to?: string;
  protocol?: string;
  timeframe?: string;
  queryType?: string;
  message?: string;
}

function parseGhostIntent(message: string): { intent: ParsedGhostIntent; confidence: number } {
  const lower = message.toLowerCase();

  const amountMatch = message.match(/(\d+(?:\.\d+)?%?)/);
  const amount = amountMatch?.[1];

  const tokenPositions: Array<{ token: string; pos: number }> = [];
  for (const tok of KNOWN_TOKENS) {
    const re = new RegExp(`\\b${tok}\\b`, 'i');
    const match = re.exec(message);
    if (match) tokenPositions.push({ token: tok, pos: match.index });
  }
  tokenPositions.sort((a, b) => a.pos - b.pos);
  const foundTokens = tokenPositions.map((t) => t.token);
  const token = foundTokens[0];
  const toToken = foundTokens[1];

  const toMatch = message.match(/\bto\s+(0x[a-fA-F0-9]{4,}|\w{3,}@\w{2,})/);
  const to = toMatch?.[1];

  let action: IntentAction;
  let queryType: string | undefined;
  let confidence: number;

  if (/\b(swap|exchange|convert)\b/.test(lower)) {
    action = 'swap';
    confidence = token && toToken ? 0.95 : token ? 0.75 : 0.6;
  } else if (/\b(send|transfer|pay)\b/.test(lower)) {
    action = 'send';
    confidence = token && amount ? 0.9 : 0.7;
  } else if (/\b(earn|yield|apy)\b/.test(lower)) {
    action = 'earn';
    confidence = token ? 0.9 : 0.75;
  } else if (/\b(stake|staking)\b/.test(lower)) {
    action = 'stake';
    confidence = token ? 0.9 : 0.75;
  } else if (/\b(balance|how much|what do i have)\b/.test(lower)) {
    action = 'query';
    queryType = 'balance';
    confidence = 0.9;
  } else if (/\b(history|transactions|what did)\b/.test(lower)) {
    action = 'query';
    queryType = 'history';
    confidence = 0.9;
  } else if (/\b(price|rate|cost)\b/.test(lower)) {
    action = 'query';
    queryType = 'price';
    confidence = 0.85;
  } else if (/\b(repay|repaying|repayment)\b/.test(lower)) {
    action = 'repay';
    confidence = token || amount ? 0.9 : 0.75;
  } else if (/\b(borrow|loan)\b/.test(lower)) {
    action = 'borrow';
    confidence = token ? 0.9 : 0.75;
  } else if (/\b(lend|lending)\b/.test(lower)) {
    action = 'lend';
    confidence = token ? 0.9 : 0.75;
  } else if (/\b(rebalance|rebalancing)\b/.test(lower)) {
    action = 'rebalance';
    confidence = 0.85;
  } else {
    action = 'clarify';
    confidence = 0.3;
  }

  const intent: ParsedGhostIntent = { action };
  if (token) intent.token = token;
  if (toToken) intent.toToken = toToken;
  if (amount) intent.amount = amount;
  if (to) intent.to = to;
  if (queryType) intent.queryType = queryType;
  if (action === 'clarify') {
    intent.message =
      'Could you clarify your intent, Sovereign? I can help you swap, send, earn, stake, borrow, lend, repay, rebalance, or check your balance.';
  }

  return { intent, confidence };
}

function buildGhostResponse(intent: ParsedGhostIntent): string {
  const { action, token, toToken, amount, to, queryType } = intent;

  switch (action) {
    case 'swap':
      return `Understood, Sovereign. Preparing to swap ${amount ? amount + ' ' : ''}${token ?? ''} to ${toToken ?? ''}.`.replace(/\s{2,}/g, ' ').trim();
    case 'send':
    case 'pay':
      return `Understood, Sovereign. Sending ${amount ? amount + ' ' : ''}${token ?? ''} to ${to ?? ''}.`.replace(/\s{2,}/g, ' ').trim();
    case 'earn':
      return `Understood, Sovereign. Finding the best yield for your ${token ?? 'assets'}.`;
    case 'stake':
      return `Understood, Sovereign. Staking your ${token ?? 'assets'}.`;
    case 'query':
      if (queryType === 'balance') {
        return `Understood, Sovereign. Checking your ${token ?? ''} balance.`.replace(/\s{2,}/g, ' ').trim();
      }
      if (queryType === 'history') {
        return 'Understood, Sovereign. Pulling your transaction history.';
      }
      return 'Understood, Sovereign. How may I assist you further?';
    case 'borrow':
      return `Understood, Sovereign. Arranging a borrow against your ${token ?? 'collateral'}.`;
    case 'lend':
      return `Understood, Sovereign. Deploying your ${token ?? 'assets'} as liquidity.`;
    case 'repay':
      return `Understood, Sovereign. Repaying ${amount ? amount + ' ' : ''}${token ?? 'your outstanding balance'}.`.replace(/\s{2,}/g, ' ').trim();
    case 'rebalance':
      return `Understood, Sovereign. Rebalancing your portfolio.`;
    case 'clarify':
      return intent.message ?? 'Understood, Sovereign. How may I assist you further?';
    default:
      return 'Understood, Sovereign. How may I assist you further?';
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const ghostRouter = Router();

ghostRouter.post('/query', ghostRateLimiter, x402PQCGate(queryTierAmount), async (req, res, next) => {
  try {
    const { encryptedQuery, sessionId } = req.body as {
      encryptedQuery?: string;
      publicKey?: string;
      modelId?: number;
      sessionId?: string;
    };

    if (!encryptedQuery || typeof encryptedQuery !== 'string') {
      res.status(400).json({ error: 'encryptedQuery is required', code: 400 });
      return;
    }

    const { session, sid } = await getOrCreateSession(sessionId);

    try {
      const queryBytes = Buffer.from(encryptedQuery, 'hex');
      const result = await session.private_predict(queryBytes);
      if (getRpcMode() === 'mock') res.setHeader('X-Ghost-Mode', 'mock');
      res.json({
        encryptedResult: Buffer.from(result).toString('hex'),
        sessionId: sid,
        timestamp: Date.now(),
      });
    } catch {
      res.setHeader('X-Ghost-Mode', 'mock');
      res.json({
        encryptedResult: Buffer.alloc(32, 0).toString('hex'),
        sessionId: sid,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    next(err);
  }
});

ghostRouter.post('/intent', ghostRateLimiter, x402PQCGate(intentTierAmount), async (req, res, next) => {
  try {
    const { message } = req.body as {
      message?: string;
      context?: {
        balances?: Record<string, string>;
        recentActions?: string[];
      };
    };

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message is required', code: 400 });
      return;
    }

    let intent: ParsedGhostIntent;
    let confidence: number;

    if (isClassifierReady() && ghostParser) {
      // ML primary path — warm after initClassifier() completes at startup.
      const parsed: GhostMLIntent = await ghostParser.parseAsync(message);
      intent = mlToApiIntent(parsed, message);
      confidence = parsed.confidence;
    } else {
      // Regex fallback — used during the classifier warm-up window and in tests.
      const result = parseGhostIntent(message);
      intent = result.intent;
      confidence = result.confidence;
    }

    const ghostResponse = buildGhostResponse(intent);
    res.json({ intent, confidence, raw: message, ghostResponse });
  } catch (err) {
    next(err);
  }
});

// ─── Signed step log (in-memory — TODO: replace with persistent storage) ─────

const stepLog: Array<{ txHash: string; step: unknown; network: string; receivedAt: number }> = [];

// POST /ghost/steps — receives Ghost's ML-DSA-65 signed execution step broadcasts.
// Not payment-gated: this is Ghost's own internal relay (trusted sender), not an
// external user query. The PQCEnvelope signature is the authentication mechanism.
ghostRouter.post('/steps', ghostRateLimiter, async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;

    if (
      typeof body.kemCiphertext !== 'string' ||
      typeof body.encryptedPayload !== 'string' ||
      typeof body.senderPublicKey !== 'string' ||
      typeof body.signature !== 'string' ||
      typeof body.timestamp !== 'number' ||
      body.version !== '1.0'
    ) {
      res.status(400).json({ error: 'Invalid PQCEnvelope: missing or malformed required fields', code: 400 });
      return;
    }

    let payload: unknown;
    try {
      payload = await pqcTransport.unseal(body as unknown as PQCEnvelope);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'envelope verification failed';
      res.status(403).json({ error: 'Envelope verification failed', detail, code: 403 });
      return;
    }

    const p = payload as Record<string, unknown>;
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof p.txHash !== 'string' ||
      typeof p.step !== 'object' ||
      p.step === null ||
      typeof p.network !== 'string'
    ) {
      res.status(400).json({ error: 'Invalid step payload: txHash, step, and network are required', code: 400 });
      return;
    }

    const { txHash, step, network } = p as { txHash: string; step: unknown; network: string };
    stepLog.push({ txHash, step, network, receivedAt: Date.now() });
    console.log(`[ghost-steps] Received signed step — txHash: ${txHash}, network: ${network}`);

    res.json({ acknowledged: true, txHash });
  } catch (err) {
    next(err);
  }
});