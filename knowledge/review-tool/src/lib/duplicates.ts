// ─── Duplicate Detection via Jaccard Similarity ───
import type { MergedReview } from './types';

export interface DuplicateItem {
  ruleIndex: number;
  text: string;
  priority: number;
  whenKeys: string[];
}

export interface DuplicateGroup {
  anglerId: string;
  anglerName: string;
  lure: string;
  type: 'tip' | 'color';
  items: DuplicateItem[];
  similarity: number;
}

/** Tokenize text into lowercase word set */
function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 1)
  );
}

/** Jaccard similarity between two sets */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const THRESHOLD = 0.7;

export function findDuplicates(
  anglers: Array<{ id: string; name: string; data: MergedReview }>
): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];

  for (const { id, name, data } of anglers) {
    for (const [lureName, opinion] of Object.entries(data.opinions)) {
      // Check tip duplicates
      const tips = opinion.tipRules;
      if (tips.length > 1) {
        const tokenSets = tips.map(t => tokenize(t.tip));
        const visited = new Set<number>();

        for (let i = 0; i < tips.length; i++) {
          if (visited.has(i)) continue;
          const cluster: number[] = [i];

          for (let j = i + 1; j < tips.length; j++) {
            if (visited.has(j)) continue;
            const sim = jaccard(tokenSets[i], tokenSets[j]);
            if (sim >= THRESHOLD) {
              cluster.push(j);
              visited.add(j);
            }
          }

          if (cluster.length > 1) {
            visited.add(i);
            const maxSim = Math.max(
              ...cluster.flatMap((a, ai) =>
                cluster.slice(ai + 1).map(b => jaccard(tokenSets[a], tokenSets[b]))
              )
            );
            groups.push({
              anglerId: id,
              anglerName: name,
              lure: lureName,
              type: 'tip',
              items: cluster.map(idx => ({
                ruleIndex: idx,
                text: tips[idx].tip,
                priority: tips[idx].priority,
                whenKeys: Object.keys(tips[idx].when),
              })),
              similarity: Math.round(maxSim * 100) / 100,
            });
          }
        }
      }

      // Check color duplicates (same color name + overlapping conditions)
      const colors = opinion.colorRules;
      if (colors.length > 1) {
        const visited = new Set<number>();
        for (let i = 0; i < colors.length; i++) {
          if (visited.has(i)) continue;
          const cluster: number[] = [i];

          for (let j = i + 1; j < colors.length; j++) {
            if (visited.has(j)) continue;
            if (colors[i].color.toLowerCase() === colors[j].color.toLowerCase()) {
              // Same color name — check condition overlap
              const keysI = new Set(Object.keys(colors[i].when));
              const keysJ = new Set(Object.keys(colors[j].when));
              let overlap = 0;
              for (const k of keysI) if (keysJ.has(k)) overlap++;
              if (overlap > 0 || (keysI.size === 0 && keysJ.size === 0)) {
                cluster.push(j);
                visited.add(j);
              }
            }
          }

          if (cluster.length > 1) {
            visited.add(i);
            groups.push({
              anglerId: id,
              anglerName: name,
              lure: lureName,
              type: 'color',
              items: cluster.map(idx => ({
                ruleIndex: idx,
                text: `${colors[idx].color} (${colors[idx].hex})`,
                priority: colors[idx].priority,
                whenKeys: Object.keys(colors[idx].when),
              })),
              similarity: 1.0,
            });
          }
        }
      }
    }
  }

  return groups;
}
