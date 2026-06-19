# x402-pqc

**Quantum-Resistant HTTP Payment Standard**

x402-pqc is a post-quantum extension of the x402 HTTP payment protocol,
enabling machine-to-machine payments that are secure against quantum
computers. Designed for AI agents, autonomous systems, and human-operated
wallets operating on Base and EVM-compatible networks.

## Problem

The x402 protocol enables HTTP 402 Payment Required flows for programmatic
payments. All current x402 implementations rely on ECDSA signatures —
vulnerable to Shor's algorithm on sufficiently powerful quantum computers.
As AI agents and autonomous financial systems proliferate, the payment
infrastructure they rely on must be quantum-resistant from the ground up.

## Specification

x402-pqc extends x402 with the following mandatory changes:

### Signature Scheme
- Replaces ECDSA with ML-DSA-65 (FIPS 204, NIST-standardized)
- All payment authorizations signed with ML-DSA-65
- Signature verification requires ML-DSA-65 public key in payment header

### Key Encapsulation
- ML-KEM-768 (FIPS 203) for session key establishment
- Replaces ECDH key exchange in payment channel setup

### Wire Format

Payment header format (extension of x402):

```json
X-PAYMENT: {
  "scheme": "x402-pqc",
  "version": "1.0",
  "network": "base" | "base-sepolia",
  "amount": "<decimal string>",
  "currency": "USDC" | "ETH",
  "recipient": "<address>",
  "signature": "<ml-dsa-65 signature hex>",
  "public_key": "<ml-dsa-65 public key hex>",
  "kem_encapsulation": "<ml-kem-768 ciphertext hex>",
  "nonce": "<hex>",
  "timestamp": "<unix ms>",
  "expiry": "<unix ms>"
}
```

### Verification Flow
1. Receiver extracts public_key from header
2. Receiver verifies signature over canonical payment payload using ML-DSA-65
3. If channel session exists: receiver decapsulates kem_encapsulation using ML-KEM-768
4. Payment accepted or rejected — standard 402/200 HTTP flow proceeds

### Backward Compatibility
x402-pqc is not backward compatible with x402 ECDSA implementations.
The scheme field discriminates between the two. Servers may support
both schemes simultaneously during migration periods.

## Reference Implementation

Package: @veil/x402-pqc (TypeScript/Node.js)
- 42 tests passing
- ML-DSA-65 via @noble/curves + liboqs-node
- ML-KEM-768 via @noble/post-quantum
- Full payment flow: sign → transmit → verify
- Base + Base Sepolia network support

Repository: https://github.com/veil-protocol-1/veil-pqc

## Standards Alignment

- FIPS 203 (ML-KEM-768): NIST Module-Lattice-Based Key-Encapsulation
- FIPS 204 (ML-DSA-65): NIST Module-Lattice-Based Digital Signature
- x402: HTTP 402 Payment Protocol (Coinbase / Base ecosystem)
- RFC 9421: HTTP Message Signatures

## Use Cases

- AI agent autonomous payments (Ghost by Veil)
- Machine-to-machine API monetization
- Quantum-resistant DeFi transaction signing
- Post-quantum payment channels on Base

## Submitting Organization

Veil Foundation
Founding Architect: Ryland Hochstetler
Contact: ryland@veilprotocol.net
Website: https://veilprotocol.net

## License

Apache 2.0

## Status

- [x] Specification written
- [x] Reference implementation complete (42/42 tests)
- [ ] Linux Foundation Community Specification submission
- [ ] External implementer adoption
- [ ] ISO/IEC JTC1 PAS submission (future)
