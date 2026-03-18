// ─── Data Health Computation ───
import type { MergedReview } from './types';
import { VALID_WHEN_KEYS, STRUCTURE_TYPES } from './constants';
import { isEmptyPredicate, getNonStandardKeys } from './predicate-matcher';

export interface AnglerHealth {
  id: string;
  name: string;
  lureCount: number;
  tipCount: number;
  colorCount: number;
  modifierCount: number;
  emptyWhenTips: number;
  emptyWhenColors: number;
  emptyWhenModifiers: number;
  nonStandardFields: number;
  nonStandardFieldNames: string[];
  credibilityFilled: number;
  credibilityTotal: number;
  structureFilled: number;
  structureTotal: number;
  readiness: number;
}

export interface GlobalHealth {
  totalAnglers: number;
  totalTips: number;
  totalColors: number;
  totalModifiers: number;
  totalEmptyWhenTips: number;
  totalEmptyWhenColors: number;
  totalEmptyWhenModifiers: number;
  totalNonStandardFields: number;
  nonStandardFieldCounts: Record<string, number>;
  overallReadiness: number;
  anglers: AnglerHealth[];
}

export function computeHealth(
  anglers: Array<{ id: string; name: string; data: MergedReview }>
): GlobalHealth {
  const anglerHealths: AnglerHealth[] = [];
  const globalNonStandardCounts: Record<string, number> = {};

  let totalTips = 0, totalColors = 0, totalModifiers = 0;
  let totalEmptyWhenTips = 0, totalEmptyWhenColors = 0, totalEmptyWhenModifiers = 0;
  let totalNonStandard = 0;

  for (const { id, name, data } of anglers) {
    let tipCount = 0, colorCount = 0, modifierCount = 0;
    let emptyWhenTips = 0, emptyWhenColors = 0, emptyWhenModifiers = 0;
    let nonStandardFields = 0;
    const nonStandardFieldNames = new Set<string>();

    for (const opinion of Object.values(data.opinions)) {
      // Tips
      for (const rule of opinion.tipRules) {
        tipCount++;
        if (isEmptyPredicate(rule.when)) emptyWhenTips++;
        for (const key of getNonStandardKeys(rule.when)) {
          nonStandardFields++;
          nonStandardFieldNames.add(key);
          globalNonStandardCounts[key] = (globalNonStandardCounts[key] ?? 0) + 1;
        }
      }

      // Colors
      for (const rule of opinion.colorRules) {
        colorCount++;
        if (isEmptyPredicate(rule.when)) emptyWhenColors++;
        for (const key of getNonStandardKeys(rule.when)) {
          nonStandardFields++;
          nonStandardFieldNames.add(key);
          globalNonStandardCounts[key] = (globalNonStandardCounts[key] ?? 0) + 1;
        }
      }

      // Modifiers
      for (const mod of opinion.confidenceModifiers) {
        modifierCount++;
        if (isEmptyPredicate(mod.when)) emptyWhenModifiers++;
        for (const key of getNonStandardKeys(mod.when)) {
          nonStandardFields++;
          nonStandardFieldNames.add(key);
          globalNonStandardCounts[key] = (globalNonStandardCounts[key] ?? 0) + 1;
        }
      }
    }

    // Credibility coverage
    const lureCount = Object.keys(data.opinions).length;
    let credibilityFilled = 0;
    for (const lureName of Object.keys(data.opinions)) {
      if (data.credibility[lureName] !== undefined) credibilityFilled++;
    }

    // Structure coverage
    let structureFilled = 0;
    for (const type of STRUCTURE_TYPES) {
      if (data.structureAdvice[type] && data.structureAdvice[type].length > 0) structureFilled++;
    }

    // Readiness score (0-100)
    const credScore = lureCount > 0 ? credibilityFilled / lureCount : 0;
    const structScore = STRUCTURE_TYPES.length > 0 ? structureFilled / STRUCTURE_TYPES.length : 0;
    const totalRules = tipCount + colorCount + modifierCount;
    const totalNonStandardForAngler = nonStandardFields;
    const schemaScore = totalRules > 0 ? 1 - Math.min(totalNonStandardForAngler / totalRules, 1) : 1;
    const totalEmptyWhens = emptyWhenTips + emptyWhenColors + emptyWhenModifiers;
    const conditionScore = totalRules > 0 ? 1 - Math.min(totalEmptyWhens / totalRules, 1) : 1;

    const readiness = Math.round(
      (credScore * 25 + structScore * 25 + schemaScore * 25 + conditionScore * 25)
    );

    anglerHealths.push({
      id, name, lureCount, tipCount, colorCount, modifierCount,
      emptyWhenTips, emptyWhenColors, emptyWhenModifiers,
      nonStandardFields, nonStandardFieldNames: [...nonStandardFieldNames],
      credibilityFilled, credibilityTotal: lureCount,
      structureFilled, structureTotal: STRUCTURE_TYPES.length,
      readiness,
    });

    totalTips += tipCount;
    totalColors += colorCount;
    totalModifiers += modifierCount;
    totalEmptyWhenTips += emptyWhenTips;
    totalEmptyWhenColors += emptyWhenColors;
    totalEmptyWhenModifiers += emptyWhenModifiers;
    totalNonStandard += nonStandardFields;
  }

  // Overall readiness = average of all anglers
  const overallReadiness = anglerHealths.length > 0
    ? Math.round(anglerHealths.reduce((sum, a) => sum + a.readiness, 0) / anglerHealths.length)
    : 0;

  return {
    totalAnglers: anglers.length,
    totalTips, totalColors, totalModifiers,
    totalEmptyWhenTips, totalEmptyWhenColors, totalEmptyWhenModifiers,
    totalNonStandardFields: totalNonStandard,
    nonStandardFieldCounts: globalNonStandardCounts,
    overallReadiness,
    anglers: anglerHealths.sort((a, b) => a.readiness - b.readiness),
  };
}
