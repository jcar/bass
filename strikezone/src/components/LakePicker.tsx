'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, X, Sun, CloudSun, Cloud, CloudRain, Search, Star } from 'lucide-react';
import type { SkyCondition, Lake } from '@/lib/types';
import LakeSearchPanel from './LakeSearchPanel';

export type { Lake };

interface LakePickerProps {
  selectedLake: Lake | null;
  onLakeSelect: (lake: Lake) => void;
  onClear: () => void;
  onUseGPS?: () => void;
  gpsLocating?: boolean;
  locationName?: string;
  today?: { skyCondition: SkyCondition; airTempHigh: number; airTempLow: number; waterTemp: number };
  favoriteLakeIds?: string[];
  onToggleFavorite?: (lakeId: string) => void;
  lastFetchTimestamp?: number;
  userLat?: number;
  userLon?: number;
  favoriteLakes?: Lake[];
}

const skyIconSm: Record<SkyCondition, React.ReactNode> = {
  clear: <Sun className="w-3 h-3 text-amber-400" />,
  'partly-cloudy': <CloudSun className="w-3 h-3 text-sky-300" />,
  overcast: <Cloud className="w-3 h-3 text-slate-400" />,
  rain: <CloudRain className="w-3 h-3 text-blue-400" />,
};

export default function LakePicker({
  selectedLake, onLakeSelect, onClear, onUseGPS, gpsLocating, locationName,
  today, favoriteLakeIds = [], onToggleFavorite, lastFetchTimestamp,
  userLat, userLon, favoriteLakes,
}: LakePickerProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearchSelect(lake: Lake) {
    onLakeSelect(lake);
    setOpen(false);
  }

  function handleGPS() {
    onUseGPS?.();
    setOpen(false);
  }

  function closePanel() {
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-1.5 text-left hover:border-slate-600 transition-colors"
      >
        <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
        <span className="text-xs font-mono text-white truncate max-w-[140px]">
          {selectedLake ? `${selectedLake.name}` : (locationName || 'Select lake...')}
        </span>

        {today && (
          <>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              {skyIconSm[today.skyCondition]}
              <span className="text-xs font-mono text-white">{today.airTempHigh}°</span>
              <span className="text-xs font-mono text-slate-500">{today.airTempLow}°</span>
            </div>
            {/* Water temp — hidden on mobile (visible in CommandStrip) */}
            <div className="hidden sm:flex items-center gap-1">
              <div className="w-px h-4 bg-slate-700" />
              <span className="text-xs font-mono text-sky-300">{today.waterTemp}°</span>
            </div>
          </>
        )}

        {/* Fetch timestamp — hidden on mobile */}
        {lastFetchTimestamp != null && lastFetchTimestamp > 0 && (
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-px h-4 bg-slate-700" />
            <span className="text-xs font-mono text-slate-600">
              {(() => {
                const mins = Math.round((Date.now() - lastFetchTimestamp) / 60000);
                if (mins < 1) return 'Just now';
                if (mins < 60) return `${mins}m ago`;
                return `${Math.round(mins / 60)}h ago`;
              })()}
            </span>
          </div>
        )}

        <ChevronDown className={`w-3 h-3 text-slate-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* ── Dropdown Panel — opens directly to search ── */}
      {open && (
        <div className="absolute top-full right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden"
          style={{ width: 'min(calc(100vw - 2rem), 540px)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Search className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Change Lake</span>
            </div>
            <button onClick={closePanel} className="text-slate-500 hover:text-slate-300 p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lake info strip */}
          {selectedLake && (
            <div className="px-3 py-2 bg-emerald-500/5 border-b border-slate-800/50 flex items-center gap-3">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-mono font-semibold text-white">{selectedLake.name}</span>
                <span className="text-xs font-mono text-slate-500 ml-2">
                  {selectedLake.state}
                  {selectedLake.surfaceAcres > 0 && <> &middot; {selectedLake.surfaceAcres.toLocaleString()} ac</>}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400 flex-shrink-0">
                {selectedLake.maxDepth && <span>{selectedLake.maxDepth}ft deep</span>}
                {selectedLake.surfaceAcres && <span>{selectedLake.surfaceAcres.toLocaleString()} ac</span>}
              </div>
              {onToggleFavorite && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(selectedLake.id); }}
                  className="p-0.5 rounded hover:bg-slate-700 transition-colors flex-shrink-0"
                  title={favoriteLakeIds.includes(selectedLake.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-3.5 h-3.5 ${
                    favoriteLakeIds.includes(selectedLake.id)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-500 hover:text-amber-400'
                  }`} />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="p-0.5 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Search panel — always shown */}
          <LakeSearchPanel
            onSelect={handleSearchSelect}
            onUseGPS={onUseGPS ? handleGPS : undefined}
            gpsLocating={gpsLocating}
            userLat={userLat}
            userLon={userLon}
            selectedLake={selectedLake ?? undefined}
            favoriteLakes={favoriteLakes}
          />
        </div>
      )}
    </div>
  );
}
