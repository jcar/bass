'use client';

import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { StructureTarget, SeasonalPhase, WeatherConditions, LureRecommendation } from '@/lib/types';
import { ANGLER_PROFILES, ANGLER_LURE_DBS } from '@/lib/anglers';
import { buildLureContext, scoreLure, calculateFishPosition } from '@/lib/StrikeEngine';
import { loadTuning } from '@/lib/tuning';
import { confidenceColor } from '@/lib/theme';
import { findForAngler } from '@/lib/knowledge';
import type { KnowledgeEntry } from '@/lib/knowledge';
import KnowledgeCard from './KnowledgeCard';
import StructureAdviceRow from './StructureAdviceRow';

const CATEGORY_ORDER = [
  'retrieve-technique', 'seasonal-pattern', 'lure-selection', 'color-selection',
  'structure-reading', 'depth-strategy', 'forage-matching', 'weather-adaptation',
  'fish-behavior', 'gear', 'trailer-modification', 'bait-design',
  'electronics', 'lake-reading', 'tournament-strategy', 'mental-approach',
];

const CATEGORY_LABELS: Record<string, string> = {
  'retrieve-technique': 'Retrieve Techniques',
  'seasonal-pattern': 'Seasonal Patterns',
  'lure-selection': 'Lure Selection',
  'color-selection': 'Color Selection',
  'structure-reading': 'Structure Reading',
  'depth-strategy': 'Depth Strategy',
  'forage-matching': 'Forage Matching',
  'weather-adaptation': 'Weather Adaptation',
  'fish-behavior': 'Fish Behavior',
  'gear': 'Gear',
  'trailer-modification': 'Trailer Mods',
  'bait-design': 'Bait Design',
  'electronics': 'Electronics',
  'lake-reading': 'Lake Reading',
  'tournament-strategy': 'Tournament Strategy',
  'mental-approach': 'Mental Approach',
};

interface AnglerDeepDiveProps {
  anglerId: string;
  meta: { fullName: string; style: string; accent: string };
  seasonalPhase: SeasonalPhase;
  structureTargets: StructureTarget[];
  conditions?: WeatherConditions;
  onBack: () => void;
}

export default function AnglerDeepDive({
  anglerId, meta, seasonalPhase, structureTargets, conditions, onBack,
}: AnglerDeepDiveProps) {
  const accent = meta.accent;
  const profile = ANGLER_PROFILES.find(p => p.id === anglerId);

  // Compute full ranked lure list for this angler
  const rankedLures = useMemo<LureRecommendation[]>(() => {
    if (!conditions) return [];
    const db = ANGLER_LURE_DBS.get(anglerId);
    if (!db) return [];
    const cfg = loadTuning();
    const fishDepth = calculateFishPosition(conditions, seasonalPhase, cfg).depth;
    const { ctx, todCfg } = buildLureContext(conditions, seasonalPhase, fishDepth, cfg);
    const scored: LureRecommendation[] = [];
    for (const lure of db) {
      const rec = scoreLure(lure, ctx, todCfg, cfg);
      if (rec) scored.push(rec);
    }
    return scored.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
  }, [anglerId, conditions, seasonalPhase]);

  // Knowledge feed grouped by category
  const knowledgeByCategory = useMemo<Array<{ category: string; entries: KnowledgeEntry[] }>>(() => {
    const all = findForAngler(anglerId, { season: seasonalPhase.season });
    const grouped = new Map<string, KnowledgeEntry[]>();
    for (const entry of all) {
      const arr = grouped.get(entry.category) ?? [];
      arr.push(entry);
      grouped.set(entry.category, arr);
    }
    return CATEGORY_ORDER
      .filter(cat => grouped.has(cat))
      .map(cat => ({ category: cat, entries: grouped.get(cat)!.slice(0, 4) }));
  }, [anglerId, seasonalPhase.season]);

  // Structure advice
  const relevantTargets = structureTargets.filter(t => profile?.structureAdvice?.[t.type]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold uppercase"
          style={{ background: `${accent}20`, color: accent, border: `2px solid ${accent}60` }}
        >
          {anglerId.slice(0, 2)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{meta.fullName}</h2>
          <p className="text-sm text-slate-400">{meta.style}</p>
        </div>
      </div>

      {/* Full Lure Ranking */}
      {rankedLures.length > 0 && (
        <div>
          <div className="text-xs font-mono text-emerald-400/70 uppercase tracking-wider mb-2">
            Full Lure Ranking &mdash; {seasonalPhase.label}
          </div>
          <div className="space-y-2">
            {rankedLures.map((lure, i) => (
              <div
                key={lure.name}
                className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-lg p-3"
              >
                <span className="text-xs font-mono text-slate-500 w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{lure.name}</span>
                    <div className="w-4 h-2.5 rounded-full border border-slate-600" style={{ background: lure.colorHex }} />
                    <span className="text-xs text-slate-400">{lure.color}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono">
                    <span>{lure.depthRange}</span>
                    <span className="capitalize">{lure.retrieveSpeed}</span>
                  </div>
                  {lure.proTip && (
                    <p className="text-[11px] text-slate-400 leading-relaxed italic mt-1">{lure.proTip}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${lure.confidence}%`, background: confidenceColor(lure.confidence) }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400 w-8 text-right">{lure.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structure Playbook */}
      {relevantTargets.length > 0 && profile?.structureAdvice && (
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Structure Playbook</div>
          <div className="space-y-0.5">
            {relevantTargets.map(t => (
              <StructureAdviceRow
                key={t.id}
                target={t}
                advice={profile.structureAdvice![t.type]!}
                anglerAccent={accent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Knowledge Feed */}
      {knowledgeByCategory.length > 0 && (
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Knowledge Feed</div>
          <div className="space-y-4">
            {knowledgeByCategory.map(group => (
              <div key={group.category}>
                <div className="text-xs font-semibold text-slate-400 mb-1.5">
                  {CATEGORY_LABELS[group.category] ?? group.category}
                </div>
                <div className="space-y-2">
                  {group.entries.map((entry, i) => (
                    <KnowledgeCard key={`${entry.topic}-${i}`} entry={entry} accentColor={accent} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="w-full py-2.5 text-sm font-mono text-slate-400 hover:text-white bg-slate-800/50 border border-slate-700 rounded-lg transition-colors"
      >
        Show All Anglers
      </button>
    </div>
  );
}
