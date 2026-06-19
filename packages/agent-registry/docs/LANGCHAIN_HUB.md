# Submitting to LangChain Hub

## Package

`@veil/agent-registry` — import from `@veil/agent-registry/langchain`

## Description

Four `StructuredTool` implementations wrapping Veil Protocol's quantum-resistant
x402-pqc payment standard and Ghost, Veil's private DeFi AI that runs inside
sealed Octra Circles (FHE).

## Installation

```bash
npm install @veil/agent-registry
```

## Tools

- `VeilSignPaymentTool` (`veil_sign_payment`) — sign quantum-resistant ML-DSA-65 payments
- `VeilVerifyPaymentTool` (`veil_verify_payment`) — verify x402-pqc signatures
- `VeilGhostQueryTool` (`veil_ghost_query`) — private DeFi intent parsing via Ghost
- `VeilEncryptPayloadTool` (`veil_encrypt_payload`) — ML-KEM-768 encryption

## Example agent usage

```ts
import { ChatOpenAI } from '@langchain/openai';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { veilTools } from '@veil/agent-registry/langchain';

const llm = new ChatOpenAI({ model: 'gpt-4o' });
const agent = await createToolCallingAgent({ llm, tools: veilTools, prompt });
const executor = new AgentExecutor({ agent, tools: veilTools });

await executor.invoke({
  input: 'Sign a 12.50 USDC payment to 0xabc... on base-sepolia',
});
```

## Links

- https://veilprotocol.net
- https://veilprotocol.net/docs