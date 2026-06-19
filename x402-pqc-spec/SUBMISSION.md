# Linux Foundation Community Specification Submission
## x402-pqc — Quantum-Resistant HTTP Payment Standard

Submitting Organization: Veil Foundation
Founding Architect: Ryland Hochstetler
Contact: ryland@veilprotocol.net
Submission Track: Community Specification

---

### Why This Specification Matters

The x402 HTTP payment protocol enables AI agents and autonomous systems
to make programmatic payments over HTTP. It is the foundation of
machine-to-machine commerce on Base and EVM networks.

Every current x402 implementation uses ECDSA — an algorithm broken by
Shor's algorithm on quantum computers. As the timeline for
cryptographically-relevant quantum computers accelerates, payment
infrastructure used by AI agents must be upgraded now, not later.

x402-pqc provides a complete, NIST-standards-aligned upgrade path using
ML-DSA-65 (FIPS 204) and ML-KEM-768 (FIPS 203) — the same algorithms
now mandated by CISA and NSA for post-quantum migration.

### What We Are Submitting

1. Complete specification document (x402-pqc v1.0.0-draft)
2. Reference implementation: @veil/x402-pqc — 42 tests passing,
   TypeScript/Node.js, Apache 2.0
3. Charter and governance documents

### Ecosystem Fit

- Directly extends x402, maintained by Coinbase/Base ecosystem
- Aligned with NIST FIPS 203/204 post-quantum standards
- Relevant to Linux Foundation OpenSSF security initiatives
- First quantum-resistant payment standard for EVM networks

### Request

We request hosting under the Linux Foundation Community Specification
track with Apache 2.0 licensing. We are committed to maintaining the
specification and reference implementation as an open standard for any
implementer to adopt.

---
