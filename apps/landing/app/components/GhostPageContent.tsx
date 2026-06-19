'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import GhostPhone from './GhostPhone'

const FEATURES = [
  {
    id: 'natural-language',
    title: 'Natural Language',
    body: 'Swap 50 USDC to ETH. Earn yield on my idle balance. Send $20 to Alex. Ghost understands plain English.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path
          d="M6 10a4 4 0 014-4h20a4 4 0 014 4v14a4 4 0 01-4 4H18l-7 6v-6h-1a4 4 0 01-4-4V10z"
          stroke="#A855F7"
          strokeWidth="1.5"
          fill="rgba(168,85,247,0.05)"
        />
        <circle cx="14" cy="17" r="1.4" fill="#A855F7" />
        <circle cx="20" cy="17" r="1.4" fill="#A855F7" />
        <circle cx="26" cy="17" r="1.4" fill="#A855F7" />
      </svg>
    ),
  },
  {
    id: 'fhe-encrypted',
    title: 'FHE Encrypted',
    body: 'Ghost executes inside Octra Circles. No node sees your instructions. Not even Veil. Your financial intent is yours alone.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="9" y="17" width="22" height="16" rx="2.5" stroke="#A855F7" strokeWidth="1.5" fill="rgba(168,85,247,0.05)" />
        <path d="M13 17v-5a7 7 0 0114 0v5" stroke="#A855F7" strokeWidth="1.5" fill="none" />
        <circle cx="20" cy="24" r="2.2" fill="#A855F7" />
        <path d="M20 26.2V29" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'self-improving',
    title: 'Self-Improving',
    body: 'Ghost learns from every transaction across the Veil network — privately, via federated FHE training. Gets smarter with every execution.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 5c-4.5 0-7.5 3-7.5 7 0 2.4 1.1 3.9 2.3 5.2-1.5.9-2.3 2.4-2.3 4.3 0 3 2 5 5 5h.5v3.5a2 2 0 002 2 2 2 0 002-2V26.5h.5c3 0 5-2 5-5 0-1.9-.8-3.4-2.3-4.3 1.2-1.3 2.3-2.8 2.3-5.2 0-4-3-7-7.5-7z"
          stroke="#A855F7"
          strokeWidth="1.4"
          fill="rgba(168,85,247,0.05)"
        />
        <circle cx="16" cy="14" r="1.2" fill="#A855F7" />
        <circle cx="24" cy="14" r="1.2" fill="#A855F7" />
        <path d="M6 10l2 2-2 2M34 10l-2 2 2 2" stroke="#A855F7" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
]

export default function GhostPageContent() {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true, margin: '-80px' })

  const featuresRef = useRef<HTMLDivElement>(null)
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' })

  const demoRef = useRef<HTMLDivElement>(null)
  const demoInView = useInView(demoRef, { once: true, margin: '-80px' })

  return (
    <>
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
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168,85,247,0.1) 0%, transparent 70%)',
          }}
        />

        <motion.h1
          className="font-orbitron font-bold text-white relative z-10"
          style={{ fontSize: 'clamp(48px, 9vw, 80px)', letterSpacing: '2px' }}
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          Ghost.
        </motion.h1>

        <motion.p
          className="font-rajdhani relative z-10 mt-3"
          style={{ color: '#888888', fontSize: '20px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          Your private AI agent.
        </motion.p>

        <motion.p
          className="font-rajdhani relative z-10 mt-6 max-w-[600px] leading-relaxed"
          style={{ color: '#888888', fontSize: '16px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.24 }}
        >
          Ghost executes DeFi in plain English inside Octra Circles — sealed FHE
          environments where no node sees your instructions in plaintext. The
          shadow of you, always working.
        </motion.p>
      </section>

      {/* Feature cards */}
      <section ref={featuresRef} className="relative z-10 py-12 px-4" style={{ background: '#000000' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 40 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.15, ease: [0.65, 0, 0.35, 1] }}
              className="group relative flex flex-col p-8 rounded-2xl transition-all duration-300 cursor-default"
              style={{
                background: '#0A0A0A',
                border: '1px solid rgba(168,85,247,0.25)',
                borderTop: '4px solid #A855F7',
              }}
              whileHover={{
                boxShadow: '0 0 40px rgba(168,85,247,0.25)',
                borderColor: 'rgba(168,85,247,0.5)',
                y: -4,
                scale: 1.02,
              }}
            >
              <div
                className="mb-5 inline-flex items-center justify-center rounded-xl p-2"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(168,85,247,0.18) 0%, transparent 70%)',
                }}
              >
                {feature.icon}
              </div>

              <h3
                className="font-orbitron font-bold text-white mb-2"
                style={{ fontSize: '20px', letterSpacing: '1px' }}
              >
                {feature.title}
              </h3>

              <div
                className="h-0.5 w-10 mb-4 transition-all duration-500 group-hover:w-16"
                style={{ background: '#A855F7' }}
              />

              <p
                className="font-rajdhani leading-relaxed"
                style={{ color: '#888888', fontSize: '15px' }}
              >
                {feature.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ghost conversation demo */}
      <section ref={demoRef} className="relative z-10 py-20 px-4" style={{ background: '#000000' }}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={demoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h2
              className="font-orbitron font-bold text-white mb-3"
              style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}
            >
              See Ghost work.
            </h2>
            <p className="font-rajdhani" style={{ color: '#888888', fontSize: '16px' }}>
              One instruction. Fully executed. Never exposed.
            </p>
          </motion.div>

          <motion.div
            className="animate-float"
            initial={{ opacity: 0, y: 30 }}
            animate={demoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
          >
            <GhostPhone />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={demoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <span
              className="font-orbitron text-white"
              style={{
                border: '1px solid rgba(168,85,247,0.5)',
                borderRadius: '100px',
                padding: '8px 20px',
                fontSize: '11px',
                letterSpacing: '2px',
              }}
            >
              COMING TO APP STORE
            </span>
          </motion.div>
        </div>
      </section>
    </>
  )
}
