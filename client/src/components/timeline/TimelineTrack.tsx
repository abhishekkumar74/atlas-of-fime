import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { TimelineEvent, LayerRecord } from '../../lib/types/database.types';
import { yearsBPtoPos } from '../../lib/dateEngine';
import { calculateAnchoredScroll } from '../../lib/zoomEngine';
import {
  calculateVisibleYearRange,
  filterVisibleEvents,
} from '../../lib/virtualizationEngine';
import { layoutLaneNodes } from '../../lib/layoutNodes';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { EraBands } from './EraBands';
import { TimelineNode } from './TimelineNode';

interface TimelineTrackProps {
  events: TimelineEvent[];
  layers: LayerRecord[];
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({ events, layers }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const {
    activeLayerKeys,
    zoomFactor,
    setZoomFactor,
    targetYearsBP,
  } = useTimelineStore();

  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1200);

  // Track container width based on zoom percentage (100% = 3600px base track)
  const baseTrackWidth = 3600;
  const trackWidth = (baseTrackWidth * zoomFactor) / 100;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollLeft(container.scrollLeft);
    };

    const handleResize = () => {
      setViewportWidth(container.clientWidth);
    };

    handleResize();
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Smooth scroll sync when targetYearsBP changes via Time Machine Scrubber
  useEffect(() => {
    if (targetYearsBP === null || !containerRef.current) return;
    const targetPosPercent = yearsBPtoPos(targetYearsBP);
    const targetPx = (targetPosPercent / 100) * trackWidth;
    const centeredScrollLeft = Math.max(0, targetPx - viewportWidth / 2);

    containerRef.current.scrollTo({
      left: centeredScrollLeft,
      behavior: 'smooth',
    });
  }, [targetYearsBP, trackWidth, viewportWidth]);

  const bounds = useMemo(() => {
    return calculateVisibleYearRange(scrollLeft, viewportWidth, trackWidth);
  }, [scrollLeft, viewportWidth, trackWidth]);

  const visibleEvents = useMemo(() => {
    return filterVisibleEvents(events, bounds, activeLayerKeys);
  }, [events, bounds, activeLayerKeys]);

  const activeLayers = useMemo(() => {
    if (activeLayerKeys.length === 0) return layers;
    return layers.filter((l) => activeLayerKeys.includes(l.key));
  }, [layers, activeLayerKeys]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseOffsetPx = e.clientX - rect.left;
    const delta = e.deltaY < 0 ? 25 : -25;
    const targetZoom = Math.min(Math.max(100, zoomFactor + delta), 2000);

    if (targetZoom === zoomFactor) return;

    const oldTrackWidth = (baseTrackWidth * zoomFactor) / 100;
    const newTrackWidth = (baseTrackWidth * targetZoom) / 100;

    const newScrollLeft = calculateAnchoredScroll({
      currentScrollLeft: container.scrollLeft,
      mouseOffsetPx,
      oldZoomFactor: oldTrackWidth,
      newZoomFactor: newTrackWidth,
    });

    setZoomFactor(targetZoom);
    requestAnimationFrame(() => {
      container.scrollLeft = newScrollLeft;
    });
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="w-full flex-grow overflow-x-auto overflow-y-auto bg-atlas-bg select-none custom-scrollbar relative"
    >
      <div
        ref={trackRef}
        style={{ width: `${trackWidth}px` }}
        className="min-h-[440px] h-full flex flex-col relative transition-all duration-75"
      >
        {/* Era Header Bands */}
        <EraBands trackWidth={trackWidth} />

        {/* Layer Lane Tracks */}
        <div className="flex-grow flex flex-col relative divide-y divide-atlas-border/40 py-1">
          {activeLayers.map((layer) => {
            const laneEvents = visibleEvents.filter((e) =>
              e.layers.some((l) => l.key === layer.key)
            );

            const totalLayerEvents = events.filter((e) =>
              e.layers.some((l) => l.key === layer.key)
            );

            // Compute collision-free depthRow layout for this lane
            const { nodes, maxDepthRow } = layoutLaneNodes(laneEvents, trackWidth, 150);
            const laneHeightPx = Math.max(70, maxDepthRow * 28 + 65);

            return (
              <div
                key={layer.id}
                style={{ height: `${laneHeightPx}px` }}
                className="relative flex items-start hover:bg-atlas-panel/20 transition-colors py-1"
              >
                {/* Sticky Left Lane Label */}
                <div
                  className="sticky left-0 z-30 flex items-center gap-2 bg-atlas-panel/95 backdrop-blur-md px-3 py-1.5 border-r border-b border-atlas-border font-sans font-semibold text-xs text-atlas-parchment shadow-md shrink-0 pointer-events-auto min-w-[180px] max-w-[210px]"
                  title={layer.label}
                >
                  <div className="w-2 h-2 rounded-full bg-atlas-brass shrink-0" />
                  <span className="truncate">{layer.label}</span>
                  <span className="font-mono text-[10px] text-atlas-muted font-normal shrink-0">
                    ({totalLayerEvents.length})
                  </span>
                </div>

                {/* Virtualized & Collision-Free Timeline Event Nodes */}
                <div className="relative flex-grow h-full">
                  {nodes.map(({ event, leftPosPercent, depthRow }) => (
                    <TimelineNode
                      key={event.id}
                      event={event}
                      leftPosPercent={leftPosPercent}
                      depthRow={depthRow}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
