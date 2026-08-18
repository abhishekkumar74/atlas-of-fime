import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntityRelationships } from '../../lib/queries/relationships';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import type { EntityType } from '../../lib/types/database.types';
import { Share2, User, Calendar, ArrowUpRight, Link2 } from 'lucide-react';

interface ConnectionsListProps {
  entityType: EntityType;
  entityId: string;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({
  entityType,
  entityId,
}) => {
  const navigate = useNavigate();
  const { openPanel } = useTimelineStore();
  const { data: connections = [], isLoading } = useEntityRelationships(
    entityType,
    entityId
  );

  const handleJump = (conn: (typeof connections)[0]) => {
    if (conn.targetType === 'event') {
      openPanel(conn.targetId);
      // Navigate home if currently on detail page
      if (window.location.pathname.startsWith('/history/people/')) {
        navigate('/');
      }
    } else if (conn.targetType === 'person') {
      navigate(`/history/people/${conn.targetSlug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-2 font-mono text-xs text-atlas-muted animate-pulse">
        Loading knowledge graph connections...
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="p-3 bg-atlas-surface/20 border border-atlas-border/40 rounded text-xs text-atlas-subtle italic">
        No recorded graph connections for this entity yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-xs uppercase font-bold tracking-wider text-atlas-brass flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          Knowledge Connections ({connections.length})
        </h4>
      </div>

      <div className="space-y-2">
        {connections.map((conn) => (
          <button
            key={conn.id}
            onClick={() => handleJump(conn)}
            className="w-full p-2.5 bg-atlas-surface/50 hover:bg-atlas-surface border border-atlas-border hover:border-atlas-brass/50 rounded-lg text-left transition-all group flex items-start justify-between gap-3 shadow-sm"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Relationship Tag */}
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-atlas-brass/15 text-atlas-brass border border-atlas-brass/30 font-bold">
                  {conn.direction === 'incoming' ? '← ' : ''}
                  {conn.relationship.replace('_', ' ')}
                </span>

                {/* Target Type Badge */}
                <span className="font-mono text-[9px] text-atlas-muted flex items-center gap-1">
                  {conn.targetType === 'person' ? (
                    <User className="w-2.5 h-2.5 text-atlas-brass" />
                  ) : (
                    <Calendar className="w-2.5 h-2.5 text-atlas-brass" />
                  )}
                  <span className="capitalize">{conn.targetType}</span>
                </span>
              </div>

              {/* Target Title */}
              <div className="font-serif text-xs font-semibold text-atlas-parchment group-hover:text-atlas-brass transition-colors truncate">
                {conn.targetTitle}
              </div>

              {conn.note && (
                <div className="font-sans text-[11px] text-atlas-subtle line-clamp-1">
                  {conn.note}
                </div>
              )}
            </div>

            <div className="p-1 rounded bg-atlas-panel border border-atlas-border text-atlas-muted group-hover:text-atlas-brass group-hover:border-atlas-brass/50 flex-shrink-0 transition-colors">
              {conn.targetType === 'event' ? (
                <Link2 className="w-3.5 h-3.5" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
