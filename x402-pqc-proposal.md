# Roadmap: Post-Quantum Cryptography (PQC) Extension — Contribution Proposal

## Summary

This issue proposes integrating `x402-pqc` — a working, tested TypeScript package — as an optional extension to the x402 protocol. It adds quantum-resistant payment authentication (ML-DSA-65) and key encapsulation (ML-KEM-768) while remaining fully backward compatible with existing x402 schemes.

---

## Goals

### Why x402 needs PQC support

The current x402 payment schemes use ECDSA over secp256k1 for payment header signatures. ECDSA is broken by Shor's algorithm on a sufficiently powerful quantum computer. The timeline for cryptographically relevant quantum computers is uncertain, but the threat is well-established: NIST finalized post-quantum standards in 2024, and "harvest now, decrypt later" attacks mean payment data signed today could be forged retroactively.

NIST has standardized two relevant algorithms:

- **FIPS 204 (ML-DSA)** — lattice-based digital signature algorithm; replaces ECDSA for signing
- **FIPS 203 (ML-KEM)** — lattice-based key encapsulation mechanism; replaces ECDH for key agreement

For AI agent infrastructure (the primary x402 use case) this is particularly relevant: agents may sign thousands of micropayments per hour over sessions that span hours or days. An attacker who harvests session traffic today can retroactively forge or replay those payments once a quantum computer is available.

### What x402-pqc adds

`x402-pqc` is a working extension that adds an optional `x402-pqc` payment scheme to x402. It:

- Replaces ECDSA signatures with **ML-DSA-65** (FIPS 204) for payment header signing
- Adds **ML-KEM-768** (FIPS 203) for quantum-resistant key encapsulation in session establishment
- Is **fully backward compatible** — new scheme identifiers are additive; existing `evm-v1` (ECDSA) schemes are unaffected
- Introduces a **Session Mode** that amortizes the ML-DSA-65 signature cost across many payments (see Approach)

---

## Approach / Design Sketch

### Two modes

| Mode | Handshake | Per-payment auth | Header size | Suited for |
|------|-----------|-----------------|-------------|-----------|
| **Base** | — | ML-DSA-65 signature (~3309 B) | ~14 KB (hex-encoded) | One-off payments, audit trails |
| **Session** | ML-DSA-65 × 2 + ML-KEM-768 encapsulation | HMAC-SHA256 (~32 B MAC) | < 500 B | High-frequency agent payments |

### Session Mode (solving the signature-size problem)

ML-DSA-65 signatures are 3309 bytes — roughly 50× larger than an ECDSA signature. For a high-frequency agent making thousands of micropayments per session, attaching a fresh ML-DSA-65 signature to every payment header is prohibitive: each base-mode header is ~14 KB over the wire.

Session Mode solves this with a one-time quantum-resistant handshake:

1. **Payer** generates a session ID and signs `(sessionId ‖ kemPublicKey ‖ timestamp)` with ML-DSA-65 → `SessionOpenHeader`
2. **Payee** encapsulates to the payer's ML-KEM-768 public key to produce a shared secret, signs `(sessionId ‖ kemCiphertext ‖ expiry)` with ML-DSA-65 → `SessionConfirmation`
3. Both parties derive a 32-byte symmetric session key: `HKDF-SHA256(sharedSecret, salt=sessionId, info="x402-pqc-session-v1")`
4. All subsequent payments in that session use **HMAC-SHA256** over `(nonce ‖ timestamp ‖ amount ‖ recipient)` — headers are < 500 bytes and verification is O(1)

Sessions carry a 1-hour TTL. Nonce replay is prevented server-side with a `NonceStore` (in-memory; production deployments should use a shared persistent store). Timestamp windows are ±300 seconds.

### Performance comparison (from spec)

| | ECDSA (current x402) | x402-pqc base | x402-pqc session |
|---|---|---|---|
| Public key size | 32 B | 1952 B (ML-DSA-65) | session key 32 B |
| Signature / auth size | 64 B | 3309 B | 32 B (HMAC-SHA256) |
| Sign latency | ~0.1 ms | ~5 ms | < 0.1 ms |
| Quantum-safe | ✗ | ✓ | ✓ |

For session mode, per-payment overhead is comparable to standard HTTP header auth once the handshake is amortized.

### Implementation notes

- Built on `@noble/post-quantum` for ML-DSA-65 and ML-KEM-768 primitives (audited, zero-dependency)
- `@noble/hashes` for HKDF-SHA256 and HMAC-SHA256
- `@noble/ciphers` for AES-GCM in optional payload encryption
- No new on-chain components — all authentication is off-chain header verification, same as existing x402

This is implemented as a real package, not a proposal-only spec. The source is available for review now.

---

## Deliverables

### Reference implementation

**`@veil_/x402-pqc` v0.1.0** — TypeScript package (ESM + CJS), full type declarations.

Exports:
- `createX402PQCHeader` / `verifyX402PQCHeader` — base mode (ML-DSA-65 sign/verify)
- `createSession` / `confirmSession` / `deriveSessionKey` — session handshake
- `createSessionPayment` / `verifySessionPayment` — per-payment MACs
- `encryptPaymentMetadata` / `decryptPaymentMetadata` — optional ML-KEM-768 payload encryption
- `NonceStore` — replay prevention utility

### Test suite

**42 tests** across 4 test files (vitest):

| File | Tests | Coverage |
|------|-------|---------|
| `header.test.ts` | 15 | ML-DSA-65 sign/verify, timestamp windows, tamper detection, field structure |
| `session.test.ts` | 16 | Full session handshake, key derivation, HMAC auth, replay detection, timestamp expiry |
| `encryption.test.ts` | 5 | ML-KEM-768 + AES-GCM encrypt/decrypt roundtrip, wrong-key rejection |
| `nonce.test.ts` | 6 | NonceStore TTL, duplicate rejection, multi-nonce correctness |

### Spec document

Scheme negotiation, session establishment protocol, MAC derivation, nonce management, and security considerations: [x402-pqc spec v0.1.0](https://veil.xyz/specs/x402-pqc-v0.1.0)

---

## Timeline

Already built and tested as of 2026-06-18. Available for review and integration discussion immediately.

Proposed integration path:
1. Review `@veil_/x402-pqc` source and spec (can share repo access on request)
2. Agree on scheme identifier string (e.g. `pqc-v1` alongside existing `evm-v1`)
3. Upstream the scheme registration to x402 spec, with `@veil_/x402-pqc` as the reference implementation
4. Add optional x402-pqc scheme support to `x402-js` facilitator/verifier (additive, no breaking changes)

---

## Demo / Success Metrics

- npm package live and installable: `npm install @veil_/x402-pqc`
- Test suite passing: 42/42 (vitest)
- Open to demoing a live session-mode payment flow on Base Sepolia testnet on request
- Benchmarks available: session handshake + 1000 payments, measuring per-payment header size and verify latency

---

## Notes / Open Questions

- **Scheme identifier**: Should the x402 spec use `pqc-v1`, `ml-dsa-v1`, or something else? Happy to defer to whatever naming scheme fits the existing pattern.
- **Key encoding**: Currently DSA public keys are hex-encoded in headers. Would the project prefer base64url?
- **Multi-instance nonce stores**: The included `NonceStore` is in-memory. x402 server implementors will need guidance on shared-state nonce stores for multi-instance deployments; this should be noted in the x402 facilitator docs rather than addressed in this package.
- **Scope**: This PR proposes adding the scheme to the x402 spec and reference SDK. Contract-level changes are out of scope — x402 on-chain contracts do not need modification since payment authentication remains off-chain.

---

*Implementation: [`@veil_/x402-pqc`](https://www.npmjs.com/package/@veil_/x402-pqc) | Spec: [x402-pqc v0.1.0](https://veil.xyz/specs/x402-pqc-v0.1.0)*
