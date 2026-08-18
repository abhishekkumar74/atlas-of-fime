import { describe, it, expect } from 'vitest';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { yearsBPtoPos } from '../../lib/dateEngine';

describe('TimeMachineScrubber store integration', () => {
  it('dispatches jumpToYear action to update targetYearsBP', () => {
    useTimelineStore.getState().jumpToYear(1526);
    expect(useTimelineStore.getState().targetYearsBP).toBe(1526);
  });

  it('maps yearsBP to percentage position accurately across logarithmic scale', () => {
    const bigBangPos = yearsBPtoPos(13_800_000_000);
    const presentPos = yearsBPtoPos(0);

    expect(bigBangPos).toBeCloseTo(0, 0);
    expect(presentPos).toBeCloseTo(100, 0);
  });
});
