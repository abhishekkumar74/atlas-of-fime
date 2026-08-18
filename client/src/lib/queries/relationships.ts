import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type {
  PersonRecord,
  EntityRelationshipRecord,
  ResolvedConnection,
  EntityType,
} from '../types/database.types';
import { MOCK_SEED_EVENTS } from './events';

export const SEED_PEOPLE: PersonRecord[] = [
  {
    id: 'p0000001-0000-0000-0000-000000000001',
    name: 'Chandragupta Maurya',
    slug: 'chandragupta-maurya',
    alt_names: ['Chandragupta', 'Sandrokottos'],
    birth_event_id: null,
    death_event_id: null,
    summary:
      'Founder of the Mauryan Empire who unified central and northern India under a centralized administration.',
    body:
      'Guided by his chief advisor Chanakya (Kautilya), Chandragupta defeated the Nanda Dynasty and established imperial governance from Pataliputra.',
    status: 'published',
  },
  {
    id: 'p0000002-0000-0000-0000-000000000002',
    name: 'Ashoka the Great',
    slug: 'ashoka',
    alt_names: ['Ashoka Maurya', 'Devanampriya Priyadarsin'],
    birth_event_id: null,
    death_event_id: null,
    summary:
      'Third Mauryan Emperor who embraced and propagated Buddhist Dhamma across South Asia after the Kalinga War.',
    body:
      'Renowned for erecting rock and pillar edicts promoting non-violence, religious tolerance, and social welfare throughout his vast empire.',
    status: 'published',
  },
  {
    id: 'p0000003-0000-0000-0000-000000000003',
    name: 'Siddhartha Gautama (Buddha)',
    slug: 'buddha',
    alt_names: ['Shakyamuni', 'Gautama Buddha'],
    birth_event_id: null,
    death_event_id: null,
    summary:
      'Spiritual teacher and philosopher whose insights formed the foundations of Buddhism.',
    body:
      'Renounced royal privilege in Kapilavastu, attained Enlightenment under the Bodhi tree in Bodh Gaya, and spent decades teaching the Middle Way across Magadha.',
    status: 'published',
  },
  {
    id: 'p0000004-0000-0000-0000-000000000004',
    name: 'Vardhamana Mahavira',
    slug: 'mahavira',
    alt_names: ['Sanmati', 'Vira'],
    birth_event_id: null,
    death_event_id: null,
    summary:
      '24th Tirthankara of Jainism who codified ascetic vows and Ahimsa philosophy.',
    body:
      'Contemporary of Gautama Buddha in ancient Bihar who revitalized Jain philosophy, emphasizing non-possession and respect for all living beings.',
    status: 'published',
  },
  {
    id: 'p0000005-0000-0000-0000-000000000005',
    name: 'Zahir al-Din Muhammad Babur',
    slug: 'babur',
    alt_names: ['Babur Padshah'],
    birth_event_id: null,
    death_event_id: null,
    summary: 'Central Asian conqueror and founder of the Mughal Dynasty in India.',
    body:
      'Descendant of Timur and Genghis Khan who won the Battle of Panipat in 1526, introducing gunpowder warfare and Persian literary culture to northern India.',
    status: 'published',
  },
  {
    id: 'p0000006-0000-0000-0000-000000000006',
    name: 'Sir Isaac Newton',
    slug: 'isaac-newton',
    alt_names: ['Newton'],
    birth_event_id: null,
    death_event_id: null,
    summary:
      'English mathematician, physicist, and astronomer who formulated laws of motion and universal gravitation.',
    body:
      'Author of Philosophiae Naturalis Principia Mathematica, whose mechanical framework dominated scientific thought for over two centuries.',
    status: 'published',
  },
  {
    id: 'p0000007-0000-0000-0000-000000000007',
    name: 'Sir Tim Berners-Lee',
    slug: 'tim-berners-lee',
    alt_names: ['TimBL'],
    birth_event_id: null,
    death_event_id: null,
    summary: 'English computer scientist who invented the World Wide Web in 1989.',
    body:
      'Formulated HTTP, HTML, URL standards, and the first web browser while working as a software engineer at CERN.',
    status: 'published',
  },
  {
    id: 'p0000008-0000-0000-0000-000000000008',
    name: 'Mahatma Gandhi',
    slug: 'mahatma-gandhi',
    alt_names: ['Mohandas Karamchand Gandhi', 'Bapu'],
    birth_event_id: null,
    death_event_id: null,
    summary:
      'Leader of the Indian independence movement who pioneered non-violent civil disobedience (Satyagraha).',
    body:
      'Led mass campaigns including the Salt March and Quit India Movement, inspiring civil rights movements globally.',
    status: 'published',
  },
  {
    id: 'p0000017-0000-0000-0000-000000000017',
    name: 'Julius Caesar',
    slug: 'julius-caesar',
    alt_names: ['Gaius Julius Caesar'],
    birth_event_id: null,
    death_event_id: null,
    summary: 'Roman general and statesman whose dictatorship precipitated the demise of the Roman Republic.',
    body: 'Conquered Gaul and expanded Roman territory to the North Sea before his assassination on the Ides of March.',
    status: 'published',
  },
  {
    id: 'p0000018-0000-0000-0000-000000000018',
    name: 'Mansa Musa',
    slug: 'mansa-musa',
    alt_names: ['Musa I of Mali'],
    birth_event_id: null,
    death_event_id: null,
    summary: 'Tenth Mansa of the Mali Empire whose 1324 pilgrimage to Mecca highlighted West African wealth.',
    body: 'Patronized Islamic scholarship in Timbuktu and constructed the Djinguereber Mosque.',
    status: 'published',
  },
  {
    id: 'p0000019-0000-0000-0000-000000000019',
    name: 'Martin Luther',
    slug: 'martin-luther',
    alt_names: ['Luther'],
    birth_event_id: null,
    death_event_id: null,
    summary: 'German theologian and augustinian monk who initiated the Protestant Reformation.',
    body: 'Authored the Ninety-five Theses in 1517 challenging papal indulgences and translating the Bible into vernacular German.',
    status: 'published',
  },
  {
    id: 'p0000020-0000-0000-0000-000000000020',
    name: 'Genghis Khan',
    slug: 'genghis-khan',
    alt_names: ['Temüjin'],
    birth_event_id: null,
    death_event_id: null,
    summary: 'Founder and Khagan of the Mongol Empire.',
    body: 'Unified the Mongolic tribes and launched transcontinental conquests creating the largest contiguous land empire.',
    status: 'published',
  },
  {
    id: 'p0000021-0000-0000-0000-000000000021',
    name: 'Suleiman the Magnificent',
    slug: 'suleiman-the-magnificent',
    alt_names: ['Suleiman I', 'Kanuni'],
    birth_event_id: null,
    death_event_id: null,
    summary: 'Tenth Sultan of the Ottoman Empire who presided over its golden age.',
    body: 'Expanded territory across Southeast Europe, North Africa, and the Mediterranean while codifying Ottoman legal law.',
    status: 'published',
  },
  {
    id: 'p0000022-0000-0000-0000-000000000022',
    name: 'Moctezuma II',
    slug: 'moctezuma-ii',
    alt_names: ['Motecuhzoma Xocoyotzin'],
    birth_event_id: null,
    death_event_id: null,
    summary: 'Ninth Tlatoani of Tenochtitlan during the Spanish conquest of the Aztec Empire.',
    body: 'Governed during initial contact with Hernán Cortés before the fall of Tenochtitlan.',
    status: 'published',
  },
  {
    id: 'p0000023-0000-0000-0000-000000000023',
    name: 'Atahualpa',
    slug: 'atahualpa',
    alt_names: ['Atawallpa'],
    birth_event_id: null,
    death_event_id: null,
    summary: 'Last Sapa Inca of the Inca Empire before Spanish conquest.',
    body: 'Captured by Francisco Pizarro at the Battle of Cajamarca in 1532 despite offering a room filled with gold ransom.',
    status: 'published',
  },
];

export const SEED_RELATIONSHIPS: EntityRelationshipRecord[] = [
  // India & Ancient Base
  { id: 'r1', from_type: 'person', from_id: 'p0000001-0000-0000-0000-000000000001', to_type: 'event', to_id: 'e0000015-0000-0000-0000-000000000015', relationship: 'founded', note: 'Chandragupta Maurya established Mauryan Empire.' },
  { id: 'r2', from_type: 'person', from_id: 'p0000002-0000-0000-0000-000000000002', to_type: 'event', to_id: 'e0000015-0000-0000-0000-000000000015', relationship: 'ruled', note: 'Ashoka ruled Mauryan Empire at peak.' },

  // Lateral Cross-Region Links (Phase 6 Requirement)
  { id: 'r40', from_type: 'person', from_id: 'p0000017-0000-0000-0000-000000000017', to_type: 'event', to_id: 'e0000048-0000-0000-0000-000000000048', relationship: 'participated_in', note: 'Julius Caesar assassinated in Senate.' },
  { id: 'r41', from_type: 'event', from_id: 'e0000048-0000-0000-0000-000000000048', to_type: 'event', to_id: 'e0000018-0000-0000-0000-000000000018', relationship: 'caused', note: 'Caesar assassination caused rise of Roman Empire.' },
  { id: 'r42', from_type: 'event', from_id: 'e0000018-0000-0000-0000-000000000018', to_type: 'event', to_id: 'e0000049-0000-0000-0000-000000000049', relationship: 'followed', note: 'Fall of West Rome followed Roman imperial era.' },
  { id: 'r43', from_type: 'event', from_id: 'e0000060-0000-0000-0000-000000000060', to_type: 'event', to_id: 'e0000050-0000-0000-0000-000000000050', relationship: 'influenced', note: 'Byzantine scholars fleeing Constantinople accelerated Italian Renaissance.' },
  { id: 'r44', from_type: 'event', from_id: 'e0000023-0000-0000-0000-000000000023', to_type: 'event', to_id: 'e0000051-0000-0000-0000-000000000051', relationship: 'caused', note: 'Printing press enabled rapid dissemination of Luther Reformation theses.' },
  { id: 'r45', from_type: 'person', from_id: 'p0000019-0000-0000-0000-000000000019', to_type: 'event', to_id: 'e0000051-0000-0000-0000-000000000051', relationship: 'founded', note: 'Martin Luther sparked Protestant Reformation.' },
  { id: 'r46', from_type: 'person', from_id: 'p0000020-0000-0000-0000-000000000020', to_type: 'event', to_id: 'e0000055-0000-0000-0000-000000000055', relationship: 'founded', note: 'Genghis Khan unified Mongol Empire.' },
  { id: 'r47', from_type: 'event', from_id: 'e0000055-0000-0000-0000-000000000055', to_type: 'event', to_id: 'e0000059-0000-0000-0000-000000000059', relationship: 'conquered', note: 'Mongol siege of Baghdad ended Abbasid Caliphate.' },
  { id: 'r48', from_type: 'person', from_id: 'p0000018-0000-0000-0000-000000000018', to_type: 'event', to_id: 'e0000063-0000-0000-0000-000000000063', relationship: 'ruled', note: 'Mansa Musa ruled Mali Empire.' },
  { id: 'r49', from_type: 'event', from_id: 'e0000065-0000-0000-0000-000000000065', to_type: 'event', to_id: 'e0000069-0000-0000-0000-000000000069', relationship: 'influenced', note: 'Spanish conquest of Americas drove demand for enslaved Atlantic labor.' },
  { id: 'r50', from_type: 'person', from_id: 'p0000022-0000-0000-0000-000000000022', to_type: 'event', to_id: 'e0000069-0000-0000-0000-000000000069', relationship: 'ruled', note: 'Moctezuma II ruled Aztec Empire during Spanish arrival.' },
  { id: 'r51', from_type: 'person', from_id: 'p0000023-0000-0000-0000-000000000023', to_type: 'event', to_id: 'e0000070-0000-0000-0000-000000000070', relationship: 'ruled', note: 'Atahualpa ruled Inca Empire during Pizarro conquest.' },
  { id: 'r52', from_type: 'event', from_id: 'e0000071-0000-0000-0000-000000000071', to_type: 'event', to_id: 'e0000040-0000-0000-0000-000000000040', relationship: 'influenced', note: 'Seven Years War costs sparked both American Revolution and EIC Plassey expansion.' },
];

export function resolveEntityDetails(
  targetType: EntityType,
  targetId: string
): { title: string; slug: string; year?: string; yearsBP?: number } {
  if (targetType === 'event') {
    const event = MOCK_SEED_EVENTS.find((e) => e.id === targetId);
    if (event) {
      return {
        title: event.title,
        slug: event.slug,
        year: String(event.date.year_start),
        yearsBP: event.date.years_before_present,
      };
    }
  } else if (targetType === 'person') {
    const person = SEED_PEOPLE.find((p) => p.id === targetId);
    if (person) {
      return {
        title: person.name,
        slug: person.slug,
      };
    }
  }
  return { title: 'Unknown Target', slug: '' };
}

async function fetchWithTimeout<T>(promise: Promise<T>, ms = 300): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Network timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function fetchRelationshipsForEntity(
  entityType: EntityType,
  entityId: string
): Promise<ResolvedConnection[]> {
  let rawList: EntityRelationshipRecord[] = SEED_RELATIONSHIPS;

  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('entity_relationships')
        .select('*')
        .or(
          `and(from_type.eq.${entityType},from_id.eq.${entityId}),and(to_type.eq.${entityType},to_id.eq.${entityId})`
        ),
      300
    );

    if (!error && data && data.length > 0) {
      rawList = data as EntityRelationshipRecord[];
    }
  } catch {
    // fallback to seed relationships
  }

  const matched = rawList.filter(
    (r) =>
      (r.from_type === entityType && r.from_id === entityId) ||
      (r.to_type === entityType && r.to_id === entityId)
  );

  return matched.map((r) => {
    const isOutgoing = r.from_type === entityType && r.from_id === entityId;
    const targetType = isOutgoing ? r.to_type : r.from_type;
    const targetId = isOutgoing ? r.to_id : r.from_id;

    const info = resolveEntityDetails(targetType, targetId);

    return {
      id: r.id,
      direction: isOutgoing ? 'outgoing' : 'incoming',
      relationship: r.relationship,
      targetType,
      targetId,
      targetTitle: info.title,
      targetSlug: info.slug,
      targetYear: info.year,
      targetYearsBP: info.yearsBP,
      note: r.note,
    };
  });
}

export async function fetchPersonBySlug(slug: string): Promise<PersonRecord | null> {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('people')
        .select('*')
        .eq('slug', slug)
        .single(),
      300
    );

    if (!error && data) {
      return data as PersonRecord;
    }
  } catch {
    // fallback to seed
  }

  return SEED_PEOPLE.find((p) => p.slug === slug) || null;
}

export function useEntityRelationships(entityType: EntityType, entityId: string) {
  return useQuery({
    queryKey: ['relationships', entityType, entityId],
    queryFn: () => fetchRelationshipsForEntity(entityType, entityId),
    enabled: Boolean(entityId),
  });
}

export function usePerson(slug: string) {
  return useQuery({
    queryKey: ['person', slug],
    queryFn: () => fetchPersonBySlug(slug),
    enabled: Boolean(slug),
  });
}
