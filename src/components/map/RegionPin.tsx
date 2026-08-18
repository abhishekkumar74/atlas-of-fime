import React from 'react';
import type { RegionRecord } from '../../lib/types/database.types';

interface RegionPinProps {
  region: RegionRecord;
  isPrimary: boolean;
  isSecondary: boolean;
  onClick?: () => void;
}

export const RegionPin: React.FC<RegionPinProps> = ({
  region,
  isPrimary,
  isSecondary,
  onClick,
}) => {
  return (
    <g
      transform={`translate(${region.x}, ${region.y})`}
      onClick={onClick}
      className="cursor-pointer group select-none"
    >
      {/* Primary Pulsing Pulse Ring */}
      {isPrimary && (
        <circle
          r="16"
          className="fill-atlas-brass/30 stroke-atlas-brass/60 animate-ping origin-center"
        />
      )}

      {/* Secondary Pulse Ring */}
      {isSecondary && (
        <circle
          r="12"
          className="fill-atlas-parchment/20 stroke-atlas-parchment/40 origin-center"
        />
      )}

      {/* Main Outer Circle */}
      <circle
        r={isPrimary ? '8' : isSecondary ? '6' : '4'}
        className={`transition-all duration-300 ${
          isPrimary
            ? 'fill-atlas-brass stroke-atlas-parchment stroke-2 shadow-[0_0_12px_rgba(201,161,92,0.8)]'
            : isSecondary
            ? 'fill-atlas-parchment stroke-atlas-brass stroke-1 opacity-90'
            : 'fill-atlas-subtle/50 stroke-atlas-border group-hover:fill-atlas-brass/60 group-hover:r-6'
        }`}
      />

      {/* Inner Dot */}
      <circle
        r={isPrimary ? '3' : '2'}
        className={isPrimary ? 'fill-atlas-bg' : 'fill-atlas-bg/80'}
      />

      {/* Label Text Tag */}
      {(isPrimary || isSecondary) && (
        <g transform="translate(0, -14)">
          <rect
            x={-region.label.length * 3.5 - 6}
            y="-10"
            width={region.label.length * 7 + 12}
            height="16"
            rx="4"
            className={
              isPrimary
                ? 'fill-atlas-panel stroke-atlas-brass stroke-1'
                : 'fill-atlas-surface stroke-atlas-border stroke-1'
            }
          />
          <text
            textAnchor="middle"
            y="2"
            className={`font-mono text-[9px] font-bold ${
              isPrimary ? 'fill-atlas-brass' : 'fill-atlas-parchment'
            }`}
          >
            {region.label}
          </text>
        </g>
      )}
    </g>
  );
};
