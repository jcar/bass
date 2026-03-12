import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Try to get the client's real IP from headers (works behind proxies/Vercel)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || '';

    // ip-api.com: free, no key, 45 req/min, supports HTTPS via their paid plan
    // For free tier we use HTTP — fine for non-sensitive geo data
    const url = ip && ip !== '::1' && ip !== '127.0.0.1'
      ? `http://ip-api.com/json/${ip}?fields=status,city,regionName,country,lat,lon`
      : `http://ip-api.com/json/?fields=status,city,regionName,country,lat,lon`;

    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour
    const data = await res.json();

    if (data.status !== 'success') {
      return NextResponse.json({ error: 'Geolocation failed' }, { status: 502 });
    }

    return NextResponse.json({
      lat: data.lat,
      lon: data.lon,
      city: data.city,
      region: data.regionName,
      country: data.country,
    });
  } catch {
    return NextResponse.json({ error: 'Geolocation failed' }, { status: 500 });
  }
}
