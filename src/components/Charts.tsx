"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { ForecastResponse, HistoryResponse, Coin } from "@/lib/api";

const BTC_COLOR = "#f7931a";
const ETH_COLOR = "#627eea";

function coinColor(coin: Coin) {
  return coin === "BTC-USD" ? BTC_COLOR : ETH_COLOR;
}

function fmt(v: number) {
  if (v >= 100000) return `$${(v / 1000).toFixed(0)}k`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

const tooltipStyle = {
  backgroundColor: "rgba(5,8,16,0.96)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  color: "#f1f5f9",
  padding: "10px 14px",
};

const axisStyle = {
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  fill: "#334155",
};

// ── History + MA chart ───────────────────────────────────────────────────────
export function HistoryChart({
  data,
  coin,
}: {
  data: HistoryResponse;
  coin: Coin;
}) {
  const color = coinColor(coin);

  const chartData = data.dates
    .map((d, i) => ({
      date: d.slice(2, 7),
      price: data.close[i],
      ma100: data.ma100[i],
      ma365: data.ma365[i],
    }))
    .filter((d) => typeof d.price === "number");

  if (!chartData.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: "#94a3b8" }}>
        Historical Price Trends
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`grad-${coin}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="date"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
            width={52}
          />
          <Tooltip contentStyle={tooltipStyle} />

          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            fill={`url(#grad-${coin})`}
            dot={false}
            connectNulls
          />
          <Line dataKey="ma100" stroke="#f59e0b" dot={false} connectNulls />
          <Line dataKey="ma365" stroke="#a78bfa" dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Prediction vs Actual ─────────────────────────────────────────────────────
export function PredictionChart({
  data,
  coin,
}: {
  data: ForecastResponse["test"];
  coin: Coin;
}) {
  const color = coinColor(coin);

  const chartData = data.dates.map((d, i) => ({
    date: d.slice(5),
    actual: data.actual[i],
    predicted: data.predicted[i],
  }));

  if (!chartData.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: "#94a3b8" }}>
        Model Accuracy (Actual vs Predicted)
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="date"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
            width={52}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />

          <Line dataKey="actual" stroke={color} dot={false} />
          <Line
            dataKey="predicted"
            stroke="#22d3a0"
            dot={false}
            strokeDasharray="5 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Future Forecast ──────────────────────────────────────────────────────────
export function ForecastChart({
  historical,
  forecast,
  coin,
}: {
  historical: ForecastResponse["historical"];
  forecast: ForecastResponse["forecast"];
  coin: Coin;
}) {
  const color = coinColor(coin);

  const ctx = historical.dates.slice(-30).map((d, i) => ({
    date: d.slice(5),
    hist: historical.prices[historical.prices.length - 30 + i],
    pred: null as number | null,
  }));

  const fwd = forecast.dates.map((d, i) => ({
    date: d.slice(5),
    hist: null as number | null,
    pred: forecast.prices[i],
  }));

  const chartData = [...ctx, ...fwd];

  if (!chartData.length) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: "#94a3b8" }}>
        Future Price Forecast
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="date"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
            width={52}
          />
          <Tooltip contentStyle={tooltipStyle} />

          <Line dataKey="hist" stroke={color} dot={false} connectNulls />
          <Line dataKey="pred" stroke="#22d3a0" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
