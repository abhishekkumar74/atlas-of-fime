import type { TimelineEvent } from './types/database.types';
import { LOG_MAX } from './dateEngine';

export interface ViewportYearBounds {
  minYearsBP: number;
  maxYearsBP: number;
}

export function calculateVisibleYearRange(
  scrollLeft: number,
  viewportWidth: number,
  trackWidth: number,
  bufferPercentage = 15
): ViewportYearBounds {
  if (trackWidth <= 0 || viewportWidth <= 0) {
    return { minYearsBP: 0, maxYearsBP: LOG_MAX };
  }

  // Calculate pixel bounds with buffer
  const bufferPx = (viewportWidth * bufferPercentage) / 100;
  const leftPx = Math.max(0, scrollLeft - bufferPx);
  const rightPx = Math.min(trackWidth, scrollLeft + viewportWidth + bufferPx);

  // Convert pixel positions to percentages (0% = Big Bang / LOG_MAX, 100% = Present / 0 BP)
  const leftPosPercent = (leftPx / trackWidth) * 100;
  const rightPosPercent = (rightPx / trackWidth) * 100;

  const logMax = Math.log10(LOG_MAX + 1);

  // Inverse logarithmic positioning calculation
  // pos = (1 - log10(yearsBP + 1) / logMax) * 100
  // log10(yearsBP + 1) = (1 - pos / 100) * logMax
  const maxYearsBP = Math.pow(10, (1 - leftPosPercent / 100) * logMax) - 1;
  const minYearsBP = Math.pow(10, (1 - rightPosPercent / 100) * logMax) - 1;

  return {
    minYearsBP: Math.max(0, minYearsBP),
    maxYearsBP: Math.min(LOG_MAX, maxYearsBP),
  };
}

export function filterVisibleEvents(
  events: TimelineEvent[],
  bounds: ViewportYearBounds,
  activeLayerKeys: string[]
): TimelineEvent[] {
  const activeSet = new Set(activeLayerKeys);

  return events.filter((e) => {
    // 1. Layer filtering
    const matchesLayer =
      activeSet.size === 0 || e.layers.some((l) => activeSet.has(l.key));
    if (!matchesLayer) return false;

    // 2. Viewport date window filtering
    const bp = e.date.years_before_present;
    return bp >= bounds.minYearsBP && bp <= bounds.maxYearsBP;
  });
}
