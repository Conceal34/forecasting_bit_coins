# PriceOracle — BTC Predict Frontend

The frontend for **PriceOracle**, a crypto price forecasting app. Built with Next.js 14 and TypeScript, it visualizes LSTM-based predictions for Bitcoin and Ethereum fetched from the [btc-predict-backend](https://github.com/Conceal34/btc-predict-backend).

**Live:** [forecasting-bit-coins.vercel.app](https://forecasting-bit-coins.vercel.app)

> Disclaimer: This project is for educational purposes only. Nothing here constitutes financial advice.

---

## Features

- **Interactive price charts** powered by `lightweight-charts` and `recharts`
- **LSTM forecast visualization** — future price projections overlaid on historical data
- **Test-set accuracy display** — actual vs. predicted prices with MAE & RMSE metrics
- **Live ticker snapshots** — current price, % change, 52-week high/low, volume
- **Smooth animations** via `framer-motion`
- **Fully responsive** UI built with Tailwind CSS

---

## Project Structure

```
forecasting_bit_coins/
├── src/                    # App source code (pages, components, styles)
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js
├── tsconfig.json
├── package.json
└── .gitignore
```

---

## Setup

**Prerequisites:** Node.js 18+, npm

**1. Clone & enter the repo**
```bash
git clone https://github.com/Conceal34/forecasting_bit_coins.git
cd forecasting_bit_coins
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up your environment variables**

Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> This should point to the running instance of [btc-predict-backend](https://github.com/Conceal34/btc-predict-backend).

**4. Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable              | Description                             |
|-----------------------|-----------------------------------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the PriceOracle backend API |

---

## Dependencies

| Package              | Version | Purpose                       |
|----------------------|---------|-------------------------------|
| `next`               | 14.2.5  | React framework with SSR/SSG  |
| `react`              | ^18     | UI library                    |
| `lightweight-charts` | ^4.1.3  | Financial-style price charts  |
| `recharts`           | ^2.12.7 | Composable chart components   |
| `axios`              | ^1.7.2  | HTTP client for API calls     |
| `framer-motion`      | ^11.3.8 | Animations and transitions    |
| `lucide-react`       | ^0.400.0| Icon library                  |
| `clsx`               | ^2.1.1  | Conditional className utility |
| `tailwindcss`        | ^3.4.4  | Utility-first CSS framework   |
| `typescript`         | ^5      | Type safety                   |

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Deployment

This app is deployed on **Vercel**. To deploy your own instance:

1. Push the repo to GitHub
2. Import it on [vercel.com](https://vercel.com)
3. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL in the Vercel environment variables dashboard
4. Deploy

> Make sure backend has the correct `FRONTEND_URL` set in its own environment variables to allow CORS from your Vercel domain.

## Related

- **Backend repo:** [btc-predict-backend](https://github.com/Conceal34/btc-predict-backend) — FastAPI + LSTM prediction engine
- 
