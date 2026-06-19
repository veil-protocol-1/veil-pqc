'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const SDKS = [
  {
    id: 'x402-pqc',
    pkg: '@veil_/x402-pqc',
    body: 'Quantum-resistant HTTP payments. ML-DSA-65 signing, ML-KEM-768 key encapsulation. Linux Foundation submission pending. Apache 2.0.',
  },
  {
    id: 'pqc-wallet',
    pkg: '@veil_/pqc-wallet',
    body: 'ML-DSA-65 wallet signing and ML-KEM-768 key encapsulation for Base and EVM networks.',
  },
  {
    id: 'circles',
    pkg: '@veil_/circles',
    body: 'Ghost inference inside Octra Circles. Private DeFi execution via FHE. No node sees your instructions.',
  },
  {
    id: 'auth',
    pkg: '@veil_/auth',
    body: 'PQC-native authentication. ML-DSA-65 identity proofs and session management for AI agents and dApps.',
  },
]

const MCP_CONFIG_LINES = [
  '{',
  '  "mcpServers": {',
  '    "veil-ghost": {',
  '      "command": "npx",',
  '      "args": ["@veil_/agent-registry"]',
  '    }',
  '  }',
  '}',
]

function CopyableInstall({ pkg }: { pkg: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(`npm install ${pkg}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-between gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200"
      style={{
        background: '#000000',
        border: '1px solid rgba(168,85,247,0.25)',
        cursor: 'pointer',
      }}
    >
      <code className="font-mono text-white" style={{ fontSize: '12.5px' }}>
        npm install {pkg}
      </code>
      <span className="font-rajdhani text-purple-400" style={{ fontSize: '11px', flexShrink: 0 }}>
        {copied ? 'COPIED' : 'COPY'}
      </span>
    </button>
  )
}

export default function DevelopersPageContent() {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true, margin: '-80px' })

  const sdkRef = useRef<HTMLDivElement>(null)
  const sdkInView = useInView(sdkRef, { once: true, margin: '-80px' })

  const mcpRef = useRef<HTMLDivElement>(null)
  const mcpInView = useInView(mcpRef, { once: true, margin: '-80px' })

  const [registryCopied, setRegistryCopied] = useState(false)
  const handleRegistryCopy = async () => {
    await navigator.clipboard.writeText('npx @veil_/agent-registry')
    setRegistryCopied(true)
    setTimeout(() => setRegistryCopied(false), 2000)
  }

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
          className="font-rajdhani relative z-10 mt-5 max-w-[560px] leading-relaxed"
          style={{ color: '#888888', fontSize: '18px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          The PQC payment and private inference layer for AI agents and
          autonomous systems on Base.
        </motion.p>
      </section>

      {/* SDK cards */}
      <section ref={sdkRef} className="relative z-10 py-8 px-4" style={{ background: '#000000' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {SDKS.map((sdk, i) => (
            <motion.div
              key={sdk.id}
              initial={{ opacity: 0, y: 30 }}
              animate={sdkInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.65, 0, 0.35, 1] }}
              className="flex flex-col gap-4 p-7 rounded-2xl"
              style={{
                background: '#0A0A0A',
                border: '1px solid rgba(168,85,247,0.3)',
              }}
            >
              <code className="font-mono text-purple-400" style={{ fontSize: '16px' }}>
                {sdk.pkg}
              </code>
              <CopyableInstall pkg={sdk.pkg} />
              <p
                className="font-rajdhani leading-relaxed"
                style={{ color: '#888888', fontSize: '14.5px' }}
              >
                {sdk.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MCP integration */}
      <section ref={mcpRef} className="relative z-10 py-20 px-4" style={{ background: '#000000' }}>
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
          <motion.h2
            className="font-orbitron font-bold text-white"
            style={{ fontSize: 'clamp(22px, 4vw, 32px)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={mcpInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Add Ghost to any AI agent.
          </motion.h2>

          <motion.div
            className="code-block w-full text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={mcpInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {MCP_CONFIG_LINES.map((line, i) => (
              <div key={i} className="leading-relaxed text-white" style={{ whiteSpace: 'pre' }}>
                {line}
              </div>
            ))}
          </motion.div>

          <motion.button
            onClick={handleRegistryCopy}
            className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200"
            style={{
              background: '#0A0A0A',
              border: '1px solid rgba(168,85,247,0.35)',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={mcpInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            whileHover={{ borderColor: 'rgba(168,85,247,0.7)', boxShadow: '0 0 20px rgba(168,85,247,0.15)' }}
          >
            <code className="font-mono text-white" style={{ fontSize: '14px' }}>
              npx @veil_/agent-registry
            </code>
            <span className="font-rajdhani text-purple-400 text-sm ml-4">
              {registryCopied ? 'COPIED' : 'COPY'}
            </span>
          </motion.button>
        </div>
      </section>
    </>
  )
}
