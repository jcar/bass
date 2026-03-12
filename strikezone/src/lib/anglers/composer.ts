// ─── Composer: Merges BaseLures + AnglerProfiles into LureTemplates ───
import type { ConditionPredicate, BaseLure, AnglerProfile, LureOpinion, ConfidenceModifier, ColorRule, TipRule } from './types';
import type { LureContext, LureTemplate } from '../StrikeEngine';

/** Test whether a LureContext matches a ConditionPredicate. */
function matchesPredicate(ctx: LureContext, pred: ConditionPredicate): boolean {
  if (pred.season !== undefined) {
    const vals = Array.isArray(pred.season) ? pred.season : [pred.season];
    if (!vals.includes(ctx.season)) return false;
  }
  if (pred.waterTemp !== undefined) {
    if (pred.waterTemp.min !== undefined && ctx.waterTemp < pred.waterTemp.min) return false;
    if (pred.waterTemp.max !== undefined && ctx.waterTemp > pred.waterTemp.max) return false;
  }
  if (pred.waterClarity !== undefined) {
    const vals = Array.isArray(pred.waterClarity) ? pred.waterClarity : [pred.waterClarity];
    if (!vals.includes(ctx.waterClarity as typeof vals[number])) return false;
  }
  if (pred.skyCondition !== undefined) {
    const vals = Array.isArray(pred.skyCondition) ? pred.skyCondition : [pred.skyCondition];
    if (!vals.includes(ctx.skyCondition as typeof vals[number])) return false;
  }
  if (pred.frontalSystem !== undefined) {
    const vals = Array.isArray(pred.frontalSystem) ? pred.frontalSystem : [pred.frontalSystem];
    if (!vals.includes(ctx.frontalSystem as typeof vals[number])) return false;
  }
  if (pred.pressureTrend !== undefined) {
    const vals = Array.isArray(pred.pressureTrend) ? pred.pressureTrend : [pred.pressureTrend];
    if (!vals.includes(ctx.pressureTrend as typeof vals[number])) return false;
  }
  if (pred.windSpeed !== undefined) {
    if (pred.windSpeed.min !== undefined && ctx.windSpeed < pred.windSpeed.min) return false;
    if (pred.windSpeed.max !== undefined && ctx.windSpeed > pred.windSpeed.max) return false;
  }
  if (pred.fishDepth !== undefined) {
    if (pred.fishDepth.min !== undefined && ctx.fishDepth < pred.fishDepth.min) return false;
    if (pred.fishDepth.max !== undefined && ctx.fishDepth > pred.fishDepth.max) return false;
  }
  if (pred.timeOfDay !== undefined) {
    const vals = Array.isArray(pred.timeOfDay) ? pred.timeOfDay : [pred.timeOfDay];
    if (!vals.includes(ctx.timeOfDay)) return false;
  }
  if (pred.isLowLight !== undefined && ctx.isLowLight !== pred.isLowLight) return false;
  if (pred.isStained !== undefined && ctx.isStained !== pred.isStained) return false;
  return true;
}

/** Sum all matching base modifiers (unweighted). */
function sumBaseModifiers(modifiers: ConfidenceModifier[], ctx: LureContext): number {
  let sum = 0;
  for (const mod of modifiers) {
    if (matchesPredicate(ctx, mod.when)) sum += mod.adjustment;
  }
  return sum;
}

/** Sum all matching angler modifiers, each scaled by the angler's credibility for this lure. */
function sumAnglerModifiers(
  opinions: Array<{ opinion: LureOpinion; credibility: number }>,
  ctx: LureContext,
): number {
  let sum = 0;
  for (const { opinion, credibility } of opinions) {
    if (!opinion.confidenceModifiers) continue;
    for (const mod of opinion.confidenceModifiers) {
      if (matchesPredicate(ctx, mod.when)) {
        sum += mod.adjustment * credibility;
      }
    }
  }
  return sum;
}

/** Pick the best matching color rule across base + anglers. */
function pickColor(
  baseRules: ColorRule[],
  baseDefault: { name: string; hex: string },
  opinions: Array<{ opinion: LureOpinion; credibility: number }>,
  ctx: LureContext,
): { name: string; hex: string } {
  // Collect all rules with effective priority
  const candidates: Array<{ rule: ColorRule; effectivePriority: number }> = [];

  for (const rule of baseRules) {
    candidates.push({ rule, effectivePriority: rule.priority });
  }
  for (const { opinion, credibility } of opinions) {
    if (!opinion.colorRules) continue;
    for (const rule of opinion.colorRules) {
      candidates.push({ rule, effectivePriority: rule.priority * credibility });
    }
  }

  // Sort by effective priority descending
  candidates.sort((a, b) => b.effectivePriority - a.effectivePriority);

  for (const { rule } of candidates) {
    if (matchesPredicate(ctx, rule.when)) {
      return { name: rule.color, hex: rule.hex };
    }
  }

  return baseDefault;
}

/** Pick the best matching tip across base + anglers, with attribution. */
function pickTip(
  baseRules: TipRule[],
  baseDefault: string,
  opinions: Array<{ opinion: LureOpinion; credibility: number; anglerName: string }>,
  ctx: LureContext,
): string {
  let bestTip = baseDefault;
  let bestScore = -1;

  // Check base rules (no attribution)
  for (const rule of baseRules) {
    if (matchesPredicate(ctx, rule.when) && rule.priority > bestScore) {
      bestTip = rule.tip;
      bestScore = rule.priority;
    }
  }

  // Check angler rules (with attribution via angler name already in the tip text)
  for (const { opinion, credibility } of opinions) {
    if (!opinion.tipRules) continue;
    for (const rule of opinion.tipRules) {
      const score = rule.priority * credibility;
      if (matchesPredicate(ctx, rule.when) && score > bestScore) {
        bestTip = rule.tip;
        bestScore = score;
      }
    }
    // Check angler default tip
    if (opinion.defaultTip) {
      const score = 0.1 * credibility; // very low priority — only if nothing else matches
      if (score > bestScore) {
        bestTip = opinion.defaultTip;
        bestScore = score;
      }
    }
  }

  return bestTip;
}

/**
 * Compose BaseLures + a single AnglerProfile into LureTemplate[] closures.
 * Only includes lures this angler has opinions on.
 */
export function composeLuresForAngler(baseLures: BaseLure[], angler: AnglerProfile): LureTemplate[] {
  return composeLures(
    baseLures.filter(b => angler.opinions.some(o => o.lure === b.name)),
    [angler],
  );
}

/**
 * Compose BaseLures + AnglerProfiles into LureTemplate[] closures.
 * The resulting templates are drop-in replacements for the old LURE_DATABASE.
 */
export function composeLures(baseLures: BaseLure[], anglerProfiles: AnglerProfile[]): LureTemplate[] {
  return baseLures.map(base => {
    // Collect all angler opinions for this lure
    const anglerOpinions: Array<{
      opinion: LureOpinion;
      credibility: number;
      anglerName: string;
    }> = [];

    for (const profile of anglerProfiles) {
      const opinion = profile.opinions.find(o => o.lure === base.name);
      if (!opinion) continue;
      const cred = profile.credibility[base.name] ?? profile.defaultCredibility;
      anglerOpinions.push({ opinion, credibility: cred, anglerName: profile.name });
    }

    // Merge seasons: base + any angler seasonAdd
    const mergedSeasons = new Set(base.seasons);
    for (const { opinion } of anglerOpinions) {
      if (opinion.seasonAdd) opinion.seasonAdd.forEach(s => mergedSeasons.add(s));
    }

    // Merge null gates: weighted average of angler overrides
    let minTemp = base.nullGates.minTemp;
    let maxFishDepth = base.nullGates.maxFishDepth;

    const tempOverrides = anglerOpinions
      .filter(a => a.opinion.minTempOverride !== undefined)
      .map(a => ({ val: a.opinion.minTempOverride!, cred: a.credibility }));
    if (tempOverrides.length > 0 && minTemp !== undefined) {
      const baseWeight = 1.0;
      let weightedSum = minTemp * baseWeight;
      let totalWeight = baseWeight;
      for (const { val, cred } of tempOverrides) {
        weightedSum += val * cred;
        totalWeight += cred;
      }
      minTemp = Math.round(weightedSum / totalWeight);
    } else if (tempOverrides.length > 0) {
      const totalCred = tempOverrides.reduce((s, t) => s + t.cred, 0);
      minTemp = Math.round(tempOverrides.reduce((s, t) => s + t.val * t.cred, 0) / totalCred);
    }

    const depthOverrides = anglerOpinions
      .filter(a => a.opinion.maxFishDepthOverride !== undefined)
      .map(a => ({ val: a.opinion.maxFishDepthOverride!, cred: a.credibility }));
    if (depthOverrides.length > 0 && maxFishDepth !== undefined) {
      const baseWeight = 1.0;
      let weightedSum = maxFishDepth * baseWeight;
      let totalWeight = baseWeight;
      for (const { val, cred } of depthOverrides) {
        weightedSum += val * cred;
        totalWeight += cred;
      }
      maxFishDepth = Math.round(weightedSum / totalWeight);
    }

    return {
      name: base.name,
      category: base.category,
      minDepth: base.minDepth,
      maxDepth: base.maxDepth,
      action: base.action,
      baseSpeed: base.baseSpeed,
      tags: base.tags,
      seasons: Array.from(mergedSeasons),

      getConfidence(ctx: LureContext): number | null {
        // Null gates
        if (maxFishDepth !== undefined && ctx.fishDepth > maxFishDepth) return null;
        if (minTemp !== undefined && ctx.waterTemp < minTemp) return null;
        if (base.nullGates.requiredClarity) {
          if (!base.nullGates.requiredClarity.includes(ctx.waterClarity as 'clear' | 'stained' | 'muddy')) return null;
        }

        let c = base.baseConfidence;
        c += sumBaseModifiers(base.modifiers, ctx);
        c += sumAnglerModifiers(anglerOpinions, ctx);
        return Math.min(base.maxConfidence, c);
      },

      getColor(ctx: LureContext): { name: string; hex: string } {
        return pickColor(base.colorRules, base.defaultColor, anglerOpinions, ctx);
      },

      proTip(ctx: LureContext): string {
        return pickTip(base.tipRules, base.defaultTip, anglerOpinions, ctx);
      },
    };
  });
}
