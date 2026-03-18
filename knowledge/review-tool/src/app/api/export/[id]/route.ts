import { NextResponse } from 'next/server';
import { loadMergedReview, getAnglerName } from '@/lib/data';
import { generateProfile } from '@/lib/generate-profile';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await loadMergedReview(id);
    const name = getAnglerName(id);
    const ts = generateProfile(id, name, data);
    return NextResponse.json({ typescript: ts });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
