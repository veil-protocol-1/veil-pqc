import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type {
  MobileExample,
  SdkExample,
  WebExample,
  MobileCategory,
  SdkCategory,
  WebCategory,
  Difficulty,
  RiskLevel,
  ExecutionStep,
  ExecutionPlan,
  MobileIntent,
  SdkInput,
} from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Vocabulary ────────────────────────────────────────────────────────────────

const TOKENS = ['ETH', 'USDC', 'USDT', 'BTC', 'VEIL', 'SOL', 'BNB', 'AVAX', 'OP', 'FTM', 'ARB'] as const;
const ADDRESSES = [
  '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
  '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
  '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
  '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
  '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
  '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
  '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
  '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
  '0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
];
const NAMES = ['Alex', 'Jordan', 'Sam', 'Riley', 'Morgan', 'Casey'] as const;
const PROTOCOLS = ['Uniswap', 'Aave', 'Compound', 'Lido', 'Curve', 'Aerodrome'] as const;
const AMOUNTS_SPECIFIC = ['10', '25', '50', '100', '200', '500', '1000', '0.1', '0.5', '1', '2', '5'];
const AMOUNTS_FUZZY = ['half', 'all', 'some', 'a little', 'everything', 'most of it'];
const PERCENTS = ['10%', '25%', '50%', '75%', '100%'];
const APYS = [2.1, 3.4, 4.2, 5.1, 6.3, 7.8, 8.9, 12.1];
const GAS_COSTS = [0.001, 0.002, 0.003, 0.005, 0.008, 0.012];

// ─── Utilities ─────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickTwo<T>(arr: readonly T[]): [T, T] {
  const a = pick(arr);
  let b = pick(arr);
  while (b === a) b = pick(arr);
  return [a, b];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}

function amount(): string {
  return Math.random() < 0.7 ? pick(AMOUNTS_SPECIFIC) : pick(PERCENTS);
}

function sovereignResponse(text: string): string {
  return `Understood, Sovereign. ${text}`;
}

let _uid = 0;
function uid(): string {
  return (++_uid).toString().padStart(6, '0');
}

// ─── Mobile generators ─────────────────────────────────────────────────────────

function genMobileSwap(difficulty: Difficulty): MobileExample {
  const [from, to] = pickTwo(TOKENS);
  const amt = amount();
  const protocol = pick(PROTOCOLS);

  const templates: Record<Difficulty, () => { input: string; intent: MobileIntent }> = {
    easy: () => ({
      input: pick([
        `swap ${amt} ${from} to ${to}`,
        `exchange ${amt} ${from} for ${to}`,
        `convert ${amt} ${from} into ${to}`,
        `trade ${amt} ${from} for ${to}`,
      ]),
      intent: { action: 'swap', token: from, toToken: to, amount: amt },
    }),
    medium: () => ({
      input: pick([
        `get me some ${to}`,
        `i want ${to} for my ${from}`,
        `dump ${amt} ${from} into ${to}`,
        `move ${amt} of my ${from} to ${to}`,
        `flip ${from} to ${to}`,
        `yolo ${amt} ${from} → ${to}`,
      ]),
      intent: { action: 'swap', token: from, toToken: to, amount: amt },
    }),
    hard: () => ({
      input: pick([
        `swap USDC to VEIL via ETH`,
        `get me ${to} from my ${from} bag, use ${protocol}`,
        `hey ghost swap ${amt} ${from} to ${to} when gas is low`,
        `i need ${to} asap, use my ${from}`,
        `turn ${amt} of whatever i have into ${to}`,
        `ape ${amt} ${from} into ${to} on ${protocol}`,
      ]),
      intent: { action: 'swap', token: from, toToken: to, amount: amt },
    }),
  };

  const { input, intent } = templates[difficulty]();
  return {
    input: `${input} ${uid()}`.trimEnd(),
    intent,
    ghostResponse: sovereignResponse(`Preparing to swap ${intent.amount ?? amt} ${from} to ${to}.`),
    category: 'swap',
    difficulty,
  };
}

function genMobileSend(difficulty: Difficulty): MobileExample {
  const token = pick(TOKENS);
  const amt = amount();
  const addr = pick(ADDRESSES);
  const name = pick(NAMES);

  const templates: Record<Difficulty, () => { input: string; intent: MobileIntent }> = {
    easy: () => ({
      input: pick([
        `send ${amt} ${token} to ${addr}`,
        `transfer ${amt} ${token} to ${addr}`,
        `pay ${addr} ${amt} ${token}`,
      ]),
      intent: { action: 'send', token, toAddress: addr, amount: amt },
    }),
    medium: () => ({
      input: pick([
        `send ${name} ${amt} ${token}`,
        `pay ${name} ${amt} bucks in ${token}`,
        `send ${amt} ${token} to my friend ${name}`,
        `transfer half my ${token} to ${addr}`,
      ]),
      intent: { action: 'send', token, toAddress: addr, toName: name, amount: amt },
    }),
    hard: () => ({
      input: pick([
        `hey send ${name} ten bucks`,
        `send everything to ${addr}`,
        `pay ${name} whatever i owe him in ${token}`,
        `just send ${name} some ${token}, you know how much`,
        `wire ${amt} ${token} to ${name} no questions`,
        `split ${amt} ${token} between ${name} and ${pick(NAMES)}`,
      ]),
      intent: { action: 'send', token, toName: name, amount: amt },
    }),
  };

  const { input, intent } = templates[difficulty]();
  return {
    input: `${input} ${uid()}`.trimEnd(),
    intent,
    ghostResponse: sovereignResponse(`Initiating transfer of ${amt} ${token}.`),
    category: 'send',
    difficulty,
  };
}

function genMobileEarn(difficulty: Difficulty): MobileExample {
  const token = pick(TOKENS);
  const protocol = pick(PROTOCOLS);
  const apy = pick(APYS);
  const amt = amount();

  const templates: Record<Difficulty, () => { input: string; intent: MobileIntent }> = {
    easy: () => ({
      input: pick([
        `stake ${amt} ${token} on ${protocol}`,
        `deposit ${amt} ${token} into ${protocol} for yield`,
        `earn yield on my ${token} with ${protocol}`,
        `what's the APY for ${token} on ${protocol}`,
      ]),
      intent: { action: 'earn', token, protocol, amount: amt },
    }),
    medium: () => ({
      input: pick([
        `make my ${token} work for me`,
        `stake half my ${token}`,
        `find me the best yield for ${token}`,
        `put my ${token} to work`,
        `earn passive income on ${token}`,
      ]),
      intent: { action: 'earn', token, amount: amt },
    }),
    hard: () => ({
      input: pick([
        `i want ${apy}% APY, what do i need to do`,
        `just maximize whatever yield you can on my portfolio`,
        `make my money work, idc how`,
        `optimize my earnings across all my tokens`,
        `find me a ${apy}%+ yield on any stablecoin`,
      ]),
      intent: { action: 'earn', token, amount: amt },
    }),
  };

  const { input, intent } = templates[difficulty]();
  return {
    input: `${input} ${uid()}`.trimEnd(),
    intent,
    ghostResponse: sovereignResponse(`Scanning yield opportunities for ${token}. Current best: ${apy}% APY on ${protocol}.`),
    category: 'earn',
    difficulty,
  };
}

function genMobileQueryBalance(difficulty: Difficulty): MobileExample {
  const token = pick(TOKENS);

  const templates: Record<Difficulty, () => { input: string; intent: MobileIntent }> = {
    easy: () => ({
      input: pick([
        `what's my ${token} balance`,
        `how much ${token} do i have`,
        `show me my ${token}`,
        `check my ${token} balance`,
      ]),
      intent: { action: 'query', queryType: 'balance', token },
    }),
    medium: () => ({
      input: pick([
        `what do i have`,
        `show portfolio`,
        `how much is my wallet worth`,
        `what's my total portfolio value`,
        `am i rich yet`,
      ]),
      intent: { action: 'query', queryType: 'balance' },
    }),
    hard: () => ({
      input: pick([
        `what's my net worth rn`,
        `how's the bag looking`,
        `show me everything across all chains`,
        `what's my p&l today`,
        `how much am i up or down`,
      ]),
      intent: { action: 'query', queryType: 'balance' },
    }),
  };

  const { input, intent } = templates[difficulty]();
  return {
    input: `${input} ${uid()}`.trimEnd(),
    intent,
    ghostResponse: sovereignResponse(`Fetching your ${token ? token + ' ' : ''}balance now.`),
    category: 'query/balance',
    difficulty,
  };
}

function genMobileQueryHistory(difficulty: Difficulty): MobileExample {
  const token = pick(TOKENS);
  const timeframes = ['today', 'this week', 'last 7 days', 'this month', 'yesterday'];
  const tf = pick(timeframes);

  const templates: Record<Difficulty, () => { input: string; intent: MobileIntent }> = {
    easy: () => ({
      input: pick([
        `show my transaction history`,
        `show my recent swaps`,
        `what transactions did i make ${tf}`,
        `list my ${token} transactions`,
      ]),
      intent: { action: 'query', queryType: 'history', token, timeframe: tf },
    }),
    medium: () => ({
      input: pick([
        `what did ghost do lately`,
        `show me what happened ${tf}`,
        `recap my activity ${tf}`,
        `what moves did i make this week`,
      ]),
      intent: { action: 'query', queryType: 'history', timeframe: tf },
    }),
    hard: () => ({
      input: pick([
        `pull up my trade history`,
        `what did you do while i was sleeping`,
        `show me everything ghost executed`,
        `give me a full rundown of my on-chain activity`,
      ]),
      intent: { action: 'query', queryType: 'history' },
    }),
  };

  const { input, intent } = templates[difficulty]();
  return {
    input: `${input} ${uid()}`.trimEnd(),
    intent,
    ghostResponse: sovereignResponse(`Retrieving your transaction history${tf ? ' for ' + tf : ''}.`),
    category: 'query/history',
    difficulty,
  };
}

function genMobilePayX402(difficulty: Difficulty): MobileExample {
  const amt = amount();
  const token = pick(['USDC', 'USDT', 'ETH'] as const);

  const templates: Record<Difficulty, () => { input: string; intent: MobileIntent }> = {
    easy: () => ({
      input: pick([
        `pay for this API call with ${token}`,
        `authorize ${amt} ${token} for this service`,
        `spend ${amt} ${token} on this request`,
        `pay ${amt} ${token} via x402`,
      ]),
      intent: { action: 'pay', token, amount: amt, protocol: 'x402' },
    }),
    medium: () => ({
      input: pick([
        `authorize ghost to spend up to ${amt} ${token}`,
        `set a spending limit of ${amt} ${token}`,
        `let ghost pay for API calls automatically`,
        `enable auto-payments up to ${amt} ${token}`,
      ]),
      intent: { action: 'pay', token, amount: amt, protocol: 'x402' },
    }),
    hard: () => ({
      input: pick([
        `just pay for it`,
        `handle the payment ghost`,
        `take care of the bill`,
        `pay whatever it costs`,
        `approve the transaction`,
      ]),
      intent: { action: 'pay', token, protocol: 'x402' },
    }),
  };

  const { input, intent } = templates[difficulty]();
  return {
    input: `${input} ${uid()}`.trimEnd(),
    intent,
    ghostResponse: sovereignResponse(`Processing x402 payment of ${amt} ${token}.`),
    category: 'pay/x402',
    difficulty,
  };
}

function genMobileClarify(difficulty: Difficulty): MobileExample {
  const token = pick(TOKENS);
  const [from, to] = pickTwo(TOKENS);

  const ambiguousInputs = [
    `swap some tokens`,
    `move my stuff`,
    `do the thing with ${token}`,
    `make a trade`,
    `send it`,
    `stake`,
    `earn`,
    `pay`,
    `do a swap`,
    `transfer`,
    `i want to swap`,
    `buy ${token}`,
    `sell`,
    `exchange`,
    `convert my holdings`,
    `move ${from} somewhere`,
    `yield farm`,
    `stake my tokens`,
    `send some crypto`,
    `make a payment`,
  ];

  const clarifyQuestions = [
    `How much ${token} would you like to swap, Sovereign?`,
    `Which token would you like to receive in exchange for ${from}, Sovereign?`,
    `What amount would you like to transfer, Sovereign?`,
    `Could you specify the destination address or recipient, Sovereign?`,
    `Which protocol would you prefer for staking, Sovereign?`,
    `What token would you like to earn yield on, Sovereign?`,
    `Which token should I sell, Sovereign?`,
    `What is the target token for this conversion, Sovereign?`,
    `Please specify the amount and destination, Sovereign.`,
    `I need more details — which asset and how much, Sovereign?`,
  ];

  const input = pick(ambiguousInputs);
  const clarifyQ = pick(clarifyQuestions);

  return {
    input: `${input} ${uid()}`.trimEnd(),
    intent: { action: 'clarify', token, clarifyReason: 'ambiguous_input' },
    ghostResponse: `Ghost needs clarification, Sovereign. ${clarifyQ}`,
    category: 'clarify',
    difficulty,
  };
}

// ─── Mobile dataset builder ────────────────────────────────────────────────────

function buildMobileDataset(): MobileExample[] {
  const examples: MobileExample[] = [];

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  // swap: 200
  for (let i = 0; i < 200; i++) examples.push(genMobileSwap(difficulties[i % 3]!));
  // send: 200
  for (let i = 0; i < 200; i++) examples.push(genMobileSend(difficulties[i % 3]!));
  // earn: 150
  for (let i = 0; i < 150; i++) examples.push(genMobileEarn(difficulties[i % 3]!));
  // query/balance: 150
  for (let i = 0; i < 150; i++) examples.push(genMobileQueryBalance(difficulties[i % 3]!));
  // query/history: 100
  for (let i = 0; i < 100; i++) examples.push(genMobileQueryHistory(difficulties[i % 3]!));
  // pay/x402: 100
  for (let i = 0; i < 100; i++) examples.push(genMobilePayX402(difficulties[i % 3]!));
  // clarify: 100
  for (let i = 0; i < 100; i++) examples.push(genMobileClarify(difficulties[i % 3]!));

  return examples;
}

// ─── SDK generators ────────────────────────────────────────────────────────────

function makeStep(action: string, from: string, to: string, amount: number): ExecutionStep {
  const [fromApy, toApy] = [pick(APYS), pick(APYS)];
  return {
    action,
    from,
    to,
    amount,
    reason: `${to} yield ${toApy}% > ${from} ${fromApy}%`,
    protocol: pick(PROTOCOLS).toLowerCase().replace(' ', '-'),
    estimatedGas: pick(GAS_COSTS),
  };
}

function genSdkMaximizeYield(): SdkExample {
  const tokens = pickN(TOKENS, 3);
  const portfolio: Record<string, number> = {};
  tokens.forEach(t => { portfolio[t] = parseFloat(pick(AMOUNTS_SPECIFIC)); });

  const steps: ExecutionStep[] = tokens.slice(0, 2).map((t, i) =>
    makeStep('deposit', t, tokens[i + 1] ?? 'ETH', portfolio[t] ?? 100)
  );

  const plan: ExecutionPlan = {
    steps,
    estimatedApy: parseFloat((Math.random() * 8 + 2).toFixed(2)),
    confidence: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
    riskLevel: pick(['low', 'medium', 'high'] as RiskLevel[]),
    warnings: [],
  };

  const input: SdkInput = {
    intent: 'maximize_yield',
    portfolio,
    constraints: { max_slippage: parseFloat((Math.random() * 1).toFixed(2)), gas_limit: parseFloat(pick(AMOUNTS_SPECIFIC)) },
    timeframe: pick(['1d', '7d', '30d', '90d']),
  };

  return { input, executionPlan: plan, category: 'maximize_yield' };
}

function genSdkRebalance(): SdkExample {
  const tokens = pickN(TOKENS, 4);
  const portfolio: Record<string, number> = {};
  tokens.forEach(t => { portfolio[t] = parseFloat(pick(AMOUNTS_SPECIFIC)); });

  const totalPct = 100;
  const perToken = Math.floor(totalPct / tokens.length);
  const targetAllocation: Record<string, number> = {};
  tokens.forEach((t, i) => { targetAllocation[t] = i === tokens.length - 1 ? totalPct - perToken * (tokens.length - 1) : perToken; });

  const steps: ExecutionStep[] = tokens.slice(0, 2).map((t) =>
    makeStep('swap', t, pick(TOKENS), portfolio[t] ?? 100)
  );

  const plan: ExecutionPlan = {
    steps,
    estimatedApy: parseFloat((Math.random() * 5 + 1).toFixed(2)),
    confidence: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
    riskLevel: 'low',
    warnings: Math.random() > 0.7 ? ['Slippage may exceed 0.5% on low-liquidity pairs'] : [],
  };

  return {
    input: {
      intent: 'rebalance',
      portfolio,
      targetAllocation,
      constraints: { max_slippage: 0.5, gas_limit: 50 },
    },
    executionPlan: plan,
    category: 'rebalance',
  };
}

function genSdkRiskAssessment(): SdkExample {
  const [from, to] = pickTwo(TOKENS);
  const amt = parseFloat(pick(AMOUNTS_SPECIFIC));
  const riskLevel: RiskLevel = pick(['low', 'medium', 'high']);

  const warnings: string[] = [];
  if (riskLevel === 'high') warnings.push(`High slippage expected for ${from}→${to} pair`);
  if (riskLevel !== 'low') warnings.push('Liquidity depth below recommended threshold');

  const plan: ExecutionPlan = {
    steps: [makeStep('assess', from, to, amt)],
    estimatedApy: 0,
    confidence: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
    riskLevel,
    warnings,
  };

  return {
    input: {
      intent: 'risk_assessment',
      proposedAction: { action: 'swap', from, to, amount: amt },
      portfolio: { [from]: amt },
    },
    executionPlan: plan,
    category: 'risk_assessment',
  };
}

function genSdkMarketQuery(): SdkExample {
  const token = pick(TOKENS);
  const signals = ['bullish momentum', 'high volume', 'price consolidation', 'breakout pattern', 'oversold RSI'];

  const plan: ExecutionPlan = {
    steps: [],
    estimatedApy: 0,
    confidence: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
    riskLevel: 'low',
    warnings: [],
    marketSignals: [pick(signals), pick(signals)],
  };

  return {
    input: {
      intent: 'market_query',
      token,
      context: { timeframe: pick(['1h', '4h', '1d', '7d']), indicators: ['RSI', 'MACD', 'Volume'] },
    },
    executionPlan: plan,
    category: 'market_query',
  };
}

function genSdkX402Payment(): SdkExample {
  const token = pick(['USDC', 'USDT', 'ETH'] as const);
  const amt = parseFloat(pick(AMOUNTS_SPECIFIC));

  const plan: ExecutionPlan = {
    steps: [{
      action: 'pay',
      from: token,
      to: 'service',
      amount: amt,
      reason: 'x402 API payment authorization',
      protocol: 'x402',
      estimatedGas: pick(GAS_COSTS),
    }],
    estimatedApy: 0,
    confidence: 0.99,
    riskLevel: 'low',
    warnings: [],
  };

  return {
    input: {
      intent: 'x402_payment',
      token,
      amount: amt,
      recipient: pick(ADDRESSES),
      spendingLimit: amt * 10,
    },
    executionPlan: plan,
    category: 'x402_payment',
  };
}

function buildSdkDataset(): SdkExample[] {
  const examples: SdkExample[] = [];
  for (let i = 0; i < 100; i++) examples.push(genSdkMaximizeYield());
  for (let i = 0; i < 100; i++) examples.push(genSdkRebalance());
  for (let i = 0; i < 100; i++) examples.push(genSdkRiskAssessment());
  for (let i = 0; i < 100; i++) examples.push(genSdkMarketQuery());
  for (let i = 0; i < 100; i++) examples.push(genSdkX402Payment());
  return examples;
}

// ─── Web generators ────────────────────────────────────────────────────────────

function genWebSwap(): WebExample {
  const [from, to] = pickTwo(TOKENS);
  const amt = pick(AMOUNTS_SPECIFIC);
  const protocol = pick(PROTOCOLS);

  const inputs = [
    `I would like to swap ${amt} ${from} for ${to} using ${protocol}`,
    `Please execute a ${from} to ${to} swap for ${amt} tokens`,
    `Convert ${amt} ${from} to ${to} at the current market rate`,
    `I'd like to exchange my ${from} position of ${amt} for ${to}`,
    `Execute a token swap: ${amt} ${from} → ${to} via ${protocol}`,
    `Swap ${amt} ${from} tokens for ${to} with a maximum slippage of 0.5%`,
  ];

  return {
    input: `${pick(inputs)} ${uid()}`.trimEnd(),
    intent: { action: 'swap', token: from, toToken: to, amount: amt },
    ghostResponse: sovereignResponse(`I will execute a swap of ${amt} ${from} to ${to} via ${protocol}.`),
    category: 'swap',
    difficulty: 'easy',
  };
}

function genWebSend(): WebExample {
  const token = pick(TOKENS);
  const amt = pick(AMOUNTS_SPECIFIC);
  const addr = pick(ADDRESSES);

  const inputs = [
    `Please transfer ${amt} ${token} to address ${addr}`,
    `Send ${amt} ${token} to the wallet at ${addr}`,
    `Initiate a transfer of ${amt} ${token} to ${addr}`,
    `I need to send ${amt} ${token} to this address: ${addr}`,
    `Transfer ${amt} ${token} to recipient ${addr}`,
    `Execute an on-chain transfer: ${amt} ${token} to ${addr}`,
  ];

  return {
    input: `${pick(inputs)} ${uid()}`.trimEnd(),
    intent: { action: 'send', token, toAddress: addr, amount: amt },
    ghostResponse: sovereignResponse(`I will transfer ${amt} ${token} to ${addr}.`),
    category: 'send',
    difficulty: 'easy',
  };
}

function genWebEarn(): WebExample {
  const token = pick(TOKENS);
  const protocol = pick(PROTOCOLS);
  const apy = pick(APYS);
  const amt = pick(AMOUNTS_SPECIFIC);

  const inputs = [
    `What is the current ${token} yield on ${protocol}?`,
    `I would like to stake ${amt} ${token} on ${protocol} for yield`,
    `Please deposit ${amt} ${token} into ${protocol}'s liquidity pool`,
    `Show me the available APY rates for ${token} across protocols`,
    `I want to optimize my ${token} yield using ${protocol}`,
    `Stake ${amt} ${token} on ${protocol} — current APY is ${apy}%`,
  ];

  return {
    input: `${pick(inputs)} ${uid()}`.trimEnd(),
    intent: { action: 'earn', token, protocol, amount: amt },
    ghostResponse: sovereignResponse(`I will deposit ${amt} ${token} into ${protocol}. Current estimated APY: ${apy}%.`),
    category: 'earn',
    difficulty: 'easy',
  };
}

function genWebQuery(): WebExample {
  const token = pick(TOKENS);

  const inputs = [
    `What is my current ${token} balance?`,
    `Please display my complete portfolio breakdown`,
    `Show me my current holdings and their USD value`,
    `What is the total value of my portfolio in USD?`,
    `Display my ${token} position and unrealized P&L`,
    `I'd like to review my transaction history for this month`,
    `Show all swaps executed in the past 7 days`,
    `What is the current allocation of my portfolio?`,
  ];

  return {
    input: `${pick(inputs)} ${uid()}`.trimEnd(),
    intent: { action: 'query', queryType: 'balance', token },
    ghostResponse: sovereignResponse(`Retrieving your ${token} portfolio data now.`),
    category: 'query',
    difficulty: 'easy',
  };
}

function genWebPayX402(): WebExample {
  const token = pick(['USDC', 'USDT', 'ETH'] as const);
  const amt = pick(AMOUNTS_SPECIFIC);

  const inputs = [
    `Authorize an x402 payment of ${amt} ${token} for this API request`,
    `Please process the x402 payment using ${token}`,
    `I would like to set a spending limit of ${amt} ${token} for automated payments`,
    `Enable Ghost to autonomously handle x402 payments up to ${amt} ${token}`,
    `Approve the x402 payment protocol with a ${amt} ${token} budget`,
    `Configure automated API payments: max ${amt} ${token} per request`,
  ];

  return {
    input: `${pick(inputs)} ${uid()}`.trimEnd(),
    intent: { action: 'pay', token, amount: amt, protocol: 'x402' },
    ghostResponse: sovereignResponse(`x402 payment of ${amt} ${token} has been authorized.`),
    category: 'pay/x402',
    difficulty: 'easy',
  };
}

function buildWebDataset(): WebExample[] {
  const examples: WebExample[] = [];
  for (let i = 0; i < 100; i++) examples.push(genWebSwap());
  for (let i = 0; i < 100; i++) examples.push(genWebSend());
  for (let i = 0; i < 100; i++) examples.push(genWebEarn());
  for (let i = 0; i < 100; i++) examples.push(genWebQuery());
  for (let i = 0; i < 100; i++) examples.push(genWebPayX402());
  return examples;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function main(): void {
  const dataDir = join(__dirname, '..', 'data');
  mkdirSync(dataDir, { recursive: true });

  console.log('Generating mobile-intents.json...');
  const mobile = buildMobileDataset();
  writeFileSync(join(dataDir, 'mobile-intents.json'), JSON.stringify(mobile, null, 2));
  const mobileCounts: Partial<Record<MobileCategory, number>> = {};
  for (const ex of mobile) mobileCounts[ex.category] = (mobileCounts[ex.category] ?? 0) + 1;
  console.log('  Mobile counts:', mobileCounts);
  console.log(`  Total: ${mobile.length}`);

  console.log('\nGenerating sdk-intents.json...');
  const sdk = buildSdkDataset();
  writeFileSync(join(dataDir, 'sdk-intents.json'), JSON.stringify(sdk, null, 2));
  const sdkCounts: Partial<Record<SdkCategory, number>> = {};
  for (const ex of sdk) sdkCounts[ex.category] = (sdkCounts[ex.category] ?? 0) + 1;
  console.log('  SDK counts:', sdkCounts);
  console.log(`  Total: ${sdk.length}`);

  console.log('\nGenerating web-intents.json...');
  const web = buildWebDataset();
  writeFileSync(join(dataDir, 'web-intents.json'), JSON.stringify(web, null, 2));
  const webCounts: Partial<Record<WebCategory, number>> = {};
  for (const ex of web) webCounts[ex.category] = (webCounts[ex.category] ?? 0) + 1;
  console.log('  Web counts:', webCounts);
  console.log(`  Total: ${web.length}`);

  console.log('\nDone. Files written to', dataDir);
}

main();
