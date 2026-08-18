-- Phase 9 AI Historian SQL Migration: ai_queries Table & RLS Audit Policies

CREATE TABLE IF NOT EXISTS ai_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    retrieved_entity_ids TEXT[] DEFAULT '{}',
    answer TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_queries ENABLE ROW LEVEL SECURITY;

-- 1. Authenticated users can insert their own AI query logs
CREATE POLICY "Users insert own ai_queries logs" ON ai_queries
FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)
);

-- 2. Audit access restricted strictly to editors and admins
CREATE POLICY "Editors select ai_queries audit logs" ON ai_queries
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')
    )
);
