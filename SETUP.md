# TrendForge — Setup Guide

## Quick Start

```bash
cd trendforge
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
trendforge/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Dashboard overview
│   ├── studio/            # Content generation studio
│   ├── trends/            # Live trends browser
│   ├── analytics/         # Trend analysis & insights
│   ├── image-generator/   # AI image prompt generator
│   ├── scheduler/         # Content scheduling calendar
│   ├── alerts/            # Keyword alert management
│   ├── settings/          # App & API settings
│   └── api/
│       ├── generate/      # Content generation API route
│       └── trends/        # Trend fetching API route
├── components/            # Reusable components
│   ├── app-shell.tsx      # Main layout wrapper
│   ├── sidebar.tsx        # Navigation sidebar
│   ├── header.tsx         # Top header bar
│   ├── topic-form.tsx     # Content generation form
│   ├── output-tabs.tsx    # Platform output display
│   ├── live-feed.tsx      # Trending topics feed
│   └── ui/               # Base UI primitives
├── data/                  # Static data & mock data
│   ├── countries.ts       # 30+ country list
│   ├── niches.ts          # 25 content niches
│   ├── platforms.ts       # Platform configs & image ratios
│   ├── tones.ts           # Tone, CTA & language options
│   └── demo-topics.ts     # 8 realistic mock trends
├── lib/                   # Core utilities
│   ├── ai.ts              # AI generation logic (mock + OpenAI)
│   ├── trends.ts          # Trend fetching logic (mock + GNews)
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Helper utilities
└── SETUP.md               # This file
```

---

## Adding Real AI (Optional)

1. Copy `.env.example` to `.env.local`
2. Add your keys:

```
OPENAI_API_KEY=sk-your-key-here
GNEWS_API_KEY=your-gnews-key
OPENAI_MODEL=gpt-4o-mini
```

3. Restart dev server — live features activate automatically

---

## Pages

| Route | Feature |
|-------|---------|
| `/` | Landing page |
| `/dashboard` | Overview + stats + quick actions |
| `/studio` | Full AI content generator |
| `/trends` | Live trend browser with filters |
| `/analytics` | Deep trend analysis |
| `/image-generator` | Image prompt generator |
| `/scheduler` | Content calendar |
| `/alerts` | Keyword trend alerts |
| `/settings` | All app settings + API keys |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI-ready (mock fallback included)
- **News**: GNews-ready (mock fallback included)
