'use client';

import { useState, useMemo } from 'react';
import { Check, Plus, ChevronDown } from 'lucide-react';
import type { AnglerPick, StructureTarget } from '@/lib/types';
import type { TacticalBriefing } from '@/lib/briefings/types';
import type { KnowledgeEntry } from '@/lib/knowledge';
import type { ColorAlternate } from '@/lib/anglers/composer';
import { ACTION_COLORS, confidenceColor, ANGLER_META } from '@/lib/theme';
import { ANGLER_PROFILES } from '@/lib/anglers';
import { findForLure, findForCategory } from '@/lib/knowledge';
import StructureAdviceRow from './StructureAdviceRow';
import KnowledgeCard from './KnowledgeCard';
import ColorDeepDive from './ColorDeepDive';

const priorityOrder: Record<string, number> = { primary: 0, secondary: 1, tertiary: 2 };

interface AnglerGamePlanProps {
  pick: AnglerPick;
  meta: { fullName: string; style: string; accent: string };
  structureTargets: StructureTarget[];
  briefing: { category: string; briefing: TacticalBriefing } | null;
  isHero: boolean;
  seasonLabel: string;
  tackleBox?: string[];
  onTackleToggle?: (lureName: string) => void;
  onFollow?: (anglerId: string) => void;
  colorAlternates?: ColorAlternate[];
}

/** Score and pick top knowledge entries relevant to this angler's lure pick. */
function pickKnowledgeCards(lureName: string, anglerId: string, season: string): KnowledgeEntry[] {
  // Score: exact lure + same angler = 3, exact lure + different angler = 2, same category = 1
  const scored: Array<{ entry: KnowledgeEntry; score: number }> = [];

  for (const e of findForLure(lureName, { season })) {
    scored.push({ entry: e, score: e.anglerId === anglerId ? 3 : 2 });
  }

  // Fill from retrieve-technique and seasonal-pattern if we don't have enough lure matches
  if (scored.length < 2) {
    for (const cat of ['retrieve-technique', 'seasonal-pattern']) {
      for (const e of findForCategory(cat, { angler: anglerId, season, limit: 3 })) {
        if (!scored.some(s => s.entry.topic === e.topic)) {
          scored.push({ entry: e, score: 1 });
        }
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 2).map(s => s.entry);
}

export default function AnglerGamePlan({
  pick, meta, structureTargets, briefing, isHero, seasonLabel,
  tackleBox = [], onTackleToggle, onFollow, colorAlternates,
}: AnglerGamePlanProps) {
  const [expanded, setExpanded] = useState(isHero);
  const [colorDiveOpen, setColorDiveOpen] = useState(false);
  const { lure } = pick;
  const accent = meta.accent;

  const profile = ANGLER_PROFILES.find(p => p.id === pick.anglerId);
  const relevantTargets = structureTargets
    .filter(t => profile?.structureAdvice?.[t.type])
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const primaryTarget = relevantTargets[0];

  const knowledgeCards = useMemo(
    () => pickKnowledgeCards(lure.name, pick.anglerId, seasonLabel),
    [lure.name, pick.anglerId, seasonLabel],
  );

  return (
    <div
      className={
        isHero
          ? 'bg-slate-800/60 border-l-4 border border-slate-700 rounded-lg'
          : 'bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors'
      }
      style={isHero ? { borderLeftColor: accent } : undefined}
    >
      {/* Accordion header — always visible, clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 p-4">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold uppercase flex-shrink-0${onFollow ? ' cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-offset-slate-800 transition-shadow' : ''}`}
            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40`, ...(onFollow ? { ['--tw-ring-color' as string]: accent } : {}) }}
            onClick={onFollow ? (e) => { e.stopPropagation(); onFollow(pick.anglerId); } : undefined}
            title={onFollow ? `Follow ${meta.fullName}` : undefined}
          >
            {pick.anglerName.slice(0, 2)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{meta.fullName}</span>
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: `${accent}15`, color: accent }}
              >
                {pick.rationale}
              </span>
            </div>
            {/* Compact lure summary — visible when collapsed */}
            {!expanded && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-semibold text-slate-300">{lure.name}</span>
                <div
                  className="w-3.5 h-2 rounded-full border border-slate-600"
                  style={{ background: lure.colorHex }}
                />
                <span className="text-xs text-slate-500">{lure.color}</span>
                <span className="text-xs text-slate-600 font-mono">{lure.depthRange}</span>
                <div className="flex-1 max-w-[60px] h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${lure.confidence}%`, background: confidenceColor(lure.confidence) }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-500">{lure.confidence}%</span>
              </div>
            )}
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Accordion body — expanded content */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 space-y-4">
            {/* THROW THIS section */}
            <div>
              <div className="text-xs font-mono text-emerald-400/70 uppercase tracking-wider mb-1">Throw This</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-white">{lure.name}</span>
                {onTackleToggle && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onTackleToggle(lure.name); }}
                    className={`p-0.5 rounded transition-colors ${
                      tackleBox.includes(lure.name) ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={tackleBox.includes(lure.name) ? 'In your tackle box' : 'Add to tackle box'}
                  >
                    {tackleBox.includes(lure.name) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                )}
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded uppercase"
                  style={{ background: `${ACTION_COLORS[lure.action]}20`, color: ACTION_COLORS[lure.action] }}
                >
                  {lure.action}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <button
                  className="flex items-center gap-1.5 hover:bg-slate-700/40 rounded px-1 -ml-1 py-0.5 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setColorDiveOpen(!colorDiveOpen); }}
                  title="Tap for color details"
                >
                  <div className="w-6 h-3 rounded-full border border-slate-600" style={{ background: lure.colorHex }} />
                  <span className="text-sm text-slate-300">{lure.color}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${colorDiveOpen ? 'rotate-180' : ''}`} />
                </button>
                <span className="text-xs text-slate-500 font-mono">{lure.depthRange}</span>
                <span className="text-xs text-slate-500 font-mono capitalize">{lure.retrieveSpeed} retrieve</span>
              </div>

              {/* Color Deep Dive — expandable */}
              {colorDiveOpen && colorAlternates && (
                <ColorDeepDive
                  currentColor={lure.color}
                  currentHex={lure.colorHex}
                  alternates={colorAlternates}
                  anglerId={pick.anglerId}
                  accentColor={accent}
                />
              )}

              {/* Confidence bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 max-w-[160px] h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${lure.confidence}%`, background: confidenceColor(lure.confidence) }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-400">{lure.confidence}%</span>
              </div>

              {/* Pro tip */}
              <p className="text-xs text-slate-400 mt-2 leading-relaxed italic">{lure.proTip}</p>

              {/* Endorsers */}
              {pick.endorsers.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs font-mono text-slate-500 uppercase">Also throws this</span>
                  <div className="flex -space-x-1">
                    {pick.endorsers.map((e) => {
                      const eMeta = ANGLER_META[e.anglerId] ?? { fullName: e.anglerName, style: '', accent: '#64748b' };
                      return (
                        <div
                          key={e.anglerId}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold uppercase border border-slate-700"
                          style={{ background: `${eMeta.accent}30`, color: eMeta.accent }}
                          title={`${eMeta.fullName}: ${e.proTip}`}
                        >
                          {e.anglerName.slice(0, 2)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* WHERE TO FISH */}
            {relevantTargets.length > 0 && (
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">Where to Fish</div>
                <div className="space-y-0.5">
                  {relevantTargets.map((t) => (
                    <StructureAdviceRow
                      key={t.id}
                      target={t}
                      advice={profile!.structureAdvice![t.type]!}
                      anglerAccent={accent}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* HOW TO FISH IT */}
            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">How to Fish It</div>
              <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg overflow-hidden">
                {/* Condition context from briefing (if available) */}
                {briefing && (
                  <>
                    <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5">
                      <p className="text-sm font-semibold text-emerald-400">{briefing.briefing.briefing.headline}</p>
                    </div>
                    <div className="p-3 space-y-3">
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Game Plan</div>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {briefing.briefing.briefing.gameplan}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className={briefing ? 'px-3 pb-3 space-y-3' : 'p-3 space-y-3'}>
                  {/* Angler-specific Primary + Alternate approach cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Primary: this angler's claimed lure */}
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">Primary</span>
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

                    {/* Alternate: this angler's next-best lure */}
                    {pick.alternateLure && (
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-sky-400 uppercase tracking-wider bg-sky-500/10 px-1.5 py-0.5 rounded">Alternate</span>
                        </div>
                        <div className="text-sm font-semibold text-white mb-1">{pick.alternateLure.name}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-2.5 rounded-full border border-slate-600" style={{ background: pick.alternateLure.colorHex }} />
                          <span className="text-xs text-slate-300">{pick.alternateLure.color}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                          <span className="text-slate-500 font-mono text-xs">RETRIEVE </span>
                          <span>{pick.alternateLure.presentation?.retrieveNote ?? <span className="capitalize">{pick.alternateLure.retrieveSpeed}</span>}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                          <span className="text-slate-500 font-mono text-xs">DEPTH </span>
                          {pick.alternateLure.depthRange}
                        </div>
                        {pick.alternateLure.presentation?.weight && (
                          <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                            <span className="text-slate-500 font-mono text-xs">WEIGHT </span>
                            <span>{pick.alternateLure.presentation.weight}</span>
                          </div>
                        )}
                        {pick.alternateLure.presentation?.trailer && (
                          <div className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                            <span className="text-slate-500 font-mono text-xs">TRAILER </span>
                            <span>{pick.alternateLure.presentation.trailer}</span>
                          </div>
                        )}
                        {pick.alternateLure.proTip && (
                          <p className="text-[11px] text-slate-400 leading-relaxed italic mt-1.5">{pick.alternateLure.proTip}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Depth Strategy + Adjust If from briefing */}
                  {briefing && (
                    <>
                      <div className="bg-slate-900/30 rounded p-3 border border-slate-700/30">
                        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Depth Strategy</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{briefing.briefing.briefing.depthStrategy}</p>
                      </div>
                      {briefing.briefing.briefing.adjustIf.length > 0 && (
                        <div className="bg-amber-500/5 border border-amber-500/15 rounded p-3">
                          <div className="text-xs font-mono text-amber-400/80 uppercase tracking-wider mb-1.5">Adjust If...</div>
                          <ul className="space-y-1">
                            {briefing.briefing.briefing.adjustIf.map((adj, i) => (
                              <li key={i} className="text-[11px] text-amber-200/60 leading-relaxed flex gap-1.5">
                                <span className="text-amber-500/50 shrink-0">&rsaquo;</span>
                                {adj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* PRO KNOWLEDGE */}
            {knowledgeCards.length > 0 && (
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">Pro Knowledge</div>
                <div className="space-y-2">
                  {knowledgeCards.map((entry, i) => (
                    <KnowledgeCard key={`${entry.topic}-${i}`} entry={entry} accentColor={accent} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
