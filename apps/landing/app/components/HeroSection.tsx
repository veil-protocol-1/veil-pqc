'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HEADLINE_WORDS = ['Your', 'face.', 'Your', 'money.', 'Your', 'agent.']

const CYCLE_LENGTH = 13 // seconds

const EXEC_STEPS = [
  { label: 'Parsing Intent', doneAt: 5.5 },
  { label: 'Building Transaction', doneAt: 6.5 },
  { label: 'Route Optimization', doneAt: 7.5 },
  { label: 'Executing Swap', doneAt: 9 },
]

type StepStatus = 'pending' | 'active' | 'done'

function stepStatus(index: number, t: number): StepStatus {
  const doneAt = EXEC_STEPS[index].doneAt
  const startAt = index === 0 ? 5 : EXEC_STEPS[index - 1].doneAt
  if (t >= doneAt) return 'done'
  if (t >= startAt) return 'active'
  return 'pending'
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

function SwapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 4.5h8.5M10.5 4.5L8 2M10.5 4.5L8 7" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9.5H3.5M3.5 9.5L6 7M3.5 9.5L6 12" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5l3 3 3-3" stroke="#888888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{ width: 16, height: 16, background: '#A855F7' }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8">
          <path d="M1.5 4l1.5 1.5 3.5-3.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    )
  }
  if (status === 'active') {
    return (
      <motion.div
        className="rounded-full flex-shrink-0"
        style={{ width: 10, height: 10, marginLeft: 3, marginRight: 3, background: '#A855F7' }}
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex-shrink-0"
      style={{ width: 16, height: 16, border: '1.5px solid #444' }}
    />
  )
}

function ExecutionCard({ t }: { t: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-3"
      style={{ background: '#0D0D0D', border: '1px solid rgba(168,85,247,0.15)' }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{ width: 26, height: 26, background: '#A855F7' }}
        >
          <SwapIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-rajdhani text-white" style={{ fontSize: 12.5 }}>Swapping 50 USDC → ETH</p>
          <p className="font-rajdhani text-grey" style={{ fontSize: 10.5 }}>via Uniswap v3</p>
        </div>
        <ChevronIcon />
      </div>

      <div className="relative flex flex-col gap-3" style={{ paddingLeft: 2 }}>
        <svg
          width="2"
          height="100%"
          style={{ position: 'absolute', left: 7, top: 8, bottom: 8 }}
          preserveAspectRatio="none"
        >
          <line x1="1" y1="0" x2="1" y2="200" stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
        {EXEC_STEPS.map((step, i) => {
          const status = stepStatus(i, t)
          return (
            <div key={step.label} className="flex items-center gap-2.5" style={{ opacity: status === 'pending' ? 0.45 : 1 }}>
              <StepIcon status={status} />
              <p className="font-rajdhani text-white" style={{ fontSize: 11.5 }}>{step.label}</p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function GhostBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-2"
    >
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
        style={{ background: 'rgba(168,85,247,0.2)' }}
      >
        <span className="font-orbitron text-purple-400" style={{ fontSize: 8 }}>G</span>
      </div>
      <div
        className="px-3 py-2 max-w-[80%]"
        style={{
          background: '#0D0D0D',
          borderLeft: '2px solid #A855F7',
          borderRadius: '0 12px 12px 12px',
        }}
      >
        <p className="font-rajdhani text-white" style={{ fontSize: 15 }}>{children}</p>
      </div>
    </motion.div>
  )
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex justify-end"
    >
      <div
        className="px-3 py-2 max-w-[80%]"
        style={{ background: '#1A0A2E', borderRadius: '12px 0 12px 12px' }}
      >
        <p className="font-rajdhani text-white" style={{ fontSize: 15 }}>{children}</p>
        <p className="font-rajdhani text-grey" style={{ fontSize: 10 }}>9:41 PM ✓✓</p>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-2"
    >
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'rgba(168,85,247,0.2)' }}
      >
        <span className="font-orbitron text-purple-400" style={{ fontSize: 8 }}>G</span>
      </div>
      <div className="px-3 py-2.5 flex gap-1.5" style={{ background: '#0D0D0D', borderLeft: '2px solid #A855F7', borderRadius: '0 12px 12px 12px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 6, height: 6, background: '#A855F7' }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function GhostChatHero() {
  const t = useCycleTime(CYCLE_LENGTH)

  const showGreeting = t >= 0.3
  const showUserSwap = t >= 2
  const showTyping = t >= 3 && t < 4.5
  const showGhostPrep = t >= 4.5
  const showExecCard = t >= 5
  const showSwapResult = t >= 9
  const showThanks = t >= 10.5
  const showFinalGhost = t >= 11

  return (
    <div
      className="w-full max-w-[640px] mx-auto rounded-[20px] overflow-hidden"
      style={{
        background: '#080808',
        border: '1px solid rgba(168,85,247,0.3)',
        boxShadow: '0 0 60px rgba(168,85,247,0.12)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(168,85,247,0.15)' }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{ width: 30, height: 30, background: '#A855F7' }}
        >
          <span className="font-orbitron text-white font-bold" style={{ fontSize: 11 }}>G</span>
        </div>
        <span className="font-orbitron text-white" style={{ fontSize: 14, letterSpacing: '3px' }}>GHOST</span>
        <span className="animate-pulse-dot ml-auto" style={{ color: '#A855F7', fontSize: 12 }}>●</span>
      </div>

      {/* Messages */}
      <div className="flex flex-col justify-end gap-3 px-5 py-5" style={{ height: 320, overflow: 'hidden' }}>
        <AnimatePresence mode="sync">
          {showGreeting && (
            <GhostBubble key="greeting">Good evening, Sovereign. How may I assist you?</GhostBubble>
          )}
          {showUserSwap && <UserBubble key="user-swap">Swap 50 USDC to ETH</UserBubble>}
          {showTyping && <TypingIndicator key="typing" />}
          {showGhostPrep && (
            <GhostBubble key="ghost-prep">
              Understood, Sovereign. Preparing to swap 50 USDC to ETH.
            </GhostBubble>
          )}
          {showExecCard && <ExecutionCard key="exec-card" t={t} />}
          {showSwapResult && (
            <GhostBubble key="swap-result">50 USDC → ETH initiated. You will receive ~0.0301 ETH</GhostBubble>
          )}
          {showThanks && <UserBubble key="thanks">Thank you, Ghost.</UserBubble>}
          {showFinalGhost && (
            <GhostBubble key="final">Always, Sovereign. Your wealth is safe.</GhostBubble>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading' || status === 'success') return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (data.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#000000' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(168,85,247,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Headline */}
      <div className="relative z-10 flex flex-col items-center text-center pt-28 pb-10 px-4">
        <h1
          className="font-orbitron font-bold text-white leading-tight mb-5"
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            letterSpacing: '-1px',
            lineHeight: '1.1',
          }}
        >
          {HEADLINE_WORDS.map((word, i) => (
            <motion.span
              key={i}
              ref={(el) => { wordRefs.current[i] = el }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
              className="inline-block"
              style={{ marginRight: word.endsWith('.') ? '0.3em' : '0.25em' }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="font-rajdhani max-w-[600px]"
          style={{ color: '#888888', fontSize: '18px', lineHeight: '1.6' }}
        >
          The world&apos;s first quantum-resistant self-sovereign AI-powered neobank.
        </motion.p>
      </div>

      {/* Ghost chat hero */}
      <div className="relative z-10 w-full px-4 mb-12">
        <GhostChatHero />
      </div>

      {/* Email capture */}
      <div className="relative z-10 flex flex-col items-center pb-20 px-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === 'success'}
            className="font-rajdhani text-white placeholder-grey outline-none transition-all duration-300"
            style={{
              background: '#0A0A0A',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: '8px',
              height: '52px',
              width: '320px',
              padding: '0 16px',
              fontSize: '15px',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="font-orbitron font-bold text-white transition-all duration-300 whitespace-nowrap"
            style={{
              background: '#A855F7',
              borderRadius: '8px',
              height: '52px',
              padding: '0 24px',
              fontSize: '13px',
              letterSpacing: '2px',
              cursor: status === 'loading' || status === 'success' ? 'default' : 'pointer',
              opacity: status === 'loading' ? 0.7 : 1,
            }}
          >
            {status === 'success'
              ? '✓ YOU\'RE IN, SOVEREIGN'
              : status === 'loading'
              ? 'SUBMITTING...'
              : 'GET EARLY ACCESS'}
          </button>
        </form>
        {status === 'error' && (
          <p className="font-rajdhani mt-2 text-sm" style={{ color: '#f87171' }}>
            {errorMsg}
          </p>
        )}
      </div>
    </section>
  )
}
