'use client';

import { useState, useCallback } from 'react';
import { Fish, X, Star } from 'lucide-react';
import type { StrikeAnalysis, WeatherConditions, Lake } from '@/lib/types';
import { saveEntry, type LogEntry } from '@/lib/fishingLog';

interface CatchLoggerProps {
  lake: Lake | null;
  conditions: WeatherConditions;
  analysis: StrikeAnalysis;
  onClose: () => void;
  onSaved: () => void;
  recommendedLures: string[];
}

export default function CatchLogger({
  lake, conditions, analysis, onClose, onSaved, recommendedLures,
}: CatchLoggerProps) {
  const [fishCount, setFishCount] = useState(0);
  const [biggestFish, setBiggestFish] = useState('');
  const [lureUsed, setLureUsed] = useState(recommendedLures[0] ?? '');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');

  const handleSave = useCallback(() => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      lakeId: lake?.id ?? 'unknown',
      lakeName: lake?.name ?? 'Unknown Lake',
      conditions: { ...conditions },
      biteIntensity: analysis.biteIntensity,
      fishDepth: analysis.fishDepth,
      seasonLabel: analysis.seasonalPhase.label,
      topAnglerPick: {
        anglerId: analysis.anglerPicks[0]?.anglerId ?? '',
        lureName: analysis.anglerPicks[0]?.lure.name ?? '',
      },
      userReport: {
        fishCount,
        biggestFish: biggestFish ? parseFloat(biggestFish) : null,
        lureUsed,
        rating,
        notes,
      },
    };
    saveEntry(entry);
    onSaved();
    onClose();
  }, [lake, conditions, analysis, fishCount, biggestFish, lureUsed, rating, notes, onSaved, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
          <Fish className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">Log Catch</span>
          <span className="text-xs text-slate-500 font-mono ml-2">
            {lake?.name ?? 'Unknown Lake'} — Bite: {analysis.biteIntensity}
          </span>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Fish Count */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Fish Caught</label>
            <div className="flex flex-wrap gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(n => (
                <button
                  key={n}
                  onClick={() => setFishCount(n)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    fishCount === n
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {n === 20 ? '20+' : n}
                </button>
              ))}
            </div>
          </div>

          {/* Biggest Fish */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Biggest Fish (lbs, optional)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 4.5"
              value={biggestFish}
              onChange={e => setBiggestFish(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          {/* Lure Used */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Lure Used</label>
            <select
              value={lureUsed}
              onChange={e => setLureUsed(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500/50 focus:outline-none"
            >
              {recommendedLures.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
              <option value="other">Other</option>
            </select>
          </div>

          {/* Accuracy Rating */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
              How accurate was StrikeZone?
            </label>
            <div className="flex gap-1">
              {([1, 2, 3, 4, 5] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      n <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What worked? What didn't?"
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
          >
            Save Catch
          </button>
        </div>
      </div>
    </div>
  );
}
