import { describe, it, expect } from 'vitest';
import { useTimelineStore } from '../../lib/store/useTimelineStore';

describe('ActiveEventDashboard store integration', () => {
  it('updates selectedEventId via selectEvent without forcing isPanelOpen', () => {
    useTimelineStore.getState().selectEvent('mughal-empire');

    expect(useTimelineStore.getState().selectedEventId).toBe('mughal-empire');
    expect(useTimelineStore.getState().isPanelOpen).toBe(false);
  });

  it('opens side panel when openPanel action is explicitly triggered', () => {
    useTimelineStore.getState().openPanel('mughal-empire');

    expect(useTimelineStore.getState().selectedEventId).toBe('mughal-empire');
    expect(useTimelineStore.getState().isPanelOpen).toBe(true);
  });
});
