import Nav from '../components/Nav'
import Footer from '../components/Footer'
import NodesPageContent from '../components/NodesPageContent'

export const metadata = {
  title: 'Nodes — Veil',
}

export default function NodesPage() {
  return (
    <>
      <Nav />
      <main style={{ background: '#000000', minHeight: '100vh' }}>
        <NodesPageContent />
      </main>
      <Footer />
    </>
  )
}
