import { NextResponse } from 'next/server';
import { getAnglerIds, loadMergedReview, getAnglerName } from '@/lib/data';
import { findDuplicates } from '@/lib/duplicates';

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

    const groups = findDuplicates(anglers);
    return NextResponse.json({ groups, total: groups.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
