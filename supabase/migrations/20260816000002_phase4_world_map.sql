-- Phase 4 World Map SQL Migration: Regions, Civilizations, Territories & Event Links

CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    x INT NOT NULL,
    y INT NOT NULL
);

CREATE TABLE IF NOT EXISTS civilizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('civilization', 'empire', 'kingdom', 'dynasty', 'country')),
    summary TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'review', 'approved', 'published'))
);

CREATE TABLE IF NOT EXISTS territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    civilization_id UUID NOT NULL REFERENCES civilizations(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    start_year INT NOT NULL,
    end_year INT,
    region_note TEXT,
    uncertainty_note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_territories (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    territory_id UUID NOT NULL REFERENCES territories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (event_id, territory_id)
);

-- Enable RLS
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE civilizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_territories ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies
CREATE POLICY "Public read access for regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Public read access for civilizations" ON civilizations FOR SELECT USING (true);
CREATE POLICY "Public read access for territories" ON territories FOR SELECT USING (true);
CREATE POLICY "Public read access for event_territories" ON event_territories FOR SELECT USING (true);

-- Seed 10 Schematic Regions (Matching prototype 1000x500 canvas coordinates)
INSERT INTO regions (id, key, label, x, y) VALUES
('r0000001-0000-0000-0000-000000000001', 'india', 'Indian Subcontinent', 730, 240),
('r0000002-0000-0000-0000-000000000002', 'mediterranean', 'Mediterranean Basin', 510, 180),
('r0000003-0000-0000-0000-000000000003', 'middle-east', 'Fertile Crescent & Middle East', 580, 200),
('r0000004-0000-0000-0000-000000000004', 'europe', 'European Continent', 500, 140),
('r0000005-0000-0000-0000-000000000005', 'east-asia', 'East Asia', 820, 190),
('r0000006-0000-0000-0000-000000000006', 'africa', 'African Continent', 520, 270),
('r0000007-0000-0000-0000-000000000007', 'americas', 'The Americas', 250, 200),
('r0000008-0000-0000-0000-000000000008', 'central-asia', 'Central Asian Steppe', 660, 160),
('r0000009-0000-0000-0000-000000000009', 'australia', 'Australia & Oceania', 860, 360),
('r0000010-0000-0000-0000-000000000010', 'global', 'Global / Planetary Scale', 500, 420)
ON CONFLICT (key) DO NOTHING;

-- Seed Civilizations
INSERT INTO civilizations (id, name, kind, summary, status) VALUES
('c0000001-0000-0000-0000-000000000001', 'Indus Valley Civilization', 'civilization', 'Harappan Bronze Age civilization in the Indus basin.', 'published'),
('c0000002-0000-0000-0000-000000000002', 'Mauryan Empire', 'empire', 'Pan-Indian Iron Age empire founded by Chandragupta Maurya.', 'published'),
('c0000003-0000-0000-0000-000000000003', 'Roman Empire', 'empire', 'Post-Republican imperial state encompassing the Mediterranean basin.', 'published'),
('c0000004-0000-0000-0000-000000000004', 'Qin Dynasty', 'dynasty', 'First imperial Chinese dynasty that unified the Warring States.', 'published'),
('c0000005-0000-0000-0000-000000000005', 'Mughal Empire', 'empire', 'Early modern empire synthesizing Indo-Persian culture across South Asia.', 'published'),
('c0000006-0000-0000-0000-000000000006', 'Ancient Egypt', 'kingdom', 'Bronze Age Nile valley civilization renowned for pyramids and pharaonic statecraft.', 'published'),
('c0000007-0000-0000-0000-000000000007', 'Republic of India', 'country', 'Modern sovereign democratic republic in South Asia.', 'published')
ON CONFLICT DO NOTHING;

-- Seed Territories (Every row carries a mandatory non-empty uncertainty_note)
INSERT INTO territories (id, civilization_id, region_id, start_year, end_year, region_note, uncertainty_note) VALUES
('t0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'r0000001-0000-0000-0000-000000000001', -3300, -1300, 'Indus basin and Ghaggar-Hakra floodplain', 'Harappan territorial extents estimated from urban site distributions; exact political borders remain unrecorded in writing.'),
('t0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'r0000001-0000-0000-0000-000000000001', -322, -185, 'Subcontinental India from Afghanistan to Bengal', 'Southernmost boundary near Tamilakam subject to scholarly debate; edict locations serve as primary spatial markers.'),
('t0000003-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003', 'r0000002-0000-0000-0000-000000000002', -27, 476, 'Mediterranean periphery, Gaul, Hispania, Britannia, and Levant', 'Frontiers (limes) fluctuated in Northern Europe and Mesopotamia across centuries.'),
('t0000004-0000-0000-0000-000000000004', 'c0000004-0000-0000-0000-000000000004', 'r0000005-0000-0000-0000-000000000005', -221, -206, 'Central and Eastern China along Yellow and Yangtze rivers', 'Great Wall demarcated northern defense line; southern boundary in Lingnan territory was fluid.'),
('t0000005-0000-0000-0000-000000000005', 'c0000005-0000-0000-0000-000000000005', 'r0000001-0000-0000-0000-000000000001', 1526, 1857, 'Indo-Gangetic plain and Deccan plateau', 'Deccan conquest under Aurangzeb was incomplete and resisted by Maratha Confederacy.'),
('t0000006-0000-0000-0000-000000000006', 'c0000006-0000-0000-0000-000000000006', 'r0000006-0000-0000-0000-000000000006', -3100, -30, 'Lower and Upper Nile delta', 'Desert frontiers unfortified; agricultural riverine strip served as core domain.'),
('t0000007-0000-0000-0000-000000000007', 'c0000007-0000-0000-0000-000000000007', 'r0000001-0000-0000-0000-000000000001', 1947, 2026, 'Sovereign territory of modern India', 'Radcliffe Line partition created contested borderlines in Jammu & Kashmir.')
ON CONFLICT DO NOTHING;

-- Seed Event Territories Links
INSERT INTO event_territories (event_id, territory_id, is_primary) VALUES
('e0000009-0000-0000-0000-000000000009', 't0000001-0000-0000-0000-000000000001', true),
('e0000015-0000-0000-0000-000000000015', 't0000002-0000-0000-0000-000000000002', true),
('e0000016-0000-0000-0000-000000000016', 't0000002-0000-0000-0000-000000000002', true),
('e0000018-0000-0000-0000-000000000018', 't0000003-0000-0000-0000-000000000003', true),
('e0000017-0000-0000-0000-000000000017', 't0000004-0000-0000-0000-000000000004', true),
('e0000024-0000-0000-0000-000000000024', 't0000005-0000-0000-0000-000000000005', true),
('e0000010-0000-0000-0000-000000000010', 't0000006-0000-0000-0000-000000000006', true),
('e0000027-0000-0000-0000-000000000027', 't0000007-0000-0000-0000-000000000007', true)
ON CONFLICT DO NOTHING;
