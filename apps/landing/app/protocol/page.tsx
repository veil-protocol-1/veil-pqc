'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const LAYERS = [
  {
    id: 'octra',
    label: 'Layer 1',
    name: 'Octra FHE Circles',
    color: '#A855F7',
    description:
      'Ghost executes AI inference and DeFi reasoning inside Octra Circles — ephemeral fully homomorphic execution environments. No plaintext ever leaves the boundary. The node never sees your intent.',
    bullets: [
      'RLWE/CKKS homomorphic encryption for inference',
      'ML-DSA-65 signed step broadcasts per execution',
      'Circle sessions are stateless and auditable',
      'JSON-RPC 2.0 to octra.network/rpc',
    ],
  },
  {
    id: 'base',
    label: 'Layer 2',
    name: 'Base Settlement',
    color: '#6366F1',
    description:
      'Finality lands on Base (Ethereum L2). x402PQCPayments (Base mainnet) records every payment ledger entry. VEILToken and VEILTreasury govern the economic layer. Gnosis Safe multisig owns all mainnet contracts.',
    bullets: [
      'x402PQCPayments: 0x8F446afA9877C79F3CCb5eaA5b6503752817223f',
      'Owner: 0xdEaD1f7583DEFE7A7fD701ea04ba49C14f871a0b (Gnosis Safe)',
      'renounceOwnership() always reverts — no lockout possible',
      'Payment ledger only — contract never holds funds',
    ],
  },
  {
    id: 'pqctransport',
    label: 'Layer 3',
    name: 'PQCTransport',
    color: '#EC4899',
    description:
      'All data in transit is sealed inside PQCEnvelopes: ML-KEM-768 key encapsulation for forward-secret session keys, ML-DSA-65 signatures on every message. No classical TLS assumption. Quantum-resistant end-to-end.',
    bullets: [
      'ML-KEM-768 (FIPS 203) key encapsulation',
      'ML-DSA-65 (FIPS 204) message signing',
      'Hybrid KEM-DEM: ephemeral KEM + AES-256-GCM payload',
      'Version-tagged envelopes — forward migration path built in',
    ],
  },
]

const FLOW_STEPS = [
  { n: '01', title: 'Biometric Capture', body: 'FaceID / fingerprint triggers fuzzy extractor. A 256-bit key is derived from your biometric template — never stored, re-derived on each auth.' },
  { n: '02', title: 'Key Derivation', body: 'ML-DSA-65 signing key and ML-KEM-768 encapsulation key are derived from the biometric seed via HKDF-SHA3-512. Keys are session-scoped.' },
  { n: '03', title: 'Ghost Intent Parsing', body: 'Natural language intent is encrypted into a PQCEnvelope and sent to POST /ghost/intent. The DistilBERT-based classifier maps intent to action and tier.' },
  { n: '04', title: 'FHE Circle Execution', body: 'Ghost opens an Octra Circle session via octra.network/rpc. The DeFi reasoning step executes homomorphically — no plaintext on the node.' },
  { n: '05', title: 'Base Settlement', body: 'Execution result is signed (ML-DSA-65) and returned. If a payment is involved, the x402-pqc header is verified and the payment ledger entry is recorded on Base mainnet.' },
  { n: '06', title: 'x402-pqc Payment', body: 'Every API call carries an x-402-pqc-payment header: a base64 JSON envelope containing amount, recipient, network, and ML-DSA-65 signature. Verified on-chain at settlement.' },
]

const PAYMENT_HEADER_EXAMPLE = `// Build the x402-pqc payment header
import { signX402PQC } from '@veil_/x402-pqc'

const header = await signX402PQC({
  amount:    '0.002',          // USD — simple tier
  currency:  'USD',
  recipient: '0x7776191...',   // VEIL Treasury on Base
  network:   'base',
  signingKey: wallet.signingKey, // ML-DSA-65 private key
})

// Attach to every Ghost API request
fetch('https://veilprotocol.net/ghost/intent', {
  method:  'POST',
  headers: {
    'Content-Type':        'application/json',
    'x-402-pqc-payment':   header,  // base64 JSON envelope
  },
  body: JSON.stringify({ message: 'Swap 100 USDC to ETH' }),
})

// Header format (decoded):
// {
//   "amount":    "0.002",
//   "currency":  "USD",
//   "recipient": "0x77761912b6435287f2b4DaAe93c02611351e7750",
//   "network":   "base",
//   "timestamp": 1750000000000,
//   "publicKey": "<ML-DSA-65 pubkey hex>",
//   "signature": "<ML-DSA-65 signature hex>"
// }`

export default function ProtocolPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true, margin: '-80px' })

  return (
    <>
      <Nav />
      <main style={{ background: '#000000', minHeight: '100vh' }}>

        {/* Hero */}
        <section
          ref={heroRef}
          className="relative z-10 pt-36 pb-20 px-4 flex flex-col items-center text-center"
          style={{ background: '#000000' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 70%)',
            }}
          />
          <motion.p
            className="font-rajdhani uppercase relative z-10 mb-4"
            style={{ color: '#A855F7', fontSize: '12px', letterSpacing: '3px' }}
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            TECHNICAL DEEP DIVE
          </motion.p>
          <motion.h1
            className="font-orbitron font-bold text-white relative z-10"
            style={{ fontSize: 'clamp(36px, 7vw, 72px)', lineHeight: 1.05 }}
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          >
            The Veil Protocol
          </motion.h1>
          <motion.p
            className="font-rajdhani relative z-10 mt-6 max-w-[680px] leading-relaxed"
            style={{ color: '#888888', fontSize: '18px' }}
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Three layers. One sovereign identity. Post-quantum from key derivation to settlement.
          </motion.p>
        </section>

        {/* Three-layer architecture */}
        <section className="relative z-10 py-16 px-4" style={{ background: '#000000' }}>
          <div className="max-w-6xl mx-auto">
            <Section>
              <h2
                className="font-orbitron font-bold text-white text-center mb-12"
                style={{ fontSize: 'clamp(22px, 4vw, 36px)' }}
              >
                Three-Layer Architecture
              </h2>
            </Section>

            <div className="flex flex-col gap-6">
              {LAYERS.map((layer, i) => (
                <Section key={layer.id}>
                  <div
                    className="flex flex-col md:flex-row gap-8 p-8 rounded-2xl"
                    style={{
                      background: '#0A0A0A',
                      border: `1px solid ${layer.color}33`,
                      borderLeft: `4px solid ${layer.color}`,
                    }}
                  >
                    <div className="flex-shrink-0">
                      <p
                        className="font-rajdhani uppercase"
                        style={{ color: layer.color, fontSize: '11px', letterSpacing: '2px' }}
                      >
                        {layer.label}
                      </p>
                      <h3
                        className="font-orbitron font-bold text-white mt-1"
                        style={{ fontSize: 'clamp(18px, 2.5vw, 24px)' }}
                      >
                        {layer.name}
                      </h3>
                    </div>
                    <div className="flex-1">
                      <p
                        className="font-rajdhani leading-relaxed mb-5"
                        style={{ color: '#CCCCCC', fontSize: '15px' }}
                      >
                        {layer.description}
                      </p>
                      <ul className="flex flex-col gap-2">
                        {layer.bullets.map((b, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <span
                              className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                              style={{ background: layer.color }}
                            />
                            <code
                              className="font-mono"
                              style={{ color: '#888888', fontSize: '13px' }}
                            >
                              {b}
                            </code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Section>
              ))}
            </div>
          </div>
        </section>

        {/* Transaction flow */}
        <section className="relative z-10 py-16 px-4" style={{ background: '#000000' }}>
          <div className="max-w-4xl mx-auto">
            <Section>
              <h2
                className="font-orbitron font-bold text-white text-center mb-12"
                style={{ fontSize: 'clamp(22px, 4vw, 36px)' }}
              >
                End-to-End Transaction Flow
              </h2>
            </Section>

            <div className="relative flex flex-col gap-0">
              {/* Vertical line */}
              <div
                className="absolute left-[28px] top-8 bottom-8 w-px hidden md:block"
                style={{ background: 'linear-gradient(to bottom, #A855F7, #6366F1, #EC4899)' }}
              />
              {FLOW_STEPS.map((step, i) => (
                <Section key={step.n}>
                  <div className="flex gap-6 items-start py-6">
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-orbitron font-bold text-white z-10"
                      style={{ background: '#0A0A0A', border: '2px solid #A855F7', fontSize: '13px' }}
                    >
                      {step.n}
                    </div>
                    <div className="pt-2">
                      <h3
                        className="font-orbitron font-bold text-white mb-2"
                        style={{ fontSize: '16px' }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="font-rajdhani leading-relaxed"
                        style={{ color: '#888888', fontSize: '15px' }}
                      >
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Section>
              ))}
            </div>
          </div>
        </section>

        {/* x402-pqc standard */}
        <section className="relative z-10 py-16 px-4 pb-24" style={{ background: '#000000' }}>
          <div className="max-w-4xl mx-auto">
            <Section>
              <h2
                className="font-orbitron font-bold text-white text-center mb-4"
                style={{ fontSize: 'clamp(22px, 4vw, 36px)' }}
              >
                The x402-pqc Standard
              </h2>
              <p
                className="font-rajdhani text-center mb-10 max-w-2xl mx-auto leading-relaxed"
                style={{ color: '#888888', fontSize: '16px' }}
              >
                x402-pqc extends the HTTP 402 Payment Required status code with a post-quantum payment
                layer. Every AI agent call carries a self-authenticating payment envelope signed with
                ML-DSA-65 — no API keys, no OAuth, no classical ECDSA. Submitted to the Linux Foundation
                and tracked at{' '}
                <a
                  href="https://github.com/x402-foundation/x402/issues/2664"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#A855F7' }}
                  className="hover:underline"
                >
                  x402-foundation/x402#2664
                </a>
                .
              </p>
            </Section>

            <Section>
              <div
                className="code-block w-full text-left overflow-x-auto"
                style={{ fontSize: '13px' }}
              >
                {PAYMENT_HEADER_EXAMPLE.split('\n').map((line, i) => {
                  if (line.startsWith('//')) {
                    return (
                      <div key={i} className="leading-relaxed code-comment" style={{ whiteSpace: 'pre' }}>
                        {line}
                      </div>
                    )
                  }
                  if (line.includes("'@veil_/") || line.includes('"@veil_/')) {
                    return (
                      <div key={i} className="leading-relaxed" style={{ whiteSpace: 'pre' }}>
                        {line.split(/('.*?'|".*?")/g).map((part, j) =>
                          part.startsWith("'") || part.startsWith('"') ? (
                            <span key={j} className="code-string">{part}</span>
                          ) : (
                            <span key={j} className="text-white">{part}</span>
                          )
                        )}
                      </div>
                    )
                  }
                  return (
                    <div key={i} className="leading-relaxed text-white" style={{ whiteSpace: 'pre' }}>
                      {line}
                    </div>
                  )
                })}
              </div>
            </Section>

            <Section>
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                {[
                  'ML-DSA-65 SIGNED',
                  'LINUX FOUNDATION SUBMISSION',
                  'APACHE 2.0',
                  'BASE MAINNET LIVE',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="pill"
                    style={{ fontSize: '11px', padding: '6px 16px' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
