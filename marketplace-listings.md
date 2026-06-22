# Veil Protocol — AI Agent Marketplace Listings

Source of truth: `packages/agent-registry/src`. All snippets verified against the actual
exported API. Do not edit tool names or signatures without re-checking the source.

---

## Anthropic MCP Directory

### Status: code-ready, needs npm publish + manual form submission

The MCP server is fully implemented in [src/mcp/server.ts](packages/agent-registry/src/mcp/server.ts)
and ships as the `veil-mcp` bin. **No `mcp-server.json` manifest exists yet** — draft below.

### Draft `mcp-server.json` (create at `packages/agent-registry/mcp-server.json`)

```json
{
  "name": "veil-protocol",
  "version": "1.0.0",
  "description": "Quantum-resistant payments (ML-DSA-65 / x402-pqc) and private DeFi AI inference (Ghost via Octra Circles FHE) for autonomous agents.",
  "license": "MIT",
  "homepage": "https://veilprotocol.net",
  "repository": "https://github.com/veil-protocol/veil-pqc",
  "keywords": ["payments", "post-quantum", "defi", "privacy", "fhe", "mcp"],
  "installation": {
    "command": "npx",
    "args": ["@veil/agent-registry"]
  },
  "tools": [
    {
      "name": "veil_sign_payment",
      "description": "Sign a quantum-resistant payment using ML-DSA-65 post-quantum cryptography via Veil Protocol's x402-pqc standard. Use when you need to make a payment that is secure against quantum computers.",
      "inputSchema": {
        "type": "object",
        "required": ["amount", "currency", "recipient", "network"],
        "properties": {
          "amount":    { "type": "string", "description": "Decimal amount, e.g. \"12.50\"" },
          "currency":  { "type": "string", "enum": ["USDC", "ETH", "VEIL"] },
          "recipient": { "type": "string", "description": "0x recipient address" },
          "network":   { "type": "string", "enum": ["base", "base-sepolia"] }
        }
      }
    },
    {
      "name": "veil_verify_payment",
      "description": "Verify a quantum-resistant x402-pqc payment signature. Use to confirm a payment was properly signed with post-quantum cryptography.",
      "inputSchema": {
        "type": "object",
        "required": ["paymentHeader", "expectedAmount", "expectedRecipient"],
        "properties": {
          "paymentHeader":      { "type": "string" },
          "expectedAmount":     { "type": "string" },
          "expectedRecipient":  { "type": "string" }
        }
      }
    },
    {
      "name": "veil_ghost_query",
      "description": "Query Ghost, Veil's private AI agent, for DeFi intent parsing and execution planning. Ghost executes inside Octra Circles — sealed FHE environments where no node sees your instructions in plaintext.",
      "inputSchema": {
        "type": "object",
        "required": ["instruction"],
        "properties": {
          "instruction": { "type": "string", "description": "Natural language DeFi intent" },
          "context": {
            "type": "object",
            "properties": {
              "balances": { "type": "object", "additionalProperties": { "type": "string" } },
              "network":  { "type": "string" }
            }
          }
        }
      }
    },
    {
      "name": "veil_encrypt_payload",
      "description": "Encrypt a payload using ML-KEM-768 post-quantum key encapsulation. Use when you need quantum-resistant encryption for sensitive data.",
      "inputSchema": {
        "type": "object",
        "required": ["payload", "recipientPublicKey"],
        "properties": {
          "payload":            { "type": "string" },
          "recipientPublicKey": { "type": "string", "description": "Hex-encoded ML-KEM-768 public key" }
        }
      }
    }
  ]
}
```

### Tools exposed by the MCP server

| Tool | Algorithm | Input | Output |
|---|---|---|---|
| `veil_sign_payment` | ML-DSA-65 (x402-pqc) | `amount`, `currency`, `recipient`, `network` | `{ signature, publicKey, paymentHeader, txHash }` |
| `veil_verify_payment` | ML-DSA-65 | `paymentHeader`, `expectedAmount`, `expectedRecipient` | `{ valid, details }` |
| `veil_ghost_query` | FHE (Octra Circles) | `instruction`, `context?` | `{ intent, confidence, ghostResponse, executionPlan }` |
| `veil_encrypt_payload` | ML-KEM-768 | `payload`, `recipientPublicKey` | `{ encryptedPayload, kemCiphertext }` |

### Quickstart — Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`
(or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "veil-protocol": {
      "command": "npx",
      "args": ["@veil/agent-registry"]
    }
  }
}
```

### Submission notes

- Anthropic MCP Directory submission is a **manual web form** at mcp.anthropic.com (or via the Claude integration tab). The form asks for: name, description, install snippet, and tool list — all derivable from this doc.
- The `npx @veil/agent-registry` invocation only works **after `@veil/agent-registry` is published to npm** (currently uses `workspace:*` deps — see [checklist](#prioritized-checklist)).

---

## LangChain Hub

### Status: code-ready; Hub listing is a manual PR or hub.langchain.com submission

> **Important distinction**: LangChain Hub (`hub.langchain.com`) primarily hosts *prompts and chains*
> in serialized LCEL format — not npm packages. Listing `@veil/agent-registry` as a community
> integration requires a PR to `langchain-ai/langchain` (Python) or `langchain-ai/langchainjs`
> (TypeScript). The quickstart below is what developers see after `npm install`.

### What's implemented

[src/langchain/tools.ts](packages/agent-registry/src/langchain/tools.ts) exports four
`StructuredTool` subclasses from `@langchain/core/tools`, plus a pre-built array:

| Export | Type | Tool name |
|---|---|---|
| `VeilSignPaymentTool` | `StructuredTool` | `veil_sign_payment` |
| `VeilVerifyPaymentTool` | `StructuredTool` | `veil_verify_payment` |
| `VeilGhostQueryTool` | `StructuredTool` | `veil_ghost_query` |
| `VeilEncryptPayloadTool` | `StructuredTool` | `veil_encrypt_payload` |
| `veilTools` | `StructuredTool[]` | all four, pre-instantiated |

Each tool's `schema` is the corresponding Zod schema from `src/types.ts`, so LangChain
agents get full type-safe structured input validation.

### Quickstart

```bash
npm install @veil/agent-registry
```

```ts
import { ChatAnthropic } from '@langchain/anthropic';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { veilTools } from '@veil/agent-registry/langchain';

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
console.log(result.output);
```

Individual tool usage (no agent):

```ts
import { VeilGhostQueryTool } from '@veil/agent-registry/langchain';

const ghost = new VeilGhostQueryTool();
const response = await ghost.invoke({
  instruction: 'swap 100 USDC for ETH on base',
  context: { balances: { USDC: '500.00' }, network: 'base' },
});
console.log(JSON.parse(response).ghostResponse);
```

### Submission path

Option A (recommended for discoverability): Open a PR to `langchain-ai/langchainjs`
adding `@veil/agent-registry` to the community integrations list.

Option B: Publish a prompt template to hub.langchain.com that demonstrates using
`veilTools` — lower friction but less visible.

---

## AWS Bedrock AgentCore

### Status: needs AWS account + manual deploy; Lambda handler is missing from source

The CloudFormation template in [docs/AWS_BEDROCK.md](packages/agent-registry/docs/AWS_BEDROCK.md)
is drafted and the OpenAPI schema is complete. However:

**Blocker:** The template references `dist/api/lambda.handler` but the current
[src/api/index.ts](packages/agent-registry/src/api/index.ts) only exports an Express
`app.listen()` server — no Lambda adapter exists yet. A thin wrapper using
[`serverless-http`](https://github.com/dougmoscrop/serverless-http) is needed.

**What I need from you to proceed:**

- [ ] AWS account ID and region (e.g. `us-east-1`)
- [ ] Whether you have the AWS CLI configured (`aws configure` / `aws sso login`)
- [ ] An existing Bedrock Agent ID to attach the action group to, or permission to create one
- [ ] An S3 bucket name for the deployment zip (`DeploymentBucket` in the CloudFormation)
- [ ] Confirmation you want the Lambda handler stub added to `src/api/`

### Quickstart (once deployed)

```ts
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';

const client = new BedrockAgentRuntimeClient({ region: 'us-east-1' });
const response = await client.send(new InvokeAgentCommand({
  agentId: 'YOUR_AGENT_ID',
  agentAliasId: 'TSTALIASID',
  sessionId: crypto.randomUUID(),
  inputText: 'Sign a 50 USDC payment to 0xabc... on base-sepolia',
}));
```

The action group routes to the four REST endpoints via the OpenAPI schema:

| HTTP route | Action |
|---|---|
| `POST /tools/sign-payment` | `veil_sign_payment` |
| `POST /tools/verify-payment` | `veil_verify_payment` |
| `POST /tools/ghost-query` | `veil_ghost_query` |
| `POST /tools/encrypt-payload` | `veil_encrypt_payload` |

---

## Agentic.market

### Status: manual web submission required — no code path

Agentic.market is a **marketplace UI listing**, not a code registry. Submission requires
logging in to agentic.market and filling out a listing form. No API or config file submission.

**Information needed for the form (all derivable from source):**

| Field | Value |
|---|---|
| Name | Veil Protocol |
| Tagline | Quantum-resistant payments and private AI for autonomous agents |
| Category | DeFi / Payments / Privacy |
| Install command | `npm install @veil/agent-registry` or `npx @veil/agent-registry` |
| Homepage | https://veilprotocol.net |
| Docs | https://veilprotocol.net/docs |
| npm package | `@veil/agent-registry` |

### Quickstart snippet for the listing page

```ts
// OpenAI function calling
import { veilFunctions, veilFunctionHandlers } from '@veil/agent-registry/openai';

// Pass veilFunctions to the model
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Encrypt my wallet address with ML-KEM-768' }],
  tools: veilFunctions.map(f => ({ type: 'function', function: f })),
});

// Dispatch the tool call
const call = response.choices[0].message.tool_calls?.[0];
if (call && call.function.name in veilFunctionHandlers) {
  const args = JSON.parse(call.function.arguments);
  const result = await veilFunctionHandlers[call.function.name as keyof typeof veilFunctionHandlers](args as any);
  console.log(result);
}
```

---

## ClawHub (OpenClaw Bazaar)

### Status: SKILL.md drafted at `skills/veil-protocol/SKILL.md` — needs ClawHub account + CLI publish

ClawHub is the official skill registry for the OpenClaw agent ecosystem. Submission is
**CLI-only** — no PR, no web form, no manifest.json. The SKILL.md file is the entire
submission artifact.

### File created

`skills/veil-protocol/SKILL.md` — uses the [Agent Skills](https://agentskills.io/) format
(same as skills.sh; one file serves both platforms).

Key frontmatter declared:
- No required env vars (the MCP server is self-contained)
- `VEIL_NETWORK` declared as optional
- Node install spec: `@veil_/agent-registry`
- `emoji`, `homepage` set

### Publish commands

```bash
# Install the ClawHub CLI
npm install -g clawhub

# Authenticate (one-time)
clawhub login

# Publish
clawhub skill publish ./skills/veil-protocol

# Optional: set a custom slug or tag
clawhub skill publish ./skills/veil-protocol --slug veil-protocol --tags latest
```

### Notes

- ClawHub derives the slug from the folder name (`veil-protocol`) by default.
- All ClawHub skills are licensed MIT-0 (attribution-free). No paid skill option exists.
- ClawHub runs automated security scans on publish; declarations in frontmatter must
  match what the skill actually does or the scan will flag a mismatch.
- Requires a GitHub account old enough to pass ClawHub's upload gate.

---

## Skills.sh

### Status: SKILL.md drafted (same file as ClawHub) — push to GitHub; registration step TBD

Skills.sh is Vercel's leaderboard/discovery platform for the open Agent Skills ecosystem.
It indexes GitHub repositories, not a separate registry. The URL pattern is
`skills.sh/{github-owner}/{github-repo}/{skill-name}` — for this repo that becomes
`skills.sh/veil-protocol-1/veil-pqc/veil-protocol`.

### How it works

Skills.sh reads `SKILL.md` files from public GitHub repos. Once your repo is indexed,
users install via:

```bash
npx skills add veil-protocol-1/veil-pqc
# or targeting a specific skill:
npx skills add veil-protocol-1/veil-pqc --skill veil-protocol
```

The `skills/` directory layout at the repo root follows the standard:

```
skills/
└── veil-protocol/
    └── SKILL.md    ← created
```

### What's needed from you

The exact indexing trigger for skills.sh (auto-scan vs. manual repo registration) is
**not publicly documented** on the skills.sh site. Two likely paths:

1. **Auto-discovery on install**: Skills.sh may index a repo the first time someone runs
   `npx skills add veil-protocol-1/veil-pqc`. To seed this, run that command yourself after
   pushing, then check `skills.sh/veil-protocol-1/veil-pqc`.

2. **Manual registration**: Check `skills.sh` for an "Add your repo" or contact form —
   or open an issue/discussion on `github.com/vercel-labs/skills` asking how to list a repo.

Neither path requires any code changes — the SKILL.md is already in place.

---

## Prioritized Checklist

### Code/config complete — no account needed

- [x] **`skills/veil-protocol/SKILL.md`** — created, covers both ClawHub and Skills.sh.

### Tonight (code/config only — no account needed)

- [ ] **Draft `mcp-server.json`** — copy the JSON block from the Anthropic MCP section above
      into `packages/agent-registry/mcp-server.json` and add it to the `files` array in
      `package.json`.
- [ ] **Fix `workspace:*` deps for npm publish** — replace `@veil_/x402-pqc`,
      `@veil_/pqc-wallet`, `@veil_/circles` workspace refs with real semver ranges in
      `package.json` before `npm publish`. Otherwise `npx @veil/agent-registry` will fail
      for anyone outside this monorepo.
- [ ] **Publish `@veil/agent-registry` to npm** — `npm publish` from
      `packages/agent-registry/` (unblocks MCP Directory, LangChain Hub, and Agentic.market
      snippets).
- [ ] **Add Lambda handler stub** for Bedrock — a `src/api/lambda.ts` wrapping `createApp()`
      with `serverless-http` so the CloudFormation template resolves correctly.

### Requires manual signup / account action from you

- [ ] **ClawHub (OpenClaw Bazaar)** — `clawhub login` then `clawhub skill publish ./skills/veil-protocol`.
      Requires creating a ClawHub account at clawhub.io first. ~10 minutes.
- [ ] **Skills.sh** — push `skills/veil-protocol/SKILL.md` to GitHub (`veil-protocol-1/veil-pqc`),
      then either run `npx skills add veil-protocol-1/veil-pqc` to seed telemetry, or
      check skills.sh for a repo registration form.
- [ ] **Anthropic MCP Directory** — submit the form at mcp.anthropic.com after npm publish.
      Takes ~5 minutes once the package is live.
- [ ] **LangChain Hub** — open a PR to `langchain-ai/langchainjs` *or* publish a prompt
      template at hub.langchain.com. Either requires a GitHub account with write access or
      a hub.langchain.com login.
- [ ] **AWS Bedrock AgentCore** — requires AWS account, configured CLI, and answers to
      the info checklist in the Bedrock section above. Estimated setup time: 1–2 hours
      including Lambda packaging and CloudFormation deploy.
- [ ] **Agentic.market** — manual web form, ~15 minutes once npm package is live.
