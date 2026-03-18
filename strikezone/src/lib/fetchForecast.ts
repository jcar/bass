import { estimateWaterTempSeries } from './waterTemp';
import { windDegToCardinal, mapWmoCode } from './weather-utils';
import type { DayForecast } from './types';

const HISTORY_DAYS = 14;
const FORECAST_DAYS = 7;

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: (number | null)[];
  relative_humidity_2m: (number | null)[];
  wind_speed_10m: (number | null)[];
  wind_direction_10m: (number | null)[];
  weather_code: (number | null)[];
  pressure_msl: (number | null)[];
}

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: (number | null)[];
  temperature_2m_min: (number | null)[];
}

interface OpenMeteoResponse {
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
  utc_offset_seconds: number;
}

function getConfidence(dayOffset: number): number {
  if (dayOffset <= 1) return 95;
  if (dayOffset <= 3) return 90 - (dayOffset - 2) * 5;
  if (dayOffset <= 7) return 80 - (dayOffset - 4) * 5;
  return Math.max(35, 55 - (dayOffset - 8) * 10);
}

function computePressureTrend(
  indices: number[],
  hourlyTime: string[],
  pressureMsl: (number | null)[],
): 'rising' | 'falling' | 'steady' {
  const morning: number[] = [];
  const afternoon: number[] = [];
  for (const idx of indices) {
    const hour = parseInt(hourlyTime[idx].slice(11, 13), 10);
    const p = pressureMsl[idx];
    if (p == null) continue;
    if (hour >= 6 && hour <= 9) morning.push(p);
    if (hour >= 13 && hour <= 16) afternoon.push(p);
  }
  if (morning.length > 0 && afternoon.length > 0) {
    const mAvg = morning.reduce((a, b) => a + b, 0) / morning.length;
    const aAvg = afternoon.reduce((a, b) => a + b, 0) / afternoon.length;
    const diff = aAvg - mAvg;
    if (diff > 1.3) return 'rising';
    if (diff < -1.3) return 'falling';
  }
  return 'steady';
}

function generateFallback(lat: number): DayForecast[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const airTemps: { date: Date; airTemp: number }[] = [];
  for (let i = 0; i < FORECAST_DAYS; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    airTemps.push({ date: d, airTemp: Math.round(68 + Math.sin(i * 0.5) * 8) });
  }
  const waterTemps = estimateWaterTempSeries(airTemps, lat);
  return airTemps.map((t, i) => {
    const d = t.date;
    return {
      date: d.toISOString().slice(0, 10),
      dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'long' }),
      airTempHigh: Math.round(t.airTemp + 5),
      airTempLow: Math.round(t.airTemp - 8),
      airTemp: t.airTemp,
      waterTemp: waterTemps[i],
      windSpeed: Math.round(6 + Math.random() * 10),
      windDirection: ['SW', 'S', 'SE', 'NW', 'W'][i % 5],
      barometricPressure: +(29.8 + Math.sin(i * 0.7) * 0.3).toFixed(2),
      humidity: Math.round(55 + Math.random() * 25),
      skyCondition: (['partly-cloudy', 'overcast', 'clear', 'rain', 'partly-cloudy'] as const)[i % 5],
      description: 'Fallback demo data — weather API unavailable',
      pressureTrend: (['steady', 'falling', 'rising', 'steady', 'falling'] as const)[i % 5],
      isExtrapolated: i >= 5,
      dataConfidence: i < 3 ? 95 - i * 5 : Math.max(40, 80 - (i - 3) * 10),
    };
  });
}

export async function fetchForecast(lat: number, lon: number): Promise<DayForecast[]> {
  try {
    const url = [
      `https://api.open-meteo.com/v1/forecast`,
      `?latitude=${encodeURIComponent(lat)}`,
      `&longitude=${encodeURIComponent(lon)}`,
      `&past_days=${HISTORY_DAYS}`,
      `&forecast_days=${FORECAST_DAYS}`,
      `&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,pressure_msl`,
      `&daily=temperature_2m_max,temperature_2m_min`,
      `&temperature_unit=fahrenheit`,
      `&wind_speed_unit=mph`,
      `&timezone=auto`,
    ].join('');

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Open-Meteo API returned ${res.status}: ${text}`);
    }

    const data: OpenMeteoResponse = await res.json();
    const { hourly, daily } = data;

    if (!hourly?.time?.length || !daily?.time?.length) {
      throw new Error('Open-Meteo returned empty data');
    }

    const locationNow = new Date(Date.now() + data.utc_offset_seconds * 1000);
    const todayStr = locationNow.toISOString().slice(0, 10);

    const hourlyByDate = new Map<string, number[]>();
    for (let i = 0; i < hourly.time.length; i++) {
      const dateStr = hourly.time[i].slice(0, 10);
      if (!hourlyByDate.has(dateStr)) hourlyByDate.set(dateStr, []);
      hourlyByDate.get(dateStr)!.push(i);
    }

    const allDayTemps: { date: Date; airTemp: number }[] = [];
    for (let i = 0; i < daily.time.length; i++) {
      const high = daily.temperature_2m_max[i];
      const low = daily.temperature_2m_min[i];
      if (high != null && low != null) {
        allDayTemps.push({
          date: new Date(daily.time[i] + 'T12:00:00'),
          airTemp: Math.round((high + low) / 2),
        });
      }
    }

    const allWaterTemps = estimateWaterTempSeries(allDayTemps, lat);

    const forecastDays: DayForecast[] = [];

    const yesterdayDate = new Date(locationNow);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

    for (let dayIdx = 0; dayIdx < daily.time.length; dayIdx++) {
      const dateStr = daily.time[dayIdx];

      if (dateStr === yesterdayStr) {
        const yIndices = hourlyByDate.get(dateStr) || [];
        if (yIndices.length > 0) {
          const yHigh = daily.temperature_2m_max[dayIdx];
          const yLow = daily.temperature_2m_min[dayIdx];
          let yMiddayIdx = yIndices[0];
          let yBestDist = Infinity;
          for (const idx of yIndices) {
            const hour = parseInt(hourly.time[idx].slice(11, 13), 10);
            const dist = Math.abs(hour - 13);
            if (dist < yBestDist) { yBestDist = dist; yMiddayIdx = idx; }
          }
          const yPressure = hourly.pressure_msl[yMiddayIdx];
          const yPressureInHg = yPressure != null ? +(yPressure * 0.02953).toFixed(2) : 29.92;
          const yPressureTrend = computePressureTrend(yIndices, hourly.time, hourly.pressure_msl);

          const yd = new Date(dateStr + 'T12:00:00');
          forecastDays.push({
            date: dateStr,
            dayLabel: 'Yesterday',
            dayOfWeek: yd.toLocaleDateString('en-US', { weekday: 'long' }),
            airTempHigh: yHigh != null ? Math.round(yHigh) : 68,
            airTempLow: yLow != null ? Math.round(yLow) : 55,
            airTemp: hourly.temperature_2m[yMiddayIdx] != null ? Math.round(hourly.temperature_2m[yMiddayIdx]!) : 68,
            waterTemp: allWaterTemps[dayIdx] ?? 60,
            windSpeed: hourly.wind_speed_10m[yMiddayIdx] != null ? Math.round(hourly.wind_speed_10m[yMiddayIdx]!) : 0,
            windDirection: windDegToCardinal(hourly.wind_direction_10m[yMiddayIdx] ?? 0),
            barometricPressure: yPressureInHg,
            humidity: hourly.relative_humidity_2m[yMiddayIdx] != null ? Math.round(hourly.relative_humidity_2m[yMiddayIdx]!) : 50,
            skyCondition: mapWmoCode(hourly.weather_code[yMiddayIdx] ?? 0),
            description: 'Yesterday',
            pressureTrend: yPressureTrend,
            isExtrapolated: false,
            dataConfidence: 99,
            isYesterday: true,
          });
        }
        continue;
      }

      if (dateStr < todayStr) continue;
      if (forecastDays.length >= FORECAST_DAYS + 1) break;

      const indices = hourlyByDate.get(dateStr) || [];
      if (indices.length === 0) continue;

      const high = daily.temperature_2m_max[dayIdx];
      const low = daily.temperature_2m_min[dayIdx];

      let middayIdx = indices[0];
      let bestDist = Infinity;
      for (const idx of indices) {
        const hour = parseInt(hourly.time[idx].slice(11, 13), 10);
        const dist = Math.abs(hour - 13);
        if (dist < bestDist) { bestDist = dist; middayIdx = idx; }
      }

      const middayTemp = hourly.temperature_2m[middayIdx];
      const middayHumidity = hourly.relative_humidity_2m[middayIdx];
      const middayWind = hourly.wind_speed_10m[middayIdx];
      const middayWindDir = hourly.wind_direction_10m[middayIdx];
      const middayCode = hourly.weather_code[middayIdx];
      const middayPressure = hourly.pressure_msl[middayIdx];

      const pressureInHg = middayPressure != null
        ? +(middayPressure * 0.02953).toFixed(2)
        : 29.92;

      const dayOffset: number = forecastDays.filter(d => !d.isYesterday).length;
      const d = new Date(dateStr + 'T12:00:00');
      const isExtended = dayOffset >= 5;

      const pressureTrend = computePressureTrend(indices, hourly.time, hourly.pressure_msl);

      forecastDays.push({
        date: dateStr,
        dayLabel: dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'long' }),
        airTempHigh: high != null ? Math.round(high) : Math.round((middayTemp ?? 68) + 5),
        airTempLow: low != null ? Math.round(low) : Math.round((middayTemp ?? 68) - 8),
        airTemp: middayTemp != null ? Math.round(middayTemp) : 68,
        waterTemp: allWaterTemps[dayIdx] ?? allWaterTemps[allWaterTemps.length - 1] ?? 60,
        windSpeed: middayWind != null ? Math.round(middayWind) : 0,
        windDirection: windDegToCardinal(middayWindDir ?? 0),
        barometricPressure: pressureInHg,
        humidity: middayHumidity != null ? Math.round(middayHumidity) : 50,
        skyCondition: mapWmoCode(middayCode ?? 0),
        description: isExtended ? 'Extended forecast' : '',
        pressureTrend,
        isExtrapolated: isExtended,
        dataConfidence: getConfidence(dayOffset),
      });
    }

    if (forecastDays.length === 0) {
      throw new Error('No forecast days generated from Open-Meteo data');
    }

    return forecastDays;
  } catch (error) {
    console.error('Forecast fetch error:', error);
    return generateFallback(lat);
  }
}
