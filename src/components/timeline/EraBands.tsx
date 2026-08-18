import React from 'react';
import { yearsBPtoPos } from '../../lib/dateEngine';

interface EraBand {
  label: string;
  sublabel: string;
  startBP: number;
  endBP: number;
}

const ERAS: EraBand[] = [
  {
    label: 'Cosmic & Deep Time',
    sublabel: '13.8B - 541M BP',
    startBP: 13_800_000_000,
    endBP: 541_000_000,
  },
  {
    label: 'Prehistory',
    sublabel: '541M - 12K BP',
    startBP: 541_000_000,
    endBP: 12_000,
  },
  {
    label: 'Ancient World',
    sublabel: '10,000 BCE - 500 CE',
    startBP: 12_000,
    endBP: 1526,
  },
  {
    label: 'Medieval Era',
    sublabel: '500 CE - 1500 CE',
    startBP: 1526,
    endBP: 526,
  },
  {
    label: 'Modern Era',
    sublabel: '1500 CE - Present',
    startBP: 526,
    endBP: 0,
  },
];

export const EraBands: React.FC = () => {
  return (
    <div className="relative w-full h-12 border-b border-atlas-border/60 bg-atlas-panel/40 select-none overflow-hidden">
      {ERAS.map((era, idx) => {
        const left = yearsBPtoPos(era.startBP);
        const right = yearsBPtoPos(era.endBP);
        const width = Math.max(0.5, right - left);

        return (
          <div
            key={idx}
            className="absolute top-0 bottom-0 border-r border-atlas-border/40 px-2 py-1 flex flex-col justify-center transition-colors hover:bg-atlas-surface/30"
            style={{
              left: `${left}%`,
              width: `${width}%`,
            }}
          >
            <span className="font-serif text-[11px] tracking-wider uppercase text-atlas-parchment/90 truncate">
              {era.label}
            </span>
            <span className="font-mono text-[9px] text-atlas-subtle truncate">
              {era.sublabel}
            </span>
          </div>
        );
      })}
    </div>
  );
};
