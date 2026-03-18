'use client';

import { useState } from 'react';
import { Sunrise, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { BriefingBullet } from '@/lib/morningBriefing';

interface MorningBriefingProps {
  bullets: BriefingBullet[];
}

const typeColor: Record<BriefingBullet['type'], string> = {
  positive: 'bg-emerald-400',
  negative: 'bg-rose-400',
  neutral: 'bg-amber-400',
};

export default function MorningBriefing({ bullets }: MorningBriefingProps) {
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  if (dismissed || bullets.length === 0) return null;

  return (
    <div className="border border-slate-700/60 rounded-lg bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800/40">
        <Sunrise className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-wider">
          Morning Briefing
        </span>
        <span className="hidden sm:inline text-xs text-slate-500 font-mono">What changed overnight</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bullets */}
      {!collapsed && (
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 space-y-2">
          {bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColor[bullet.type]}`} />
              <p className="text-sm text-slate-300 leading-relaxed">{bullet.narrative}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
