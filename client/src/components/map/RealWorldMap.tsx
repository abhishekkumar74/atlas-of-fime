import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { useRegions, useEventMapState } from '../../lib/queries/map';
import { useEvents } from '../../lib/queries/events';
import { resolveHistoricalBoundary, HistoricalBoundaryResult } from '../../lib/historicalBoundaries';
import { formatYearsBP } from '../../lib/dateEngine';
import { HoverPreview } from '../common/HoverPreview';
import { Map, AlertCircle, Compass, Info } from 'lucide-react';

export const RealWorldMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const { selectedEventId, openPanel, activeLayerKeys } = useTimelineStore();
  const { data: regions = [] } = useRegions();
  const { data: events = [] } = useEvents();
  const { data: mapState } = useEventMapState(selectedEventId);

  const [boundaryState, setBoundaryState] = useState<HistoricalBoundaryResult | null>(null);
  const [markerPositions, setMarkerPositions] = useState<Record<string, { x: number; y: number }>>({});

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Initialize MapLibre GL JS Instance and sync projected marker positions on zoom/move
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'openfreemap-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'dark-background',
            type: 'background',
            paint: { 'background-color': '#0B0E14' },
          },
          {
            id: 'osm-raster',
            type: 'raster',
            source: 'openfreemap-tiles',
            paint: { 'raster-opacity': 0.35, 'raster-brightness-max': 0.7 },
          },
        ],
      },
      center: [20, 20],
      zoom: 1.8,
      minZoom: 1,
      maxZoom: 8,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    const updateMarkerPositions = () => {
      const currentMap = mapRef.current;
      if (!currentMap) return;

      const newPos: Record<string, { x: number; y: number }> = {};
      for (const reg of regions) {
        if (reg.lng !== undefined && reg.lat !== undefined) {
          const point = currentMap.project([reg.lng, reg.lat]);
          newPos[reg.id] = { x: point.x, y: point.y };
        }
      }
      setMarkerPositions(newPos);
    };

    map.on('load', updateMarkerPositions);
    map.on('move', updateMarkerPositions);
    map.on('zoom', updateMarkerPositions);
    map.on('resize', updateMarkerPositions);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [regions]);

  // Update center, flyTo region, and fetch GeoJSON historical boundary when event changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (mapState?.primaryRegion?.lng !== undefined && mapState?.primaryRegion?.lat !== undefined) {
      map.flyTo({
        center: [mapState.primaryRegion.lng, mapState.primaryRegion.lat],
        zoom: mapState.primaryRegion.key === 'global' ? 1.5 : 3.5,
        speed: 1.2,
      });
    }

    if (!selectedEvent) {
      setBoundaryState(null);
      return;
    }

    // Resolve historical boundary snapshot
    const res = resolveHistoricalBoundary(
      selectedEvent.date.years_before_present,
      selectedEvent.date.year_start
    );
    setBoundaryState(res);

    // Render historical boundary overlay if available
    if (res.isAvailable && res.geojsonUrl) {
      const sourceId = 'historical-boundary-src';
      const layerFillId = 'historical-boundary-fill';
      const layerOutlineId = 'historical-boundary-outline';

      fetch(res.geojsonUrl)
        .then((r) => (r.ok ? r.json() : null))
        .then((geoJson) => {
          if (!geoJson || !mapRef.current) return;
          const currentMap = mapRef.current;

          if (currentMap.getLayer(layerFillId)) currentMap.removeLayer(layerFillId);
          if (currentMap.getLayer(layerOutlineId)) currentMap.removeLayer(layerOutlineId);
          if (currentMap.getSource(sourceId)) currentMap.removeSource(sourceId);

          currentMap.addSource(sourceId, {
            type: 'geojson',
            data: geoJson,
          });

          currentMap.addLayer({
            id: layerFillId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': '#C9A15C',
              'fill-opacity': 0.2,
            },
          });

          currentMap.addLayer({
            id: layerOutlineId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#C9A15C',
              'line-width': 1.5,
              'line-opacity': 0.8,
            },
          });
        })
        .catch(() => {
          // Fallback gracefully on fetch error
        });
    }
  }, [selectedEvent, mapState]);

  const primaryKey = mapState?.primaryRegion?.key;
  const secondaryKeys = (mapState?.secondaryRegions || []).map((r) => r.key);

  const formattedEventDate = selectedEvent
    ? formatYearsBP(
        selectedEvent.date.years_before_present,
        selectedEvent.date.calendar,
        selectedEvent.date.year_start
      )
    : '';

  // Active layer events to display on map when no single event is selected
  const activeEvents = events.filter((e) =>
    activeLayerKeys.length === 0
      ? true
      : e.layers.some((l) => activeLayerKeys.includes(l.key))
  );

  return (
    <div className="w-full bg-atlas-panel border-b border-atlas-border select-none shadow-lg">
      {/* Section Header Bar */}
      <div className="px-4 py-2 bg-atlas-surface/40 border-b border-atlas-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-atlas-brass uppercase font-bold tracking-wider">
          <Map className="w-4 h-4 text-atlas-brass" />
          <span>Real World Spatial Atlas (MapLibre GL + OpenFreeMap)</span>
        </div>
        {boundaryState && (
          <span className="font-mono text-[10px] text-atlas-brass px-2 py-0.5 rounded bg-atlas-brass/10 border border-atlas-brass/30 truncate max-w-sm">
            {boundaryState.disclosureNote}
          </span>
        )}
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-[200px] md:h-[240px] bg-[#0B0E14] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Region Pin Overlay Markers Synced 100% to Map Zoom & Pan */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {regions.map((reg) => {
            const pos = markerPositions[reg.id];
            if (!pos) return null;

            const isPrimary = reg.key === primaryKey;
            const isSecondary = secondaryKeys.includes(reg.key);

            const hasActiveEvents = activeEvents.some((e) =>
              reg.key === 'india' ? e.layers.some((l) => l.key === 'india') : true
            );

            if (!isPrimary && !isSecondary && !hasActiveEvents && selectedEvent) return null;

            return (
              <div
                key={reg.id}
                className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                }}
              >
                <HoverPreview
                  title={selectedEvent ? selectedEvent.title : reg.label}
                  formattedDate={formattedEventDate || 'Spatial Locus'}
                  summary={
                    isPrimary
                      ? `Primary locus for ${selectedEvent?.title || reg.label}.`
                      : `Regional locus across ${reg.label}.`
                  }
                  category={isPrimary ? 'Primary Locus' : 'Regional Context'}
                >
                  <button
                    onClick={() => selectedEventId && openPanel(selectedEventId)}
                    className={`p-1.5 rounded-full border shadow-xl transition-all hover:scale-125 focus:outline-none focus:ring-2 focus:ring-atlas-brass ${
                      isPrimary
                        ? 'bg-atlas-brass border-atlas-parchment shadow-[0_0_14px_rgba(201,161,92,0.9)] scale-125 animate-pulse'
                        : 'bg-atlas-panel border-atlas-brass hover:bg-atlas-surface'
                    }`}
                    title={selectedEvent ? selectedEvent.title : reg.label}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isPrimary ? 'bg-atlas-bg' : 'bg-atlas-brass'
                      }`}
                    />
                  </button>
                </HoverPreview>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Legend & Active Spatial Context Bar */}
      <div className="px-4 py-2.5 bg-atlas-panel border-t border-atlas-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase text-atlas-subtle font-bold">
            Active Spatial Context:
          </span>

          {selectedEvent ? (
            <div className="flex items-center gap-2 flex-wrap">
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
              Select an event node on the timeline below to sync real spatial location.
            </span>
          )}
        </div>

        {/* Boundary Snapshot Disclosure */}
        {boundaryState && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-atlas-surface text-atlas-parchment border border-atlas-brass/40 font-mono text-[11px]">
            <Info className="w-3.5 h-3.5 text-atlas-brass shrink-0" />
            <span className="truncate">{boundaryState.disclosureNote}</span>
          </div>
        )}

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
