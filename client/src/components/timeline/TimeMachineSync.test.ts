import { describe, it, expect } from 'vitest';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { yearsBPtoPos } from '../../lib/dateEngine';
import type { TimelineEvent } from '../../lib/types/database.types';

describe('TimeMachineSync module', () => {
  it('correctly maps percentage position (0% = Big Bang, 100% = Present)', () => {
    const bigBangPos = yearsBPtoPos(13_800_000_000);
    const presentPos = yearsBPtoPos(0);

    expect(bigBangPos).toBeCloseTo(0, 0);
    expect(presentPos).toBeCloseTo(100, 0);
  });

  it('resolves nearest historical event when tuning yearsBP', () => {
    const mockEvents: Partial<TimelineEvent>[] = [
      { id: 'e1', date: { years_before_present: 13_800_000_000 } as any },
      { id: 'e2', date: { years_before_present: 500 } as any }, // Mughal 1526 CE
      { id: 'e3', date: { years_before_present: 79 } as any },  // Independence 1947 CE
    ];

    const targetYearsBP = 490; // close to 500 BP Mughal
    let nearest = mockEvents[0];
    let minDiff = Math.abs(mockEvents[0].date!.years_before_present - targetYearsBP);

    for (const e of mockEvents) {
      const diff = Math.abs(e.date!.years_before_present - targetYearsBP);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = e;
      }
    }

    expect(nearest.id).toBe('e2');

    // Dispatch store actions
    useTimelineStore.getState().jumpToYear(targetYearsBP);
    useTimelineStore.getState().openPanel(nearest.id!);

    expect(useTimelineStore.getState().targetYearsBP).toBe(490);
    expect(useTimelineStore.getState().selectedEventId).toBe('e2');
    expect(useTimelineStore.getState().isPanelOpen).toBe(true);
  });
});
