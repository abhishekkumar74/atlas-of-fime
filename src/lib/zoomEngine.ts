import type { ScalePreset } from './store/useTimelineStore';

export interface PresetConfig {
  key: ScalePreset;
  label: string;
  sublabel: string;
  targetZoom: number;
  startBP: number;
  endBP: number;
}

export const PRESET_CONFIGS: Record<ScalePreset, PresetConfig> = {
  full: {
    key: 'full',
    label: 'Full History',
    sublabel: '13.8B BP - Present',
    targetZoom: 1.0,
    startBP: 13_800_000_000,
    endBP: 0,
  },
  agriculture: {
    key: 'agriculture',
    label: 'Since Agriculture',
    sublabel: '12,000 BP - Present',
    targetZoom: 2.5,
    startBP: 12_000,
    endBP: 0,
  },
  '1900': {
    key: '1900',
    label: 'Since 1900',
    sublabel: '1900 CE - Present',
    targetZoom: 5.0,
    startBP: 126,
    endBP: 0,
  },
};

/**
 * Calculates the new scrollLeft position to keep the timeline position
 * under the cursor stationary during a zoom operation.
 */
export function calculateAnchoredScroll(
  currentScrollLeft: number,
  mouseOffsetPx: number,
  oldZoom: number,
  newZoom: number
): number {
  if (oldZoom <= 0 || newZoom <= 0) return currentScrollLeft;
  
  // Point in unzoomed content space under cursor
  const contentX = (currentScrollLeft + mouseOffsetPx) / oldZoom;
  
  // Repositioned scrollLeft in newly zoomed space
  const newScrollLeft = contentX * newZoom - mouseOffsetPx;
  return Math.max(0, Math.round(newScrollLeft));
}
