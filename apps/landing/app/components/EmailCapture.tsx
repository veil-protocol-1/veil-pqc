'use client'

import { useState } from 'react'

export default function EmailCapture({ heading }: { heading?: string }) {
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
    <div className="flex flex-col items-center px-4">
      {heading && (
        <p className="font-rajdhani text-white mb-5" style={{ fontSize: '16px' }}>
          {heading}
        </p>
      )}
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
            ? "✓ YOU'RE IN, SOVEREIGN"
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
  )
}
