import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { MergedReview, AnglerSummary } from './types';

const EXTRACTED_DIR = join(process.cwd(), '..', 'data', 'extracted');

const ANGLER_NAMES: Record<string, string> = {
  kvd: 'Kevin VanDam',
  hackney: 'Greg Hackney',
  wheeler: 'Jacob Wheeler',
  palaniuk: 'Brandon Palaniuk',
  yamamoto: 'Gary Yamamoto',
  johnston: 'Cory Johnston',
  robertson: 'Matt Robertson',
};

export async function getAnglerIds(): Promise<string[]> {
  const entries = await readdir(EXTRACTED_DIR, { withFileTypes: true });
  const ids: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      await readFile(join(EXTRACTED_DIR, entry.name, '_merged-review.json'), 'utf-8');
      ids.push(entry.name);
    } catch {
      // no merged file, skip
    }
  }
  return ids.sort();
}

export async function loadMergedReview(id: string): Promise<MergedReview> {
  const filePath = join(EXTRACTED_DIR, id, '_merged-review.json');
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export async function saveMergedReview(id: string, data: MergedReview): Promise<void> {
  const filePath = join(EXTRACTED_DIR, id, '_merged-review.json');
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export async function getAnglerSummaries(): Promise<AnglerSummary[]> {
  const ids = await getAnglerIds();
  const summaries: AnglerSummary[] = [];

  for (const id of ids) {
    const data = await loadMergedReview(id);
    const lureNames = Object.keys(data.opinions);
    const categories = data.knowledge.map(k => k.category);
    const catCounts = new Map<string, number>();
    for (const c of categories) catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
    const topCategories = [...catCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    summaries.push({
      id,
      name: ANGLER_NAMES[id] ?? id,
      sources: data.sources.length,
      lures: lureNames.length,
      knowledge: data.knowledge.length,
      topCategories,
      lureNames,
    });
  }

  return summaries;
}

export function getAnglerName(id: string): string {
  return ANGLER_NAMES[id] ?? id;
}
