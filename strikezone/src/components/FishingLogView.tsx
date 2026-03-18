'use client';

import { useState, useMemo } from 'react';
import { X, Trash2, Fish, Star, TrendingUp } from 'lucide-react';
import { loadLog, deleteEntry, type LogEntry } from '@/lib/fishingLog';
import { getAccuracyByBiteRange, getAnglerUsage } from '@/lib/logStats';
import { ANGLER_META } from '@/lib/theme';

interface FishingLogViewProps {
  onClose: () => void;
}

export default function FishingLogView({ onClose }: FishingLogViewProps) {
  const [log, setLog] = useState<LogEntry[]>(() => loadLog());
  const [filterLake, setFilterLake] = useState<string | null>(null);

  const filteredLog = useMemo(
    () => filterLake ? log.filter(e => e.lakeId === filterLake) : log,
    [log, filterLake],
  );

  const lakes = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of log) seen.set(e.lakeId, e.lakeName);
    return [...seen.entries()];
  }, [log]);

  const biteStats = useMemo(() => getAccuracyByBiteRange(filteredLog), [filteredLog]);
  const anglerUsage = useMemo(() => getAnglerUsage(filteredLog), [filteredLog]);

  function handleDelete(id: string) {
    deleteEntry(id);
    setLog(loadLog());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 border-b border-slate-700 flex-shrink-0">
          <Fish className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-white">Fishing Log</span>
          <span className="text-xs text-slate-500 font-mono">{log.length} entries</span>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Summary Stats */}
          {biteStats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {biteStats.map(stat => (
                <div key={stat.range} className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
                  <div className="text-xs font-mono text-slate-500 uppercase">Bite {stat.range}</div>
                  <div className="text-lg font-bold text-white font-mono">{stat.avgFishCount}</div>
                  <div className="text-xs text-slate-500">avg fish ({stat.entries} trips)</div>
                </div>
              ))}
            </div>
          )}

          {/* Top anglers used */}
          {anglerUsage.length > 0 && (
            <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> Anglers You Follow Most
              </div>
              <div className="flex flex-wrap gap-2">
                {anglerUsage.slice(0, 5).map(a => {
                  const meta = ANGLER_META[a.anglerId];
                  return (
                    <span key={a.anglerId} className="text-xs font-mono px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                      {meta?.fullName ?? a.anglerId} <span className="text-slate-500">({a.count}x)</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lake filter */}
          {lakes.length > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterLake(null)}
                className={`px-2 py-1 rounded-md text-xs font-mono ${
                  !filterLake ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                All
              </button>
              {lakes.map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => setFilterLake(id)}
                  className={`px-2 py-1 rounded-md text-xs font-mono ${
                    filterLake === id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Log Entries */}
          {filteredLog.length === 0 ? (
            <div className="text-center py-12">
              <Fish className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-mono">No catches logged yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLog.map(entry => (
                <div key={entry.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(entry.timestamp).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{entry.lakeName}</span>
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                      entry.biteIntensity >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                      entry.biteIntensity >= 45 ? 'bg-sky-500/10 text-sky-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      Bite: {entry.biteIntensity}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{entry.seasonLabel}</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="ml-auto text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold font-mono">{entry.userReport.fishCount} fish</span>
                    {entry.userReport.biggestFish && (
                      <span className="text-xs text-slate-400 font-mono">Big: {entry.userReport.biggestFish}lb</span>
                    )}
                    <span className="text-xs text-slate-400 font-mono">Threw: {entry.userReport.lureUsed}</span>
                    <div className="flex gap-0.5 ml-auto">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star
                          key={n}
                          className={`w-3 h-3 ${
                            n <= entry.userReport.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {entry.userReport.notes && (
                    <p className="text-xs text-slate-500 mt-1 italic">{entry.userReport.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
