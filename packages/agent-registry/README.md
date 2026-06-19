# @veil_/agent-registry

Agent-callable wrappers for Veil Protocol — quantum-resistant payments ([x402-pqc](https://www.npmjs.com/package/@veil_/x402-pqc)) and private Ghost AI inference ([circles](https://www.npmjs.com/package/@veil_/circles)). Ships as an MCP server, LangChain tools, OpenAI functions, and a REST API.

## Tools

| Tool | Algorithm | What it does |
|---|---|---|
| `veil_sign_payment` | ML-DSA-65 | Sign a quantum-resistant x402-pqc payment |
| `veil_verify_payment` | ML-DSA-65 | Verify a PQC payment signature |
| `veil_ghost_query` | FHE (Octra Circles) | Private DeFi intent parsing via Ghost AI |
| `veil_encrypt_payload` | ML-KEM-768 | Encrypt a payload with post-quantum KEM |

## Install

```bash
npm install @veil_/agent-registry
```

## MCP server (Claude Desktop, Cursor, etc.)

```bash
npx @veil_/agent-registry
```

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "veil-protocol": {
      "command": "npx",
      "args": ["@veil_/agent-registry"]
    }
  }
}
```

## LangChain

```ts
import { veilTools } from '@veil_/agent-registry/langchain';
import { ChatAnthropic } from '@langchain/anthropic';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const llm = new ChatAnthropic({ model: 'claude-sonnet-4-6' });
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a DeFi agent with access to Veil Protocol tools.'],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

const agent = await createToolCallingAgent({ llm, tools: veilTools, prompt });
const executor = new AgentExecutor({ agent, tools: veilTools });

const result = await executor.invoke({
  input: 'Sign a 12.50 USDC payment to 0xabc123... on base-sepolia',
});
```

## OpenAI function calling

```ts
import { veilFunctions, veilFunctionHandlers } from '@veil_/agent-registry/openai';

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Encrypt my wallet address with ML-KEM-768' }],
  tools: veilFunctions.map(f => ({ type: 'function', function: f })),
});

const call = response.choices[0].message.tool_calls?.[0];
if (call && call.function.name in veilFunctionHandlers) {
  const args = JSON.parse(call.function.arguments);
  const result = await veilFunctionHandlers[call.function.name as keyof typeof veilFunctionHandlers](args as any);
}
```

## REST API

```ts
import { createApp } from '@veil_/agent-registry';

const app = createApp();
app.listen(3000);
// POST /tools/sign-payment
// POST /tools/verify-payment
// POST /tools/ghost-query
// POST /tools/encrypt-payload
```

## License

Apache-2.0
