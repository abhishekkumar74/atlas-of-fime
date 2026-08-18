import { describe, it, expect, beforeEach } from 'vitest';
import { queryAIHistorian, checkRateLimit, resetRateLimits } from './aiHistorian';

describe('aiHistorian module', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it('returns a grounded answer with clickable citations for seeded content', async () => {
    const res = await queryAIHistorian('Ashoka', 'test-user-1');

    expect(res.refused).toBe(false);
    expect(res.answer).toContain('Ashoka');
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.citations[0].targetUrl).toBeDefined();
  });

  it('refuses ungrounded queries missing from the dataset without hallucinating', async () => {
    const res = await queryAIHistorian(
      'What was the economic impact of the 2008 global financial crisis?',
      'test-user-2'
    );

    expect(res.refused).toBe(true);
    expect(res.citations.length).toEqual(0);
    expect(res.answer).toContain('not covered in the current Atlas of Time dataset');
  });

  it('enforces rate limiting of maximum 10 queries per user window', async () => {
    const userId = 'rate-limited-user';

    // Perform 10 valid queries
    for (let i = 0; i < 10; i++) {
      const status = checkRateLimit(userId);
      expect(status.allowed).toBe(true);
    }

    // 11th query must be blocked
    const eleventhStatus = checkRateLimit(userId);
    expect(eleventhStatus.allowed).toBe(false);

    const res = await queryAIHistorian('Ashoka', userId);
    expect(res.refused).toBe(true);
    expect(res.refusalReason).toBe('Rate limit exceeded.');
  });
});
