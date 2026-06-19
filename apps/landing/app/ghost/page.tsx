import Nav from '../components/Nav'
import Footer from '../components/Footer'
import GhostPageContent from '../components/GhostPageContent'

export const metadata = {
  title: 'Ghost — Veil',
}

export default function GhostPage() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000000', minHeight: '100vh' }}>
        <GhostPageContent />
      </main>
      <Footer />
    </>
  )
}
