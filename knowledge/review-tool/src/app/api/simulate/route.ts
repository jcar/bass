import { NextResponse } from 'next/server';
import { getAnglerIds, loadMergedReview, getAnglerName } from '@/lib/data';
import { simulate } from '@/lib/simulate';
import type { SimulationConditions } from '@/lib/predicate-matcher';

export async function POST(request: Request) {
  try {
    const conditions: SimulationConditions = await request.json();

    const ids = await getAnglerIds();
    const anglers = await Promise.all(
      ids.map(async id => ({
        id,
        name: getAnglerName(id),
        data: await loadMergedReview(id),
      }))
    );

    const result = simulate(conditions, anglers);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
