import { NextResponse } from 'next/server';
import { loadMergedReview, saveMergedReview } from '@/lib/data';

interface AssignRequest {
  anglerId: string;
  structureType: string;
  advice: string;
  source?: string;
}

export async function POST(request: Request) {
  try {
    const body: AssignRequest = await request.json();
    const { anglerId, structureType, advice, source } = body;

    const data = await loadMergedReview(anglerId);

    if (!data.structureAdvice) {
      data.structureAdvice = {};
    }

    if (!data.structureAdvice[structureType]) {
      data.structureAdvice[structureType] = [];
    }

    // Replace existing or add new
    data.structureAdvice[structureType] = [
      { advice, source: source ?? 'review-tool' },
    ];

    await saveMergedReview(anglerId, data);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
