'use client'

const ASSETS = [
  { symbol: 'ETH', name: 'ETHEREUM', amount: '1.84 ETH', value: '$3,478.21', change: '+2.35%', up: true },
  { symbol: 'USDC', name: 'USD COIN', amount: '2,500 USDC', value: '$2,500.00', change: '+0.01%', up: true },
  { symbol: 'BTC', name: 'BITCOIN', amount: '0.05 BTC', value: '$2,333.58', change: '-1.12%', up: false },
  { symbol: 'VEIL', name: 'VEIL', amount: '18,420 VEIL', value: '$1,250.32', change: '+3.21%', up: true },
]

function Sparkline({ up }: { up: boolean }) {
  const color = up ? '#4ade80' : '#f87171'
  const points = up
    ? '0,18 8,14 16,16 24,10 32,12 40,6 48,8 56,4 64,2'
    : '0,4 8,6 16,4 24,10 32,8 40,14 48,12 56,16 64,18'
  return (
    <svg width="64" height="20" viewBox="0 0 64 20">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CryptoIcon({ symbol }: { symbol: string }) {
  const colors: Record<string, string> = {
    ETH: '#627EEA',
    USDC: '#2775CA',
    BTC: '#F7931A',
    VEIL: '#A855F7',
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-orbitron font-bold"
      style={{ background: colors[symbol] ?? '#555', fontSize: '10px' }}
    >
      {symbol[0]}
    </div>
  )
}

export default function MoneyPhone() {
  return (
    <div className="iphone-frame w-[220px] h-[440px] flex flex-col animate-float">
      {/* Status bar spacer */}
      <div className="h-8 flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
        {/* Portfolio value */}
        <div className="text-center mb-4">
          <p
            className="font-rajdhani uppercase"
            style={{ color: '#A855F7', fontSize: '10px', letterSpacing: '2px' }}
          >
            PORTFOLIO VALUE
          </p>
          <p className="font-orbitron font-bold text-white" style={{ fontSize: '26px' }}>
            $4,821.03
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-1 mb-4">
          {['SEND', 'RECEIVE', 'SWAP', 'PAY'].map((action) => (
            <div key={action} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
              >
                <div className="w-3 h-3 rounded-sm" style={{ background: '#A855F7', opacity: 0.8 }} />
              </div>
              <span className="font-rajdhani text-grey" style={{ fontSize: '8px', letterSpacing: '0.5px' }}>
                {action}
              </span>
            </div>
          ))}
        </div>

        {/* Assets header */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-rajdhani uppercase text-white" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
            ASSETS
          </span>
          <span className="font-rajdhani text-grey" style={{ fontSize: '9px' }}>
            24H CHANGE ↓
          </span>
        </div>

        {/* Asset rows */}
        <div className="flex flex-col gap-2 flex-1">
          {ASSETS.map((asset) => (
            <div key={asset.symbol} className="flex items-center gap-2">
              <CryptoIcon symbol={asset.symbol} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-orbitron text-white font-bold" style={{ fontSize: '9px' }}>
                    {asset.symbol}
                  </span>
                  <span className="font-rajdhani text-white" style={{ fontSize: '9px' }}>
                    {asset.value}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-rajdhani text-grey" style={{ fontSize: '8px' }}>
                    {asset.amount}
                  </span>
                  <span
                    className="font-rajdhani font-bold"
                    style={{ fontSize: '8px', color: asset.up ? '#4ade80' : '#f87171' }}
                  >
                    {asset.change}
                  </span>
                </div>
              </div>
              <Sparkline up={asset.up} />
            </div>
          ))}
        </div>

        {/* Bottom badges */}
        <div className="flex gap-2 mt-2">
          <div
            className="flex-1 flex items-center justify-center gap-1 rounded-md py-1"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="font-orbitron text-purple-400" style={{ fontSize: '7px', letterSpacing: '0.5px' }}>
              ML-DSA-65
            </span>
          </div>
          <div
            className="flex-1 flex items-center justify-center gap-1 rounded-md py-1"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="font-orbitron text-purple-400" style={{ fontSize: '7px', letterSpacing: '0.3px' }}>
              PQ SECURED
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
