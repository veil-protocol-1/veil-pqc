import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';
export type RiskLevel = 'low' | 'medium' | 'high';
export type MobileCategory = 'swap' | 'send' | 'earn' | 'query/balance' | 'query/history' | 'pay/x402' | 'clarify';
export type SdkCategory = 'maximize_yield' | 'rebalance' | 'risk_assessment' | 'market_query' | 'x402_payment';
export type WebCategory = 'swap' | 'send' | 'earn' | 'query' | 'pay/x402';

export interface MobileIntent {
  action: string;
  token?: string;
  toToken?: string;
  toAddress?: string;
  toName?: string;
  amount?: string;
  protocol?: string;
  queryType?: string;
  timeframe?: string;
  clarifyReason?: string;
}

export interface MobileExample {
  input: string;
  intent: MobileIntent;
  ghostResponse: string;
  category: MobileCategory;
  difficulty: Difficulty;
}

export interface ExecutionStep {
  action: string;
  from: string;
  to: string;
  amount: number;
  reason: string;
  protocol: string;
  estimatedGas: number;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedApy: number;
  confidence: number;
  riskLevel: RiskLevel;
  warnings: string[];
  marketSignals?: string[];
}

export interface SdkInput {
  intent: SdkCategory;
  portfolio?: Record<string, number>;
  targetAllocation?: Record<string, number>;
  constraints?: Record<string, number>;
  timeframe?: string;
  token?: string;
  amount?: number;
  recipient?: string;
  spendingLimit?: number;
  proposedAction?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface SdkExample {
  input: SdkInput;
  executionPlan: ExecutionPlan;
  category: SdkCategory;
}

export interface WebExample {
  input: string;
  intent: MobileIntent;
  ghostResponse: string;
  category: WebCategory;
  difficulty: Difficulty;
}

// ─── Loaders ───────────────────────────────────────────────────────────────────

function dataPath(filename: string): string {
  return join(__dirname, '..', 'data', filename);
}

export function loadMobileIntents(): MobileExample[] {
  const raw = readFileSync(dataPath('mobile-intents.json'), 'utf-8');
  return JSON.parse(raw) as MobileExample[];
}

export function loadSdkIntents(): SdkExample[] {
  const raw = readFileSync(dataPath('sdk-intents.json'), 'utf-8');
  return JSON.parse(raw) as SdkExample[];
}

export function loadWebIntents(): WebExample[] {
  const raw = readFileSync(dataPath('web-intents.json'), 'utf-8');
  return JSON.parse(raw) as WebExample[];
}

export function loadAllDatasets(): { mobile: MobileExample[]; sdk: SdkExample[]; web: WebExample[] } {
  return {
    mobile: loadMobileIntents(),
    sdk: loadSdkIntents(),
    web: loadWebIntents(),
  };
}
