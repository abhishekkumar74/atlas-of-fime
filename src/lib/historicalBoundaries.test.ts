import { describe, it, expect } from 'vitest';
import { resolveHistoricalBoundary } from './historicalBoundaries';

describe('historicalBoundaries module', () => {
  it('handles deep time events (> 130,000 BP) with no data disclosure note', () => {
    // Big Bang or Earth formation (e.g. 13.8 billion years BP)
    const result = resolveHistoricalBoundary(13_800_000_000);
    expect(result.isAvailable).toBe(false);
    expect(result.matchedYear).toBeNull();
    expect(result.disclosureNote).toContain('No historical boundary data available this far back');
    expect(result.geojsonUrl).toBeNull();
  });

  it('resolves nearest snapshot year for pre-1900 historical event (1526 CE)', () => {
    const result = resolveHistoricalBoundary(500, 1526);
    expect(result.isAvailable).toBe(true);
    expect(result.matchedYear).toBe(1500);
    expect(result.formattedYearLabel).toBe('1500 CE');
    expect(result.disclosureNote).toContain('Historical Boundary Snapshot: ~1500 CE');
  });

  it('resolves nearest snapshot year for 1947 CE Indian Independence (1945 CE snapshot)', () => {
    const result = resolveHistoricalBoundary(79, 1947);
    expect(result.isAvailable).toBe(true);
    expect(result.matchedYear).toBe(1945);
    expect(result.formattedYearLabel).toBe('1945 CE');
  });
});
