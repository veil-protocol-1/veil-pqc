⚠️ CANONICAL SOURCE OF TRUTH — Any Claude Code session working on this repo must treat this file as ground truth over assumptions, memory, or prior session summaries. If something here looks wrong or outdated, verify against the live source (npm view, GitHub API, curl the RPC) before changing this file — do not silently assume the file is correct OR silently assume it's wrong. Last verified: 2026-06-19.

---

# Veil Protocol — Project Facts

## npm Scope

**Org:** `@veil_` (underscore is required — `@veil` was already taken by an unrelated party)

Never write `@veil/` without the underscore. All published packages live under `@veil_/`.

### Live packages (verified 2026-06-19 via `npm view`)

| Package | Version | Description |
|---------|---------|-------------|
| `@veil_/pqc-wallet` | **1.0.1** | Quantum-resistant wallet primitives (ML-DSA-65, ML-KEM-768) |
| `@veil_/auth` | **1.0.2** | Biometric SSI with ZK proof of authentication |
| `@veil_/x402-pqc` | **1.0.2** | Quantum-resistant x402 payment protocol |
| `@veil_/circles` | **1.0.2** | Octra Circle interface for private agent execution |
| `@veil_/agent-registry` | **1.0.1** | Agent-callable wrappers (MCP, LangChain, OpenAI functions, REST) |

---

## GitHub Repository

**URL:** `https://github.com/veil-protocol-1/veil-pqc`
**Org:** `veil-protocol-1` (NOT `veilprotocol` — that org does not exist)
**Visibility:** public

Do not use `veilprotocol`, `veil-protocol`, or any other variation. The `-1` suffix is canonical.

---

## Octra RPC

**Endpoint:** `https://octra.network/rpc`

- `octra.net` does NOT resolve — DNS failure confirmed previously.
- `octra.network` is live. A 429 response means the node is reachable but rate-limiting; it is NOT a failure.
- All Circle/Ghost execution calls go to this endpoint via JSON-RPC 2.0.

---

## Smart Contracts (Base Sepolia Testnet ONLY)

| Contract | Address |
|----------|---------|
| VEILTreasury | `0x77761912b6435287f2b4DaAe93c02611351e7750` |
| x402PQCPayments | `0x061e6F1D6C93302A0818150e44cE7c4abB400D6e` |

**Mainnet status:** ALL contracts remain Base Sepolia testnet only. Mainnet deployment is gated on a formal security audit and tied to the token launch. This gate does not move under deadline pressure — do not suggest or implement mainnet deployments.

---

## Production Infrastructure

**Domain:** `veilprotocol.net`

**Vultr production nodes** (running `@veil_/api` on port 3000):
- `45.63.6.252`
- `108.61.81.13`
- `149.28.229.102`

---

## External Contributions

- **x402 Foundation issue:** `https://github.com/x402-foundation/x402/issues/2664`

---

## Mobile Status

`packages/mobile` exists with real Expo Router screens (home, ghost have genuine logic) but is **explicitly paused**. Do not prioritize mobile work until the SDK/agent/developer side is 100% production-ready. The directory exists; it is not abandoned, just deprioritized.

---

## Quick Verification Commands

If you suspect any value here is stale, verify before changing:

```bash
# npm packages
npm view @veil_/pqc-wallet
npm view @veil_/auth
npm view @veil_/x402-pqc
npm view @veil_/circles
npm view @veil_/agent-registry

# GitHub repo
curl -s https://api.github.com/repos/veil-protocol-1/veil-pqc | grep '"full_name"'

# Octra RPC (429 = alive, anything from DNS = wrong domain)
curl -X POST https://octra.network/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"node_status","params":[]}'
```
