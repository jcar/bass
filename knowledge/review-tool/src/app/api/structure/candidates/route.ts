import { NextResponse } from 'next/server';
import { getAnglerIds, loadMergedReview, getAnglerName } from '@/lib/data';
import { extractCandidates } from '@/lib/structure-candidates';

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

    const candidates = extractCandidates(anglers);
    return NextResponse.json({ candidates, total: candidates.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
