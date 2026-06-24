'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const SECTIONS = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'introduction', label: '1. Introduction' },
  { id: 'architecture', label: '2. Architecture' },
  { id: 'biometric-ssi', label: '3. Biometric SSI' },
  { id: 'pqctransport', label: '4. PQCTransport' },
  { id: 'ghost-ai', label: '5. Ghost AI Agent' },
  { id: 'x402-pqc', label: '6. x402-pqc Standard' },
  { id: 'contract', label: '7. x402PQCPayments' },
  { id: 'tokenomics', label: '8. Token Economics' },
  { id: 'security', label: '9. Security' },
  { id: 'roadmap', label: '10. Roadmap' },
  { id: 'conclusion', label: '11. Conclusion' },
]

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

function SectionHeading({ id, number, title }: { id: string; number?: string; title: string }) {
  return (
    <h2
      id={id}
      className="font-orbitron font-bold text-white scroll-mt-24"
      style={{ fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '2px', marginBottom: '24px', marginTop: '56px' }}
    >
      {number && (
        <span style={{ color: 'rgba(168,85,247,0.7)', marginRight: '12px', fontSize: '0.75em' }}>
          {number}
        </span>
      )}
      {title}
    </h2>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-orbitron font-bold text-white"
      style={{ fontSize: '16px', letterSpacing: '2px', marginBottom: '12px', marginTop: '32px', color: 'rgba(168,85,247,0.9)' }}
    >
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-rajdhani text-gray-300 leading-relaxed"
      style={{ fontSize: '17px', marginBottom: '18px', lineHeight: '1.75' }}
    >
      {children}
    </p>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-mono text-purple-300"
      style={{ fontSize: '14px', background: 'rgba(168,85,247,0.1)', padding: '2px 6px', borderRadius: '4px' }}
    >
      {children}
    </code>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      className="font-mono text-green-300 overflow-x-auto"
      style={{
        fontSize: '13px',
        background: '#0a0a0a',
        border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        lineHeight: '1.65',
      }}
    >
      <code>{children}</code>
    </pre>
  )
}

function InfoBox({ children, color = 'purple' }: { children: React.ReactNode; color?: 'purple' | 'green' | 'amber' }) {
  const colors = {
    purple: { border: 'rgba(168,85,247,0.35)', bg: 'rgba(168,85,247,0.06)', text: '#c084fc' },
    green: { border: 'rgba(34,197,94,0.35)', bg: 'rgba(34,197,94,0.06)', text: '#4ade80' },
    amber: { border: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.06)', text: '#fbbf24' },
  }
  const c = colors[color]
  return (
    <div
      style={{
        border: `1px solid ${c.border}`,
        background: c.bg,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
      }}
    >
      <p className="font-rajdhani text-gray-300" style={{ fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
        {children}
      </p>
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="font-orbitron text-purple-400 text-left"
                style={{
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(168,85,247,0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: '1px solid rgba(168,85,247,0.1)', background: i % 2 === 0 ? 'transparent' : 'rgba(168,85,247,0.02)' }}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="font-rajdhani text-gray-300"
                  style={{ fontSize: '15px', padding: '10px 16px', lineHeight: '1.5' }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)',
        margin: '48px 0',
      }}
    />
  )
}

function ArchDiagram() {
  const layers = [
    {
      label: 'LAYER 3 — INTELLIGENCE',
      sublabel: 'Ghost AI Agent',
      items: ['DistilBERT Intent Classifier', 'De-identification Pipeline', 'FHE Circle Execution (Octra)', 'Tiered Pricing Engine'],
      color: '#a855f7',
    },
    {
      label: 'LAYER 2 — TRANSPORT',
      sublabel: 'PQCTransport',
      items: ['ML-KEM-768 (FIPS 203) Key Exchange', 'ML-DSA-65 (FIPS 204) Signatures', 'AES-256-GCM Encryption', 'Replay Window Protection'],
      color: '#7c3aed',
    },
    {
      label: 'LAYER 1 — SETTLEMENT',
      sublabel: 'Base + Octra',
      items: ['x402PQCPayments Contract (Base)', 'VEILToken / Treasury (Sepolia)', 'Octra FHE Circles', 'Gnosis Safe 2-of-2 Multisig'],
      color: '#5b21b6',
    },
  ]
  return (
    <div style={{ marginBottom: '32px' }}>
      {layers.map((layer, i) => (
        <div
          key={i}
          style={{
            border: `1px solid ${layer.color}40`,
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '12px',
            background: `${layer.color}08`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
            <span
              className="font-orbitron font-bold"
              style={{ fontSize: '11px', letterSpacing: '2px', color: layer.color }}
            >
              {layer.label}
            </span>
            <span className="font-rajdhani text-gray-400" style={{ fontSize: '14px' }}>
              {layer.sublabel}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {layer.items.map((item) => (
              <span
                key={item}
                className="font-mono text-gray-300"
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${layer.color}25`,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div
        style={{
          textAlign: 'center',
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(168,85,247,0.05)',
          border: '1px solid rgba(168,85,247,0.15)',
        }}
      >
        <span className="font-orbitron text-purple-500" style={{ fontSize: '10px', letterSpacing: '2px' }}>
          BIOMETRIC SSI — LOCAL KEY DERIVATION (FUZZY EXTRACTOR + HKDF-SHA3-512)
        </span>
      </div>
    </div>
  )
}

function TableOfContents({ activeId }: { activeId: string }) {
  return (
    <nav
      className="hidden lg:block"
      style={{
        position: 'sticky',
        top: '96px',
        width: '220px',
        flexShrink: 0,
        alignSelf: 'flex-start',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(168,85,247,0.2)',
          borderRadius: '12px',
          padding: '20px 16px',
          background: 'rgba(168,85,247,0.03)',
        }}
      >
        <p
          className="font-orbitron text-purple-400"
          style={{ fontSize: '10px', letterSpacing: '2px', marginBottom: '16px' }}
        >
          CONTENTS
        </p>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {SECTIONS.map((s) => (
            <li key={s.id} style={{ marginBottom: '6px' }}>
              <a
                href={`#${s.id}`}
                className="font-rajdhani transition-colors duration-200"
                style={{
                  fontSize: '13px',
                  color: activeId === s.id ? '#c084fc' : 'rgba(255,255,255,0.45)',
                  display: 'block',
                  padding: '3px 0',
                  textDecoration: 'none',
                  borderLeft: activeId === s.id ? '2px solid #a855f7' : '2px solid transparent',
                  paddingLeft: '10px',
                  lineHeight: '1.4',
                }}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default function WhitepaperContent() {
  const [activeId, setActiveId] = useState('abstract')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-36 pb-16 px-4 flex flex-col items-center text-center"
        style={{ background: '#000000' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 70%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 flex flex-col items-center"
        >
          <span
            className="font-orbitron text-purple-400"
            style={{ fontSize: '11px', letterSpacing: '4px', marginBottom: '20px', display: 'block' }}
          >
            TECHNICAL WHITEPAPER — v1.0 — JUNE 2026
          </span>
          <h1
            className="font-orbitron font-bold text-white"
            style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.05, letterSpacing: '4px', marginBottom: '24px' }}
          >
            VEIL PROTOCOL
          </h1>
          <p
            className="font-rajdhani text-gray-400 max-w-2xl"
            style={{ fontSize: '20px', lineHeight: '1.6', marginBottom: '40px' }}
          >
            A quantum-resistant, self-sovereign AI neobank built on post-quantum cryptography standards FIPS 203 and FIPS 204, biometric identity, and private agent execution.
          </p>
          <a
            href="/veil-whitepaper.pdf"
            download
            className="font-orbitron font-bold transition-all duration-200 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '13px',
              letterSpacing: '2px',
              textDecoration: 'none',
              boxShadow: '0 0 24px rgba(168,85,247,0.3)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            DOWNLOAD PDF
          </a>
        </motion.div>
      </section>

      {/* Body: sidebar + content */}
      <div
        className="max-w-7xl mx-auto px-4 pb-24"
        style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}
      >
        <TableOfContents activeId={activeId} />

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: '820px' }}>

          {/* Abstract */}
          <Fade>
            <div id="abstract" className="scroll-mt-24">
              <div
                style={{
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: '16px',
                  padding: '32px 36px',
                  background: 'rgba(168,85,247,0.04)',
                  marginBottom: '16px',
                  marginTop: '16px',
                }}
              >
                <p
                  className="font-orbitron text-purple-400"
                  style={{ fontSize: '11px', letterSpacing: '3px', marginBottom: '16px' }}
                >
                  ABSTRACT
                </p>
                <p
                  className="font-rajdhani text-gray-200"
                  style={{ fontSize: '17px', lineHeight: '1.8' }}
                >
                  The advent of cryptographically relevant quantum computers poses an existential threat to every classical cryptographic wallet in existence. Billions of dollars in digital assets secured by ECDSA and RSA will become retroactively exposed the moment Shor's algorithm runs at scale — a scenario cryptographers call "harvest-now-decrypt-later." Veil Protocol is the first production neobank designed from day zero on NIST-standardized post-quantum cryptography: ML-KEM-768 (FIPS 203) for key encapsulation and ML-DSA-65 (FIPS 204) for digital signatures. Combined with biometric self-sovereign identity, a private AI agent powered by fully-homomorphic-encrypted Octra Circles, and an HTTP-native quantum-resistant payment standard (x402-pqc), Veil delivers a complete financial stack that survives the quantum transition — without seed phrases, custodians, or classical key exposure.
                </p>
              </div>
            </div>
          </Fade>

          <Divider />

          {/* 1. Introduction */}
          <Fade>
            <SectionHeading id="introduction" number="1" title="Introduction" />

            <SubHeading>The Harvest-Now-Decrypt-Later Threat</SubHeading>
            <P>
              Nation-state adversaries are intercepting and archiving encrypted traffic today with the explicit intention of decrypting it once a cryptographically relevant quantum computer exists. This "harvest-now-decrypt-later" (HNDL) attack requires no immediate cryptographic capability — it is purely a storage problem that governments and well-funded actors have already solved. Intelligence agencies have signaled that HNDL collection has been operational for years.
            </P>
            <P>
              For financial assets, the consequences are severe. A private key for an ECDSA wallet observed today can be derived from any historical transaction signature once Shor's algorithm runs at scale. Entire wallet histories — every address, every balance, every counterparty — become transparent. The attack is retroactive: funds held in classical wallets today are already compromised in the adversary's timeline.
            </P>

            <SubHeading>NIST PQC Standards (2024)</SubHeading>
            <P>
              In August 2024, NIST finalized the first post-quantum cryptographic standards:
            </P>
            <Table
              headers={['Standard', 'Algorithm', 'Purpose', 'Security Level']}
              rows={[
                ['FIPS 203', 'ML-KEM-768', 'Key Encapsulation Mechanism', 'Level 3 (AES-192 equiv.)'],
                ['FIPS 204', 'ML-DSA-65', 'Digital Signature', 'Level 3'],
                ['FIPS 205', 'SLH-DSA', 'Stateless Hash-based Signature', 'Level 3'],
              ]}
            />
            <P>
              ML-KEM (Module Lattice Key Encapsulation Mechanism) is based on the hardness of the Module Learning With Errors (MLWE) problem — a problem believed to be intractable for both classical and quantum computers. ML-DSA (Module Lattice Digital Signature Algorithm) provides signatures with the same lattice-based security guarantees. Veil ships on both from day one.
            </P>

            <SubHeading>Why Crypto Wallets Are Vulnerable</SubHeading>
            <P>
              Current hardware and software wallets protect private keys from classical adversaries but are structurally unable to address the quantum threat:
            </P>
            <InfoBox color="amber">
              <strong style={{ color: '#fbbf24' }}>Classical wallet vulnerability surface:</strong> (1) ECDSA private keys derivable from any on-chain signature via Shor's algorithm; (2) BIP-39 seed phrases stored in plaintext or classical encryption; (3) HD wallet derivation paths (BIP-32/44) use HMAC-SHA512 — not quantum-resistant for key material; (4) TLS transport layers rely on ECDH/RSA handshakes harvestable today.
            </InfoBox>
            <P>
              Veil replaces every layer of this stack. Keys are never derived from a mnemonic phrase. Transport uses hybrid KEM-DEM with ML-KEM-768. Signatures use ML-DSA-65. Identity is derived from biometric data locally, never transmitted.
            </P>
          </Fade>

          <Divider />

          {/* 2. Architecture */}
          <Fade>
            <SectionHeading id="architecture" number="2" title="Architecture Overview" />
            <P>
              Veil Protocol is organized in three interdependent layers, each independently quantum-resistant and composable with the others.
            </P>
            <ArchDiagram />
            <P>
              <strong style={{ color: '#c084fc' }}>Layer 1 — Settlement</strong> handles asset finality and payment recording on-chain. The <Mono>x402PQCPayments</Mono> contract on Base mainnet provides a non-custodial payment ledger. Octra's fully-homomorphic-encrypted (FHE) Circles provide private computation on the settlement layer without revealing transaction details to any node operator.
            </P>
            <P>
              <strong style={{ color: '#c084fc' }}>Layer 2 — Transport</strong> is PQCTransport, a session-oriented cryptographic channel using hybrid KEM-DEM construction. Every byte leaving a Veil client is encrypted under a freshly negotiated ML-KEM-768 session key. Payloads are authenticated with ML-DSA-65 signatures. Replay attacks are blocked by a sliding-window nonce tracker.
            </P>
            <P>
              <strong style={{ color: '#c084fc' }}>Layer 3 — Intelligence</strong> is the Ghost AI Agent layer. Ghost runs a DistilBERT-based intent classifier locally, applies a multi-stage de-identification pipeline to user input before any LLM call is made, and executes financial operations inside Octra FHE Circles so that execution context remains encrypted end-to-end.
            </P>
            <P>
              Underpinning all three layers is Biometric SSI — a local key derivation system where user identity is derived from a biometric template using a fuzzy extractor and HKDF-SHA3-512. No seed phrase is ever generated or stored. Keys exist only as ephemeral derivatives of the user's face.
            </P>
          </Fade>

          <Divider />

          {/* 3. Biometric SSI */}
          <Fade>
            <SectionHeading id="biometric-ssi" number="3" title="Biometric SSI" />
            <SubHeading>The Seed Phrase Problem</SubHeading>
            <P>
              BIP-39 mnemonic phrases are a usability disaster masquerading as a security primitive. They require users to securely store 12–24 human-readable words that, if obtained by any adversary, grant permanent irrevocable access to all funds. Cloud backups, screenshots, and shoulder surfing have drained wallets worth billions. Biometric SSI eliminates the seed phrase entirely.
            </P>

            <SubHeading>Fuzzy Extractor</SubHeading>
            <P>
              A fuzzy extractor is a cryptographic primitive that extracts a stable, uniformly random key from noisy biometric data. Given a face scan <Mono>bio₁</Mono> and the same face scanned under different lighting, angle, or expression as <Mono>bio₂</Mono>, a fuzzy extractor outputs the same key <Mono>K</Mono> as long as <Mono>bio₁</Mono> and <Mono>bio₂</Mono> are within a defined Hamming distance threshold. The construction uses a secure sketch to publish helper data <Mono>P</Mono> — a value that reveals nothing about <Mono>K</Mono> but allows reconstruction by the legitimate biometric owner.
            </P>
            <CodeBlock>{`// Simplified fuzzy extractor construction
KeyDerivation(bio: BiometricTemplate):
  sketch  = SecureSketch.gen(bio)          // helper data, public
  seed    = ExtractSeed(bio, sketch)       // stable random seed
  ikm     = HKDF-SHA3-512(seed, "veil-v1")
  sigKey  = ML-DSA-65.keygen(ikm)
  kemKey  = ML-KEM-768.keygen(ikm)
  return { sigKey, kemKey, sketch }`}</CodeBlock>

            <SubHeading>HKDF-SHA3-512 Key Derivation</SubHeading>
            <P>
              The extracted seed is passed through HKDF (RFC 5869) using SHA3-512 as the hash function. SHA3-512 is quantum-resistant in the sense that Grover's algorithm reduces its effective security from 512 bits to 256 bits — still well above any foreseeable threat. Separate HKDF contexts produce independent key material for signing keys (<Mono>ML-DSA-65</Mono>) and encapsulation keys (<Mono>ML-KEM-768</Mono>).
            </P>

            <SubHeading>No Seed Phrase</SubHeading>
            <P>
              The derived key material never leaves the device in plaintext. The secure sketch <Mono>P</Mono> is the only artifact persisted — it is safe to store publicly because it reveals no information about the underlying key without the original biometric. Recovery flows use the sketch; authentication flows re-derive keys on-demand from the live biometric scan.
            </P>

            <SubHeading>Social Recovery (SSS)</SubHeading>
            <P>
              For users who opt into guardian-based recovery, Veil implements Shamir Secret Sharing (SSS). The seed is split into <Mono>n</Mono> shares distributed to trusted contacts; any <Mono>k</Mono> of <Mono>n</Mono> shares (threshold scheme) allows reconstruction. Shares are individually encrypted to each guardian's ML-KEM-768 public key so no single guardian has access to the underlying seed.
            </P>
            <InfoBox color="green">
              <strong style={{ color: '#4ade80' }}>Privacy guarantee:</strong> No biometric data is ever transmitted to Veil servers. The fuzzy extractor, HKDF derivation, and key generation all execute locally on-device inside a secure enclave. Veil has zero knowledge of user biometrics.
            </InfoBox>
          </Fade>

          <Divider />

          {/* 4. PQCTransport */}
          <Fade>
            <SectionHeading id="pqctransport" number="4" title="PQCTransport" />
            <SubHeading>Design Goals</SubHeading>
            <P>
              PQCTransport is Veil's quantum-resistant session layer, published as <Mono>@veil_/pqc-wallet</Mono>. It replaces TLS's ECDH-based handshake with an ML-KEM-768 key encapsulation mechanism while preserving the familiar session-oriented API that application developers expect. The design goals are: (1) forward secrecy through ephemeral KEM keypairs, (2) authentication through ML-DSA-65 signatures, (3) confidentiality through AES-256-GCM, and (4) integrity protection against replay attacks.
            </P>

            <SubHeading>ML-KEM-768 (FIPS 203)</SubHeading>
            <P>
              ML-KEM-768 provides IND-CCA2-secure key encapsulation at NIST security level 3. The initiating party generates an ephemeral ML-KEM-768 keypair, encapsulates a shared secret to the responder's long-term KEM public key, and transmits the ciphertext. The responder decapsulates to recover the shared secret. Both parties then derive a symmetric session key via HKDF-SHA3-512.
            </P>
            <Table
              headers={['Parameter', 'ML-KEM-768 Value']}
              rows={[
                ['Public key size', '1,184 bytes'],
                ['Secret key size', '2,400 bytes'],
                ['Ciphertext size', '1,088 bytes'],
                ['Shared secret size', '32 bytes'],
                ['Security level', 'NIST Level 3 (≈AES-192)'],
              ]}
            />

            <SubHeading>ML-DSA-65 (FIPS 204)</SubHeading>
            <P>
              Every PQCTransport message is signed with the sender's ML-DSA-65 identity key, derived from the biometric SSI layer. Recipients verify the signature before processing payload content. This binding between transport authentication and biometric identity means that message forgery requires compromising both the ML-KEM session and the signer's biometric — an extremely high bar.
            </P>

            <SubHeading>Hybrid KEM-DEM Construction</SubHeading>
            <P>
              The full transport construction is a hybrid KEM-DEM (Key Encapsulation Mechanism / Data Encapsulation Mechanism):
            </P>
            <CodeBlock>{`PQCTransport.send(payload, recipientKemPubKey, senderSigKey):
  // KEM phase
  (ct, ss) = ML-KEM-768.encapsulate(recipientKemPubKey)
  sessionKey = HKDF-SHA3-512(ss, nonce || "pqct-v1")

  // DEM phase
  nonce      = randomBytes(12)
  ciphertext = AES-256-GCM.encrypt(sessionKey, nonce, payload)

  // Authentication
  sig = ML-DSA-65.sign(senderSigKey, ct || nonce || ciphertext)

  return { ct, nonce, ciphertext, sig }`}</CodeBlock>

            <SubHeading>AES-256-GCM</SubHeading>
            <P>
              Payload encryption uses AES-256-GCM with a randomly generated 96-bit nonce. GCM provides both confidentiality and integrity — the authentication tag is verified before any plaintext is returned. AES-256 provides 128 bits of security against Grover's algorithm on quantum computers, well above any foreseeable threat.
            </P>

            <SubHeading>Replay Window Protection</SubHeading>
            <P>
              PQCTransport maintains a 64-bit sliding-window nonce tracker per session. Incoming messages with a nonce outside the window or with a nonce already seen within the window are silently dropped. This prevents replay attacks even if an adversary can capture and re-inject valid ciphertexts at the network layer.
            </P>
          </Fade>

          <Divider />

          {/* 5. Ghost AI */}
          <Fade>
            <SectionHeading id="ghost-ai" number="5" title="Ghost AI Agent" />
            <SubHeading>Overview</SubHeading>
            <P>
              Ghost is Veil's built-in AI financial agent. It accepts natural-language instructions from the user, classifies the user's intent, de-identifies the request before any LLM call, executes financial operations inside Octra FHE Circles, and returns results — all without exposing user financial data to any LLM provider.
            </P>

            <SubHeading>DistilBERT Intent Classifier (96.7% accuracy)</SubHeading>
            <P>
              Ghost's first layer is a locally-running DistilBERT model fine-tuned on financial intent classification. The classifier categorizes user input into intents such as <Mono>send_payment</Mono>, <Mono>check_balance</Mono>, <Mono>swap_token</Mono>, <Mono>analyze_portfolio</Mono>, and <Mono>general_query</Mono>. Running locally on-device means intent classification never touches an external API. The model achieves 96.7% accuracy on the labeled test set.
            </P>
            <Table
              headers={['Intent Class', 'Example Input', 'Tier']}
              rows={[
                ['check_balance', '"What\'s my ETH balance?"', 'Free'],
                ['send_payment', '"Send 50 USDC to Alice"', 'Standard'],
                ['swap_token', '"Swap 0.1 ETH for USDC"', 'Standard'],
                ['analyze_portfolio', '"How is my portfolio performing?"', 'Premium'],
                ['general_query', '"Explain impermanent loss"', 'Free'],
              ]}
            />

            <SubHeading>De-identification Pipeline</SubHeading>
            <P>
              Before any request reaches an external LLM (Claude, GPT-4, etc.), Ghost applies a multi-stage de-identification pipeline:
            </P>
            <InfoBox>
              <strong style={{ color: '#c084fc' }}>Stage 1 — Entity Extraction:</strong> Named entity recognition identifies wallet addresses, amounts, token symbols, counterparty names, and dates. These entities are replaced with typed placeholders: <Mono>0x1234...abcd</Mono> → <Mono>[WALLET_A]</Mono>, <Mono>500 USDC</Mono> → <Mono>[AMOUNT_1]</Mono>.<br /><br />
              <strong style={{ color: '#c084fc' }}>Stage 2 — Context Stripping:</strong> Historical transaction data, balance figures, and account identifiers are removed from the LLM context. The LLM sees only the structural intent, not the financial specifics.<br /><br />
              <strong style={{ color: '#c084fc' }}>Stage 3 — Re-identification on Return:</strong> LLM responses are post-processed to re-inject the original entities before display to the user. The LLM never processes real financial data.
            </InfoBox>

            <SubHeading>Tiered Pricing</SubHeading>
            <Table
              headers={['Tier', 'Price / Request', 'Capabilities']}
              rows={[
                ['Basic', '$0.002', 'Balance checks, transaction history, simple queries'],
                ['Standard', '$0.010', 'Payments, swaps, token transfers, portfolio view'],
                ['Premium', '$0.050', 'Portfolio analysis, DeFi strategy, multi-step operations'],
              ]}
            />

            <SubHeading>FHE Circle Execution (Octra)</SubHeading>
            <P>
              Financial operations determined by Ghost are executed inside Octra Circles — FHE-encrypted execution environments where computation occurs on encrypted data. Octra Circles allow Ghost to read balances, compute swap routes, and initiate transactions without any Octra node operator being able to observe the underlying data. The RPC endpoint is <Mono>https://octra.network/rpc</Mono> via JSON-RPC 2.0.
            </P>
          </Fade>

          <Divider />

          {/* 6. x402-pqc */}
          <Fade>
            <SectionHeading id="x402-pqc" number="6" title="x402-pqc Payment Standard" />
            <SubHeading>HTTP 402 as a Payment Primitive</SubHeading>
            <P>
              HTTP status code 402 ("Payment Required") was reserved in the original HTTP/1.1 specification for future use as a machine-native payment signal. The x402 Foundation has proposed a revival of this mechanism as a lightweight payment layer for AI agents and autonomous services. Veil's <Mono>x402-pqc</Mono> extension adds quantum-resistant cryptography to the x402 flow.
            </P>

            <SubHeading>Protocol Flow</SubHeading>
            <CodeBlock>{`// Standard x402-pqc flow
1. Client → Server: GET /api/resource
2. Server → Client: HTTP 402 Payment Required
   Headers:
     X-Payment-Required: amount=0.01, asset=USDC, chain=base
     X-KEM-PublicKey: <ML-KEM-768 public key, base64>
     X-Payment-Version: x402-pqc/1.0

3. Client: negotiate session key via ML-KEM-768
   (ct, ss) = ML-KEM-768.encapsulate(serverKemPub)
   paymentNonce = HKDF(ss, "x402-payment-v1")

4. Client → Server: GET /api/resource
   Headers:
     X-Payment-Proof: <signed payment record, ML-DSA-65>
     X-KEM-Ciphertext: <ct, base64>
     X-Payment-Nonce: <paymentNonce, hex>

5. Server: verify signature, verify payment on-chain
   → HTTP 200 + resource`}</CodeBlock>

            <SubHeading>ML-KEM-768 Payment Headers</SubHeading>
            <P>
              The payment negotiation uses ML-KEM-768 to derive a shared payment nonce that binds the payment proof cryptographically to the session. This prevents payment proof replay: a captured <Mono>X-Payment-Proof</Mono> header from one session cannot be replayed in another because the KEM ciphertext and derived nonce are session-specific and one-time.
            </P>

            <SubHeading>AI Agent Discovery via A2A</SubHeading>
            <P>
              Ghost agents discover x402-pqc-enabled services via the Agent-to-Agent (A2A) protocol. Services publish an Agent Card at <Mono>/.well-known/agent.json</Mono> advertising their KEM public key, accepted payment assets, pricing tiers, and capability manifest. Ghost reads Agent Cards autonomously and can initiate paid API sessions without human intervention, using the user's pre-authorized spending limits.
            </P>

            <SubHeading>x402 Foundation Proposal #2664</SubHeading>
            <P>
              Veil has submitted a formal proposal to the x402 Foundation (issue #2664 at <Mono>github.com/x402-foundation/x402</Mono>) to extend the x402 standard with post-quantum payment headers. The proposal defines the <Mono>X-KEM-PublicKey</Mono>, <Mono>X-KEM-Ciphertext</Mono>, <Mono>X-Payment-Nonce</Mono>, and <Mono>X-Payment-Version: x402-pqc/1.0</Mono> headers as an optional PQC extension layer compatible with the base x402 spec.
            </P>
          </Fade>

          <Divider />

          {/* 7. Contract */}
          <Fade>
            <SectionHeading id="contract" number="7" title="x402PQCPayments Contract" />
            <SubHeading>Contract Overview</SubHeading>
            <P>
              <Mono>x402PQCPayments</Mono> is a Solidity smart contract deployed on Base mainnet that provides an immutable, non-custodial payment ledger for the x402-pqc protocol. It records payment proofs on-chain, enabling any party to verify that a payment occurred without exposing payment amounts or counterparties beyond what the blockchain already makes visible.
            </P>
            <Table
              headers={['Field', 'Value']}
              rows={[
                ['Network', 'Base Mainnet'],
                ['Address', '0x8F446afA9877C79F3CCb5eaA5b6503752817223f'],
                ['Owner', '0xdEaD1f7583DEFE7A7fD701ea04ba49C14f871a0b (Gnosis Safe)'],
                ['Deployed', '2026-06-21'],
                ['Block', '47,635,981'],
                ['Gas used', '411,897'],
              ]}
            />

            <SubHeading>Gnosis Safe 2-of-2 Multisig</SubHeading>
            <P>
              Contract ownership is held by a Gnosis Safe with a 2-of-2 signing threshold. No single key can execute owner-only functions. This architecture eliminates single-key compromise as an attack vector for admin operations. The Safe address is counterfactually pre-computed (CREATE2); full deployment is gated on confirming the Safe transaction service recognizes the address.
            </P>

            <SubHeading>Non-Custodial Design</SubHeading>
            <P>
              The contract never holds user funds. It is a pure payment ledger — <Mono>registerPayment()</Mono> records that a payment occurred; it does not escrow, route, or manage assets. Settlement occurs at the token/USDC layer; the contract provides the cryptographic record. This design means a contract exploit cannot drain user funds: there are no funds to drain.
            </P>

            <SubHeading>renounceOwnership() Override</SubHeading>
            <P>
              The standard OpenZeppelin <Mono>renounceOwnership()</Mono> function is overridden to always revert. This prevents permanent owner lockout — a scenario where the owner key is lost and the contract becomes permanently unupgradeable. Owner operations require the 2-of-2 Safe signature; they can never be removed.
            </P>
            <InfoBox color="green">
              The x402PQCPayments contract is the only Veil contract deployed on Base mainnet. All other contracts (VEILToken, VEILTreasury, VEILVesting, VEILNodeRegistry, VEILPaymaster) remain on Base Sepolia testnet pending the Code4rena security audit required for token launch.
            </InfoBox>
          </Fade>

          <Divider />

          {/* 8. Tokenomics */}
          <Fade>
            <SectionHeading id="tokenomics" number="8" title="Token Economics" />
            <SubHeading>VEIL Token — Fixed Supply</SubHeading>
            <P>
              VEIL is a fixed-supply utility and governance token with a hard cap of 1,000,000,000 (1 billion) tokens. There is no inflation mechanism. No additional tokens can ever be minted. The supply is set at contract deployment and the mint function is permanently disabled thereafter.
            </P>

            <SubHeading>Allocation</SubHeading>
            <Table
              headers={['Category', 'Allocation', 'Tokens', 'Vesting']}
              rows={[
                ['Ecosystem / Rewards', '35%', '350,000,000', 'Ongoing, revenue-backed'],
                ['Team & Advisors', '20%', '200,000,000', '1yr cliff, 3yr linear'],
                ['Public Sale', '15%', '150,000,000', 'TGE unlock'],
                ['Treasury', '15%', '150,000,000', 'DAO-controlled'],
                ['Private / Seed', '10%', '100,000,000', '6mo cliff, 2yr linear'],
                ['Liquidity', '5%', '50,000,000', 'TGE unlock'],
              ]}
            />

            <SubHeading>Revenue-Backed Rewards</SubHeading>
            <P>
              Ecosystem rewards are funded by protocol revenue — Ghost AI agent fees, x402-pqc payment processing fees, and node operator staking fees — rather than inflationary token issuance. This means reward sustainability is tied to actual protocol usage rather than a mint schedule. As protocol revenue grows, the reward pool grows proportionally without diluting existing holders.
            </P>

            <SubHeading>Token Launch Gates</SubHeading>
            <P>
              Token launch is deliberately gated on two conditions that cannot be waived under deadline pressure:
            </P>
            <InfoBox color="amber">
              <strong style={{ color: '#fbbf24' }}>Gate 1 — Revenue:</strong> Protocol must demonstrate $50,000 MRR (monthly recurring revenue) across Ghost AI fees and x402-pqc payment volume, verified across at least two consecutive months.<br /><br />
              <strong style={{ color: '#fbbf24' }}>Gate 2 — Audit:</strong> Code4rena competitive audit of all mainnet-bound smart contracts (VEILToken, VEILTreasury, VEILVesting, VEILNodeRegistry, VEILPaymaster) must complete with all critical and high findings resolved.
            </InfoBox>
            <P>
              These gates exist to ensure the token represents genuine protocol value rather than speculative pre-revenue issuance. No team member or advisor can receive vested tokens until both gates are cleared.
            </P>
          </Fade>

          <Divider />

          {/* 9. Security */}
          <Fade>
            <SectionHeading id="security" number="9" title="Security" />
            <SubHeading>Halborn Audit</SubHeading>
            <Table
              headers={['Item', 'Status']}
              rows={[
                ['MNDA', 'Signed'],
                ['Audit status', 'In Progress'],
                ['Auditor', 'Halborn'],
                ['Scope', 'Smart contracts + PQC cryptographic layer'],
                ['Public report', 'Pending completion'],
              ]}
            />
            <P>
              Veil has engaged Halborn Security — the firm responsible for audits of Solana, Avalanche, and multiple DeFi protocols — for a comprehensive review of both the smart contract suite and the PQC cryptographic implementation layer. The engagement covers <Mono>@veil_/pqc-wallet</Mono>, <Mono>@veil_/auth</Mono>, <Mono>@veil_/x402-pqc</Mono>, and all Solidity contracts.
            </P>

            <SubHeading>Threat Model</SubHeading>
            <P>
              Veil's threat model addresses three adversary classes:
            </P>
            <InfoBox>
              <strong style={{ color: '#c084fc' }}>Classical adversary:</strong> Addressed by standard cryptographic hygiene — no plaintext key storage, authenticated encryption, secure random number generation, and tamper-evident audit logs.<br /><br />
              <strong style={{ color: '#c084fc' }}>Harvest-now-decrypt-later adversary:</strong> Addressed by ML-KEM-768 (FIPS 203) for all key exchanges and ML-DSA-65 (FIPS 204) for all signatures. Historical ciphertexts cannot be decrypted by a future quantum computer.<br /><br />
              <strong style={{ color: '#c084fc' }}>Biometric adversary:</strong> Addressed by the fuzzy extractor design — the secure sketch reveals no information about the underlying key without the original biometric, and biometric data never leaves the device.
            </InfoBox>

            <SubHeading>Quantum Computing Timeline</SubHeading>
            <P>
              Current expert consensus from NIST, NSA (CNSA 2.0 Suite), and academic researchers places the emergence of cryptographically relevant quantum computers (CRQCs) capable of breaking 256-bit ECC between 2030 and 2040, with increasing probability of earlier arrival as quantum error correction improves. The HNDL threat is already active — data collected today is the adversary's backlog for tomorrow.
            </P>
            <P>
              Veil's PQC implementation is designed to be algorithm-agile: if ML-KEM-768 or ML-DSA-65 are later found to have unexpected weaknesses, the transport and identity layers can be re-keyed to alternative NIST-approved algorithms (SLH-DSA, FN-DSA) without requiring users to create new accounts or re-enroll biometrics.
            </P>
          </Fade>

          <Divider />

          {/* 10. Roadmap */}
          <Fade>
            <SectionHeading id="roadmap" number="10" title="Roadmap" />
            <Table
              headers={['Phase', 'Timeline', 'Milestones']}
              rows={[
                [
                  'SDK & Agents',
                  'Live (Q2 2026)',
                  '@veil_/pqc-wallet, @veil_/auth, @veil_/x402-pqc, @veil_/circles, @veil_/agent-registry all published. x402PQCPayments on Base mainnet. Ghost AI agent in production. MCP server for agent-callable wrappers.',
                ],
                [
                  'Mobile',
                  'Q3 2026',
                  'iOS and Android Expo Router app. Biometric SSI enrollment. Ghost AI on-device DistilBERT inference. Full x402-pqc payment flows. Hardware security key integration.',
                ],
                [
                  'Enterprise & Token',
                  'Q4 2026',
                  'Token launch (gated: $50K MRR + Code4rena audit). Enterprise SDK with custom Circle deployment. VEILNodeRegistry mainnet. Multi-sig node operations. B2B payment API.',
                ],
              ]}
            />
          </Fade>

          <Divider />

          {/* 11. Conclusion */}
          <Fade>
            <SectionHeading id="conclusion" number="11" title="Conclusion" />
            <P>
              The quantum transition is not a distant hypothetical — it is an active adversarial campaign with a multi-decade payoff horizon. Every classical wallet deployed today is a ticking vulnerability for the harvest-now-decrypt-later threat.
            </P>
            <P>
              Veil Protocol demonstrates that quantum-resistant cryptography, biometric self-sovereign identity, and private AI execution are not mutually exclusive with user experience. By combining NIST-standardized ML-KEM-768 and ML-DSA-65 at every layer — transport, identity, and payment — Veil delivers a financial stack that is secure against both today's classical adversaries and tomorrow's quantum adversaries.
            </P>
            <P>
              The open-source packages (<Mono>@veil_/pqc-wallet</Mono>, <Mono>@veil_/auth</Mono>, <Mono>@veil_/x402-pqc</Mono>, <Mono>@veil_/circles</Mono>, <Mono>@veil_/agent-registry</Mono>) are available today for any developer building on the post-quantum stack. The x402-pqc standard is an open proposal. The future of money is lattice-based.
            </P>
            <div
              style={{
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: '16px',
                padding: '32px 36px',
                background: 'rgba(168,85,247,0.04)',
                marginTop: '40px',
                textAlign: 'center',
              }}
            >
              <p className="font-orbitron text-purple-400" style={{ fontSize: '11px', letterSpacing: '3px', marginBottom: '16px' }}>
                CONTACT & RESOURCES
              </p>
              <p className="font-rajdhani text-gray-300" style={{ fontSize: '16px', lineHeight: '1.8' }}>
                GitHub: <Mono>github.com/veil-protocol-1/veil-pqc</Mono><br />
                npm: <Mono>@veil_/pqc-wallet</Mono> · <Mono>@veil_/auth</Mono> · <Mono>@veil_/x402-pqc</Mono><br />
                x402 proposal: <Mono>github.com/x402-foundation/x402/issues/2664</Mono><br />
                Production: <Mono>veilprotocol.net</Mono>
              </p>
            </div>

            {/* Bottom download CTA */}
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <a
                href="/veil-whitepaper.pdf"
                download
                className="font-orbitron font-bold transition-all duration-200 inline-flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  textDecoration: 'none',
                  boxShadow: '0 0 24px rgba(168,85,247,0.3)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                DOWNLOAD PDF
              </a>
            </div>
          </Fade>
        </div>
      </div>
    </>
  )
}
