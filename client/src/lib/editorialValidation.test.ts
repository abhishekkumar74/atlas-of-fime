import { describe, it, expect } from 'vitest';
import {
  canTransitionStatus,
  validatePublishEligibility,
  filterPublishedEventsOnly,
} from './editorialValidation';
import type { TimelineEvent } from './types/database.types';

describe('editorialValidation module', () => {
  it('validates status pipeline transition rules', () => {
    expect(canTransitionStatus('draft', 'review')).toBe(true);
    expect(canTransitionStatus('review', 'approved')).toBe(true);
    expect(canTransitionStatus('approved', 'published')).toBe(true);

    // Illegal direct jumps
    expect(canTransitionStatus('draft', 'published')).toBe(false);
  });

  it('blocks publishing event missing a date record', () => {
    const invalidEvent: Partial<TimelineEvent> = {
      id: 'e-test-1',
      title: 'Invalid Test Event',
      slug: 'invalid-test',
      summary: 'Missing date record',
    };

    const result = validatePublishEligibility(
      'event',
      invalidEvent,
      [],
      [{ source_id: 's1' }]
    );

    expect(result.eligible).toBe(false);
    expect(result.errors).toContain('Event must have a valid date record attached.');
  });

  it('blocks publishing event missing both sources and explicit flag', () => {
    const validDateEvent: Partial<TimelineEvent> = {
      id: 'e-test-2',
      title: 'Valid Date Event',
      slug: 'valid-date-test',
      summary: 'Has date but no source',
      date: {
        id: 'd-test',
        event_id: 'e-test-2',
        precision: 'year',
        calendar: 'ce_bce',
        year_start: 2000,
        year_end: null,
        years_before_present: 26,
        confidence: 'well_established',
        confidence_note: null,
        is_primary: true,
      },
    };

    const result = validatePublishEligibility('event', validDateEvent, [], []);

    expect(result.eligible).toBe(false);
    expect(result.errors[0]).toContain('at least one linked academic source');
  });

  it('allows publishing event with date and explicit no-source flag', () => {
    const validEvent: Partial<TimelineEvent> = {
      id: 'e-test-3',
      title: 'Valid Event',
      slug: 'valid-event-slug',
      summary: 'Has date and flag',
      date: {
        id: 'd-test-3',
        event_id: 'e-test-3',
        precision: 'year',
        calendar: 'ce_bce',
        year_start: 2000,
        year_end: null,
        years_before_present: 26,
        confidence: 'well_established',
        confidence_note: null,
        is_primary: true,
      },
    };

    const result = validatePublishEligibility(
      'event',
      validEvent,
      [],
      [{ no_source_flag: true }]
    );

    expect(result.eligible).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('prevents draft leak by filtering non-published events out for public views', () => {
    const events: TimelineEvent[] = [
      {
        id: 'e1',
        title: 'Published Event',
        slug: 'pub',
        summary: 'Pub',
        body: null,
        category: 'Test',
        created_at: '2026-08-16T00:00:00Z',
        status: 'published',
        date: {} as any,
        layers: [],
      },
      {
        id: 'e2',
        title: 'Draft Event',
        slug: 'draft',
        summary: 'Draft',
        body: null,
        category: 'Test',
        created_at: '2026-08-16T00:00:00Z',
        status: 'draft',
        date: {} as any,
        layers: [],
      },
    ];

    const publicEvents = filterPublishedEventsOnly(events);
    expect(publicEvents.length).toBe(1);
    expect(publicEvents[0].id).toBe('e1');
  });
});
