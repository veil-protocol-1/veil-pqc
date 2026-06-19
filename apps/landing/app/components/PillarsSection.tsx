'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PILLARS = [
  {
    id: 'face',
    title: 'YOUR FACE',
    body: 'Biometric fuzzy extractor derives your cryptographic key locally. Your face IS your private key. Nothing stored. Nothing transmitted. You are the only point of control.',
    pills: ['FACE VERIFIED', 'LOCAL ONLY', 'ZERO KNOWLEDGE'],
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#A855F7" strokeWidth="1.5" />
        <ellipse cx="20" cy="17" rx="7" ry="9" stroke="#A855F7" strokeWidth="1.2" />
        <circle cx="15" cy="15" r="1.5" fill="#A855F7" />
        <circle cx="25" cy="15" r="1.5" fill="#A855F7" />
        <path d="M15 24 Q20 28 25 24" stroke="#A855F7" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M5 20 L8 20 M32 20 L35 20" stroke="#A855F7" strokeWidth="1" strokeLinecap="round" />
        <path d="M20 2 L20 5 M20 35 L20 38" stroke="#A855F7" strokeWidth="1" strokeLinecap="round" />
        <rect x="2" y="2" width="6" height="6" rx="1" stroke="#A855F7" strokeWidth="1" />
        <rect x="32" y="2" width="6" height="6" rx="1" stroke="#A855F7" strokeWidth="1" />
        <rect x="2" y="32" width="6" height="6" rx="1" stroke="#A855F7" strokeWidth="1" />
        <rect x="32" y="32" width="6" height="6" rx="1" stroke="#A855F7" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'money',
    title: 'YOUR MONEY',
    body: 'ML-DSA-65 signing. ML-KEM-768 encryption. Every transaction quantum-resistant from day one. Send, swap, earn. Settled on Base.',
    pills: ['ML-DSA-65', 'ML-KEM-768', 'BASE NATIVE'],
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 3 L36 12 L36 28 L20 37 L4 28 L4 12 Z"
          stroke="#A855F7"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M20 3 L20 37 M4 12 L36 12 M4 28 L36 28"
          stroke="#A855F7"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
        <circle cx="20" cy="20" r="5" stroke="#A855F7" strokeWidth="1.2" />
        <path d="M17 20 L19 22 L23 18" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'agent',
    title: 'YOUR AGENT',
    body: 'Ghost executes DeFi in plain English inside Octra Circles — sealed FHE environments. No node sees your instructions. Ever.',
    pills: ['FHE ENCRYPTED', 'NATURAL LANGUAGE', 'ALWAYS WORKING'],
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="16" r="10" stroke="#A855F7" strokeWidth="1.5" fill="none" />
        <circle cx="20" cy="14" r="5" stroke="#A855F7" strokeWidth="1.2" fill="rgba(168,85,247,0.1)" />
        <circle cx="20" cy="14" r="2" fill="#A855F7" />
        <path
          d="M10 25 Q10 35 20 35 Q30 35 30 25"
          stroke="#A855F7"
          strokeWidth="1.5"
          fill="rgba(168,85,247,0.05)"
        />
        <circle cx="14" cy="20" r="1.5" fill="#A855F7" opacity="0.5" />
        <circle cx="26" cy="20" r="1.5" fill="#A855F7" opacity="0.5" />
        <circle cx="20" cy="38" r="1.5" fill="#A855F7" />
        <path d="M20 35 L20 37" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function PillarsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="protocol"
      ref={ref}
      className="relative z-10 py-24 px-4"
      style={{ background: '#000000' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
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
              {/* Icon */}
              <div
                className="mb-5 inline-flex items-center justify-center rounded-xl p-2"
                style={{
                  background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(168,85,247,0.18) 0%, transparent 70%)',
                }}
              >
                {pillar.icon}
              </div>

              {/* Title */}
              <h3
                className="font-orbitron font-bold text-white mb-2"
                style={{ fontSize: '20px', letterSpacing: '2px' }}
              >
                {pillar.title}
              </h3>

              {/* Purple underline */}
              <div
                className="h-0.5 w-10 mb-4 transition-all duration-500 group-hover:w-16"
                style={{ background: '#A855F7' }}
              />

              {/* Body */}
              <p
                className="font-rajdhani flex-1 mb-5 leading-relaxed"
                style={{ color: '#888888', fontSize: '15px' }}
              >
                {pillar.body}
              </p>

              {/* Pills */}
              <div className="flex flex-wrap gap-2">
                {pillar.pills.map((pill) => (
                  <span key={pill} className="pill">{pill}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
