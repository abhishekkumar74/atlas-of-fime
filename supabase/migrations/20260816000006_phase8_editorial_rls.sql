-- Phase 8 Editorial System SQL Migration: Profiles Table, Trigger & Strict RLS Lockdown

-- 1. Create Profiles Table & Role Enum
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Trigger on_auth_user_created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', 'user');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill content_status = 'published' on all existing tables
UPDATE events SET status = 'published' WHERE status IS NULL OR status = 'draft';
UPDATE people SET status = 'published' WHERE status IS NULL OR status = 'draft';
UPDATE civilizations SET status = 'published' WHERE status IS NULL OR status = 'draft';

-- 4. Re-configure RLS Policies for Content Status Lockdown

-- Drop legacy open policies
DROP POLICY IF EXISTS "Public read access for events" ON events;
DROP POLICY IF EXISTS "Public read access for people" ON people;
DROP POLICY IF EXISTS "Public read access for civilizations" ON civilizations;

-- Events RLS
CREATE POLICY "Public read published events" ON events FOR SELECT
USING (
  status = 'published' OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')
  )
);

CREATE POLICY "Editors insert/update events" ON events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')
  )
);

-- People RLS
CREATE POLICY "Public read published people" ON people FOR SELECT
USING (
  status = 'published' OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')
  )
);

CREATE POLICY "Editors insert/update people" ON people FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')
  )
);

-- Civilizations RLS
CREATE POLICY "Public read published civilizations" ON civilizations FOR SELECT
USING (
  status = 'published' OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')
  )
);

CREATE POLICY "Editors insert/update civilizations" ON civilizations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')
  )
);
