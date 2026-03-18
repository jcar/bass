// Types matching the _merged-review.json schema

export interface ConditionPredicate {
  season?: string[];
  waterTemp?: { min?: number; max?: number };
  waterClarity?: string[];
  structure?: string[];
  isClear?: boolean;
  isStained?: boolean;
  isLowLight?: boolean;
  [key: string]: unknown;
}

export interface ColorRule {
  when: ConditionPredicate;
  color: string;
  hex: string;
  priority: number;
}

export interface TipRule {
  when: ConditionPredicate;
  tip: string;
  priority: number;
}

export interface ConfidenceModifier {
  when: ConditionPredicate;
  adjustment: number;
}

export interface LureOpinion {
  lure: string;
  seasonAdd: string[];
  minTempOverride: number | null;
  maxFishDepthOverride: number | null;
  confidenceModifiers: ConfidenceModifier[];
  colorRules: ColorRule[];
  tipRules: TipRule[];
  defaultTips: Array<{ tip: string; source?: string }>;
  sources: string[];
}

export interface KnowledgeEntry {
  category: string;
  topic: string;
  insight: string;
  conditions: ConditionPredicate;
  source: string;
}

export interface MergedReview {
  sources: string[];
  opinions: Record<string, LureOpinion>;
  structureAdvice: Record<string, Array<{ advice: string; source: string }>>;
  credibility: Record<string, number | Array<{ score: number; source: string }>>;
  knowledge: KnowledgeEntry[];
}

export interface AnglerSummary {
  id: string;
  name: string;
  sources: number;
  lures: number;
  knowledge: number;
  topCategories: string[];
  lureNames: string[];
}
