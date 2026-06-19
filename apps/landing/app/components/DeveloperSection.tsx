'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const CODE_LINES = [
  { tokens: [{ type: 'keyword', text: 'import' }, { type: 'var', text: ' { x402pqc } ' }, { type: 'keyword', text: 'from' }, { type: 'string', text: " '@veil/x402-pqc'" }] },
  { tokens: [] },
  { tokens: [{ type: 'keyword', text: 'const' }, { type: 'var', text: ' payment ' }, { type: 'keyword', text: '=' }, { type: 'var', text: ' ' }, { type: 'keyword', text: 'await' }, { type: 'var', text: ' x402pqc.' }, { type: 'prop', text: 'sign' }, { type: 'var', text: '({' }] },
  { tokens: [{ type: 'var', text: '  ' }, { type: 'prop', text: 'amount' }, { type: 'var', text: ': ' }, { type: 'string', text: "'50'" }, { type: 'var', text: ',' }] },
  { tokens: [{ type: 'var', text: '  ' }, { type: 'prop', text: 'currency' }, { type: 'var', text: ': ' }, { type: 'string', text: "'USDC'" }, { type: 'var', text: ',' }] },
  { tokens: [{ type: 'var', text: '  ' }, { type: 'prop', text: 'recipient' }, { type: 'var', text: ': ' }, { type: 'string', text: "'0x...'" }, { type: 'var', text: ',' }] },
  { tokens: [{ type: 'var', text: '  ' }, { type: 'prop', text: 'network' }, { type: 'var', text: ': ' }, { type: 'string', text: "'base'" }] },
  { tokens: [{ type: 'var', text: '})' }] },
  { tokens: [{ type: 'comment', text: '// ML-DSA-65 quantum-resistant signature' }] },
]

export default function DeveloperSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText('npm install @veil/x402-pqc')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      id="developers"
      ref={ref}
      className="relative z-10 py-24 px-4"
      style={{ background: '#000000' }}
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="font-orbitron font-bold text-white mb-4"
            style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}
          >
            Built on Open Standards.
          </h2>
          <p className="font-rajdhani max-w-xl mx-auto" style={{ color: '#888888', fontSize: '16px', lineHeight: 1.7 }}>
            x402-pqc is our quantum-resistant payment standard, submitted to the Linux Foundation. The PQC payment layer for Base.
          </p>
        </motion.div>

        {/* Code block */}
        <motion.div
          className="code-block w-full text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {CODE_LINES.map((line, i) => (
            <div key={i} className="leading-relaxed">
              {line.tokens.length === 0 ? (
                <br />
              ) : (
                line.tokens.map((token, j) => (
                  <span key={j} className={`code-${token.type}`}>
                    {token.text}
                  </span>
                ))
              )}
            </div>
          ))}
        </motion.div>

        {/* Pills */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          {['LINUX FOUNDATION SUBMISSION', 'APACHE 2.0 OPEN SOURCE'].map((p) => (
            <span key={p} className="pill" style={{ fontSize: '11px', padding: '6px 16px' }}>{p}</span>
          ))}
        </motion.div>

        {/* NPM install copy */}
        <motion.button
          onClick={handleCopy}
          className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200"
          style={{
            background: '#0A0A0A',
            border: '1px solid rgba(168,85,247,0.35)',
            cursor: 'pointer',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          whileHover={{ borderColor: 'rgba(168,85,247,0.7)', boxShadow: '0 0 20px rgba(168,85,247,0.15)' }}
        >
          <code className="font-mono text-white" style={{ fontSize: '14px' }}>
            npm install @veil/x402-pqc
          </code>
          <span className="font-rajdhani text-purple-400 text-sm ml-4 transition-all duration-200">
            {copied ? (
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5 5.5-5" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                COPIED
              </span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="#A855F7" strokeWidth="1.2" />
                <path d="M3 11V3h8" stroke="#A855F7" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
          </span>
        </motion.button>
      </div>
    </section>
  )
}
