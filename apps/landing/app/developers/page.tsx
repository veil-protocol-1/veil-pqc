import Nav from '../components/Nav'
import Footer from '../components/Footer'
import DevelopersPageContent from '../components/DevelopersPageContent'

export const metadata = {
  title: 'Developers — Veil',
}

export default function DevelopersPage() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000000', minHeight: '100vh' }}>
        <DevelopersPageContent />
      </main>
      <Footer />
    </>
  )
}
