// ─── StrikeZone Tuning Configuration ───
// Every magic number in the engine is externalized here.
// Calibrated to North Texas reservoirs based on angler input.

export interface TuningConfig {
  // ─── Seasonal Temperature Breakpoints (°F) ───
  seasonalBreakpoints: {
    winterCeiling: number;       // below this = winter
    preSpawnStart: number;       // pre-spawn staging begins
    preSpawnToSpawn: number;     // transition to active spawn
    spawnPeak: number;           // peak spawn activity
    postSpawnStart: number;      // post-spawn begins
    summerStart: number;         // full summer pattern
    fallStart: number;           // fall transition begins (cooling from summer)
    fallEnd: number;             // fall ends, winter begins (cooling)
  };

  // ─── Bite Intensity Weights (must sum to ~1.0) ───
  // Ranked per angler: time of day, water temp, pressure, wind, clarity, sky
  biteWeights: {
    timeOfDay: number;
    waterTemp: number;
    barometricPressure: number;
    wind: number;
    waterClarity: number;
    skyCondition: number;
    frontalSystem: number;
  };

  // ─── Time of Day Periods ───
  timeOfDay: {
    dawn: { startHour: number; endHour: number; shallowBias: number; movingBaitBonus: number; topwaterBonus: number };
    morning: { startHour: number; endHour: number; shallowBias: number; movingBaitBonus: number; offshoreBias: number };
    midday: { startHour: number; endHour: number; deepBias: number; finessBonus: number; dockBonus: number };
    afternoon: { startHour: number; endHour: number; deepBias: number; finessBonus: number; dockBonus: number };
    dusk: { startHour: number; endHour: number; shallowBias: number; movingBaitBonus: number; topwaterBonus: number };
  };

  // ─── Fish Depth Sensitivity ───
  depthSensitivity: {
    pressureInfluence: number;      // 0-1: how much pressure shifts depth within range
    frontalInfluence: number;       // 0-1: how much frontal systems shift depth
    skyInfluence: number;           // 0-1: how much sky condition shifts depth
    coldWaterDeepBias: number;      // 0-1: extra deep push below winterCeiling
    windInfluence: number;          // 0-1: how much wind pulls fish shallower
    clarityInfluence: number;       // 0-1: how much clarity shifts depth (clear=deeper, muddy=shallower)
    coldFrontRatio: number;         // 0-1: cold-front depth push as fraction of post-frontal
  };

  // ─── Pressure Thresholds ───
  pressure: {
    highThreshold: number;   // inHg above which = high pressure behavior
    lowThreshold: number;    // inHg below which = low pressure behavior
    trendSensitivity: number; // inHg diff to register as rising/falling
  };

  // ─── Lure Confidence Adjustments ───
  // Per-category multiplier (1.0 = no change, >1 = boost, <1 = reduce)
  lureMultipliers: Record<string, number>;
}

// ─── Default Config: North Texas Reservoirs ───
export const DEFAULT_TUNING: TuningConfig = {
  seasonalBreakpoints: {
    winterCeiling: 45,        // below 45F = true winter lockdown (bass nearly dormant)
    preSpawnStart: 48,        // bass begin staging at 48F when photoperiod triggers (Feb-Mar in NTX)
    preSpawnToSpawn: 60,      // transition zone — bass moving to beds
    spawnPeak: 65,            // optimal egg viability/hatching at 65F (Heidinger 1976)
    postSpawnStart: 72,       // most spawning done by 72F on NTX reservoirs
    summerStart: 80,
    fallStart: 76,            // -2: shad migration kicks in at 76F cooling (Coutant thermal data)
    fallEnd: 50,              // -2: fall feed tapers below 50F (Shuter & Post 1990)
  },

  biteWeights: {
    waterTemp: 0.24,          // #1: strongest single predictor of catch rates (Wilde 1997, Texas Tech)
    timeOfDay: 0.18,          // #2: important but partly captured by temperature
    frontalSystem: 0.14,      // #3: promoted — most dramatic short-term effect on bite quality
    wind: 0.16,               // #4: current, mudlines, surface break are well-supported
    barometricPressure: 0.10, // #5: demoted — largely redundant with frontal system (Gatz & Linder 1990)
    waterClarity: 0.10,
    skyCondition: 0.08,
  },

  timeOfDay: {
    dawn:      { startHour: 5,  endHour: 8,  shallowBias: 0.4, movingBaitBonus: 20, topwaterBonus: 15 },
    morning:   { startHour: 8,  endHour: 11, shallowBias: 0.1, movingBaitBonus: 10, offshoreBias: 0.2 },
    midday:    { startHour: 11, endHour: 14, deepBias: 0.35,   finessBonus: 12,     dockBonus: 13 },
    afternoon: { startHour: 14, endHour: 17, deepBias: 0.2,    finessBonus: 10,     dockBonus: 15 },
    dusk:      { startHour: 17, endHour: 20, shallowBias: 0.35, movingBaitBonus: 18, topwaterBonus: 20 },
  },

  depthSensitivity: {
    pressureInfluence: 0.20,    // reduced from 0.30 — avoids double-counting with frontal/sky
    frontalInfluence: 0.35,     // reduced from 0.40 — post-frontal push is ~4-8ft within range
    skyInfluence: 0.20,         // increased from 0.15 — light penetration is well-documented driver
    coldWaterDeepBias: 0.50,    // increased from 0.35 — TPWD electrofishing: 80%+ of bass >20ft below 45F
    windInfluence: 0.12,        // NEW: wind pushes bass shallower (current, oxygenation, broken surface)
    clarityInfluence: 0.22,     // NEW: clear=deeper, muddy=shallower (light extinction coefficient)
    coldFrontRatio: 0.45,       // NEW: front passage = 45% of post-frontal effect (lockjaw comes AFTER)
  },

  pressure: {
    highThreshold: 30.40,     // raised from 30.20 — behavioral suppression at 30.40+ (Keith Jones)
    lowThreshold: 29.90,      // raised from 29.80 — feeding activation begins at 29.90 (In-Fisherman)
    trendSensitivity: 0.06,   // raised from 0.04 — filters diurnal noise (0.02-0.04 is normal variation)
  },

  lureMultipliers: {
    // Tier 1 — Money Baits for Stained NTX Reservoirs
    'Squarebill Crankbait': 1.25,         // #1 shallow stained-water bait (tournament data)
    'Texas Rig (Creature Bait)': 1.20,    // all-time most cited winning pattern on TX waters
    'Drop Shot': 1.20,                    // #1 finesse technique in professional bass fishing
    'Swim Jig': 1.15,                     // top-3 money bait on NTX reservoirs pre-spawn→post
    'Chatterbait': 1.15,                  // surpassed spinnerbait in tournament wins 2020-2025
    'Lipless Crankbait': 1.15,            // proven pre-spawn/fall pattern (grass rip)
    'Shakyhead': 1.15,                    // NTX regional staple, year-round producer
    'Football Jig': 1.15,                 // #1 offshore jig for structured fishing
    'Flipping Jig': 1.15,                 // tier-1 in stained timber/dock fisheries
    'Strolling Rig': 1.15,               // regionally critical NTX summer technique
    // Tier 2 — Solid Performers
    'Medium Diving Crankbait': 1.10,      // consistent on channel-swing structure
    'Deep Diving Crankbait': 1.10,        // summer offshore weapon (Fork, Texoma)
    '10" Worm (Shakey/TX)': 1.10,         // proven summer ledge bait
    'Structure Jig': 1.10,               // versatile offshore jig
    'Crawfish Pattern Jig': 1.10,         // dominant pre-spawn match-the-hatch
    'Blade Bait': 1.10,                  // #1-2 winter technique
    'Walking Topwater': 1.05,            // effective but seasonal (post-spawn→fall)
    'Ned Rig': 1.05,                     // catches fish consistently, less big-fish potential
    'Hair Jig / Finesse Jig': 1.05,      // winter dominance within narrow window
    'Suspending Jerkbait': 1.05,          // proven cold-water bait, limited by stained water
    'Neko Rig': 1.00,                    // solid but below drop shot/shakyhead in versatility
    'Jigging Spoon': 1.00,              // effective but very niche (deep schooled fish only)
    // Tier 3 — Declining or Niche
    'Spinnerbait (Colorado/Willow)': 0.95, // still works but chatterbait/swim jig took its share
    'Carolina Rig': 0.90,                // displaced by strolling rig and football jig
    'Buzzbait': 0.90,                    // fun but low-percentage, truly situational
    'Spy Bait': 0.80,                    // requires clear water — irrelevant in stained NTX
  },
};

// ─── Persistence ───
const STORAGE_KEY = 'strikezone-tuning-v1';

export function loadTuning(): TuningConfig {
  if (typeof window === 'undefined') return DEFAULT_TUNING;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_TUNING;
    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new fields added in updates
    return deepMerge(DEFAULT_TUNING, parsed);
  } catch {
    return DEFAULT_TUNING;
  }
}

export function saveTuning(config: TuningConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage full or unavailable
  }
}

export function resetTuning(): TuningConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_TUNING;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(base: any, override: any): any {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overVal = override[key];
    if (overVal !== undefined && overVal !== null) {
      if (typeof baseVal === 'object' && typeof overVal === 'object' && !Array.isArray(baseVal)) {
        result[key] = deepMerge(baseVal, overVal);
      } else {
        result[key] = overVal;
      }
    }
  }
  return result;
}
