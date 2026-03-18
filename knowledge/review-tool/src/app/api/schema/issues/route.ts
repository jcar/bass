import { NextResponse } from 'next/server';
import { getAnglerIds, loadMergedReview, getAnglerName } from '@/lib/data';
import { VALID_WHEN_KEYS } from '@/lib/constants';

export interface SchemaIssue {
  anglerId: string;
  anglerName: string;
  lure: string;
  ruleType: 'tip' | 'color' | 'modifier';
  ruleIndex: number;
  field: string;
  value: unknown;
  tip: string;
}

export async function GET() {
  try {
    const validSet = new Set<string>(VALID_WHEN_KEYS);
    const ids = await getAnglerIds();
    const issues: SchemaIssue[] = [];

    for (const id of ids) {
      const data = await loadMergedReview(id);
      const name = getAnglerName(id);

      for (const [lureName, opinion] of Object.entries(data.opinions)) {
        // Tip rules
        opinion.tipRules.forEach((rule, idx) => {
          for (const [key, val] of Object.entries(rule.when)) {
            if (!validSet.has(key)) {
              issues.push({
                anglerId: id, anglerName: name, lure: lureName,
                ruleType: 'tip', ruleIndex: idx, field: key, value: val,
                tip: rule.tip,
              });
            }
          }
        });

        // Color rules
        opinion.colorRules.forEach((rule, idx) => {
          for (const [key, val] of Object.entries(rule.when)) {
            if (!validSet.has(key)) {
              issues.push({
                anglerId: id, anglerName: name, lure: lureName,
                ruleType: 'color', ruleIndex: idx, field: key, value: val,
                tip: `${rule.color} (${rule.hex})`,
              });
            }
          }
        });

        // Modifiers
        opinion.confidenceModifiers.forEach((mod, idx) => {
          for (const [key, val] of Object.entries(mod.when)) {
            if (!validSet.has(key)) {
              issues.push({
                anglerId: id, anglerName: name, lure: lureName,
                ruleType: 'modifier', ruleIndex: idx, field: key, value: val,
                tip: `adjustment: ${mod.adjustment}`,
              });
            }
          }
        });
      }
    }

    return NextResponse.json({ issues, total: issues.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
