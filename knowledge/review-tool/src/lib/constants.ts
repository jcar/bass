// ─── Single source of truth for validation constants ───
// Values sourced from strikezone/src/lib/anglers/types.ts and related files

/** The 11 valid keys in a ConditionPredicate (strikezone ConditionPredicate interface) */
export const VALID_WHEN_KEYS = [
  'season',
  'waterTemp',
  'waterClarity',
  'skyCondition',
  'frontalSystem',
  'pressureTrend',
  'windSpeed',
  'fishDepth',
  'timeOfDay',
  'isLowLight',
  'isStained',
] as const;

export type ValidWhenKey = (typeof VALID_WHEN_KEYS)[number];

/** 9 structure types used in StructureTargets */
export const STRUCTURE_TYPES = [
  'point',
  'bluff',
  'grass',
  'flat',
  'dock',
  'creek-channel',
  'hump',
  'riprap',
  'laydown',
] as const;

export type StructureType = (typeof STRUCTURE_TYPES)[number];

/** 26 canonical base lure names from strikezone/src/lib/anglers/base-lures.ts */
export const BASE_LURE_NAMES = [
  'Swim Jig',
  'Structure Jig',
  'Shakyhead',
  'Neko Rig',
  'Strolling Rig',
  'Spinnerbait (Colorado/Willow)',
  'Chatterbait',
  'Squarebill Crankbait',
  'Medium Diving Crankbait',
  'Deep Diving Crankbait',
  'Lipless Crankbait',
  'Suspending Jerkbait',
  'Walking Topwater',
  'Buzzbait',
  'Drop Shot',
  'Ned Rig',
  'Texas Rig (Creature Bait)',
  'Carolina Rig',
  'Flipping Jig',
  'Football Jig',
  'Hair Jig / Finesse Jig',
  'Crawfish Pattern Jig',
  'Blade Bait',
  'Jigging Spoon',
  'Spy Bait',
  '10" Worm (Shakey/TX)',
] as const;

/** Season enum values */
export const SEASONS = ['pre-spawn', 'spawn', 'post-spawn', 'summer', 'fall', 'winter'] as const;

/** Water clarity enum values */
export const WATER_CLARITIES = ['clear', 'stained', 'muddy'] as const;

/** Sky condition enum values */
export const SKY_CONDITIONS = ['clear', 'partly-cloudy', 'overcast', 'rain'] as const;

/** Frontal system enum values */
export const FRONTAL_SYSTEMS = ['pre-frontal', 'post-frontal', 'stable', 'cold-front'] as const;

/** Pressure trend enum values */
export const PRESSURE_TRENDS = ['rising', 'falling', 'steady'] as const;

/** Time of day enum values */
export const TIMES_OF_DAY = ['dawn', 'morning', 'midday', 'afternoon', 'dusk'] as const;

/** Structure-related keywords for candidate extraction */
export const STRUCTURE_KEYWORDS = [
  'point', 'bluff', 'grass', 'flat', 'dock', 'creek', 'channel',
  'hump', 'riprap', 'laydown', 'ledge', 'bank', 'brush', 'timber', 'rock',
] as const;
