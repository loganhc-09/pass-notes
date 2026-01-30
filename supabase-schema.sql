-- Crowdsourced Sources Database Schema
-- Run this in your Supabase SQL Editor

-- Sources table (now links to auth.users)
CREATE TABLE sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('TikTok', 'YouTube', 'Substack', 'Newsletter', 'Podcast', 'LinkedIn', 'Twitter/X', 'Other')),
  modality TEXT NOT NULL CHECK (modality IN ('read', 'listen', 'watch')),
  url TEXT NOT NULL,
  added_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_by_name TEXT NOT NULL,
  blurb TEXT,
  urgency TEXT NOT NULL CHECK (urgency IN ('drop_everything', 'this_week', 'when_i_see_it')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seconds table (who seconded what)
CREATE TABLE seconds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_id, user_id)
);

-- The One picks (one per person per week)
CREATE TABLE the_one_picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Sparked builds
CREATE TABLE sparked_builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE seconds ENABLE ROW LEVEL SECURITY;
ALTER TABLE the_one_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparked_builds ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can READ, only authenticated users can WRITE

-- Sources: public read, authenticated insert
CREATE POLICY "Anyone can read sources" ON sources
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add sources" ON sources
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Seconds: public read, authenticated insert (can only second as yourself)
CREATE POLICY "Anyone can read seconds" ON seconds
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can second" ON seconds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- The One picks: public read, authenticated insert/delete (own picks only)
CREATE POLICY "Anyone can read the_one_picks" ON the_one_picks
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can pick" ON the_one_picks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own picks" ON the_one_picks
  FOR DELETE USING (auth.uid() = user_id);

-- Sparked builds: public read, authenticated insert
CREATE POLICY "Anyone can read sparked_builds" ON sparked_builds
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add builds" ON sparked_builds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- View for sources with counts (public readable)
CREATE VIEW sources_with_counts AS
SELECT
  s.*,
  (SELECT COUNT(*) FROM seconds WHERE source_id = s.id) as second_count,
  (SELECT COUNT(*) FROM sparked_builds WHERE source_id = s.id) as build_count,
  (SELECT COUNT(*) FROM the_one_picks WHERE source_id = s.id AND week_start = date_trunc('week', CURRENT_DATE)::date) as the_one_count
FROM sources s;

-- Grant access to the view
GRANT SELECT ON sources_with_counts TO anon, authenticated;
