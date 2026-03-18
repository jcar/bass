// ─── "What to Throw" — 6-Rig Recommendations Engine ───
// Gives you 6 individual rig/bait picks (one per rod), ranked by confidence.
// Each rig gets its own briefing, angler endorsements, and knowledge entries.

import type { StrikeAnalysis, WeatherConditions, LureRecommendation, AnglerPick, Season } from './types';
import type { TacticalBriefing } from './briefings/types';
import type { KnowledgeEntry } from './knowledge';
import { getBriefing, LURE_TO_CATEGORY } from './briefings';
import { findForLure, findForCategory } from './knowledge';

// ── Types ──

export interface RigEndorsement {
  anglerId: string;
  anglerName: string;
  confidence: number;
  rationale: string;
  proTip: string;
}

export interface AdjustIfMatch {
  text: string;
  active: boolean;
  matchReason: string | null;
}

export interface WhatToThrowCard {
  rank: number;
  lure: LureRecommendation;
  briefing: TacticalBriefing | null;
  endorsements: RigEndorsement[];
  knowledge: KnowledgeEntry[];
  adjustments: AdjustIfMatch[];
}

export interface WhatToThrowResult {
  cards: WhatToThrowCard[];
  conditions: { season: string; clarity: string; frontal: string };
}

// ── AdjustIf Evaluation ──

const ADJUST_PATTERNS: Array<{
  regex: RegExp;
  test: (conditions: WeatherConditions) => boolean;
  reason: (c: WeatherConditions) => string;
}> = [
  {
    regex: /wind picks up|wind increases|windy/i,
    test: (c) => c.windSpeed >= 12,
    reason: (c) => `Wind is ${c.windSpeed} mph`,
  },
  {
    regex: /calm|wind dies|no wind|slick/i,
    test: (c) => c.windSpeed < 5,
    reason: (c) => `Wind is only ${c.windSpeed} mph`,
  },
  {
    regex: /cloud|overcast|cloudy|clouds roll in/i,
    test: (c) => c.skyCondition === 'overcast' || c.skyCondition === 'partly-cloudy',
    reason: (c) => `Sky is ${c.skyCondition}`,
  },
  {
    regex: /sun|sunny|bluebird|clear sk/i,
    test: (c) => c.skyCondition === 'clear',
    reason: () => 'Clear/bluebird skies',
  },
  {
    regex: /rain/i,
    test: (c) => c.skyCondition === 'rain',
    reason: () => 'Rain in forecast',
  },
  {
    regex: /muddy|dirty|mud/i,
    test: (c) => c.waterClarity === 'muddy',
    reason: () => 'Water is muddy',
  },
  {
    regex: /stain|off-color/i,
    test: (c) => c.waterClarity === 'stained',
    reason: () => 'Water is stained',
  },
  {
    regex: /clear water|gin clear|high vis/i,
    test: (c) => c.waterClarity === 'clear',
    reason: () => 'Water is clear',
  },
  {
    regex: /front (stalls|passes|moves|comes)|cold front|frontal/i,
    test: (c) => c.frontalSystem === 'post-frontal' || c.frontalSystem === 'cold-front',
    reason: (c) => `Frontal system: ${c.frontalSystem}`,
  },
  {
    regex: /warm|heat|hot/i,
    test: (c) => c.airTemp >= 85,
    reason: (c) => `Air temp is ${c.airTemp}°F`,
  },
  {
    regex: /cold|cool(er)?/i,
    test: (c) => c.airTemp < 55,
    reason: (c) => `Air temp is ${c.airTemp}°F`,
  },
  {
    regex: /pressure (drops|falls|falling)/i,
    test: (c) => c.pressureTrend === 'falling',
    reason: () => 'Pressure is falling',
  },
  {
    regex: /pressure (rises|rising|climbs)/i,
    test: (c) => c.pressureTrend === 'rising',
    reason: () => 'Pressure is rising',
  },
];

function evaluateAdjustIfs(adjustIfs: string[], conditions: WeatherConditions): AdjustIfMatch[] {
  return adjustIfs.map(text => {
    for (const pattern of ADJUST_PATTERNS) {
      if (pattern.regex.test(text)) {
        const active = pattern.test(conditions);
        return {
          text,
          active,
          matchReason: active ? pattern.reason(conditions) : null,
        };
      }
    }
    return { text, active: false, matchReason: null };
  });
}

// ── Endorsement Matching (per-lure) ──

function matchLureEndorsements(lureName: string, anglerPicks: AnglerPick[]): RigEndorsement[] {
  const endorsements: RigEndorsement[] = [];

  for (const pick of anglerPicks) {
    // Direct match: angler's top pick is this lure
    if (pick.lure.name === lureName && !endorsements.some(x => x.anglerId === pick.anglerId)) {
      endorsements.push({
        anglerId: pick.anglerId,
        anglerName: pick.anglerName,
        confidence: pick.lure.confidence,
        rationale: pick.rationale,
        proTip: pick.lure.proTip,
      });
    }
    // Alternate lure match
    if (pick.alternateLure?.name === lureName && !endorsements.some(x => x.anglerId === pick.anglerId)) {
      endorsements.push({
        anglerId: pick.anglerId,
        anglerName: pick.anglerName,
        confidence: pick.alternateLure.confidence,
        rationale: pick.rationale,
        proTip: pick.alternateLure.proTip,
      });
    }
    // Endorser matches
    for (const e of pick.endorsers) {
      if (pick.lure.name === lureName && !endorsements.some(x => x.anglerId === e.anglerId)) {
        endorsements.push({
          anglerId: e.anglerId,
          anglerName: e.anglerName,
          confidence: e.confidence,
          rationale: e.rationale,
          proTip: e.proTip,
        });
      }
    }
  }

  return endorsements;
}

// ── Knowledge Picking (per-lure) ──

function pickLureKnowledge(lureName: string, season: string): KnowledgeEntry[] {
  const scored: Array<{ entry: KnowledgeEntry; score: number }> = [];
  const seen = new Set<string>();

  // Direct lure matches score highest
  for (const e of findForLure(lureName, { season })) {
    if (!seen.has(e.topic)) {
      scored.push({ entry: e, score: 3 });
      seen.add(e.topic);
    }
  }

  // Category matches
  const category = LURE_TO_CATEGORY[lureName];
  if (category) {
    for (const e of findForCategory(category, { season, limit: 6 })) {
      if (!seen.has(e.topic)) {
        scored.push({ entry: e, score: 2 });
        seen.add(e.topic);
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(s => s.entry);
}

// ── Main Orchestrator ──

export function buildWhatToThrow(
  analysis: StrikeAnalysis,
  conditions: WeatherConditions,
): WhatToThrowResult {
  const season = analysis.seasonalPhase.season;
  const clarity = conditions.waterClarity;
  const frontal = conditions.frontalSystem;

  // Collect all unique lures from engine: top-6 lureRecommendations + angler pick lures
  const allLures: LureRecommendation[] = [...analysis.lureRecommendations];
  for (const pick of analysis.anglerPicks) {
    if (!allLures.some(l => l.name === pick.lure.name)) {
      allLures.push(pick.lure);
    }
    if (pick.alternateLure && !allLures.some(l => l.name === pick.alternateLure!.name)) {
      allLures.push(pick.alternateLure);
    }
  }

  // Sort by confidence, take top 6 (one per rod)
  allLures.sort((a, b) => b.confidence - a.confidence);
  const topRigs = allLures.slice(0, 6);

  const cards: WhatToThrowCard[] = topRigs.map((lure, i) => {
    // Look up briefing via the lure's category mapping
    const category = LURE_TO_CATEGORY[lure.name];
    const briefing = category ? getBriefing(season, clarity, frontal, category) : null;

    const endorsements = matchLureEndorsements(lure.name, analysis.anglerPicks);

    const adjustments = briefing
      ? evaluateAdjustIfs(briefing.briefing.adjustIf, conditions)
      : [];

    const knowledge = pickLureKnowledge(lure.name, season);

    return {
      rank: i + 1,
      lure,
      briefing,
      endorsements,
      knowledge,
      adjustments,
    };
  });

  return {
    cards,
    conditions: { season, clarity, frontal },
  };
}
