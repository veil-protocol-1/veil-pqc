'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const STAT_CARDS = [
  { label: 'THREAT VECTOR', value: 'HARVEST NOW\nDECRYPT LATER' },
  { label: 'DEMONSTRATED BY', value: 'GOOGLE\nMARCH 2026' },
  { label: 'CISA MIGRATION\nDEADLINE', value: '2029' },
]

function CountdownDisplay({ triggered }: { triggered: boolean }) {
  const [display, setDisplay] = useState('60:00')
  const startRef = useRef(false)

  useEffect(() => {
    if (!triggered || startRef.current) return
    startRef.current = true

    const startSec = 3600
    const endSec = 540
    const durationMs = 2000
    const steps = 60
    const interval = durationMs / steps
    const delta = (startSec - endSec) / steps
    let current = startSec
    let count = 0

    const timer = setInterval(() => {
      count++
      current = Math.max(endSec, startSec - delta * count)
      const mins = Math.floor(current / 60)
      const secs = Math.floor(current % 60)
      setDisplay(`${mins}:${secs.toString().padStart(2, '0')}`)
      if (count >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [triggered])

  return (
    <span
      className="font-orbitron font-bold text-white tabular-nums"
      style={{ fontSize: 'clamp(72px, 12vw, 120px)', lineHeight: 1 }}
    >
      {display}
    </span>
  )
}

export default function QuantumSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      id="security"
      className="relative z-10 py-32 px-4 flex flex-col items-center text-center"
      style={{ background: '#000000' }}
    >
      {/* Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
        className="mb-6"
      >
        <CountdownDisplay triggered={isInView} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="mb-3"
      >
        <p
          className="font-rajdhani text-white font-semibold"
          style={{ fontSize: 'clamp(16px, 2.5vw, 22px)' }}
        >
          Minutes to crack ECDSA on a quantum computer.
        </p>
        <p
          className="font-rajdhani italic mt-1"
          style={{ color: '#888888', fontSize: '14px' }}
        >
          Google Quantum AI, March 2026
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 mb-14 w-full max-w-3xl">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            className="stat-card"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
          >
            <p
              className="font-rajdhani uppercase mb-2"
              style={{ color: '#A855F7', fontSize: '11px', letterSpacing: '1.5px', whiteSpace: 'pre-line' }}
            >
              {card.label}
            </p>
            <p
              className="font-orbitron font-bold text-white"
              style={{ fontSize: '22px', whiteSpace: 'pre-line', lineHeight: 1.2 }}
            >
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="flex flex-col items-center"
      >
        <PurpleUnderlineText isInView={isInView}>
          <h2
            className="font-orbitron font-bold text-white"
            style={{ fontSize: 'clamp(22px, 3.5vw, 32px)' }}
          >
            Your current wallet isn&apos;t ready. Veil is.
          </h2>
        </PurpleUnderlineText>
      </motion.div>
    </section>
  )
}

function PurpleUnderlineText({
  children,
  isInView,
}: {
  children: React.ReactNode
  isInView: boolean
}) {
  return (
    <div className={`purple-underline ${isInView ? 'animated' : ''}`}>
      {children}
    </div>
  )
}
