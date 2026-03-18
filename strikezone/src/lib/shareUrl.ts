// ─── Shareable Snapshot URL Encoding ───
// Encodes/decodes conditions + lake into compact URL query params.
// Short param names keep URLs compact for sharing.

import type { WeatherConditions, Lake, SkyCondition, WaterClarity, PressureTrend, FrontalSystem } from './types';
import { getLakeById } from '@/data/bass-lakes';

// Short param names:
// wt=waterTemp, at=airTemp, ws=windSpeed, wd=windDir, bp=pressure,
// pt=pressureTrend, sky=skyCondition, wc=waterClarity, fs=frontalSystem,
// hm=humidity, lat, lon, ln=lakeName, ls=lakeState, md=maxDepth, li=lakeId

export function encodeSnapshot(
  lake: Lake | null,
  conditions: WeatherConditions,
  maxDepth: number,
): string {
  const p = new URLSearchParams();
  p.set('wt', String(conditions.waterTemp));
  p.set('at', String(conditions.airTemp));
  p.set('ws', String(conditions.windSpeed));
  p.set('wd', conditions.windDirection);
  p.set('bp', conditions.barometricPressure.toFixed(2));
  p.set('pt', conditions.pressureTrend);
  p.set('sky', conditions.skyCondition);
  p.set('wc', conditions.waterClarity);
  p.set('fs', conditions.frontalSystem);
  p.set('hm', String(conditions.humidity));
  p.set('md', String(maxDepth));
  if (lake) {
    p.set('lat', String(lake.lat));
    p.set('lon', String(lake.lon));
    p.set('ln', lake.name);
    p.set('ls', lake.state);
    if (lake.id) p.set('li', lake.id);
  }
  return p.toString();
}

const VALID_SKY: SkyCondition[] = ['clear', 'partly-cloudy', 'overcast', 'rain'];
const VALID_CLARITY: WaterClarity[] = ['clear', 'stained', 'muddy'];
const VALID_TREND: PressureTrend[] = ['rising', 'falling', 'steady'];
const VALID_FRONTAL: FrontalSystem[] = ['pre-frontal', 'post-frontal', 'stable', 'cold-front'];

export function decodeSnapshot(params: URLSearchParams): {
  conditions: WeatherConditions;
  lake: Partial<Lake>;
  maxDepth: number;
} | null {
  const wt = params.get('wt');
  const at = params.get('at');
  if (!wt || !at) return null;

  const sky = params.get('sky') as SkyCondition;
  const wc = params.get('wc') as WaterClarity;
  const pt = params.get('pt') as PressureTrend;
  const fs = params.get('fs') as FrontalSystem;

  const conditions: WeatherConditions = {
    waterTemp: Number(wt),
    airTemp: Number(at),
    windSpeed: Number(params.get('ws') ?? 0),
    windDirection: params.get('wd') ?? 'S',
    barometricPressure: Number(params.get('bp') ?? 29.92),
    pressureTrend: VALID_TREND.includes(pt) ? pt : 'steady',
    skyCondition: VALID_SKY.includes(sky) ? sky : 'partly-cloudy',
    waterClarity: VALID_CLARITY.includes(wc) ? wc : 'stained',
    frontalSystem: VALID_FRONTAL.includes(fs) ? fs : 'stable',
    humidity: Number(params.get('hm') ?? 50),
  };

  const lakeId = params.get('li');
  const lake: Partial<Lake> = lakeId ? (getLakeById(lakeId) ?? {}) : {};
  const lat = params.get('lat');
  const lon = params.get('lon');
  // Fallback for lakes not in curated list
  if (!lake.id) {
    if (lat) lake.lat = Number(lat);
    if (lon) lake.lon = Number(lon);
    if (params.get('ln')) lake.name = params.get('ln')!;
    if (params.get('ls')) lake.state = params.get('ls')!;
    if (lakeId) lake.id = lakeId;
  }

  return {
    conditions,
    lake,
    maxDepth: Number(params.get('md') ?? 40),
  };
}
