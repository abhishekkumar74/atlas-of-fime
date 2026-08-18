import { describe, it, expect } from 'vitest';
import { fetchSourcesForEvent, validateEntitySourcing } from './sources';
import { MOCK_SEED_EVENTS } from './events';
import type { TimelineEvent } from '../types/database.types';

describe('sources query & enforcement module', () => {
  it('fetches sources for Indus Valley Civilization event', async () => {
    const indusEventId = 'e0000009-0000-0000-0000-000000000009';
    const sources = await fetchSourcesForEvent(indusEventId);

    expect(sources.length).toBeGreaterThan(0);
    expect(sources[0].title).toContain('Harappa');
  });

  it('enforces that zero events exist in seed dataset without a source or flag', () => {
    const result = validateEntitySourcing(MOCK_SEED_EVENTS);
    expect(result.valid).toBe(true);
    expect(result.unsourcedEventIds).toEqual([]);
  });

  it('detects and flags unsourced entities', () => {
    const dummyEvent: TimelineEvent = {
      id: 'unsourced-dummy-999',
      title: 'Fake Event Without Source',
      slug: 'fake-event',
      summary: 'Testing sourcing enforcement',
      body: null,
      category: 'Test',
      created_at: '2026-08-16T00:00:00Z',
      status: 'published',
      date: {
        id: 'd999',
        event_id: 'unsourced-dummy-999',
        precision: 'year',
        calendar: 'ce_bce',
        year_start: 2000,
        year_end: null,
        years_before_present: 26,
        confidence: 'well_established',
        confidence_note: null,
        is_primary: true,
      },
      layers: [],
    };

    const result = validateEntitySourcing([...MOCK_SEED_EVENTS, dummyEvent]);
    expect(result.valid).toBe(false);
    expect(result.unsourcedEventIds).toContain('unsourced-dummy-999');
  });
});
