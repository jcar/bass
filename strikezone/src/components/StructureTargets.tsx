'use client';

import type { StructureTarget, SeasonalPhase } from '@/lib/types';
import { StructureIcon, priorityStyle } from './StructureIcon';
import { ANGLER_META } from '@/lib/theme';
import { ANGLER_PROFILES } from '@/lib/anglers';

interface StructureTargetsProps {
  targets: StructureTarget[];
  seasonalPhase: SeasonalPhase;
}

const priorityOrder: Record<string, number> = { primary: 0, secondary: 1, tertiary: 2 };
const borderColor: Record<string, string> = {
  primary: 'border-l-emerald-500/60',
  secondary: 'border-l-amber-500/60',
  tertiary: 'border-l-slate-500/40',
};

export default function StructureTargets({ targets, seasonalPhase }: StructureTargetsProps) {
  const sorted = [...targets].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">What to Target</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {seasonalPhase.label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">{targets.length} targets</span>
      </div>

      {/* Target cards */}
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {sorted.map((target) => {
            const style = priorityStyle[target.priority];
            const anglerTips = ANGLER_PROFILES
              .filter((a) => a.structureAdvice?.[target.type])
              .map((a) => ({
                id: a.id,
                name: ANGLER_META[a.id]?.fullName ?? a.name,
                accent: ANGLER_META[a.id]?.accent ?? '#64748b',
                advice: a.structureAdvice![target.type]!,
              }));

            return (
              <div
                key={target.id}
                className={`bg-slate-900/50 rounded-lg border-l-2 ${borderColor[target.priority]} p-3`}
              >
                {/* Structure header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: style.bg, color: style.color }}
                  >
                    <StructureIcon type={target.type} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{target.name}</span>
                      <span
                        className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded"
                        style={{ color: style.color, background: style.bg }}
                      >
                        {style.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">{target.description}</p>

                {/* Pro Tips */}
                {anglerTips.length > 0 && (
                  <div className="space-y-1.5 border-t border-slate-700/40 pt-2">
                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Pro Tips</div>
                    {anglerTips.map((tip) => (
                      <div key={tip.id} className="flex items-start gap-1.5">
                        <span
                          className="text-[10px] font-mono font-semibold flex-shrink-0 mt-px"
                          style={{ color: tip.accent }}
                        >
                          {tip.name.split(' ').pop()}:
                        </span>
                        <span className="text-[11px] text-slate-400 leading-snug">{tip.advice}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
