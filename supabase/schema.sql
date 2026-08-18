-- ==============================================================================
-- ATLAS OF TIME — CLEAN SUPABASE DATABASE SCHEMA (Production Ready)
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LAYER TRACKS TABLE
CREATE TABLE IF NOT EXISTS layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    sort_order INT NOT NULL
);

-- 3. PROFILES & USER ROLES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HISTORICAL EVENTS TABLE (with generated Full-Text Search tsvector)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    body TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'review', 'approved', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fts tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(category, ''))
    ) STORED
);

-- 5. EVENT DATES TABLE
CREATE TABLE IF NOT EXISTS event_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    precision TEXT NOT NULL CHECK (precision IN ('exact', 'year', 'decade', 'century', 'millennium', 'mya', 'bya', 'range')),
    calendar TEXT NOT NULL CHECK (calendar IN ('ce_bce', 'ya')),
    year_start INT NOT NULL,
    year_end INT,
    years_before_present NUMERIC NOT NULL,
    confidence TEXT NOT NULL CHECK (confidence IN ('well_established', 'probable', 'debated', 'traditional', 'legendary')),
    confidence_note TEXT,
    is_primary BOOLEAN DEFAULT TRUE
);

-- 6. EVENT LAYERS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS event_layers (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    layer_id UUID NOT NULL REFERENCES layers(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, layer_id)
);

-- 7. KNOWLEDGE GRAPH: HISTORICAL PEOPLE
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    biography TEXT NOT NULL,
    birth_year INT,
    death_year INT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'review', 'approved', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fts tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(title, '') || ' ' || coalesce(biography, ''))
    ) STORED
);

-- 8. KNOWLEDGE GRAPH: CIVILIZATIONS & REALMS
CREATE TABLE IF NOT EXISTS civilizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    region TEXT NOT NULL,
    description TEXT NOT NULL,
    start_year INT,
    end_year INT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'review', 'approved', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fts tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(region, '') || ' ' || coalesce(description, ''))
    ) STORED
);

-- 9. KNOWLEDGE GRAPH RELATIONSHIPS
CREATE TABLE IF NOT EXISTS relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('event', 'person', 'civilization')),
    source_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('event', 'person', 'civilization')),
    target_id UUID NOT NULL,
    relationship_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ACADEMIC SOURCES & CITATIONS
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citation TEXT NOT NULL,
    url TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('primary', 'academic_secondary', 'tertiary')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_sources (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, source_id)
);

-- 11. SPATIAL GEOGRAPHY & BOUNDARY LOCI
CREATE TABLE IF NOT EXISTS event_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    region_key TEXT NOT NULL,
    region_label TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    is_primary BOOLEAN DEFAULT TRUE,
    spatial_precision TEXT CHECK (spatial_precision IN ('exact_site', 'approximate_region', 'subcontinent', 'global'))
);

-- 12. INDEXES FOR PERFORMANCE & FULL-TEXT SEARCH
CREATE INDEX IF NOT EXISTS idx_events_fts ON events USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_people_fts ON people USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_civilizations_fts ON civilizations USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_event_dates_years_bp ON event_dates(years_before_present);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE civilizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_locations ENABLE ROW LEVEL SECURITY;

-- Public read access for reference tables
CREATE POLICY "Public read access for profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public read access for layers" ON layers FOR SELECT USING (true);
CREATE POLICY "Public read access for event_dates" ON event_dates FOR SELECT USING (true);
CREATE POLICY "Public read access for event_layers" ON event_layers FOR SELECT USING (true);
CREATE POLICY "Public read access for relationships" ON relationships FOR SELECT USING (true);
CREATE POLICY "Public read access for sources" ON sources FOR SELECT USING (true);
CREATE POLICY "Public read access for event_sources" ON event_sources FOR SELECT USING (true);
CREATE POLICY "Public read access for event_locations" ON event_locations FOR SELECT USING (true);

-- Gated Content Policies: Public reads ONLY 'published' status; Editors/Admins read all drafts/reviews
CREATE POLICY "Public read published events" ON events FOR SELECT
USING (status = 'published' OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')));

CREATE POLICY "Editors insert/update events" ON events FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')));

CREATE POLICY "Public read published people" ON people FOR SELECT
USING (status = 'published' OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')));

CREATE POLICY "Editors insert/update people" ON people FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')));

CREATE POLICY "Public read published civilizations" ON civilizations FOR SELECT
USING (status = 'published' OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')));

CREATE POLICY "Editors insert/update civilizations" ON civilizations FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')));

-- 14. AUTOMATIC PROFILE CREATION TRIGGER (WITH ROBUST FALLBACK)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 15. BACKFILL MISSING PROFILES FOR EXISTING USERS
INSERT INTO public.profiles (id, display_name, role)
SELECT 
    id, 
    coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
    'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- SEED LAYERS
INSERT INTO layers (id, key, label, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'deep-time', 'Cosmic & Deep Time', 1),
('22222222-2222-2222-2222-222222222222', 'world-history', 'World History & Civilizations', 2),
('33333333-3333-3333-3333-333333333333', 'india', 'India Track', 3),
('44444444-4444-4444-4444-444444444444', 'religion', 'Philosophy & Religions', 4),
('55555555-5555-5555-5555-555555555555', 'science-tech', 'Science & Technology', 5)
ON CONFLICT (key) DO NOTHING;
