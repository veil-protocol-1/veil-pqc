import type { Metadata } from 'next'
import { Orbitron, Rajdhani, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Veil — Your face. Your money. Your agent.',
  description:
    'The world\'s first quantum-resistant self-sovereign AI-powered neobank. Built for a future most wallets won\'t survive.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Veil — Quantum-Resistant Neobank',
    description: 'Post-quantum identity. Private AI. ML-DSA-65 signed.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
