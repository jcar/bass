// ─── Angler Profile System: Entry Point ───
export { composeLures, composeLuresForAngler } from './composer';
export { BASE_LURES } from './base-lures';
export { HACKNEY } from './hackney';
export { KVD } from './kvd';
export { WHEELER } from './wheeler';
export { YAMAMOTO } from './yamamoto';
export { MILLIKEN } from './milliken';
export { PALANIUK } from './palaniuk';
export { JOHNSTON } from './johnston';
export { ROBERTSON } from './robertson';
export type { AnglerProfile, BaseLure, ConditionPredicate, ConfidenceModifier, ColorRule, TipRule, LureOpinion } from './types';

import { composeLures, composeLuresForAngler } from './composer';
import { BASE_LURES } from './base-lures';
import { HACKNEY } from './hackney';
import { KVD } from './kvd';
import { WHEELER } from './wheeler';
import { YAMAMOTO } from './yamamoto';
import { MILLIKEN } from './milliken';
import { PALANIUK } from './palaniuk';
import { JOHNSTON } from './johnston';
import { ROBERTSON } from './robertson';
import type { AnglerProfile } from './types';
import type { LureTemplate } from '../StrikeEngine';

/** All registered angler profiles. */
export const ANGLER_PROFILES: AnglerProfile[] = [HACKNEY, KVD, WHEELER, YAMAMOTO, MILLIKEN, PALANIUK, JOHNSTON, ROBERTSON];

/** The composed lure database — drop-in replacement for the old LURE_DATABASE. */
export const LURE_DATABASE = composeLures(BASE_LURES, ANGLER_PROFILES);

/** Per-angler lure databases (only lures they have opinions on, composed with just their profile). */
export const ANGLER_LURE_DBS: Map<string, LureTemplate[]> = new Map(
  ANGLER_PROFILES.map(a => [a.id, composeLuresForAngler(BASE_LURES, a)])
);
