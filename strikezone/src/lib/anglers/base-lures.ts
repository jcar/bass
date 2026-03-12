// ─── Base Lure Definitions ───
// Skeleton + general-knowledge modifiers. No angler-specific logic here.
// Angler profiles layer on top via the composer.
import type { BaseLure } from './types';

export const BASE_LURES: BaseLure[] = [
  // ─── Swim Jig ───
  {
    name: 'Swim Jig', category: 'Bladed', minDepth: 1, maxDepth: 8,
    action: 'search', baseSpeed: 'moderate', tags: ['moving', 'shallow'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'summer', 'fall'],
    baseConfidence: 68, maxConfidence: 97,
    nullGates: { minTemp: 55, maxFishDepth: 10 },
    modifiers: [
      { when: { isStained: true }, adjustment: 12 },
      { when: { isLowLight: true }, adjustment: 8 },
      { when: { windSpeed: { min: 3, max: 12 } }, adjustment: 5 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { timeOfDay: ['dawn', 'dusk'] }, adjustment: 5 },
    ],
    colorRules: [],
    defaultColor: { name: 'Bluegill', hex: '#4a6741' },
    tipRules: [],
    defaultTip: 'Swim jig through grass and laydowns. Rod tip up to keep bait in upper water column.',
  },

  // ─── Structure Jig ───
  {
    name: 'Structure Jig', category: 'Bottom', minDepth: 5, maxDepth: 30,
    action: 'power', baseSpeed: 'slow', tags: ['offshore'],
    seasons: ['pre-spawn', 'post-spawn', 'summer', 'fall', 'winter'],
    baseConfidence: 62, maxConfidence: 95,
    nullGates: {},
    modifiers: [
      { when: { fishDepth: { max: 4 } }, adjustment: -999 }, // too shallow
      { when: { isStained: true }, adjustment: 8 },
      { when: { isLowLight: true }, adjustment: 5 },
      { when: { frontalSystem: 'stable' }, adjustment: 5 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { windSpeed: { min: 16 } }, adjustment: -5 },
    ],
    colorRules: [],
    defaultColor: { name: 'Green Pumpkin', hex: '#6b8e23' },
    tipRules: [],
    defaultTip: 'Drag on bottom transitions. Feel for rock-to-mud edges — those composition changes hold fish.',
  },

  // ─── Shakyhead ───
  {
    name: 'Shakyhead', category: 'Finesse', minDepth: 3, maxDepth: 30,
    action: 'finesse', baseSpeed: 'slow', tags: ['finesse', 'offshore'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'summer', 'fall', 'winter'],
    baseConfidence: 62, maxConfidence: 95,
    nullGates: {},
    modifiers: [
      { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 15 },
      { when: { season: 'pre-spawn' }, adjustment: 8 },
      { when: { season: 'summer', fishDepth: { min: 12 } }, adjustment: 10 },
      { when: { pressureTrend: 'rising' }, adjustment: 8 },
      { when: { waterClarity: 'clear' }, adjustment: 5 },
      { when: { waterClarity: 'muddy' }, adjustment: -10 },
      { when: { windSpeed: { max: 5 } }, adjustment: 3 },
      { when: { skyCondition: 'overcast' }, adjustment: 4 },
    ],
    colorRules: [
      { when: { waterClarity: 'clear' }, color: 'Morning Dawn', hex: '#f5c6d0', priority: 10 },
      { when: { isStained: true }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 5 },
    ],
    defaultColor: { name: 'Watermelon Red', hex: '#568203' },
    tipRules: [
      { when: { frontalSystem: 'post-frontal' }, tip: 'Post-frontal finesse weapon. Drag on points and humps. Shake in place — let the fish come to you.', priority: 10 },
    ],
    defaultTip: 'Drag along bottom on hard surfaces. The stand-up action is subtle but deadly on pressured fish.',
  },

  // ─── Neko Rig ───
  {
    name: 'Neko Rig', category: 'Finesse', minDepth: 3, maxDepth: 25,
    action: 'finesse', baseSpeed: 'slow', tags: ['finesse', 'dock'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'summer', 'fall'],
    baseConfidence: 58, maxConfidence: 92,
    nullGates: { minTemp: 50 },
    modifiers: [
      { when: { frontalSystem: 'post-frontal' }, adjustment: 15 },
      { when: { waterClarity: ['clear', 'stained'] }, adjustment: 8 },
      { when: { season: 'summer' }, adjustment: 8 },
      { when: { windSpeed: { max: 8 } }, adjustment: 5 },
      { when: { waterClarity: 'muddy' }, adjustment: -12 },
      { when: { pressureTrend: 'rising' }, adjustment: 5 },
      { when: { skyCondition: 'overcast' }, adjustment: 4 },
    ],
    colorRules: [
      { when: { waterClarity: 'clear' }, color: 'Green Pumpkin', hex: '#6b8e23', priority: 10 },
    ],
    defaultColor: { name: 'Junebug', hex: '#4a0e4e' },
    tipRules: [],
    defaultTip: 'Weight in the nose, wacky rigged. The head-down fall and nose-in-the-dirt action drives fish crazy around docks and isolated cover.',
  },

  // ─── Strolling Rig ───
  {
    name: 'Strolling Rig', category: 'Soft Plastic', minDepth: 12, maxDepth: 40,
    action: 'search', baseSpeed: 'slow', tags: ['offshore'],
    seasons: ['summer', 'fall'],
    baseConfidence: 55, maxConfidence: 92,
    nullGates: { minTemp: 72 },
    modifiers: [
      { when: { fishDepth: { max: 10 } }, adjustment: -999 }, // acts as null gate via deep negative
      { when: { season: 'summer', fishDepth: { min: 15 } }, adjustment: 22 },
      { when: { frontalSystem: 'stable' }, adjustment: 8 },
      { when: { windSpeed: { max: 10 } }, adjustment: 5 },
      { when: { pressureTrend: 'steady' }, adjustment: 4 },
      { when: { skyCondition: 'clear' }, adjustment: 3 },
    ],
    colorRules: [
      { when: { isStained: true }, color: 'Junebug', hex: '#4a0e4e', priority: 10 },
    ],
    defaultColor: { name: 'Plum', hex: '#5a2d5a' },
    tipRules: [],
    defaultTip: 'Slow trolling with the big motor across offshore ledges and humps. The heavy weight drags bottom while the bait trails behind. North Texas offshore staple.',
  },

  // ─── Spinnerbait ───
  {
    name: 'Spinnerbait (Colorado/Willow)', category: 'Bladed', minDepth: 1, maxDepth: 8,
    action: 'search', baseSpeed: 'moderate', tags: ['moving', 'shallow'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'fall'],
    baseConfidence: 65, maxConfidence: 97,
    nullGates: { minTemp: 50, maxFishDepth: 10 },
    modifiers: [
      { when: { isStained: true, isLowLight: true }, adjustment: 18 },
      { when: { isStained: true, isLowLight: false }, adjustment: 10 },
      { when: { windSpeed: { min: 5, max: 15 } }, adjustment: 8 },
      { when: { season: ['pre-spawn', 'fall'] }, adjustment: 5 },
      { when: { waterClarity: ['stained', 'muddy'] }, adjustment: 5 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { timeOfDay: ['dawn', 'dusk'] }, adjustment: 5 },
    ],
    colorRules: [
      { when: { waterClarity: 'muddy' }, color: 'Chartreuse/White', hex: '#c4d600', priority: 10 },
    ],
    defaultColor: { name: 'White/Chartreuse', hex: '#e8e8c0' },
    tipRules: [],
    defaultTip: 'Versatile search bait. Slow roll in cold, burn in warm. Trailer hooks for short strikers.',
  },

  // ─── Chatterbait ───
  {
    name: 'Chatterbait', category: 'Bladed', minDepth: 1, maxDepth: 8,
    action: 'reaction', baseSpeed: 'moderate', tags: ['moving', 'shallow'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'summer', 'fall'],
    baseConfidence: 58, maxConfidence: 95,
    nullGates: { minTemp: 55, maxFishDepth: 10 },
    modifiers: [
      { when: { isStained: true, isLowLight: true }, adjustment: 16 },
      { when: { isStained: true, isLowLight: false }, adjustment: 10 },
      { when: { season: 'pre-spawn' }, adjustment: 10 },
      { when: { windSpeed: { min: 5 } }, adjustment: 5 },
      { when: { waterClarity: 'clear' }, adjustment: 5 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { timeOfDay: ['dawn', 'dusk'] }, adjustment: 5 },
    ],
    colorRules: [
      { when: { waterClarity: 'muddy' }, color: 'Black/Blue Craw', hex: '#2d1b69', priority: 10 },
      { when: { isStained: true }, color: 'Green Pumpkin Craw', hex: '#6b8e23', priority: 5 },
    ],
    defaultColor: { name: 'Green Pumpkin Shad', hex: '#6b8e45' },
    tipRules: [],
    defaultTip: 'Pop free from grass — erratic action triggers reaction strikes. Adjust rod angle to feel blade vibration.',
  },

  // ─── Squarebill Crankbait ───
  {
    name: 'Squarebill Crankbait', category: 'Hard', minDepth: 1, maxDepth: 6,
    action: 'reaction', baseSpeed: 'fast', tags: ['moving', 'shallow'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'fall'],
    baseConfidence: 60, maxConfidence: 95,
    nullGates: { minTemp: 48, maxFishDepth: 8 },
    modifiers: [
      { when: { windSpeed: { min: 10 } }, adjustment: 18 },
      { when: { windSpeed: { min: 5, max: 10 } }, adjustment: 8 },
      { when: { isStained: true }, adjustment: 8 },
      { when: { season: 'post-spawn' }, adjustment: 10 },
      { when: { season: 'fall' }, adjustment: 8 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: -10 },
      { when: { frontalSystem: 'pre-frontal' }, adjustment: 5 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { timeOfDay: ['dawn', 'dusk'] }, adjustment: 4 },
    ],
    colorRules: [
      { when: { waterClarity: 'muddy' }, color: 'Chartreuse Black Back', hex: '#c4d600', priority: 10 },
      { when: { isStained: true }, color: 'Chartreuse Sexy Shad', hex: '#b8c900', priority: 8 },
      { when: { season: 'pre-spawn' }, color: 'Orange Belly Craw', hex: '#c4724e', priority: 6 },
      { when: { season: ['post-spawn', 'summer'] }, color: 'Bluegill', hex: '#4a6741', priority: 4 },
    ],
    defaultColor: { name: 'Sexy Shad', hex: '#a8b5c2' },
    tipRules: [],
    defaultTip: 'Deflection off cover is everything. Rod tip down for max depth. 12-20lb fluoro.',
  },

  // ─── Medium Diving Crankbait ───
  {
    name: 'Medium Diving Crankbait', category: 'Hard', minDepth: 6, maxDepth: 12,
    action: 'search', baseSpeed: 'fast', tags: ['moving', 'offshore'],
    seasons: ['pre-spawn', 'post-spawn', 'summer', 'fall'],
    baseConfidence: 60, maxConfidence: 93,
    nullGates: { minTemp: 50, maxFishDepth: 14 },
    modifiers: [
      { when: { fishDepth: { max: 5 } }, adjustment: -999 },
      { when: { windSpeed: { min: 8 } }, adjustment: 12 },
      { when: { windSpeed: { min: 5, max: 8 } }, adjustment: 5 },
      { when: { season: 'pre-spawn' }, adjustment: 10 },
      { when: { isStained: true }, adjustment: 5 },
      { when: { frontalSystem: 'pre-frontal' }, adjustment: 8 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: -8 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { timeOfDay: ['morning', 'afternoon'] }, adjustment: 3 },
    ],
    colorRules: [
      { when: { waterClarity: 'muddy' }, color: 'Chartreuse Sexy Shad', hex: '#b8c900', priority: 10 },
      { when: { isStained: true }, color: 'Sexy Shad', hex: '#a8b5c2', priority: 5 },
      { when: { waterClarity: 'clear' }, color: 'Ghost Minnow', hex: '#c0d6e4', priority: 8 },
    ],
    defaultColor: { name: 'Sexy Shad', hex: '#a8b5c2' },
    tipRules: [],
    defaultTip: 'Pick a crank that runs 2ft deeper than target. 5.3:1 reel, 10-12lb fluoro, rod tip down.',
  },

  // ─── Deep Diving Crankbait ───
  {
    name: 'Deep Diving Crankbait', category: 'Hard', minDepth: 12, maxDepth: 20,
    action: 'search', baseSpeed: 'fast', tags: ['offshore'],
    seasons: ['summer', 'fall'],
    baseConfidence: 62, maxConfidence: 95,
    nullGates: { minTemp: 65, maxFishDepth: 22 },
    modifiers: [
      { when: { fishDepth: { max: 10 } }, adjustment: -999 },
      { when: { season: 'summer' }, adjustment: 15 },
      { when: { windSpeed: { min: 5 } }, adjustment: 8 },
      { when: { frontalSystem: 'pre-frontal' }, adjustment: 8 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: -8 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { skyCondition: 'overcast' }, adjustment: 3 },
    ],
    colorRules: [
      { when: { waterClarity: 'muddy' }, color: 'Powder Blue Chartreuse', hex: '#b5c400', priority: 10 },
      { when: { isStained: true }, color: 'Sexy Shad', hex: '#a8b5c2', priority: 5 },
    ],
    defaultColor: { name: 'Sexy Shad', hex: '#a8b5c2' },
    tipRules: [],
    defaultTip: '14lb fluoro, 5.3:1 reel. Grind the bill into bottom. Deflection triggers strikes.',
  },

  // ─── Lipless Crankbait ───
  {
    name: 'Lipless Crankbait', category: 'Hard', minDepth: 1, maxDepth: 8,
    action: 'reaction', baseSpeed: 'fast', tags: ['moving', 'shallow'],
    seasons: ['pre-spawn', 'post-spawn', 'fall', 'winter'],
    baseConfidence: 58, maxConfidence: 93,
    nullGates: { maxFishDepth: 10 },
    modifiers: [
      { when: { windSpeed: { min: 10 } }, adjustment: 15 },
      { when: { isStained: true }, adjustment: 5 },
      { when: { frontalSystem: 'pre-frontal' }, adjustment: 6 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { timeOfDay: ['dawn', 'dusk'] }, adjustment: 5 },
      { when: { waterClarity: 'muddy' }, adjustment: -5 },
    ],
    colorRules: [
      { when: { season: 'fall' }, color: 'Natural Shad', hex: '#a8b5c2', priority: 8 },
      { when: { isStained: true }, color: 'Red Craw', hex: '#8b1a1a', priority: 4 },
    ],
    defaultColor: { name: 'Gold Sexy Shad', hex: '#b8860b' },
    tipRules: [],
    defaultTip: 'Yo-yo with rod sweeps, not the reel. The fall triggers bites. 5.3:1 gear ratio, 17lb fluoro.',
  },

  // ─── Suspending Jerkbait ───
  {
    name: 'Suspending Jerkbait', category: 'Hard', minDepth: 3, maxDepth: 10,
    action: 'reaction', baseSpeed: 'moderate', tags: ['moving'],
    seasons: ['pre-spawn', 'winter', 'fall', 'post-spawn'],
    baseConfidence: 55, maxConfidence: 95,
    nullGates: { maxFishDepth: 12, requiredClarity: ['clear', 'stained'] },
    modifiers: [
      { when: { waterClarity: 'clear' }, adjustment: 15 },
      { when: { waterTemp: { min: 42, max: 55 } }, adjustment: 18 },
      { when: { waterTemp: { min: 55, max: 65 } }, adjustment: 10 },
      { when: { frontalSystem: 'post-frontal', waterClarity: 'clear' }, adjustment: 12 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: 5 },
      { when: { pressureTrend: 'rising' }, adjustment: 4 },
      { when: { windSpeed: { max: 8 } }, adjustment: 3 },
    ],
    colorRules: [
      { when: { waterClarity: 'clear' }, color: 'Ghost Minnow', hex: '#c0d6e4', priority: 10 },
    ],
    defaultColor: { name: 'Clown', hex: '#e85040' },
    tipRules: [],
    defaultTip: 'Snap-snap-pause. Adjust pause length to water temp. Fish parallel to edges for efficiency.',
  },

  // ─── Walking Topwater ───
  {
    name: 'Walking Topwater', category: 'Topwater', minDepth: 0, maxDepth: 4,
    action: 'reaction', baseSpeed: 'moderate', tags: ['moving', 'topwater', 'shallow'],
    seasons: ['post-spawn', 'summer', 'fall'],
    baseConfidence: 55, maxConfidence: 92,
    nullGates: { minTemp: 62, maxFishDepth: 6 },
    modifiers: [
      { when: { isLowLight: true }, adjustment: 15 },
      { when: { season: 'post-spawn' }, adjustment: 12 },
      { when: { season: 'fall' }, adjustment: 10 },
      { when: { windSpeed: { min: 15 } }, adjustment: -15 },
      { when: { windSpeed: { max: 5 } }, adjustment: 5 },
      { when: { frontalSystem: 'pre-frontal' }, adjustment: 5 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: -10 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { skyCondition: 'rain' }, adjustment: -8 },
    ],
    colorRules: [
      { when: { isStained: true }, color: 'Bone', hex: '#e8dcc8', priority: 10 },
    ],
    defaultColor: { name: 'Chrome/Blue', hex: '#87afc7' },
    tipRules: [],
    defaultTip: 'Walk-walk-pause. Long casts with mono. Keep a weightless Senko ready for missed blowups.',
  },

  // ─── Buzzbait ───
  {
    name: 'Buzzbait', category: 'Topwater', minDepth: 0, maxDepth: 3,
    action: 'reaction', baseSpeed: 'fast', tags: ['moving', 'topwater', 'shallow'],
    seasons: ['post-spawn', 'summer', 'fall'],
    baseConfidence: 50, maxConfidence: 92,
    nullGates: { minTemp: 58, maxFishDepth: 5 },
    modifiers: [
      { when: { isLowLight: true }, adjustment: 18 },
      { when: { isStained: true }, adjustment: 12 },
      { when: { windSpeed: { min: 12 } }, adjustment: -10 },
      { when: { skyCondition: 'rain' }, adjustment: -8 },
    ],
    colorRules: [],
    defaultColor: { name: 'White/Chartreuse', hex: '#f0f0f0' },
    tipRules: [],
    defaultTip: 'Retrieve steady — the blade does the work. Frog trailer slows the retrieve for a better look.',
  },

  // ─── Drop Shot ───
  {
    name: 'Drop Shot', category: 'Finesse', minDepth: 5, maxDepth: 50,
    action: 'finesse', baseSpeed: 'slow', tags: ['finesse', 'offshore'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'summer', 'fall', 'winter'],
    baseConfidence: 60, maxConfidence: 95,
    nullGates: {},
    modifiers: [
      { when: { waterClarity: 'clear' }, adjustment: 15 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: 15 },
      { when: { frontalSystem: 'cold-front' }, adjustment: 10 },
      { when: { season: 'summer', fishDepth: { min: 15 } }, adjustment: 10 },
      { when: { season: 'winter' }, adjustment: 10 },
      { when: { pressureTrend: 'rising' }, adjustment: 5 },
      { when: { waterClarity: 'muddy' }, adjustment: -15 },
      { when: { windSpeed: { max: 8 } }, adjustment: 3 },
      { when: { skyCondition: 'clear', waterClarity: 'clear' }, adjustment: 3 },
    ],
    colorRules: [
      { when: { waterClarity: 'clear' }, color: 'Morning Dawn', hex: '#f5c6d0', priority: 10 },
    ],
    defaultColor: { name: 'Green Pumpkin', hex: '#6b8e23' },
    tipRules: [],
    defaultTip: '1/2oz tungsten deep, 1/8oz shallow. Shake, don\'t swim. Keep bait in the strike zone.',
  },

  // ─── Ned Rig ───
  {
    name: 'Ned Rig', category: 'Finesse', minDepth: 3, maxDepth: 25,
    action: 'finesse', baseSpeed: 'slow', tags: ['finesse'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'summer', 'fall', 'winter'],
    baseConfidence: 58, maxConfidence: 90,
    nullGates: {},
    modifiers: [
      { when: { frontalSystem: ['post-frontal', 'cold-front'] }, adjustment: 12 },
      { when: { season: 'winter' }, adjustment: 10 },
      { when: { waterTemp: { max: 55 } }, adjustment: 8 },
      { when: { waterClarity: 'muddy' }, adjustment: -10 },
      { when: { waterClarity: 'clear' }, adjustment: 5 },
      { when: { pressureTrend: 'rising' }, adjustment: 5 },
      { when: { windSpeed: { max: 8 } }, adjustment: 3 },
    ],
    colorRules: [],
    defaultColor: { name: 'TRD Green Pumpkin', hex: '#6b8e23' },
    tipRules: [],
    defaultTip: 'Cast, sink, drag slowly. Mushroom head stands bait up on hard bottom.',
  },

  // ─── Texas Rig (Creature Bait) ───
  {
    name: 'Texas Rig (Creature Bait)', category: 'Soft Plastic', minDepth: 2, maxDepth: 30,
    action: 'power', baseSpeed: 'slow', tags: ['shallow', 'offshore'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'summer', 'fall', 'winter'],
    baseConfidence: 60, maxConfidence: 92,
    nullGates: {},
    modifiers: [
      { when: { isStained: true }, adjustment: 8 },
      { when: { season: ['pre-spawn', 'fall'] }, adjustment: 8 },
      { when: { season: 'summer' }, adjustment: 5 },
      { when: { windSpeed: { max: 5 } }, adjustment: 5 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: -5 },
      { when: { frontalSystem: 'stable' }, adjustment: 4 },
      { when: { isLowLight: true }, adjustment: 4 },
      { when: { pressureTrend: 'falling' }, adjustment: 3 },
    ],
    colorRules: [
      { when: { waterClarity: 'muddy' }, color: 'Black/Neon', hex: '#1a1a2e', priority: 10 },
      { when: { isStained: true }, color: 'Junebug', hex: '#4a0e4e', priority: 8 },
      { when: { waterClarity: 'clear' }, color: 'Candy Craw', hex: '#c4724e', priority: 6 },
    ],
    defaultColor: { name: 'Watermelon Red', hex: '#568203' },
    tipRules: [],
    defaultTip: 'Pitch to isolated cover — laydowns, docks, stumps. Most bites come on the fall.',
  },

  // ─── Carolina Rig ───
  {
    name: 'Carolina Rig', category: 'Soft Plastic', minDepth: 8, maxDepth: 35,
    action: 'search', baseSpeed: 'slow', tags: ['offshore'],
    seasons: ['pre-spawn', 'summer', 'fall'],
    baseConfidence: 55, maxConfidence: 90,
    nullGates: {},
    modifiers: [
      { when: { fishDepth: { max: 6 } }, adjustment: -999 },
      { when: { season: 'summer', fishDepth: { min: 12 } }, adjustment: 18 },
      { when: { season: 'pre-spawn' }, adjustment: 12 },
      { when: { frontalSystem: 'stable' }, adjustment: 8 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: -8 },
      { when: { windSpeed: { min: 10 } }, adjustment: 4 },
      { when: { pressureTrend: 'steady' }, adjustment: 3 },
      { when: { skyCondition: 'clear' }, adjustment: 3 },
    ],
    colorRules: [
      { when: { waterClarity: 'clear' }, color: 'Watermelon Candy', hex: '#6b8e45', priority: 10 },
    ],
    defaultColor: { name: 'Junebug', hex: '#4a0e4e' },
    tipRules: [
      { when: { season: 'summer' }, tip: 'Drag across offshore flats and humps. The weight ticks structure while the bait floats behind.', priority: 10 },
    ],
    defaultTip: 'Long leader (3-4ft). Sweep, reel down, repeat. Cover water to find schools.',
  },

  // ─── Flipping Jig ───
  {
    name: 'Flipping Jig', category: 'Bottom', minDepth: 1, maxDepth: 10,
    action: 'power', baseSpeed: 'slow', tags: ['shallow', 'dock'],
    seasons: ['pre-spawn', 'spawn', 'post-spawn', 'summer', 'fall'],
    baseConfidence: 58, maxConfidence: 95,
    nullGates: { minTemp: 48, maxFishDepth: 12 },
    modifiers: [
      { when: { isStained: true, isLowLight: true }, adjustment: 15 },
      { when: { isStained: true }, adjustment: 8 },
      { when: { season: 'pre-spawn' }, adjustment: 10 },
      { when: { frontalSystem: 'stable' }, adjustment: 4 },
      { when: { windSpeed: { max: 8 } }, adjustment: 5 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
    ],
    colorRules: [
      { when: { isStained: true }, color: 'Black & Blue', hex: '#1a1a2e', priority: 10 },
      { when: { isLowLight: true }, color: 'Black & Blue', hex: '#1a1a2e', priority: 8 },
    ],
    defaultColor: { name: 'Green Pumpkin', hex: '#6b8e23' },
    tipRules: [],
    defaultTip: 'Pitch tight to cover on semi-slack line. Accurate bait placement is everything.',
  },

  // ─── Football Jig ───
  {
    name: 'Football Jig', category: 'Bottom', minDepth: 8, maxDepth: 40,
    action: 'power', baseSpeed: 'slow', tags: ['offshore'],
    seasons: ['pre-spawn', 'summer', 'fall', 'winter'],
    baseConfidence: 60, maxConfidence: 93,
    nullGates: {},
    modifiers: [
      { when: { fishDepth: { max: 6 } }, adjustment: -999 },
      { when: { season: 'summer', fishDepth: { min: 15 } }, adjustment: 15 },
      { when: { season: 'winter' }, adjustment: 10 },
      { when: { isStained: true }, adjustment: 8 },
      { when: { isLowLight: true }, adjustment: 5 },
      { when: { frontalSystem: 'stable' }, adjustment: 5 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: -8 },
      { when: { windSpeed: { min: 10 } }, adjustment: 4 },
      { when: { pressureTrend: 'steady' }, adjustment: 3 },
    ],
    colorRules: [
      { when: { isStained: true }, color: 'PB&J', hex: '#4a2040', priority: 10 },
      { when: { isLowLight: true }, color: 'PB&J', hex: '#4a2040', priority: 8 },
    ],
    defaultColor: { name: 'Green Pumpkin/Orange', hex: '#6b8e23' },
    tipRules: [],
    defaultTip: 'Football head kicks off rocks for erratic action. Drag on bottom transitions.',
  },

  // ─── Hair Jig / Finesse Jig ───
  {
    name: 'Hair Jig / Finesse Jig', category: 'Bottom', minDepth: 5, maxDepth: 35,
    action: 'finesse', baseSpeed: 'slow', tags: ['finesse', 'offshore'],
    seasons: ['winter', 'pre-spawn'],
    baseConfidence: 60, maxConfidence: 93,
    nullGates: {},
    modifiers: [
      { when: { waterTemp: { min: 56 } }, adjustment: -999 }, // warm water null gate
      { when: { season: 'winter' }, adjustment: 15 },
      { when: { waterTemp: { min: 40, max: 50 } }, adjustment: 10 },
      { when: { waterClarity: 'clear' }, adjustment: 8 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: 5 },
      { when: { pressureTrend: 'rising' }, adjustment: 5 },
      { when: { windSpeed: { max: 10 } }, adjustment: 3 },
      { when: { waterClarity: 'muddy' }, adjustment: -10 },
    ],
    colorRules: [
      { when: { waterClarity: 'clear' }, color: 'Brown/Orange', hex: '#8b5e3c', priority: 10 },
    ],
    defaultColor: { name: 'PB&J', hex: '#4a2040' },
    tipRules: [],
    defaultTip: 'Position over deep water, pitch shallow. Fish move vertically in cold water, not across flats.',
  },

  // ─── Crawfish Pattern Jig ───
  {
    name: 'Crawfish Pattern Jig', category: 'Bottom', minDepth: 4, maxDepth: 20,
    action: 'power', baseSpeed: 'slow', tags: ['shallow', 'offshore'],
    seasons: ['pre-spawn', 'spawn'],
    baseConfidence: 60, maxConfidence: 95,
    nullGates: { minTemp: 50 },
    modifiers: [
      { when: { waterTemp: { min: 73 } }, adjustment: -999 }, // too hot null gate
      { when: { season: 'pre-spawn', waterTemp: { min: 55 } }, adjustment: 22 },
      { when: { season: 'spawn' }, adjustment: 10 },
      { when: { isStained: true }, adjustment: 5 },
      { when: { frontalSystem: 'stable' }, adjustment: 5 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: -8 },
      { when: { pressureTrend: 'falling' }, adjustment: 4 },
      { when: { isLowLight: true }, adjustment: 3 },
    ],
    colorRules: [],
    defaultColor: { name: 'Green Pumpkin/Craw', hex: '#6b8e23' },
    tipRules: [],
    defaultTip: 'Pre-spawn bass eat crawfish aggressively. KVD Chunk trailer in cold, Rage Craw above 65°F.',
  },

  // ─── Blade Bait ───
  {
    name: 'Blade Bait', category: 'Metal', minDepth: 10, maxDepth: 50,
    action: 'finesse', baseSpeed: 'slow', tags: ['offshore'],
    seasons: ['winter'],
    baseConfidence: 65, maxConfidence: 93,
    nullGates: {},
    modifiers: [
      { when: { waterTemp: { min: 53 } }, adjustment: -999 }, // warm null gate
      { when: { fishDepth: { max: 8 } }, adjustment: -999 },
      { when: { season: 'winter' }, adjustment: 15 },
      { when: { fishDepth: { min: 20 } }, adjustment: 8 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: 5 },
      { when: { pressureTrend: 'rising' }, adjustment: 5 },
      { when: { waterClarity: 'clear' }, adjustment: 4 },
      { when: { windSpeed: { max: 10 } }, adjustment: 3 },
      { when: { waterClarity: 'muddy' }, adjustment: -8 },
    ],
    colorRules: [],
    defaultColor: { name: 'Silver', hex: '#c0c0c0' },
    tipRules: [],
    defaultTip: 'Vertical jigging over deep schools. Lift 12 inches, let it fall on tight line.',
  },

  // ─── Jigging Spoon ───
  {
    name: 'Jigging Spoon', category: 'Metal', minDepth: 15, maxDepth: 60,
    action: 'finesse', baseSpeed: 'slow', tags: ['offshore'],
    seasons: ['winter', 'summer'],
    baseConfidence: 55, maxConfidence: 90,
    nullGates: {},
    modifiers: [
      { when: { fishDepth: { max: 12 } }, adjustment: -999 },
      { when: { season: 'winter', fishDepth: { min: 20 } }, adjustment: 20 },
      { when: { season: 'summer', fishDepth: { min: 20 } }, adjustment: 15 },
      { when: { frontalSystem: 'stable' }, adjustment: 5 },
      { when: { pressureTrend: 'steady' }, adjustment: 3 },
      { when: { windSpeed: { max: 10 } }, adjustment: 3 },
    ],
    colorRules: [],
    defaultColor: { name: 'Gold', hex: '#d4a844' },
    tipRules: [
      { when: { season: 'winter' }, tip: 'Find the school on electronics, drop straight down, rip 3-5ft and flutter. Winter fish stack tight.', priority: 10 },
    ],
    defaultTip: 'Vertical over deep humps and ledges. The flash on the fall mimics a dying shad.',
  },

  // ─── Spy Bait ───
  {
    name: 'Spy Bait', category: 'Hard', minDepth: 6, maxDepth: 15,
    action: 'finesse', baseSpeed: 'slow', tags: ['finesse'],
    seasons: ['post-spawn', 'summer', 'winter'],
    baseConfidence: 55, maxConfidence: 88,
    nullGates: { maxFishDepth: 18, requiredClarity: ['clear'] },
    modifiers: [
      { when: { waterClarity: 'clear' }, adjustment: 18 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: 10 },
      { when: { pressureTrend: 'rising' }, adjustment: 5 },
      { when: { windSpeed: { max: 5 } }, adjustment: 5 },
      { when: { skyCondition: 'clear' }, adjustment: 3 },
    ],
    colorRules: [],
    defaultColor: { name: 'Clear Shad', hex: '#e8e8e8' },
    tipRules: [],
    defaultTip: 'Ultra-slow straight retrieve. Secret weapon for clear water and pressured fish.',
  },

  // ─── 10" Worm ───
  {
    name: '10" Worm (Shakey/TX)', category: 'Soft Plastic', minDepth: 5, maxDepth: 30,
    action: 'power', baseSpeed: 'slow', tags: ['offshore'],
    seasons: ['summer', 'fall'],
    baseConfidence: 58, maxConfidence: 90,
    nullGates: { minTemp: 68 },
    modifiers: [
      { when: { season: 'summer' }, adjustment: 15 },
      { when: { fishDepth: { min: 12 } }, adjustment: 10 },
      { when: { isStained: true }, adjustment: 5 },
      { when: { frontalSystem: 'stable' }, adjustment: 5 },
      { when: { frontalSystem: 'post-frontal' }, adjustment: -5 },
      { when: { pressureTrend: 'steady' }, adjustment: 3 },
      { when: { windSpeed: { min: 8 } }, adjustment: 3 },
    ],
    colorRules: [
      { when: { isStained: true }, color: 'Junebug', hex: '#4a0e4e', priority: 10 },
    ],
    defaultColor: { name: 'Plum', hex: '#5a2d5a' },
    tipRules: [],
    defaultTip: 'Summer deep brushpiles 18-25ft with a big worm. The size triggers bites from fish ignoring finesse.',
  },
];
