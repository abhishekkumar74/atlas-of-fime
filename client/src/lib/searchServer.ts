import { supabase } from './supabase';
import type { UnifiedSearchResult } from './types/database.types';
import { MOCK_SEED_EVENTS } from './queries/events';
import { SEED_PEOPLE } from './queries/relationships';
import { SEED_CIVILIZATIONS } from './queries/map';
import { formatYearsBP } from './dateEngine';

async function fetchWithTimeout<T>(promise: Promise<T>, ms = 250): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Network timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export function parseNumericYearQuery(query: string): number | null {
  const cleaned = query.trim().toLowerCase();

  // Match "66000000" or "66 million"
  if (cleaned.includes('million')) {
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return num * 1_000_000 + 2026;
  }
  if (cleaned.includes('billion')) {
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return num * 1_000_000_000 + 2026;
  }

  // Match "250 bce"
  if (cleaned.includes('bce')) {
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return num + 2026;
  }

  // Match "1526" or "1947"
  const val = parseInt(cleaned, 10);
  if (!isNaN(val) && String(val) === cleaned) {
    if (val <= 2026 && val > -10000) {
      return 2026 - val;
    }
  }

  return null;
}

export async function searchEntitiesServer(
  rawQuery: string,
  limit = 6
): Promise<UnifiedSearchResult[]> {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  // 1. Check for numeric year jump fallback
  const targetYearsBP = parseNumericYearQuery(query);

  if (targetYearsBP !== null) {
    // Sort events by proximity to targetYearsBP
    const sortedEvents = [...MOCK_SEED_EVENTS].sort(
      (a, b) =>
        Math.abs(a.date.years_before_present - targetYearsBP) -
        Math.abs(b.date.years_before_present - targetYearsBP)
    );

    return sortedEvents.slice(0, limit).map((e) => ({
      id: e.id,
      entityType: 'event',
      title: e.title,
      slug: e.slug,
      summary: e.summary,
      year: formatYearsBP(
        e.date.years_before_present,
        e.date.calendar,
        e.date.year_start
      ),
      yearsBP: e.date.years_before_present,
      matchedField: 'year',
      score: 3,
      targetUrl: `/history/${e.slug}`,
    }));
  }

  // 2. Try Supabase FTS RPC function
  try {
    const { data, error } = await fetchWithTimeout(
      supabase.rpc('search_entities', { query_text: query, max_limit: limit }),
      250
    );

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        entityType: item.entity_type,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        matchedField: item.rank > 0.3 ? 'title-prefix' : 'text',
        score: item.rank,
        targetUrl:
          item.entity_type === 'person'
            ? `/history/people/${item.slug}`
            : `/history/${item.slug}`,
      }));
    }
  } catch {
    // Fallback to local weighted matching engine
  }

  // 3. Fallback Weighted Local Entity Search Engine
  const results: UnifiedSearchResult[] = [];

  // Search Events
  for (const event of MOCK_SEED_EVENTS) {
    const title = event.title.toLowerCase();
    const summary = event.summary.toLowerCase();
    const yearStr = String(event.date.year_start).toLowerCase();

    let score = 0;
    let matchedField: UnifiedSearchResult['matchedField'] = 'text';

    if (title.startsWith(query)) {
      score = 1;
      matchedField = 'title-prefix';
    } else if (title.includes(query)) {
      score = 2;
      matchedField = 'title-contains';
    } else if (yearStr.includes(query)) {
      score = 3;
      matchedField = 'year';
    } else if (summary.includes(query)) {
      score = 4;
      matchedField = 'text';
    }

    if (score > 0) {
      results.push({
        id: event.id,
        entityType: 'event',
        title: event.title,
        slug: event.slug,
        summary: event.summary,
        year: formatYearsBP(
          event.date.years_before_present,
          event.date.calendar,
          event.date.year_start
        ),
        yearsBP: event.date.years_before_present,
        matchedField,
        score,
        targetUrl: `/history/${event.slug}`,
      });
    }
  }

  // Search People
  for (const person of SEED_PEOPLE) {
    const name = person.name.toLowerCase();
    const summary = person.summary.toLowerCase();
    const altNames = person.alt_names.map((n) => n.toLowerCase());

    let score = 0;
    let matchedField: UnifiedSearchResult['matchedField'] = 'text';

    if (name.startsWith(query) || altNames.some((n) => n.startsWith(query))) {
      score = 1;
      matchedField = 'title-prefix';
    } else if (name.includes(query) || altNames.some((n) => n.includes(query))) {
      score = 2;
      matchedField = 'title-contains';
    } else if (summary.includes(query)) {
      score = 4;
      matchedField = 'text';
    }

    if (score > 0) {
      results.push({
        id: person.id,
        entityType: 'person',
        title: person.name,
        slug: person.slug,
        summary: person.summary,
        matchedField,
        score,
        targetUrl: `/history/people/${person.slug}`,
      });
    }
  }

  // Search Civilizations
  for (const civ of SEED_CIVILIZATIONS) {
    const name = civ.name.toLowerCase();
    const summary = civ.summary.toLowerCase();

    let score = 0;
    let matchedField: UnifiedSearchResult['matchedField'] = 'text';

    if (name.startsWith(query)) {
      score = 1;
      matchedField = 'title-prefix';
    } else if (name.includes(query)) {
      score = 2;
      matchedField = 'title-contains';
    } else if (summary.includes(query)) {
      score = 4;
      matchedField = 'text';
    }

    if (score > 0) {
      results.push({
        id: civ.id,
        entityType: 'civilization',
        title: civ.name,
        slug: civ.id,
        summary: civ.summary,
        matchedField,
        score,
        targetUrl: `/`,
      });
    }
  }

  // Sort by score ascending (1 = title prefix, 2 = title contains, 3 = year, 4 = text)
  results.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.title.localeCompare(b.title);
  });

  return results.slice(0, limit);
}
