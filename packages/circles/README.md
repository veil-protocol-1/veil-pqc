# @veil_/circles

Octra Circle interface for private agent execution.

Circles are sealed FHE (Fully Homomorphic Encryption) execution environments on the [Octra blockchain](https://octra.org). Computation inside a Circle happens encrypted — no node in the network can observe inputs, outputs, or intermediate state.

Veil uses Circles for three things:

1. **Agent instruction execution** — private multi-step DeFi routing that no observer can reconstruct
2. **Key management** — PQC keypairs (ML-DSA-65 + ML-KEM-768) managed inside FHE environments
3. **VeilLM inference** — agent queries processed privately across nodes

---

## Current status (honest)

| Feature | Status |
|---|---|
| Octra testnet RPC (`getBalance`, `getNetworkInfo`) | **Real** — hits `https://octra.network` |
| Transaction signing (ML-DSA-65 layer) | **Real** — PQC identity layer over Octra wire format |
| Circle deployment | **Mocked** — requires `light-node` CLI, no REST API yet |
| Circle execution (`program.call` / `program.view`) | **Mocked** — browser-native API, no Node.js path yet |
| VeilLM inference | **Mocked** — distributed inference network not yet live |
| Spending limit enforcement | **Real** — in TypeScript before Circle layer |

This follows the same pattern as `@veil_/auth`'s ZK mock: the interface is complete and correct so downstream code can be built and tested today. When Octra's SDK ships a Node.js deploy path and `program.call` becomes accessible remotely, the mocks become real by filling in the TODO sections.

---

## Architecture

```
User instruction (natural language)
        │
        ▼
VeilLMClient.parseIntent()          ← mocked; will be Circle inference
        │
        ▼
AgentCircle.executeInstruction()    ← spending limits enforced here (real)
        │
        ▼
AgentCircle.submitExecution()       ← Circle.execute() mocked
        │
        ▼
Octra Circle (sealed FHE env)       ← window.OctraCircle.request() browser API
        │
        ▼
DeFi protocol (Uniswap, Aave, ...)
```

### PQC + Octra integration

```
@veil_/pqc-wallet                @veil_/circles               Octra testnet
─────────────────               ─────────────               ─────────────
generatePQCKeypair()     ──►    OctraClient(url, keypair)
                                    │
                                    ├── getNetworkInfo()  ──►  GET /staging
                                    ├── getBalance(addr)  ──►  GET /balance/{addr}
                                    └── sendTransaction() ──►  POST /send-tx
                                             │
                                        ML-DSA-65 sign (PQC identity layer)
                                        TODO: Ed25519 for vanilla testnet compat
```

### Circle deployment (today vs. when Octra SDK ships)

**Today**: circle.json + program source → compile via `octra build` → deploy via `light-node`. The deploy receipt contains the Circle address. `deployCircle()` mocks this and returns a Circle handle with a deterministic address.

**When SDK ships**: replace the `TODO` in `circle.ts:deployCircle()` with a Node.js SDK call. The returned `Circle` type and all downstream code stays identical.

---

## Usage

```typescript
import { OctraClient, createAgentCircle, OCTRA_TESTNET_URL } from '@veil_/circles';
import { generatePQCKeypair } from '@veil_/pqc-wallet';

// Create an Octra RPC client
const keypair = generatePQCKeypair();
const client = new OctraClient(OCTRA_TESTNET_URL, keypair);

// Check testnet connectivity
const info = await client.getNetworkInfo();
console.log(`Testnet reachable: ${info.reachable}, latency: ${info.latencyMs}ms`);

// Get balance (returns μOCT — 1 OCT = 1_000_000 μOCT)
const balance = await client.getBalance(keypair.address);
console.log(`Balance: ${balance / 1_000_000n} OCT`);

// Create an agent Circle with spending limits
const agent = await createAgentCircle({
  agentId: 'my-defi-agent',
  allowedProtocols: ['uniswap', 'aave'],
  spendingLimits: {
    maxPerTx: 100_000_000n,    // 100 OCT
    maxPerDay: 1_000_000_000n, // 1000 OCT
    maxTotal: 10_000_000_000n, // 10,000 OCT
  },
  keypair,
});

// Parse a natural language instruction into an execution plan
const plan = await agent.executeInstruction('swap 1 ETH for USDC on uniswap');
console.log(`Plan: ${plan.steps.length} steps, ~${plan.estimatedCost} μOCT`);

// Submit for execution (respects spending limits)
const result = await agent.submitExecution(plan);
console.log(`Executed: txHashes=${result.txHashes}`);
```

---

## What becomes real as Octra SDK matures

1. **`deployCircle()` in `circle.ts`** — replace the `TODO` body with an Octra SDK deploy call. The function signature and return type stay the same.

2. **`Circle.execute()` in `circle.ts`** — replace the mock with a call to Octra's Node.js RPC path for `program.call` / `program.view` (currently only available in the browser via `window.OctraCircle.request()`).

3. **`VeilLMClient.query()` in `inference.ts`** — replace the pattern-matching mock with a real Circle RPC call that routes the prompt through VeilLM distributed inference.

4. **`OctraClient.sendTransaction()` in `client.ts`** — add Ed25519 (NaCl) signing alongside the current ML-DSA-65 PQC layer so transactions are accepted by vanilla Octra testnet nodes.

---

## Octra Circle reference

Circle programs are written in AppliedML (.aml) or Rust (compiled to WASM). A minimal AML counter:

```
contract CircleCounter {
  state { counter: int }
  constructor() { self.counter = 0 }
  public view fn get_counter(): int { return self.counter }
  public fn inc(): int {
    self.counter += 1
    return self.counter
  }
}
```

Deployed via `circle.json` with `privacy_class: "sealed"`. Once deployed, programs are interacted with via `window.OctraCircle.request('program.call', { method, params, amount, ou })` inside the Circle's browser environment.

See [octra-labs/circle_examples](https://github.com/octra-labs/circle_examples) for working examples.
