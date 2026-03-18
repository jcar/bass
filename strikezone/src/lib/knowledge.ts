// ─── Knowledge Bundle: Query Interface ───
// Provides typed access to the pre-generated knowledge-bundle.json.

import type { Season } from './types';

export interface KnowledgeEntry {
  angler: string;
  anglerId: string;
  category: string;
  topic: string;
  insight: string;
  source: string;
  lure?: string;
  season?: string;
}

interface KnowledgeBundle {
  totalEntries: number;
  byLure: Record<string, KnowledgeEntry[]>;
  byCategory: Record<string, KnowledgeEntry[]>;
  byAngler: Record<string, KnowledgeEntry[]>;
}

let bundle: KnowledgeBundle | null = null;

function loadBundle(): KnowledgeBundle {
  if (bundle) return bundle;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    bundle = require('../data/knowledge-bundle.json') as KnowledgeBundle;
  } catch {
    bundle = { totalEntries: 0, byLure: {}, byCategory: {}, byAngler: {} };
  }
  return bundle;
}

interface QueryOpts {
  angler?: string;
  category?: string;
  season?: Season | string;
  limit?: number;
}

function matchesSeason(entry: KnowledgeEntry, season: string): boolean {
  if (!entry.season) return true; // no season constraint = universal
  if (Array.isArray(entry.season)) return entry.season.includes(season);
  return entry.season === season;
}

function applyFilters(entries: KnowledgeEntry[], opts: QueryOpts): KnowledgeEntry[] {
  let result = entries;
  if (opts.angler) {
    result = result.filter(e => e.anglerId === opts.angler);
  }
  if (opts.category) {
    result = result.filter(e => e.category === opts.category);
  }
  if (opts.season) {
    result = result.filter(e => matchesSeason(e, opts.season!));
  }
  if (opts.limit) {
    result = result.slice(0, opts.limit);
  }
  return result;
}

/** Find knowledge entries for a specific lure name. */
export function findForLure(lureName: string, opts: QueryOpts = {}): KnowledgeEntry[] {
  const b = loadBundle();
  const entries = b.byLure[lureName] ?? [];
  return applyFilters(entries, opts);
}

/** Find knowledge entries for a category. */
export function findForCategory(category: string, opts: QueryOpts = {}): KnowledgeEntry[] {
  const b = loadBundle();
  const entries = b.byCategory[category] ?? [];
  return applyFilters(entries, opts);
}

/** Find knowledge entries for a specific angler. */
export function findForAngler(anglerId: string, opts: QueryOpts = {}): KnowledgeEntry[] {
  const b = loadBundle();
  const entries = b.byAngler[anglerId] ?? [];
  return applyFilters(entries, opts);
}

/** Get all available categories in the bundle. */
export function getKnowledgeCategories(): string[] {
  return Object.keys(loadBundle().byCategory);
}

/** Get all lure names that have knowledge entries. */
export function getKnowledgeLures(): string[] {
  return Object.keys(loadBundle().byLure);
}
