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
| VEILToken | `0x0b78b7281bAD9B77854CFce5d027E709168717f0` |
| VEILTreasury | `0x6B20eE2Ad92504Ff1DBc550b86E65D8a5854Fd86` |
| VEILVesting | `0xbA8AAf63d7ac994D9C00A351D47CF5F05aD1b893` |
| VEILNodeRegistry | `0x6b34d54913fa90D12Ac26709B6BFb7958d80A5a7` |
| VEILPaymaster | `0x6c1E31FC80ab77185558a7b60670A1637D6e9189` |
| x402PQCPayments | `0xd56F1D27d3ba06EF46F9712d050Dc88FE933131E` |

> Redeployed 2026-06-19: x402PQCPayments now overrides `renounceOwnership()` to always revert, preventing permanent owner lockout.

## x402PQCPayments — Base MAINNET (real funds)

| Field | Value |
|-------|-------|
| **Address** | `0x8F446afA9877C79F3CCb5eaA5b6503752817223f` |
| **Owner** | `0xdEaD1f7583DEFE7A7fD701ea04ba49C14f871a0b` (Gnosis Safe) |
| **Tx hash** | `0xa5944a29db48086fed450a4c71033d223ad1e00af97c0c73311f64c16ca1c87d` |
| **Block** | `47635981` |
| **Gas used** | `411,897` |
| **Deployed** | 2026-06-21 |
| **Manifest** | `packages/contracts/deployments/base-x402-only.json` |

> Deployed 2026-06-21 via `scripts/deploy-x402-mainnet-only.ts`. owner() verified on-chain to return the Safe address (not the deployer EOA). Bytecode verified at 1532 bytes. This address is **Base mainnet** — do not confuse with the Sepolia address `0xd56F1D27d3ba06EF46F9712d050Dc88FE933131E`, which remains the testnet reference.

**Mainnet status:** ALL contracts remain Base Sepolia testnet only, **EXCEPT one explicit, narrowly-scoped exception: x402PQCPayments.**

This exception was deliberately approved (June 19 2026) because:
- The contract has zero dependencies on VEILTreasury or VEILToken.
- It never holds funds — it is a pure payment ledger (`onlyOwner registerPayment`).
- `renounceOwnership()` is overridden to always revert, preventing permanent owner lockout.
- Owner will be a Gnosis Safe (multisig) on Base mainnet, **not a hot wallet.**

**Designated Safe owner (Base mainnet):** `0xdEaD1f7583DEFE7A7fD701ea04ba49C14f871a0b`
> Verification status (checked 2026-06-21): Address is **not yet deployed on-chain** — it shows as an EOA with no transaction history on Basescan, and the Safe transaction service returns 404. This is consistent with a counterfactual Safe (CREATE2 pre-computed address before first transaction/deployment). Confirm deployment before transferring ownership on mainnet.

This exception does **NOT** extend to any other contract. VEILTreasury, VEILToken, VEILVesting, VEILNodeRegistry, and VEILPaymaster remain fully gated on a formal security audit tied to the token launch. That gate does not move under deadline pressure — do not suggest or implement mainnet deployments for any other contract.

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
