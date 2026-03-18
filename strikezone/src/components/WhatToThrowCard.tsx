'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { WhatToThrowCard as CardData } from '@/lib/whatToThrow';
import type { LureRecommendation } from '@/lib/types';
import { ANGLER_META, confidenceColor } from '@/lib/theme';
import KnowledgeCard from './KnowledgeCard';

interface WhatToThrowCardProps {
  card: CardData;
  onFollowAngler?: (anglerId: string) => void;
}

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

export default function WhatToThrowCard({ card, onFollowAngler }: WhatToThrowCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { lure, briefing, endorsements, knowledge, adjustments, rank } = card;
  const confColor = confidenceColor(lure.confidence);

  const hasProAdvice = endorsements.length > 0
    || (briefing?.briefing.proInsights?.length ?? 0) > 0
    || knowledge.length > 0;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
      {/* Header — single-line collapsed state */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600/30 uppercase tracking-wider">
                Rod {rank}
              </span>
              <span className="text-sm font-semibold text-white">{lure.name}</span>
              <div className="w-14 h-1.5 bg-slate-900 rounded-full overflow-hidden flex-shrink-0">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${lure.confidence}%`, background: confColor }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400">{lure.confidence}%</span>

              {/* Color swatch */}
              <div
                className="w-3.5 h-2 rounded-full border border-slate-600 flex-shrink-0"
                style={{ background: lure.colorHex }}
              />
              <span className="text-xs text-slate-400">{lure.color}</span>

              {/* Endorser avatars */}
              {endorsements.length > 0 && (
                <div className="flex -space-x-1 ml-1">
                  {endorsements.slice(0, 3).map(e => {
                    const meta = ANGLER_META[e.anglerId] ?? { fullName: e.anglerName, accent: '#64748b' };
                    return (
                      <div
                        key={e.anglerId}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase border border-slate-700"
                        style={{ background: `${meta.accent}30`, color: meta.accent }}
                        title={meta.fullName}
                      >
                        {e.anglerName.slice(0, 2)}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Briefing headline snippet */}
              {briefing && (
                <span className="text-xs text-emerald-400/60 truncate max-w-[180px] hidden sm:inline">
                  {briefing.briefing.headline}
                </span>
              )}
            </div>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded body */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 space-y-4">

            {/* Rig details: retrieve, depth, weight, trailer */}
            <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/50 space-y-1.5">
              <div className="text-[11px] text-slate-400">
                <span className="text-slate-500 font-mono text-xs">RETRIEVE </span>
                {lure.presentation?.retrieveNote ?? <span className="capitalize">{lure.retrieveSpeed}</span>}
              </div>
              <div className="text-[11px] text-slate-400">
                <span className="text-slate-500 font-mono text-xs">DEPTH </span>
                {lure.depthRange}
              </div>
              {lure.presentation?.weight && (
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500 font-mono text-xs">WEIGHT </span>
                  {lure.presentation.weight}
                </div>
              )}
              {lure.presentation?.trailer && (
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500 font-mono text-xs">TRAILER </span>
                  {lure.presentation.trailer}
                </div>
              )}
            </div>

            {/* Briefing headline + gameplan */}
            {briefing && (
              <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5">
                  <p className="text-sm font-semibold text-emerald-400">{briefing.briefing.headline}</p>
                </div>
                <div className="p-3">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Game Plan</div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {briefing.briefing.gameplan}
                  </p>
                </div>
              </div>
            )}

            {/* Briefing approaches */}
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

            {/* Depth Strategy */}
            {briefing && (
              <div className="bg-slate-900/30 rounded p-3 border border-slate-700/30">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Depth Strategy</div>
                <p className="text-xs text-slate-300 leading-relaxed">{briefing.briefing.depthStrategy}</p>
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
                  {adjustments.map((adj, i) => (
                    <li
                      key={i}
                      className={`text-[11px] leading-relaxed flex gap-1.5 ${
                        adj.active ? 'text-amber-200' : 'text-amber-200/40'
                      }`}
                    >
                      <span className={`shrink-0 ${adj.active ? 'text-amber-400' : 'text-amber-500/30'}`}>
                        {adj.active ? '\u25cf' : '\u203a'}
                      </span>
                      <span>
                        {adj.text}
                        {adj.active && adj.matchReason && (
                          <span className="ml-1.5 text-amber-400/70 font-mono text-[10px]">
                            ({adj.matchReason})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
