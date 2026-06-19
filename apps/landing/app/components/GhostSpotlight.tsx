'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import VeilFaceMesh from './VeilFaceMesh'

const AUTH_CYCLE_LENGTH = 10 // seconds

type AuthPhase = 'scan' | 'authenticating' | 'verified' | 'home'

function authPhase(t: number): AuthPhase {
  if (t < 3) return 'scan'
  if (t < 5) return 'authenticating'
  if (t < 7) return 'verified'
  return 'home'
}

function useCycleTime(length: number): number {
  const [t, setT] = useState(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = performance.now()
    const interval = setInterval(() => {
      const elapsed = ((performance.now() - startRef.current) / 1000) % length
      setT(elapsed)
    }, 100)
    return () => clearInterval(interval)
  }, [length])

  return t
}

const ACTIONS = [
  { label: 'SEND' },
  { label: 'RECEIVE' },
  { label: 'SWAP' },
  { label: 'PAY' },
]

function MobileAuthDemo() {
  const t = useCycleTime(AUTH_CYCLE_LENGTH)
  const phase = authPhase(t)

  return (
    <div
      style={{
        width: 215,
        height: 464,
        borderRadius: 38,
        border: '1px solid rgba(192,192,192,0.4)',
        background: '#000000',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.8), 0 0 40px rgba(168,85,247,0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Island */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 66,
          height: 17,
          borderRadius: 10,
          background: '#000000',
          border: '1px solid rgba(255,255,255,0.08)',
          zIndex: 10,
        }}
      />

      <AnimatePresence mode="wait">
        {phase !== 'home' ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          >
            <div
              style={{
                position: 'relative',
                filter: phase === 'verified' ? 'hue-rotate(-130deg) saturate(1.3)' : 'none',
                transition: 'filter 0.4s ease',
              }}
            >
              {phase === 'authenticating' && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    border: '1.5px solid rgba(168,85,247,0.5)',
                    width: 60,
                    height: 60,
                    marginTop: -30,
                    marginLeft: -30,
                  }}
                  animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <div
                style={{
                  filter: phase === 'authenticating' ? 'brightness(1.4)' : 'none',
                  transition: 'filter 0.3s ease',
                }}
              >
                <VeilFaceMesh width={160} height={200} failed={false} landmarks={[]} />
              </div>
              {phase === 'verified' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute rounded-full flex items-center justify-center"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: 36,
                    height: 36,
                    marginTop: -18,
                    marginLeft: -18,
                    background: '#22c55e',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M3 8.5l3.5 3.5L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </motion.div>
              )}
            </div>

            {phase === 'scan' && (
              <>
                <span className="font-orbitron text-white" style={{ fontSize: 13, letterSpacing: '4px' }}>VEIL</span>
                <span className="font-rajdhani text-grey" style={{ fontSize: 10, letterSpacing: '1.5px' }}>SCAN FACE TO ENTER</span>
              </>
            )}
            {phase === 'authenticating' && (
              <span className="font-rajdhani" style={{ color: '#A855F7', fontSize: 11, letterSpacing: '1.5px' }}>AUTHENTICATING...</span>
            )}
            {phase === 'verified' && (
              <span className="font-rajdhani" style={{ color: '#22c55e', fontSize: 11, letterSpacing: '1.5px' }}>IDENTITY VERIFIED</span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-5"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-rajdhani text-grey" style={{ fontSize: 10, letterSpacing: '1.5px' }}>PORTFOLIO VALUE</span>
              <span className="font-orbitron text-white font-bold" style={{ fontSize: 24 }}>$4,821.03</span>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {ACTIONS.map((action) => (
                <div
                  key={action.label}
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    height: 40,
                    background: 'rgba(168,85,247,0.08)',
                    border: '1px solid rgba(168,85,247,0.25)',
                  }}
                >
                  <span className="font-rajdhani text-white" style={{ fontSize: 11, letterSpacing: '1px' }}>{action.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GhostSpotlight() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="ghost"
      ref={ref}
      className="relative z-10 py-24 px-4"
      style={{ background: '#000000' }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          className="flex flex-col gap-6"
        >
          <div>
            <h2 className="font-orbitron font-bold text-white mb-2" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
              Meet Ghost.
            </h2>
            <p className="font-rajdhani" style={{ color: '#888888', fontSize: '20px' }}>
              Your private AI agent.
            </p>
          </div>

          <p className="font-rajdhani leading-relaxed max-w-[440px]" style={{ color: '#888888', fontSize: '16px' }}>
            Tell Ghost what you want in plain English. Ghost executes inside Octra Circles — sealed FHE environments where no node sees your instructions in plaintext. The shadow of you, always working.
          </p>

          <div className="flex flex-col gap-3">
            {[
              'End-to-end encrypted via Octra FHE',
              'Natural language — just tell Ghost',
              'Executes swaps, sends, yield strategies',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid #A855F7' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="font-rajdhani text-white" style={{ fontSize: '15px' }}>{item}</span>
              </div>
            ))}
          </div>

          <div>
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
          </div>
        </motion.div>

        {/* Right — Phone */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
          className="flex justify-center"
        >
          <div className="animate-float">
            <MobileAuthDemo />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
