import React, { useState } from 'react';
import { Tag, ShieldCheck, Calendar } from 'lucide-react';

interface HoverPreviewProps {
  title: string;
  formattedDate: string;
  summary: string;
  category?: string;
  confidence?: string;
  children: React.ReactNode;
}

export const HoverPreview: React.FC<HoverPreviewProps> = ({
  title,
  formattedDate,
  summary,
  category,
  confidence,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      {/* Floating Preview Tooltip Card */}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-atlas-panel/95 border border-atlas-brass/50 rounded-lg shadow-2xl z-50 pointer-events-none backdrop-blur-md animate-fade-in">
          {/* Eyebrow date & certainty tag */}
          <div className="flex items-center justify-between gap-2 border-b border-atlas-border/50 pb-1.5 mb-1.5 text-[10px] font-mono">
            <div className="flex items-center gap-1 text-atlas-brass font-semibold">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            {confidence && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-atlas-surface border border-atlas-border text-atlas-parchment">
                <ShieldCheck className="w-3 h-3 text-atlas-brass" />
                <span className="capitalize">{confidence.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          {/* Title & Category */}
          <div className="space-y-1">
            {category && (
              <div className="inline-flex items-center gap-1 text-[9px] font-mono text-atlas-muted uppercase">
                <Tag className="w-2.5 h-2.5 text-atlas-brass" />
                <span>{category}</span>
              </div>
            )}
            <h4 className="font-serif text-xs font-bold text-atlas-parchment line-clamp-1">
              {title}
            </h4>
            <p className="font-sans text-[11px] text-atlas-text/90 line-clamp-2 leading-tight">
              {summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
