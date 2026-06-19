'use client'

import dynamic from 'next/dynamic'
import Nav from './components/Nav'
import HeroSection from './components/HeroSection'
import QuantumSection from './components/QuantumSection'
import PillarsSection from './components/PillarsSection'
import GhostSpotlight from './components/GhostSpotlight'
import DeveloperSection from './components/DeveloperSection'
import TokenSection from './components/TokenSection'
import Footer from './components/Footer'

const ParticleField = dynamic(() => import('./components/ParticleField'), {
  ssr: false,
})

const SmoothScrollProvider = dynamic(
  () => import('./components/SmoothScrollProvider'),
  { ssr: false }
)

export default function Home() {
  return (
    <SmoothScrollProvider>
      {/* Fixed particle field background */}
      <ParticleField />

      {/* Fixed nav */}
      <Nav />

      {/* Page content */}
      <main className="relative" style={{ zIndex: 1 }}>
        <HeroSection />
        <QuantumSection />
        <PillarsSection />
        <GhostSpotlight />
        <DeveloperSection />
        <TokenSection />
      </main>

      <Footer />
    </SmoothScrollProvider>
  )
}
