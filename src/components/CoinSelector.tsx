'use client'
import { Coin } from '@/lib/api'

interface Props {
  selected: Coin
  onChange: (c: Coin) => void
}

const COINS = [
  {
    id: 'BTC-USD' as Coin,
    symbol: '₿',
    name: 'Bitcoin',
    abbr: 'BTC',
    tagline: 'Digital Gold',
    color: '#f7931a',
    glow: 'rgba(247,147,26,0.4)',
    dimBg: 'rgba(247,147,26,0.06)',
    activeBg: 'rgba(247,147,26,0.12)',
    borderActive: 'rgba(247,147,26,0.5)',
    borderIdle: 'rgba(255,255,255,0.06)',
  },
  {
    id: 'ETH-USD' as Coin,
    symbol: 'Ξ',
    name: 'Ethereum',
    abbr: 'ETH',
    tagline: 'Smart Contract Layer',
    color: '#627eea',
    glow: 'rgba(98,126,234,0.4)',
    dimBg: 'rgba(98,126,234,0.06)',
    activeBg: 'rgba(98,126,234,0.12)',
    borderActive: 'rgba(98,126,234,0.5)',
    borderIdle: 'rgba(255,255,255,0.06)',
  },
]

export default function CoinSelector({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {COINS.map((coin) => {
        const active = selected === coin.id
        return (
          <button
            key={coin.id}
            onClick={() => onChange(coin.id)}
            style={{
              background: active ? coin.activeBg : coin.dimBg,
              border: `1px solid ${active ? coin.borderActive : coin.borderIdle}`,
              boxShadow: active ? `0 0 32px ${coin.glow}, inset 0 1px 0 rgba(255,255,255,0.08)` : 'none',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}
            className="relative rounded-2xl p-6 text-left cursor-pointer group overflow-hidden"
          >
            {/* Glow pulse on active */}
            {active && (
              <span
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 30% 40%, ${coin.glow} 0%, transparent 70%)`,
                  opacity: 0.5,
                }}
              />
            )}

            {/* Symbol */}
            <div
              className="text-5xl font-black mb-3 leading-none"
              style={{
                color: coin.color,
                textShadow: active ? `0 0 24px ${coin.glow}` : 'none',
                fontFamily: 'var(--font-mono)',
                transition: 'text-shadow 0.25s',
              }}
            >
              {coin.symbol}
            </div>

            {/* Name */}
            <div className="text-base font-bold" style={{ color: active ? coin.color : '#94a3b8' }}>
              {coin.name}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: 'var(--font-mono)' }}>
              {coin.abbr} · {coin.tagline}
            </div>

            {/* Active dot */}
            <div
              className="absolute top-4 right-4 w-2 h-2 rounded-full transition-all duration-300"
              style={{ background: active ? coin.color : 'rgba(255,255,255,0.1)', boxShadow: active ? `0 0 8px ${coin.color}` : 'none' }}
            />
          </button>
        )
      })}
    </div>
  )
}
