'use client'
import { useState, useEffect } from 'react'
import { Loader2, Zap, Download, TrendingUp, TrendingDown } from 'lucide-react'
import CoinSelector from '@/components/CoinSelector'
import Controls from '@/components/Controls'
import { HistoryChart, PredictionChart, ForecastChart } from '@/components/Charts'

type Coin = 'BTC-USD' | 'ETH-USD'

interface DemoData {
  ticker: Coin; name: string; currentPrice: number; changePct: number
  historical: { dates: string[]; prices: number[]; ma100: (number|null)[]; ma365: (number|null)[] }
  test: { dates: string[]; actual: number[]; predicted: number[] }
  forecast: { dates: string[]; prices: number[] }
  metrics: { mae: number; rmse: number }
}

const COIN_META = {
  'BTC-USD': { color:'#f7931a', glow:'rgba(247,147,26,0.35)', sym:'₿', name:'Bitcoin',  basePx:84000 },
  'ETH-USD': { color:'#627eea', glow:'rgba(98,126,234,0.35)',  sym:'Ξ', name:'Ethereum', basePx:3200  },
}

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s*16807)%2147483647; return (s-1)/2147483646 }
}

function generateDemo(coin: Coin, years: number, forecastDays: number): DemoData {
  const meta = COIN_META[coin]
  const rand = seededRng(coin==='BTC-USD' ? 42 : 99)
  const total = Math.round(365*years)
  const hist: number[] = []
  let px = meta.basePx*(0.3+rand()*0.4)
  for (let i=0; i<total; i++) {
    const drift = (meta.basePx-px)/meta.basePx*0.002
    px *= 1+drift+(rand()-0.48)*(0.025+rand()*0.01)
    px = Math.max(px, meta.basePx*0.05)
    hist.push(Math.round(px))
  }
  const today = new Date()
  const histDates = Array.from({length:total},(_,i)=>{ const d=new Date(today); d.setDate(d.getDate()-(total-1-i)); return d.toISOString().slice(0,10) })
  const ma100 = hist.map((_,i)=>i<99?null:Math.round(hist.slice(i-99,i+1).reduce((a,b)=>a+b,0)/100))
  const ma365 = hist.map((_,i)=>i<364?null:Math.round(hist.slice(i-364,i+1).reduce((a,b)=>a+b,0)/365))
  const testActual = hist.slice(-60)
  const testPred   = testActual.map(p=>Math.round(p*(0.96+rand()*0.08)))
  const testDates  = histDates.slice(-60)
  let fp = hist[hist.length-1]
  const futurePrices: number[] = []
  for (let i=0; i<forecastDays; i++) {
    fp *= 1+(meta.basePx*1.05-fp)/meta.basePx*0.003+(rand()-0.46)*0.02
    futurePrices.push(Math.round(fp))
  }
  const futureDates = Array.from({length:forecastDays},(_,i)=>{ const d=new Date(today); d.setDate(d.getDate()+i+1); return d.toISOString().slice(0,10) })
  const diffs = testActual.map((a,i)=>Math.abs(a-testPred[i]))
  const mae   = Math.round(diffs.reduce((a,b)=>a+b,0)/diffs.length)
  const rmse  = Math.round(Math.sqrt(diffs.map(d=>d*d).reduce((a,b)=>a+b,0)/diffs.length))
  const histShow = Math.min(90*years, hist.length)
  const curPrice = hist[hist.length-1]
  const weekAgo  = hist[hist.length-8]??curPrice
  return {
    ticker:coin, name:meta.name, currentPrice:curPrice,
    changePct:parseFloat(((curPrice-weekAgo)/weekAgo*100).toFixed(2)),
    historical:{ dates:histDates.slice(-histShow), prices:hist.slice(-histShow), ma100:ma100.slice(-histShow), ma365:ma365.slice(-histShow) },
    test:{ dates:testDates, actual:testActual, predicted:testPred },
    forecast:{ dates:futureDates, prices:futurePrices },
    metrics:{ mae, rmse },
  }
}

function Stat({ label, value, color }: { label:string; value:string; color:string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
      <span className="text-[10px] uppercase tracking-widest" style={{color:'#475569',fontFamily:'var(--font-mono)'}}>{label}</span>
      <span className="text-xl font-bold tabular-nums" style={{color,fontFamily:'var(--font-mono)'}}>{value}</span>
    </div>
  )
}

export default function Home() {
  const [coin,         setCoin]         = useState<Coin>('BTC-USD')
  const [years,        setYears]        = useState(5)
  const [forecastDays, setForecastDays] = useState(10)
  const [data,         setData]         = useState<DemoData|null>(null)
  const [loading,      setLoading]      = useState(false)
  const meta  = COIN_META[coin]
  const color = meta.color

  useEffect(()=>{ setData(null) }, [coin])

  function runForecast() {
    setLoading(true); setData(null)
    setTimeout(()=>{ setData(generateDemo(coin,years,forecastDays)); setLoading(false) }, 900)
  }

  function exportCSV() {
    if(!data) return
    const curPx = data.historical.prices.at(-1)!
    const rows = data.forecast.dates.map((d,i)=>{ const p=data.forecast.prices[i]; const prev=i===0?curPx:data.forecast.prices[i-1]; return `${d},${p},${((p-prev)/prev*100).toFixed(2)}` })
    const csv = ['Date,Predicted Price,Change %',...rows].join('\n')
    Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})),download:`${coin}_forecast.csv`}).click()
  }

  const curPrice    = data?.historical.prices.at(-1)??0
  const lastForecast = data?.forecast.prices.at(-1)??0
  const forecastChg = curPrice?((lastForecast-curPrice)/curPrice*100):0
  const bullish     = forecastChg>=0

  return (
    <div className="bg-orbs min-h-screen relative" style={{background:'var(--bg)'}}>
      <div className="fixed inset-0 pointer-events-none" style={{backgroundImage:`linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)`,backgroundSize:'48px 48px',zIndex:0}} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">

        <div className="flex items-center justify-between mb-10 animate-fade-up stagger-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300" style={{background:`${color}18`,border:`1px solid ${color}33`}}>
              <span style={{color,fontFamily:'var(--font-mono)',fontWeight:800,fontSize:16}}>{meta.sym}</span>
            </div>
            <div>
              <div style={{fontFamily:'var(--font-mono)',fontWeight:800,fontSize:14,color,letterSpacing:'0.06em'}}>PRICE<span style={{color:'#f1f5f9'}}>ORACLE</span></div>
              <div style={{fontSize:10,color:'#334155',letterSpacing:'0.15em',fontFamily:'var(--font-mono)'}}>AI FORECASTING</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',fontFamily:'var(--font-mono)',color:'#475569'}}>
            <span className="w-1.5 h-1.5 rounded-full" style={{background:'#f59e0b',boxShadow:'0 0 6px #f59e0b'}} />
            Demo Mode
          </div>
        </div>

        <div className="text-center mb-12 animate-fade-up stagger-2">
          <h1 className="font-black leading-none mb-3" style={{fontSize:'clamp(2.5rem,6vw,4.5rem)'}}>
            <span className="shimmer-text">Forecast</span><br />
            <span style={{color,transition:'color 0.3s'}}>{meta.name}</span>
          </h1>
          <p style={{color:'#475569',fontSize:15,maxWidth:400,margin:'0 auto'}}>Choose your coin, set your timeframe, and see the AI prediction.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          <div className="space-y-5 lg:sticky lg:top-8 animate-fade-up stagger-3">
            {[['01 · Select Coin', <CoinSelector key="cs" selected={coin} onChange={c=>setCoin(c)} />],
              ['02 · Set Parameters', <Controls key="ctrl" coin={coin} years={years} forecastDays={forecastDays} onYearsChange={setYears} onForecastChange={setForecastDays} />],
              ['03 · Run', null]
            ].map(([label, el], idx) => (
              <div key={idx} className={el ? 'space-y-3' : ''}>
                <div className="flex items-center gap-2" style={idx>0?{marginTop:'8px'}:{}}>
                  <div className="h-px flex-1" style={{background:'rgba(255,255,255,0.06)'}} />
                  <span className="text-[10px] uppercase tracking-widest" style={{color:'#334155',fontFamily:'var(--font-mono)'}}>{label as string}</span>
                  <div className="h-px flex-1" style={{background:'rgba(255,255,255,0.06)'}} />
                </div>
                {el}
              </div>
            ))}

            <button onClick={runForecast} disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60"
              style={{background:`linear-gradient(135deg,${color},${color}cc)`,color:'#050810',border:`1px solid ${color}44`,boxShadow:`0 0 32px ${color}44`,fontSize:15}}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin"/>Generating…</> : <><Zap className="w-5 h-5"/>Forecast {meta.name}</>}
            </button>

            <div className="p-3 rounded-xl text-xs text-center" style={{background:`${color}08`,border:`1px solid ${color}18`,color:'#334155',fontFamily:'var(--font-mono)'}}>
              ⚡ Demo mode — connect backend for real AI predictions
            </div>
          </div>

          <div className="animate-fade-up stagger-4">
            {data ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black" style={{color,fontFamily:'var(--font-mono)'}}>{meta.sym}</span>
                    <div>
                      <h2 className="text-xl font-bold" style={{color:'#f1f5f9'}}>{meta.name} Forecast</h2>
                      <p className="text-xs mt-0.5" style={{color:'#475569',fontFamily:'var(--font-mono)'}}>{data.forecast.dates[0]} → {data.forecast.dates.at(-1)} · {forecastDays} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                         style={{background:bullish?'rgba(34,211,160,0.1)':'rgba(244,63,94,0.1)',border:`1px solid ${bullish?'rgba(34,211,160,0.3)':'rgba(244,63,94,0.3)'}`,color:bullish?'#22d3a0':'#f43f5e',fontFamily:'var(--font-mono)'}}>
                      {bullish?<TrendingUp className="w-4 h-4"/>:<TrendingDown className="w-4 h-4"/>}
                      {bullish?'+':''}{forecastChg.toFixed(2)}% over {forecastDays}d
                    </div>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
                            style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#64748b',fontFamily:'var(--font-mono)'}}>
                      <Download className="w-3.5 h-3.5"/> Export CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Current Price" value={`$${curPrice.toLocaleString()}`} color={color} />
                  <Stat label={`Day ${forecastDays} Target`} value={`$${lastForecast.toLocaleString()}`} color={bullish?'#22d3a0':'#f43f5e'} />
                  <Stat label="MAE"  value={`$${data.metrics.mae.toLocaleString()}`}  color="#f59e0b" />
                  <Stat label="RMSE" value={`$${data.metrics.rmse.toLocaleString()}`} color="#a78bfa" />
                </div>

                {[
                  {bar:color, title:'Price History', sub:'Close · MA 100 · MA 365', chart:<HistoryChart data={data.historical} coin={coin} />},
                  {bar:'#22d3a0', title:'Future Forecast', sub:`${forecastDays} days ahead`, chart:<ForecastChart historical={data.historical} forecast={data.forecast} coin={coin} />},
                ].map((c,i) => (
                  <div key={i} className="rounded-2xl p-5" style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1.5 h-5 rounded-full" style={{background:c.bar}} />
                      <span className="text-sm font-semibold" style={{color:'#94a3b8'}}>{c.title}</span>
                      <span className="ml-auto text-xs" style={{color:'#334155',fontFamily:'var(--font-mono)'}}>{c.sub}</span>
                    </div>
                    {c.chart}
                  </div>
                ))}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5" style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1.5 h-5 rounded-full" style={{background:'#a78bfa'}} />
                      <span className="text-sm font-semibold" style={{color:'#94a3b8'}}>Model Accuracy</span>
                    </div>
                    <PredictionChart data={data.test} coin={coin} />
                  </div>
                  <div className="rounded-2xl p-5" style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1.5 h-5 rounded-full" style={{background:'#f59e0b'}} />
                      <span className="text-sm font-semibold" style={{color:'#94a3b8'}}>Day-by-Day Forecast</span>
                    </div>
                    <div className="overflow-y-auto max-h-52">
                      <table className="w-full text-xs" style={{fontFamily:'var(--font-mono)'}}>
                        <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)',color:'#475569'}}>
                          <th className="text-left pb-2 font-medium">Date</th>
                          <th className="text-right pb-2 font-medium">Price</th>
                          <th className="text-right pb-2 font-medium">Δ</th>
                        </tr></thead>
                        <tbody>{data.forecast.dates.map((d,i)=>{ const p=data.forecast.prices[i]; const prev=i===0?curPrice:data.forecast.prices[i-1]; const chg=(p-prev)/prev*100; return (
                          <tr key={d} style={{borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                            <td className="py-2" style={{color:'#475569'}}>{d}</td>
                            <td className="py-2 text-right" style={{color:'#f1f5f9'}}>${p.toLocaleString()}</td>
                            <td className="py-2 text-right font-medium" style={{color:chg>=0?'#22d3a0':'#f43f5e'}}>{chg>=0?'▲':'▼'} {Math.abs(chg).toFixed(2)}%</td>
                          </tr>) })}</tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs pb-2" style={{color:'#1e293b',fontFamily:'var(--font-mono)'}}>⚠ Demo data only — connect backend for real AI predictions</p>
              </div>
            ) : !loading ? (
              <div className="flex flex-col items-center justify-center text-center gap-6" style={{minHeight:560}}>
                <div className="relative w-36 h-36">
                  <div className="absolute inset-0 rounded-full animate-spin-slow" style={{border:`1px dashed ${color}22`}} />
                  <div className="absolute inset-8 rounded-full flex items-center justify-center" style={{background:`${color}10`,border:`1px solid ${color}33`}}>
                    <span style={{color,fontFamily:'var(--font-mono)',fontWeight:900,fontSize:36,textShadow:`0 0 24px ${color}`}}>{meta.sym}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold" style={{color:'#94a3b8'}}>Ready to forecast {meta.name}</p>
                  <p className="text-sm mt-2 max-w-xs" style={{color:'#334155'}}>Set parameters on the left, then click <span style={{color}}>Forecast {meta.name}</span>.</p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  {[{label:'History',value:`${years} yr`},{label:'Forecast',value:`${forecastDays} days`},{label:'Model',value:'LSTM'}].map(c=>(
                    <div key={c.label} className="px-4 py-2 rounded-full text-xs" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',fontFamily:'var(--font-mono)'}}>
                      <span style={{color:'#334155'}}>{c.label}: </span><span style={{color,fontWeight:700}}>{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{minHeight:560}}>
                <Loader2 className="w-10 h-10 animate-spin" style={{color}} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
