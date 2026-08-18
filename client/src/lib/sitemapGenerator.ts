import type { TimelineEvent, PersonRecord } from './types/database.types';

export function generateSitemapXML(
  events: TimelineEvent[],
  people: PersonRecord[],
  baseUrl = 'https://atlasoftime.org'
): string {
  const publishedEvents = events.filter((e) => e.status === 'published');
  const publishedPeople = people.filter((p) => p.status === 'published');

  const urls: string[] = [
    `<url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  ];

  for (const event of publishedEvents) {
    urls.push(
      `<url><loc>${baseUrl}/history/${event.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    );
  }

  for (const person of publishedPeople) {
    urls.push(
      `<url><loc>${baseUrl}/history/people/${person.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
    '\n'
  )}\n</urlset>`;
}
