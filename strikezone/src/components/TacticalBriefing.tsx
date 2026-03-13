'use client';

import { useState } from 'react';
import type { TacticalBriefing as TacticalBriefingType } from '@/lib/briefings/types';
import { ANGLER_META } from '@/lib/theme';

// Map lure categories to display labels
const CATEGORY_LABELS: Record<string, string> = {
  cranking: 'Cranking',
  finesse: 'Finesse',
  jigs: 'Jigs',
  'moving-baits': 'Moving Baits',
  topwater: 'Topwater',
  reaction: 'Reaction',
  'soft-plastics': 'Soft Plastics',
};

interface TacticalBriefingProps {
  briefings: { category: string; briefing: TacticalBriefingType }[];
}

export default function TacticalBriefing({ briefings }: TacticalBriefingProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (briefings.length === 0) return null;

  const { category, briefing: activeBriefing } = briefings[activeTab] ?? briefings[0];
  const { briefing } = activeBriefing;

  // Helper to find angler accent color
  function anglerAccent(name: string): string {
    const id = name.toLowerCase();
    return ANGLER_META[id]?.accent ?? '#64748b';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Tactical Briefing</h2>
        {briefings.length > 1 && (
          <div className="flex gap-1">
            {briefings.map((b, i) => (
              <button
                key={b.category}
                onClick={() => setActiveTab(i)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                  i === activeTab
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:text-slate-400'
                }`}
              >
                {CATEGORY_LABELS[b.category] ?? b.category}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        {/* Headline banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-400">{briefing.headline}</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Game plan */}
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Game Plan</div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{briefing.gameplan}</p>
          </div>

          {/* Primary + Alternate approach cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Primary */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">Primary</span>
                <span className="text-[9px] font-mono ml-auto" style={{ color: anglerAccent(briefing.primaryApproach.proSource) }}>
                  {briefing.primaryApproach.proSource}
                </span>
              </div>
              <div className="text-sm font-semibold text-white mb-1">{briefing.primaryApproach.lure}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-slate-400">Color:</span>
                <span className="text-[10px] text-slate-300">{briefing.primaryApproach.color}</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                <span className="text-slate-500 font-mono text-[9px]">RETRIEVE </span>
                {briefing.primaryApproach.retrieve}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-slate-500 font-mono text-[9px]">TARGETS </span>
                {briefing.primaryApproach.targets}
              </div>
            </div>

            {/* Alternate */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono text-sky-400 uppercase tracking-wider bg-sky-500/10 px-1.5 py-0.5 rounded">Alternate</span>
                <span className="text-[9px] font-mono ml-auto" style={{ color: anglerAccent(briefing.alternateApproach.proSource) }}>
                  {briefing.alternateApproach.proSource}
                </span>
              </div>
              <div className="text-sm font-semibold text-white mb-1">{briefing.alternateApproach.lure}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-slate-400">Color:</span>
                <span className="text-[10px] text-slate-300">{briefing.alternateApproach.color}</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                <span className="text-slate-500 font-mono text-[9px]">RETRIEVE </span>
                {briefing.alternateApproach.retrieve}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-slate-500 font-mono text-[9px]">TARGETS </span>
                {briefing.alternateApproach.targets}
              </div>
            </div>
          </div>

          {/* Depth Strategy */}
          <div className="bg-slate-900/30 rounded p-3 border border-slate-700/30">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Depth Strategy</div>
            <p className="text-xs text-slate-300 leading-relaxed">{briefing.depthStrategy}</p>
          </div>

          {/* Pro Insights */}
          {briefing.proInsights.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Pro Insights</div>
              <div className="space-y-2">
                {briefing.proInsights.map((pi, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold uppercase shrink-0 mt-0.5"
                      style={{ background: `${anglerAccent(pi.angler)}20`, color: anglerAccent(pi.angler), border: `1px solid ${anglerAccent(pi.angler)}40` }}>
                      {pi.angler.slice(0, 2)}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <span className="font-semibold" style={{ color: anglerAccent(pi.angler) }}>{pi.angler}:</span>{' '}
                      {pi.insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adjust If callouts */}
          {briefing.adjustIf.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded p-3">
              <div className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider mb-1.5">Adjust If...</div>
              <ul className="space-y-1">
                {briefing.adjustIf.map((adj, i) => (
                  <li key={i} className="text-[11px] text-amber-200/60 leading-relaxed flex gap-1.5">
                    <span className="text-amber-500/50 shrink-0">&rsaquo;</span>
                    {adj}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
