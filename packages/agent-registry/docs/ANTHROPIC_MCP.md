# Submitting to the Anthropic MCP Directory

## Title

Veil Protocol — Quantum-Resistant Payments & Private AI

## Description

Veil Protocol's MCP server gives agents quantum-resistant payment signing
(ML-DSA-65 via the x402-pqc standard), payment verification, ML-KEM-768
post-quantum encryption, and access to Ghost — Veil's private DeFi AI that
executes inside sealed Octra Circles (FHE) so no node ever sees an agent's
instructions in plaintext.

## Installation

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

## Tools

| Tool | Description |
| --- | --- |
| `veil_sign_payment` | Sign a quantum-resistant payment using ML-DSA-65 post-quantum cryptography via Veil Protocol's x402-pqc standard. |
| `veil_verify_payment` | Verify a quantum-resistant x402-pqc payment signature. |
| `veil_ghost_query` | Query Ghost, Veil's private AI agent, for DeFi intent parsing and execution planning inside sealed Octra Circles. |
| `veil_encrypt_payload` | Encrypt a payload using ML-KEM-768 post-quantum key encapsulation. |

## Example agent usage

```ts
// Claude, via MCP tool call
{
  "tool": "veil_sign_payment",
  "input": {
    "amount": "12.50",
    "currency": "USDC",
    "recipient": "0xabc...",
    "network": "base-sepolia"
  }
}
```

## Links

- https://veilprotocol.net
- https://veilprotocol.net/docs