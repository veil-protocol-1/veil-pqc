# Agentic.market Listing

## Name

Veil Protocol

## Tagline

Quantum-resistant payments and private AI for autonomous agents.

## Description

Veil Protocol lets autonomous agents pay each other with quantum-resistant
signatures (ML-DSA-65, x402-pqc) and query Ghost — Veil's private DeFi
inference agent — without leaking instructions or balances, via sealed
FHE execution inside Octra Circles.

## Category

DeFi / Payments / Privacy

## Installation

```bash
npm install @veil/agent-registry
```

or run the MCP server directly:

```bash
npx @veil/agent-registry
```

## Tools

- `veil_sign_payment` — sign quantum-resistant x402-pqc payments
- `veil_verify_payment` — verify x402-pqc payment signatures
- `veil_ghost_query` — private DeFi intent execution via Ghost
- `veil_encrypt_payload` — ML-KEM-768 post-quantum encryption

## Example agent usage

```ts
import { veilFunctions, veilFunctionHandlers } from '@veil/agent-registry/openai';

const result = await veilFunctionHandlers.veil_ghost_query({
  instruction: 'swap 100 USDC for ETH on base',
});
console.log(result.ghostResponse);
```

## Links

- https://veilprotocol.net
- https://veilprotocol.net/docs
