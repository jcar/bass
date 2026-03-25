'use client';

import { useState } from 'react';
import { Map, ChevronDown } from 'lucide-react';
import type { StrikeAnalysis, WeatherConditions, WaterClarity } from '@/lib/types';
import type { WhatToThrowResult } from '@/lib/whatToThrow';
import type { GamePlanStop } from '@/lib/gamePlan';
import { buildGamePlan } from '@/lib/gamePlan';
import { StructureIcon, priorityStyle } from './StructureIcon';
import { ANGLER_META, confidenceColor } from '@/lib/theme';

interface GamePlanSectionProps {
  analysis: StrikeAnalysis;
  conditions: WeatherConditions;
  whatToThrow: WhatToThrowResult | null;
  waterClarity: WaterClarity;
  onWaterClarityChange: (clarity: WaterClarity) => void;
}

const positionLabels: Record<string, string> = {
  shallow: 'Shallow',
  'mid-column': 'Mid-Column',
  suspended: 'Suspended',
  deep: 'Deep',
};

function StopCard({ stop }: { stop: GamePlanStop }) {
  const isPrimary = stop.target.priority === 'primary';
  const [expanded, setExpanded] = useState(isPrimary);
  const style = priorityStyle[stop.target.priority];

  return (
    <div
      className="bg-slate-800/60 border-l-4 border border-slate-700 rounded-lg overflow-hidden"
      style={{ borderLeftColor: style.color }}
    >
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 p-3 sm:p-4">
          {/* Stop number badge */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: style.bg, color: style.color, border: `1px solid ${style.ring}` }}
          >
            {stop.stopNumber}
          </div>

          {/* Structure icon */}
          <div
            className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            style={{ color: style.color }}
          >
            <StructureIcon type={stop.target.type} size={18} />
          </div>

          {/* Name + priority + matched rods */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white">{stop.target.name}</span>
              <span
                className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded"
                style={{ color: style.color, background: style.bg }}
              >
                {style.label}
              </span>
            </div>
            {/* Matched rod summary — visible when collapsed */}
            {!expanded && stop.matchedRods.length > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {stop.matchedRods.map(r => (
                  <span key={r.rodNumber} className="text-[11px] text-slate-400 font-mono">
                    Rod {r.rodNumber} ({r.lure.name})
                  </span>
                ))}
              </div>
            )}
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expandable detail */}
      <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 border-t border-slate-700/50 pt-3">
            {/* Target description */}
            <p className="text-xs text-slate-300 leading-relaxed">{stop.target.description}</p>

            {/* Matched rods */}
            {stop.matchedRods.length > 0 && (
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Bring These Rods</div>
                <div className="space-y-2">
                  {stop.matchedRods.map(r => {
                    const confColor = confidenceColor(r.confidence);
                    return (
                      <div key={r.rodNumber} className="flex items-start gap-2.5">
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider flex-shrink-0 mt-0.5"
                        >
                          Rod {r.rodNumber}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">{r.lure.name}</span>
                            <div className="w-4 h-2.5 rounded-full border border-slate-600" style={{ background: r.lure.colorHex }} />
                            <span className="text-xs text-slate-400">{r.lure.color}</span>
                            <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${r.confidence}%`, background: confColor }} />
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">{r.confidence}%</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{r.matchReason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pro advice */}
            {stop.anglerAdvice.length > 0 && (
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Pro Advice</div>
                <div className="space-y-2">
                  {stop.anglerAdvice.map(a => {
                    const meta = ANGLER_META[a.anglerId];
                    return (
                      <div key={a.anglerId} className="flex items-start gap-2 text-[11px]">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase border border-slate-700 flex-shrink-0 mt-0.5"
                          style={{ background: `${a.accent}30`, color: a.accent }}
                        >
                          {a.anglerId.slice(0, 2)}
                        </div>
                        <p className="text-slate-400 italic leading-relaxed">
                          {a.advice}
                          {meta && (
                            <span className="text-slate-500 not-italic ml-1">— {meta.fullName}</span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CLARITY_OPTIONS: { value: WaterClarity; label: string }[] = [
  { value: 'clear', label: 'Clear' },
  { value: 'stained', label: 'Stained' },
  { value: 'muddy', label: 'Muddy' },
];

export default function GamePlanSection({ analysis, conditions, whatToThrow, waterClarity, onWaterClarityChange }: GamePlanSectionProps) {
  const stops = buildGamePlan(analysis, whatToThrow, conditions);

  if (stops.length === 0) return null;

  const { seasonalPhase, fishDepth, fishPosition } = analysis;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Game Plan</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Water clarity pill selector */}
          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700/60 p-0.5">
            {CLARITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onWaterClarityChange(opt.value)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md transition-colors ${
                  waterClarity === opt.value
                    ? 'bg-slate-600/80 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {seasonalPhase.label}
          </span>
          <span className="text-xs font-mono text-slate-400">
            {fishDepth}ft {positionLabels[fishPosition]}
          </span>
        </div>
      </div>

      {/* Seasonal description */}
      <p className="text-xs text-slate-400 leading-relaxed -mt-1">{seasonalPhase.description}</p>

      {/* Stops */}
      {stops.map(stop => (
        <StopCard key={stop.target.id} stop={stop} />
      ))}
    </div>
  );
}
