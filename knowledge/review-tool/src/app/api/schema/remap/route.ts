import { NextResponse } from 'next/server';
import { loadMergedReview, saveMergedReview } from '@/lib/data';

interface RemapRequest {
  anglerId: string;
  lure: string;
  ruleType: 'tip' | 'color' | 'modifier';
  ruleIndex: number;
  field: string;
  action: 'remap' | 'appendToTip' | 'delete';
  remapTo?: string;
  remapValue?: unknown;
}

export async function POST(request: Request) {
  try {
    const body: RemapRequest | RemapRequest[] = await request.json();
    const items = Array.isArray(body) ? body : [body];

    // Group by angler for efficient save
    const byAngler = new Map<string, RemapRequest[]>();
    for (const item of items) {
      const list = byAngler.get(item.anglerId) ?? [];
      list.push(item);
      byAngler.set(item.anglerId, list);
    }

    let processed = 0;

    for (const [anglerId, requests] of byAngler) {
      const data = await loadMergedReview(anglerId);

      // Sort by ruleIndex descending so deletions don't shift indices
      requests.sort((a, b) => b.ruleIndex - a.ruleIndex);

      for (const req of requests) {
        const opinion = data.opinions[req.lure];
        if (!opinion) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let rules: any[];
        if (req.ruleType === 'tip') rules = opinion.tipRules;
        else if (req.ruleType === 'color') rules = opinion.colorRules;
        else rules = opinion.confidenceModifiers;

        const rule = rules[req.ruleIndex];
        if (!rule) continue;

        const when = rule.when as Record<string, unknown>;

        if (req.action === 'delete') {
          delete when[req.field];
          processed++;
        } else if (req.action === 'appendToTip') {
          // Append field info to tip text, then remove from when
          const valueStr = JSON.stringify(when[req.field]);
          if (req.ruleType === 'tip') {
            const tipRule = rule as { tip: string; when: Record<string, unknown> };
            tipRule.tip = `${tipRule.tip} [${req.field}: ${valueStr}]`;
          }
          delete when[req.field];
          processed++;
        } else if (req.action === 'remap' && req.remapTo) {
          const value = req.remapValue !== undefined ? req.remapValue : when[req.field];
          when[req.remapTo] = value;
          delete when[req.field];
          processed++;
        }
      }

      await saveMergedReview(anglerId, data);
    }

    return NextResponse.json({ processed });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
