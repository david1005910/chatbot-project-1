# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

쿠팡 소싱 도우미 (Coupang Sourcing Assistant) - An AI-powered trend prediction platform that helps e-commerce sellers discover promising products using data-driven analysis.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Validation**: Zod
- **ML**: TensorFlow.js (LSTM model for time series prediction)
- **Storage**: IndexedDB via `idb` library
- **External APIs**: Naver DataLab API, Claude API (Anthropic)

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main dashboard page
│   ├── globals.css             # Global styles with Tailwind
│   ├── calculator/page.tsx     # Margin calculator page
│   ├── sourcing/page.tsx       # Sourcing search page
│   ├── history/page.tsx        # Analysis history page
│   ├── settings/page.tsx       # User settings page
│   ├── analysis/[keyword]/     # Keyword detail analysis page
│   └── api/
│       ├── naver/trend/        # Naver DataLab trend API
│       ├── predict/lstm/       # LSTM prediction endpoint
│       ├── claude/analyze/     # Claude AI analysis
│       ├── coupang/competition/# Competition analysis (placeholder)
│       ├── keyword/niche/      # Niche keyword discovery
│       ├── calculator/margin/  # Margin calculator
│       └── sourcing/search/    # Sourcing platform search (placeholder)
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── EmptyState.tsx
│   │   └── Skeleton.tsx        # Loading skeleton components
│   ├── dashboard/
│   │   ├── PeriodSelector.tsx  # Date range picker
│   │   ├── CategorySelector.tsx# Category multi-select
│   │   └── FilterPanel.tsx     # Device/gender/age filters
│   ├── analysis/
│   │   ├── KeywordRanking.tsx  # TOP 10 keyword display
│   │   ├── TrendChart.tsx      # Recharts trend visualization
│   │   ├── SeasonalityCard.tsx # Seasonality pattern display
│   │   └── CompetitionScore.tsx# Competition score visualization
│   └── ErrorBoundary.tsx       # Error boundary component
├── hooks/
│   ├── useNaverTrend.ts        # Naver trend data fetching
│   ├── useClaudeAnalysis.ts    # Claude AI analysis
│   ├── useLSTMPrediction.ts    # LSTM prediction hook
│   └── useStorage.ts           # IndexedDB storage hooks
├── lib/
│   ├── validation.ts           # Zod schemas for all API endpoints
│   ├── naver-api.ts            # Naver DataLab API client
│   ├── claude-api.ts           # Claude API integration
│   ├── lstm-model.ts           # TensorFlow.js LSTM implementation
│   ├── calculator.ts           # Margin calculation logic
│   ├── storage.ts              # IndexedDB operations
│   ├── cache.ts                # Data caching utilities
│   ├── export.ts               # CSV export utilities
│   ├── logger.ts               # API monitoring logger
│   ├── error-handler.ts        # API error handling
│   └── utils.ts                # Common utility functions
├── store/
│   └── index.ts                # Zustand store for app state
├── types/
│   └── index.ts                # All TypeScript interfaces
└── middleware.ts               # Rate limiting middleware
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main dashboard - trend analysis with filters |
| `/calculator` | Margin calculator with Coupang fees |
| `/sourcing` | Search products on 1688/Taobao/AliExpress |
| `/history` | View saved analysis results |
| `/settings` | User preferences and default settings |
| `/analysis/[keyword]` | Detailed keyword analysis |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/naver/trend` | POST | Fetch Naver DataLab shopping trends |
| `/api/predict/lstm` | POST | Time series prediction |
| `/api/claude/analyze` | POST | AI-powered trend analysis |
| `/api/coupang/competition` | POST | Competition analysis (placeholder) |
| `/api/keyword/niche` | POST | Niche keyword recommendations |
| `/api/calculator/margin` | POST | Profit margin calculation |
| `/api/sourcing/search` | POST | Sourcing platform search (placeholder) |

## Architecture Notes

- All API keys must be server-side only via `process.env` (never `NEXT_PUBLIC_`)
- Required environment variables: `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `CLAUDE_API_KEY`
- Zustand store manages analysis state, filters, and results
- Input validation uses Zod schemas in `src/lib/validation.ts`
- Category codes are mapped in `src/types/index.ts` (CATEGORY_CODES constant)
- Analysis results are automatically saved to IndexedDB
- LSTM model in `src/lib/lstm-model.ts` provides time series prediction
- Rate limiting middleware protects API routes (100 requests/minute)
- Data caching via `src/lib/cache.ts` reduces API calls

## Custom Hooks

| Hook | Description |
|------|-------------|
| `useNaverTrend` | Fetch and manage Naver trend data |
| `useClaudeAnalysis` | Claude AI analysis with loading state |
| `useLSTMPrediction` | LSTM prediction with progress tracking |
| `useStorage` | IndexedDB CRUD operations |
| `useSettings` | User settings management |

## Key Constraints

- Exclude clothing category products (business rule)
- Products must be courier-deliverable (no oversized items)
- Naver DataLab API limit: 1,000 calls/day
- Coupang has no official API (placeholder endpoint only)
- Rate limit: 100 API requests per minute per IP
