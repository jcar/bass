'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import type { ScoreFactor } from '@/lib/types';

interface ScoreBreakdownProps {
  factors: ScoreFactor[];
  title: string;
  /** 'weighted' shows score bars with weights, 'list' shows qualitative factors */
  mode?: 'weighted' | 'list';
}

const impactColor = {
  positive: { bar: 'bg-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  neutral: { bar: 'bg-slate-500', text: 'text-slate-400', dot: 'bg-slate-500' },
  negative: { bar: 'bg-rose-500', text: 'text-rose-400', dot: 'bg-rose-400' },
};

export default function ScoreBreakdown({ factors, title, mode = 'weighted' }: ScoreBreakdownProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="p-0.5 rounded hover:bg-slate-700/50 text-slate-600 hover:text-slate-400 transition-colors"
        title={`What influences ${title}?`}
      >
        <Info className="w-3 h-3" />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute z-[60] top-full mt-1 right-0 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl shadow-black/60 overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-slate-800 bg-slate-800/50">
            <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">{title}</span>
          </div>

          <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto">
            {factors.map((f, i) => {
              const colors = impactColor[f.impact];
              return (
                <div key={i} className="rounded px-2 py-1.5 bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      <span className="text-xs font-mono font-semibold text-slate-300">{f.label}</span>
                    </div>
                    {mode === 'weighted' && (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-mono font-bold ${colors.text}`}>{f.score}</span>
                        <span className="text-xs font-mono text-slate-600">{Math.round(f.weight * 100)}%</span>
                      </div>
                    )}
                  </div>
                  {mode === 'weighted' && (
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full ${colors.bar} transition-all`}
                        style={{ width: `${f.score}%`, opacity: 0.7 + f.weight * 0.3 }}
                      />
                    </div>
                  )}
                  <p className="text-xs font-mono text-slate-500 leading-snug">{f.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
