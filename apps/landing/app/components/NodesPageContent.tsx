'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const WHAT_NODES_DO = [
  {
    id: 'payments',
    title: 'Process Payments',
    body: 'Route and settle x402-pqc transactions — quantum-resistant payments on Base mainnet verified through your node.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="10" width="28" height="20" rx="3" stroke="#A855F7" strokeWidth="1.5" fill="rgba(168,85,247,0.05)" />
        <path d="M6 16h28" stroke="#A855F7" strokeWidth="1.5" />
        <rect x="10" y="21" width="8" height="3" rx="1" fill="#A855F7" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'ghost',
    title: 'Validate Ghost Queries',
    body: 'Participate in Ghost AI execution — verifying that encrypted Octra Circle queries are processed correctly without seeing their contents.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 7c-6.075 0-11 4.925-11 11 0 3.314 1.463 6.285 3.784 8.34L11 33l3.5-1.75L18 33l2-2 2 2 3.5-1.75L29 33l-1.784-6.66C29.537 24.285 31 21.314 31 18c0-6.075-4.925-11-11-11z" stroke="#A855F7" strokeWidth="1.5" fill="rgba(168,85,247,0.05)" />
        <circle cx="15.5" cy="18" r="1.5" fill="#A855F7" />
        <circle cx="24.5" cy="18" r="1.5" fill="#A855F7" />
      </svg>
    ),
  },
  {
    id: 'fees',
    title: 'Earn Protocol Fees',
    body: 'Every transaction routed through your node pays you 0.2% of volume. Permissionless. Automatic. Proportional to your uptime.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="13" stroke="#A855F7" strokeWidth="1.5" fill="rgba(168,85,247,0.05)" />
        <path d="M20 11v2M20 27v2M15 15.5l1.5 1.5M23.5 23.5l1.5 1.5M11 20h2M27 20h2M15 24.5l1.5-1.5M23.5 16.5l1.5-1.5" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="3" fill="#A855F7" opacity="0.8" />
      </svg>
    ),
  },
]

const REQUIREMENTS = [
  { label: 'OS', value: 'Linux VPS (Ubuntu 22.04+ recommended)' },
  { label: 'CPU', value: '2 vCPU minimum' },
  { label: 'RAM', value: '4 GB minimum' },
  { label: 'Runtime', value: 'Node.js 20+' },
  { label: 'Port', value: '3000 open (TCP inbound)' },
]

const NETWORK_NODES = [
  { ip: '45.63.6.252', label: 'Node 1' },
  { ip: '108.61.81.13', label: 'Node 2' },
  { ip: '149.28.229.102', label: 'Node 3' },
]

function NodeWaitlistForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    window.location.href = `mailto:veilprotocol@yahoo.com?subject=Veil%20Node%20Waitlist&body=I%20want%20to%20run%20a%20Veil%20node.%20My%20email%3A%20${encodeURIComponent(email)}`
    setSubmitted(true)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        disabled={submitted}
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
        disabled={submitted}
        className="font-orbitron font-bold text-white transition-all duration-300 whitespace-nowrap"
        style={{
          background: '#A855F7',
          borderRadius: '8px',
          height: '52px',
          padding: '0 24px',
          fontSize: '13px',
          letterSpacing: '2px',
          cursor: submitted ? 'default' : 'pointer',
          opacity: submitted ? 0.7 : 1,
        }}
      >
        {submitted ? "✓ CHECK YOUR EMAIL CLIENT" : 'JOIN THE WAITLIST'}
      </button>
    </form>
  )
}

export default function NodesPageContent() {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true, margin: '-80px' })

  const whatRef = useRef<HTMLDivElement>(null)
  const whatInView = useInView(whatRef, { once: true, margin: '-80px' })

  const networkRef = useRef<HTMLDivElement>(null)
  const networkInView = useInView(networkRef, { once: true, margin: '-80px' })

  const reqRef = useRef<HTMLDivElement>(null)
  const reqInView = useInView(reqRef, { once: true, margin: '-80px' })

  const howRef = useRef<HTMLDivElement>(null)
  const howInView = useInView(howRef, { once: true, margin: '-80px' })

  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' })

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
          className="relative z-10 mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{ border: '1px solid rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.08)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          <span className="font-rajdhani text-green-400" style={{ fontSize: '13px', letterSpacing: '2px' }}>
            3 NODES LIVE
          </span>
        </motion.div>

        <motion.h1
          className="font-orbitron font-bold text-white relative z-10"
          style={{ fontSize: 'clamp(40px, 8vw, 72px)', letterSpacing: '2px', lineHeight: 1.1 }}
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1], delay: 0.08 }}
        >
          Run a Veil Node.
          <br />
          <span style={{ color: '#A855F7' }}>Earn VEIL.</span>
        </motion.h1>

        <motion.p
          className="font-rajdhani relative z-10 mt-6 max-w-[560px] leading-relaxed"
          style={{ color: '#888888', fontSize: '18px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.22 }}
        >
          Power the quantum-resistant payment layer. Validate Ghost AI queries.
          Earn 0.2% of every transaction you route — automatically.
        </motion.p>
      </section>

      {/* What nodes do */}
      <section ref={whatRef} className="relative z-10 py-16 px-4" style={{ background: '#000000' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="font-orbitron font-bold text-white text-center mb-12"
            style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', letterSpacing: '1px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={whatInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            What your node does.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHAT_NODES_DO.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                animate={whatInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.14, ease: [0.65, 0, 0.35, 1] }}
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
                    background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(168,85,247,0.18) 0%, transparent 70%)',
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="font-orbitron font-bold text-white mb-2" style={{ fontSize: '20px', letterSpacing: '1px' }}>
                  {item.title}
                </h3>
                <div className="h-0.5 w-10 mb-4 transition-all duration-500 group-hover:w-16" style={{ background: '#A855F7' }} />
                <p className="font-rajdhani leading-relaxed" style={{ color: '#888888', fontSize: '15px' }}>
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current network */}
      <section ref={networkRef} className="relative z-10 py-16 px-4" style={{ background: '#050505' }}>
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="font-orbitron font-bold text-white text-center mb-4"
            style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', letterSpacing: '1px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={networkInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Current network.
          </motion.h2>
          <motion.p
            className="font-rajdhani text-center mb-10"
            style={{ color: '#888888', fontSize: '16px' }}
            initial={{ opacity: 0, y: 16 }}
            animate={networkInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            3 production nodes live on Vultr infrastructure.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {NETWORK_NODES.map((node, i) => (
              <motion.div
                key={node.ip}
                initial={{ opacity: 0, y: 24 }}
                animate={networkInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.12 + i * 0.12 }}
                className="flex flex-col items-center gap-3 p-6 rounded-xl"
                style={{
                  background: '#0A0A0A',
                  border: '1px solid rgba(168,85,247,0.2)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                  <span className="font-rajdhani text-green-400" style={{ fontSize: '12px', letterSpacing: '2px' }}>
                    ONLINE
                  </span>
                </div>
                <span className="font-orbitron text-white font-bold" style={{ fontSize: '15px', letterSpacing: '1px' }}>
                  {node.label}
                </span>
                <span className="font-rajdhani" style={{ color: '#A855F7', fontSize: '14px', fontFamily: 'monospace' }}>
                  {node.ip}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section ref={reqRef} className="relative z-10 py-16 px-4" style={{ background: '#000000' }}>
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="font-orbitron font-bold text-white text-center mb-10"
            style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', letterSpacing: '1px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={reqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Node requirements.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={reqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(168,85,247,0.25)' }}
          >
            {REQUIREMENTS.map((req, i) => (
              <div
                key={req.label}
                className="flex items-center gap-6 px-8 py-5"
                style={{
                  background: i % 2 === 0 ? '#0A0A0A' : '#080808',
                  borderBottom: i < REQUIREMENTS.length - 1 ? '1px solid rgba(168,85,247,0.1)' : 'none',
                }}
              >
                <span
                  className="font-orbitron text-purple-400 shrink-0"
                  style={{ fontSize: '11px', letterSpacing: '2px', width: '72px' }}
                >
                  {req.label}
                </span>
                <span className="font-rajdhani text-white" style={{ fontSize: '15px' }}>
                  {req.value}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to run */}
      <section ref={howRef} className="relative z-10 py-16 px-4" style={{ background: '#050505' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            className="font-orbitron font-bold text-white mb-4"
            style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', letterSpacing: '1px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            How to run.
          </motion.h2>
          <motion.p
            className="font-rajdhani mb-8"
            style={{ color: '#888888', fontSize: '16px' }}
            initial={{ opacity: 0, y: 16 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            One command. No configuration files. Node is live in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="relative flex items-center justify-between gap-4 px-6 py-5 rounded-xl mb-6 text-left"
            style={{
              background: '#0A0A0A',
              border: '1px solid rgba(168,85,247,0.35)',
              fontFamily: 'monospace',
            }}
          >
            <span className="text-purple-400 select-none">$</span>
            <span className="text-white flex-1" style={{ fontSize: '16px' }}>
              npx @veil_/agent-registry
            </span>
            <div
              className="absolute top-0 right-0 bottom-0 w-1 rounded-r-xl"
              style={{ background: 'linear-gradient(180deg, #A855F7 0%, rgba(168,85,247,0.2) 100%)' }}
            />
          </motion.div>
          <motion.p
            className="font-rajdhani"
            style={{ color: '#666666', fontSize: '14px' }}
            initial={{ opacity: 0 }}
            animate={howInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Published on npm as{' '}
            <a
              href="https://www.npmjs.com/package/@veil_/agent-registry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
              style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              @veil_/agent-registry
            </a>
          </motion.p>
        </div>
      </section>

      {/* Rewards callout */}
      <section className="relative z-10 py-10 px-4" style={{ background: '#000000' }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-7 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(168,85,247,0.04) 100%)',
              border: '1px solid rgba(168,85,247,0.35)',
            }}
          >
            <div>
              <p className="font-orbitron font-bold text-white mb-1" style={{ fontSize: '22px' }}>
                0.2% of transaction volume.
              </p>
              <p className="font-rajdhani" style={{ color: '#888888', fontSize: '15px' }}>
                Paid out automatically per transaction routed through your node. No staking required.
              </p>
            </div>
            <div
              className="shrink-0 px-6 py-3 rounded-xl text-center"
              style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
            >
              <p className="font-orbitron text-purple-400 font-bold" style={{ fontSize: '28px' }}>
                0.2%
              </p>
              <p className="font-rajdhani text-white" style={{ fontSize: '12px', letterSpacing: '2px' }}>
                PER TX
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="relative z-10 py-24 px-4" style={{ background: '#000000' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(168,85,247,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.h2
            className="font-orbitron font-bold text-white mb-3"
            style={{ fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '1px' }}
            initial={{ opacity: 0, y: 24 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            Join the waitlist.
          </motion.h2>
          <motion.p
            className="font-rajdhani mb-10"
            style={{ color: '#888888', fontSize: '17px' }}
            initial={{ opacity: 0, y: 16 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.12 }}
          >
            Node onboarding opens in waves. Get early access and be first to earn.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.22 }}
          >
            <NodeWaitlistForm />
          </motion.div>
        </div>
      </section>
    </>
  )
}
