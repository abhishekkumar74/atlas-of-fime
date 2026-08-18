import React from 'react';
import { useTimelineStore, ScalePreset } from '../../lib/store/useTimelineStore';
import { PRESET_CONFIGS } from '../../lib/zoomEngine';
import { ZoomIn, ZoomOut, RotateCcw, HelpCircle } from 'lucide-react';

export const ZoomControls: React.FC = () => {
  const {
    zoomFactor,
    zoomIn,
    zoomOut,
    resetZoom,
    activePreset,
    setActivePreset,
  } = useTimelineStore();

  const presets: ScalePreset[] = ['full', 'agriculture', '1900'];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-4 bg-atlas-panel/80 border-b border-atlas-border backdrop-blur">
      <div className="flex items-center gap-3">
        {/* Zoom In/Out + Readout */}
        <div
          className="flex items-center gap-1 bg-atlas-surface p-1 rounded border border-atlas-border"
          title="Scroll to pan · Ctrl+Scroll to zoom"
        >
          <button
            onClick={zoomOut}
            disabled={zoomFactor <= 1.0}
            className="p-1 rounded text-atlas-muted hover:text-atlas-parchment hover:bg-atlas-panel disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-xs text-atlas-brass font-bold px-2 min-w-[50px] text-center cursor-help">
            {Math.round(zoomFactor * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={zoomFactor >= 20.0}
            className="p-1 rounded text-atlas-muted hover:text-atlas-parchment hover:bg-atlas-panel disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {zoomFactor > 1.0 && (
            <button
              onClick={resetZoom}
              className="p-1 ml-1 rounded text-atlas-subtle hover:text-atlas-brass hover:bg-atlas-panel transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="h-4 w-[1px] bg-atlas-border hidden sm:block" />

        {/* Preset Tabs */}
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] uppercase text-atlas-subtle mr-1 hidden sm:inline">
            Scale Presets:
          </span>
          {presets.map((key) => {
            const config = PRESET_CONFIGS[key];
            const isActive = activePreset === key;

            return (
              <button
                key={key}
                onClick={() => setActivePreset(key)}
                className={`px-2.5 py-1 text-xs rounded transition-all font-sans ${
                  isActive
                    ? 'bg-atlas-brass text-atlas-bg font-semibold shadow-sm'
                    : 'bg-atlas-surface/60 text-atlas-muted border border-atlas-border hover:text-atlas-parchment hover:border-atlas-muted'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtle Hover Tooltip Badge */}
      <div
        className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-atlas-muted hover:text-atlas-brass transition-colors cursor-help px-2 py-1 rounded bg-atlas-surface/40 border border-atlas-border/50"
        title="Scroll horizontally to pan through eras. Hold Ctrl (or Cmd) while scrolling over the timeline to zoom smoothly anchored under your mouse cursor."
      >
        <HelpCircle className="w-3.5 h-3.5 text-atlas-brass" />
        <span>Pan & Zoom Help</span>
      </div>
    </div>
  );
};
