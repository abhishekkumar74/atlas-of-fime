import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { useEvents } from '../../lib/queries/events';
import { formatYearsBP } from '../../lib/dateEngine';
import { CertaintyTag } from './CertaintyTag';
import { BeforeDuringAfter } from './BeforeDuringAfter';
import { X, ExternalLink, Calendar, Layers } from 'lucide-react';

export const DetailPanel: React.FC = () => {
  const { selectedEventId, isPanelOpen, closePanel } = useTimelineStore();
  const { data: events = [] } = useEvents();

  const [translateY, setTranslateY] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const event = events.find((e) => e.id === selectedEventId);

  // Focus trap and accessibility management
  useEffect(() => {
    if (isPanelOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      const handleTabKeyKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closePanel();
          return;
        }

        if (e.key !== 'Tab' || !panelRef.current) return;

        const currentFocusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (currentFocusables.length === 0) return;

        const firstEl = currentFocusables[0];
        const lastEl = currentFocusables[currentFocusables.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      };

      window.addEventListener('keydown', handleTabKeyKeydown);
      return () => {
        window.removeEventListener('keydown', handleTabKeyKeydown);
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen || !event) return null;

  const formattedDate = formatYearsBP(
    event.date.years_before_present,
    event.date.calendar,
    event.date.year_start
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 720) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth >= 720 || touchStartY.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (window.innerWidth >= 720) return;
    if (translateY > 120) {
      closePanel();
    }
    setTranslateY(0);
    touchStartY.current = null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePanel}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Detail Container */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Event Details: ${event.title}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: translateY > 0 ? `translateY(${translateY}px)` : undefined,
        }}
        className="fixed z-50 bg-atlas-panel border-atlas-border shadow-2xl transition-transform duration-300 ease-out flex flex-col
          inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t
          md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:max-h-none md:rounded-none md:border-l md:border-t-0"
      >
        {/* Mobile Drag Handle */}
        <div className="w-full flex justify-center py-2 md:hidden cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-atlas-border" />
        </div>

        {/* Panel Header */}
        <div className="p-5 border-b border-atlas-border flex items-start justify-between gap-4 bg-atlas-surface/30">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-atlas-brass uppercase font-bold tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {event.layers[0]?.label || event.category}
              </span>
              <CertaintyTag
                confidence={event.date.confidence}
                note={event.date.confidence_note}
              />
            </div>
            <h2 className="font-serif text-xl font-bold text-atlas-parchment leading-tight">
              {event.title}
            </h2>
            <div className="font-mono text-xs text-atlas-brass font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to={`/history/${event.slug}`}
              className="p-1.5 text-atlas-muted hover:text-atlas-brass rounded hover:bg-atlas-surface transition-colors"
              title="Open full page"
              aria-label="Open full page"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button
              onClick={closePanel}
              className="p-1.5 text-atlas-muted hover:text-atlas-parchment rounded hover:bg-atlas-surface transition-colors"
              title="Close panel (Esc)"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="p-5 overflow-y-auto flex-grow space-y-6">
          <BeforeDuringAfter event={event} allEvents={events} />
        </div>
      </div>
    </>
  );
};
