import { NextResponse } from 'next/server';
import { getAnglerIds, loadMergedReview, getAnglerName } from '@/lib/data';
import { VALID_WHEN_KEYS } from '@/lib/constants';
import { isEmptyPredicate, getNonStandardKeys } from '@/lib/predicate-matcher';

export interface CoverageCell {
  anglerId: string;
  anglerName: string;
  lure: string;
  tipCount: number;
  colorCount: number;
  emptyWhenTips: number;
  emptyWhenColors: number;
  nonStandardFields: number;
  hasCredibility: boolean;
  sources: string[];
}

export async function GET() {
  try {
    const ids = await getAnglerIds();
    const cells: CoverageCell[] = [];

    for (const id of ids) {
      const data = await loadMergedReview(id);
      const name = getAnglerName(id);

      for (const [lureName, opinion] of Object.entries(data.opinions)) {
        let emptyWhenTips = 0, emptyWhenColors = 0, nonStandard = 0;

        for (const rule of opinion.tipRules) {
          if (isEmptyPredicate(rule.when)) emptyWhenTips++;
          nonStandard += getNonStandardKeys(rule.when).length;
        }
        for (const rule of opinion.colorRules) {
          if (isEmptyPredicate(rule.when)) emptyWhenColors++;
          nonStandard += getNonStandardKeys(rule.when).length;
        }

        cells.push({
          anglerId: id,
          anglerName: name,
          lure: lureName,
          tipCount: opinion.tipRules.length,
          colorCount: opinion.colorRules.length,
          emptyWhenTips,
          emptyWhenColors,
          nonStandardFields: nonStandard,
          hasCredibility: data.credibility[lureName] !== undefined,
          sources: opinion.sources,
        });
      }
    }

    return NextResponse.json({ cells });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
