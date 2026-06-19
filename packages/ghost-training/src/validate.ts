import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { MobileExample, SdkExample, WebExample } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: Record<string, unknown>;
}

function dataPath(file: string): string {
  return join(__dirname, '..', 'data', file);
}

function loadJson<T>(file: string): T {
  const p = dataPath(file);
  if (!existsSync(p)) throw new Error(`File not found: ${p}`);
  return JSON.parse(readFileSync(p, 'utf-8')) as T;
}

function checkDuplicates(inputs: string[], label: string): string[] {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const input of inputs) {
    const key = input.toLowerCase().trim();
    if (seen.has(key)) dupes.push(`[${label}] Duplicate input: "${input.slice(0, 60)}..."`);
    seen.add(key);
  }
  return dupes;
}

function validateMobile(examples: MobileExample[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredFields: (keyof MobileExample)[] = ['input', 'intent', 'ghostResponse', 'category', 'difficulty'];
  const validCategories = new Set(['swap', 'send', 'earn', 'query/balance', 'query/history', 'pay/x402', 'clarify']);
  const validDifficulties = new Set(['easy', 'medium', 'hard']);
  const categoryCounts: Record<string, number> = {};

  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i]!;
    for (const field of requiredFields) {
      if (ex[field] === undefined || ex[field] === null) {
        errors.push(`[mobile][${i}] Missing field: ${field}`);
      }
    }
    if (!validCategories.has(ex.category)) {
      errors.push(`[mobile][${i}] Invalid category: ${ex.category}`);
    }
    if (!validDifficulties.has(ex.difficulty)) {
      errors.push(`[mobile][${i}] Invalid difficulty: ${ex.difficulty}`);
    }
    if (typeof ex.ghostResponse === 'string' && !ex.ghostResponse.includes('Sovereign')) {
      errors.push(`[mobile][${i}] ghostResponse missing "Sovereign": "${ex.ghostResponse.slice(0, 60)}"`);
    }
    if (typeof ex.input !== 'string' || ex.input.trim() === '') {
      errors.push(`[mobile][${i}] Empty input`);
    }
    categoryCounts[ex.category] = (categoryCounts[ex.category] ?? 0) + 1;
  }

  const dupes = checkDuplicates(examples.map(e => e.input), 'mobile');
  errors.push(...dupes);

  const expectedCounts: Record<string, number> = {
    swap: 200, send: 200, earn: 150, 'query/balance': 150,
    'query/history': 100, 'pay/x402': 100, clarify: 100,
  };
  for (const [cat, expected] of Object.entries(expectedCounts)) {
    const actual = categoryCounts[cat] ?? 0;
    if (actual !== expected) {
      warnings.push(`[mobile] Category "${cat}": expected ${expected}, got ${actual}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      total: examples.length,
      categoryCounts,
      duplicates: dupes.length,
    },
  };
}

function validateSdk(examples: SdkExample[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const categoryCounts: Record<string, number> = {};
  const validCategories = new Set(['maximize_yield', 'rebalance', 'risk_assessment', 'market_query', 'x402_payment']);

  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i]!;
    if (!ex.input) errors.push(`[sdk][${i}] Missing input`);
    if (!ex.executionPlan) errors.push(`[sdk][${i}] Missing executionPlan`);
    if (!ex.category) errors.push(`[sdk][${i}] Missing category`);

    if (!validCategories.has(ex.category)) {
      errors.push(`[sdk][${i}] Invalid category: ${ex.category}`);
    }

    if (ex.executionPlan) {
      const plan = ex.executionPlan;
      if (!Array.isArray(plan.steps)) {
        errors.push(`[sdk][${i}] executionPlan.steps must be an array`);
      } else {
        for (let s = 0; s < plan.steps.length; s++) {
          const step = plan.steps[s]!;
          const stepFields = ['action', 'from', 'to', 'amount', 'reason', 'protocol', 'estimatedGas'] as const;
          for (const f of stepFields) {
            if (step[f] === undefined) {
              errors.push(`[sdk][${i}].steps[${s}] Missing field: ${f}`);
            }
          }
        }
      }
      if (typeof plan.confidence !== 'number' || plan.confidence < 0 || plan.confidence > 1) {
        errors.push(`[sdk][${i}] confidence must be between 0 and 1, got ${plan.confidence}`);
      }
      if (!['low', 'medium', 'high'].includes(plan.riskLevel)) {
        errors.push(`[sdk][${i}] Invalid riskLevel: ${plan.riskLevel}`);
      }
    }

    categoryCounts[ex.category] = (categoryCounts[ex.category] ?? 0) + 1;
  }

  for (const cat of validCategories) {
    const actual = categoryCounts[cat] ?? 0;
    if (actual !== 100) {
      warnings.push(`[sdk] Category "${cat}": expected 100, got ${actual}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: { total: examples.length, categoryCounts },
  };
}

function validateWeb(examples: WebExample[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const categoryCounts: Record<string, number> = {};
  const validCategories = new Set(['swap', 'send', 'earn', 'query', 'pay/x402']);

  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i]!;
    const required: (keyof WebExample)[] = ['input', 'intent', 'ghostResponse', 'category', 'difficulty'];
    for (const field of required) {
      if (ex[field] === undefined) errors.push(`[web][${i}] Missing field: ${field}`);
    }
    if (!validCategories.has(ex.category)) {
      errors.push(`[web][${i}] Invalid category: ${ex.category}`);
    }
    if (typeof ex.ghostResponse === 'string' && !ex.ghostResponse.includes('Sovereign')) {
      errors.push(`[web][${i}] ghostResponse missing "Sovereign"`);
    }
    categoryCounts[ex.category] = (categoryCounts[ex.category] ?? 0) + 1;
  }

  const dupes = checkDuplicates(examples.map(e => e.input), 'web');
  errors.push(...dupes);

  for (const cat of validCategories) {
    const actual = categoryCounts[cat] ?? 0;
    if (actual !== 100) {
      warnings.push(`[web] Category "${cat}": expected 100, got ${actual}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: { total: examples.length, categoryCounts, duplicates: dupes.length },
  };
}

function printResult(label: string, result: ValidationResult): void {
  const status = result.valid ? 'PASS' : 'FAIL';
  console.log(`\n[${status}] ${label}`);
  console.log('  Stats:', result.stats);
  if (result.warnings.length > 0) {
    console.log('  Warnings:');
    result.warnings.forEach(w => console.log('   ', w));
  }
  if (result.errors.length > 0) {
    console.log('  Errors:');
    result.errors.slice(0, 20).forEach(e => console.log('   ', e));
    if (result.errors.length > 20) console.log(`   ...and ${result.errors.length - 20} more`);
  }
}

function main(): void {
  console.log('Validating ghost training datasets...');

  const mobile = loadJson<MobileExample[]>('mobile-intents.json');
  const sdk = loadJson<SdkExample[]>('sdk-intents.json');
  const web = loadJson<WebExample[]>('web-intents.json');

  const mobileResult = validateMobile(mobile);
  const sdkResult = validateSdk(sdk);
  const webResult = validateWeb(web);

  printResult('mobile-intents.json', mobileResult);
  printResult('sdk-intents.json', sdkResult);
  printResult('web-intents.json', webResult);

  const allValid = mobileResult.valid && sdkResult.valid && webResult.valid;
  console.log(`\n${allValid ? 'All datasets valid.' : 'Validation failed — see errors above.'}`);
  if (!allValid) process.exit(1);
}

main();

export { validateMobile, validateSdk, validateWeb };
export type { ValidationResult };
