-- Phase 5 India Deep Track SQL Migration: Sources, Event Sources, Expanded India Events & Dynastic Chains

CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    publisher TEXT,
    url TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('book', 'academic_paper', 'archaeological_report', 'primary_text', 'reference')),
    published_at TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_sources (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    claim_note TEXT,
    no_source_flag BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (event_id, source_id)
);

-- Enable RLS
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sources ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies
CREATE POLICY "Public read access for sources" ON sources FOR SELECT USING (true);
CREATE POLICY "Public read access for event_sources" ON event_sources FOR SELECT USING (true);

-- Seed Academic Sources
INSERT INTO sources (id, title, author, publisher, url, source_type, published_at) VALUES
('s0000001-0000-0000-0000-000000000001', 'A History of Ancient and Early Medieval India', 'Upinder Singh', 'Pearson Longman', 'https://www.pearson.com/en-us/subject-catalog/p/history-of-ancient-and-early-medieval-india/P200000003444', 'book', '2008'),
('s0000002-0000-0000-0000-000000000002', 'Early India: From the Origins to AD 1300', 'Romila Thapar', 'University of California Press', 'https://www.ucpress.edu/book/9780520242258/early-india', 'book', '2004'),
('s0000003-0000-0000-0000-000000000003', 'A History of India, Vol. 2', 'Percival Spear', 'Penguin Books', 'https://www.penguinrandomhouse.com/books/260907/a-history-of-india-volume-2-by-percival-spear/', 'book', '1990'),
('s0000004-0000-0000-0000-000000000004', 'Excavations at Harappa 1986-1990', 'Richard H. Meadow', 'Prehistory Press', 'https://www.harappa.com/har1/har0.html', 'archaeological_report', '1991'),
('s0000005-0000-0000-0000-000000000005', 'The Delhi Sultanate: A Political and Military History', 'Peter Jackson', 'Cambridge University Press', 'https://www.cambridge.org/core/books/delhi-sultanate/79261E08C8B563D45899D8FBD117E3F1', 'book', '1999'),
('s0000006-0000-0000-0000-000000000006', 'The Mughal Empire', 'John F. Richards', 'Cambridge University Press', 'https://www.cambridge.org/core/books/mughal-empire/3BE28E256C816DFB65D65A2C85AE2B42', 'book', '1993')
ON CONFLICT DO NOTHING;

-- Seed Additional Historical People for India Deep Track
INSERT INTO people (id, name, slug, alt_names, summary, body, status) VALUES
('p0000009-0000-0000-0000-000000000009', 'Qutb ud-Din Aibak', 'qutb-ud-din-aibak', ARRAY['Aibak'], 'Founder of the Mamluk (Slave) Dynasty and first Sultan of Delhi.', 'Former Ghurid general who established the Delhi Sultanate in 1206 CE and commissioned the Qutb Minar.', 'published'),
('p0000010-0000-0000-0000-000000000010', 'Alauddin Khalji', 'alauddin-khalji', ARRAY['Ali Gurshasp'], 'Second ruler of the Khalji dynasty who expanded Sultanate power into the Deccan.', 'Implemented radical price control agrarian reforms and repelled multiple Chagatai Mongol invasions.', 'published'),
('p0000011-0000-0000-0000-000000000011', 'Jahangir', 'jahangir', ARRAY['Nur-ud-din Muhammad Salim'], 'Fourth Mughal Emperor who patronized Mughal painting and regional diplomacy.', 'Son of Akbar whose reign saw diplomatic trade relations with the English East India Company via Sir Thomas Roe.', 'published'),
('p0000012-0000-0000-0000-000000000012', 'Shah Jahan', 'shah-jahan', ARRAY['Prince Khurram'], 'Fifth Mughal Emperor renowned as the master architect of the Taj Mahal and Shahjahanabad.', 'Golden age of Mughal architecture marked by monumental construction including the Red Fort and Jama Masjid.', 'published'),
('p0000013-0000-0000-0000-000000000013', 'Aurangzeb Alamgir', 'aurangzeb', ARRAY['Muhi-ud-Din Muhammad'], 'Sixth Mughal Emperor under whose reign the empire expanded to its maximum territorial extent.', 'Conquered Bijapur and Golconda while fighting decades of guerrilla warfare against the Maratha Confederacy.', 'published'),
('p0000014-0000-0000-0000-000000000014', 'Chhatrapati Shivaji Maharaj', 'shivaji-maharaj', ARRAY['Shivaji Raje Bhosale'], 'Founder of the Maratha Empire who pioneered guerrilla warfare (Ganimi Kawa).', 'Crowned Chhatrapati at Raigad Fort in 1674, establishing an independent Maratha state resisting Mughal hegemony.', 'published'),
('p0000015-0000-0000-0000-000000000015', 'Maharaja Ranjit Singh', 'ranjit-singh', ARRAY['Sher-e-Punjab'], 'Founder of the Sikh Empire who unified the Punjab mishls.', 'Established a modernized, multi-religious army (Khalsa Army) and secured the northwestern frontier.', 'published'),
('p0000016-0000-0000-0000-000000000016', 'Subhas Chandra Bose', 'subhas-chandra-bose', ARRAY['Netaji'], 'Indian nationalist who organized the Indian National Army (INA) during World War II.', 'Formed the Azad Hind government in exile to challenge British colonial rule through armed struggle.', 'published')
ON CONFLICT (slug) DO NOTHING;
