# Veil Protocol MCP Server

Quantum-resistant payments and private AI inference for AI agents.

## Install

```
npx @veil_/agent-registry
```

## Tools

- `veil_sign_payment`: Sign x402-pqc quantum-resistant payments
- `veil_verify_payment`: Verify PQC payment signatures
- `veil_ghost_query`: Private DeFi intent execution via Ghost
- `veil_encrypt_payload`: ML-KEM-768 post-quantum encryption

## Add to Claude

Add to your `claude_desktop_config.json`:

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