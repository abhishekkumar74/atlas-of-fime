-- Phase 6 Global Expansion SQL Migration: Non-India Tracks, Civilizations & Lateral Cross-Region Relationships

-- Seed Global Civilizations
INSERT INTO civilizations (id, name, kind, summary, status) VALUES
('c0000008-0000-0000-0000-000000000008', 'Byzantine Empire', 'empire', 'Eastern Roman Empire centered at Constantinople.', 'published'),
('c0000009-0000-0000-0000-000000000009', 'Ottoman Empire', 'empire', 'Transcontinental Islamic empire spanning Southeast Europe, Western Asia, and North Africa.', 'published'),
('c0000010-0000-0000-0000-000000000010', 'Mali Empire', 'empire', 'Mandinka empire in West Africa famed for gold trade and Timbuktu learning centers.', 'published'),
('c0000011-0000-0000-0000-000000000011', 'Maya Civilization', 'civilization', 'Mesoamerican civilization renowned for logosyllabic script, mathematics, and astronomy.', 'published'),
('c0000012-0000-0000-0000-000000000012', 'Aztec Empire (Triple Alliance)', 'empire', 'Nahua alliance centered at Tenochtitlan in the Valley of Mexico.', 'published'),
('c0000013-0000-0000-0000-000000000013', 'Inca Empire (Tawantinsuyu)', 'empire', 'Largest pre-Columbian empire in the Americas along the Andean mountain chain.', 'published'),
('c0000014-0000-0000-0000-000000000014', 'Song Dynasty', 'dynasty', 'Imperial Chinese dynasty that pioneered paper money, compass navigation, and gunpowder.', 'published'),
('c0000015-0000-0000-0000-000000000015', 'Tokugawa Shogunate', 'dynasty', 'Feudal Japanese military government during the Edo period.', 'published')
ON CONFLICT DO NOTHING;

-- Seed Global Historic Figures
INSERT INTO people (id, name, slug, alt_names, summary, body, status) VALUES
('p0000017-0000-0000-0000-000000000017', 'Julius Caesar', 'julius-caesar', ARRAY['Gaius Julius Caesar'], 'Roman general and statesman whose dictatorship precipitated the demise of the Roman Republic.', 'Conquered Gaul and expanded Roman territory to the North Sea before his assassination on the Ides of March.', 'published'),
('p0000018-0000-0000-0000-000000000018', 'Mansa Musa', 'mansa-musa', ARRAY['Musa I of Mali'], 'Tenth Mansa of the Mali Empire whose 1324 pilgrimage to Mecca highlighted West African wealth.', 'Patronized Islamic scholarship in Timbuktu and constructed the Djinguereber Mosque.', 'published'),
('p0000019-0000-0000-0000-000000000019', 'Martin Luther', 'martin-luther', ARRAY['Luther'], 'German theologian and augustinian monk who initiated the Protestant Reformation.', 'Authored the Ninety-five Theses in 1517 challenging papal indulgences and translating the Bible into vernacular German.', 'published'),
('p0000020-0000-0000-0000-000000000020', 'Genghis Khan', 'genghis-khan', ARRAY['Temüjin'], 'Founder and Khagan of the Mongol Empire.', 'Unified the Mongolic tribes and launched transcontinental conquests creating the largest contiguous land empire.', 'published'),
('p0000021-0000-0000-0000-000000000021', 'Suleiman the Magnificent', 'suleiman-the-magnificent', ARRAY['Suleiman I', 'Kanuni'], 'Tenth Sultan of the Ottoman Empire who presided over its golden age.', 'Expanded territory across Southeast Europe, North Africa, and the Mediterranean while codifying Ottoman legal law.', 'published'),
('p0000022-0000-0000-0000-000000000022', 'Moctezuma II', 'moctezuma-ii', ARRAY['Motecuhzoma Xocoyotzin'], 'Ninth Tlatoani of Tenochtitlan during the Spanish conquest of the Aztec Empire.', 'Governed during initial contact with Hernán Cortés before the fall of Tenochtitlan.', 'published'),
('p0000023-0000-0000-0000-000000000023', 'Atahualpa', 'atahualpa', ARRAY['Atawallpa'], 'Last Sapa Inca of the Inca Empire before Spanish conquest.', 'Captured by Francisco Pizarro at the Battle of Cajamarca in 1532 despite offering a room filled with gold ransom.', 'published')
ON CONFLICT (slug) DO NOTHING;
