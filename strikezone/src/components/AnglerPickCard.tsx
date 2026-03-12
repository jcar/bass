'use client';

import type { AnglerPick } from '@/lib/types';
import { ACTION_COLORS, confidenceColor, ANGLER_META } from '@/lib/theme';

interface AnglerPickCardProps {
  pick: AnglerPick;
}

export default function AnglerPickCard({ pick }: AnglerPickCardProps) {
  const meta = ANGLER_META[pick.anglerId] ?? { fullName: pick.anglerName, style: '', accent: '#64748b' };
  const { lure } = pick;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors">
      {/* Angler header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0"
          style={{ background: `${meta.accent}20`, color: meta.accent, border: `1px solid ${meta.accent}40` }}>
          {pick.anglerName.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white truncate">{meta.fullName}</div>
          <div className="text-[9px] font-mono text-slate-500 truncate">{meta.style}</div>
        </div>
        <div className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
          style={{ background: `${meta.accent}15`, color: meta.accent }}>
          {pick.rationale}
        </div>
      </div>

      {/* Endorsers */}
      {pick.endorsers.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase">Also throws this</span>
          <div className="flex -space-x-1">
            {pick.endorsers.map((e) => {
              const eMeta = ANGLER_META[e.anglerId] ?? { fullName: e.anglerName, style: '', accent: '#64748b' };
              return (
                <div key={e.anglerId}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold uppercase border border-slate-700"
                  style={{ background: `${eMeta.accent}30`, color: eMeta.accent }}
                  title={`${eMeta.fullName}: ${e.proTip}`}>
                  {e.anglerName.slice(0, 2)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lure pick */}
      <div className="bg-slate-900/50 rounded p-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white">{lure.name}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase"
            style={{ background: `${ACTION_COLORS[lure.action]}20`, color: ACTION_COLORS[lure.action] }}>
            {lure.action}
          </span>
        </div>

        {/* Color + stats */}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="w-3.5 h-3.5 rounded-full border border-slate-600"
            style={{ background: lure.colorHex }} />
          <span className="text-[11px] text-slate-400">{lure.color}</span>
          <span className="text-[10px] text-slate-600 ml-auto">{lure.depthRange}</span>
        </div>

        {/* Confidence bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${lure.confidence}%`,
                background: confidenceColor(lure.confidence),
              }} />
          </div>
          <span className="text-[10px] font-mono text-slate-400">{lure.confidence}%</span>
        </div>

        {/* Pro tip */}
        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed italic">
          {lure.proTip}
        </p>
      </div>
    </div>
  );
}
