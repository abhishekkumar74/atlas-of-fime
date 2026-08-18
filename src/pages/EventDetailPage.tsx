import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvents } from '../lib/queries/events';
import { formatYearsBP } from '../lib/dateEngine';
import { SEOHead } from '../components/seo/SEOHead';
import { ArrowLeft, Calendar, Tag, ShieldCheck } from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: events = [] } = useEvents();

  const event = events.find((e) => e.slug === slug);

  if (!event) {
    return (
      <div className="min-h-screen bg-atlas-bg flex flex-col items-center justify-center p-6 text-atlas-text">
        <SEOHead title="Event Not Found — Atlas of Time" />
        <div className="max-w-md w-full bg-atlas-panel border border-atlas-border p-8 rounded-lg text-center shadow-xl">
          <h2 className="font-serif text-xl font-bold text-atlas-parchment mb-2">
            Event Not Found
          </h2>
          <p className="font-sans text-sm text-atlas-muted mb-6">
            No event matching slug <code className="text-atlas-brass font-mono">/{slug}</code> exists in the database.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-atlas-surface border border-atlas-brass/50 text-atlas-parchment rounded hover:bg-atlas-brass hover:text-atlas-bg transition-colors font-mono text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Timeline
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = formatYearsBP(
    event.date.years_before_present,
    event.date.calendar,
    event.date.year_start
  );

  return (
    <div className="min-h-screen bg-atlas-bg text-atlas-text flex flex-col">
      {/* SEO & Schema.org JSON-LD */}
      <SEOHead
        title={`${event.title} (${formattedDate}) — Atlas of Time`}
        description={event.summary}
        canonicalUrl={`https://atlasoftime.org/history/${event.slug}`}
        event={event}
      />

      {/* Top Bar Navigation */}
      <header className="px-6 py-4 bg-atlas-panel border-b border-atlas-border flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-atlas-brass hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Timeline
        </Link>
        <span className="font-mono text-xs text-atlas-subtle">
          URL Route: /history/{event.slug}
        </span>
      </header>

      {/* Main Content Card */}
      <main className="max-w-3xl w-full mx-auto p-8 my-8 bg-atlas-panel border border-atlas-border rounded-lg shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-atlas-border pb-4">
          <div className="flex items-center gap-2 font-mono text-sm text-atlas-brass font-medium">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-atlas-surface border border-atlas-border font-mono text-xs text-atlas-parchment">
            <ShieldCheck className="w-3.5 h-3.5 text-atlas-brass" />
            <span className="capitalize">{event.date.confidence.replace('_', ' ')}</span>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-atlas-surface text-[11px] font-mono text-atlas-muted uppercase mb-2">
            <Tag className="w-3 h-3 text-atlas-brass" />
            <span>{event.category}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-atlas-parchment mb-4">
            {event.title}
          </h1>
          <p className="font-sans text-base leading-relaxed text-atlas-text/90 bg-atlas-surface/40 p-4 rounded border border-atlas-border/50">
            {event.summary}
          </p>
        </div>

        {event.body && (
          <div className="space-y-2">
            <h3 className="font-serif text-sm uppercase font-semibold text-atlas-parchment/80 tracking-wider">
              Historical Record
            </h3>
            <p className="font-sans text-sm leading-relaxed text-atlas-muted">
              {event.body}
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-atlas-border flex items-center gap-2">
          <span className="font-mono text-xs text-atlas-subtle">Assigned Layers:</span>
          {event.layers.map((l) => (
            <span
              key={l.id}
              className="px-2 py-0.5 rounded bg-atlas-surface text-xs font-sans text-atlas-parchment border border-atlas-border"
            >
              {l.label}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
};
