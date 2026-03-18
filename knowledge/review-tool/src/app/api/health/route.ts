import { NextResponse } from 'next/server';
import { getAnglerIds, loadMergedReview, getAnglerName } from '@/lib/data';
import { computeHealth } from '@/lib/health';

export async function GET() {
  try {
    const ids = await getAnglerIds();
    const anglers = await Promise.all(
      ids.map(async id => ({
        id,
        name: getAnglerName(id),
        data: await loadMergedReview(id),
      }))
    );
    const health = computeHealth(anglers);
    return NextResponse.json(health);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
