import { NextRequest, NextResponse } from 'next/server';
import { estimateWaterTemp } from '@/lib/waterTemp';
import { windDegToCardinal, mapSkyCondition } from '@/lib/weather-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') || '35.96');
  const lon = parseFloat(searchParams.get('lon') || '-93.31');
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    const waterTemp = estimateWaterTemp(new Date(), lat, 68);
    return NextResponse.json({
      airTemp: 68,
      waterTemp,
      windSpeed: 8,
      windDirection: 'SW',
      barometricPressure: 29.92,
      humidity: 65,
      skyCondition: 'partly-cloudy',
      description: 'Demo data - set OPENWEATHER_API_KEY for live weather',
    });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(apiKey)}&units=imperial`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      throw new Error(`OpenWeather API returned ${res.status}`);
    }
    const data = await res.json();

    const windDirection = windDegToCardinal(data.wind?.deg ?? 0);
    const skyCondition = mapSkyCondition(data.weather?.[0]?.id ?? 800);

    const airTemp = Math.round(data.main.temp);
    const waterTemp = estimateWaterTemp(new Date(), lat, airTemp);

    return NextResponse.json({
      airTemp,
      waterTemp,
      windSpeed: Math.round(data.wind?.speed ?? 0),
      windDirection,
      barometricPressure: +(data.main.pressure * 0.02953).toFixed(2),
      humidity: data.main.humidity,
      skyCondition,
      description: data.weather?.[0]?.description ?? '',
    });
  } catch (error) {
    console.error('Weather fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
