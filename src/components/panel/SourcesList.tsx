import React from 'react';
import { useEventSources } from '../../lib/queries/sources';
import { BookOpen, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface SourcesListProps {
  eventId: string;
}

export const SourcesList: React.FC<SourcesListProps> = ({ eventId }) => {
  const { data: sources = [], isLoading } = useEventSources(eventId);

  if (isLoading) {
    return (
      <div className="py-2 font-mono text-xs text-atlas-muted animate-pulse">
        Loading historical citations...
      </div>
    );
  }

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2 border-t border-atlas-border">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-xs uppercase font-bold tracking-wider text-atlas-brass flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Academic Citations & Sources ({sources.length})
        </h4>
      </div>

      <div className="space-y-2">
        {sources.map((src) => (
          <div
            key={src.id}
            className="p-3 bg-atlas-surface/40 border border-atlas-border rounded-lg space-y-1.5 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                {src.noSourceFlag ? (
                  <div className="flex items-center gap-1 font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    <AlertCircle className="w-3 h-3" />
                    <span>No Primary Source Linked Yet (Pending Editorial Review)</span>
                  </div>
                ) : (
                  <>
                    <div className="font-serif font-semibold text-atlas-parchment flex items-center gap-1.5">
                      <span>{src.title}</span>
                      <ShieldCheck className="w-3 h-3 text-atlas-brass flex-shrink-0" />
                    </div>
                    {(src.author || src.publisher) && (
                      <div className="font-sans text-[11px] text-atlas-muted">
                        {src.author} {src.publisher ? `— ${src.publisher}` : ''}{' '}
                        {src.publishedAt ? `(${src.publishedAt})` : ''}
                      </div>
                    )}
                  </>
                )}
              </div>

              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-atlas-panel border border-atlas-border text-atlas-brass hover:bg-atlas-surface transition-colors flex-shrink-0"
                  title="View external reference"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {src.claimNote && (
              <div className="font-mono text-[10px] text-atlas-subtle bg-atlas-panel/60 p-2 rounded border border-atlas-border/40">
                <span className="text-atlas-brass">Citation note:</span> {src.claimNote}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
