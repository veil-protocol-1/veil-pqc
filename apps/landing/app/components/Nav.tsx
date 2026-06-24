'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'PROTOCOL', href: '/#protocol' },
  { label: 'GHOST', href: '/ghost' },
  { label: 'SECURITY', href: '/security' },
  { label: 'DEVELOPERS', href: '/developers' },
  { label: 'TOKEN', href: '/token' },
  { label: 'NODES', href: '/nodes' },
]

function VeilIcon() {
  return (
    <img
      src="/veil-icon.png"
      alt="Veil"
      style={{ height: '32px', width: 'auto' }}
    />
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 80)
          ticking.current = false
        })
        ticking.current = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(0,0,0,0.85)' : '#000000',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(168,85,247,0.35)'
          : '1px solid rgba(168,85,247,0.2)',
        boxShadow: scrolled ? '0 0 20px rgba(168,85,247,0.1)' : 'none',
      }}
    >
      {/* Logo + wordmark */}
      <Link href="/" className="flex items-center gap-2.5 select-none">
        <VeilIcon />
        <span
          className="font-orbitron text-white font-bold"
          style={{ fontSize: '20px', letterSpacing: '8px' }}
        >
          VEIL
        </span>
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="font-rajdhani text-white hover:text-purple-500 transition-colors duration-200"
            style={{ fontSize: '14px', letterSpacing: '2px' }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
