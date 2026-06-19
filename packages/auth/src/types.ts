import type { PQCKeypair } from '@veil_/pqc-wallet';

export type { PQCKeypair };

export interface EnrollmentResult {
  /** Public sketch — safe to store. Reveals nothing about embedding. */
  sketch: Uint8Array;
  /** SHA3-256(seed) — stored locally for verification */
  commitment: Uint8Array;
  /** EVM-compatible address derived from keypair */
  address: string;
  /** Verification key for ZK proof verification */
  verificationKey: Uint8Array;
}

export interface AuthResult {
  proof: AuthProof;
  keypair: PQCKeypair;
  address: string;
}

export interface AuthProof {
  proof: Uint8Array;
  publicInputs: string[];
}

export interface RecoveryShard {
  index: number;
  data: Uint8Array;
}
