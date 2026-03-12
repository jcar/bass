import { NextRequest, NextResponse } from 'next/server';
import { estimateWaterTempSeries } from '@/lib/waterTemp';
import { windDegToCardinal, mapWmoCode } from '@/lib/weather-utils';

/** How many past days of observed weather to fetch for water temp model warm-up */
const HISTORY_DAYS = 14;
/** How many forecast days to return */
const FORECAST_DAYS = 10;

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

/** Get confidence score for a forecast day (0 = today) */
function getConfidence(dayOffset: number): number {
  if (dayOffset <= 1) return 95;
  if (dayOffset <= 3) return 90 - (dayOffset - 2) * 5;
  if (dayOffset <= 7) return 80 - (dayOffset - 4) * 5;
  return Math.max(35, 55 - (dayOffset - 8) * 10);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || '35.96');
  const lon = parseFloat(searchParams.get('lon') || '-93.31');

  try {
    // Single Open-Meteo call: 14 past days (observed) + 10 future days (forecast)
    // Past days seed the water temp model with real thermal history
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

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Open-Meteo API returned ${res.status}: ${text}`);
    }

    const data: OpenMeteoResponse = await res.json();
    const { hourly, daily } = data;

    if (!hourly?.time?.length || !daily?.time?.length) {
      throw new Error('Open-Meteo returned empty data');
    }

    // Compute "today" in the location's timezone using Open-Meteo's UTC offset
    const locationNow = new Date(Date.now() + data.utc_offset_seconds * 1000);
    const todayStr = locationNow.toISOString().slice(0, 10);

    // Group hourly entries by date string (YYYY-MM-DD)
    const hourlyByDate = new Map<string, number[]>();
    for (let i = 0; i < hourly.time.length; i++) {
      const dateStr = hourly.time[i].slice(0, 10);
      if (!hourlyByDate.has(dateStr)) hourlyByDate.set(dateStr, []);
      hourlyByDate.get(dateStr)!.push(i);
    }

    // Build daily-level air temp series for ALL days (history + forecast)
    // This seeds the water temp model with real observed thermal history
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

    // Compute water temps for the full period (history + forecast)
    // The first 14 days of history act as warm-up, giving the model real momentum
    const allWaterTemps = estimateWaterTempSeries(allDayTemps, lat);

    // Now build forecast entries for just the forecast period
    const forecastDays = [];

    for (let dayIdx = 0; dayIdx < daily.time.length; dayIdx++) {
      const dateStr = daily.time[dayIdx];

      // Only output today and future days (string comparison is timezone-safe)
      if (dateStr < todayStr) continue;
      if (forecastDays.length >= FORECAST_DAYS) break;

      const indices = hourlyByDate.get(dateStr) || [];
      if (indices.length === 0) continue;

      const high = daily.temperature_2m_max[dayIdx];
      const low = daily.temperature_2m_min[dayIdx];

      // Find midday entry (closest to 1pm local) for representative conditions
      let middayIdx = indices[0];
      let bestDist = Infinity;
      for (const idx of indices) {
        const hour = parseInt(hourly.time[idx].slice(11, 13), 10);
        const dist = Math.abs(hour - 13);
        if (dist < bestDist) {
          bestDist = dist;
          middayIdx = idx;
        }
      }

      const middayTemp = hourly.temperature_2m[middayIdx];
      const middayHumidity = hourly.relative_humidity_2m[middayIdx];
      const middayWind = hourly.wind_speed_10m[middayIdx];
      const middayWindDir = hourly.wind_direction_10m[middayIdx];
      const middayCode = hourly.weather_code[middayIdx];
      const middayPressure = hourly.pressure_msl[middayIdx];

      // Convert sea-level pressure from hPa to inHg
      const pressureInHg = middayPressure != null
        ? +(middayPressure * 0.02953).toFixed(2)
        : 29.92;

      // Compute day offset from today (string-safe, no timezone issues)
      const dayOffset: number = forecastDays.length;
      const d = new Date(dateStr + 'T12:00:00');
      const isExtended = dayOffset >= 7;

      forecastDays.push({
        date: dateStr,
        dayLabel: dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
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
        isExtrapolated: isExtended,
        dataConfidence: getConfidence(dayOffset),
      });
    }

    if (forecastDays.length === 0) {
      throw new Error('No forecast days generated from Open-Meteo data');
    }

    return NextResponse.json(forecastDays);
  } catch (error) {
    console.error('Forecast fetch error:', error);

    // Fallback: generate demo data so the app still works
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const days = [];
    const airTemps: { date: Date; airTemp: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const baseTemp = 68 + Math.sin(i * 0.5) * 8;
      airTemps.push({ date: d, airTemp: Math.round(baseTemp) });
    }
    const waterTemps = estimateWaterTempSeries(airTemps, lat);
    for (let i = 0; i < 10; i++) {
      const d = airTemps[i].date;
      const baseTemp = airTemps[i].airTemp;
      days.push({
        date: d.toISOString().slice(0, 10),
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'long' }),
        airTempHigh: Math.round(baseTemp + 5),
        airTempLow: Math.round(baseTemp - 8),
        airTemp: baseTemp,
        waterTemp: waterTemps[i],
        windSpeed: Math.round(6 + Math.random() * 10),
        windDirection: ['SW', 'S', 'SE', 'NW', 'W'][i % 5],
        barometricPressure: +(29.8 + Math.sin(i * 0.7) * 0.3).toFixed(2),
        humidity: Math.round(55 + Math.random() * 25),
        skyCondition: (['partly-cloudy', 'overcast', 'clear', 'rain', 'partly-cloudy'] as const)[i % 5],
        description: 'Fallback demo data — weather API unavailable',
        isExtrapolated: i >= 5,
        dataConfidence: i < 5 ? 95 - i * 5 : Math.max(30, 70 - (i - 5) * 10),
      });
    }
    return NextResponse.json(days);
  }
}
