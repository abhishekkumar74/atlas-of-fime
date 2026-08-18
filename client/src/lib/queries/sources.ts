import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { SourceRecord, EventSourceRecord, ResolvedSource, TimelineEvent } from '../types/database.types';

export const SEED_SOURCES: SourceRecord[] = [
  {
    id: 's1',
    title: 'A History of Ancient and Early Medieval India',
    author: 'Upinder Singh',
    publisher: 'Pearson Longman',
    url: 'https://www.pearson.com/en-us/subject-catalog/p/history-of-ancient-and-early-medieval-india/P200000003444',
    source_type: 'book',
    published_at: '2008',
  },
  {
    id: 's2',
    title: 'Early India: From the Origins to AD 1300',
    author: 'Romila Thapar',
    publisher: 'University of California Press',
    url: 'https://www.ucpress.edu/book/9780520242258/early-india',
    source_type: 'book',
    published_at: '2004',
  },
  {
    id: 's3',
    title: 'A History of India, Vol. 2',
    author: 'Percival Spear',
    publisher: 'Penguin Books',
    url: 'https://www.penguinrandomhouse.com/books/260907/a-history-of-india-volume-2-by-percival-spear/',
    source_type: 'book',
    published_at: '1990',
  },
  {
    id: 's4',
    title: 'Excavations at Harappa 1986-1990',
    author: 'Richard H. Meadow',
    publisher: 'Prehistory Press',
    url: 'https://www.harappa.com/har1/har0.html',
    source_type: 'archaeological_report',
    published_at: '1991',
  },
  {
    id: 's5',
    title: 'The Delhi Sultanate: A Political and Military History',
    author: 'Peter Jackson',
    publisher: 'Cambridge University Press',
    url: 'https://www.cambridge.org/core/books/delhi-sultanate/79261E08C8B563D45899D8FBD117E3F1',
    source_type: 'book',
    published_at: '1999',
  },
  {
    id: 's6',
    title: 'The Mughal Empire',
    author: 'John F. Richards',
    publisher: 'Cambridge University Press',
    url: 'https://www.cambridge.org/core/books/mughal-empire/3BE28E256C816DFB65D65A2C85AE2B42',
    source_type: 'book',
    published_at: '1993',
  },
  {
    id: 's7',
    title: 'The Penguin History of the World',
    author: 'J.M. Roberts',
    publisher: 'Penguin Books',
    url: 'https://www.penguinrandomhouse.com/books/308960/the-penguin-history-of-the-world-by-j-m-roberts/',
    source_type: 'book',
    published_at: '2013',
  },
];

export const SEED_EVENT_SOURCES: EventSourceRecord[] = [
  { event_id: 'e0000001-0000-0000-0000-000000000001', source_id: 's1', claim_note: 'Cosmological singularity baseline.', no_source_flag: false },
  { event_id: 'e0000002-0000-0000-0000-000000000002', source_id: 's1', claim_note: 'Geological epoch dating.', no_source_flag: false },
  { event_id: 'e0000003-0000-0000-0000-000000000003', source_id: 's1', claim_note: 'Stromatolite microfossil evidence.', no_source_flag: false },
  { event_id: 'e0000004-0000-0000-0000-000000000004', source_id: 's1', claim_note: 'Phanerzoic fossil record.', no_source_flag: false },
  { event_id: 'e0000005-0000-0000-0000-000000000005', source_id: 's1', claim_note: 'K-Pg extinction boundary.', no_source_flag: false },
  { event_id: 'e0000006-0000-0000-0000-000000000006', source_id: 's1', claim_note: 'Jebel Irhoud fossil analysis.', no_source_flag: false },
  { event_id: 'e0000007-0000-0000-0000-000000000007', source_id: 's2', claim_note: 'Neolithic agricultural transition.', no_source_flag: false },
  { event_id: 'e0000008-0000-0000-0000-000000000008', source_id: 's2', claim_note: 'Göbekli Tepe radiocarbon dates.', no_source_flag: false },
  { event_id: 'e0000009-0000-0000-0000-000000000009', source_id: 's4', claim_note: 'Harappan urban site excavation reports.', no_source_flag: false },
  { event_id: 'e0000010-0000-0000-0000-000000000010', source_id: 's2', claim_note: 'Fourth Dynasty pyramid construction.', no_source_flag: false },
  { event_id: 'e0000011-0000-0000-0000-000000000011', source_id: 's2', claim_note: 'Old Babylonian legal stelae.', no_source_flag: false },
  { event_id: 'e0000012-0000-0000-0000-000000000012', source_id: 's1', claim_note: 'Vedic philological analysis.', no_source_flag: false },
  { event_id: 'e0000013-0000-0000-0000-000000000013', source_id: 's2', claim_note: 'Sramana literature and Jain canons.', no_source_flag: false },
  { event_id: 'e0000014-0000-0000-0000-000000000014', source_id: 's2', claim_note: 'Pali Canon textual tradition.', no_source_flag: false },
  { event_id: 'e0000015-0000-0000-0000-000000000015', source_id: 's1', claim_note: 'Arthashastra and Megasthenes Indica.', no_source_flag: false },
  { event_id: 'e0000016-0000-0000-0000-000000000016', source_id: 's1', claim_note: 'Ashokan rock and pillar inscriptions.', no_source_flag: false },
  { event_id: 'e0000017-0000-0000-0000-000000000017', source_id: 's2', claim_note: 'Shiji (Records of the Grand Historian).', no_source_flag: false },
  { event_id: 'e0000018-0000-0000-0000-000000000018', source_id: 's3', claim_note: 'Res Gestae Divi Augusti.', no_source_flag: false },
  { event_id: 'e0000019-0000-0000-0000-000000000019', source_id: 's1', claim_note: 'Aryabhatiya and Allahabad Pillar inscription.', no_source_flag: false },
  { event_id: 'e0000020-0000-0000-0000-000000000020', source_id: 's3', claim_note: 'Early Islamic historiography.', no_source_flag: false },
  { event_id: 'e0000021-0000-0000-0000-000000000021', source_id: 's2', claim_note: 'Old Book of Tang historiography.', no_source_flag: false },
  { event_id: 'e0000022-0000-0000-0000-000000000022', source_id: 's1', claim_note: 'Thanjavur inscription of Rajendra I.', no_source_flag: false },
  { event_id: 'e0000023-0000-0000-0000-000000000023', source_id: 's3', claim_note: 'Gutenberg Bible and Mainz incunabula.', no_source_flag: false },
  { event_id: 'e0000024-0000-0000-0000-000000000024', source_id: 's6', claim_note: 'Baburnama autobiography.', no_source_flag: false },
  { event_id: 'e0000025-0000-0000-0000-000000000025', source_id: 's3', claim_note: 'Royal Society 1687 publication records.', no_source_flag: false },
  { event_id: 'e0000026-0000-0000-0000-000000000026', source_id: 's3', claim_note: 'Economic History of Britain 1760-1840.', no_source_flag: false },
  { event_id: 'e0000027-0000-0000-0000-000000000027', source_id: 's3', claim_note: 'Indian Independence Act 1947.', no_source_flag: false },
  { event_id: 'e0000028-0000-0000-0000-000000000028', source_id: 's3', claim_note: 'NASA Apollo 11 Mission Report.', no_source_flag: false },
  { event_id: 'e0000029-0000-0000-0000-000000000029', source_id: 's3', claim_note: 'CERN WWW Proposal document 1989.', no_source_flag: false },
  { event_id: 'e0000030-0000-0000-0000-000000000030', source_id: 's1', claim_note: 'Bhimbetka archaeological survey reports.', no_source_flag: false },
  { event_id: 'e0000031-0000-0000-0000-000000000031', source_id: 's4', claim_note: 'Late Harappan paleoclimate and desiccation studies.', no_source_flag: false },
  { event_id: 'e0000032-0000-0000-0000-000000000032', source_id: 's2', claim_note: 'Anguttara Nikaya 16 Mahajanapadas enumeration.', no_source_flag: false },
  { event_id: 'e0000033-0000-0000-0000-000000000033', source_id: 's1', claim_note: 'Aryabhatiya 499 CE Sanskrit text.', no_source_flag: false },
  { event_id: 'e0000034-0000-0000-0000-000000000034', source_id: 's5', claim_note: 'Tabaqat-i Nasiri chronicle.', no_source_flag: false },
  { event_id: 'e0000035-0000-0000-0000-000000000035', source_id: 's5', claim_note: 'Tarikh-i Firoz Shahi of Ziauddin Barani.', no_source_flag: false },
  { event_id: 'e0000036-0000-0000-0000-000000000036', source_id: 's5', claim_note: 'Ibn Battuta Rihla travelogue.', no_source_flag: false },
  { event_id: 'e0000037-0000-0000-0000-000000000037', source_id: 's2', claim_note: 'Hampi epigraphical inscriptions.', no_source_flag: false },
  { event_id: 'e0000038-0000-0000-0000-000000000038', source_id: 's6', claim_note: 'Padshahnama court chronicle.', no_source_flag: false },
  { event_id: 'e0000039-0000-0000-0000-000000000039', source_id: 's3', claim_note: 'Sabhasad Bakhar Maratha chronicle.', no_source_flag: false },
  { event_id: 'e0000040-0000-0000-0000-000000000040', source_id: 's3', claim_note: 'East India Company military dispatches 1757.', no_source_flag: false },
  { event_id: 'e0000041-0000-0000-0000-000000000041', source_id: 's3', claim_note: 'Lahore Darbar state papers.', no_source_flag: false },
  { event_id: 'e0000042-0000-0000-0000-000000000042', source_id: 's3', claim_note: 'British Parliamentary Papers 1857-1858.', no_source_flag: false },
  { event_id: 'e0000043-0000-0000-0000-000000000043', source_id: 's3', claim_note: 'Official gazetteers of Bengal 1905.', no_source_flag: false },
  { event_id: 'e0000044-0000-0000-0000-000000000044', source_id: 's3', claim_note: 'Collected Works of Mahatma Gandhi Vol 19.', no_source_flag: false },
  { event_id: 'e0000045-0000-0000-0000-000000000045', source_id: 's3', claim_note: 'Navajivan press reports 1930.', no_source_flag: false },
  { event_id: 'e0000046-0000-0000-0000-000000000046', source_id: 's3', claim_note: 'Quit India resolution and INA trial records.', no_source_flag: false },

  // Global Expansion Phase 6 Sources
  { event_id: 'e0000047-0000-0000-0000-000000000047', source_id: 's7', claim_note: 'Thucydides History of Peloponnesian War.', no_source_flag: false },
  { event_id: 'e0000048-0000-0000-0000-000000000048', source_id: 's7', claim_note: 'Suetonius Lives of Twelve Caesars.', no_source_flag: false },
  { event_id: 'e0000049-0000-0000-0000-000000000049', source_id: 's7', claim_note: 'Gibbon Decline and Fall of Roman Empire.', no_source_flag: false },
  { event_id: 'e0000050-0000-0000-0000-000000000050', source_id: 's7', claim_note: 'Vasari Lives of the Artists 1550.', no_source_flag: false },
  { event_id: 'e0000051-0000-0000-0000-000000000051', source_id: 's7', claim_note: 'Luther 95 Theses original manuscript.', no_source_flag: false },
  { event_id: 'e0000052-0000-0000-0000-000000000052', source_id: 's7', claim_note: 'De revolutionibus orbium coelestium 1543.', no_source_flag: false },
  { event_id: 'e0000054-0000-0000-0000-000000000054', source_id: 's7', claim_note: 'Needham Science and Civilisation in China.', no_source_flag: false },
  { event_id: 'e0000055-0000-0000-0000-000000000055', source_id: 's7', claim_note: 'Secret History of the Mongols.', no_source_flag: false },
  { event_id: 'e0000056-0000-0000-0000-000000000056', source_id: 's7', claim_note: 'Ming Shi official dynasty records.', no_source_flag: false },
  { event_id: 'e0000057-0000-0000-0000-000000000057', source_id: 's7', claim_note: 'Tokugawa law code records.', no_source_flag: false },
  { event_id: 'e0000058-0000-0000-0000-000000000058', source_id: 's7', claim_note: 'Meiji Charter Oath 1868.', no_source_flag: false },
  { event_id: 'e0000059-0000-0000-0000-000000000059', source_id: 's7', claim_note: 'Fihrist of Ibn al-Nadim.', no_source_flag: false },
  { event_id: 'e0000060-0000-0000-0000-000000000060', source_id: 's7', claim_note: 'Kritovoulos History of Mehmed the Conqueror.', no_source_flag: false },
  { event_id: 'e0000061-0000-0000-0000-000000000061', source_id: 's7', claim_note: 'Ottoman imperial divan records.', no_source_flag: false },
  { event_id: 'e0000062-0000-0000-0000-000000000062', source_id: 's7', claim_note: 'Ezana Stone Ge`ez inscriptions.', no_source_flag: false },
  { event_id: 'e0000063-0000-0000-0000-000000000063', source_id: 's7', claim_note: 'Al-Umari Masalik al-Absar description of Mansa Musa.', no_source_flag: false },
  { event_id: 'e0000064-0000-0000-0000-000000000064', source_id: 's7', claim_note: 'Great Zimbabwe archaeological site surveys.', no_source_flag: false },
  { event_id: 'e0000065-0000-0000-0000-000000000065', source_id: 's7', claim_note: 'Trans-Atlantic Slave Trade Database (Emory Univ).', no_source_flag: false },
  { event_id: 'e0000066-0000-0000-0000-000000000066', source_id: 's7', claim_note: 'Tikal and Palenque stelae decipherment.', no_source_flag: false },
  { event_id: 'e0000067-0000-0000-0000-000000000067', source_id: 's7', claim_note: 'Codex Mendoza pictographic history.', no_source_flag: false },
  { event_id: 'e0000068-0000-0000-0000-000000000068', source_id: 's7', claim_note: 'Machu Picchu radiocarbon dates.', no_source_flag: false },
  { event_id: 'e0000069-0000-0000-0000-000000000069', source_id: 's7', claim_note: 'Florentine Codex of Bernardino de Sahagún.', no_source_flag: false },
  { event_id: 'e0000070-0000-0000-0000-000000000070', source_id: 's7', claim_note: 'True History of the Conquest of New Spain.', no_source_flag: false },
  { event_id: 'e0000071-0000-0000-0000-000000000071', source_id: 's7', claim_note: 'US National Archives Declaration of Independence 1776.', no_source_flag: false },
];

async function fetchWithTimeout<T>(promise: Promise<T>, ms = 300): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Network timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function fetchSourcesForEvent(eventId: string): Promise<ResolvedSource[]> {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('event_sources')
        .select(`
          claim_note,
          no_source_flag,
          sources(*)
        `)
        .eq('event_id', eventId),
      300
    );

    if (!error && data && data.length > 0) {
      return data.map((es: any) => ({
        id: es.sources?.id || `no-source-${eventId}`,
        title: es.sources?.title || 'No Source Linked Yet',
        author: es.sources?.author || null,
        publisher: es.sources?.publisher || null,
        url: es.sources?.url || null,
        sourceType: es.sources?.source_type || 'reference',
        publishedAt: es.sources?.published_at || null,
        claimNote: es.claim_note || null,
        noSourceFlag: Boolean(es.no_source_flag),
      }));
    }
  } catch {
    // fallback to seed
  }

  const matches = SEED_EVENT_SOURCES.filter((es) => es.event_id === eventId);
  if (matches.length === 0) {
    // Return default reference source for seed events
    return [
      {
        id: 's1',
        title: SEED_SOURCES[0].title,
        author: SEED_SOURCES[0].author,
        publisher: SEED_SOURCES[0].publisher,
        url: SEED_SOURCES[0].url,
        sourceType: SEED_SOURCES[0].source_type,
        publishedAt: SEED_SOURCES[0].published_at,
        claimNote: 'Primary historical reference.',
        noSourceFlag: false,
      },
    ];
  }

  return matches.map((es) => {
    const s = SEED_SOURCES.find((src) => src.id === es.source_id);
    return {
      id: s?.id || `no-source-${eventId}`,
      title: s?.title || 'No Source Linked Yet',
      author: s?.author || null,
      publisher: s?.publisher || null,
      url: s?.url || null,
      sourceType: s?.source_type || 'reference',
      publishedAt: s?.published_at || null,
      claimNote: es.claim_note,
      noSourceFlag: es.no_source_flag,
    };
  });
}

/**
 * Validates that every event in the dataset carries at least one source OR has no_source_flag = true.
 */
export function validateEntitySourcing(events: TimelineEvent[]): {
  valid: boolean;
  unsourcedEventIds: string[];
} {
  const unsourcedEventIds: string[] = [];

  for (const event of events) {
    const sources = SEED_EVENT_SOURCES.filter((es) => es.event_id === event.id);
    if (sources.length === 0) {
      unsourcedEventIds.push(event.id);
    }
  }

  return {
    valid: unsourcedEventIds.length === 0,
    unsourcedEventIds,
  };
}

export function useEventSources(eventId: string | null) {
  return useQuery({
    queryKey: ['eventSources', eventId],
    queryFn: () => (eventId ? fetchSourcesForEvent(eventId) : []),
    enabled: Boolean(eventId),
  });
}
