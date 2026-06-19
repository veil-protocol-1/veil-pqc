import Nav from '../components/Nav'
import Footer from '../components/Footer'
import DevelopersPageContent from '../components/DevelopersPageContent'
import DeveloperSection from '../components/DeveloperSection'

export const metadata = {
  title: 'Developers — Veil',
}

export default function DevelopersPage() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000000', minHeight: '100vh' }}>
        <DevelopersPageContent />
        <DeveloperSection />
        <p
          className="font-rajdhani text-center pb-20 px-4"
          style={{ color: '#888888', fontSize: '14px' }}
        >
          COMING SOON: Full documentation at docs.veilprotocol.net
        </p>
      </main>
      <Footer />
    </>
  )
}
