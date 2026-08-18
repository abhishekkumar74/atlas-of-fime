import { create } from 'zustand';

export const DEFAULT_LAYER_KEYS = [
  'deep-time',
  'world-history',
  'india',
  'religion',
  'science-tech',
];

export type ScalePreset = 'full' | 'agriculture' | '1900';

interface TimelineState {
  activeLayerKeys: string[];
  zoomFactor: number;
  activePreset: ScalePreset;
  selectedEventId: string | null;
  isPanelOpen: boolean;
  targetYearsBP: number | null;

  // Layer Actions
  toggleLayer: (key: string) => void;
  setAllLayers: (keys: string[]) => void;

  // Zoom Actions
  setZoomFactor: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Preset Actions
  setActivePreset: (preset: ScalePreset) => void;

  // Time Machine Jump Action
  jumpToYear: (yearsBP: number) => void;

  // Panel & Selection Actions
  selectEvent: (eventId: string) => void;
  openPanel: (eventId: string) => void;
  closePanel: () => void;
}

export const MIN_ZOOM = 1.0;
export const MAX_ZOOM = 20.0;
export const ZOOM_STEP = 1.25;

export const useTimelineStore = create<TimelineState>((set) => ({
  activeLayerKeys: DEFAULT_LAYER_KEYS,
  zoomFactor: 1.0,
  activePreset: 'full',
  selectedEventId: null,
  isPanelOpen: false,
  targetYearsBP: null,

  toggleLayer: (key: string) =>
    set((state) => {
      const exists = state.activeLayerKeys.includes(key);
      const updated = exists
        ? state.activeLayerKeys.filter((k) => k !== key)
        : [...state.activeLayerKeys, key];
      return { activeLayerKeys: updated };
    }),

  setAllLayers: (keys: string[]) => set({ activeLayerKeys: keys }),

  setZoomFactor: (zoom: number) =>
    set({
      zoomFactor: Number(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)).toFixed(2)),
    }),

  zoomIn: () =>
    set((state) => ({
      zoomFactor: Number(
        Math.min(MAX_ZOOM, state.zoomFactor * ZOOM_STEP).toFixed(2)
      ),
    })),

  zoomOut: () =>
    set((state) => ({
      zoomFactor: Number(
        Math.max(MIN_ZOOM, state.zoomFactor / ZOOM_STEP).toFixed(2)
      ),
    })),

  resetZoom: () => set({ zoomFactor: 1.0, activePreset: 'full' }),

  setActivePreset: (preset: ScalePreset) =>
    set({
      activePreset: preset,
      zoomFactor: preset === 'full' ? 1.0 : preset === 'agriculture' ? 2.5 : 5.0,
    }),

  jumpToYear: (yearsBP: number) =>
    set({
      targetYearsBP: yearsBP,
    }),

  selectEvent: (eventId: string) =>
    set({
      selectedEventId: eventId,
    }),

  openPanel: (eventId: string) =>
    set({
      selectedEventId: eventId,
      isPanelOpen: true,
    }),

  closePanel: () => set({ isPanelOpen: false }),
}));
