'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const ALLOCATIONS = [
  { label: '15% FOUNDING TEAM', pct: 15 },
  { label: '22% TREASURY', pct: 22 },
  { label: '10% COMMUNITY', pct: 10 },
]

export default function TokenSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [underlineActive, setUnderlineActive] = useState(false)

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setUnderlineActive(true), 600)
      return () => clearTimeout(t)
    }
  }, [isInView])

  return (
    <section
      id="token"
      ref={ref}
      className="relative z-10 py-32 px-4 flex flex-col items-center text-center"
      style={{ background: '#000000' }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(168,85,247,0.06) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        {/* VEIL wordmark */}
        <div className={`purple-underline ${underlineActive ? 'animated' : ''}`}>
          <h2
            className="font-orbitron font-bold text-white"
            style={{ fontSize: 'clamp(48px, 8vw, 64px)', letterSpacing: '6px' }}
          >
            VEIL
          </h2>
        </div>

        <p className="font-rajdhani text-white" style={{ fontSize: '18px' }}>
          1,000,000,000 fixed supply.
        </p>

        <p className="font-rajdhani max-w-sm" style={{ color: '#888888', fontSize: '16px', lineHeight: 1.6 }}>
          Token launch Q4 2026. Gated by real protocol revenue.
        </p>

        {/* Allocation pills */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {ALLOCATIONS.map((a, i) => (
            <motion.div
              key={a.label}
              className="stat-card flex flex-col items-center gap-1"
              style={{ minWidth: '140px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              <p
                className="font-orbitron font-bold text-white"
                style={{ fontSize: '22px' }}
              >
                {a.pct}%
              </p>
              <p
                className="font-rajdhani uppercase"
                style={{ color: '#A855F7', fontSize: '10px', letterSpacing: '1.5px' }}
              >
                {a.label.split(' ').slice(1).join(' ')}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="font-rajdhani italic"
          style={{ color: '#A855F7', fontSize: '14px' }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          Revenue-backed rewards. No inflationary emissions.
        </motion.p>
      </motion.div>
    </section>
  )
}
