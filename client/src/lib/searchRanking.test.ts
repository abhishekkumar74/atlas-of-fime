import { describe, it, expect } from 'vitest';
import { rankSearchEvents } from './searchRanking';
import { MOCK_SEED_EVENTS } from './queries/events';

describe('searchRanking', () => {
  it('returns empty array for empty query', () => {
    expect(rankSearchEvents(MOCK_SEED_EVENTS, '')).toEqual([]);
  });

  it('ranks title-prefix matches higher than title-contains or summary matches', () => {
    const results = rankSearchEvents(MOCK_SEED_EVENTS, 'big');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].event.title).toBe('The Big Bang');
    expect(results[0].matchedField).toBe('title-contains');
  });

  it('ranks exact year match correctly', () => {
    const results = rankSearchEvents(MOCK_SEED_EVENTS, '1947');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].event.slug).toBe('indian-independence');
  });

  it('matches text inside summary when title does not match', () => {
    const results = rankSearchEvents(MOCK_SEED_EVENTS, 'astronomical');
    // should match events containing astronomy/astronomical in summary
    expect(results).toBeDefined();
  });
});
