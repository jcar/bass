'use client';

import { useState } from 'react';

interface AnglerData {
  id: string;
  name: string;
  opinions: Record<string, { tipRules: { tip: string }[]; sources: string[] }>;
  credibility: Record<string, number | Array<{ score: number; source: string }>>;
}

interface Props {
  anglers: AnglerData[];
  onSave: (anglerId: string, credibility: Record<string, number>) => void;
}

function resolveCredibility(val: number | Array<{ score: number }> | undefined): number | null {
  if (val === undefined) return null;
  if (typeof val === 'number') return val;
  if (Array.isArray(val) && val.length > 0) return val[0].score;
  return null;
}

function credColor(val: number | null): string {
  if (val === null) return 'text-gray-600';
  if (val >= 0.7) return 'text-emerald-400';
  if (val >= 0.4) return 'text-yellow-400';
  return 'text-red-400';
}

function sliderBg(val: number): string {
  if (val >= 0.7) return 'accent-emerald-500';
  if (val >= 0.4) return 'accent-yellow-500';
  return 'accent-red-500';
}

export default function CredibilityEditor({ anglers, onSave }: Props) {
  // Local state: anglerId → lureName → number
  const [edits, setEdits] = useState<Record<string, Record<string, number>>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  const getVal = (anglerId: string, lure: string): number | null => {
    if (edits[anglerId]?.[lure] !== undefined) return edits[anglerId][lure];
    const angler = anglers.find(a => a.id === anglerId);
    if (!angler) return null;
    return resolveCredibility(angler.credibility[lure]);
  };

  const setVal = (anglerId: string, lure: string, val: number) => {
    setEdits(prev => ({
      ...prev,
      [anglerId]: { ...prev[anglerId], [lure]: val },
    }));
    setDirty(prev => new Set([...prev, anglerId]));
  };

  const autoFill = (anglerId: string) => {
    const angler = anglers.find(a => a.id === anglerId);
    if (!angler) return;
    const newEdits: Record<string, number> = { ...edits[anglerId] };
    for (const [lure, opinion] of Object.entries(angler.opinions)) {
      if (getVal(anglerId, lure) !== null) continue; // skip already set
      const tipCount = opinion.tipRules.length;
      newEdits[lure] = tipCount >= 5 ? 0.7 : tipCount >= 2 ? 0.5 : 0.3;
    }
    setEdits(prev => ({ ...prev, [anglerId]: newEdits }));
    setDirty(prev => new Set([...prev, anglerId]));
  };

  const save = (anglerId: string) => {
    const angler = anglers.find(a => a.id === anglerId);
    if (!angler) return;
    const cred: Record<string, number> = {};
    for (const lure of Object.keys(angler.opinions)) {
      const val = getVal(anglerId, lure);
      if (val !== null) cred[lure] = val;
    }
    onSave(anglerId, cred);
    setDirty(prev => {
      const next = new Set(prev);
      next.delete(anglerId);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {anglers.map(angler => {
        const lures = Object.keys(angler.opinions).sort();
        const filled = lures.filter(l => getVal(angler.id, l) !== null).length;

        return (
          <div key={angler.id} className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-medium">{angler.name}</span>
                <span className="text-gray-500 text-sm">{filled}/{lures.length} lures have credibility</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => autoFill(angler.id)}
                  className="px-2 py-1 text-xs bg-blue-900/50 border border-blue-800 rounded hover:bg-blue-900"
                >
                  Auto-fill missing
                </button>
                {dirty.has(angler.id) && (
                  <button
                    onClick={() => save(angler.id)}
                    className="px-2 py-1 text-xs bg-emerald-900/50 border border-emerald-800 rounded hover:bg-emerald-900 font-medium"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y divide-gray-800/50 md:divide-y-0">
              {lures.map(lure => {
                const val = getVal(angler.id, lure);
                const tipCount = angler.opinions[lure].tipRules.length;
                return (
                  <div key={lure} className="flex items-center gap-3 px-4 py-2 border-b border-gray-800/30">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-300 truncate">{lure}</div>
                      <div className="text-xs text-gray-600">{tipCount} tips</div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={val ?? 0.5}
                      onChange={e => setVal(angler.id, lure, parseFloat(e.target.value))}
                      className={`w-20 h-1 ${sliderBg(val ?? 0.5)}`}
                    />
                    <span className={`font-mono text-sm w-10 text-right ${credColor(val)}`}>
                      {val !== null ? val.toFixed(2) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
