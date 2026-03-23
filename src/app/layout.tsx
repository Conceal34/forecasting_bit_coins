import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PriceOracle — BTC & ETH AI Forecaster',
  description: 'AI-powered Bitcoin and Ethereum price forecasting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
