import React, { useRef, useState, useEffect } from 'react';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { useEvents } from '../../lib/queries/events';
import { yearsBPtoPos, formatYearsBP } from '../../lib/dateEngine';
import { Clock, Navigation, Sparkles } from 'lucide-react';

export const TimeMachineScrubber: React.FC = () => {
  const { jumpToYear, selectEvent } = useTimelineStore();
  const { data: events = [] } = useEvents();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentYearsBP, setCurrentYearsBP] = useState<number>(2000);

  // Map percentage position (0-100) back to yearsBP using natural left-to-right timeline scale:
  // p = 0 (left edge) -> 13.8B BP (Big Bang)
  // p = 100 (right edge) -> 0 BP (Present)
  const posToYearsBP = (percent: number): number => {
    const p = Math.max(0, Math.min(100, percent)) / 100;
    const p_inv = 1 - p;
    const maxLog = Math.log10(13_800_000_000 / 10);
    const yearsBP = Math.pow(10, p_inv * maxLog) * 10 - 10;
    return Math.max(0, Math.min(13_800_000_000, yearsBP));
  };

  const handlePointerAction = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percent = (offsetX / rect.width) * 100;
    const yearsBP = posToYearsBP(percent);

    setCurrentYearsBP(yearsBP);
    jumpToYear(yearsBP);

    // Resolve nearest event and highlight it without force-opening the side panel drawer
    if (events.length > 0) {
      let nearest = events[0];
      let minDiff = Math.abs(events[0].date.years_before_present - yearsBP);

      for (const e of events) {
        const diff = Math.abs(e.date.years_before_present - yearsBP);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = e;
        }
      }

      if (nearest) {
        selectEvent(nearest.id);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerAction(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handlePointerAction(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, events]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // Invert wheel delta so scrolling down moves forward towards Present (0 BP)
    const delta = e.deltaY > 0 ? 0.03 : -0.03;
    const currentPercent = yearsBPtoPos(currentYearsBP) / 100;
    const newPercent = Math.max(0, Math.min(1, currentPercent + delta)) * 100;
    const newYearsBP = posToYearsBP(newPercent);

    setCurrentYearsBP(newYearsBP);
    jumpToYear(newYearsBP);

    if (events.length > 0) {
      let nearest = events[0];
      let minDiff = Math.abs(events[0].date.years_before_present - newYearsBP);

      for (const eventItem of events) {
        const diff = Math.abs(eventItem.date.years_before_present - newYearsBP);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = eventItem;
        }
      }

      if (nearest) {
        selectEvent(nearest.id);
      }
    }
  };

  const formattedYear = formatYearsBP(currentYearsBP, 'ce_bce');
  const needlePercent = yearsBPtoPos(currentYearsBP);

  return (
    <div className="w-full bg-atlas-panel/90 border-b border-atlas-border backdrop-blur-md px-4 py-2 select-none shadow-md">
      {/* Time Machine Digital LED Readout */}
      <div className="flex items-center justify-between gap-4 mb-1.5 font-mono text-xs">
        <div className="flex items-center gap-2 text-atlas-brass font-bold tracking-wider uppercase">
          <Clock className="w-4 h-4 text-atlas-brass animate-pulse" />
          <span>TIME MACHINE SCRUBBER</span>
          <Sparkles className="w-3.5 h-3.5 text-atlas-brass/70 hidden sm:inline" />
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded bg-atlas-surface/80 border border-atlas-brass/40 shadow-inner">
          <Navigation className="w-3.5 h-3.5 text-atlas-brass" />
          <span className="text-atlas-subtle text-[11px] hidden xs:inline">Destination Era:</span>
          <span className="font-mono font-bold text-atlas-parchment text-xs">{formattedYear}</span>
        </div>
      </div>

      {/* Mechanical Continuous Scrubber Track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className="relative w-full h-8 bg-atlas-bg/90 border border-atlas-border rounded-lg cursor-ew-resize overflow-hidden flex items-center shadow-inner group"
        title="Drag right towards Present or left towards Deep Time to travel continuously"
      >
        {/* Frequency Tick Marks Scale */}
        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-40 group-hover:opacity-70 transition-opacity">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className={`w-[1px] ${
                i % 5 === 0 ? 'h-5 bg-atlas-brass' : 'h-3 bg-atlas-border'
              }`}
            />
          ))}
        </div>

        {/* Major Era Labels overlay */}
        <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none text-[9px] font-mono text-atlas-subtle uppercase">
          <span>Big Bang</span>
          <span className="hidden sm:inline">First Life</span>
          <span>Agriculture</span>
          <span className="hidden md:inline">Classical</span>
          <span>Present</span>
        </div>

        {/* Central Brass Needle Indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-atlas-brass z-20 shadow-[0_0_8px_rgba(201,161,92,0.9)] transition-all duration-75 pointer-events-none"
          style={{ left: `${needlePercent}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-atlas-brass rotate-45 border border-atlas-parchment" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-atlas-brass rotate-45 border border-atlas-parchment" />
        </div>
      </div>
    </div>
  );
};
