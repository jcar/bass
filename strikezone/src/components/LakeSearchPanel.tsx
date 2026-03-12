'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Navigation, Loader2 } from 'lucide-react';
import type { Lake } from '@/lib/types';

interface LakeSearchPanelProps {
  onSelect: (lake: Lake) => void;
  onUseGPS?: () => void;
  gpsLocating?: boolean;
}

export default function LakeSearchPanel({ onSelect, onUseGPS, gpsLocating }: LakeSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Lake[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/lakes?q=${encodeURIComponent(q)}&limit=20`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
    } catch {
      // ignore
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

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
          placeholder="Search 88,000+ US lakes..."
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
          autoFocus
        />
        {searchLoading && (
          <div className="w-3.5 h-3.5 border border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
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
        {results.length === 0 && query.length >= 2 && !searchLoading && (
          <div className="px-3 py-4 text-center text-[10px] text-slate-600 font-mono">No lakes found</div>
        )}
        {query.length < 2 && results.length === 0 && (
          <div className="px-3 py-4 text-center text-[10px] text-slate-600 font-mono">Type at least 2 characters to search</div>
        )}
        {results.map((lake) => (
          <button
            key={lake.id}
            onClick={() => onSelect(lake)}
            className="w-full px-3 py-2 text-left hover:bg-slate-800/80 transition-colors border-b border-slate-800/50 last:border-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-white">{lake.name}</span>
              <span className="text-[9px] font-mono text-slate-600 uppercase">{lake.type}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-mono text-slate-500">{lake.state} &middot; {lake.county} Co.</span>
              {lake.maxDepth && (
                <span className="text-[9px] font-mono text-cyan-500">{lake.maxDepth}ft deep</span>
              )}
              {lake.surfaceAcres && (
                <span className="text-[9px] font-mono text-slate-500">{lake.surfaceAcres.toLocaleString()} acres</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
