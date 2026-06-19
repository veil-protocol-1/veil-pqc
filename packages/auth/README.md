# @veil_/auth

Biometric SSI with ZK proof of authentication. No passwords. No seed phrases. No servers.

## What it is

`@veil_/auth` lets a user enroll their face once and authenticate forever — producing a deterministic
ML-KEM-768 + ML-DSA-65 keypair each time, with a ZK proof that the authentication happened
correctly, without ever revealing the biometric or the seed.

**Nothing leaves the device.** The fuzzy extractor absorbs sensor noise; the ZK circuit proves
correctness without exposing inputs; the keypair is derived fresh on each successful auth.

## Install

```bash
npm install @veil_/auth
```

## Quick start

```ts
import { VeilAuth } from '@veil_/auth';

const auth = new VeilAuth();

// ─── Enrollment (once) ────────────────────────────────────────────────────
// faceEmbedding: Float32Array of 128 dimensions, values in [-1, 1]
const { sketch, commitment, address, verificationKey } = await auth.enroll(faceEmbedding);
// Store sketch + commitment + verificationKey locally (e.g. device secure enclave / IndexedDB).
// address is your EVM address — share it publicly.

// ─── Authentication (every time) ─────────────────────────────────────────
const { keypair, proof, address } = await auth.authenticate(
  faceEmbedding,   // captured fresh
  sketch,          // loaded from local storage
  commitment,      // loaded from local storage
  verificationKey, // loaded from local storage
);
// keypair.signingKey    — ML-DSA-65 signing key (use for tx signing)
// keypair.publicKey.kem — ML-KEM-768 public key (use for key exchange)
// proof                 — ZK proof of authentication (share with verifiers)
```

## Architecture

```
                         ┌──────────────────────────────────────────────────┐
                         │                  DEVICE BOUNDARY                 │
                         │                                                  │
  ┌─────────────┐        │  ┌──────────────────┐    ┌────────────────────┐  │
  │   Camera /  │        │  │  Fuzzy Extractor │    │   Key Derivation   │  │
  │  Face Scan  │──────▶ │  │  (RS code-offset)│───▶│  HKDF-SHA256       │  │
  └─────────────┘  emb  │  │                  │    │  ML-DSA-65 seed    │  │
                         │  │  enroll:         │    │  ML-KEM-768 seed   │  │
  ┌─────────────┐        │  │   seed ←RNG      │    └─────────┬──────────┘  │
  │   Sketch    │        │  │   sketch = emb   │              │             │
  │ (public)    │──────▶ │  │     XOR RS(seed) │    ┌─────────▼──────────┐  │
  └─────────────┘        │  │                  │    │   PQC Keypair      │  │
                         │  │  auth:           │    │  (ML-DSA-65 +      │  │
  ┌─────────────┐        │  │   seed = RS_dec( │    │   ML-KEM-768)      │  │
  │ Commitment  │        │  │    new_emb XOR   │    └─────────┬──────────┘  │
  │  (public)   │──────▶ │  │    sketch)       │              │             │
  └─────────────┘        │  └────────┬─────────┘    ┌─────────▼──────────┐  │
                         │           │ seed         │   ZK Circuit       │  │
                         │           ▼              │  (Noir + BB)       │  │
                         │  ┌────────────────────┐  │  proves derivation │  │
                         │  │ SHA3-256(seed)      │  │  without revealing │  │
                         │  │   == commitment?    │  │  embedding/seed    │  │
                         │  └────────────────────┘  └────────────────────┘  │
                         │                                                  │
                         └──────────────────────────────────────────────────┘

  Outputs (leave device):  address (public key hash)
                           proof   (ZK proof — reveals nothing)
                           sketch  (safe — information-theoretically hides embedding)
```

### Layer 1 — Biometric (fuzzy extractor)

- Face embedding (128-dim Float32Array) is quantized to 128 bytes
- Enrolled via the **code-offset construction**: `sketch = embedding XOR RS(seed)` where `RS` is
  a Reed-Solomon code over GF(2^8) with t=42 error correction
- Authentication recovers the seed via RS decoding if Hamming distance ≤ 42 bytes
- Commitment = SHA3-256(seed) stored for verification without storing the seed

### Layer 2 — Keys (deterministic derivation)

- `HKDF-SHA256(seed, "veil-dsa-seed")` → 32-byte ML-DSA-65 seed
- `HKDF-SHA256(seed, "veil-kem-seed")` → 64-byte ML-KEM-768 seed
- Address = `0x` + hex(keccak256(dsa.publicKey)[-20:])  — matches `@veil_/pqc-wallet`

### Layer 3 — ZK (Noir circuit)

- Circuit: `circuits/src/main.nr` (compiled with nargo 1.0.0-beta.22)
- Proves: prover knows `embedding` and `seed` s.t. `BLAKE2s(seed) == commitment`
  and `embedding XOR sketch[0..128]` binds the proof to the correct enrollment via Pedersen commitment
- Proof system: **Barretenberg UltraHonk** (real PLONK proofs via `@aztec/bb.js 5.x`)
- Proving time: typically **1–3 seconds** on modern hardware (Barretenberg WASM initializes once per session)
- Proof size: ~14KB (287 public inputs for sketch + commitment field elements)

## API

### `VeilAuth` class

```ts
class VeilAuth {
  enroll(faceEmbedding: Float32Array): Promise<EnrollmentResult>
  authenticate(faceEmbedding, sketch, commitment, verificationKey): Promise<AuthResult>
}
```

### Functional API

```ts
// Fuzzy extractor
enrollBiometric(faceEmbedding: Float32Array): { sketch, seed, commitment }
reproduceSeed(faceEmbedding: Float32Array, sketch: Uint8Array): Uint8Array

// Key derivation
deriveKeypair(seed: Uint8Array): PQCKeypair
deriveAddress(seed: Uint8Array): string

// ZK proofs (async — real Barretenberg UltraHonk)
generateAuthProof(embedding, sketch, commitment): Promise<AuthProof>
verifyAuthProof(proof, publicInputs, verificationKey): Promise<boolean>
getVerificationKey(): Uint8Array  // sync — 32-byte circuit identity token

// SSS recovery (opt-in)
generateRecoveryShards(seed, threshold, total): RecoveryShard[]
reconstructFromShards(shards: RecoveryShard[]): Uint8Array
```

## Optional: SSS seed recovery

If the user loses their device, they can recover via Shamir Secret Sharing. This is the **only**
path where any part of the seed can leave the device — the user explicitly opts in.

```ts
import { generateRecoveryShards, reconstructFromShards } from '@veil_/auth';

// Split seed into 5 shards, any 3 can reconstruct
const shards = generateRecoveryShards(seed, 3, 5);
// Distribute shards[0..4] to trusted contacts / hardware keys

// Recovery: collect any 3 shards
const recovered = reconstructFromShards([shards[0], shards[2], shards[4]]);
```

## Noir circuit

The circuit lives in `circuits/src/main.nr` and was compiled with **nargo 1.0.0-beta.22**. The
compiled artifact (`circuits/target/biometric_auth.json`) is bundled with the package.

To recompile after circuit changes:

```bash
# nargo 1.0.0-beta.22 for Linux (no Windows binary available)
# Download: https://github.com/noir-lang/noir/releases/tag/v1.0.0-beta.22
# On Windows: download nargo-x86_64-unknown-linux-gnu.tar.gz and run via WSL

cd packages/auth/circuits
nargo compile
# Artifact written to circuits/target/biometric_auth.json
```

The proof backend is `@aztec/bb.js 5.0.0-nightly.20260522` — the exact version paired with
nargo 1.0.0-beta.22. Barretenberg WASM initializes lazily on first proof call and is reused
for the lifetime of the process.
