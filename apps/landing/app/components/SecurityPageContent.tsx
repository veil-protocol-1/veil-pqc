'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const THREATS = [
  {
    id: 'harvest',
    title: 'Harvest Now, Decrypt Later',
    body: 'State actors are collecting encrypted blockchain transactions today. When quantum hardware arrives, every ECDSA key ever used becomes vulnerable. Retroactively. Simultaneously.',
  },
  {
    id: 'google',
    title: 'Google, March 2026',
    body: "Google demonstrated a refined Shor's algorithm requiring 20x fewer resources to crack ECDSA. The software is ready. The hardware is being built.",
  },
  {
    id: 'cisa',
    title: '2029 CISA Deadline',
    body: 'The NSA and CISA have mandated post-quantum migration for all critical systems by 2029. Veil is already there.',
  },
]

const STACK = [
  { id: 'ml-dsa', name: 'ML-DSA-65', sub: 'FIPS 204', body: 'Transaction signing' },
  { id: 'ml-kem', name: 'ML-KEM-768', sub: 'FIPS 203', body: 'Key encapsulation' },
  { id: 'rlwe', name: 'RLWE/CKKS', sub: '', body: 'Ghost FHE inference' },
  { id: 'x402', name: 'x402-pqc', sub: '', body: 'Payment standard' },
]

function PurpleUnderlineText({
  children,
  isInView,
}: {
  children: React.ReactNode
  isInView: boolean
}) {
  return <div className={`purple-underline ${isInView ? 'animated' : ''}`}>{children}</div>
}

export default function SecurityPageContent() {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true, margin: '-80px' })

  const threatsRef = useRef<HTMLDivElement>(null)
  const threatsInView = useInView(threatsRef, { once: true, margin: '-80px' })

  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' })

  const stackRef = useRef<HTMLDivElement>(null)
  const stackInView = useInView(stackRef, { once: true, margin: '-80px' })

  const [underlineActive, setUnderlineActive] = useState(false)
  useEffect(() => {
    if (ctaInView) {
      const t = setTimeout(() => setUnderlineActive(true), 500)
      return () => clearTimeout(t)
    }
  }, [ctaInView])

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

        <h1
          className="font-orbitron font-bold text-white tabular-nums relative z-10"
          style={{ fontSize: 'clamp(64px, 12vw, 100px)', lineHeight: 1 }}
        >
          9:00
        </h1>

        <motion.p
          className="font-rajdhani text-white font-semibold relative z-10 mt-5"
          style={{ fontSize: 'clamp(16px, 2.5vw, 22px)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Minutes to crack ECDSA on a quantum computer.
        </motion.p>

        <motion.p
          className="font-rajdhani italic relative z-10 mt-1"
          style={{ color: '#888888', fontSize: '14px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Google Quantum AI, March 2026
        </motion.p>
      </section>

      {/* Threat cards */}
      <section ref={threatsRef} className="relative z-10 py-12 px-4" style={{ background: '#000000' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {THREATS.map((threat, i) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: 40 }}
              animate={threatsInView ? { opacity: 1, y: 0 } : {}}
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
              <h3
                className="font-orbitron font-bold text-white mb-2"
                style={{ fontSize: '18px', letterSpacing: '0.5px' }}
              >
                {threat.title}
              </h3>

              <div
                className="h-0.5 w-10 mb-4 transition-all duration-500 group-hover:w-16"
                style={{ background: '#A855F7' }}
              />

              <p
                className="font-rajdhani leading-relaxed"
                style={{ color: '#888888', fontSize: '15px' }}
              >
                {threat.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA line */}
      <section
        ref={ctaRef}
        className="relative z-10 py-20 px-4 flex flex-col items-center text-center"
        style={{ background: '#000000' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <PurpleUnderlineText isInView={underlineActive}>
            <h2
              className="font-orbitron font-bold text-white"
              style={{ fontSize: 'clamp(24px, 4.5vw, 36px)' }}
            >
              Your current wallet isn&apos;t ready. Veil is.
            </h2>
          </PurpleUnderlineText>
        </motion.div>
      </section>

      {/* PQC stack */}
      <section ref={stackRef} className="relative z-10 py-12 px-4 pb-24" style={{ background: '#000000' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {STACK.map((item, i) => (
              <motion.div
                key={item.id}
                className="stat-card flex flex-col gap-1"
                initial={{ opacity: 0, y: 24 }}
                animate={stackInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              >
                <p className="font-mono text-purple-400" style={{ fontSize: '15px' }}>
                  {item.name}
                </p>
                {item.sub && (
                  <p
                    className="font-rajdhani uppercase"
                    style={{ color: '#666666', fontSize: '10px', letterSpacing: '1px' }}
                  >
                    {item.sub}
                  </p>
                )}
                <p className="font-rajdhani text-white mt-2" style={{ fontSize: '14px' }}>
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="font-rajdhani italic text-center mt-10"
            style={{ color: '#A855F7', fontSize: '16px' }}
            initial={{ opacity: 0 }}
            animate={stackInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            Every layer. Quantum resistant. From day one.
          </motion.p>
        </div>
      </section>
    </>
  )
}
