import React from 'react';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { useRegions, useEventMapState } from '../../lib/queries/map';
import { useEvents } from '../../lib/queries/events';
import { RegionPin } from './RegionPin';
import { Map, AlertCircle, Compass } from 'lucide-react';

export const WorldMap: React.FC = () => {
  const { selectedEventId } = useTimelineStore();
  const { data: regions = [] } = useRegions();
  const { data: events = [] } = useEvents();
  const { data: mapState } = useEventMapState(selectedEventId);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const primaryKey = mapState?.primaryRegion?.key;
  const secondaryKeys = (mapState?.secondaryRegions || []).map((r) => r.key);

  return (
    <div className="w-full bg-atlas-panel border-b border-atlas-border select-none shadow-lg">
      {/* Map Section Header Bar */}
      <div className="px-4 py-2 bg-atlas-surface/40 border-b border-atlas-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-atlas-brass uppercase font-bold tracking-wider">
          <Map className="w-4 h-4 text-atlas-brass" />
          <span>Spatial Atlas — Schematic Region Map</span>
        </div>
        <span className="font-mono text-[10px] text-atlas-subtle hidden sm:inline">
          Illustrative Spatial Framework (1000×500)
        </span>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full aspect-[1000/380] max-h-[300px] bg-atlas-bg overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-contain filter drop-shadow-md"
        >
          {/* Schematic Grid Lines */}
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="#1E2533"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="url(#grid)" opacity="0.4" />

          {/* Equator & Prime Meridian Lines */}
          <line
            x1="0"
            y1="250"
            x2="1000"
            y2="250"
            stroke="#1E2533"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
          <line
            x1="500"
            y1="0"
            x2="500"
            y2="500"
            stroke="#1E2533"
            strokeWidth="1"
            strokeDasharray="6 6"
          />

          {/* Schematic Continent Geometries */}
          <g className="fill-atlas-surface/60 stroke-atlas-border stroke-1">
            {/* Americas Blob */}
            <path d="M 120 100 C 180 80, 280 120, 320 220 C 340 280, 260 400, 220 440 C 180 420, 160 300, 140 220 Z" />
            {/* Europe / Africa Blob */}
            <path d="M 440 90 C 520 80, 580 120, 560 180 C 580 240, 620 320, 560 420 C 480 440, 440 320, 460 220 C 420 180, 400 120, 440 90 Z" />
            {/* Asia / Australia Blob */}
            <path d="M 620 80 C 760 60, 900 120, 880 240 C 820 260, 840 340, 920 380 C 860 460, 780 400, 740 320 C 660 280, 600 180, 620 80 Z" />
          </g>

          {/* Region Pins */}
          {regions.map((region) => (
            <RegionPin
              key={region.id}
              region={region}
              isPrimary={region.key === primaryKey}
              isSecondary={secondaryKeys.includes(region.key)}
            />
          ))}
        </svg>
      </div>

      {/* Map Legend & Uncertainty Panel */}
      <div className="px-4 py-2.5 bg-atlas-panel border-t border-atlas-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase text-atlas-subtle font-bold">
            Active Spatial Context:
          </span>

          {selectedEvent ? (
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-atlas-parchment">
                {selectedEvent.title}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-atlas-brass/15 text-atlas-brass border border-atlas-brass/30">
                Primary: {mapState?.primaryRegion?.label || 'Global Scale'}
              </span>
              {mapState?.civilization && (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-atlas-surface text-atlas-muted border border-atlas-border">
                  Realm: {mapState.civilization.name}
                </span>
              )}
            </div>
          ) : (
            <span className="font-sans text-atlas-muted italic flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-atlas-brass" />
              Select an event node on the timeline below to sync spatial location.
            </span>
          )}
        </div>

        {/* Uncertainty Note Display */}
        {mapState?.uncertaintyNote && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-[11px] max-w-xl">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            <span className="truncate">{mapState.uncertaintyNote}</span>
          </div>
        )}
      </div>
    </div>
  );
};
