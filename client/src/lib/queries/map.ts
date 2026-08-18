import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type {
  RegionRecord,
  CivilizationRecord,
  TerritoryRecord,
  MapPinState,
} from '../types/database.types';

export const SEED_REGIONS: RegionRecord[] = [
  { id: 'r1', key: 'india', label: 'Indian Subcontinent', x: 730, y: 240, lng: 78.9629, lat: 20.5937 },
  { id: 'r2', key: 'mediterranean', label: 'Mediterranean Basin', x: 510, y: 180, lng: 15.2551, lat: 38.526 },
  { id: 'r3', key: 'middle-east', label: 'Fertile Crescent & Middle East', x: 580, y: 200, lng: 42.5, lat: 29.3 },
  { id: 'r4', key: 'europe', label: 'European Continent', x: 500, y: 140, lng: 15.2551, lat: 54.526 },
  { id: 'r5', key: 'east-asia', label: 'East Asia', x: 820, y: 190, lng: 104.1954, lat: 35.8617 },
  { id: 'r6', key: 'africa', label: 'African Continent', x: 520, y: 270, lng: 21.7587, lat: -4.0383 },
  { id: 'r7', key: 'americas', label: 'The Americas', x: 250, y: 200, lng: -75.0152, lat: -9.19 },
  { id: 'r8', key: 'central-asia', label: 'Central Asian Steppe', x: 660, y: 160, lng: 66.0, lat: 45.0 },
  { id: 'r9', key: 'australia', label: 'Australia & Oceania', x: 860, y: 360, lng: 133.7751, lat: -25.2744 },
  { id: 'r10', key: 'global', label: 'Global / Planetary Scale', x: 500, y: 420, lng: 0, lat: 20 },
];

export const SEED_CIVILIZATIONS: CivilizationRecord[] = [
  {
    id: 'c1',
    name: 'Indus Valley Civilization',
    kind: 'civilization',
    summary: 'Harappan Bronze Age civilization in the Indus basin.',
    status: 'published',
  },
  {
    id: 'c2',
    name: 'Mauryan Empire',
    kind: 'empire',
    summary: 'Pan-Indian Iron Age empire founded by Chandragupta Maurya.',
    status: 'published',
  },
  {
    id: 'c3',
    name: 'Roman Empire',
    kind: 'empire',
    summary: 'Post-Republican imperial state encompassing the Mediterranean basin.',
    status: 'published',
  },
  {
    id: 'c4',
    name: 'Qin Dynasty',
    kind: 'dynasty',
    summary: 'First imperial Chinese dynasty that unified the Warring States.',
    status: 'published',
  },
  {
    id: 'c5',
    name: 'Mughal Empire',
    kind: 'empire',
    summary: 'Early modern empire synthesizing Indo-Persian culture across South Asia.',
    status: 'published',
  },
];

export const SEED_TERRITORIES: TerritoryRecord[] = [
  {
    id: 't1',
    civilization_id: 'c1',
    region_id: 'r1',
    start_year: -3300,
    end_year: -1300,
    region_note: 'Indus basin and Ghaggar-Hakra floodplain',
    uncertainty_note:
      'Harappan territorial extents estimated from urban site distributions; exact political borders remain unrecorded in writing.',
  },
  {
    id: 't2',
    civilization_id: 'c2',
    region_id: 'r1',
    start_year: -322,
    end_year: -185,
    region_note: 'Subcontinental India from Afghanistan to Bengal',
    uncertainty_note:
      'Southernmost boundary near Tamilakam subject to scholarly debate; edict locations serve as primary spatial markers.',
  },
  {
    id: 't3',
    civilization_id: 'c3',
    region_id: 'r2',
    start_year: -27,
    end_year: 476,
    region_note: 'Mediterranean periphery, Gaul, Hispania, Britannia, and Levant',
    uncertainty_note:
      'Frontiers (limes) fluctuated in Northern Europe and Mesopotamia across centuries.',
  },
  {
    id: 't4',
    civilization_id: 'c4',
    region_id: 'r5',
    start_year: -221,
    end_year: -206,
    region_note: 'Central and Eastern China along Yellow and Yangtze rivers',
    uncertainty_note:
      'Great Wall demarcated northern defense line; southern boundary in Lingnan territory was fluid.',
  },
  {
    id: 't5',
    civilization_id: 'c5',
    region_id: 'r1',
    start_year: 1526,
    end_year: 1857,
    region_note: 'Indo-Gangetic plain and Deccan plateau',
    uncertainty_note:
      'Deccan conquest under Aurangzeb was incomplete and resisted by Maratha Confederacy.',
  },
];

export const SEED_EVENT_TERRITORIES: Record<string, { primaryRegionKey: string; secondaryRegionKeys?: string[]; territoryId?: string }> = {
  'e0000001-0000-0000-0000-000000000001': { primaryRegionKey: 'global' }, // Big Bang
  'e0000002-0000-0000-0000-000000000002': { primaryRegionKey: 'global' }, // Earth
  'e0000003-0000-0000-0000-000000000003': { primaryRegionKey: 'global' }, // First Life
  'e0000006-0000-0000-0000-000000000006': { primaryRegionKey: 'africa' }, // Homo Sapiens
  'e0000007-0000-0000-0000-000000000007': { primaryRegionKey: 'middle-east', secondaryRegionKeys: ['india', 'east-asia'] }, // Agriculture
  'e0000008-0000-0000-0000-000000000008': { primaryRegionKey: 'middle-east' }, // Gobekli Tepe
  'e0000009-0000-0000-0000-000000000009': { primaryRegionKey: 'india', territoryId: 't1' }, // Indus Valley
  'e0000010-0000-0000-0000-000000000010': { primaryRegionKey: 'africa', secondaryRegionKeys: ['middle-east'] }, // Pyramid
  'e0000012-0000-0000-0000-000000000012': { primaryRegionKey: 'india' }, // Vedic
  'e0000013-0000-0000-0000-000000000013': { primaryRegionKey: 'india' }, // Mahavira
  'e0000014-0000-0000-0000-000000000014': { primaryRegionKey: 'india' }, // Buddha
  'e0000015-0000-0000-0000-000000000015': { primaryRegionKey: 'india', territoryId: 't2' }, // Mauryan
  'e0000016-0000-0000-0000-000000000016': { primaryRegionKey: 'india', territoryId: 't2' }, // Ashoka Edicts
  'e0000017-0000-0000-0000-000000000017': { primaryRegionKey: 'east-asia', territoryId: 't4' }, // Qin
  'e0000018-0000-0000-0000-000000000018': { primaryRegionKey: 'mediterranean', secondaryRegionKeys: ['europe', 'middle-east'], territoryId: 't3' }, // Roman
  'e0000019-0000-0000-0000-000000000019': { primaryRegionKey: 'india' }, // Gupta
  'e0000020-0000-0000-0000-000000000020': { primaryRegionKey: 'middle-east' }, // Islam
  'e0000021-0000-0000-0000-000000000021': { primaryRegionKey: 'east-asia' }, // Tang
  'e0000022-0000-0000-0000-000000000022': { primaryRegionKey: 'india', secondaryRegionKeys: ['east-asia'] }, // Chola
  'e0000023-0000-0000-0000-000000000023': { primaryRegionKey: 'europe' }, // Gutenberg
  'e0000024-0000-0000-0000-000000000024': { primaryRegionKey: 'india', territoryId: 't5' }, // Mughal
  'e0000025-0000-0000-0000-000000000025': { primaryRegionKey: 'europe' }, // Newton
  'e0000026-0000-0000-0000-000000000026': { primaryRegionKey: 'europe', secondaryRegionKeys: ['americas'] }, // Industrial
  'e0000027-0000-0000-0000-000000000027': { primaryRegionKey: 'india' }, // Indian Independence
  'e0000028-0000-0000-0000-000000000028': { primaryRegionKey: 'americas', secondaryRegionKeys: ['global'] }, // Apollo 11
  'e0000029-0000-0000-0000-000000000029': { primaryRegionKey: 'europe', secondaryRegionKeys: ['global'] }, // WWW
};

async function fetchWithTimeout<T>(promise: Promise<T>, ms = 300): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Network timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function fetchRegions(): Promise<RegionRecord[]> {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase.from('regions').select('*'),
      300
    );
    if (!error && data && data.length > 0) {
      return data as RegionRecord[];
    }
  } catch {
    // fallback
  }
  return SEED_REGIONS;
}

export async function fetchMapStateForEvent(eventId: string): Promise<MapPinState> {
  const globalRegion = SEED_REGIONS.find((r) => r.key === 'global') || SEED_REGIONS[0];
  const mapping = SEED_EVENT_TERRITORIES[eventId];

  if (!mapping) {
    return {
      primaryRegion: globalRegion,
      secondaryRegions: [],
      civilization: null,
      territory: null,
      uncertaintyNote: 'Global / unlocalized event framework.',
    };
  }

  const primaryRegion =
    SEED_REGIONS.find((r) => r.key === mapping.primaryRegionKey) || globalRegion;

  const secondaryRegions = (mapping.secondaryRegionKeys || [])
    .map((k) => SEED_REGIONS.find((r) => r.key === k))
    .filter(Boolean) as RegionRecord[];

  let territory: TerritoryRecord | null = null;
  let civilization: CivilizationRecord | null = null;

  if (mapping.territoryId) {
    territory = SEED_TERRITORIES.find((t) => t.id === mapping.territoryId) || null;
    if (territory) {
      civilization =
        SEED_CIVILIZATIONS.find((c) => c.id === territory?.civilization_id) || null;
    }
  }

  return {
    primaryRegion,
    secondaryRegions,
    civilization,
    territory,
    uncertaintyNote:
      territory?.uncertainty_note ||
      `${primaryRegion.label} spatial scope estimated from primary historical records.`,
  };
}

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegions,
    initialData: SEED_REGIONS,
  });
}

export function useEventMapState(eventId: string | null) {
  return useQuery({
    queryKey: ['eventMapState', eventId],
    queryFn: () => (eventId ? fetchMapStateForEvent(eventId) : null),
    enabled: Boolean(eventId),
  });
}
