import React from 'react';
import { useLayers } from '../../lib/queries/events';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { Layers, Check } from 'lucide-react';

interface LayerChipsProps {
  eventCounts?: Record<string, number>;
}

export const LayerChips: React.FC<LayerChipsProps> = ({ eventCounts = {} }) => {
  const { data: layers = [] } = useLayers();
  const { activeLayerKeys, toggleLayer, setAllLayers } = useTimelineStore();

  const isAllActive = layers.length > 0 && layers.every((l) => activeLayerKeys.includes(l.key));

  const handleToggleAll = () => {
    if (isAllActive) {
      setAllLayers([]);
    } else {
      setAllLayers(layers.map((l) => l.key));
    }
  };

  return (
    <div className="flex items-center gap-2 py-2 px-4 bg-atlas-panel border-b border-atlas-border overflow-x-auto overflow-y-hidden flex-nowrap custom-scrollbar shrink-0">
      <div className="flex items-center gap-1.5 text-atlas-muted text-xs font-mono uppercase tracking-wider mr-1 shrink-0">
        <Layers className="w-3.5 h-3.5 text-atlas-brass" />
        <span>Lanes:</span>
      </div>

      <button
        onClick={handleToggleAll}
        className={`px-3 py-1 text-xs rounded-full border font-mono transition-all flex items-center gap-1.5 shrink-0 ${
          isAllActive
            ? 'bg-atlas-brass/20 text-atlas-brass border-atlas-brass/50'
            : 'bg-atlas-surface/50 text-atlas-muted border-atlas-border hover:border-atlas-muted'
        }`}
      >
        <span>All</span>
      </button>

      {layers.map((layer) => {
        const isActive = activeLayerKeys.includes(layer.key);
        const count = eventCounts[layer.key] || 0;

        return (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.key)}
            className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1.5 shrink-0 ${
              isActive
                ? 'bg-atlas-surface border-atlas-brass text-atlas-parchment shadow-sm'
                : 'bg-atlas-panel/40 border-atlas-border text-atlas-subtle hover:text-atlas-muted hover:border-atlas-border/80'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                isActive ? 'bg-atlas-brass' : 'bg-atlas-subtle'
              }`}
            />
            <span className="font-sans whitespace-nowrap">{layer.label}</span>
            {count > 0 && (
              <span className="ml-1 font-mono text-[10px] opacity-70">
                ({count})
              </span>
            )}
            {isActive && <Check className="w-3 h-3 text-atlas-brass ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
};
