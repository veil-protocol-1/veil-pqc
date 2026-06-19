'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import EmailCapture from './EmailCapture'

const ALLOCATIONS = [
  { label: 'Founding Team', pct: 15, amount: '150,000,000' },
  { label: 'Treasury', pct: 22, amount: '220,000,000' },
  { label: 'Ecosystem', pct: 12, amount: '120,000,000' },
  { label: 'Investors', pct: 15, amount: '150,000,000' },
  { label: 'Community', pct: 10, amount: '100,000,000' },
  { label: 'Airdrop', pct: 8, amount: '80,000,000' },
  { label: 'Liquidity', pct: 10, amount: '100,000,000' },
  { label: 'Team/Advisors', pct: 3, amount: '30,000,000' },
]

const PRINCIPLES = [
  {
    id: 'revenue',
    title: 'Revenue-Backed Rewards',
    body: 'Protocol fees buy VEIL on the open market. Rewards are paid from real revenue, not inflation.',
  },
  {
    id: 'no-inflation',
    title: 'No Inflationary Emissions',
    body: 'Fixed supply. No minting. No dilution. Your allocation never loses value to new tokens.',
  },
  {
    id: 'gated',
    title: 'Gated Launch',
    body: 'Token launches only when Veil generates $500K/month in real protocol fees. No speculation. Just revenue.',
  },
]

export default function TokenPageContent() {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true, margin: '-80px' })

  const allocRef = useRef<HTMLDivElement>(null)
  const allocInView = useInView(allocRef, { once: true, margin: '-80px' })

  const principlesRef = useRef<HTMLDivElement>(null)
  const principlesInView = useInView(principlesRef, { once: true, margin: '-80px' })

  const vestRef = useRef<HTMLDivElement>(null)
  const vestInView = useInView(vestRef, { once: true, margin: '-80px' })

  const [underlineActive, setUnderlineActive] = useState(false)
  useEffect(() => {
    if (heroInView) {
      const t = setTimeout(() => setUnderlineActive(true), 500)
      return () => clearTimeout(t)
    }
  }, [heroInView])

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

        <motion.div
          className={`purple-underline relative z-10 ${underlineActive ? 'animated' : ''}`}
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          <h1
            className="font-orbitron font-bold text-white"
            style={{ fontSize: 'clamp(56px, 12vw, 100px)', letterSpacing: '4px' }}
          >
            VEIL
          </h1>
        </motion.div>

        <motion.p
          className="font-rajdhani relative z-10 mt-7"
          style={{ color: '#888888', fontSize: '20px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          1,000,000,000 fixed supply.
        </motion.p>

        <motion.p
          className="font-rajdhani relative z-10 mt-2 max-w-[500px] leading-relaxed"
          style={{ color: '#888888', fontSize: '16px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Token launch Q4 2026. Gated by $500K/month in real protocol revenue.
        </motion.p>
      </section>

      {/* Allocation table */}
      <section ref={allocRef} className="relative z-10 py-12 px-4" style={{ background: '#000000' }}>
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {ALLOCATIONS.map((a, i) => (
            <motion.div
              key={a.label}
              className="flex flex-col gap-2 p-5 rounded-xl"
              style={{ background: '#0A0A0A', border: '1px solid rgba(168,85,247,0.25)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={allocInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 * i }}
            >
              <div className="flex items-center justify-between">
                <span className="font-rajdhani text-white" style={{ fontSize: '15px' }}>
                  {a.label}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-grey" style={{ fontSize: '12px' }}>
                    {a.amount} VEIL
                  </span>
                  <span className="font-orbitron font-bold text-purple-400" style={{ fontSize: '16px' }}>
                    {a.pct}%
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                  }}
                  initial={{ width: 0 }}
                  animate={allocInView ? { width: `${a.pct}%` } : {}}
                  transition={{ duration: 0.8, delay: 0.1 + 0.05 * i, ease: [0.65, 0, 0.35, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Principle cards */}
      <section ref={principlesRef} className="relative z-10 py-12 px-4" style={{ background: '#000000' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              animate={principlesInView ? { opacity: 1, y: 0 } : {}}
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
                {p.title}
              </h3>

              <div
                className="h-0.5 w-10 mb-4 transition-all duration-500 group-hover:w-16"
                style={{ background: '#A855F7' }}
              />

              <p
                className="font-rajdhani leading-relaxed"
                style={{ color: '#888888', fontSize: '15px' }}
              >
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vesting */}
      <section ref={vestRef} className="relative z-10 py-12 px-4" style={{ background: '#000000' }}>
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={vestInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="font-rajdhani leading-relaxed" style={{ color: '#888888', fontSize: '16px' }}>
            Team tokens: 4-year vest, 1-year cliff.
            <br />
            Community and ecosystem: distributed over 2 years post-launch.
          </p>
        </motion.div>
      </section>

      {/* Email capture */}
      <section className="relative z-10 py-16 px-4 pb-28" style={{ background: '#000000' }}>
        <EmailCapture heading="Stay updated" />
      </section>
    </>
  )
}
