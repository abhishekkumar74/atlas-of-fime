import React from 'react';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { useEvents } from '../../lib/queries/events';
import { useEventMapState } from '../../lib/queries/map';
import { formatYearsBP } from '../../lib/dateEngine';
import { ArrowRight, Sparkles, MapPin } from 'lucide-react';

export const ActiveEventDashboard: React.FC = () => {
  const { selectedEventId, openPanel, isPanelOpen } = useTimelineStore();
  const { data: events = [] } = useEvents();
  const { data: mapState } = useEventMapState(selectedEventId);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // If no event selected or if side panel drawer is ALREADY open, do not duplicate bottom bar
  if (!selectedEvent || isPanelOpen) return null;

  const formattedDate = formatYearsBP(
    selectedEvent.date.years_before_present,
    selectedEvent.date.calendar,
    selectedEvent.date.year_start
  );

  return (
    <div className="fixed bottom-3 left-3 right-3 md:left-6 md:right-6 z-40 bg-atlas-panel/95 backdrop-blur-md border border-atlas-brass/50 rounded-xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.7)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Event Details Summary Badge */}
      <div className="flex items-center gap-3 min-w-0 flex-grow">
        <div className="p-2 rounded-lg bg-atlas-brass/20 text-atlas-brass border border-atlas-brass/40 shrink-0">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>

        <div className="min-w-0 flex-grow">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-serif font-bold text-sm text-atlas-parchment truncate">
              {selectedEvent.title}
            </h4>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-atlas-brass/15 text-atlas-brass border border-atlas-brass/30 shrink-0">
              {formattedDate}
            </span>
            {mapState?.primaryRegion?.label && (
              <span className="font-sans text-[11px] px-2 py-0.5 rounded bg-atlas-surface text-atlas-muted border border-atlas-border flex items-center gap-1 shrink-0">
                <MapPin className="w-3 h-3 text-atlas-brass" />
                <span>{mapState.primaryRegion.label}</span>
              </span>
            )}
          </div>
          <p className="font-sans text-xs text-atlas-muted truncate mt-0.5">
            {selectedEvent.summary_50words}
          </p>
        </div>
      </div>

      {/* Explicit Action Button to Open Full Side Panel */}
      <button
        onClick={() => openPanel(selectedEvent.id)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-atlas-brass text-atlas-bg font-sans font-bold text-xs hover:bg-atlas-brass/90 transition-all shadow-md hover:scale-105 shrink-0 focus:outline-none focus:ring-2 focus:ring-atlas-parchment"
      >
        <span>View Full Details</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
