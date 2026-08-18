import React from 'react';
import type { DateConfidence } from '../../lib/types/database.types';
import { ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

interface CertaintyTagProps {
  confidence: DateConfidence;
  note?: string | null;
}

export const CertaintyTag: React.FC<CertaintyTagProps> = ({ confidence, note }) => {
  const isDebated =
    confidence === 'debated' ||
    confidence === 'traditional' ||
    confidence === 'legendary';

  const label = confidence.replace('_', ' ');

  return (
    <div
      title={note || `Historical confidence: ${label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono border transition-colors ${
        isDebated
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          : 'bg-atlas-brass/10 text-atlas-brass border-atlas-brass/30'
      }`}
    >
      {isDebated ? (
        <AlertCircle className="w-3 h-3 text-amber-400" />
      ) : confidence === 'well_established' ? (
        <ShieldCheck className="w-3 h-3 text-atlas-brass" />
      ) : (
        <HelpCircle className="w-3 h-3 text-atlas-brass" />
      )}
      <span className="capitalize">{label}</span>
    </div>
  );
};
