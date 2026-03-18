import { NextResponse } from 'next/server';
import { getAnglerSummaries } from '@/lib/data';

export async function GET() {
  const summaries = await getAnglerSummaries();
  return NextResponse.json(summaries);
}
