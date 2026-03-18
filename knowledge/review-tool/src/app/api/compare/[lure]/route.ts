import { NextResponse } from 'next/server';
import { getAnglerIds, loadMergedReview, getAnglerName } from '@/lib/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lure: string }> }
) {
  const { lure } = await params;
  const lureName = decodeURIComponent(lure);
  const ids = await getAnglerIds();
  const result: Record<string, { name: string; opinion: unknown }> = {};

  for (const id of ids) {
    const data = await loadMergedReview(id);
    const opinion = data.opinions[lureName];
    if (opinion) {
      result[id] = { name: getAnglerName(id), opinion };
    }
  }

  return NextResponse.json(result);
}
