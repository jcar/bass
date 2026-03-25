// ─── StrikeEngine: The Brain of StrikeZone ───
// All magic numbers are driven by TuningConfig.
import type {
  WeatherConditions, StrikeAnalysis, SeasonalPhase, FishPosition,
  LureRecommendation, BiteWindow, PressureTrend, Season, LureAction, RetrieveSpeed,
  ScoreFactor, AnglerPick, AnglerEndorsement,
} from './types';
import { DEFAULT_TUNING, getSeasonalTimeOfDay, type TuningConfig } from './tuning';

// ─── Time of Day ───
export type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk';

export function getTimeOfDay(hour: number, cfg: TuningConfig, month?: number): TimeOfDay {
  const t = month != null ? getSeasonalTimeOfDay(month, cfg) : cfg.timeOfDay;
  if (hour >= t.dawn.startHour && hour < t.dawn.endHour) return 'dawn';
  if (hour >= t.morning.startHour && hour < t.morning.endHour) return 'morning';
  if (hour >= t.midday.startHour && hour < t.midday.endHour) return 'midday';
  if (hour >= t.afternoon.startHour && hour < t.afternoon.endHour) return 'afternoon';
  if (hour >= t.dusk.startHour && hour < t.dusk.endHour) return 'dusk';
  return 'midday'; // night hours default to midday behavior (deep/finesse)
}

// ─── Lure Template ───
export interface LureTemplate {
  name: string;
  category: string;
  minDepth: number;
  maxDepth: number;
  action: LureAction;
  baseSpeed: RetrieveSpeed;
  tags: string[]; // for time-of-day matching: 'moving', 'topwater', 'finesse', 'offshore', 'dock', 'shallow'
  seasons: Season[];
  getConfidence: (ctx: LureContext) => number | null;
  getColor: (ctx: LureContext) => { name: string; hex: string };
  getColorAlternates?: (ctx: LureContext) => import('./anglers/composer').ColorAlternate[];
  proTip: (ctx: LureContext) => string;
  getPresentation?: (ctx: LureContext) => import('./anglers/types').PresentationData;
}

export interface LureContext {
  fishDepth: number;
  waterTemp: number;
  waterClarity: string;
  skyCondition: string;
  windSpeed: number;
  frontalSystem: string;
  pressureTrend: string;
  season: Season;
  isLowLight: boolean;
  isStained: boolean;
  timeOfDay: TimeOfDay;
  cfg: TuningConfig;
}

// ─── Composed Lure Database (from angler profiles) ───
import { LURE_DATABASE } from './anglers';

// (Old inline LURE_DATABASE removed — now composed from angler profiles)
// ─── Seasonal Phase Calculator ───
export function calculateSeasonalPhase(waterTemp: number, month: number, cfg: TuningConfig = DEFAULT_TUNING): SeasonalPhase {
  const bp = cfg.seasonalBreakpoints;

  // The same water temp means different things depending on whether we're
  // warming (spring) or cooling (fall). Month determines direction.
  const isSpring = month >= 1 && month <= 6;   // Jan-Jun: warming trend
  const isFall = month >= 9 && month <= 12;     // Sep-Dec: cooling trend
  // Jul-Aug: summer unless water is somehow cold

  let season: Season;

  if (isSpring) {
    // Spring progression: winter -> pre-spawn -> spawn -> post-spawn -> summer
    if (waterTemp < bp.winterCeiling) {
      season = 'winter';
    } else if (waterTemp < bp.preSpawnStart) {
      // Between winterCeiling and preSpawnStart in spring = early pre-spawn staging
      // Bass are responding to photoperiod even though water is still cool
      season = month >= 2 ? 'pre-spawn' : 'winter';
    } else if (waterTemp < bp.preSpawnToSpawn) {
      season = 'pre-spawn';
    } else if (waterTemp < bp.spawnPeak + 3) {
      // 60-68F range in spring = spawn window
      season = 'spawn';
    } else if (waterTemp < bp.postSpawnStart) {
      // Between spawn peak and post-spawn start
      season = month >= 4 ? 'spawn' : 'pre-spawn';
    } else if (waterTemp <= bp.summerStart) {
      season = 'post-spawn';
    } else {
      season = 'summer';
    }
  } else if (isFall) {
    // Fall progression: summer -> fall -> winter (no spawn phases)
    if (waterTemp > bp.summerStart) {
      // Still hot in early fall
      season = month >= 10 ? 'fall' : 'summer';
    } else if (waterTemp > bp.fallEnd) {
      season = 'fall';
    } else if (waterTemp > bp.winterCeiling) {
      // Cooling below fall threshold — late fall / early winter transition
      season = month <= 10 ? 'fall' : 'winter';
    } else {
      season = 'winter';
    }
  } else {
    // Jul-Aug: summer unless water is unusually cold
    if (waterTemp > bp.postSpawnStart) {
      season = 'summer';
    } else if (waterTemp > bp.spawnPeak) {
      season = 'post-spawn';
    } else {
      // Unusually cold for Jul-Aug — shouldn't happen but handle gracefully
      season = 'summer';
    }
  }

  const phase = SEASONAL_DATA[season];

  // Blend depth ranges near phase thresholds to avoid sharp jumps.
  // Within ±3°F of a boundary, interpolate depth between adjacent phases.
  const BLEND_RADIUS = 3; // °F on each side of threshold

  type Transition = { threshold: number; from: Season; to: Season };
  const transitions: Transition[] = isSpring
    ? [
        { threshold: bp.winterCeiling, from: 'winter', to: 'pre-spawn' },
        { threshold: bp.preSpawnToSpawn, from: 'pre-spawn', to: 'spawn' },
        { threshold: bp.spawnPeak + 3, from: 'spawn', to: 'post-spawn' },
        { threshold: bp.postSpawnStart, from: 'post-spawn', to: 'summer' },
      ]
    : isFall
    ? [
        { threshold: bp.summerStart, from: 'summer', to: 'fall' },
        { threshold: bp.fallEnd, from: 'fall', to: 'winter' },
      ]
    : [];

  for (const t of transitions) {
    const dist = Math.abs(waterTemp - t.threshold);
    if (dist < BLEND_RADIUS) {
      const other = waterTemp < t.threshold ? SEASONAL_DATA[t.from] : SEASONAL_DATA[t.to];
      const current = waterTemp < t.threshold ? SEASONAL_DATA[t.to] : SEASONAL_DATA[t.from];
      // blend = 0 when at edge of zone (full current phase), 1 when at threshold (50/50)
      const blend = 1 - dist / BLEND_RADIUS;
      // Interpolate toward the other phase's depth range
      const blendedMin = Math.round(phase.depthRange.min + (other.depthRange.min - phase.depthRange.min) * blend * 0.5);
      const blendedMax = Math.round(phase.depthRange.max + (other.depthRange.max - phase.depthRange.max) * blend * 0.5);
      return {
        ...phase,
        depthRange: { min: blendedMin, max: blendedMax },
      };
    }
  }

  return phase;
}

const SEASONAL_DATA: Record<Season, SeasonalPhase> = {
  'pre-spawn': {
    season: 'pre-spawn', label: 'Pre-Spawn',
    description: 'Fish staging on secondary points and creek channels. Feeding aggressively before bedding.',
    keyTargets: [
      { id: 'cc', name: 'Creek Channel', type: 'creek-channel', priority: 'primary', description: 'Main migration route — bass follow the channel toward spawning flats. Fish the bends.', x: 35, y: 55 },
      { id: 'pt1', name: 'Secondary Point', type: 'point', priority: 'primary', description: 'Key staging area at 8-15ft where pre-spawn bass stack before committing to flats.', x: 62, y: 42 },
      { id: 'h1', name: 'Channel Hump', type: 'hump', priority: 'secondary', description: 'Offshore feeding station. Fish load up on crawfish here before moving shallow.', x: 28, y: 28 },
      { id: 'rp0', name: 'Riprap Bank', type: 'riprap', priority: 'secondary', description: 'Absorbs sun heat — warms first in spring. Crawfish activate early on rock.', x: 88, y: 25 },
      { id: 'fl0', name: 'Staging Flat', type: 'flat', priority: 'secondary', description: 'Adjacent to channel. Pre-spawn fish fan out here to feed before moving to beds.', x: 52, y: 65 },
    ],
    depthRange: { min: 5, max: 18 },
  },
  spawn: {
    season: 'spawn', label: 'Spawn',
    description: 'Fish on beds in 1-6ft. Target pockets, flats, and protected coves.',
    keyTargets: [
      { id: 'fl1', name: 'Spawning Flat', type: 'flat', priority: 'primary', description: 'Hard bottom flat with scattered cover. Most beds are on pea gravel or clay in 2-5ft.', x: 72, y: 62 },
      { id: 'dk1', name: 'Dock Row', type: 'dock', priority: 'primary', description: 'Shaded beds under floating docks. Big females often bed under docks for cover.', x: 85, y: 40 },
      { id: 'rp1', name: 'Riprap Bank', type: 'riprap', priority: 'secondary', description: 'Warm-water rock bank — early spawners set up along riprap transitions.', x: 92, y: 22 },
      { id: 'lo0', name: 'Protected Pocket', type: 'laydown', priority: 'secondary', description: 'Wind-sheltered cove with laydowns. Beds form in calm, protected water.', x: 78, y: 75 },
      { id: 'gr0', name: 'Grass Pocket', type: 'grass', priority: 'secondary', description: 'Sparse grass on hard bottom — bass clear beds at grass edges in 2-4ft.', x: 60, y: 72 },
    ],
    depthRange: { min: 1, max: 6 },
  },
  'post-spawn': {
    season: 'post-spawn', label: 'Post-Spawn',
    description: 'Males guard fry. Females recover on nearby structure. Topwater starts firing.',
    keyTargets: [
      { id: 'pt2', name: 'Main Lake Point', type: 'point', priority: 'primary', description: 'Transition zone from flats to main lake. Post-spawn females congregate at the tip.', x: 55, y: 38 },
      { id: 'gr1', name: 'Grass Edge', type: 'grass', priority: 'primary', description: 'Emerging grass line in 4-8ft. Males guard fry here. Topwater over the grass edge.', x: 68, y: 58 },
      { id: 'lo1', name: 'Laydown Tree', type: 'laydown', priority: 'secondary', description: 'Shade and ambush cover. Recovering females sit tight to wood.', x: 80, y: 48 },
      { id: 'dk2', name: 'Dock Shade', type: 'dock', priority: 'secondary', description: 'Females recovering in dock shade. Finesse the deep side of docks near flats.', x: 85, y: 32 },
      { id: 'fl3', name: 'Shallow Flat', type: 'flat', priority: 'secondary', description: 'Fry-guarding males in 2-5ft. Easy to catch on bed baits but practice catch and release.', x: 74, y: 72 },
    ],
    depthRange: { min: 2, max: 12 },
  },
  summer: {
    season: 'summer', label: 'Summer',
    description: 'Fish relate to offshore structure and the thermocline. Ledge fishing and deep cranking dominate.',
    keyTargets: [
      { id: 'bf1', name: 'Bluff Wall', type: 'bluff', priority: 'primary', description: 'Vertical structure with shade. Fish suspend 12-20ft on the shaded side.', x: 12, y: 42 },
      { id: 'h2', name: 'Offshore Hump', type: 'hump', priority: 'primary', description: 'Main lake hump topping at 18-22ft. Schools stack on the crown and breaks.', x: 38, y: 24 },
      { id: 'pt3', name: 'Long Point', type: 'point', priority: 'primary', description: 'Extends to deep water. Fish the tip at dawn/dusk, the ledge sides midday.', x: 58, y: 45 },
      { id: 'cc3', name: 'River Ledge', type: 'creek-channel', priority: 'secondary', description: 'Main river channel swing. The #1 summer structure on most NTX reservoirs.', x: 30, y: 52 },
      { id: 'dk3', name: 'Deep Docks', type: 'dock', priority: 'secondary', description: 'Docks over 10ft+ water. Midday shade refuge. Skip jigs and drop shots.', x: 82, y: 38 },
    ],
    depthRange: { min: 10, max: 30 },
  },
  fall: {
    season: 'fall', label: 'Fall Transition',
    description: 'Fish follow shad into creeks. Target back of creeks and shallow flats.',
    keyTargets: [
      { id: 'cc2', name: 'Creek Arm', type: 'creek-channel', priority: 'primary', description: 'Shad pour into creek arms in fall. Bass follow. Fish the channel bends and pockets.', x: 32, y: 58 },
      { id: 'fl2', name: 'Creek Flat', type: 'flat', priority: 'primary', description: 'Shallow flat near creek mouth. Shad ball up here at dawn — schooling fish action.', x: 52, y: 72 },
      { id: 'gr2', name: 'Dying Grass', type: 'grass', priority: 'primary', description: 'Grass edges pushing fish shallow. Bass trap shad against the dying grass walls.', x: 72, y: 55 },
      { id: 'pt5', name: 'Creek Point', type: 'point', priority: 'secondary', description: 'Points at creek mouths. Ambush station where bass intercept shad moving in.', x: 48, y: 48 },
      { id: 'lo2', name: 'Back of Creek', type: 'laydown', priority: 'secondary', description: 'Shallow wood cover in the back third of the creek arm. Topwater and squarebill territory.', x: 25, y: 78 },
    ],
    depthRange: { min: 3, max: 18 },
  },
  winter: {
    season: 'winter', label: 'Winter',
    description: 'Slow metabolism. Fish stack on deepest structure. Finesse and patience are key.',
    keyTargets: [
      { id: 'bf2', name: 'Deep Bluff', type: 'bluff', priority: 'primary', description: 'Steep drop to 30ft+. Vertical jigging territory. Fish hold tight to the wall.', x: 12, y: 35 },
      { id: 'h3', name: 'Main Channel Hump', type: 'hump', priority: 'primary', description: 'Deep offshore 20-35ft. Schools stack on the crown. Mark them on electronics first.', x: 35, y: 22 },
      { id: 'pt4', name: 'Deep Point', type: 'point', priority: 'primary', description: 'Channel swing point. Fish the 20-30ft break where the point meets the channel.', x: 52, y: 38 },
      { id: 'cc4', name: 'Channel Bend', type: 'creek-channel', priority: 'secondary', description: 'Inside bends of the river channel. Fish stack in the eddy where current slows.', x: 32, y: 48 },
      { id: 'h4', name: 'Secondary Hump', type: 'hump', priority: 'secondary', description: 'Smaller offshore hump 18-25ft. Less obvious = less pressure. Check with electronics.', x: 55, y: 25 },
    ],
    depthRange: { min: 15, max: 35 },
  },
};

// ─── Fish Position ───
export function calculateFishPosition(
  conditions: WeatherConditions, seasonalPhase: SeasonalPhase, cfg: TuningConfig = DEFAULT_TUNING, overrideHour?: number
): { position: FishPosition; depth: number } {
  const { barometricPressure, frontalSystem, skyCondition, waterTemp } = conditions;
  const { min: sMin, max: sMax } = seasonalPhase.depthRange;
  const sMid = (sMin + sMax) / 2;
  const ds = cfg.depthSensitivity;

  let depth = sMid;

  // Time of day influence — dampened in cold water (winter bass don't vertically migrate)
  const now = new Date();
  const month = now.getMonth() + 1;
  const hour = overrideHour ?? now.getHours();
  const tod = getTimeOfDay(hour, cfg, month);
  const seasonalTime = getSeasonalTimeOfDay(month, cfg);
  const todCfg = seasonalTime[tod];
  const todDampen = waterTemp < cfg.seasonalBreakpoints.preSpawnStart ? 0.25 : 1.0;
  if ('shallowBias' in todCfg) depth -= (sMid - sMin) * todCfg.shallowBias * todDampen;
  if ('deepBias' in todCfg) depth += (sMax - sMid) * todCfg.deepBias * todDampen;

  // Pressure
  if (barometricPressure > cfg.pressure.highThreshold) depth += (sMax - sMid) * ds.pressureInfluence;
  else if (barometricPressure < cfg.pressure.lowThreshold) depth -= (sMid - sMin) * ds.pressureInfluence;

  // Frontal
  if (frontalSystem === 'post-frontal') depth += (sMax - sMid) * ds.frontalInfluence;
  else if (frontalSystem === 'cold-front') depth += (sMax - sMid) * ds.frontalInfluence * (ds.coldFrontRatio ?? 0.45);
  else if (frontalSystem === 'pre-frontal') depth -= (sMid - sMin) * ds.frontalInfluence;

  // Sky
  if (skyCondition === 'clear') depth += (sMax - sMid) * ds.skyInfluence;
  else if (skyCondition === 'overcast') depth -= (sMid - sMin) * ds.skyInfluence * 1.3;

  // Wind — pushes bass shallower (current, oxygenation, broken surface)
  const wi = ds.windInfluence ?? 0;
  if (conditions.windSpeed > 10) depth -= (sMid - sMin) * wi;
  else if (conditions.windSpeed >= 5) depth -= (sMid - sMin) * wi * 0.5;
  else if (conditions.windSpeed < 3) depth += (sMax - sMid) * wi * 0.3;

  // Clarity — clear water pushes deeper, muddy pulls shallower
  const ci = ds.clarityInfluence ?? 0;
  if (conditions.waterClarity === 'clear') depth += (sMax - sMid) * ci;
  else if (conditions.waterClarity === 'muddy') depth -= (sMid - sMin) * ci * 1.5;

  // Cold water bias — at or below winter ceiling, fish concentrate deep
  if (waterTemp <= cfg.seasonalBreakpoints.winterCeiling) depth = Math.max(depth, sMax * ds.coldWaterDeepBias + sMid * (1 - ds.coldWaterDeepBias));

  const tolerance = (sMax - sMin) * 0.15;
  depth = Math.max(sMin - tolerance, Math.min(sMax + tolerance, depth));
  depth = Math.max(1, Math.round(depth));

  let position: FishPosition;
  if (depth <= 3) position = 'shallow';
  else if (depth <= sMin + (sMax - sMin) * 0.25) position = 'mid-column';
  else if (depth <= sMin + (sMax - sMin) * 0.6) position = 'suspended';
  else position = 'deep';

  return { position, depth };
}

/** Generate fish depth for every hour of the day (0-23). */
export function calculateDepthCurve(
  conditions: WeatherConditions, seasonalPhase: SeasonalPhase, cfg: TuningConfig = DEFAULT_TUNING
): Array<{ hour: number; depth: number }> {
  const points: Array<{ hour: number; depth: number }> = [];
  for (let h = 0; h < 24; h++) {
    const { depth } = calculateFishPosition(conditions, seasonalPhase, cfg, h);
    points.push({ hour: h, depth });
  }
  return points;
}

// ─── Bite Intensity ───
export function calculateBiteIntensity(conditions: WeatherConditions, cfg: TuningConfig = DEFAULT_TUNING): { score: number; factors: ScoreFactor[] } {
  const w = cfg.biteWeights;

  // Time of day score: dawn/dusk are prime, midday is lowest
  const tod = getTimeOfDay(new Date().getHours(), cfg, new Date().getMonth() + 1);
  const todScores: Record<TimeOfDay, number> = { dawn: 87, morning: 70, midday: 45, afternoon: 55, dusk: 85 };
  const todScore = todScores[tod];
  const todLabels: Record<TimeOfDay, string> = {
    dawn: 'Dawn — prime feeding window',
    morning: 'Morning — active but slowing',
    midday: 'Midday — fish pull deep, low activity',
    afternoon: 'Afternoon — transitioning to evening bite',
    dusk: 'Dusk — prime feeding window',
  };

  // Water temp — graduated curve matching metabolic reality (not binary)
  const wt = conditions.waterTemp;
  let tempScore: number;
  let tempDetail: string;
  if (wt < 42) { tempScore = 15; tempDetail = `${wt}°F — near-dormant, minimal feeding`; }
  else if (wt < 48) { tempScore = 30; tempDetail = `${wt}°F — sluggish, slow presentations only`; }
  else if (wt < 52) { tempScore = 50; tempDetail = `${wt}°F — pre-spawn staging, building activity`; }
  else if (wt < 58) { tempScore = 70; tempDetail = `${wt}°F — active pre-spawn feeding`; }
  else if (wt < 65) { tempScore = 85; tempDetail = `${wt}°F — peak pre-spawn aggression`; }
  else if (wt < 72) { tempScore = 90; tempDetail = `${wt}°F — spawn to post-spawn, near-optimal`; }
  else if (wt < 80) { tempScore = 95; tempDetail = `${wt}°F — peak metabolic zone`; }
  else if (wt < 85) { tempScore = 85; tempDetail = `${wt}°F — strong but fish seek shade midday`; }
  else if (wt < 90) { tempScore = 60; tempDetail = `${wt}°F — thermal stress, early/late only`; }
  else { tempScore = 30; tempDetail = `${wt}°F — significant thermal stress`; }

  // Pressure — trend matters ~2x more than absolute value (Keith Jones)
  const trendScore = conditions.pressureTrend === 'falling' ? 88
    : conditions.pressureTrend === 'rising' ? 35 : 60;
  const absScore = conditions.barometricPressure > cfg.pressure.highThreshold ? 45
    : conditions.barometricPressure < cfg.pressure.lowThreshold ? 70 : 60;
  const pressureScore = trendScore * 0.65 + absScore * 0.35;
  const pressureDetail = `${conditions.barometricPressure.toFixed(2)} inHg ${conditions.pressureTrend} — ${
    conditions.pressureTrend === 'falling' ? 'fish feed aggressively ahead of weather change' :
    conditions.pressureTrend === 'rising' ? 'fish lock jaw, hunker tight to cover' :
    'stable conditions, normal activity'
  }`;

  // Wind — differentiated scoring
  let windScore: number;
  let windDetail: string;
  if (conditions.windSpeed < 3) { windScore = 40; windDetail = `${conditions.windSpeed}mph — slick calm, fish wary`; }
  else if (conditions.windSpeed < 7) { windScore = 65; windDetail = `${conditions.windSpeed}mph — light chop breaks surface`; }
  else if (conditions.windSpeed <= 15) { windScore = 85; windDetail = `${conditions.windSpeed}mph — prime wind: current, mudlines, broken surface`; }
  else if (conditions.windSpeed <= 20) { windScore = 65; windDetail = `${conditions.windSpeed}mph — productive but boat control harder`; }
  else if (conditions.windSpeed <= 25) { windScore = 40; windDetail = `${conditions.windSpeed}mph — tough conditions`; }
  else { windScore = 25; windDetail = `${conditions.windSpeed}mph — dangerous/unfishable`; }

  // Clarity
  let clarityScore: number;
  let clarityDetail: string;
  if (conditions.waterClarity === 'stained') { clarityScore = 78; clarityDetail = 'Stained — ideal visibility for ambush feeding'; }
  else if (conditions.waterClarity === 'muddy') { clarityScore = 30; clarityDetail = 'Muddy — fish struggle to find bait'; }
  else { clarityScore = 55; clarityDetail = 'Clear — fish cautious, rely more on finesse'; }

  // Sky
  let skyScore: number;
  let skyDetail: string;
  if (conditions.skyCondition === 'overcast') { skyScore = 80; skyDetail = 'Overcast — fish roam freely, low light all day'; }
  else if (conditions.skyCondition === 'rain') { skyScore = 78; skyDetail = 'Rain — surface disturbance + low light'; }
  else if (conditions.skyCondition === 'partly-cloudy') { skyScore = 62; skyDetail = 'Partly cloudy — intermittent feeding windows'; }
  else { skyScore = 50; skyDetail = 'Clear — concentrates bite to low-light periods'; }

  // Frontal — the biggest short-term swing factor
  let frontalScore: number;
  let frontalDetail: string;
  if (conditions.frontalSystem === 'pre-frontal') { frontalScore = 92; frontalDetail = 'Pre-frontal — feeding frenzy, fish sense weather change'; }
  else if (conditions.frontalSystem === 'stable') { frontalScore = 72; frontalDetail = 'Stable — normal activity patterns'; }
  else if (conditions.frontalSystem === 'post-frontal') { frontalScore = 15; frontalDetail = 'Post-frontal — worst bite condition, fish shut down'; }
  else { frontalScore = 25; frontalDetail = 'Cold front passage — fish tight to cover'; }

  const factors: ScoreFactor[] = [
    { label: 'Water Temp', score: tempScore, weight: w.waterTemp, detail: tempDetail, impact: tempScore >= 70 ? 'positive' : tempScore >= 45 ? 'neutral' : 'negative' },
    { label: 'Frontal', score: frontalScore, weight: w.frontalSystem, detail: frontalDetail, impact: frontalScore >= 70 ? 'positive' : frontalScore >= 45 ? 'neutral' : 'negative' },
    { label: 'Pressure', score: Math.round(pressureScore), weight: w.barometricPressure, detail: pressureDetail, impact: pressureScore >= 65 ? 'positive' : pressureScore >= 45 ? 'neutral' : 'negative' },
    { label: 'Time of Day', score: todScore, weight: w.timeOfDay, detail: todLabels[tod], impact: todScore >= 70 ? 'positive' : todScore >= 45 ? 'neutral' : 'negative' },
    { label: 'Wind', score: windScore, weight: w.wind, detail: windDetail, impact: windScore >= 65 ? 'positive' : windScore >= 40 ? 'neutral' : 'negative' },
    { label: 'Sky', score: skyScore, weight: w.skyCondition, detail: skyDetail, impact: skyScore >= 65 ? 'positive' : skyScore >= 45 ? 'neutral' : 'negative' },
    { label: 'Clarity', score: clarityScore, weight: w.waterClarity, detail: clarityDetail, impact: clarityScore >= 65 ? 'positive' : clarityScore >= 40 ? 'neutral' : 'negative' },
  ];

  // Sort by weighted contribution (highest impact first)
  factors.sort((a, b) => (b.score * b.weight) - (a.score * a.weight));

  const weighted =
    todScore * w.timeOfDay +
    tempScore * w.waterTemp +
    pressureScore * w.barometricPressure +
    windScore * w.wind +
    clarityScore * w.waterClarity +
    skyScore * w.skyCondition +
    frontalScore * w.frontalSystem;

  return { score: Math.max(0, Math.min(100, Math.round(weighted))), factors };
}

// ─── Confidence Index ───
export function calculateConfidenceIndex(conditions: WeatherConditions, biteIntensity: number, biteWindows: BiteWindow[]): { score: number; factors: ScoreFactor[] } {
  const pressureScore = conditions.pressureTrend === 'falling' ? 90 : conditions.pressureTrend === 'steady' ? 70 : 40;
  const pressureDetail = conditions.pressureTrend === 'falling'
    ? 'Falling pressure — high confidence fish are feeding'
    : conditions.pressureTrend === 'steady'
      ? 'Steady pressure — predictable patterns'
      : 'Rising pressure — uncertain, fish may be locking down';

  const now = new Date();
  const currentMinuteOfDay = now.getHours() * 60 + now.getMinutes();

  let solunarScore = 30;
  let solunarDetail = 'Outside solunar windows — lower activity expected';
  for (const w of biteWindows) {
    const wStart = w.startHour * 60 + w.startMinute;
    const wEnd = wStart + w.durationMinutes;
    if (currentMinuteOfDay >= wStart && currentMinuteOfDay <= wEnd) {
      solunarScore = w.phase === 'major' ? 95 : 70;
      solunarDetail = `In ${w.phase} solunar period — peak activity window`;
      break;
    }
    const dist = Math.min(Math.abs(currentMinuteOfDay - wStart), Math.abs(currentMinuteOfDay - wEnd));
    if (dist <= 30) {
      solunarScore = Math.max(solunarScore, w.phase === 'major' ? 70 : 50);
      solunarDetail = `Near ${w.phase} solunar window — activity building`;
    }
  }

  const clarityScore = conditions.waterClarity === 'stained' ? 80 : conditions.waterClarity === 'clear' ? 65 : 40;
  const clarityDetail = conditions.waterClarity === 'stained'
    ? 'Stained water — predictable ambush zones'
    : conditions.waterClarity === 'clear'
      ? 'Clear water — fish visible but spooky'
      : 'Muddy — hard to predict fish location';

  const factors: ScoreFactor[] = [
    { label: 'Bite Intensity', score: biteIntensity, weight: 0.4, detail: `Overall bite rating: ${biteIntensity}/100`, impact: biteIntensity >= 60 ? 'positive' : biteIntensity >= 40 ? 'neutral' : 'negative' },
    { label: 'Pressure Trend', score: pressureScore, weight: 0.25, detail: pressureDetail, impact: pressureScore >= 70 ? 'positive' : pressureScore >= 50 ? 'neutral' : 'negative' },
    { label: 'Water Clarity', score: clarityScore, weight: 0.20, detail: clarityDetail, impact: clarityScore >= 65 ? 'positive' : clarityScore >= 45 ? 'neutral' : 'negative' },
    { label: 'Solunar', score: solunarScore, weight: 0.15, detail: solunarDetail, impact: solunarScore >= 60 ? 'positive' : solunarScore >= 40 ? 'neutral' : 'negative' },
  ];

  return {
    score: Math.round(biteIntensity * 0.4 + pressureScore * 0.25 + clarityScore * 0.20 + solunarScore * 0.15),
    factors,
  };
}

// ─── Solunar ───
export function calculateSolunarWindows(): BiteWindow[] {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const moonTransitMinutes = ((dayOfYear * 50) % 1440);
  const h = Math.floor(moonTransitMinutes / 60) % 24;
  const m = moonTransitMinutes % 60;
  return [
    { phase: 'major', startHour: h, startMinute: m, durationMinutes: 90, intensity: 95 },
    { phase: 'major', startHour: (h + 12) % 24, startMinute: m, durationMinutes: 90, intensity: 85 },
    { phase: 'minor', startHour: (h + 6) % 24, startMinute: m, durationMinutes: 60, intensity: 65 },
    { phase: 'minor', startHour: (h + 18) % 24, startMinute: m, durationMinutes: 60, intensity: 55 },
  ];
}

// ─── Shared Lure Scoring Helpers ───
import { ANGLER_PROFILES, ANGLER_LURE_DBS } from './anglers';

export function buildLureContext(
  conditions: WeatherConditions, season: SeasonalPhase, fishDepth: number, cfg: TuningConfig
): { ctx: LureContext; tod: TimeOfDay; todCfg: TuningConfig['timeOfDay'][TimeOfDay] } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const tod = getTimeOfDay(now.getHours(), cfg, month);
  const seasonalTime = getSeasonalTimeOfDay(month, cfg);
  const todCfg = seasonalTime[tod];
  const ctx: LureContext = {
    fishDepth, waterTemp: conditions.waterTemp, waterClarity: conditions.waterClarity,
    skyCondition: conditions.skyCondition, windSpeed: conditions.windSpeed,
    frontalSystem: conditions.frontalSystem, pressureTrend: conditions.pressureTrend,
    season: season.season,
    isLowLight: conditions.skyCondition === 'overcast' || conditions.skyCondition === 'rain',
    isStained: conditions.waterClarity === 'stained' || conditions.waterClarity === 'muddy',
    timeOfDay: tod, cfg,
  };
  return { ctx, tod, todCfg };
}

export function scoreLure(
  lure: LureTemplate, ctx: LureContext, todCfg: TuningConfig['timeOfDay'][TimeOfDay], cfg: TuningConfig
): LureRecommendation | null {
  if (!lure.seasons.includes(ctx.season)) return null;

  const fishZoneTop = Math.max(1, ctx.fishDepth - 4);
  const fishZoneBottom = ctx.fishDepth + 4;
  if (lure.maxDepth < fishZoneTop || lure.minDepth > fishZoneBottom) return null;

  let confidence = lure.getConfidence(ctx);
  if (confidence === null || confidence < 40) return null;

  if (lure.tags.includes('moving') && 'movingBaitBonus' in todCfg) {
    confidence += (todCfg as { movingBaitBonus: number }).movingBaitBonus;
  }
  if (lure.tags.includes('topwater') && 'topwaterBonus' in todCfg) {
    confidence += (todCfg as { topwaterBonus: number }).topwaterBonus;
  }
  if (lure.tags.includes('finesse') && 'finessBonus' in todCfg) {
    confidence += (todCfg as { finessBonus: number }).finessBonus;
  }
  if (lure.tags.includes('dock') && 'dockBonus' in todCfg) {
    confidence += (todCfg as { dockBonus: number }).dockBonus;
  }

  // Lure multiplier — additive, not multiplicative, to preserve spread.
  // A 1.25 multiplier adds +10 rather than blowing a 82 to 103.
  const mult = cfg.lureMultipliers[lure.name] ?? 1.0;
  confidence = Math.max(0, Math.min(99, Math.round(confidence + (mult - 1) * 40)));
  if (confidence < 45) return null;

  const effectiveMin = Math.max(lure.minDepth, fishZoneTop);
  const effectiveMax = Math.min(lure.maxDepth, fishZoneBottom);
  const depthRange = lure.maxDepth <= 4 ? 'Surface' : `${effectiveMin}-${effectiveMax}ft`;
  const color = lure.getColor(ctx);

  const presentation = lure.getPresentation?.(ctx);

  return {
    name: lure.name, category: lure.category,
    color: color.name, colorHex: color.hex,
    retrieveSpeed: lure.baseSpeed, action: lure.action,
    confidence, depthRange, proTip: lure.proTip(ctx),
    presentation,
  };
}

// ─── Lure Recommendations ───
export function calculateLureRecommendations(
  conditions: WeatherConditions, season: SeasonalPhase, fishDepth: number, cfg: TuningConfig = DEFAULT_TUNING
): LureRecommendation[] {
  const { ctx, todCfg } = buildLureContext(conditions, season, fishDepth, cfg);
  const recommendations: LureRecommendation[] = [];
  for (const lure of LURE_DATABASE) {
    const rec = scoreLure(lure, ctx, todCfg, cfg);
    if (rec) recommendations.push(rec);
  }
  return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 6);
}

// ─── Angler Picks ───
export function calculateAnglerPicks(
  conditions: WeatherConditions, season: SeasonalPhase, fishDepth: number, cfg: TuningConfig = DEFAULT_TUNING
): AnglerPick[] {
  const { ctx, todCfg } = buildLureContext(conditions, season, fishDepth, cfg);

  // Phase 1: Build ranked lure lists for each angler
  const anglerRanked: { profileId: string; profileName: string; defaultCredibility: number; credibility: Record<string, number>; lures: LureRecommendation[]; templates: Map<string, LureTemplate> }[] = [];

  for (const profile of ANGLER_PROFILES) {
    const db = ANGLER_LURE_DBS.get(profile.id);
    if (!db) continue;

    const scored: LureRecommendation[] = [];
    const templateMap = new Map<string, LureTemplate>();
    for (const lure of db) {
      const rec = scoreLure(lure, ctx, todCfg, cfg);
      if (rec) {
        scored.push(rec);
        templateMap.set(rec.name, lure);
      }
    }
    scored.sort((a, b) => b.confidence - a.confidence);

    if (scored.length > 0) {
      anglerRanked.push({
        profileId: profile.id,
        profileName: profile.name,
        defaultCredibility: profile.defaultCredibility,
        credibility: profile.credibility,
        lures: scored,
        templates: templateMap,
      });
    }
  }

  // Sort anglers by their top lure confidence (highest first)
  anglerRanked.sort((a, b) => b.lures[0].confidence - a.lures[0].confidence);

  // Build a condition-aware rationale instead of a generic credibility label
  function buildRationale(anglerName: string, lureName: string, cred: number): string {
    const parts: string[] = [];
    if (cred >= 0.9) parts.push(`${anglerName}'s signature`);
    else if (cred >= 0.7) parts.push(`${anglerName} go-to`);
    else parts.push(`${anglerName} pick`);

    // Add the most relevant condition context
    const season = ctx.season;
    if (ctx.frontalSystem === 'post-frontal') parts.push('for post-frontal');
    else if (ctx.frontalSystem === 'pre-frontal') parts.push('pre-frontal');
    else if (ctx.isStained && lureName.match(/jig|spinner|bladed/i)) parts.push('in stained water');
    else if (season === 'pre-spawn') parts.push('for pre-spawn');
    else if (season === 'post-spawn') parts.push('for post-spawn');
    else if (season === 'spawn') parts.push('on beds');
    else if (season === 'winter') parts.push('in cold water');
    else if (season === 'summer' && ctx.fishDepth > 12) parts.push('offshore');
    else if (ctx.isLowLight) parts.push('in low light');

    return parts.join(' ');
  }

  // Phase 2: Greedy assignment with endorser fallthrough
  const claimedLures = new Map<string, AnglerPick>(); // lure name → pick
  const picks: AnglerPick[] = [];

  for (const angler of anglerRanked) {
    let assigned = false;

    for (const lure of angler.lures) {
      const existing = claimedLures.get(lure.name);

      if (existing) {
        // Add as endorser on the existing pick
        const cred = angler.credibility[lure.name] ?? angler.defaultCredibility;
        const endorsement: AnglerEndorsement = {
          anglerId: angler.profileId,
          anglerName: angler.profileName,
          confidence: lure.confidence,
          rationale: buildRationale(angler.profileName, lure.name, cred),
          proTip: lure.proTip,
        };
        existing.endorsers.push(endorsement);
        // Continue to try claiming a different lure
        continue;
      }

      // Claim this lure
      const cred = angler.credibility[lure.name] ?? angler.defaultCredibility;
      const template = angler.templates.get(lure.name);
      const colorAlts = template?.getColorAlternates?.(ctx)?.map(a => ({
        color: a.color, hex: a.hex, conditions: a.conditions as Record<string, unknown>, matched: a.matched,
      }));
      const pick: AnglerPick = {
        anglerId: angler.profileId,
        anglerName: angler.profileName,
        lure,
        rationale: buildRationale(angler.profileName, lure.name, cred),
        endorsers: [],
        colorAlternates: colorAlts,
      };
      // Find alternate: next-best lure from this angler (different from claimed)
      for (const alt of angler.lures) {
        if (alt.name !== lure.name) {
          pick.alternateLure = alt;
          break;
        }
      }
      claimedLures.set(lure.name, pick);
      picks.push(pick);
      assigned = true;
      break;
    }

    // If all lures were already claimed, this angler exists only as endorser(s)
    void assigned;
  }

  return picks.sort((a, b) => b.lure.confidence - a.lure.confidence);
}

// ─── Pressure Trend ───
export function determinePressureTrend(history: number[], cfg: TuningConfig = DEFAULT_TUNING): PressureTrend {
  if (history.length < 2) return 'steady';
  const recent = history.slice(-3);
  const diff = recent[recent.length - 1] - recent[0];
  if (diff > cfg.pressure.trendSensitivity) return 'rising';
  if (diff < -cfg.pressure.trendSensitivity) return 'falling';
  return 'steady';
}

// ─── Depth Factor Explanations ───
function buildDepthFactors(
  effectivePhase: SeasonalPhase, conditions: WeatherConditions,
  rawFishDepth: number, lakeMaxDepth: number | undefined, cfg: TuningConfig
): ScoreFactor[] {
  const factors: ScoreFactor[] = [];
  const { min: sMin, max: sMax } = effectivePhase.depthRange;
  factors.push({ label: 'Season', score: 0, weight: 0, detail: `${effectivePhase.label}: base range ${sMin}-${sMax}ft`, impact: 'neutral' });

  const tod = getTimeOfDay(new Date().getHours(), cfg, new Date().getMonth() + 1);
  const todDepthMap: Record<TimeOfDay, string> = {
    dawn: 'Dawn — fish moving shallow to feed',
    morning: 'Morning — still relatively shallow',
    midday: 'Midday — fish push deeper',
    afternoon: 'Afternoon — transitioning deeper',
    dusk: 'Dusk — fish moving shallow to feed',
  };
  factors.push({ label: 'Time of Day', score: 0, weight: 0, detail: todDepthMap[tod], impact: (tod === 'dawn' || tod === 'dusk') ? 'positive' : tod === 'midday' ? 'negative' : 'neutral' });

  if (conditions.barometricPressure > cfg.pressure.highThreshold) {
    factors.push({ label: 'High Pressure', score: 0, weight: 0, detail: `${conditions.barometricPressure.toFixed(2)} inHg pushes fish deeper`, impact: 'negative' });
  } else if (conditions.barometricPressure < cfg.pressure.lowThreshold) {
    factors.push({ label: 'Low Pressure', score: 0, weight: 0, detail: `${conditions.barometricPressure.toFixed(2)} inHg pulls fish shallower`, impact: 'positive' });
  }
  if (conditions.frontalSystem === 'post-frontal') {
    factors.push({ label: 'Post-Frontal', score: 0, weight: 0, detail: 'Fish hunker deep tight to cover', impact: 'negative' });
  } else if (conditions.frontalSystem === 'pre-frontal') {
    factors.push({ label: 'Pre-Frontal', score: 0, weight: 0, detail: 'Fish move up to feed aggressively', impact: 'positive' });
  }
  if (conditions.skyCondition === 'overcast') {
    factors.push({ label: 'Overcast', score: 0, weight: 0, detail: 'Low light lets fish roam shallower', impact: 'positive' });
  } else if (conditions.skyCondition === 'clear') {
    factors.push({ label: 'Clear Sky', score: 0, weight: 0, detail: 'Bright light pushes fish deeper', impact: 'negative' });
  }
  if (conditions.windSpeed > 10) {
    factors.push({ label: 'Wind', score: 0, weight: 0, detail: `${conditions.windSpeed}mph breaks surface — fish move shallow on windblown banks`, impact: 'positive' });
  } else if (conditions.windSpeed < 3) {
    factors.push({ label: 'Calm', score: 0, weight: 0, detail: 'Slick surface — fish wary, hold deeper', impact: 'negative' });
  }
  if (conditions.waterClarity === 'clear') {
    factors.push({ label: 'Clear Water', score: 0, weight: 0, detail: 'Fish can see further — hold deeper for safety', impact: 'negative' });
  } else if (conditions.waterClarity === 'muddy') {
    factors.push({ label: 'Muddy Water', score: 0, weight: 0, detail: 'Limited visibility — fish pull shallower to find food', impact: 'positive' });
  }
  if (lakeMaxDepth && rawFishDepth > lakeMaxDepth) {
    factors.push({ label: 'Lake Bottom', score: 0, weight: 0, detail: `Clamped to ${lakeMaxDepth}ft lake max (calculated ${rawFishDepth}ft)`, impact: 'neutral' });
  }
  return factors;
}

// ─── Tactical Notes ───
function buildTacticalNotes(
  effectivePhase: SeasonalPhase, conditions: WeatherConditions,
  biteIntensity: number, tod: TimeOfDay, lakeMaxDepth: number | undefined
): string[] {
  const notes: string[] = [];

  if (lakeMaxDepth && lakeMaxDepth <= 25) {
    notes.push(`Shallow lake (${lakeMaxDepth}ft max): Fish relate to cover more than depth. Target shade, wood, docks, and grass edges.`);
    if (effectivePhase.season === 'summer') {
      notes.push('Shallow lake summer: No deep refuge — fish stack under docks, in shade, and near any current or oxygenated water.');
    }
    if (effectivePhase.season === 'winter') {
      notes.push('Shallow lake winter: Fish compress into the deepest available structure. Electronics are critical — find the depth and the fish are there.');
    }
  }
  if (lakeMaxDepth && lakeMaxDepth >= 60 && (effectivePhase.season === 'summer' || effectivePhase.season === 'fall')) {
    notes.push('Deep lake: Fish may suspend over open water relating to the thermocline and baitfish schools. Use electronics to locate.');
  }
  if (tod === 'dawn' || tod === 'dusk') notes.push('Low-light period: Moving baits and topwater are highest percentage right now.');
  if (tod === 'midday' && effectivePhase.season === 'summer') notes.push('Midday summer: Fish are deep. Target offshore structure, docks for shade, or go finesse.');
  if (tod === 'afternoon') notes.push('Afternoon: Focus on docks, shade, and isolated cover. Finesse presentations shine.');
  if (conditions.frontalSystem === 'post-frontal') notes.push('Post-frontal: Downsize presentations. Target tight to cover. Patience is critical.');
  if (conditions.frontalSystem === 'pre-frontal') notes.push('Pre-frontal feed! Fish are aggressive. Cover water quickly with moving baits.');
  if (conditions.windSpeed > 15) notes.push(`${conditions.windSpeed}mph wind: Position on windblown banks. Current concentrates baitfish.`);
  if (conditions.waterTemp >= 52 && conditions.waterTemp <= 62) notes.push('Prime pre-spawn range. Check secondary points and channel swings for staging fish.');
  if (conditions.pressureTrend === 'falling') notes.push('Falling barometer: Fish moving up and feeding. Best window approaching.');
  if (conditions.waterClarity === 'muddy') notes.push('Muddy water: Slow down 50%. Heavy vibration and scent. Black/blue is your friend.');
  if (biteIntensity < 30) notes.push('Tough bite predicted. Go small, go slow. Soak your bait and target isolated cover.');
  if (effectivePhase.season === 'winter' && conditions.waterTemp < 45) notes.push('Sub-45° water: Ultra-slow only. Vertical jigging, drop shot, hair jig. Fish won\'t chase.');

  return notes;
}

// ─── Master Analysis ───
export function runStrikeAnalysis(conditions: WeatherConditions, cfg: TuningConfig = DEFAULT_TUNING, lakeMaxDepth?: number): StrikeAnalysis {
  const month = new Date().getMonth() + 1;
  const seasonalPhase = calculateSeasonalPhase(conditions.waterTemp, month, cfg);

  // Clamp seasonal depth range to the actual lake depth
  let effectivePhase = seasonalPhase;
  if (lakeMaxDepth && lakeMaxDepth > 0) {
    const clampedMin = Math.min(seasonalPhase.depthRange.min, lakeMaxDepth);
    const clampedMax = Math.min(seasonalPhase.depthRange.max, lakeMaxDepth);
    if (clampedMax !== seasonalPhase.depthRange.max || clampedMin !== seasonalPhase.depthRange.min) {
      effectivePhase = { ...seasonalPhase, depthRange: { min: clampedMin, max: clampedMax } };
    }
  }

  const { position: fishPosition, depth: rawFishDepth } = calculateFishPosition(conditions, effectivePhase, cfg);
  const fishDepth = lakeMaxDepth ? Math.min(rawFishDepth, lakeMaxDepth) : rawFishDepth;

  const biteResult = calculateBiteIntensity(conditions, cfg);
  const biteIntensity = biteResult.score;
  const biteWindows = calculateSolunarWindows();
  const confResult = calculateConfidenceIndex(conditions, biteIntensity, biteWindows);
  const lureRecommendations = calculateLureRecommendations(conditions, effectivePhase, fishDepth, cfg);
  const anglerPicks = calculateAnglerPicks(conditions, effectivePhase, fishDepth, cfg);
  const tod = getTimeOfDay(new Date().getHours(), cfg, month);

  return {
    biteIntensity, confidenceIndex: confResult.score, seasonalPhase: effectivePhase, fishPosition, fishDepth,
    lureRecommendations, anglerPicks, structureTargets: effectivePhase.keyTargets, biteWindows,
    pressureTrend: conditions.pressureTrend,
    tacticalNotes: buildTacticalNotes(effectivePhase, conditions, biteIntensity, tod, lakeMaxDepth),
    biteFactors: biteResult.factors, confidenceFactors: confResult.factors,
    depthFactors: buildDepthFactors(effectivePhase, conditions, rawFishDepth, lakeMaxDepth, cfg),
  };
}
