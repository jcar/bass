'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { WhatToThrowCard as CardData } from '@/lib/whatToThrow';
import type { StrikeAnalysis, WeatherConditions, LureRecommendation, ScoreFactor, LureScoreFactor } from '@/lib/types';
import { ANGLER_META, confidenceColor } from '@/lib/theme';
import KnowledgeCard from './KnowledgeCard';

interface TopPickCardProps {
  card: CardData;
  analysis: StrikeAnalysis;
  conditions: WeatherConditions;
  onFollowAngler?: (anglerId: string) => void;
}

const positionLabels: Record<string, string> = {
  shallow: 'Shallow',
  'mid-column': 'Mid-Column',
  suspended: 'Suspended',
  deep: 'Deep',
};

function LureDetailBlock({
  label,
  labelColor,
  lure,
}: {
  label: string;
  labelColor: string;
  lure: LureRecommendation;
}) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${labelColor}`}>
          {label}
        </span>
      </div>
      <div className="text-sm font-semibold text-white mb-1">{lure.name}</div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-2.5 rounded-full border border-slate-600" style={{ background: lure.colorHex }} />
        <span className="text-xs text-slate-300">{lure.color}</span>
      </div>
      <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
        <span className="text-slate-500 font-mono text-xs">RETRIEVE </span>
        <span>{lure.presentation?.retrieveNote ?? <span className="capitalize">{lure.retrieveSpeed}</span>}</span>
      </div>
      <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
        <span className="text-slate-500 font-mono text-xs">DEPTH </span>
        {lure.depthRange}
      </div>
      {lure.presentation?.weight && (
        <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
          <span className="text-slate-500 font-mono text-xs">WEIGHT </span>
          <span>{lure.presentation.weight}</span>
        </div>
      )}
      {lure.presentation?.trailer && (
        <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
          <span className="text-slate-500 font-mono text-xs">TRAILER </span>
          <span>{lure.presentation.trailer}</span>
        </div>
      )}
      {lure.proTip && (
        <p className="text-[11px] text-slate-400 leading-relaxed italic mt-1.5">{lure.proTip}</p>
      )}
    </div>
  );
}

function LureScoreBreakdown({ factors, confidence }: { factors: LureScoreFactor[]; confidence: number }) {
  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-3">
      <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
        Why {confidence}%
      </div>
      <div className="space-y-1">
        {factors.map((f, i) => {
          const isBase = f.source === 'base' && f.label === 'Base confidence';
          const isCap = f.source === 'base' && f.points < 0;
          const color = isCap ? '#64748b' : f.points > 0 ? '#10b981' : f.points < 0 ? '#f87171' : '#94a3b8';
          return (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className={`text-[11px] font-mono ${isCap ? 'text-slate-500 italic' : 'text-slate-400'}`}>
                {f.label}
              </span>
              <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color }}>
                {isBase ? f.points : f.points > 0 ? `+${f.points}` : f.points}
              </span>
            </div>
          );
        })}
        <div className="border-t border-slate-700/30 pt-1 mt-1 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-slate-300 font-semibold">Final</span>
          <span className="text-[11px] font-mono font-bold text-white">{confidence}</span>
        </div>
      </div>
    </div>
  );
}

function FactorMiniBar({ factor }: { factor: ScoreFactor }) {
  const color = factor.impact === 'positive' ? '#10b981' : factor.impact === 'negative' ? '#f87171' : '#64748b';
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono text-slate-500 w-16 truncate">{factor.label}</span>
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${factor.score}%`, background: color, opacity: 0.7 }} />
      </div>
      <span className="text-[10px] font-mono font-bold w-5 text-right" style={{ color }}>{factor.score}</span>
    </div>
  );
}

export default function TopPickCard({ card, analysis, conditions, onFollowAngler }: TopPickCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { lure, briefing, endorsements, knowledge, adjustments } = card;
  const confColor = confidenceColor(lure.confidence);
  const activeAdjustments = adjustments.filter(a => a.active);
  const inactiveAdjustments = adjustments.filter(a => !a.active);
  const [showInactive, setShowInactive] = useState(false);

  const topFactors = analysis.biteFactors.slice(0, 3);

  const hasProAdvice = endorsements.length > 0
    || (briefing?.briefing.proInsights?.length ?? 0) > 0
    || knowledge.length > 0;

  return (
    <div
      className="bg-slate-800/60 border-l-4 border border-slate-700 rounded-lg overflow-hidden"
      style={{ borderLeftColor: confColor }}
    >
      {/* Compact card: left lure + right fish position */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* LEFT HALF: Lure recommendation */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Rod 1
              </span>
              <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${lure.confidence}%`, background: confColor }} />
              </div>
              <span className="text-xs font-mono text-slate-400">{lure.confidence}%</span>
            </div>

            <div className="text-base font-bold text-white">{lure.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-5 h-3 rounded-full border border-slate-600" style={{ background: lure.colorHex }} />
              <span className="text-sm text-slate-300">{lure.color}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1.5">
              <span className="text-slate-500 font-mono">RETRIEVE </span>
              {lure.presentation?.retrieveNote ?? <span className="capitalize">{lure.retrieveSpeed}</span>}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              <span className="text-slate-500 font-mono">DEPTH </span>
              {lure.depthRange}
            </div>
            {lure.presentation?.weight && (
              <div className="text-xs text-slate-400 mt-0.5">
                <span className="text-slate-500 font-mono">WEIGHT </span>
                {lure.presentation.weight}
              </div>
            )}
            {lure.presentation?.trailer && (
              <div className="text-xs text-slate-400 mt-0.5">
                <span className="text-slate-500 font-mono">TRAILER </span>
                {lure.presentation.trailer}
              </div>
            )}

            {/* Briefing headline */}
            {briefing && (
              <p className="text-sm text-emerald-400 font-semibold mt-2 leading-snug">{briefing.briefing.headline}</p>
            )}

            {/* Endorser avatars */}
            {endorsements.length > 0 && (
              <div className="flex -space-x-1.5 mt-2">
                {endorsements.slice(0, 5).map(e => {
                  const meta = ANGLER_META[e.anglerId] ?? { fullName: e.anglerName, accent: '#64748b' };
                  return (
                    <div
                      key={e.anglerId}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase border border-slate-700
                        ${onFollowAngler ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-offset-slate-800 transition-shadow' : ''}`}
                      style={{ background: `${meta.accent}30`, color: meta.accent }}
                      title={meta.fullName}
                      onClick={onFollowAngler ? () => onFollowAngler(e.anglerId) : undefined}
                    >
                      {e.anglerName.slice(0, 2)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT HALF: Fish position + structure + factors */}
          <div className="md:w-56 flex-shrink-0 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-white">{analysis.fishDepth}</span>
              <span className="text-xs text-slate-500">ft</span>
              <span className="text-xs font-mono text-slate-400">{positionLabels[analysis.fishPosition]}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {analysis.seasonalPhase.label}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {analysis.seasonalPhase.depthRange.min}-{analysis.seasonalPhase.depthRange.max}ft
              </span>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">What&apos;s Driving It</div>
              <div className="space-y-1">
                {topFactors.map((f, i) => (
                  <FactorMiniBar key={i} factor={f} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span>{expanded ? 'Less Detail' : 'More Detail'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable detail section */}
      <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 space-y-4 border-t border-slate-700/50 pt-4">

            {/* Score breakdown — "Why X%" */}
            {lure.scoreBreakdown && lure.scoreBreakdown.length > 0 && (
              <LureScoreBreakdown factors={lure.scoreBreakdown} confidence={lure.confidence} />
            )}

            {/* Gameplan + Depth Strategy merged */}
            {briefing && (
              <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-3 space-y-3">
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Game Plan</div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {briefing.briefing.gameplan}
                  </p>
                </div>
                <div className="border-t border-slate-700/30 pt-2">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Depth Strategy</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{briefing.briefing.depthStrategy}</p>
                </div>
              </div>
            )}

            {/* Primary + Alternate approach from briefing */}
            {briefing && (
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">Approaches</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LureDetailBlock
                    label="Primary"
                    labelColor="text-emerald-400 bg-emerald-500/10"
                    lure={{
                      ...lure,
                      color: briefing.briefing.primaryApproach.color || lure.color,
                      proTip: briefing.briefing.primaryApproach.retrieve,
                      depthRange: briefing.briefing.primaryApproach.targets,
                    }}
                  />
                  <LureDetailBlock
                    label="Alternate"
                    labelColor="text-sky-400 bg-sky-500/10"
                    lure={{
                      ...lure,
                      name: briefing.briefing.alternateApproach.lure,
                      color: briefing.briefing.alternateApproach.color,
                      colorHex: '#64748b',
                      proTip: briefing.briefing.alternateApproach.retrieve,
                      depthRange: briefing.briefing.alternateApproach.targets,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Pro Advice — consolidated endorser quotes, proInsights, and knowledge */}
            {hasProAdvice && (
              <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-3 space-y-3">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Pro Advice</div>

                {/* Endorser quotes */}
                {endorsements.length > 0 && (
                  <div className="space-y-2">
                    {endorsements.map(e => {
                      const meta = ANGLER_META[e.anglerId] ?? { fullName: e.anglerName, accent: '#64748b' };
                      return (
                        <div
                          key={e.anglerId}
                          className={`flex items-start gap-2 text-[11px] ${onFollowAngler ? 'cursor-pointer hover:bg-slate-700/30 rounded p-1 -m-1 transition-colors' : ''}`}
                          onClick={onFollowAngler ? () => onFollowAngler(e.anglerId) : undefined}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase border border-slate-700 flex-shrink-0 mt-0.5"
                            style={{ background: `${meta.accent}30`, color: meta.accent }}
                          >
                            {e.anglerName.slice(0, 2)}
                          </div>
                          <p className="text-slate-400 italic leading-relaxed">
                            &ldquo;{e.proTip}&rdquo;
                            <span className="text-slate-500 not-italic ml-1">— {meta.fullName}</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Briefing proInsights */}
                {briefing?.briefing.proInsights && briefing.briefing.proInsights.length > 0 && (
                  <div className="space-y-1.5 border-t border-slate-700/30 pt-2.5">
                    {briefing.briefing.proInsights.map((pi, i) => (
                      <p key={i} className="text-[11px] text-slate-400 leading-relaxed">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">{pi.angler}: </span>
                        {pi.insight}
                      </p>
                    ))}
                  </div>
                )}

                {/* Knowledge cards — inline, no toggle */}
                {knowledge.length > 0 && (
                  <div className="space-y-2 border-t border-slate-700/30 pt-2.5">
                    {knowledge.map((entry, i) => (
                      <KnowledgeCard key={`${entry.topic}-${i}`} entry={entry} accentColor={confColor} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Adjust If */}
            {adjustments.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded p-3">
                <div className="text-xs font-mono text-amber-400/80 uppercase tracking-wider mb-1.5">Adjust If...</div>
                <ul className="space-y-1">
                  {activeAdjustments.map((adj, i) => (
                    <li key={i} className="text-[11px] leading-relaxed flex gap-1.5 text-amber-200">
                      <span className="shrink-0 text-amber-400">{'\u25cf'}</span>
                      <span>
                        {adj.text}
                        {adj.matchReason && (
                          <span className="ml-1.5 text-amber-400/70 font-mono text-[10px]">({adj.matchReason})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {inactiveAdjustments.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowInactive(!showInactive)}
                      className="text-[10px] font-mono text-amber-500/50 hover:text-amber-400/70 mt-1.5 transition-colors"
                    >
                      {showInactive ? 'Hide' : 'Show'} {inactiveAdjustments.length} more
                    </button>
                    {showInactive && (
                      <ul className="space-y-1 mt-1">
                        {inactiveAdjustments.map((adj, i) => (
                          <li key={i} className="text-[11px] leading-relaxed flex gap-1.5 text-amber-200/40">
                            <span className="shrink-0 text-amber-500/30">{'\u203a'}</span>
                            <span>{adj.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
