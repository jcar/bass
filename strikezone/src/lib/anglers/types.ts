// ─── Composable Angler Profile System: Type Definitions ───
import type { Season, LureAction, RetrieveSpeed, WaterClarity, SkyCondition, FrontalSystem, PressureTrend } from '../types';
import type { TimeOfDay } from '../StrikeEngine';

/**
 * Declarative condition matcher. All specified fields are AND'd.
 * Array values mean any-of (OR within that field).
 * Omitted fields always match.
 */
export interface ConditionPredicate {
  season?: Season | Season[];
  waterTemp?: { min?: number; max?: number };
  waterClarity?: WaterClarity | WaterClarity[];
  skyCondition?: SkyCondition | SkyCondition[];
  frontalSystem?: FrontalSystem | FrontalSystem[];
  pressureTrend?: PressureTrend | PressureTrend[];
  windSpeed?: { min?: number; max?: number };
  fishDepth?: { min?: number; max?: number };
  timeOfDay?: TimeOfDay | TimeOfDay[];
  isLowLight?: boolean;
  isStained?: boolean;
}

export interface ConfidenceModifier {
  when: ConditionPredicate;
  adjustment: number; // additive, e.g., +12 or -15
}

export interface ColorRule {
  when: ConditionPredicate;
  color: string;
  hex: string;
  priority: number; // higher = checked first
}

export interface TipRule {
  when: ConditionPredicate;
  tip: string;
  priority: number; // higher = checked first
}

/** Skeleton lure definition — no conditional logic, just the baseline. */
export interface BaseLure {
  name: string;
  category: string;
  minDepth: number;
  maxDepth: number;
  action: LureAction;
  baseSpeed: RetrieveSpeed;
  tags: string[];
  seasons: Season[];
  baseConfidence: number;
  maxConfidence: number;
  nullGates: {
    minTemp?: number;
    maxFishDepth?: number;
    requiredClarity?: WaterClarity[];
  };
  /** General-knowledge confidence modifiers (unweighted, always applied) */
  modifiers: ConfidenceModifier[];
  /** General-knowledge color rules, sorted by priority desc */
  colorRules: ColorRule[];
  defaultColor: { name: string; hex: string };
  /** General-knowledge tip rules, sorted by priority desc */
  tipRules: TipRule[];
  defaultTip: string;
}

/** An angler's opinion on a specific lure. Sparse — only include what they're known for. */
export interface LureOpinion {
  lure: string; // must match BaseLure.name
  /** Additional seasons this angler unlocks (merged with base via union) */
  seasonAdd?: Season[];
  /** Override the null-gate min temp (weighted average with other anglers) */
  minTempOverride?: number;
  /** Override the null-gate max fish depth */
  maxFishDepthOverride?: number;
  /** Additive confidence modifiers (scaled by angler credibility for this lure) */
  confidenceModifiers?: ConfidenceModifier[];
  /** Color rules (merged with base, ranked by credibility * priority) */
  colorRules?: ColorRule[];
  /** Tip rules (merged with base, best match shown with angler attribution) */
  tipRules?: TipRule[];
  defaultTip?: string;
}

/** A pro angler's complete profile. */
export interface AnglerProfile {
  name: string;
  id: string;
  /** Per-lure credibility weight (0-1). Higher = more influence when anglers disagree. */
  credibility: Record<string, number>;
  /** Credibility for lures not explicitly listed. Default 0.5. */
  defaultCredibility: number;
  opinions: LureOpinion[];
  /** Per-structure-type advice in this angler's voice. Keys match StructureTarget.type. */
  structureAdvice?: Partial<Record<string, string>>;
}
