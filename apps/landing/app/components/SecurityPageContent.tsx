'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

function Section({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
    >
      {children}
    </motion.div>
  )
}

const TIMELINE = [
  {
    year: '2024',
    label: 'NIST Standards Published',
    detail: 'FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA) finalized. Veil ships on Day 1.',
    active: true,
  },
  {
    year: '2030',
    label: 'Early Quantum Threat',
    detail: 'First fault-tolerant quantum computers capable of breaking 512-bit ECC emerge.',
    active: false,
  },
  {
    year: '2035',
    label: 'RSA-2048 Broken',
    detail: "Shor's algorithm runs at scale. Every unmitigated wallet is retroactively exposed.",
    active: false,
  },
  {
    year: '2040',
    label: 'Harvest-Now Fully Realized',
    detail: "Data collected since 2020 is decrypted. State actors liquidate any non-PQC address they've been watching.",
    active: false,
  },
]

const AUDIT_STATUS = [
  { label: 'MNDA Status', value: 'Signed', ok: true },
  { label: 'Audit Status', value: 'In Progress', ok: true },
  { label: 'Auditor', value: 'Halborn', ok: true },
  { label: 'Scope', value: 'Smart contracts + PQC crypto layer', ok: true },
  { label: 'Public Report', value: 'Pending completion', ok: null },
]

export default function SecurityPageContent() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative z-10 pt-36 pb-20 px-4 flex flex-col items-center text-center"
        style={{ background: '#000000' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168,85,247,0.1) 0%, transparent 70%)',
          }}
        />

        <motion.h1
          className="font-orbitron font-bold text-white tabular-nums relative z-10"
          style={{ fontSize: 'clamp(64px, 12vw, 100px)', lineHeight: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          9:00
        </motion.h1>

        <motion.p
          className="font-rajdhani text-white font-semibold relative z-10 mt-5"
          style={{ fontSize: 'clamp(16px, 2.5vw, 22px)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Minutes to crack ECDSA on a quantum computer.
        </motion.p>

        <motion.p
          className="font-rajdhani italic relative z-10 mt-1"
          style={{ color: '#888888', fontSize: '14px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Google Quantum AI, March 2026
        </motion.p>
      </section>

      {/* ML-KEM-768 */}
      <section className="relative z-10 py-12 px-4" style={{ background: '#000000' }}>
        <div className="max-w-5xl mx-auto">
          <Section>
            <div
              className="p-8 rounded-2xl mb-6"
              style={{
                background: '#0A0A0A',
                border: '1px solid rgba(168,85,247,0.25)',
                borderTop: '4px solid #A855F7',
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <p
                    className="font-mono text-purple-400 mb-1"
                    style={{ fontSize: '22px' }}
                  >
                    ML-KEM-768
                  </p>
                  <p
                    className="font-rajdhani uppercase"
                    style={{ color: '#666', fontSize: '11px', letterSpacing: '2px' }}
                  >
                    NIST FIPS 203 · Module-Lattice Key Encapsulation
                  </p>
                </div>
                <span
                  className="font-rajdhani uppercase px-4 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.35)',
                    color: '#A855F7',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                  }}
                >
                  Key Encapsulation
                </span>
              </div>

              <p
                className="font-rajdhani leading-relaxed mb-6"
                style={{ color: '#CCCCCC', fontSize: '15px' }}
              >
                ML-KEM-768 (formerly Kyber-768) is the NIST-standardized key encapsulation mechanism
                based on the hardness of the Module Learning With Errors (MLWE) problem — a lattice
                problem with no known efficient quantum algorithm. It replaces ECDH/RSA for session
                key establishment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Security Level', value: 'AES-192 equivalent (NIST Level 3)' },
                  { label: 'Public Key Size', value: '1184 bytes' },
                  { label: 'Ciphertext Size', value: '1088 bytes' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl"
                    style={{ background: '#111', border: '1px solid rgba(168,85,247,0.15)' }}
                  >
                    <p
                      className="font-rajdhani uppercase mb-1"
                      style={{ color: '#666', fontSize: '10px', letterSpacing: '1.5px' }}
                    >
                      {stat.label}
                    </p>
                    <p className="font-mono text-white" style={{ fontSize: '13px' }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <p
                className="font-rajdhani mt-5 leading-relaxed"
                style={{ color: '#666', fontSize: '13.5px' }}
              >
                In Veil, ML-KEM-768 is used for PQCTransport session key establishment (KEM-DEM hybrid
                with AES-256-GCM) and for the <code className="font-mono text-purple-400">encapsulationKey</code>{' '}
                field of every wallet keypair. Ephemeral per-session KEM ensures forward secrecy even
                if a long-term signing key is later compromised.
              </p>
            </div>
          </Section>

          {/* ML-DSA-65 */}
          <Section>
            <div
              className="p-8 rounded-2xl"
              style={{
                background: '#0A0A0A',
                border: '1px solid rgba(99,102,241,0.25)',
                borderTop: '4px solid #6366F1',
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <p
                    className="font-mono mb-1"
                    style={{ fontSize: '22px', color: '#818CF8' }}
                  >
                    ML-DSA-65
                  </p>
                  <p
                    className="font-rajdhani uppercase"
                    style={{ color: '#666', fontSize: '11px', letterSpacing: '2px' }}
                  >
                    NIST FIPS 204 · Module-Lattice Digital Signature (Dilithium)
                  </p>
                </div>
                <span
                  className="font-rajdhani uppercase px-4 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.35)',
                    color: '#818CF8',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                  }}
                >
                  Digital Signatures
                </span>
              </div>

              <p
                className="font-rajdhani leading-relaxed mb-6"
                style={{ color: '#CCCCCC', fontSize: '15px' }}
              >
                ML-DSA-65 (formerly Dilithium3) is the NIST-standardized digital signature algorithm,
                also based on MLWE. Every transaction broadcast, Ghost step log, and x402-pqc payment
                envelope in Veil is signed with ML-DSA-65 — replacing secp256k1 ECDSA throughout the
                entire stack.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Security Level', value: 'AES-192 equivalent (NIST Level 3)' },
                  { label: 'Public Key Size', value: '1952 bytes' },
                  { label: 'Signature Size', value: '3293 bytes' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl"
                    style={{ background: '#111', border: '1px solid rgba(99,102,241,0.15)' }}
                  >
                    <p
                      className="font-rajdhani uppercase mb-1"
                      style={{ color: '#666', fontSize: '10px', letterSpacing: '1.5px' }}
                    >
                      {stat.label}
                    </p>
                    <p className="font-mono text-white" style={{ fontSize: '13px' }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <p
                className="font-rajdhani mt-5 leading-relaxed"
                style={{ color: '#666', fontSize: '13.5px' }}
              >
                ML-DSA-65 is deterministic — no random nonce required at signing time, eliminating the
                class of nonce-reuse attacks that have historically compromised ECDSA wallets. Every Ghost
                execution step is individually signed, creating a verifiable chain of custody from intent
                to settlement.
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* Quantum timeline */}
      <section className="relative z-10 py-16 px-4" style={{ background: '#000000' }}>
        <div className="max-w-4xl mx-auto">
          <Section>
            <h2
              className="font-orbitron font-bold text-white text-center mb-12"
              style={{ fontSize: 'clamp(20px, 3.5vw, 32px)' }}
            >
              The Quantum Threat Timeline
            </h2>
          </Section>

          <div className="relative">
            {/* Track line */}
            <div
              className="hidden md:block absolute left-[130px] top-6 bottom-6 w-px"
              style={{ background: 'linear-gradient(to bottom, #A855F7 0%, #EC4899 100%)' }}
            />

            <div className="flex flex-col gap-10">
              {TIMELINE.map((item, i) => (
                <Section key={item.year}>
                  <div className="flex gap-6 md:gap-0 items-start">
                    {/* Year */}
                    <div className="md:w-[130px] md:text-right md:pr-10 flex-shrink-0">
                      <span
                        className="font-orbitron font-bold"
                        style={{
                          fontSize: '22px',
                          color: item.active ? '#A855F7' : '#444',
                        }}
                      >
                        {item.year}
                      </span>
                    </div>

                    {/* Dot */}
                    <div className="hidden md:flex flex-col items-center z-10">
                      <div
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                        style={{
                          background: item.active ? '#A855F7' : '#222',
                          borderColor: item.active ? '#A855F7' : '#444',
                          boxShadow: item.active ? '0 0 16px rgba(168,85,247,0.6)' : 'none',
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="md:pl-10 flex-1">
                      <p
                        className="font-orbitron font-bold text-white mb-1"
                        style={{ fontSize: '15px' }}
                      >
                        {item.label}
                        {item.active && (
                          <span
                            className="ml-3 font-rajdhani uppercase"
                            style={{
                              color: '#A855F7',
                              fontSize: '10px',
                              letterSpacing: '1.5px',
                              verticalAlign: 'middle',
                            }}
                          >
                            ← YOU ARE HERE
                          </span>
                        )}
                      </p>
                      <p
                        className="font-rajdhani leading-relaxed"
                        style={{ color: '#888', fontSize: '14.5px' }}
                      >
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </Section>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fuzzy extractor */}
      <section className="relative z-10 py-12 px-4" style={{ background: '#000000' }}>
        <div className="max-w-5xl mx-auto">
          <Section>
            <div
              className="p-8 rounded-2xl"
              style={{
                background: '#0A0A0A',
                border: '1px solid rgba(236,72,153,0.25)',
                borderTop: '4px solid #EC4899',
              }}
            >
              <p
                className="font-mono mb-1"
                style={{ fontSize: '20px', color: '#F472B6' }}
              >
                Fuzzy Extractor
              </p>
              <p
                className="font-rajdhani uppercase mb-6"
                style={{ color: '#666', fontSize: '11px', letterSpacing: '2px' }}
              >
                Biometric Key Derivation · No Template Storage
              </p>

              <p
                className="font-rajdhani leading-relaxed mb-6"
                style={{ color: '#CCCCCC', fontSize: '15px' }}
              >
                Veil never stores your biometric. Instead, a fuzzy extractor maps your biometric reading
                (face geometry, fingerprint minutiae) to a stable 256-bit seed, tolerating natural
                inter-measurement variation while producing a cryptographically uniform output.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {[
                  {
                    step: '01',
                    title: 'Enrollment',
                    body: 'On first auth, your biometric is processed into a helper string P and secret seed S. S seeds your ML-DSA-65/ML-KEM-768 keypair.',
                  },
                  {
                    step: '02',
                    title: 'Reproduction',
                    body: 'On subsequent auths, the fuzzy extractor uses P and a fresh biometric reading w’ to recover S, even if w’ ≠ w (within error tolerance).',
                  },
                  {
                    step: '03',
                    title: 'Key Derivation',
                    body: 'S feeds into HKDF-SHA3-512 to derive your wallet signing key and encapsulation key. Session-scoped. Never persisted.',
                  },
                ].map((card) => (
                  <div
                    key={card.step}
                    className="p-5 rounded-xl"
                    style={{ background: '#111', border: '1px solid rgba(236,72,153,0.15)' }}
                  >
                    <p
                      className="font-orbitron font-bold mb-2"
                      style={{ color: '#F472B6', fontSize: '12px' }}
                    >
                      {card.step}
                    </p>
                    <p className="font-orbitron text-white mb-2" style={{ fontSize: '14px' }}>
                      {card.title}
                    </p>
                    <p className="font-rajdhani" style={{ color: '#888', fontSize: '13.5px', lineHeight: 1.6 }}>
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>

              <p
                className="font-rajdhani"
                style={{ color: '#666', fontSize: '13.5px' }}
              >
                Helper string P is stored locally (device secure enclave). It reveals nothing about S
                without the biometric. Even if P is leaked, an attacker without your biometric cannot
                derive S — and without S, there are no keys.
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* Halborn audit */}
      <section className="relative z-10 py-12 px-4 pb-24" style={{ background: '#000000' }}>
        <div className="max-w-5xl mx-auto">
          <Section>
            <div
              className="p-8 rounded-2xl"
              style={{
                background: '#0A0A0A',
                border: '1px solid rgba(168,85,247,0.2)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <p
                    className="font-orbitron font-bold text-white mb-1"
                    style={{ fontSize: '20px' }}
                  >
                    Security Audit
                  </p>
                  <p
                    className="font-rajdhani uppercase"
                    style={{ color: '#666', fontSize: '11px', letterSpacing: '2px' }}
                  >
                    Halborn Security · Independent Third-Party Review
                  </p>
                </div>
                <span
                  className="font-rajdhani uppercase px-4 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.35)',
                    color: '#A855F7',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                  }}
                >
                  IN PROGRESS
                </span>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {AUDIT_STATUS.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-3 px-4 rounded-xl"
                    style={{ background: '#111', border: '1px solid rgba(168,85,247,0.1)' }}
                  >
                    <span
                      className="font-rajdhani uppercase"
                      style={{ color: '#666', fontSize: '11px', letterSpacing: '1.5px' }}
                    >
                      {row.label}
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '13px',
                        color: row.ok === true ? '#A855F7' : row.ok === null ? '#666' : '#EF4444',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <p
                className="font-rajdhani leading-relaxed"
                style={{ color: '#666', fontSize: '13.5px' }}
              >
                All Veil smart contracts (excluding x402PQCPayments, which is already Base mainnet live)
                are gated on a clean Halborn audit before any mainnet deployment. The PQC cryptographic
                layer is included in scope. The public report will be linked here upon completion. No
                deadline pressure moves that gate.
              </p>
            </div>
          </Section>
        </div>
      </section>
    </>
  )
}
