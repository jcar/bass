// ─── Condition Simulation ───
import type { MergedReview } from './types';
import { matchesPredicate, getNonStandardKeys, type SimulationConditions } from './predicate-matcher';

export interface MatchingTip {
  anglerId: string;
  anglerName: string;
  lure: string;
  tip: string;
  priority: number;
  skippedFields: string[];
}

export interface MatchingColor {
  anglerId: string;
  anglerName: string;
  lure: string;
  color: string;
  hex: string;
  priority: number;
  skippedFields: string[];
}

export interface MatchingModifier {
  anglerId: string;
  anglerName: string;
  lure: string;
  adjustment: number;
  skippedFields: string[];
}

export interface SimulationResult {
  conditions: SimulationConditions;
  matchingTips: MatchingTip[];
  matchingColors: MatchingColor[];
  matchingModifiers: MatchingModifier[];
  totalRules: number;
  nonFiringCount: number;
  skippedFieldWarnings: string[];
}

export function simulate(
  conditions: SimulationConditions,
  anglers: Array<{ id: string; name: string; data: MergedReview }>
): SimulationResult {
  const matchingTips: MatchingTip[] = [];
  const matchingColors: MatchingColor[] = [];
  const matchingModifiers: MatchingModifier[] = [];
  const allSkippedFields = new Set<string>();
  let totalRules = 0;
  let firingCount = 0;

  for (const { id, name, data } of anglers) {
    for (const [lureName, opinion] of Object.entries(data.opinions)) {
      // Tips
      for (const rule of opinion.tipRules) {
        totalRules++;
        const skipped = getNonStandardKeys(rule.when);
        skipped.forEach(f => allSkippedFields.add(f));

        if (matchesPredicate(conditions, rule.when)) {
          firingCount++;
          matchingTips.push({
            anglerId: id, anglerName: name, lure: lureName,
            tip: rule.tip, priority: rule.priority, skippedFields: skipped,
          });
        }
      }

      // Colors
      for (const rule of opinion.colorRules) {
        totalRules++;
        const skipped = getNonStandardKeys(rule.when);
        skipped.forEach(f => allSkippedFields.add(f));

        if (matchesPredicate(conditions, rule.when)) {
          firingCount++;
          matchingColors.push({
            anglerId: id, anglerName: name, lure: lureName,
            color: rule.color, hex: rule.hex, priority: rule.priority,
            skippedFields: skipped,
          });
        }
      }

      // Modifiers
      for (const mod of opinion.confidenceModifiers) {
        totalRules++;
        const skipped = getNonStandardKeys(mod.when);
        skipped.forEach(f => allSkippedFields.add(f));

        if (matchesPredicate(conditions, mod.when)) {
          firingCount++;
          matchingModifiers.push({
            anglerId: id, anglerName: name, lure: lureName,
            adjustment: mod.adjustment, skippedFields: skipped,
          });
        }
      }
    }
  }

  // Sort by priority desc
  matchingTips.sort((a, b) => b.priority - a.priority);
  matchingColors.sort((a, b) => b.priority - a.priority);
  matchingModifiers.sort((a, b) => Math.abs(b.adjustment) - Math.abs(a.adjustment));

  return {
    conditions,
    matchingTips,
    matchingColors,
    matchingModifiers,
    totalRules,
    nonFiringCount: totalRules - firingCount,
    skippedFieldWarnings: [...allSkippedFields],
  };
}
