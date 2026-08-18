-- Phase 1 Foundation SQL Migration: Schema & Seed Data

CREATE TABLE IF NOT EXISTS layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    sort_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    body TEXT,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'review', 'approved', 'published'))
);

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

CREATE TABLE IF NOT EXISTS event_layers (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    layer_id UUID NOT NULL REFERENCES layers(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, layer_id)
);

-- Enable RLS
ALTER TABLE layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_layers ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies
CREATE POLICY "Public read access for layers" ON layers FOR SELECT USING (true);
CREATE POLICY "Public read access for events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read access for event_dates" ON event_dates FOR SELECT USING (true);
CREATE POLICY "Public read access for event_layers" ON event_layers FOR SELECT USING (true);

-- Seed Layers
INSERT INTO layers (id, key, label, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'deep-time', 'Cosmic & Deep Time', 1),
('22222222-2222-2222-2222-222222222222', 'world-history', 'World History & Civilizations', 2),
('33333333-3333-3333-3333-333333333333', 'india', 'India Track', 3),
('44444444-4444-4444-4444-444444444444', 'religion', 'Philosophy & Religions', 4),
('55555555-5555-5555-5555-555555555555', 'science-tech', 'Science & Technology', 5)
ON CONFLICT (key) DO NOTHING;

-- Seed Sample Events (29 core historical events)
INSERT INTO events (id, title, slug, summary, body, category, status) VALUES
('e0000001-0000-0000-0000-000000000001', 'The Big Bang', 'big-bang', 'Origin of the observable universe, space, and time.', 'The universe originated in an infinitely dense singularity approximately 13.8 billion years ago.', 'Cosmology', 'published'),
('e0000002-0000-0000-0000-000000000002', 'Formation of Earth', 'formation-of-earth', 'Accretion of Earth from the solar nebula.', 'Earth accreted from dust and gases surrounding the early Sun 4.54 billion years ago.', 'Geology', 'published'),
('e0000003-0000-0000-0000-000000000003', 'Emergence of Microbial Life', 'first-life', 'Earliest evidence of cellular life on Earth.', 'Stromatolites and microfossils indicate bacterial life emerged around 3.7 billion years ago.', 'Biology', 'published'),
('e0000004-0000-0000-0000-000000000004', 'Cambrian Explosion', 'cambrian-explosion', 'Rapid diversification of complex multicellular life forms.', 'Most major animal phyla appeared in the fossil record within a short evolutionary window.', 'Biology', 'published'),
('e0000005-0000-0000-0000-000000000005', 'Cretaceous–Paleogene Extinction', 'dinosaur-extinction', 'Chicxulub asteroid impact wipes out non-avian dinosaurs.', '75% of plant and animal species on Earth perished following an asteroid impact in present-day Mexico.', 'Paleontology', 'published'),
('e0000006-0000-0000-0000-000000000006', 'Emergence of Homo Sapiens', 'homo-sapiens', 'Anatomically modern humans arise in Africa.', 'Fossil discoveries in Jebel Irhoud, Morocco date the earliest Homo sapiens to around 300,000 years ago.', 'Anthropology', 'published'),
('e0000007-0000-0000-0000-000000000007', 'Agricultural Revolution', 'agricultural-revolution', 'Transition from foraging hunter-gatherers to settled farming communities.', 'Independent domestication of cereal crops and livestock transformed human societal structure.', 'Prehistory', 'published'),
('e0000008-0000-0000-0000-000000000008', 'Construction of Göbekli Tepe', 'gobekli-tepe', 'Earliest known monumental sanctuary constructed by hunter-gatherers.', 'Pre-Pottery Neolithic site in southeastern Anatolia featuring carved T-shaped stone pillars.', 'Archaeology', 'published'),
('e0000009-0000-0000-0000-000000000009', 'Indus Valley Civilization Emergence', 'indus-valley-civilization', 'Rise of Harappan urban planning, metallurgy, and standardized weights in the Indian subcontinent.', 'Harappa and Mohenjo-daro developed sophisticated drainage systems and craft specialization.', 'Civilization', 'published'),
('e0000010-0000-0000-0000-000000000010', 'Construction of the Great Pyramid of Giza', 'great-pyramid-giza', 'Pharaoh Khufu erects the monumental pyramid on the Giza plateau.', 'The largest of the Giza pyramids, constructed with over 2 million limestone blocks.', 'Architecture', 'published'),
('e0000011-0000-0000-0000-000000000011', 'Promulgation of Code of Hammurabi', 'code-of-hammurabi', 'Babylonian legal code inscribed on a basalt stele.', 'One of the oldest deciphered legal texts, famous for the principle of retributive law.', 'Law', 'published'),
('e0000012-0000-0000-0000-000000000012', 'Vedic Age & Rigveda Compilation', 'vedic-age', 'Composition of the earliest Vedic hymns and pastoral society in northwestern India.', 'Oral tradition of the Rigveda established sacred poetry and early philosophical inquiry.', 'Literature', 'published'),
('e0000013-0000-0000-0000-000000000013', 'Life of Vardhamana Mahavira', 'mahavira', '24th Tirthankara of Jainism revitalizes ascetic philosophy and Ahimsa.', 'Promoted non-violence, truth, non-stealing, celibacy, and non-attachment across ancient Magadha.', 'Religion', 'published'),
('e0000014-0000-0000-0000-000000000014', 'Life of Siddhartha Gautama (Buddha)', 'buddha', 'Founder of Buddhism attains Enlightenment under the Bodhi tree.', 'Taught the Four Noble Truths and Eightfold Path, initiating a major worldwide philosophical movement.', 'Religion', 'published'),
('e0000015-0000-0000-0000-000000000015', 'Founding of the Mauryan Empire', 'mauryan-empire', 'Chandragupta Maurya unifies northern India with guidance from Chanakya.', 'Established the first pan-Indian empire with Magadha as its political center.', 'Empire', 'published'),
('e0000016-0000-0000-0000-000000000016', 'Ashoka Inscribes Rock & Pillar Edicts', 'edicts-of-ashoka', 'Emperor Ashoka propagates Dhamma, non-violence, and moral governance after the Kalinga War.', 'Inscriptions in Brahmi and Kharosthi scripts carved across the Indian subcontinent.', 'Governance', 'published'),
('e0000017-0000-0000-0000-000000000017', 'Unification of China under Qin Dynasty', 'qin-unification', 'Qin Shi Huang unifies the Warring States into the first imperial Chinese dynasty.', 'Standardized currency, weights, measures, and initiated the Great Wall of China.', 'Empire', 'published'),
('e0000018-0000-0000-0000-000000000018', 'Establishment of the Roman Empire', 'roman-empire', 'Augustus becomes the first Roman Emperor, ending the Roman Republic.', 'Initiated the Pax Romana, a two-century period of relative peace and stability in the Mediterranean.', 'Empire', 'published'),
('e0000019-0000-0000-0000-000000000019', 'Gupta Empire Golden Age', 'gupta-empire', 'Classical age of Indian mathematics, astronomy, literature, and arts under Chandragupta II.', 'Aryabhata calculates pi and heliocentrism; Kalidasa writes Sanskrit masterpieces.', 'Culture', 'published'),
('e0000020-0000-0000-0000-000000000020', 'Birth & Rise of Islam', 'rise-of-islam', 'Prophet Muhammad establishes Islamic faith in the Arabian Peninsula.', 'The Quranic revelation and political unification of Arabia created an expansive civilization.', 'Religion', 'published'),
('e0000021-0000-0000-0000-000000000021', 'Tang Dynasty Golden Age in China', 'tang-dynasty', 'High period of Chinese poetry, Silk Road commerce, and cosmopolitan governance.', 'Capital city Chang\'an became the world\'s largest urban center.', 'Civilization', 'published'),
('e0000022-0000-0000-0000-000000000022', 'Maritime Expedition of Chola Empire', 'chola-maritime-expedition', 'Rajendra Chola I launches naval expeditions to Southeast Asia (Srivijaya).', 'Established maritime trade dominance across the Bay of Bengal and Indian Ocean.', 'Naval', 'published'),
('e0000023-0000-0000-0000-000000000023', 'Invention of Movable Type Printing Press', 'gutenberg-press', 'Johannes Gutenberg perfects mechanical movable type printing in Europe.', 'Democratized access to written knowledge, sparking the Renaissance and Scientific Revolution.', 'Invention', 'published'),
('e0000024-0000-0000-0000-000000000024', 'Founding of the Mughal Empire', 'mughal-empire', 'Babur defeats Ibrahim Lodi at First Battle of Panipat to establish Mughal rule.', 'Synthesized Indo-Persian architecture, administration, and cultural synthesis.', 'Empire', 'published'),
('e0000025-0000-0000-0000-000000000025', 'Publication of Newton\'s Principia', 'newton-principia', 'Isaac Newton formulates laws of motion and universal gravitation.', 'Laid the mathematical foundations of classical mechanics and modern physics.', 'Science', 'published'),
('e0000026-0000-0000-0000-000000000026', 'Onset of the Industrial Revolution', 'industrial-revolution', 'Transition to mechanized steam power and factory manufacturing in Britain.', 'Transformed global economics, urban growth, and technological capabilities.', 'Technology', 'published'),
('e0000027-0000-0000-0000-000000000027', 'Indian Independence & Partition', 'indian-independence', 'India gains independence from British colonial rule after non-violent freedom movement.', 'Mahatma Gandhi and Jawaharlal Nehru lead the nation into democratic statehood.', 'Modern History', 'published'),
('e0000028-0000-0000-0000-000000000028', 'Apollo 11 Moon Landing', 'apollo-11-moon-landing', 'Neil Armstrong and Buzz Aldrin become first humans to walk on the Moon.', 'Humanity steps beyond Earth orbit in the premier accomplishment of the Space Age.', 'Space', 'published'),
('e0000029-0000-0000-0000-000000000029', 'Invention of the World Wide Web', 'world-wide-web', 'Tim Berners-Lee introduces HTTP, HTML, and web browsers at CERN.', 'Created global hyperlinked network underpinning modern digital information infrastructure.', 'Technology', 'published')
ON CONFLICT (slug) DO NOTHING;

-- Seed Event Dates (years_before_present calculated relative to 2026)
INSERT INTO event_dates (event_id, precision, calendar, year_start, year_end, years_before_present, confidence, is_primary) VALUES
('e0000001-0000-0000-0000-000000000001', 'bya', 'ya', -1380000000, NULL, 13800000000, 'well_established', true),
('e0000002-0000-0000-0000-000000000002', 'bya', 'ya', -454000000, NULL, 4540000000, 'well_established', true),
('e0000003-0000-0000-0000-000000000003', 'bya', 'ya', -370000000, NULL, 3700000000, 'probable', true),
('e0000004-0000-0000-0000-000000000004', 'mya', 'ya', -54100000, NULL, 541000000, 'well_established', true),
('e0000005-0000-0000-0000-000000000005', 'mya', 'ya', -6600000, NULL, 66000000, 'well_established', true),
('e0000006-0000-0000-0000-000000000006', 'millennium', 'ya', -300000, NULL, 300000, 'probable', true),
('e0000007-0000-0000-0000-000000000007', 'millennium', 'ya', -12000, NULL, 12000, 'well_established', true),
('e0000008-0000-0000-0000-000000000008', 'century', 'ce_bce', -9500, NULL, 11526, 'well_established', true),
('e0000009-0000-0000-0000-000000000009', 'century', 'ce_bce', -3300, -1300, 5326, 'well_established', true),
('e0000010-0000-0000-0000-000000000010', 'century', 'ce_bce', -2560, NULL, 4586, 'probable', true),
('e0000011-0000-0000-0000-000000000011', 'century', 'ce_bce', -1750, NULL, 3776, 'well_established', true),
('e0000012-0000-0000-0000-000000000012', 'century', 'ce_bce', -1500, -500, 3526, 'debated', true),
('e0000013-0000-0000-0000-000000000013', 'year', 'ce_bce', -599, -527, 2625, 'traditional', true),
('e0000014-0000-0000-0000-000000000014', 'year', 'ce_bce', -563, -483, 2589, 'probable', true),
('e0000015-0000-0000-0000-000000000015', 'year', 'ce_bce', -322, -185, 2348, 'well_established', true),
('e0000016-0000-0000-0000-000000000016', 'year', 'ce_bce', -268, -232, 2294, 'well_established', true),
('e0000017-0000-0000-0000-000000000017', 'year', 'ce_bce', -221, -206, 2247, 'well_established', true),
('e0000018-0000-0000-0000-000000000018', 'year', 'ce_bce', -27, 476, 2053, 'well_established', true),
('e0000019-0000-0000-0000-000000000019', 'year', 'ce_bce', 320, 550, 1706, 'well_established', true),
('e0000020-0000-0000-0000-000000000020', 'year', 'ce_bce', 570, 632, 1456, 'well_established', true),
('e0000021-0000-0000-0000-000000000021', 'year', 'ce_bce', 618, 907, 1408, 'well_established', true),
('e0000022-0000-0000-0000-000000000022', 'year', 'ce_bce', 1014, 1044, 1012, 'well_established', true),
('e0000023-0000-0000-0000-000000000023', 'year', 'ce_bce', 1440, NULL, 586, 'well_established', true),
('e0000024-0000-0000-0000-000000000024', 'year', 'ce_bce', 1526, 1857, 500, 'well_established', true),
('e0000025-0000-0000-0000-000000000025', 'year', 'ce_bce', 1687, NULL, 339, 'well_established', true),
('e0000026-0000-0000-0000-000000000026', 'decade', 'ce_bce', 1760, 1840, 266, 'well_established', true),
('e0000027-0000-0000-0000-000000000027', 'exact', 'ce_bce', 1947, NULL, 79, 'well_established', true),
('e0000028-0000-0000-0000-000000000028', 'exact', 'ce_bce', 1969, NULL, 57, 'well_established', true),
('e0000029-0000-0000-0000-000000000029', 'exact', 'ce_bce', 1989, NULL, 37, 'well_established', true)
ON CONFLICT DO NOTHING;

-- Seed Event Layers
INSERT INTO event_layers (event_id, layer_id) VALUES
('e0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
('e0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111'),
('e0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111'),
('e0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111'),
('e0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111'),
('e0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111'),
('e0000007-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222'),
('e0000008-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222'),
('e0000009-0000-0000-0000-000000000009', '33333333-3333-3333-3333-333333333333'),
('e0000010-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222222'),
('e0000011-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222'),
('e0000012-0000-0000-0000-000000000012', '33333333-3333-3333-3333-333333333333'),
('e0000013-0000-0000-0000-000000000013', '33333333-3333-3333-3333-333333333333'),
('e0000013-0000-0000-0000-000000000013', '44444444-4444-4444-4444-444444444444'),
('e0000014-0000-0000-0000-000000000014', '33333333-3333-3333-3333-333333333333'),
('e0000014-0000-0000-0000-000000000014', '44444444-4444-4444-4444-444444444444'),
('e0000015-0000-0000-0000-000000000015', '33333333-3333-3333-3333-333333333333'),
('e0000016-0000-0000-0000-000000000016', '33333333-3333-3333-3333-333333333333'),
('e0000017-0000-0000-0000-000000000017', '22222222-2222-2222-2222-222222222222'),
('e0000018-0000-0000-0000-000000000018', '22222222-2222-2222-2222-222222222222'),
('e0000019-0000-0000-0000-000000000019', '33333333-3333-3333-3333-333333333333'),
('e0000020-0000-0000-0000-000000000020', '44444444-4444-4444-4444-444444444444'),
('e0000021-0000-0000-0000-000000000021', '22222222-2222-2222-2222-222222222222'),
('e0000022-0000-0000-0000-000000000022', '33333333-3333-3333-3333-333333333333'),
('e0000023-0000-0000-0000-000000000023', '55555555-5555-5555-5555-555555555555'),
('e0000024-0000-0000-0000-000000000024', '33333333-3333-3333-3333-333333333333'),
('e0000025-0000-0000-0000-000000000025', '55555555-5555-5555-5555-555555555555'),
('e0000026-0000-0000-0000-000000000026', '55555555-5555-5555-5555-555555555555'),
('e0000027-0000-0000-0000-000000000027', '33333333-3333-3333-3333-333333333333'),
('e0000028-0000-0000-0000-000000000028', '55555555-5555-5555-5555-555555555555'),
('e0000029-0000-0000-0000-000000000029', '55555555-5555-5555-5555-555555555555')
ON CONFLICT DO NOTHING;
