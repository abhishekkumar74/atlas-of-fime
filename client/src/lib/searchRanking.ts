import type { TimelineEvent } from './types/database.types';
import { formatYearsBP } from './dateEngine';

export interface SearchResult {
  event: TimelineEvent;
  score: number;
  matchedField: 'title-prefix' | 'title-contains' | 'year' | 'text';
}

export function rankSearchEvents(
  events: TimelineEvent[],
  rawQuery: string,
  limit = 6
): SearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const results: SearchResult[] = [];

  for (const event of events) {
    const title = event.title.toLowerCase();
    const summary = event.summary.toLowerCase();
    const category = event.category.toLowerCase();
    const yearStr = String(event.date.year_start).toLowerCase();
    const formattedDate = formatYearsBP(
      event.date.years_before_present,
      event.date.calendar,
      event.date.year_start
    ).toLowerCase();

    if (title.startsWith(query)) {
      results.push({ event, score: 1, matchedField: 'title-prefix' });
    } else if (title.includes(query)) {
      results.push({ event, score: 2, matchedField: 'title-contains' });
    } else if (yearStr.includes(query) || formattedDate.includes(query)) {
      results.push({ event, score: 3, matchedField: 'year' });
    } else if (summary.includes(query) || category.includes(query)) {
      results.push({ event, score: 4, matchedField: 'text' });
    }
  }

  results.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.event.title.localeCompare(b.event.title);
  });

  return results.slice(0, limit);
}
