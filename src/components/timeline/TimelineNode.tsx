import React from 'react';
import type { TimelineEvent } from '../../lib/types/database.types';
import { formatYearsBP } from '../../lib/dateEngine';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { HoverPreview } from '../common/HoverPreview';

interface TimelineNodeProps {
  event: TimelineEvent;
  leftPosPercent: number;
  depthRow: number;
}

export const TimelineNode: React.FC<TimelineNodeProps> = ({
  event,
  leftPosPercent,
  depthRow = 0,
}) => {
  const { selectedEventId, openPanel } = useTimelineStore();
  const isSelected = selectedEventId === event.id;

  const formattedDate = formatYearsBP(
    event.date.years_before_present,
    event.date.calendar,
    event.date.year_start
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPanel(event.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPanel(event.id);
    }
  };

  const stemHeightPx = depthRow * 28 + 6;

  return (
    <div
      className="absolute top-3 group pointer-events-none"
      style={{
        left: `${leftPosPercent}%`,
        zIndex: isSelected ? 40 : 10 + depthRow,
      }}
    >
      <div className="relative -translate-x-1/2 flex flex-col items-center">
        {/* Compact Node Dot Pin */}
        <HoverPreview
          title={event.title}
          formattedDate={formattedDate}
          summary={event.summary}
          category={event.category}
          confidence={event.date.confidence}
        >
          <button
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={`pointer-events-auto focus:outline-none focus:ring-2 focus:ring-atlas-brass rounded-full transition-transform ${
              isSelected ? 'scale-125 z-50' : 'hover:scale-110 hover:z-40'
            }`}
            title={`${event.title} (${formattedDate})`}
          >
            <div
              className={`w-3 h-3 rounded-full border transition-all ${
                isSelected
                  ? 'bg-atlas-brass border-atlas-parchment shadow-[0_0_10px_rgba(201,161,92,0.9)]'
                  : 'bg-atlas-panel border-atlas-brass group-hover:bg-atlas-brass group-hover:shadow-[0_0_6px_rgba(201,161,92,0.6)]'
              }`}
            />
          </button>
        </HoverPreview>

        {/* Short Stem Line Connector */}
        <div
          style={{ height: `${stemHeightPx}px` }}
          className={`w-[1px] transition-colors ${
            isSelected
              ? 'bg-atlas-brass shadow-[0_0_4px_rgba(201,161,92,0.8)]'
              : 'bg-atlas-brass/40 group-hover:bg-atlas-brass'
          }`}
        />

        {/* Compact Single-Line Label (FormattedDate · Title) */}
        <HoverPreview
          title={event.title}
          formattedDate={formattedDate}
          summary={event.summary}
          category={event.category}
          confidence={event.date.confidence}
        >
          <button
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            title={`${event.title} (${formattedDate})`}
            className={`pointer-events-auto px-2 py-0.5 rounded text-left border transition-all max-w-[150px] overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-atlas-brass ${
              isSelected
                ? 'bg-atlas-surface border-atlas-brass text-atlas-parchment font-semibold shadow-md'
                : 'bg-atlas-panel/90 border-atlas-border/80 text-atlas-text group-hover:border-atlas-brass/70 group-hover:bg-atlas-surface'
            }`}
          >
            <div className="font-mono text-[10px] truncate flex items-center gap-1">
              <span className="text-atlas-brass font-semibold shrink-0">{formattedDate}</span>
              <span className="text-atlas-subtle shrink-0">·</span>
              <span className="font-serif text-atlas-parchment truncate" title={event.title}>
                {event.title}
              </span>
            </div>
          </button>
        </HoverPreview>
      </div>
    </div>
  );
};
