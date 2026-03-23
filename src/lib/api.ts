import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
})

export type Coin = 'BTC-USD' | 'ETH-USD'

// Request
export interface ForecastRequest {
  ticker:        Coin
  forecast_days: number
}

//  Responses 
export interface ForecastResponse {
  ticker: Coin
  historical: {
    dates:  string[]
    prices: number[]
  }
  test: {
    dates:     string[]
    actual:    number[]
    predicted: number[]
  }
  forecast: {
    dates:  string[]
    prices: number[]
  }
  metrics: {
    mae:  number
    rmse: number
  }
}

export interface TickerInfo {
  ticker:        string
  name:          string
  current_price: number
  change_pct:    number
  high_52w:      number
  low_52w:       number
  volume:        number
}

export interface HistoryResponse {
  dates: string[]
  close: (number | null)[]
  ma100: (number | null)[]
  ma365: (number | null)[]
}

// API calls
export const api = {
  ticker:      (symbol: Coin)              => API.get<TickerInfo>(`/ticker/${symbol}`),
  history:     (symbol: Coin, years = 5)   => API.get<HistoryResponse>(`/history/${symbol}?years=${years}`),
  forecast:    (req: ForecastRequest)      => API.post<ForecastResponse>('/forecast', req),
}
