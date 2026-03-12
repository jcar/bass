import { NextRequest, NextResponse } from 'next/server';
import lakesCompact from '@/data/lakes-compact.json';

// Compact format: [id, name, state, county, lat, lon, isReservoir, maxDepth, surfaceAcres]
type CompactLake = [string, string, string, string, number, number, number, number | null, number | null];

const lakes = lakesCompact as CompactLake[];

// Pre-build state index for faster filtering
const stateIndex = new Map<string, number[]>();
for (let i = 0; i < lakes.length; i++) {
  const state = lakes[i][2];
  if (!stateIndex.has(state)) stateIndex.set(state, []);
  stateIndex.get(state)!.push(i);
}

function formatLake(l: CompactLake) {
  return {
    id: l[0],
    name: l[1],
    state: l[2],
    county: l[3],
    lat: l[4],
    lon: l[5],
    type: l[6] === 1 ? 'reservoir' : 'lake',
    maxDepth: l[7],
    surfaceAcres: l[8],
  };
}

function haversineDistSq(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Returns approximate squared distance in degrees — good enough for sorting nearest
  const dLat = lat2 - lat1;
  const dLon = (lon2 - lon1) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  return dLat * dLat + dLon * dLon;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const state = (searchParams.get('state') || '').trim().toUpperCase();
  const lat = parseFloat(searchParams.get('lat') || '');
  const lon = parseFloat(searchParams.get('lon') || '');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

  // Nearest-lake mode: find closest lakes to given coordinates
  if (!isNaN(lat) && !isNaN(lon) && !query) {
    const minAcres = parseInt(searchParams.get('minAcres') || '50');
    const scored: { idx: number; distSq: number }[] = [];
    for (let i = 0; i < lakes.length; i++) {
      const acreage = lakes[i][8];
      if (acreage !== null && acreage < minAcres) continue;
      if (acreage === null) continue; // skip lakes with unknown size
      const distSq = haversineDistSq(lat, lon, lakes[i][4], lakes[i][5]);
      scored.push({ idx: i, distSq });
    }
    scored.sort((a, b) => a.distSq - b.distSq);
    const results = scored.slice(0, limit).map(s => formatLake(lakes[s.idx]));
    return NextResponse.json(results);
  }

  if (!query && !state) {
    return NextResponse.json({ error: 'Provide ?q=search, ?state=XX, or ?lat=N&lon=N' }, { status: 400 });
  }

  let candidates: number[];

  if (state && stateIndex.has(state)) {
    candidates = stateIndex.get(state)!;
  } else {
    // Search all lakes
    candidates = Array.from({ length: lakes.length }, (_, i) => i);
  }

  if (!query) {
    // Return all lakes for the state, sorted by surface area (biggest first)
    const results = candidates
      .map(i => lakes[i])
      .sort((a, b) => (b[8] ?? 0) - (a[8] ?? 0))
      .slice(0, limit)
      .map(formatLake);
    return NextResponse.json(results);
  }

  // Search by name — score matches
  const scored: { idx: number; score: number }[] = [];
  const queryWords = query.split(/\s+/);

  for (const i of candidates) {
    const name = lakes[i][1].toLowerCase();
    const county = lakes[i][3].toLowerCase();

    let score = 0;

    // Exact name match
    if (name === query) {
      score = 1000;
    }
    // Name starts with query
    else if (name.startsWith(query)) {
      score = 500;
    }
    // All query words appear in name
    else if (queryWords.every(w => name.includes(w))) {
      score = 200;
    }
    // First word matches
    else if (name.startsWith(queryWords[0])) {
      score = 100;
    }
    // Any word matches
    else if (queryWords.some(w => name.includes(w))) {
      score = 50;
    }
    // County match
    else if (county.includes(query)) {
      score = 25;
    }

    if (score > 0) {
      // Boost lakes with more data (depth, area)
      if (lakes[i][7] !== null) score += 10; // has depth
      if (lakes[i][8] !== null) score += 5;  // has area
      // Boost larger lakes
      if (lakes[i][8] !== null && lakes[i][8]! > 1000) score += 8;
      if (lakes[i][8] !== null && lakes[i][8]! > 100) score += 3;
      scored.push({ idx: i, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, limit).map(s => formatLake(lakes[s.idx]));

  return NextResponse.json(results);
}
