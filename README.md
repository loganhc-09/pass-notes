# Br(ai)nstorm Sources

Crowdsourced info sources tool for the Br(ai)nstorm Collective.

## Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase-schema.sql`

### 2. Configure Environment
1. Copy `.env.example` to `.env`
2. Fill in your Supabase URL and anon key (found in Project Settings > API)

### 3. Run Locally
```bash
npm install
npm run dev
```

### 4. Deploy
```bash
npm run build
```

Deploy the `dist` folder to Vercel, Netlify, or any static host.

## Features
- Browse sources by modality (read/listen/watch)
- Urgency levels (🔥 drop everything, ⚡ this week, 📌 when I see it)
- Second sources you love
- Pick "The One" each week
- Track sparked builds
