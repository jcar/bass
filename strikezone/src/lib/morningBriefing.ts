// ─── Morning Briefing: "What Changed Overnight" ───
// Pure function. Template-based narrative generation — no AI.
// Compares today vs yesterday conditions + analysis to produce
// 3-5 angler-speak bullets sorted by impact magnitude.

import type { WeatherConditions, StrikeAnalysis } from './types';
import type { TuningConfig } from './tuning';
import { DEFAULT_TUNING } from './tuning';
import { findForCategory } from './knowledge';

export interface BriefingBullet {
  type: 'positive' | 'negative' | 'neutral';
  category: 'pressure' | 'temp' | 'wind' | 'bite' | 'lure' | 'depth' | 'transition';
  narrative: string;
  magnitude: number; // absolute impact magnitude for sorting
}

/** Seasonal breakpoints with labels, ordered for warming then cooling. */
const TRANSITION_BREAKPOINTS = [
  { temp: 48, season: 'pre-spawn', label: 'pre-spawn staging' },
  { temp: 55, season: 'spawn', label: 'pre-spawn to spawn transition' },
  { temp: 62, season: 'spawn', label: 'spawn peak' },
  { temp: 68, season: 'post-spawn', label: 'spawn to post-spawn' },
  { temp: 72, season: 'post-spawn', label: 'post-spawn to summer' },
  { temp: 80, season: 'summer', label: 'summer peak stress' },
  { temp: 76, season: 'fall', label: 'fall transition' },
  { temp: 55, season: 'winter', label: 'winter onset' },
];

/**
 * Check if water temp is within ~3°F of a seasonal breakpoint.
 * Returns the nearest transition or null.
 */
export function checkSeasonalTransition(
  waterTemp: number,
  tuning: TuningConfig = DEFAULT_TUNING,
): { breakpoint: number; season: string; label: string; direction: string; delta: number } | null {
  void tuning; // available for future custom breakpoints

  let nearest: typeof TRANSITION_BREAKPOINTS[0] | null = null;
  let nearestDelta = Infinity;

  for (const bp of TRANSITION_BREAKPOINTS) {
    const delta = Math.abs(waterTemp - bp.temp);
    if (delta <= 3 && delta < nearestDelta) {
      nearestDelta = delta;
      nearest = bp;
    }
  }

  if (!nearest) return null;

  const direction = waterTemp < nearest.temp ? 'approaching' : 'just past';

  return {
    breakpoint: nearest.temp,
    season: nearest.season,
    label: nearest.label,
    direction,
    delta: nearestDelta,
  };
}

export function generateMorningBriefing(
  today: StrikeAnalysis,
  yesterday: StrikeAnalysis,
  todayConditions: WeatherConditions,
  yesterdayConditions: WeatherConditions,
  tuning: TuningConfig = DEFAULT_TUNING,
): BriefingBullet[] {
  const bullets: BriefingBullet[] = [];

  // 1. Pressure change
  const pressureDelta = todayConditions.barometricPressure - yesterdayConditions.barometricPressure;
  if (Math.abs(pressureDelta) >= 0.05) {
    const dir = pressureDelta < 0 ? 'dropped' : 'rose';
    const advice = pressureDelta < -0.10
      ? 'fish should be feeding aggressively ahead of the front'
      : pressureDelta < 0
        ? 'slight drop — fish may be more active'
        : pressureDelta > 0.10
          ? 'fish may tighten up — downsize presentations'
          : 'minor rise — watch for slower bite';
    bullets.push({
      type: pressureDelta < 0 ? 'positive' : 'negative',
      category: 'pressure',
      narrative: `Pressure ${dir} ${Math.abs(pressureDelta).toFixed(2)} inHg overnight — ${advice}`,
      magnitude: Math.abs(pressureDelta) * 100,
    });
  }

  // 2. Water temp change
  const tempDelta = todayConditions.waterTemp - yesterdayConditions.waterTemp;
  if (Math.abs(tempDelta) >= 1) {
    const dir = tempDelta > 0 ? 'up' : 'down';
    const isPreSpawnRange = todayConditions.waterTemp >= 52 && todayConditions.waterTemp <= 68;
    let advice: string;
    if (isPreSpawnRange && tempDelta > 0) {
      advice = "warming into pre-spawn range — they're committing";
    } else if (tempDelta > 2) {
      advice = 'significant warming — fish should be more active';
    } else if (tempDelta < -2) {
      advice = 'cooling trend — slow down and downsize';
    } else {
      advice = tempDelta > 0 ? 'slight warming trend' : 'slight cooling trend';
    }
    bullets.push({
      type: tempDelta > 0 ? 'positive' : 'negative',
      category: 'temp',
      narrative: `Water temp ${dir} ${Math.abs(tempDelta)}°F to ${todayConditions.waterTemp}°F — ${advice}`,
      magnitude: Math.abs(tempDelta) * 5,
    });
  } else {
    // Stable temp — note if it's in a key range
    const daysInRange = todayConditions.waterTemp >= 52 && todayConditions.waterTemp <= 68;
    if (daysInRange) {
      bullets.push({
        type: 'positive',
        category: 'temp',
        narrative: `Water temp held at ${todayConditions.waterTemp}°F (pre-spawn range — they're committing)`,
        magnitude: 3,
      });
    }
  }

  // 3. Wind change
  const windDelta = todayConditions.windSpeed - yesterdayConditions.windSpeed;
  const windDirChanged = todayConditions.windDirection !== yesterdayConditions.windDirection;
  if (Math.abs(windDelta) >= 3 || (windDirChanged && todayConditions.windSpeed >= 8)) {
    let narrative: string;
    if (windDirChanged && todayConditions.windSpeed >= 8) {
      narrative = `Wind shifted ${todayConditions.windDirection} ${todayConditions.windSpeed}mph — windblown points are your #1 target`;
    } else if (windDelta > 0) {
      narrative = `Wind picked up to ${todayConditions.windSpeed}mph ${todayConditions.windDirection} — fish should position on windblown banks`;
    } else {
      narrative = `Wind dropped to ${todayConditions.windSpeed}mph — calmer conditions, fish may hold tighter to cover`;
    }
    const isGoodWind = todayConditions.windSpeed >= 5 && todayConditions.windSpeed <= 20;
    bullets.push({
      type: isGoodWind ? 'positive' : windDelta < 0 && todayConditions.windSpeed < 3 ? 'negative' : 'neutral',
      category: 'wind',
      narrative,
      magnitude: Math.abs(windDelta) * 2 + (windDirChanged ? 5 : 0),
    });
  }

  // 4. Bite rating change
  const biteDelta = today.biteIntensity - yesterday.biteIntensity;
  if (Math.abs(biteDelta) >= 3) {
    const dir = biteDelta > 0 ? '+' : '';
    let window = '';
    if (today.biteIntensity >= 70 && biteDelta > 0) window = ' — best window this week';
    else if (today.biteIntensity < 40 && biteDelta < 0) window = ' — tough day ahead';
    bullets.push({
      type: biteDelta > 0 ? 'positive' : 'negative',
      category: 'bite',
      narrative: `Bite rating: ${today.biteIntensity} (${dir}${biteDelta} vs yesterday)${window}`,
      magnitude: Math.abs(biteDelta),
    });
  }

  // 5. Top lure pick change
  const todayTopLure = today.anglerPicks[0]?.lure.name;
  const yesterdayTopLure = yesterday.anglerPicks[0]?.lure.name;
  if (todayTopLure && yesterdayTopLure && todayTopLure !== yesterdayTopLure) {
    const angler = today.anglerPicks[0]?.anglerName ?? 'Top pick';
    bullets.push({
      type: 'neutral',
      category: 'lure',
      narrative: `${angler}'s pick changed: ${todayTopLure} replaced ${yesterdayTopLure} — conditions shifted the play`,
      magnitude: 8,
    });
  }

  // 6. Fish depth change
  const depthDelta = today.fishDepth - yesterday.fishDepth;
  if (Math.abs(depthDelta) >= 3) {
    const dir = depthDelta > 0 ? 'deeper' : 'shallower';
    bullets.push({
      type: depthDelta < 0 ? 'positive' : 'negative',
      category: 'depth',
      narrative: `Fish moved ${Math.abs(depthDelta)}ft ${dir} to ${today.fishDepth}ft — adjust your presentations accordingly`,
      magnitude: Math.abs(depthDelta) * 1.5,
    });
  }

  // 7. Seasonal transition alert
  const transition = checkSeasonalTransition(todayConditions.waterTemp, tuning);
  if (transition) {
    // Pull a seasonal-pattern knowledge entry for the approaching season
    const seasonEntries = findForCategory('seasonal-pattern', { season: transition.season, limit: 3 });
    const proQuote = seasonEntries.length > 0 ? seasonEntries[0] : null;

    let narrative = `Water at ${todayConditions.waterTemp}°F — ${transition.direction} ${transition.label} (${transition.breakpoint}°F)`;
    if (proQuote) {
      // Extract a short quote from the insight (first sentence or ~80 chars)
      const shortInsight = proQuote.insight.length > 120
        ? proQuote.insight.slice(0, proQuote.insight.indexOf('.', 60) + 1) || proQuote.insight.slice(0, 120) + '...'
        : proQuote.insight;
      narrative += `. ${shortInsight}`;
    }

    bullets.push({
      type: transition.direction === 'approaching' ? 'neutral' : 'positive',
      category: 'transition',
      narrative,
      magnitude: 12 - transition.delta * 2, // closer = higher magnitude
    });
  }

  // Sort by impact magnitude, return top 5
  bullets.sort((a, b) => b.magnitude - a.magnitude);
  return bullets.slice(0, 5);
}
