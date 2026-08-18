import { describe, it, expect } from 'vitest';
import { generateSitemapXML } from './sitemapGenerator';
import type { TimelineEvent, PersonRecord } from './types/database.types';

describe('sitemapGenerator module', () => {
  it('generates valid XML sitemap containing only published entities', () => {
    const events: TimelineEvent[] = [
      {
        id: 'e1',
        title: 'Published Event',
        slug: 'pub-event',
        summary: 'Published',
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
        slug: 'draft-event',
        summary: 'Draft',
        body: null,
        category: 'Test',
        created_at: '2026-08-16T00:00:00Z',
        status: 'draft',
        date: {} as any,
        layers: [],
      },
    ];

    const people: PersonRecord[] = [
      {
        id: 'p1',
        name: 'Published Person',
        slug: 'pub-person',
        alt_names: [],
        birth_event_id: null,
        death_event_id: null,
        summary: 'Pub',
        body: null,
        status: 'published',
      },
    ];

    const xml = generateSitemapXML(events, people);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('https://atlasoftime.org/history/pub-event');
    expect(xml).toContain('https://atlasoftime.org/history/people/pub-person');

    // Verify draft entity is NOT in sitemap
    expect(xml).not.toContain('draft-event');
  });
});
