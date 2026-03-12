// ─── Shared weather mapping utilities ───
import type { SkyCondition } from './types';

export function windDegToCardinal(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/** Map OpenWeatherMap condition ID to SkyCondition */
export function mapSkyCondition(weatherId: number): SkyCondition {
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 200 && weatherId < 300) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'overcast';
  if (weatherId >= 801 && weatherId <= 802) return 'partly-cloudy';
  if (weatherId >= 803) return 'overcast';
  return 'clear';
}

/** Map WMO weather interpretation code to SkyCondition (used by Open-Meteo) */
export function mapWmoCode(code: number): SkyCondition {
  // 0: Clear sky
  if (code === 0 || code === 1) return 'clear';
  // 2: Partly cloudy
  if (code === 2) return 'partly-cloudy';
  // 3: Overcast
  if (code === 3) return 'overcast';
  // 45, 48: Fog
  if (code === 45 || code === 48) return 'overcast';
  // 51-57: Drizzle
  if (code >= 51 && code <= 57) return 'rain';
  // 61-67: Rain
  if (code >= 61 && code <= 67) return 'rain';
  // 71-77: Snow
  if (code >= 71 && code <= 77) return 'overcast';
  // 80-82: Rain showers
  if (code >= 80 && code <= 82) return 'rain';
  // 85-86: Snow showers
  if (code >= 85 && code <= 86) return 'overcast';
  // 95-99: Thunderstorm
  if (code >= 95 && code <= 99) return 'rain';
  return 'partly-cloudy';
}
