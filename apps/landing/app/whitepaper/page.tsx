import Nav from '../components/Nav'
import Footer from '../components/Footer'
import WhitepaperContent from '../components/WhitepaperContent'

export const metadata = {
  title: 'Whitepaper — Veil Protocol',
  description:
    'Technical whitepaper for Veil Protocol: quantum-resistant identity, PQCTransport, Ghost AI, and the x402-pqc payment standard.',
}

export default function WhitepaperPage() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000000', minHeight: '100vh' }}>
        <WhitepaperContent />
      </main>
      <Footer />
    </>
  )
}
