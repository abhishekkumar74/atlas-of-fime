-- Phase 3 Knowledge Graph SQL Migration: People & Entity Relationships

CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    alt_names TEXT[] DEFAULT '{}',
    birth_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    death_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    summary TEXT NOT NULL,
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'review', 'approved', 'published'))
);

CREATE TABLE IF NOT EXISTS entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_type TEXT NOT NULL CHECK (from_type IN ('event', 'person', 'civilization', 'religion')),
    from_id UUID NOT NULL,
    to_type TEXT NOT NULL CHECK (to_type IN ('event', 'person', 'civilization', 'religion')),
    to_id UUID NOT NULL,
    relationship TEXT NOT NULL CHECK (relationship IN (
        'caused', 'influenced', 'preceded', 'followed', 'participated_in',
        'ruled', 'founded', 'conquered', 'allied_with', 'succeeded',
        'inspired', 'occurred_during', 'geographically_overlapped'
    )),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies
CREATE POLICY "Public read access for people" ON people FOR SELECT USING (true);
CREATE POLICY "Public read access for entity_relationships" ON entity_relationships FOR SELECT USING (true);

-- Seed Historical People
INSERT INTO people (id, name, slug, alt_names, summary, body, status) VALUES
('p0000001-0000-0000-0000-000000000001', 'Chandragupta Maurya', 'chandragupta-maurya', ARRAY['Chandragupta', 'Sandrokottos'], 'Founder of the Mauryan Empire who unified central and northern India under a centralized administration.', 'Guided by his chief advisor Chanakya (Kautilya), Chandragupta defeated the Nanda Dynasty and established imperial governance from Pataliputra.', 'published'),
('p0000002-0000-0000-0000-000000000002', 'Ashoka the Great', 'ashoka', ARRAY['Ashoka Maurya', 'Devanampriya Priyadarsin'], 'Third Mauryan Emperor who embraced and propagated Buddhist Dhamma across South Asia after the Kalinga War.', 'Renowned for erecting rock and pillar edicts promoting non-violence, religious tolerance, and social welfare throughout his vast empire.', 'published'),
('p0000003-0000-0000-0000-000000000003', 'Siddhartha Gautama (Buddha)', 'buddha', ARRAY['Shakyamuni', 'Gautama Buddha'], 'Spiritual teacher and philosopher whose insights formed the foundations of Buddhism.', 'Renounced royal privilege in Kapilavastu, attained Enlightenment under the Bodhi tree in Bodh Gaya, and spent decades teaching the Middle Way across Magadha.', 'published'),
('p0000004-0000-0000-0000-000000000004', 'Vardhamana Mahavira', 'mahavira', ARRAY['Sanmati', 'Vira'], '24th Tirthankara of Jainism who codified ascetic vows and Ahimsa philosophy.', 'Contemporary of Gautama Buddha in ancient Bihar who revitalized Jain philosophy, emphasizing non-possession and respect for all living beings.', 'published'),
('p0000005-0000-0000-0000-000000000005', 'Zahir al-Din Muhammad Babur', 'babur', ARRAY['Babur Padshah'], 'Central Asian conqueror and founder of the Mughal Dynasty in India.', 'Descendant of Timur and Genghis Khan who won the Battle of Panipat in 1526, introducing gunpowder warfare and Persian literary culture to northern India.', 'published'),
('p0000006-0000-0000-0000-000000000006', 'Sir Isaac Newton', 'isaac-newton', ARRAY['Newton'], 'English mathematician, physicist, and astronomer who formulated laws of motion and universal gravitation.', 'Author of Philosophiae Naturalis Principia Mathematica, whose mechanical framework dominated scientific thought for over two centuries.', 'published'),
('p0000007-0000-0000-0000-000000000007', 'Sir Tim Berners-Lee', 'tim-berners-lee', ARRAY['TimBL'], 'English computer scientist who invented the World Wide Web in 1989.', 'Formulated HTTP, HTML, URL standards, and the first web browser while working as a software engineer at CERN.', 'published'),
('p0000008-0000-0000-0000-000000000008', 'Mahatma Gandhi', 'mahatma-gandhi', ARRAY['Mohandas Karamchand Gandhi', 'Bapu'], 'Leader of the Indian independence movement who pioneered non-violent civil disobedience (Satyagraha).', 'Led mass campaigns including the Salt March and Quit India Movement, inspiring civil rights movements globally.', 'published')
ON CONFLICT (slug) DO NOTHING;

-- Seed Entity Relationships
INSERT INTO entity_relationships (id, from_type, from_id, to_type, to_id, relationship, note) VALUES
('r0000001-0000-0000-0000-000000000001', 'person', 'p0000001-0000-0000-0000-000000000001', 'event', 'e0000015-0000-0000-0000-000000000015', 'founded', 'Chandragupta Maurya established the Mauryan Empire in 322 BCE.'),
('r0000002-0000-0000-0000-000000000002', 'person', 'p0000002-0000-0000-0000-000000000002', 'event', 'e0000015-0000-0000-0000-000000000015', 'ruled', 'Ashoka ruled the Mauryan Empire at its territorial peak.'),
('r0000003-0000-0000-0000-000000000003', 'person', 'p0000002-0000-0000-0000-000000000002', 'event', 'e0000016-0000-0000-0000-000000000016', 'inspired', 'Ashoka personally commissioned the Edicts.'),
('r0000004-0000-0000-0000-000000000004', 'person', 'p0000003-0000-0000-0000-000000000003', 'event', 'e0000014-0000-0000-0000-000000000014', 'founded', 'Gautama Buddha taught the Four Noble Truths.'),
('r0000005-0000-0000-0000-000000000005', 'person', 'p0000004-0000-0000-0000-000000000004', 'event', 'e0000013-0000-0000-0000-000000000013', 'founded', 'Mahavira revitalized Jainism.'),
('r0000006-0000-0000-0000-000000000006', 'person', 'p0000005-0000-0000-0000-000000000005', 'event', 'e0000024-0000-0000-0000-000000000024', 'founded', 'Babur established the Mughal Dynasty after victory at Panipat.'),
('r0000007-0000-0000-0000-000000000007', 'person', 'p0000006-0000-0000-0000-000000000006', 'event', 'e0000025-0000-0000-0000-000000000025', 'founded', 'Isaac Newton published Principia Mathematica.'),
('r0000008-0000-0000-0000-000000000008', 'person', 'p0000007-0000-0000-0000-000000000007', 'event', 'e0000029-0000-0000-0000-000000000029', 'founded', 'Tim Berners-Lee invented HTTP, HTML, and WWW at CERN.'),
('r0000009-0000-0000-0000-000000000009', 'person', 'p0000008-0000-0000-0000-000000000008', 'event', 'e0000027-0000-0000-0000-000000000027', 'participated_in', 'Mahatma Gandhi led the non-violent struggle for Indian independence.'),

-- Inter-event relationships
('r0000010-0000-0000-0000-000000000010', 'event', 'e0000007-0000-0000-0000-000000000007', 'event', 'e0000009-0000-0000-0000-000000000009', 'caused', 'Agriculture enabled permanent urban settlements in the Indus Valley.'),
('r0000011-0000-0000-0000-000000000011', 'event', 'e0000012-0000-0000-0000-000000000012', 'event', 'e0000014-0000-0000-0000-000000000014', 'influenced', 'Vedic philosophical debates preceded Śramaṇa movements.'),
('r0000012-0000-0000-0000-000000000012', 'event', 'e0000023-0000-0000-0000-000000000023', 'event', 'e0000025-0000-0000-0000-000000000025', 'influenced', 'Movable type allowed wide dissemination of scientific literature.'),
('r0000013-0000-0000-0000-000000000013', 'event', 'e0000025-0000-0000-0000-000000000025', 'event', 'e0000028-0000-0000-0000-000000000028', 'influenced', 'Newtonian orbital mechanics enabled spaceflight calculations.'),
('r0000014-0000-0000-0000-000000000014', 'event', 'e0000026-0000-0000-0000-000000000026', 'event', 'e0000029-0000-0000-0000-000000000029', 'influenced', 'Industrial telecommunications preceded digital global networking.')
ON CONFLICT DO NOTHING;
