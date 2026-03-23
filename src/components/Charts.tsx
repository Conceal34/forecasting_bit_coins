'use client'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts'
import { ForecastResponse, Coin } from '@/lib/api'

const BTC_COLOR = '#f7931a'
const ETH_COLOR = '#627eea'

function coinColor(coin: Coin) {
  return coin === 'BTC-USD' ? BTC_COLOR : ETH_COLOR
}

function fmt(v: number) {
  if (v >= 100000) return `$${(v / 1000).toFixed(0)}k`
  if (v >= 1000)   return `$${(v / 1000).toFixed(1)}k`
  return `$${v.toFixed(0)}`
}

const tooltipStyle = {
  backgroundColor: 'rgba(5,8,16,0.96)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  color: '#f1f5f9',
  padding: '10px 14px',
}

const axisStyle = { fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#334155' }

// ── History + MA chart ───────────────────────────────────────────────────────
export function HistoryChart({ data, coin }: { data: ForecastResponse['historical']; coin: Coin }) {
  const color = coinColor(coin)
  const chartData = data.dates.map((d, i) => ({
    date: d.slice(2, 7), // YY-MM
    price: data.prices[i],
    ma100: data.ma100[i],
    ma365: data.ma365[i],
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${coin}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false}
               interval="preserveStartEnd" />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false}
               tickFormatter={fmt} width={52} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [
          `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          n === 'price' ? 'Close' : n === 'ma100' ? 'MA 100' : 'MA 365',
        ]} />
        <Area type="monotone" dataKey="price" stroke={color} strokeWidth={1.5}
              fill={`url(#grad-${coin})`} dot={false} />
        <Line type="monotone" dataKey="ma100" stroke="#f59e0b" strokeWidth={1}
              dot={false} strokeDasharray="4 3" />
        <Line type="monotone" dataKey="ma365" stroke="#a78bfa" strokeWidth={1}
              dot={false} strokeDasharray="4 3" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Prediction vs Actual ─────────────────────────────────────────────────────
export function PredictionChart({ data, coin }: { data: ForecastResponse['test']; coin: Coin }) {
  const color = coinColor(coin)
  const chartData = data.dates.map((d, i) => ({
    date: d.slice(5),
    actual: data.actual[i],
    predicted: data.predicted[i],
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false}
               interval="preserveStartEnd" />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false}
               tickFormatter={fmt} width={52} />
        <Tooltip contentStyle={tooltipStyle}
                 formatter={(v: number, n: string) => [
                   `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                   n === 'actual' ? 'Actual' : 'Predicted',
                 ]} />
        <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
        <Line type="monotone" dataKey="actual"    stroke={color} strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="predicted" stroke="#22d3a0" strokeWidth={1.5}
              dot={false} strokeDasharray="5 3" />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Future Forecast ──────────────────────────────────────────────────────────
export function ForecastChart({
  historical, forecast, coin,
}: {
  historical: ForecastResponse['historical']
  forecast:   ForecastResponse['forecast']
  coin:       Coin
}) {
  const color = coinColor(coin)

  // Last 30 days context + forecast
  const ctx = historical.dates.slice(-30).map((d, i) => ({
    date:  d.slice(5),
    hist:  historical.prices[historical.prices.length - 30 + i],
    pred:  null as number | null,
  }))
  const fwd = forecast.dates.map((d, i) => ({
    date: d.slice(5),
    hist: null as number | null,
    pred: forecast.prices[i],
  }))
  const chartData = [...ctx, ...fwd]
  const splitDate = fwd[0]?.date

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="forecastLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#22d3a0" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false}
               interval="preserveStartEnd" />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false}
               tickFormatter={fmt} width={52} />
        <Tooltip contentStyle={tooltipStyle}
                 formatter={(v: number, n: string) => [
                   `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                   n === 'hist' ? 'Historical' : 'Forecast',
                 ]} />
        {splitDate && (
          <ReferenceLine x={splitDate} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3"
                         label={{ value: 'Today', fill: '#475569', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
        )}
        <Line type="monotone" dataKey="hist" stroke={color} strokeWidth={2} dot={false} connectNulls={false} />
        <Line type="monotone" dataKey="pred" stroke="#22d3a0" strokeWidth={2}
              dot={{ r: 3, fill: '#22d3a0', stroke: 'transparent' }} connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
