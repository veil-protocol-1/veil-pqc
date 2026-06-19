import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { MobileExample, SdkExample, WebExample } from '../src/index.js';
import { validateMobile, validateSdk, validateWeb } from '../src/validate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA, file), 'utf-8')) as T;
}

beforeAll(() => {
  execSync('tsx src/generate.ts', { cwd: ROOT, stdio: 'inherit' });
});

// ─── File existence ─────────────────────────────────────────────────────────────

describe('generated files', () => {
  it('mobile-intents.json exists', () => {
    expect(existsSync(join(DATA, 'mobile-intents.json'))).toBe(true);
  });

  it('sdk-intents.json exists', () => {
    expect(existsSync(join(DATA, 'sdk-intents.json'))).toBe(true);
  });

  it('web-intents.json exists', () => {
    expect(existsSync(join(DATA, 'web-intents.json'))).toBe(true);
  });
});

// ─── Mobile dataset ─────────────────────────────────────────────────────────────

describe('mobile-intents.json', () => {
  let mobile: MobileExample[];
  beforeAll(() => { mobile = loadJson<MobileExample[]>('mobile-intents.json'); });

  it('contains exactly 1000 examples', () => {
    expect(mobile).toHaveLength(1000);
  });

  it('swap category has 200 examples', () => {
    expect(mobile.filter(e => e.category === 'swap')).toHaveLength(200);
  });

  it('send category has 200 examples', () => {
    expect(mobile.filter(e => e.category === 'send')).toHaveLength(200);
  });

  it('earn category has 150 examples', () => {
    expect(mobile.filter(e => e.category === 'earn')).toHaveLength(150);
  });

  it('query/balance category has 150 examples', () => {
    expect(mobile.filter(e => e.category === 'query/balance')).toHaveLength(150);
  });

  it('query/history category has 100 examples', () => {
    expect(mobile.filter(e => e.category === 'query/history')).toHaveLength(100);
  });

  it('pay/x402 category has 100 examples', () => {
    expect(mobile.filter(e => e.category === 'pay/x402')).toHaveLength(100);
  });

  it('clarify category has 100 examples', () => {
    expect(mobile.filter(e => e.category === 'clarify')).toHaveLength(100);
  });

  it('all examples have required fields', () => {
    for (const ex of mobile) {
      expect(ex.input).toBeDefined();
      expect(ex.intent).toBeDefined();
      expect(ex.ghostResponse).toBeDefined();
      expect(ex.category).toBeDefined();
      expect(ex.difficulty).toBeDefined();
    }
  });

  it('all ghost responses contain "Sovereign"', () => {
    for (const ex of mobile) {
      expect(ex.ghostResponse).toMatch(/Sovereign/);
    }
  });

  it('no duplicate inputs', () => {
    const inputs = mobile.map(e => e.input.toLowerCase().trim());
    const unique = new Set(inputs);
    expect(unique.size).toBe(mobile.length);
  });

  it('all difficulties are valid', () => {
    const valid = new Set(['easy', 'medium', 'hard']);
    for (const ex of mobile) {
      expect(valid.has(ex.difficulty)).toBe(true);
    }
  });

  it('no empty inputs', () => {
    for (const ex of mobile) {
      expect(ex.input.trim().length).toBeGreaterThan(0);
    }
  });

  it('passes validateMobile with no errors', () => {
    const result = validateMobile(mobile);
    expect(result.errors).toHaveLength(0);
  });
});

// ─── SDK dataset ────────────────────────────────────────────────────────────────

describe('sdk-intents.json', () => {
  let sdk: SdkExample[];
  beforeAll(() => { sdk = loadJson<SdkExample[]>('sdk-intents.json'); });

  it('contains exactly 500 examples', () => {
    expect(sdk).toHaveLength(500);
  });

  it('each SDK category has 100 examples', () => {
    const cats = ['maximize_yield', 'rebalance', 'risk_assessment', 'market_query', 'x402_payment'];
    for (const cat of cats) {
      expect(sdk.filter(e => e.category === cat)).toHaveLength(100);
    }
  });

  it('all examples have input, executionPlan, category', () => {
    for (const ex of sdk) {
      expect(ex.input).toBeDefined();
      expect(ex.executionPlan).toBeDefined();
      expect(ex.category).toBeDefined();
    }
  });

  it('all execution plan steps have valid structure', () => {
    for (const ex of sdk) {
      for (const step of ex.executionPlan.steps) {
        expect(step.action).toBeDefined();
        expect(step.from).toBeDefined();
        expect(step.to).toBeDefined();
        expect(typeof step.amount).toBe('number');
        expect(step.reason).toBeDefined();
        expect(step.protocol).toBeDefined();
        expect(typeof step.estimatedGas).toBe('number');
      }
    }
  });

  it('all confidence scores are between 0 and 1', () => {
    for (const ex of sdk) {
      expect(ex.executionPlan.confidence).toBeGreaterThanOrEqual(0);
      expect(ex.executionPlan.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('all riskLevels are valid', () => {
    const valid = new Set(['low', 'medium', 'high']);
    for (const ex of sdk) {
      expect(valid.has(ex.executionPlan.riskLevel)).toBe(true);
    }
  });

  it('warnings field is always an array', () => {
    for (const ex of sdk) {
      expect(Array.isArray(ex.executionPlan.warnings)).toBe(true);
    }
  });

  it('passes validateSdk with no errors', () => {
    const result = validateSdk(sdk);
    expect(result.errors).toHaveLength(0);
  });
});

// ─── Web dataset ────────────────────────────────────────────────────────────────

describe('web-intents.json', () => {
  let web: WebExample[];
  beforeAll(() => { web = loadJson<WebExample[]>('web-intents.json'); });

  it('contains exactly 500 examples', () => {
    expect(web).toHaveLength(500);
  });

  it('each web category has 100 examples', () => {
    const cats = ['swap', 'send', 'earn', 'query', 'pay/x402'];
    for (const cat of cats) {
      expect(web.filter(e => e.category === cat)).toHaveLength(100);
    }
  });

  it('all ghost responses contain "Sovereign"', () => {
    for (const ex of web) {
      expect(ex.ghostResponse).toMatch(/Sovereign/);
    }
  });

  it('no duplicate inputs', () => {
    const inputs = web.map(e => e.input.toLowerCase().trim());
    const unique = new Set(inputs);
    expect(unique.size).toBe(web.length);
  });

  it('all examples have required fields', () => {
    for (const ex of web) {
      expect(ex.input).toBeDefined();
      expect(ex.intent).toBeDefined();
      expect(ex.ghostResponse).toBeDefined();
      expect(ex.category).toBeDefined();
      expect(ex.difficulty).toBeDefined();
    }
  });

  it('passes validateWeb with no errors', () => {
    const result = validateWeb(web);
    expect(result.errors).toHaveLength(0);
  });
});

// ─── Cross-dataset ──────────────────────────────────────────────────────────────

describe('cross-dataset', () => {
  it('total training examples across all datasets is 2000', () => {
    const mobile = loadJson<MobileExample[]>('mobile-intents.json');
    const sdk = loadJson<SdkExample[]>('sdk-intents.json');
    const web = loadJson<WebExample[]>('web-intents.json');
    expect(mobile.length + sdk.length + web.length).toBe(2000);
  });
});
