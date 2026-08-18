import React, { useEffect } from 'react';
import type { TimelineEvent, PersonRecord } from '../../lib/types/database.types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  event?: TimelineEvent;
  person?: PersonRecord;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Atlas of Time — Interactive Timeline of Earth & History',
  description = 'Explore 13.8 billion years of Earth, Humanity, and Civilization through a logarithmic chronological spine.',
  canonicalUrl = 'https://atlasoftime.org/',
  event,
  person,
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 4. Inject Schema.org JSON-LD Structured Data
    let schemaScript = document.getElementById('json-ld-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('id', 'json-ld-schema');
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }

    if (event) {
      const eventSchema = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.summary,
        startDate: String(event.date.year_start),
        url: canonicalUrl,
      };
      schemaScript.textContent = JSON.stringify(eventSchema);
    } else if (person) {
      const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: person.name,
        description: person.summary,
        url: canonicalUrl,
      };
      schemaScript.textContent = JSON.stringify(personSchema);
    }
  }, [title, description, canonicalUrl, event, person]);

  return null;
};
