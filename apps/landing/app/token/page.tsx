import Nav from '../components/Nav'
import Footer from '../components/Footer'
import TokenPageContent from '../components/TokenPageContent'

export const metadata = {
  title: 'Token — Veil',
}

export default function TokenPage() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000000', minHeight: '100vh' }}>
        <TokenPageContent />
      </main>
      <Footer />
    </>
  )
}
