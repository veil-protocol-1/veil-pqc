import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { CircleSession, getRpcMode } from '@veil_/circles';

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

type IntentAction = 'swap' | 'send' | 'earn' | 'stake' | 'query' | 'pay' | 'clarify';

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
      'Could you clarify your intent, Sovereign? I can help you swap, send, earn, stake, or check your balance.';
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
    case 'clarify':
      return intent.message ?? 'Understood, Sovereign. How may I assist you further?';
    default:
      return 'Understood, Sovereign. How may I assist you further?';
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const ghostRouter = Router();

ghostRouter.post('/query', ghostRateLimiter, async (req, res, next) => {
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

ghostRouter.post('/intent', ghostRateLimiter, (req, res, next) => {
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

    const { intent, confidence } = parseGhostIntent(message);
    const ghostResponse = buildGhostResponse(intent);

    res.json({
      intent,
      confidence,
      raw: message,
      ghostResponse,
    });
  } catch (err) {
    next(err);
  }
});