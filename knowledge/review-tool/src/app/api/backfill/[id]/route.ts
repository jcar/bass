import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { loadMergedReview, saveMergedReview, getAnglerIds } from '@/lib/data';

const EXTRACTED_DIR = join(process.cwd(), '..', 'data', 'extracted');

interface BackfillSuggestion {
  lure: string;
  ruleType: 'tip' | 'color';
  ruleIndex: number;
  originalText: string;
  priority: number;
  suggestedWhen: Record<string, unknown>;
  confidence: number;
  reasoning: string;
  status: 'pending' | 'accepted' | 'skipped' | 'edited' | 'confirmed';
}

interface BackfillData {
  anglerId: string;
  totalEmpty: number;
  processed: number;
  suggestions: BackfillSuggestion[];
}

async function loadBackfill(id: string): Promise<BackfillData | null> {
  const filePath = join(EXTRACTED_DIR, id, '_condition-backfill.json');
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveBackfill(id: string, data: BackfillData): Promise<void> {
  const filePath = join(EXTRACTED_DIR, id, '_condition-backfill.json');
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// GET: load backfill sidecar for an angler
// GET with id="all": return summary for all anglers
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id === 'all') {
    const anglerIds = await getAnglerIds();
    const summaries = [];
    for (const aid of anglerIds) {
      const backfill = await loadBackfill(aid);
      if (backfill) {
        const pending = backfill.suggestions.filter(s => s.status === 'pending').length;
        const accepted = backfill.suggestions.filter(s => s.status === 'accepted').length;
        const skipped = backfill.suggestions.filter(s => s.status === 'skipped').length;
        const edited = backfill.suggestions.filter(s => s.status === 'edited').length;
        const confirmed = backfill.suggestions.filter(s => s.status === 'confirmed').length;
        const withConditions = backfill.suggestions.filter(s =>
          Object.keys(s.suggestedWhen).length > 0
        ).length;
        summaries.push({
          id: aid,
          totalEmpty: backfill.totalEmpty,
          total: backfill.suggestions.length,
          pending,
          accepted,
          skipped,
          edited,
          confirmed,
          withConditions,
        });
      }
    }
    return NextResponse.json(summaries);
  }

  const backfill = await loadBackfill(id);
  if (!backfill) {
    return NextResponse.json(
      { error: 'No backfill data. Run: python3 scripts/backfill-conditions.py ' + id },
      { status: 404 }
    );
  }
  return NextResponse.json(backfill);
}

// POST: apply actions to suggestions
// Body: { action: "accept" | "skip" | "edit" | "accept-all-high" | "confirm" | "confirm-all-universal", index?: number, when?: object }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, index, when: editedWhen } = body;

  const backfill = await loadBackfill(id);
  if (!backfill) {
    return NextResponse.json({ error: 'No backfill data' }, { status: 404 });
  }

  const merged = await loadMergedReview(id);

  if (action === 'accept-all-high') {
    // Accept all pending suggestions with confidence >= 0.8 that have conditions
    let count = 0;
    for (const suggestion of backfill.suggestions) {
      if (suggestion.status !== 'pending') continue;
      if (suggestion.confidence < 0.8) continue;
      if (Object.keys(suggestion.suggestedWhen).length === 0) continue;

      const applied = applyWhen(merged, suggestion, suggestion.suggestedWhen);
      if (applied) {
        suggestion.status = 'accepted';
        count++;
      }
    }
    await saveMergedReview(id, merged);
    await saveBackfill(id, backfill);
    return NextResponse.json({ ok: true, applied: count });
  }

  if (action === 'confirm-all-universal') {
    let count = 0;
    for (const suggestion of backfill.suggestions) {
      if (suggestion.status !== 'pending') continue;
      if (Object.keys(suggestion.suggestedWhen).length > 0) continue;
      suggestion.status = 'confirmed';
      count++;
    }
    await saveBackfill(id, backfill);
    return NextResponse.json({ ok: true, confirmed: count });
  }

  if (typeof index !== 'number' || index < 0 || index >= backfill.suggestions.length) {
    return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
  }

  const suggestion = backfill.suggestions[index];

  if (action === 'accept') {
    const applied = applyWhen(merged, suggestion, suggestion.suggestedWhen);
    if (applied) {
      suggestion.status = 'accepted';
      await saveMergedReview(id, merged);
    }
  } else if (action === 'confirm') {
    suggestion.status = 'confirmed';
  } else if (action === 'skip') {
    suggestion.status = 'skipped';
  } else if (action === 'edit') {
    if (!editedWhen) {
      return NextResponse.json({ error: 'Missing when for edit action' }, { status: 400 });
    }
    const applied = applyWhen(merged, suggestion, editedWhen);
    if (applied) {
      suggestion.status = 'edited';
      suggestion.suggestedWhen = editedWhen;
      await saveMergedReview(id, merged);
    }
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  await saveBackfill(id, backfill);
  return NextResponse.json({ ok: true, suggestion });
}

function applyWhen(
  merged: { opinions: Record<string, { tipRules?: Array<{ when: unknown }>; colorRules?: Array<{ when: unknown }> }> },
  suggestion: BackfillSuggestion,
  when: Record<string, unknown>
): boolean {
  const opinion = merged.opinions[suggestion.lure];
  if (!opinion) return false;

  const rules = suggestion.ruleType === 'tip' ? opinion.tipRules : opinion.colorRules;
  if (!rules || suggestion.ruleIndex >= rules.length) return false;

  rules[suggestion.ruleIndex].when = when;
  return true;
}
