'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Navigation, Loader2 } from 'lucide-react';
import type { Lake } from '@/lib/types';
import { searchLakes } from '@/data/bass-lakes';

interface LakeSearchPanelProps {
  onSelect: (lake: Lake) => void;
  onUseGPS?: () => void;
  gpsLocating?: boolean;
  userLat?: number;
  userLon?: number;
  selectedLake?: Lake;
  favoriteLakes?: Lake[];
}

function approxDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = lat2 - lat1;
  const dLon = (lon2 - lon1) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon) * 69;
}

function formatDistance(miles: number): string {
  if (miles < 1) return '<1 mi';
  if (miles < 100) return `~${Math.round(miles)} mi`;
  return `~${Math.round(miles / 10) * 10} mi`;
}

export default function LakeSearchPanel({ onSelect, onUseGPS, gpsLocating, userLat, userLon, selectedLake, favoriteLakes }: LakeSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Lake[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasLocation = userLat != null && userLon != null;

  const search = useCallback((q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const found = searchLakes(q, hasLocation ? userLat : undefined, hasLocation ? userLon : undefined, 20);
    setResults(found);
  }, [hasLocation, userLat, userLon]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const showEmptyState = query.length < 2 && results.length === 0;

  return (
    <div>
      {/* Search input */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800">
        <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bass lakes..."
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
          autoFocus
        />
      </div>

      {/* GPS button */}
      {onUseGPS && (
        <button
          onClick={onUseGPS}
          disabled={gpsLocating}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 disabled:opacity-50"
        >
          {gpsLocating ? (
            <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin flex-shrink-0" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          )}
          <span className="text-xs text-sky-400 font-medium">
            {gpsLocating ? 'Getting location...' : 'Use my GPS location'}
          </span>
        </button>
      )}

      {/* Results */}
      <div className="max-h-64 overflow-y-auto">
        {results.length === 0 && query.length >= 2 && (
          <div className="px-3 py-4 text-center text-[10px] text-slate-600 font-mono">No lakes found</div>
        )}

        {/* Empty state: current lake + favorites */}
        {showEmptyState && (
          <>
            {selectedLake && (
              <button
                onClick={() => onSelect(selectedLake)}
                className="w-full px-3 py-2 text-left hover:bg-slate-800/80 transition-colors border-b border-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-white">{selectedLake.name}</span>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase">Current</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-mono text-slate-500">{selectedLake.state}</span>
                  {selectedLake.surfaceAcres > 0 && (
                    <span className="text-[9px] font-mono text-slate-500">{selectedLake.surfaceAcres.toLocaleString()} acres</span>
                  )}
                </div>
              </button>
            )}
            {favoriteLakes && favoriteLakes.length > 0 && (
              <>
                <div className="px-3 py-1 text-[9px] font-mono text-slate-600 uppercase tracking-wider">Favorites</div>
                {favoriteLakes.filter(l => l.id !== selectedLake?.id).map((lake) => (
                  <button
                    key={lake.id}
                    onClick={() => onSelect(lake)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800/80 transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-white">{lake.name}</span>
                      <span className="text-[9px] font-mono text-amber-400">★</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-mono text-slate-500">{lake.state}</span>
                      {hasLocation && (
                        <span className="text-[9px] font-mono text-slate-600">
                          {formatDistance(approxDistanceMiles(userLat, userLon, lake.lat, lake.lon))}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}
            <div className="px-3 py-4 text-center text-[10px] text-slate-600 font-mono">Type at least 2 characters to search</div>
          </>
        )}

        {results.map((lake) => (
          <button
            key={lake.id}
            onClick={() => onSelect(lake)}
            className="w-full px-3 py-2 text-left hover:bg-slate-800/80 transition-colors border-b border-slate-800/50 last:border-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-white">{lake.name}</span>
              <div className="flex items-center gap-1.5">
                {hasLocation && (
                  <span className="text-[9px] font-mono text-slate-600">
                    {formatDistance(approxDistanceMiles(userLat, userLon, lake.lat, lake.lon))}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-mono text-slate-500">{lake.state}</span>
              {lake.maxDepth > 0 && (
                <span className="text-[9px] font-mono text-cyan-500">{lake.maxDepth}ft deep</span>
              )}
              {lake.surfaceAcres > 0 && (
                <span className="text-[9px] font-mono text-slate-500">{lake.surfaceAcres.toLocaleString()} acres</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
