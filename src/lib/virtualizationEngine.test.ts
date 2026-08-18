import { describe, it, expect } from 'vitest';
import {
  calculateVisibleYearRange,
  filterVisibleEvents,
} from './virtualizationEngine';
import { MOCK_SEED_EVENTS } from './queries/events';
import type { TimelineEvent } from './types/database.types';

describe('virtualizationEngine', () => {
  it('calculates valid min/max years BP from scroll position', () => {
    const trackWidth = 5000;
    const viewportWidth = 1000;
    const scrollLeft = 2000;

    const bounds = calculateVisibleYearRange(scrollLeft, viewportWidth, trackWidth);

    expect(bounds.minYearsBP).toBeGreaterThanOrEqual(0);
    expect(bounds.maxYearsBP).toBeLessThanOrEqual(13_800_000_000);
    expect(bounds.maxYearsBP).toBeGreaterThan(bounds.minYearsBP);
  });

  it('filters events within visible year window and active layers', () => {
    const bounds = { minYearsBP: 100, maxYearsBP: 10_000 };
    const filtered = filterVisibleEvents(MOCK_SEED_EVENTS, bounds, ['india']);

    for (const event of filtered) {
      expect(event.date.years_before_present).toBeGreaterThanOrEqual(bounds.minYearsBP);
      expect(event.date.years_before_present).toBeLessThanOrEqual(bounds.maxYearsBP);
      expect(event.layers.some((l) => l.key === 'india')).toBe(true);
    }
  });

  it('benchmark: filters 500 synthetic events under 5ms', () => {
    const largeDataset: TimelineEvent[] = Array.from({ length: 500 }, (_, i) => ({
      id: `synthetic-${i}`,
      title: `Event ${i}`,
      slug: `event-${i}`,
      summary: `Synthetic event ${i}`,
      body: null,
      category: 'Test',
      created_at: '2026-08-16T00:00:00Z',
      status: 'published',
      date: {
        id: `d-${i}`,
        event_id: `synthetic-${i}`,
        precision: 'year',
        calendar: 'ce_bce',
        year_start: 1000 + i,
        year_end: null,
        years_before_present: 1000 + (i * 1000),
        confidence: 'well_established',
        confidence_note: null,
        is_primary: true,
      },
      layers: [MOCK_SEED_EVENTS[0].layers[0]],
    }));

    const start = performance.now();
    const bounds = { minYearsBP: 5000, maxYearsBP: 50000 };
    const result = filterVisibleEvents(largeDataset, bounds, []);
    const duration = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(5); // Must take < 5ms for 60fps budget
  });
});
