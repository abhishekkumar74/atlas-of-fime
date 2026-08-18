import { describe, it, expect } from 'vitest';
import { searchEntitiesServer, parseNumericYearQuery } from './searchServer';

describe('searchServer module', () => {
  it('ranks title-prefix matches higher than full-text summary matches', async () => {
    const results = await searchEntitiesServer('Ashoka');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchedField).toBe('title-prefix');
    expect(results[0].title).toBe('Ashoka the Great');
  });

  it('parses numeric year queries correctly', () => {
    expect(parseNumericYearQuery('1947')).toBe(79); // 2026 - 1947
    expect(parseNumericYearQuery('250 bce')).toBe(2276); // 250 + 2026
    expect(parseNumericYearQuery('66 million')).toBe(66_000_000 + 2026);
  });

  it('triggers numeric year jump fallback for "1947"', async () => {
    const results = await searchEntitiesServer('1947');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe('Indian Independence & Partition');
    expect(results[0].matchedField).toBe('year');
  });

  it('triggers deep time year jump fallback for "66 million"', async () => {
    const results = await searchEntitiesServer('66 million');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe('Dinosaur Extinction');
  });

  it('returns cross-entity search results spanning events, people, and civilizations with correct route URLs', async () => {
    const results = await searchEntitiesServer('Mughal');
    expect(results.length).toBeGreaterThan(1);

    const eventMatch = results.find((r) => r.entityType === 'event');
    const personMatch = results.find((r) => r.entityType === 'person');
    const civMatch = results.find((r) => r.entityType === 'civilization');

    expect(eventMatch?.targetUrl).toContain('/history/mughal-empire');
    expect(personMatch?.targetUrl).toContain('/history/people/babur');
    expect(civMatch?.targetUrl).toBe('/');
  });
});
