'use client'
import { ForecastResponse, Coin } from '@/lib/api'
import { HistoryChart, PredictionChart, ForecastChart } from './Charts'
import { TrendingUp, TrendingDown, Download } from 'lucide-react'

const BTC_COLOR = '#f7931a'
const ETH_COLOR = '#627eea'

function downloadCSV(data: ForecastResponse) {
  const rows = data.forecast.dates.map((d, i) => {
    const p    = data.forecast.prices[i]
    const prev = i === 0
      ? data.historical.prices.at(-1)!
      : data.forecast.prices[i - 1]
    const chg = ((p - prev) / prev * 100).toFixed(2)
    return `${d},${p.toFixed(2)},${chg}`
  })
  const csv  = ['Date,Predicted Price,Change %', ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), {
    href: url,
    download: `${data.ticker}_forecast.csv`,
  }).click()
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <span className="text-xs uppercase tracking-widest" style={{ color: '#475569', fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
      <span className="text-xl font-bold tabular-nums" style={{ color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
    </div>
  )
}

export default function Results({ data }: { data: ForecastResponse }) {
  const coin    = data.ticker as Coin
  const color   = coin === 'BTC-USD' ? BTC_COLOR : ETH_COLOR
  const symbol  = coin === 'BTC-USD' ? '₿' : 'Ξ'
  const name    = coin === 'BTC-USD' ? 'Bitcoin' : 'Ethereum'

  const lastForecast  = data.forecast.prices.at(-1) ?? 0
  const firstForecast = data.forecast.prices[0] ?? 0
  const currentPrice  = data.historical.prices.at(-1) ?? 0
  const forecastChg   = ((lastForecast - currentPrice) / currentPrice * 100)
  const bullish       = forecastChg >= 0

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header row */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black" style={{ color, fontFamily: 'var(--font-mono)' }}>{symbol}</span>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>{name} Forecast</h2>
              <p className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: 'var(--font-mono)' }}>
                {data.forecast.dates[0]} → {data.forecast.dates.at(-1)} · {data.forecast.dates.length} days
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Trend badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{
              background: bullish ? 'rgba(34,211,160,0.1)' : 'rgba(244,63,94,0.1)',
              border: `1px solid ${bullish ? 'rgba(34,211,160,0.3)' : 'rgba(244,63,94,0.3)'}`,
              color: bullish ? '#22d3a0' : '#f43f5e',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {bullish ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {bullish ? '+' : ''}{forecastChg.toFixed(2)}% over {data.forecast.dates.length}d
          </div>

          {/* Export */}
          <button
            onClick={() => downloadCSV(data)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#64748b',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = color; (e.currentTarget as HTMLElement).style.borderColor = color }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748b'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Current Price"  value={`$${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}   color={color} />
        <Stat label={`Day ${data.forecast.dates.length} Target`} value={`$${lastForecast.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color={bullish ? '#22d3a0' : '#f43f5e'} />
        <Stat label="MAE"   value={`$${data.metrics.mae.toLocaleString()}`}  color="#f59e0b" />
        <Stat label="RMSE"  value={`$${data.metrics.rmse.toLocaleString()}`} color="#a78bfa" />
      </div>

      {/* History Chart */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-5 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Price History</span>
          <span className="ml-auto text-xs" style={{ color: '#334155', fontFamily: 'var(--font-mono)' }}>
            + MA 100 · MA 365
          </span>
        </div>
        <HistoryChart data={data.historical} coin={coin} />
      </div>

      {/* Forecast Chart */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-5 rounded-full" style={{ background: '#22d3a0' }} />
          <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Future Forecast</span>
          <span className="ml-auto text-xs" style={{ color: '#334155', fontFamily: 'var(--font-mono)' }}>
            {data.forecast.dates.length} days ahead
          </span>
        </div>
        <ForecastChart historical={data.historical} forecast={data.forecast} coin={coin} />
      </div>

      {/* Prediction vs Actual + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-5 rounded-full" style={{ background: '#a78bfa' }} />
            <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Model Accuracy (Test Set)</span>
          </div>
          <PredictionChart data={data.test} coin={coin} />
        </div>

        {/* Day-by-day table */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-5 rounded-full" style={{ background: '#f59e0b' }} />
            <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Day-by-Day Forecast</span>
          </div>
          <div className="overflow-y-auto max-h-52">
            <table className="w-full text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#475569' }}>
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-right pb-2 font-medium">Price</th>
                  <th className="text-right pb-2 font-medium">Δ</th>
                </tr>
              </thead>
              <tbody>
                {data.forecast.dates.map((d, i) => {
                  const p    = data.forecast.prices[i]
                  const prev = i === 0 ? currentPrice : data.forecast.prices[i - 1]
                  const chg  = (p - prev) / prev * 100
                  return (
                    <tr
                      key={d}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    >
                      <td className="py-2" style={{ color: '#475569' }}>{d}</td>
                      <td className="py-2 text-right" style={{ color: '#f1f5f9' }}>
                        ${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td
                        className="py-2 text-right font-medium"
                        style={{ color: chg >= 0 ? '#22d3a0' : '#f43f5e' }}
                      >
                        {chg >= 0 ? '▲' : '▼'} {Math.abs(chg).toFixed(2)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="text-center text-xs pb-2" style={{ color: '#1e293b', fontFamily: 'var(--font-mono)' }}>
        ⚠ Educational use only — not financial advice
      </p>
    </div>
  )
}
