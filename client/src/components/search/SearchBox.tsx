import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchEntitiesServer } from '../../lib/searchServer';
import type { UnifiedSearchResult } from '../../lib/types/database.types';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { Search, X, Calendar, ArrowRight, Loader2, User, Globe, Clock } from 'lucide-react';

export const SearchBox: React.FC = () => {
  const navigate = useNavigate();
  const { openPanel } = useTimelineStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<any>(null);

  // Debounced server search effect (200ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchEntitiesServer(trimmed, 6);
        setResults(searchResults);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (result: UnifiedSearchResult) => {
    if (result.entityType === 'person') {
      navigate(result.targetUrl);
    } else if (result.entityType === 'event') {
      openPanel(result.id);
    } else {
      navigate('/');
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* Input Field */}
      <div className="relative flex items-center">
        {isSearching ? (
          <Loader2 className="absolute left-3 w-4 h-4 text-atlas-brass animate-spin pointer-events-none" />
        ) : (
          <Search className="absolute left-3 w-4 h-4 text-atlas-muted pointer-events-none" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search events, people, dates, or eras..."
          className="w-full pl-9 pr-8 py-1.5 bg-atlas-surface border border-atlas-border rounded-md text-xs text-atlas-text placeholder-atlas-subtle focus:outline-none focus:border-atlas-brass transition-colors font-sans"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-0.5 text-atlas-subtle hover:text-atlas-muted"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-atlas-panel border border-atlas-border rounded-md shadow-2xl z-50 overflow-hidden divide-y divide-atlas-border/40 max-h-80 overflow-y-auto">
          {isSearching && results.length === 0 ? (
            <div className="p-4 text-center font-mono text-xs text-atlas-brass animate-pulse flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Querying database index...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center font-sans text-xs text-atlas-muted">
              No historical entities matching &ldquo;<span className="text-atlas-parchment">{query}</span>&rdquo;
            </div>
          ) : (
            results.map((item, idx) => {
              const isHighlighted = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-3 text-left transition-colors flex items-start justify-between gap-3 ${
                    isHighlighted
                      ? 'bg-atlas-surface border-l-2 border-l-atlas-brass'
                      : 'hover:bg-atlas-surface/50'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-serif text-xs font-semibold text-atlas-parchment truncate flex items-center gap-1.5">
                      {item.entityType === 'person' ? (
                        <User className="w-3 h-3 text-atlas-brass flex-shrink-0" />
                      ) : item.entityType === 'civilization' ? (
                        <Globe className="w-3 h-3 text-atlas-brass flex-shrink-0" />
                      ) : (
                        <Clock className="w-3 h-3 text-atlas-brass flex-shrink-0" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <div className="font-sans text-[11px] text-atlas-muted line-clamp-1">
                      {item.summary}
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    {item.year && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-atlas-brass bg-atlas-brass/10 px-1.5 py-0.5 rounded border border-atlas-brass/20">
                        <Calendar className="w-2.5 h-2.5" />
                        {item.year}
                      </span>
                    )}
                    {isHighlighted && (
                      <ArrowRight className="w-3 h-3 text-atlas-brass mt-1" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
