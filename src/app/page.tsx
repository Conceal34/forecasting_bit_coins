"use client";
import { useState, useEffect } from "react";
import { Loader2, Zap, Download, TrendingUp, TrendingDown } from "lucide-react";
import CoinSelector from "@/components/CoinSelector";
import Controls from "@/components/Controls";
import {
  HistoryChart,
  PredictionChart,
  ForecastChart,
} from "@/components/Charts";
import { api, Coin, ForecastResponse, HistoryResponse } from "@/lib/api";

const COIN_META = {
  "BTC-USD": { color: "#f7931a", sym: "₿", name: "Bitcoin" },
  "ETH-USD": { color: "#627eea", sym: "Ξ", name: "Ethereum" },
};

export default function Home() {
  const [coin, setCoin] = useState<Coin>("BTC-USD");
  const [years, setYears] = useState(5);
  const [forecastDays, setForecastDays] = useState(10);

  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const meta = COIN_META[coin];
  const color = meta.color;

  console.log(history);
  console.log(forecast);

  useEffect(() => {
    setForecast(null);
    setHistory(null);
  }, [coin]);

  async function runForecast() {
    try {
      setLoading(true);
      setForecast(null);
      setHistory(null);

      const [fRes, hRes] = await Promise.all([
        api.forecast({
          ticker: coin,
          forecast_days: forecastDays,
        }),
        api.history(coin, years),
      ]);

      setForecast(fRes.data);
      setHistory(hRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!forecast) return;
    const curPx = forecast.historical.prices.at(-1)!;
    const rows = forecast.forecast.dates.map((d, i) => {
      const p = forecast.forecast.prices[i];
      const prev = i === 0 ? curPx : forecast.forecast.prices[i - 1];
      return `${d},${p},${(((p - prev) / prev) * 100).toFixed(2)}`;
    });
    const csv = ["Date,Predicted Price,Change %", ...rows].join("\n");
    Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `${coin}_forecast.csv`,
    }).click();
  }

  const curPrice = forecast?.historical.prices.at(-1) ?? 0;
  const lastForecast = forecast?.forecast.prices.at(-1) ?? 0;
  const forecastChg = curPrice
    ? ((lastForecast - curPrice) / curPrice) * 100
    : 0;
  const bullish = forecastChg >= 0;

  return (
    <div
      className="bg-orbs min-h-screen relative"
      style={{ background: "var(--bg)" }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* LEFT PANEL */}
          <div className="space-y-5 lg:sticky lg:top-8">
            <CoinSelector selected={coin} onChange={setCoin} />

            <Controls
              coin={coin}
              years={years}
              forecastDays={forecastDays}
              onYearsChange={setYears}
              onForecastChange={setForecastDays}
            />

            <button
              onClick={runForecast}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-60"
              style={{ background: color, color: "#050810" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Forecast {meta.name}
                </>
              )}
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div>
            {loading ? (
              <div
                className="flex items-center justify-center"
                style={{ minHeight: 560 }}
              >
                <Loader2 className="w-10 h-10 animate-spin" style={{ color }} />
              </div>
            ) : forecast && history ? (
              <div className="space-y-5">
                {/* HEADER */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-3xl font-black"
                      style={{ color, fontFamily: "var(--font-mono)" }}
                    >
                      {meta.sym}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {meta.name} Forecast
                      </h2>
                      <p className="text-xs text-gray-500">
                        {forecast.forecast.dates[0]} →{" "}
                        {forecast.forecast.dates.at(-1)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="text-sm font-bold"
                      style={{ color: bullish ? "#22d3a0" : "#f43f5e" }}
                    >
                      {bullish ? "+" : ""}
                      {forecastChg.toFixed(2)}%
                    </div>

                    <button
                      onClick={exportCSV}
                      className="text-sm flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" /> CSV
                    </button>
                  </div>
                </div>

                {/* ✅ FIXED HISTORY CHART */}
                <HistoryChart data={history} coin={coin} />

                {/* FORECAST */}
                <ForecastChart
                  historical={forecast.historical}
                  forecast={forecast.forecast}
                  coin={coin}
                />

                {/* PREDICTION */}
                <PredictionChart data={forecast.test} coin={coin} />
              </div>
            ) : (
              <div
                className="flex items-center justify-center text-gray-500"
                style={{ minHeight: 560 }}
              >
                Run forecast to see results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
