'use client'
import { useEffect, useRef } from 'react'
import { Coin } from '@/lib/api'

interface Props {
  coin: Coin
  years: number
  forecastDays: number
  onYearsChange: (v: number) => void
  onForecastChange: (v: number) => void
}

const BTC_COLOR = '#f7931a'
const ETH_COLOR = '#627eea'

function SliderRow({
  label, value, min, max, unit, color,
  onChange, marks,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  color: string
  onChange: (v: number) => void
  marks?: number[]
}) {
  const ref = useRef<HTMLInputElement>(null)

  // Keep CSS --pct variable in sync for track fill
  useEffect(() => {
    if (!ref.current) return
    const pct = ((value - min) / (max - min)) * 100
    ref.current.style.setProperty('--pct', `${pct}%`)
    ref.current.style.background = `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`
  }, [value, min, max, color])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>{label}</span>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color, fontFamily: 'var(--font-mono)' }}
        >
          {value}<span className="text-xs ml-1 font-normal" style={{ color: '#475569' }}>{unit}</span>
        </span>
      </div>

      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{ height: '4px', borderRadius: '2px', outline: 'none', cursor: 'pointer' }}
      />

      {/* Tick marks */}
      {marks && (
        <div className="flex justify-between">
          {marks.map(m => (
            <button
              key={m}
              onClick={() => onChange(m)}
              className="text-xs transition-all"
              style={{
                color: value === m ? color : '#334155',
                fontFamily: 'var(--font-mono)',
                fontWeight: value === m ? 700 : 400,
              }}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Controls({ coin, years, forecastDays, onYearsChange, onForecastChange }: Props) {
  const color = coin === 'BTC-USD' ? BTC_COLOR : ETH_COLOR

  return (
    <div className="space-y-8">
      {/* History years */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: '#475569', fontFamily: 'var(--font-mono)' }}>
            Historical Data
          </span>
        </div>
        <SliderRow
          label="Years of history"
          value={years}
          min={1}
          max={10}
          unit="yr"
          color={color}
          onChange={onYearsChange}
          marks={[1, 2, 3, 5, 7, 10]}
        />
        <p className="mt-3 text-xs" style={{ color: '#334155' }}>
          Showing {years === 1 ? 'last 12 months' : `last ${years} years`} of {coin === 'BTC-USD' ? 'Bitcoin' : 'Ethereum'} closing prices
        </p>
      </div>

      {/* Forecast days */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: '#475569', fontFamily: 'var(--font-mono)' }}>
            Forecast Horizon
          </span>
        </div>
        <SliderRow
          label="Days to predict"
          value={forecastDays}
          min={3}
          max={30}
          unit="d"
          color={color}
          onChange={onForecastChange}
          marks={[3, 7, 14, 21, 30]}
        />
        <p className="mt-3 text-xs" style={{ color: '#334155' }}>
          Predicting {forecastDays} day{forecastDays > 1 ? 's' : ''} ahead using LSTM neural network
        </p>
      </div>
    </div>
  )
}
