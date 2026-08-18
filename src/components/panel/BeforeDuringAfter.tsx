import React from 'react';
import type { TimelineEvent } from '../../lib/types/database.types';
import { ConnectionsList } from './ConnectionsList';
import { SourcesList } from './SourcesList';
import { History, Zap, ArrowRight, Globe } from 'lucide-react';

interface BeforeDuringAfterProps {
  event: TimelineEvent;
  allEvents?: TimelineEvent[];
}

export const BeforeDuringAfter: React.FC<BeforeDuringAfterProps> = ({
  event,
  allEvents = [],
}) => {
  // Contemporaneous events for "Elsewhere" section
  const elsewhereEvents = allEvents
    .filter(
      (e) =>
        e.id !== event.id &&
        Math.abs(e.date.years_before_present - event.date.years_before_present) < 500
    )
    .slice(0, 3);

  return (
    <div className="space-y-6 text-sm">
      {/* 1. BEFORE (Preceding Context) */}
      <div className="space-y-2 bg-atlas-surface/30 p-3.5 rounded-lg border border-atlas-border/40">
        <h4 className="font-serif text-xs uppercase font-bold tracking-wider text-atlas-brass flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Before — Historical Context
        </h4>
        <p className="font-sans text-atlas-text/90 text-xs leading-relaxed">
          Prior to {event.title}, regional conditions and historical precursors paved the way for this pivotal juncture in human civilization.
        </p>
      </div>

      {/* 2. DURING (Core Event) */}
      <div className="space-y-2 bg-atlas-surface/60 p-3.5 rounded-lg border border-atlas-brass/40">
        <h4 className="font-serif text-xs uppercase font-bold tracking-wider text-atlas-parchment flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-atlas-brass" />
          During — What Happened
        </h4>
        <p className="font-sans text-atlas-text text-xs leading-relaxed">
          {event.summary}
        </p>
        {event.body && (
          <p className="font-sans text-atlas-muted text-xs leading-relaxed pt-1">
            {event.body}
          </p>
        )}
      </div>

      {/* 3. AFTER (Consequences & Legacy) */}
      <div className="space-y-2 bg-atlas-surface/30 p-3.5 rounded-lg border border-atlas-border/40">
        <h4 className="font-serif text-xs uppercase font-bold tracking-wider text-atlas-brass flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5" />
          After — Legacy & Impact
        </h4>
        <p className="font-sans text-atlas-text/90 text-xs leading-relaxed">
          The long-term ramifications of {event.title} shaped cultural, political, and technological trajectories for generations following.
        </p>
      </div>

      {/* 4. ELSEWHERE (Contemporaneous Global Developments) */}
      <div className="space-y-2 bg-atlas-surface/20 p-3.5 rounded-lg border border-atlas-border/40">
        <h4 className="font-serif text-xs uppercase font-bold tracking-wider text-atlas-muted flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-atlas-brass" />
          Elsewhere — Happening At The Same Time
        </h4>
        {elsewhereEvents.length === 0 ? (
          <p className="font-sans text-atlas-subtle text-xs italic">
            No contemporaneous events recorded in this era dataset yet.
          </p>
        ) : (
          <ul className="space-y-1.5 list-disc list-inside font-sans text-xs text-atlas-muted">
            {elsewhereEvents.map((item) => (
              <li key={item.id} className="truncate">
                <span className="font-serif font-medium text-atlas-parchment">
                  {item.title}
                </span>{' '}
                <span className="font-mono text-[10px] text-atlas-subtle">
                  ({item.category})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 5. CONNECTIONS (Live Graph Query) */}
      <div className="pt-2 border-t border-atlas-border">
        <ConnectionsList entityType="event" entityId={event.id} />
      </div>

      {/* 6. SOURCES (Academic Citations) */}
      <SourcesList eventId={event.id} />
    </div>
  );
};
