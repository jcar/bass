'use client';

import { useState } from 'react';
import { ANGLER_PROFILES } from '@/lib/anglers';
import { ANGLER_META } from '@/lib/theme';
import { getBriefing } from '@/lib/briefings';
import AnglerGamePlan from './AnglerGamePlan';
import AnglerDeepDive from './AnglerDeepDive';
import type { AnglerPick, StructureTarget, SeasonalPhase, WeatherConditions, Season, WaterClarity, FrontalSystem } from '@/lib/types';

interface AnglerRosterProps {
  anglerPicks: AnglerPick[];
  structureTargets: StructureTarget[];
  seasonalPhase: SeasonalPhase;
  tackleBox?: string[];
  onTackleToggle?: (lureName: string) => void;
  conditions?: WeatherConditions;
}

export default function AnglerRoster({
  anglerPicks, structureTargets, seasonalPhase,
  tackleBox = [], onTackleToggle, conditions,
}: AnglerRosterProps) {
  const [followingAngler, setFollowingAngler] = useState<string | null>(null);

  if (anglerPicks.length === 0) return null;

  // Follow mode: show deep dive for the selected angler
  if (followingAngler) {
    const meta = ANGLER_META[followingAngler] ?? { fullName: followingAngler, style: '', accent: '#64748b' };
    return (
      <div className="space-y-4">
        <AnglerDeepDive
          anglerId={followingAngler}
          meta={meta}
          seasonalPhase={seasonalPhase}
          structureTargets={structureTargets}
          conditions={conditions}
          onBack={() => setFollowingAngler(null)}
        />
      </div>
    );
  }

  const season = seasonalPhase.season as Season;
  const clarity = (conditions?.waterClarity ?? 'stained') as WaterClarity;
  const frontal = (conditions?.frontalSystem ?? 'stable') as FrontalSystem;

  const enriched = anglerPicks.map(pick => {
    const profile = ANGLER_PROFILES.find(p => p.id === pick.anglerId);
    const meta = ANGLER_META[pick.anglerId] ?? {
      fullName: pick.anglerName, style: '', accent: '#64748b',
    };
    const briefing = getBriefing(season, clarity, frontal, pick.lure.name);
    const targets = profile?.structureAdvice
      ? structureTargets.filter(t => profile.structureAdvice![t.type])
      : [];
    return { pick, meta, briefing, targets };
  });

  const [hero, ...rest] = enriched;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Game Plans
      </h2>

      <AnglerGamePlan
        pick={hero.pick}
        meta={hero.meta}
        structureTargets={hero.targets}
        briefing={hero.briefing}
        isHero={true}
        seasonLabel={seasonalPhase.label}
        tackleBox={tackleBox}
        onTackleToggle={onTackleToggle}
        onFollow={setFollowingAngler}
        colorAlternates={hero.pick.colorAlternates}
      />

      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map(item => (
            <AnglerGamePlan
              key={item.pick.anglerId}
              pick={item.pick}
              meta={item.meta}
              structureTargets={item.targets}
              briefing={item.briefing}
              isHero={false}
              seasonLabel={seasonalPhase.label}
              tackleBox={tackleBox}
              onTackleToggle={onTackleToggle}
              onFollow={setFollowingAngler}
              colorAlternates={item.pick.colorAlternates}
            />
          ))}
        </div>
      )}
    </div>
  );
}
