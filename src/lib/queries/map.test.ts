import { describe, it, expect } from 'vitest';
import {
  fetchRegions,
  fetchMapStateForEvent,
  SEED_TERRITORIES,
} from './map';

describe('map query module', () => {
  it('returns all 10 schematic regions', async () => {
    const regions = await fetchRegions();
    expect(regions.length).toBe(10);
    expect(regions.map((r) => r.key)).toContain('india');
    expect(regions.map((r) => r.key)).toContain('mediterranean');
  });

  it('resolves primary region and uncertainty note for Mauryan Empire event', async () => {
    const mauryanEventId = 'e0000015-0000-0000-0000-000000000015';
    const state = await fetchMapStateForEvent(mauryanEventId);

    expect(state.primaryRegion?.key).toBe('india');
    expect(state.uncertaintyNote).toBeTruthy();
    expect(state.uncertaintyNote?.length).toBeGreaterThan(10);
  });

  it('gracefully falls back to global region for unlinked events', async () => {
    const state = await fetchMapStateForEvent('non-existent-event-id');

    expect(state.primaryRegion?.key).toBe('global');
    expect(state.secondaryRegions).toEqual([]);
    expect(state.uncertaintyNote).toBeTruthy();
  });

  it('validates that every seeded territory carries a non-empty uncertainty note', () => {
    for (const territory of SEED_TERRITORIES) {
      expect(territory.uncertainty_note).toBeTruthy();
      expect(territory.uncertainty_note.trim().length).toBeGreaterThan(0);
    }
  });
});
