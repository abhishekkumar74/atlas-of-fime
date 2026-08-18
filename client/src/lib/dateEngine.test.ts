import { describe, it, expect } from 'vitest';
import {
  yearsBPtoPos,
  posToYearsBP,
  formatYearsBP,
  LOG_MAX,
} from './dateEngine';

describe('dateEngine', () => {
  describe('yearsBPtoPos', () => {
    it('positions Big Bang (13.8B years BP) at 0%', () => {
      expect(yearsBPtoPos(LOG_MAX)).toBe(0);
    });

    it('positions Present (0 years BP) at 100%', () => {
      expect(yearsBPtoPos(0)).toBe(100);
    });

    it('places deep time (1M BP) to the left of human history (5000 BP)', () => {
      const pos1M = yearsBPtoPos(1_000_000);
      const pos5K = yearsBPtoPos(5_000);

      expect(pos1M).toBeGreaterThan(0);
      expect(pos5K).toBeGreaterThan(pos1M);
      expect(pos5K).toBeLessThan(100);
    });

    it('clamps values outside bounds correctly', () => {
      expect(yearsBPtoPos(20_000_000_000)).toBe(0);
      expect(yearsBPtoPos(-100)).toBe(100);
    });
  });

  describe('posToYearsBP round-trip', () => {
    it('round-trips position percentages accurately', () => {
      const sampleYears = [10, 500, 5000, 1_000_000, 500_000_000];
      for (const yr of sampleYears) {
        const pos = yearsBPtoPos(yr);
        const recovered = posToYearsBP(pos);
        const relDiff = Math.abs(recovered - yr) / yr;
        expect(relDiff).toBeLessThan(0.05); // within 5% tolerance
      }
    });
  });

  describe('formatYearsBP', () => {
    it('formats billions of years ago correctly', () => {
      expect(formatYearsBP(13_800_000_000)).toBe('~13.8 billion years ago');
    });

    it('formats millions of years ago correctly', () => {
      expect(formatYearsBP(66_000_000)).toBe('~66 million years ago');
    });

    it('formats BCE years correctly', () => {
      expect(formatYearsBP(5326, 'ce_bce', -3300)).toBe('~3300 BCE');
    });

    it('formats CE years correctly', () => {
      expect(formatYearsBP(79, 'ce_bce', 1947)).toBe('1947 CE');
    });
  });
});
