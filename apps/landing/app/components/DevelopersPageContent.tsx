'use client'

import { useRef, useState } from 'react'
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

function CopyButton({ text, label = 'COPY' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
      style={{
        background: 'rgba(168,85,247,0.08)',
        border: '1px solid rgba(168,85,247,0.25)',
        cursor: 'pointer',
      }}
    >
      <span className="font-rajdhani text-purple-400" style={{ fontSize: '11px', letterSpacing: '1px' }}>
        {copied ? 'COPIED' : label}
      </span>
    </button>
  )
}

function InstallLine({ pkg }: { pkg: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
      style={{ background: '#000', border: '1px solid rgba(168,85,247,0.2)' }}
    >
      <code className="font-mono text-white" style={{ fontSize: '13px' }}>
        npm install {pkg}
      </code>
      <CopyButton text={`npm install ${pkg}`} />
    </div>
  )
}

const SDKS = [
  {
    id: 'pqc-wallet',
    pkg: '@veil_/pqc-wallet',
    version: '1.0.1',
    tagline: 'Quantum-resistant wallet primitives',
    description:
      'ML-DSA-65 signing and ML-KEM-768 key encapsulation for Base and EVM networks. The foundational keypair layer — everything else builds on top of this.',
    example: `import { generateKeypair, sign, verify } from '@veil_/pqc-wallet'

// Generate a post-quantum keypair
const keypair = await generateKeypair()
// keypair.signingKey    — ML-DSA-65 private key (4032 bytes)
// keypair.publicKey.dsa — ML-DSA-65 public key  (1952 bytes)
// keypair.publicKey.kem — ML-KEM-768 public key  (1184 bytes)

// Sign a transaction
const sig = await sign(keypair.signingKey, txBytes)

// Verify
const ok = await verify(keypair.publicKey.dsa, txBytes, sig)`,
  },
  {
    id: 'auth',
    pkg: '@veil_/auth',
    version: '1.0.2',
    tagline: 'Biometric SSI with ZK proof of authentication',
    description:
      'PQC-native authentication. ML-DSA-65 identity proofs and session management for AI agents and dApps. Wraps the fuzzy extractor biometric key derivation flow.',
    example: `import { VeilAuth } from '@veil_/auth'

const auth = new VeilAuth()

// Enroll from biometric template
const session = await auth.enroll(biometricTemplate)

// On subsequent logins — re-derives keys from biometric
const session = await auth.authenticate(biometricTemplate)

// session.keypair.signingKey is ready for signing
// session.token is a short-lived JWT for API calls`,
  },
  {
    id: 'x402-pqc',
    pkg: '@veil_/x402-pqc',
    version: '1.0.2',
    tagline: 'Quantum-resistant HTTP 402 payment protocol',
    description:
      'Drop-in x402 payment layer with ML-DSA-65 signatures. Linux Foundation submission pending. Used internally by Veil API for all Ghost endpoint payments.',
    example: `import { signX402PQC, verifyX402PQCHeader } from '@veil_/x402-pqc'

// Create a payment header for a Ghost API call
const header = await signX402PQC({
  amount:    '0.002',    // USD
  currency:  'USD',
  recipient: '0x77761912b6435287f2b4DaAe93c02611351e7750',
  network:   'base',
  signingKey: keypair.signingKey,
})

// Verify inbound (server side)
const result = verifyX402PQCHeader(header)
// result.valid     — boolean
// result.recipient — verified payee address`,
  },
  {
    id: 'circles',
    pkg: '@veil_/circles',
    version: '1.0.2',
    tagline: 'Octra Circle interface for private agent execution',
    description:
      'Ghost inference inside Octra Circles. Private DeFi execution via FHE. No node ever sees your plaintext instructions. Connects to octra.network/rpc via JSON-RPC 2.0.',
    example: `import { CircleSession } from '@veil_/circles'

const session = new CircleSession({ keypair, reuse: true })
await session.create()

// Encrypt a query for FHE inference
const queryBytes = Buffer.from('swap 100 USDC to ETH')
const result = await session.private_predict(queryBytes)

// result is encrypted — decrypt client-side with your ML-KEM session key
console.log(result) // Uint8Array (ciphertext)`,
  },
  {
    id: 'agent-registry',
    pkg: '@veil_/agent-registry',
    version: '1.0.1',
    tagline: 'Agent-callable wrappers: MCP, LangChain, OpenAI functions, REST',
    description:
      'Expose Ghost AI to any agent framework. One package, four integration targets. Run as a local MCP server or import as a library.',
    example: `// As an MCP server (Claude Desktop, Cursor, etc.)
// Add to your MCP config:
{
  "mcpServers": {
    "veil-ghost": {
      "command": "npx",
      "args": ["@veil_/agent-registry"]
    }
  }
}

// Or as a LangChain tool
import { VeilGhostTool } from '@veil_/agent-registry/langchain'
const tool = new VeilGhostTool({ apiKey: session.token })`,
  },
]

const X402_GUIDE = `// ─── 1. Install ──────────────────────────────────────────────────────
npm install @veil_/pqc-wallet @veil_/x402-pqc

// ─── 2. Generate keypair ──────────────────────────────────────────────
import { generateKeypair } from '@veil_/pqc-wallet'
import { signX402PQC } from '@veil_/x402-pqc'

const keypair = await generateKeypair()

// ─── 3. Build payment header ──────────────────────────────────────────
const VEIL_TREASURY = '0x77761912b6435287f2b4DaAe93c02611351e7750'

const paymentHeader = await signX402PQC({
  amount:    '0.002',        // Tier: simple ($0.002 USD)
  currency:  'USD',
  recipient: VEIL_TREASURY,
  network:   'base',
  signingKey: keypair.signingKey,
})

// ─── 4. Call Ghost API ────────────────────────────────────────────────
const res = await fetch('https://veilprotocol.net/ghost/intent', {
  method: 'POST',
  headers: {
    'Content-Type':       'application/json',
    'x-402-pqc-payment':  paymentHeader,
  },
  body: JSON.stringify({ message: 'Swap 100 USDC to ETH on Base' }),
})

const data = await res.json()
// data.intent       — parsed intent object
// data.confidence   — float 0–1
// data.ghostResponse — human-readable confirmation
console.log(data.ghostResponse)
// "Understood, Sovereign. Preparing to swap 100 USDC to ETH."

// ─── 5. Handle 402 (payment verification failure) ─────────────────────
if (res.status === 402) {
  const required = await res.json()
  // required.amount    — amount required
  // required.recipient — where to pay
  // required.network   — 'base'
  // required.contract  — x402PQCPayments address on Base mainnet
}`

const GHOST_TIERS = [
  {
    id: 'simple',
    name: 'Simple',
    price: '$0.002',
    color: '#A855F7',
    actions: ['swap', 'send', 'balance check', 'price query'],
    detail: 'Parser-only. DistilBERT classifier maps intent to action. No FHE execution.',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$0.010',
    color: '#6366F1',
    actions: ['earn', 'stake', 'lend', 'repay'],
    detail: 'DeFi reasoning layer. Aave, Aerodrome, Uniswap fetchers. Returns protocol + APY context.',
  },
  {
    id: 'complex',
    name: 'Complex',
    price: '$0.050',
    color: '#EC4899',
    actions: ['borrow', 'bridge', 'rebalance'],
    detail: 'Full FHE Circle execution via octra.network/rpc. Multi-step reasoning, portfolio-aware.',
  },
]

const GHOST_ENDPOINTS = [
  {
    method: 'POST',
    path: '/ghost/intent',
    auth: 'x-402-pqc-payment',
    tier: 'auto-detected',
    description: 'Parse natural language into a structured DeFi intent. Tier is auto-classified from the message.',
    request: '{ "message": "Swap 100 USDC to ETH" }',
    response: '{ "intent": { "action": "swap", "token": "USDC", "toToken": "ETH", "amount": "100" }, "confidence": 0.95, "ghostResponse": "..." }',
  },
  {
    method: 'POST',
    path: '/ghost/query',
    auth: 'x-402-pqc-payment',
    tier: 'simple | standard | complex',
    description: 'Submit an encrypted FHE query to an Octra Circle. Requires encryptedQuery (hex) from CircleSession.',
    request: '{ "encryptedQuery": "<hex>", "complexity": "simple", "sessionId": "<uuid>" }',
    response: '{ "encryptedResult": "<hex>", "sessionId": "<uuid>", "timestamp": 1750000000 }',
  },
  {
    method: 'POST',
    path: '/ghost/steps',
    auth: 'PQCEnvelope (ML-DSA-65 signed)',
    tier: 'internal relay only',
    description: 'Ghost execution step broadcast. Not payment-gated — uses PQCEnvelope signature for authentication. Internal use.',
    request: '{ "kemCiphertext": "<hex>", "encryptedPayload": "<hex>", "senderPublicKey": "<hex>", "signature": "<hex>", "timestamp": 1750000000, "version": "1.0" }',
    response: '{ "acknowledged": true, "txHash": "<hash>" }',
  },
]

export default function DevelopersPageContent() {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true, margin: '-80px' })

  return (
    <>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative z-10 pt-36 pb-16 px-4 flex flex-col items-center text-center"
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
          className="font-orbitron font-bold text-white relative z-10"
          style={{ fontSize: 'clamp(36px, 6.5vw, 64px)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          Build on Veil.
        </motion.h1>

        <motion.p
          className="font-rajdhani relative z-10 mt-5 max-w-[600px] leading-relaxed"
          style={{ color: '#888888', fontSize: '18px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          Five production-ready SDKs. PQC payments, biometric identity, private FHE inference, and
          agent-native wrappers — all on Base.
        </motion.p>

        <motion.a
          href="https://github.com/veil-protocol-1/veil-pqc"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-8 flex items-center gap-3 px-6 py-3 rounded-xl font-rajdhani uppercase transition-all duration-200"
          style={{
            background: '#0A0A0A',
            border: '1px solid rgba(168,85,247,0.35)',
            color: '#A855F7',
            fontSize: '13px',
            letterSpacing: '1.5px',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          whileHover={{ borderColor: 'rgba(168,85,247,0.7)', boxShadow: '0 0 20px rgba(168,85,247,0.15)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          github.com/veil-protocol-1/veil-pqc
        </motion.a>
      </section>

      {/* SDK cards */}
      <section className="relative z-10 py-12 px-4" style={{ background: '#000000' }}>
        <div className="max-w-5xl mx-auto">
          <Section>
            <h2
              className="font-orbitron font-bold text-white mb-8"
              style={{ fontSize: 'clamp(20px, 3.5vw, 30px)' }}
            >
              SDK Reference
            </h2>
          </Section>

          <div className="flex flex-col gap-8">
            {SDKS.map((sdk) => (
              <Section key={sdk.id}>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: '#0A0A0A',
                    border: '1px solid rgba(168,85,247,0.25)',
                  }}
                >
                  {/* Header */}
                  <div
                    className="flex flex-wrap items-start justify-between gap-4 p-6 pb-4"
                    style={{ borderBottom: '1px solid rgba(168,85,247,0.1)' }}
                  >
                    <div>
                      <code className="font-mono text-purple-400" style={{ fontSize: '17px' }}>
                        {sdk.pkg}
                      </code>
                      <p
                        className="font-rajdhani mt-1"
                        style={{ color: '#888', fontSize: '13px' }}
                      >
                        {sdk.tagline}
                      </p>
                    </div>
                    <span
                      className="font-mono"
                      style={{
                        color: '#666',
                        fontSize: '12px',
                        border: '1px solid rgba(168,85,247,0.2)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      v{sdk.version}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col gap-5">
                    <InstallLine pkg={sdk.pkg} />

                    <p
                      className="font-rajdhani leading-relaxed"
                      style={{ color: '#888', fontSize: '14.5px' }}
                    >
                      {sdk.description}
                    </p>

                    {/* Code example */}
                    <div
                      className="rounded-xl overflow-x-auto"
                      style={{
                        background: '#000',
                        border: '1px solid rgba(168,85,247,0.15)',
                        padding: '16px 20px',
                      }}
                    >
                      {sdk.example.split('\n').map((line, i) => (
                        <div
                          key={i}
                          className="font-mono leading-relaxed"
                          style={{ whiteSpace: 'pre', fontSize: '12.5px' }}
                        >
                          {line.startsWith('//') ? (
                            <span style={{ color: '#555' }}>{line}</span>
                          ) : line.includes("'@veil_/") || line.includes("'base'") || line.includes("'USD'") ? (
                            <span style={{ color: '#ccc' }}>
                              {line.split(/('.*?')/g).map((part, j) =>
                                part.startsWith("'") ? (
                                  <span key={j} style={{ color: '#A3E635' }}>{part}</span>
                                ) : (
                                  <span key={j}>{part}</span>
                                )
                              )}
                            </span>
                          ) : (
                            <span style={{ color: '#ccc' }}>{line}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* x402-pqc payment integration guide */}
      <section className="relative z-10 py-16 px-4" style={{ background: '#000000' }}>
        <div className="max-w-5xl mx-auto">
          <Section>
            <h2
              className="font-orbitron font-bold text-white mb-3"
              style={{ fontSize: 'clamp(20px, 3.5vw, 30px)' }}
            >
              x402-pqc Payment Integration
            </h2>
            <p className="font-rajdhani mb-8" style={{ color: '#888', fontSize: '15px' }}>
              Every Ghost API call requires a valid{' '}
              <code className="font-mono text-purple-400" style={{ fontSize: '13px' }}>
                x-402-pqc-payment
              </code>{' '}
              header. Here&apos;s the complete flow from keypair to verified call.
            </p>
          </Section>

          <Section>
            <div
              className="rounded-2xl overflow-x-auto"
              style={{
                background: '#0A0A0A',
                border: '1px solid rgba(168,85,247,0.25)',
                padding: '24px',
              }}
            >
              {X402_GUIDE.split('\n').map((line, i) => (
                <div
                  key={i}
                  className="font-mono leading-relaxed"
                  style={{ whiteSpace: 'pre', fontSize: '12.5px' }}
                >
                  {line.startsWith('// ─') ? (
                    <span style={{ color: '#A855F7' }}>{line}</span>
                  ) : line.startsWith('//') ? (
                    <span style={{ color: '#555' }}>{line}</span>
                  ) : line.includes("'@veil_/") || line.includes("'base'") || line.includes("'USD'") || line.includes("'0x") || line.includes("'Content-") || line.includes("'x-402") ? (
                    <span style={{ color: '#ccc' }}>
                      {line.split(/('.*?')/g).map((part, j) =>
                        part.startsWith("'") ? (
                          <span key={j} style={{ color: '#A3E635' }}>{part}</span>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </span>
                  ) : (
                    <span style={{ color: '#ccc' }}>{line}</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Ghost API endpoint docs */}
      <section className="relative z-10 py-16 px-4" style={{ background: '#000000' }}>
        <div className="max-w-5xl mx-auto">
          <Section>
            <h2
              className="font-orbitron font-bold text-white mb-2"
              style={{ fontSize: 'clamp(20px, 3.5vw, 30px)' }}
            >
              Ghost API
            </h2>
            <p className="font-rajdhani mb-3" style={{ color: '#888', fontSize: '15px' }}>
              Base URL:{' '}
              <code className="font-mono text-purple-400" style={{ fontSize: '13px' }}>
                https://veilprotocol.net
              </code>
            </p>
          </Section>

          {/* Tier pricing table */}
          <Section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {GHOST_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="p-6 rounded-2xl flex flex-col gap-3"
                  style={{
                    background: '#0A0A0A',
                    border: `1px solid ${tier.color}33`,
                    borderTop: `4px solid ${tier.color}`,
                  }}
                >
                  <div className="flex items-baseline justify-between">
                    <p className="font-orbitron font-bold text-white" style={{ fontSize: '16px' }}>
                      {tier.name}
                    </p>
                    <p className="font-mono" style={{ color: tier.color, fontSize: '18px' }}>
                      {tier.price}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.actions.map((a) => (
                      <span
                        key={a}
                        className="font-mono"
                        style={{
                          background: `${tier.color}11`,
                          border: `1px solid ${tier.color}33`,
                          color: tier.color,
                          fontSize: '10.5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  <p className="font-rajdhani" style={{ color: '#666', fontSize: '13px', lineHeight: 1.6 }}>
                    {tier.detail}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Endpoint docs */}
          <div className="flex flex-col gap-6">
            {GHOST_ENDPOINTS.map((ep) => (
              <Section key={ep.path}>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: '#0A0A0A',
                    border: '1px solid rgba(168,85,247,0.2)',
                  }}
                >
                  <div
                    className="flex flex-wrap items-center gap-4 p-5"
                    style={{ borderBottom: '1px solid rgba(168,85,247,0.1)' }}
                  >
                    <span
                      className="font-mono font-bold"
                      style={{
                        color: '#A3E635',
                        fontSize: '12px',
                        background: 'rgba(163,230,53,0.08)',
                        border: '1px solid rgba(163,230,53,0.2)',
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      {ep.method}
                    </span>
                    <code className="font-mono text-white" style={{ fontSize: '15px' }}>
                      {ep.path}
                    </code>
                  </div>

                  <div className="p-5 flex flex-col gap-4">
                    <p className="font-rajdhani" style={{ color: '#CCCCCC', fontSize: '14.5px' }}>
                      {ep.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        className="p-3 rounded-xl"
                        style={{ background: '#111', border: '1px solid rgba(168,85,247,0.1)' }}
                      >
                        <p
                          className="font-rajdhani uppercase mb-1"
                          style={{ color: '#666', fontSize: '10px', letterSpacing: '1.5px' }}
                        >
                          Auth Header
                        </p>
                        <code className="font-mono text-purple-400" style={{ fontSize: '12px' }}>
                          {ep.auth}
                        </code>
                      </div>
                      <div
                        className="p-3 rounded-xl"
                        style={{ background: '#111', border: '1px solid rgba(168,85,247,0.1)' }}
                      >
                        <p
                          className="font-rajdhani uppercase mb-1"
                          style={{ color: '#666', fontSize: '10px', letterSpacing: '1.5px' }}
                        >
                          Pricing Tier
                        </p>
                        <code className="font-mono text-purple-400" style={{ fontSize: '12px' }}>
                          {ep.tier}
                        </code>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p
                          className="font-rajdhani uppercase mb-2"
                          style={{ color: '#666', fontSize: '10px', letterSpacing: '1.5px' }}
                        >
                          Request Body
                        </p>
                        <div
                          className="p-3 rounded-xl overflow-x-auto"
                          style={{ background: '#000', border: '1px solid rgba(168,85,247,0.1)' }}
                        >
                          <code className="font-mono" style={{ color: '#888', fontSize: '11.5px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {ep.request}
                          </code>
                        </div>
                      </div>
                      <div>
                        <p
                          className="font-rajdhani uppercase mb-2"
                          style={{ color: '#666', fontSize: '10px', letterSpacing: '1.5px' }}
                        >
                          Response
                        </p>
                        <div
                          className="p-3 rounded-xl overflow-x-auto"
                          style={{ background: '#000', border: '1px solid rgba(168,85,247,0.1)' }}
                        >
                          <code className="font-mono" style={{ color: '#888', fontSize: '11.5px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {ep.response}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-20 px-4" style={{ background: '#000000' }}>
        <div className="max-w-3xl mx-auto text-center">
          <Section>
            <p
              className="font-rajdhani italic"
              style={{ color: '#A855F7', fontSize: '16px' }}
            >
              Full API reference, type definitions, and changelogs live in the repo.
            </p>
            <a
              href="https://github.com/veil-protocol-1/veil-pqc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 font-rajdhani uppercase"
              style={{ color: '#666', fontSize: '12px', letterSpacing: '2px' }}
            >
              github.com/veil-protocol-1/veil-pqc →
            </a>
          </Section>
        </div>
      </section>
    </>
  )
}
