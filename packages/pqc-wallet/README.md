# @veil_/pqc-wallet
ML-DSA-65 signing and ML-KEM-768 key encapsulation
for quantum-resistant wallets on Base.
Built by Veil Foundation — https://veilprotocol.net

## Install
npm install @veil_/pqc-wallet

## Usage
import { generatePQCKeypair, signTransaction } from '@veil_/pqc-wallet'
const { publicKey, privateKey } = await generatePQCKeypair()
const signature = await signTransaction(tx, privateKey)

## Why
ECDSA is vulnerable to Shor's algorithm on quantum computers.
ML-DSA-65 (FIPS 204) is NIST-standardized quantum-resistant.
Veil uses it for every transaction signature.

## License
Apache 2.0