/**
 * Water Temperature Estimation Model
 *
 * Water has massive thermal inertia. Unlike air, which can swing 20-30F in a day,
 * surface water temp on a reservoir typically changes 0.3-0.5F per day at most.
 * The primary driver is accumulated solar heating over weeks/months, not today's
 * air temperature.
 *
 * This model uses:
 * 1. A sinusoidal seasonal baseline calibrated by latitude
 * 2. A phase lag (water peaks ~3 weeks after air)
 * 3. Small bounded adjustments from recent air temp deviations
 * 4. Day-to-day change capped to physically realistic rates
 */

// Seasonal parameters by latitude band (surface water, mid-depth reservoirs)
// Based on USGS lake temperature monitoring data for central US reservoirs
interface SeasonalParams {
  meanAnnual: number;  // F - average annual surface water temp
  amplitude: number;   // F - seasonal swing from mean (half the range)
  phaseDay: number;    // day of year when water temp peaks
}

function getSeasonalParams(lat: number): SeasonalParams {
  // Latitude-adjusted parameters calibrated against USGS reservoir monitoring data
  // Reference: ~33N (North Texas) = mean 69F, amplitude 19F, peak Jul 29 (day 210)
  //   - Winter low ~50F (Jan-Feb), Summer peak ~88F (Jul-Aug)
  //   - Lake Fork, Eagle Mountain, Lewisville, Ray Roberts typical ranges
  //   - Peak shifted earlier (Aug 10→Jul 29) to better track spring warming
  // At ~36N (Table Rock, MO) = mean 64F, amplitude 20F
  //   - Winter low ~44F, Summer peak ~84F
  const refLat = 33;
  const latDiff = lat - refLat;

  return {
    meanAnnual: 69 - latDiff * 1.67,
    amplitude: 19 + latDiff * 0.33,
    // Peak water temp shifts slightly later at higher latitudes
    phaseDay: 210 + latDiff * 0.5,
  };
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

/**
 * Get the seasonal baseline water temperature for a given date and latitude.
 */
export function seasonalBaseline(date: Date, lat: number): number {
  const params = getSeasonalParams(lat);
  const doy = dayOfYear(date);

  // Convert peak day to phase offset for sine function
  // sin peaks at pi/2, so we need: (peakDay - offset) * 2pi/365 = pi/2
  // offset = peakDay - 365/4
  const phaseOffset = params.phaseDay - 365 / 4;

  const waterTemp = params.meanAnnual +
    params.amplitude * Math.sin((2 * Math.PI * (doy - phaseOffset)) / 365);

  return waterTemp;
}

/**
 * Get the expected seasonal air temperature baseline for a given date and latitude.
 * Air peaks ~3 weeks before water.
 */
function seasonalAirBaseline(date: Date, lat: number): number {
  const params = getSeasonalParams(lat);
  const doy = dayOfYear(date);

  // Air peaks about 21 days before water
  const airPeakDay = params.phaseDay - 21;
  const phaseOffset = airPeakDay - 365 / 4;

  // Air has slightly larger amplitude than water
  const airAmplitude = params.amplitude * 1.2;

  return params.meanAnnual + airAmplitude * Math.sin((2 * Math.PI * (doy - phaseOffset)) / 365);
}

/**
 * Estimate water temperature for a single day.
 *
 * @param date - The date to estimate for
 * @param lat - Latitude in degrees
 * @param airTemp - Observed or forecast air temp (F)
 * @param prevWaterTemp - Previous day's water temp estimate (if available)
 * @returns Estimated surface water temperature (F)
 */
export function estimateWaterTemp(
  date: Date,
  lat: number,
  airTemp: number,
  prevWaterTemp?: number,
): number {
  const baseline = seasonalBaseline(date, lat);
  const airBaseline = seasonalAirBaseline(date, lat);

  // How far is the actual air temp from the seasonal norm?
  const airDeviation = airTemp - airBaseline;

  // Water responds to sustained air temp deviations, but slowly and with limits.
  // A week of 10F-above-normal air might shift water 2-3F above baseline.
  // We estimate this as a fraction of the air deviation, bounded.
  const waterNudge = Math.max(-6, Math.min(6, airDeviation * 0.3));

  let estimated = baseline + waterNudge;

  // If we have yesterday's water temp, enforce physical rate limits.
  // Reservoirs typically change 0.3-0.5F per day max under normal conditions.
  // Extreme conditions (strong cold front, heavy rain) can push ~1F/day.
  if (prevWaterTemp !== undefined) {
    const maxDailyChange = 0.65;
    const diff = estimated - prevWaterTemp;
    if (Math.abs(diff) > maxDailyChange) {
      estimated = prevWaterTemp + Math.sign(diff) * maxDailyChange;
    }
  }

  // Clamp to physically reasonable range
  return Math.round(Math.max(32, Math.min(95, estimated)));
}

/**
 * Estimate water temperatures for a multi-day forecast.
 * Enforces thermal inertia across the entire sequence.
 *
 * @param days - Array of { date, airTemp } for each forecast day
 * @param lat - Latitude in degrees
 * @returns Array of estimated water temperatures (F), one per day
 */
export function estimateWaterTempSeries(
  days: { date: Date; airTemp: number }[],
  lat: number,
): number[] {
  if (days.length === 0) return [];

  const results: number[] = [];

  // Day 0: estimate from seasonal baseline + air deviation (no prior day constraint)
  const day0Temp = estimateWaterTemp(days[0].date, lat, days[0].airTemp);
  results.push(day0Temp);

  // Subsequent days: chain from previous, enforcing max daily change
  for (let i = 1; i < days.length; i++) {
    const temp = estimateWaterTemp(
      days[i].date,
      lat,
      days[i].airTemp,
      results[i - 1],
    );
    results.push(temp);
  }

  return results;
}
