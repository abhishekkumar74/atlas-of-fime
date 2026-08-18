import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePerson } from '../lib/queries/relationships';
import { ConnectionsList } from '../components/panel/ConnectionsList';
import { SourcesList } from '../components/panel/SourcesList';
import { SEOHead } from '../components/seo/SEOHead';
import { User, ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';

export const PersonDetailPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: person, isLoading } = usePerson(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-atlas-bg flex items-center justify-center p-6 text-atlas-brass font-serif animate-pulse">
        Loading historical biography...
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-atlas-bg flex flex-col items-center justify-center p-6 text-center space-y-4">
        <SEOHead title="Historical Figure Not Found — Atlas of Time" />
        <h2 className="font-serif text-xl text-atlas-parchment">
          Historical Figure Not Found
        </h2>
        <p className="font-sans text-sm text-atlas-muted max-w-md">
          No historical record matching slug <code className="text-atlas-brass">{slug}</code> exists in the atlas database.
        </p>
        <Link
          to="/"
          className="px-4 py-2 rounded bg-atlas-surface border border-atlas-brass text-atlas-brass font-mono text-xs hover:bg-atlas-panel transition-colors"
        >
          Return to Timeline
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atlas-bg text-atlas-text flex flex-col">
      {/* SEO & Schema.org JSON-LD */}
      <SEOHead
        title={`${person.name} — Historical Biography | Atlas of Time`}
        description={person.summary}
        canonicalUrl={`https://atlasoftime.org/history/people/${person.slug}`}
        person={person}
      />

      {/* Header Bar */}
      <header className="px-6 py-4 bg-atlas-panel border-b border-atlas-border flex items-center justify-between shadow-lg">
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-xs text-atlas-brass hover:text-atlas-parchment transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Interactive Timeline</span>
        </Link>
        <span className="font-mono text-[10px] text-atlas-subtle uppercase tracking-widest">
          Historical Person Profile
        </span>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        <div className="space-y-4 border-b border-atlas-border pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-atlas-surface border border-atlas-brass/50 text-atlas-brass shadow-[0_0_12px_rgba(201,161,92,0.3)]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-xs text-atlas-brass uppercase tracking-widest">
                Historical Figure
              </span>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-atlas-parchment">
                {person.name}
              </h1>
            </div>
          </div>

          {person.alt_names && person.alt_names.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-atlas-muted">
              <span className="text-atlas-subtle">Alternative Names / Epithets:</span>
              {person.alt_names.map((name) => (
                <span
                  key={name}
                  className="px-2 py-0.5 rounded bg-atlas-surface border border-atlas-border text-atlas-parchment/90"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          <div className="p-4 rounded-lg bg-atlas-panel border border-atlas-brass/30 text-atlas-parchment font-serif text-sm leading-relaxed">
            {person.summary}
          </div>
        </div>

        {person.body && (
          <section className="space-y-3">
            <h3 className="font-serif text-sm uppercase font-bold tracking-wider text-atlas-brass flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Biographical Profile & Historical Significance
            </h3>
            <div className="font-sans text-sm text-atlas-text/90 leading-relaxed bg-atlas-surface/30 p-5 rounded-lg border border-atlas-border/50">
              {person.body}
            </div>
          </section>
        )}

        <section className="space-y-3 pt-4 border-t border-atlas-border">
          <ConnectionsList entityType="person" entityId={person.id} />
        </section>

        <section className="space-y-3 pt-4 border-t border-atlas-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-atlas-brass" />
            <h3 className="font-serif text-sm uppercase font-bold tracking-wider text-atlas-brass">
              Verified Historiographical Sources
            </h3>
          </div>
          <SourcesList eventId={person.id} />
        </section>
      </main>
    </div>
  );
};
