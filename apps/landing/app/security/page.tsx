import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SecurityPageContent from '../components/SecurityPageContent'

export const metadata = {
  title: 'Security — Veil',
}

export default function SecurityPage() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000000', minHeight: '100vh' }}>
        <SecurityPageContent />
      </main>
      <Footer />
    </>
  )
}
