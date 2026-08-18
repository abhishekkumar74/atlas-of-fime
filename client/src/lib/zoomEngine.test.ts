import { describe, it, expect } from 'vitest';
import { calculateAnchoredScroll, PRESET_CONFIGS } from './zoomEngine';

describe('zoomEngine', () => {
  describe('calculateAnchoredScroll', () => {
    it('keeps cursor anchored when zooming in at center', () => {
      // scrollLeft = 200, mouse at 300px from container left
      // absolute cursor = 500px at zoom = 1.0 -> unscaled contentX = 500px
      // at zoom = 2.0 -> scaled contentX = 1000px
      // newScrollLeft = 1000 - 300 = 700px
      const newScroll = calculateAnchoredScroll(200, 300, 1.0, 2.0);
      expect(newScroll).toBe(700);
    });

    it('handles zero offset gracefully', () => {
      const newScroll = calculateAnchoredScroll(0, 0, 1.0, 2.0);
      expect(newScroll).toBe(0);
    });

    it('preserves position when zoom does not change', () => {
      const newScroll = calculateAnchoredScroll(150, 250, 1.5, 1.5);
      expect(newScroll).toBe(150);
    });
  });

  describe('PRESET_CONFIGS', () => {
    it('defines full, agriculture, and 1900 presets', () => {
      expect(PRESET_CONFIGS.full.targetZoom).toBe(1.0);
      expect(PRESET_CONFIGS.agriculture.targetZoom).toBe(2.5);
      expect(PRESET_CONFIGS['1900'].targetZoom).toBe(5.0);
    });
  });
});
