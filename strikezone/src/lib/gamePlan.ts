// ─── Game Plan: Tie rods to structure stops ───
// Matches lure recommendations to seasonal structure targets
// using depth overlap and action/type affinity.

import type { StrikeAnalysis, WeatherConditions, StructureTarget, LureRecommendation, LureAction } from './types';
import type { WhatToThrowResult } from './whatToThrow';
import { ANGLER_PROFILES } from './anglers';
import { ANGLER_META } from './theme';

// ── Types ──

export interface MatchedRod {
  rodNumber: number;
  lure: LureRecommendation;
  confidence: number;
  matchReason: string;
}

export interface AnglerAdvice {
  anglerId: string;
  anglerName: string;
  advice: string;
  accent: string;
}

export interface GamePlanStop {
  target: StructureTarget;
  stopNumber: number;
  matchedRods: MatchedRod[];
  anglerAdvice: AnglerAdvice[];
}

// ── Action/type affinity table ──

const STRUCTURE_AFFINITIES: Record<string, LureAction[]> = {
  'point':          ['search', 'reaction'],
  'hump':           ['search', 'reaction'],
  'bluff':          ['search', 'reaction', 'finesse'],
  'grass':          ['power', 'search'],
  'laydown':        ['power', 'finesse'],
  'flat':           ['finesse', 'search'],
  'dock':           ['finesse', 'power'],
  'creek-channel':  ['search', 'reaction'],
  'riprap':         ['reaction', 'search'],
};

const STRUCTURE_REASON: Record<string, Record<LureAction, string>> = {
  'point':          { search: 'Covers water along the point slope', reaction: 'Triggers strikes on the break', finesse: 'Picks off reluctant fish on the tip', power: 'Punches through cover on the point' },
  'hump':           { search: 'Covers the crown and breaks quickly', reaction: 'Fires up schooling fish on the hump', finesse: 'Slow-rolls the top of the hump', power: 'Drags heavy cover on the hump sides' },
  'bluff':          { search: 'Deflects off the rock wall', reaction: 'Parallels the bluff tight', finesse: 'Drops vertically along the wall', power: 'Punches brush piles on the bluff' },
  'grass':          { power: 'Punches through matted grass', search: 'Swims the grass edge', finesse: 'Skirts the outside grass line', reaction: 'Burns over the grass tops' },
  'laydown':        { power: 'Flips into the heart of the wood', finesse: 'Shakes through the branches', search: 'Swims past the laydown', reaction: 'Deflects off the trunk' },
  'flat':           { finesse: 'Slow presentation on the flat', search: 'Covers the flat quickly', power: 'Targets isolated cover on the flat', reaction: 'Wakes across the shallow flat' },
  'dock':           { finesse: 'Drops under the dock canopy', power: 'Skips into dock shade', search: 'Casts parallel to the dock row', reaction: 'Fires under the walkway' },
  'creek-channel':  { search: 'Follows the channel swing', reaction: 'Triggers on the channel bends', finesse: 'Drags the channel edge', power: 'Punches brush on channel banks' },
  'riprap':         { reaction: 'Deflects off the rock', search: 'Parallels the riprap bank', finesse: 'Drags between the rocks', power: 'Bumps through the rocks' },
};

// ── Depth parsing ──

function parseDepthRange(depthStr: string): { min: number; max: number } | null {
  // Match patterns like "5-15ft", "5–15 ft", "8-12"
  const m = depthStr.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (m) return { min: parseInt(m[1]), max: parseInt(m[2]) };
  // Single depth like "15ft"
  const s = depthStr.match(/(\d+)/);
  if (s) { const d = parseInt(s[1]); return { min: d, max: d }; }
  return null;
}

function depthOverlap(lureRange: { min: number; max: number }, seasonRange: { min: number; max: number }): number {
  const overlapMin = Math.max(lureRange.min, seasonRange.min);
  const overlapMax = Math.min(lureRange.max, seasonRange.max);
  if (overlapMin > overlapMax) return 0;
  const overlapSize = overlapMax - overlapMin;
  const seasonSize = seasonRange.max - seasonRange.min || 1;
  return overlapSize / seasonSize;
}

// ── Scoring: lure → structure ──

function scoreLureForStructure(
  lure: LureRecommendation,
  target: StructureTarget,
  seasonDepth: { min: number; max: number },
): number {
  let score = 0;

  // Action affinity (0-3 points)
  const affinities = STRUCTURE_AFFINITIES[target.type] ?? [];
  const affinityIndex = affinities.indexOf(lure.action);
  if (affinityIndex === 0) score += 3;
  else if (affinityIndex === 1) score += 2;
  else if (affinityIndex >= 2) score += 1;

  // Depth overlap (0-2 points)
  const lureDepth = parseDepthRange(lure.depthRange);
  if (lureDepth) {
    const overlap = depthOverlap(lureDepth, seasonDepth);
    score += overlap * 2;
  }

  // Confidence bonus (0-1 point)
  score += lure.confidence / 100;

  return score;
}

function getMatchReason(lure: LureRecommendation, structureType: string): string {
  const reasons = STRUCTURE_REASON[structureType];
  if (reasons && reasons[lure.action]) return reasons[lure.action];
  return `${lure.action.charAt(0).toUpperCase() + lure.action.slice(1)} presentation`;
}

// ── Angler advice aggregation ──

function gatherAnglerAdvice(
  target: StructureTarget,
  matchedRodLures: string[],
): AnglerAdvice[] {
  const advice: AnglerAdvice[] = [];

  for (const profile of ANGLER_PROFILES) {
    const tip = profile.structureAdvice?.[target.type];
    if (!tip) continue;
    const meta = ANGLER_META[profile.id];
    if (!meta) continue;
    advice.push({
      anglerId: profile.id,
      anglerName: profile.id,
      advice: tip,
      accent: meta.accent,
    });
  }

  // Sort: prefer anglers who endorse a matched rod's lure
  // (Check if the angler's name appears in the advice string of a matched lure — simple heuristic)
  advice.sort((a, b) => {
    const aMatches = matchedRodLures.some(l => a.advice.toLowerCase().includes(l.toLowerCase())) ? 1 : 0;
    const bMatches = matchedRodLures.some(l => b.advice.toLowerCase().includes(l.toLowerCase())) ? 1 : 0;
    return bMatches - aMatches;
  });

  return advice.slice(0, 2);
}

// ── Main builder ──

export function buildGamePlan(
  analysis: StrikeAnalysis,
  whatToThrow: WhatToThrowResult | null,
  _conditions: WeatherConditions,
): GamePlanStop[] {
  if (!whatToThrow || whatToThrow.cards.length === 0) return [];

  const targets = analysis.structureTargets;
  const seasonDepth = analysis.seasonalPhase.depthRange;
  const cards = whatToThrow.cards;

  // Score every (rod, structure) pair
  const scores: Array<{ rodIndex: number; targetIndex: number; score: number }> = [];
  for (let ti = 0; ti < targets.length; ti++) {
    for (let ri = 0; ri < cards.length; ri++) {
      const score = scoreLureForStructure(cards[ri].lure, targets[ti], seasonDepth);
      scores.push({ rodIndex: ri, targetIndex: ti, score });
    }
  }
  scores.sort((a, b) => b.score - a.score);

  // Greedy assignment: each stop gets 1-2 rods, every rod appears at least once
  const stopRods: Map<number, MatchedRod[]> = new Map();
  const rodAssigned = new Set<number>();

  for (let ti = 0; ti < targets.length; ti++) {
    stopRods.set(ti, []);
  }

  // First pass: assign best rod to each stop
  for (const { rodIndex, targetIndex, score } of scores) {
    const rods = stopRods.get(targetIndex)!;
    if (rods.length >= 2) continue;
    if (rods.some(r => r.rodNumber === cards[rodIndex].rank)) continue;

    // For first pass, only take the best match per stop
    if (rods.length === 0) {
      rods.push({
        rodNumber: cards[rodIndex].rank,
        lure: cards[rodIndex].lure,
        confidence: cards[rodIndex].lure.confidence,
        matchReason: getMatchReason(cards[rodIndex].lure, targets[targetIndex].type),
      });
      rodAssigned.add(rodIndex);
    }
  }

  // Second pass: ensure every rod appears at least once
  for (let ri = 0; ri < cards.length; ri++) {
    if (rodAssigned.has(ri)) continue;
    // Find the best stop for this unassigned rod
    let bestTarget = 0;
    let bestScore = -1;
    for (const { rodIndex, targetIndex, score } of scores) {
      if (rodIndex !== ri) continue;
      const rods = stopRods.get(targetIndex)!;
      if (rods.length >= 2) continue;
      if (score > bestScore) {
        bestScore = score;
        bestTarget = targetIndex;
      }
    }
    stopRods.get(bestTarget)!.push({
      rodNumber: cards[ri].rank,
      lure: cards[ri].lure,
      confidence: cards[ri].lure.confidence,
      matchReason: getMatchReason(cards[ri].lure, targets[bestTarget].type),
    });
    rodAssigned.add(ri);
  }

  // Third pass: fill stops that have room with a second rod
  for (let ti = 0; ti < targets.length; ti++) {
    const rods = stopRods.get(ti)!;
    if (rods.length >= 2) continue;
    // Find the best unassigned-to-this-stop rod
    let bestRod: MatchedRod | null = null;
    let bestScore = -1;
    for (const { rodIndex, targetIndex, score } of scores) {
      if (targetIndex !== ti) continue;
      if (rods.some(r => r.rodNumber === cards[rodIndex].rank)) continue;
      if (score > bestScore) {
        bestScore = score;
        bestRod = {
          rodNumber: cards[rodIndex].rank,
          lure: cards[rodIndex].lure,
          confidence: cards[rodIndex].lure.confidence,
          matchReason: getMatchReason(cards[rodIndex].lure, targets[ti].type),
        };
      }
    }
    if (bestRod) rods.push(bestRod);
  }

  // Build stops
  const stops: GamePlanStop[] = targets.map((target, ti) => {
    const matchedRods = stopRods.get(ti) ?? [];
    // Sort rods by confidence desc
    matchedRods.sort((a, b) => b.confidence - a.confidence);

    const anglerAdvice = gatherAnglerAdvice(
      target,
      matchedRods.map(r => r.lure.name),
    );

    return {
      target,
      stopNumber: ti + 1,
      matchedRods,
      anglerAdvice,
    };
  });

  return stops;
}
