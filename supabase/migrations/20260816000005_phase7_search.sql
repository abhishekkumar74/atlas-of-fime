-- Phase 7 Search SQL Migration: Full-Text Search tsvector columns, GIN Indexes & RPC Function

-- 1. Add generated tsvector columns with weighting (Weight A = title/name, Weight B = summary)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS fts TSVECTOR
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B')
) STORED;

ALTER TABLE people
ADD COLUMN IF NOT EXISTS fts TSVECTOR
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(alt_names, ' ')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B')
) STORED;

ALTER TABLE civilizations
ADD COLUMN IF NOT EXISTS fts TSVECTOR
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B')
) STORED;

-- 2. GIN Indexes for high-performance full-text search
CREATE INDEX IF NOT EXISTS idx_events_fts ON events USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_people_fts ON people USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_civilizations_fts ON civilizations USING GIN (fts);

-- 3. Stored RPC function search_entities
CREATE OR REPLACE FUNCTION search_entities(
    query_text TEXT,
    max_limit INT DEFAULT 6
)
RETURNS TABLE (
    id UUID,
    entity_type TEXT,
    title TEXT,
    slug TEXT,
    summary TEXT,
    rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH event_matches AS (
        SELECT 
            e.id,
            'event'::TEXT AS entity_type,
            e.title,
            e.slug,
            e.summary,
            ts_rank(e.fts, websearch_to_tsquery('english', query_text)) AS rank
        FROM events e
        WHERE e.fts @@ websearch_to_tsquery('english', query_text)
    ),
    person_matches AS (
        SELECT 
            p.id,
            'person'::TEXT AS entity_type,
            p.name AS title,
            p.slug,
            p.summary,
            ts_rank(p.fts, websearch_to_tsquery('english', query_text)) AS rank
        FROM people p
        WHERE p.fts @@ websearch_to_tsquery('english', query_text)
    ),
    civ_matches AS (
        SELECT 
            c.id,
            'civilization'::TEXT AS entity_type,
            c.name AS title,
            c.name AS slug,
            c.summary,
            ts_rank(c.fts, websearch_to_tsquery('english', query_text)) AS rank
        FROM civilizations c
        WHERE c.fts @@ websearch_to_tsquery('english', query_text)
    )
    SELECT * FROM event_matches
    UNION ALL
    SELECT * FROM person_matches
    UNION ALL
    SELECT * FROM civ_matches
    ORDER BY rank DESC, title ASC
    LIMIT max_limit;
END;
$$;
