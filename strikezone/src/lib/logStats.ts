// ─── Fishing Log Statistics ───
// Pure functions over the log array.

import type { LogEntry } from './fishingLog';

interface BiteRangeStat {
  range: string;
  avgFishCount: number;
  entries: number;
}

export function getAccuracyByBiteRange(log: LogEntry[]): BiteRangeStat[] {
  const buckets: Record<string, { total: number; count: number }> = {
    '0-30': { total: 0, count: 0 },
    '30-60': { total: 0, count: 0 },
    '60-80': { total: 0, count: 0 },
    '80+': { total: 0, count: 0 },
  };
  for (const entry of log) {
    const b = entry.biteIntensity;
    const key = b < 30 ? '0-30' : b < 60 ? '30-60' : b < 80 ? '60-80' : '80+';
    buckets[key].total += entry.userReport.fishCount;
    buckets[key].count++;
  }
  return Object.entries(buckets)
    .filter(([, v]) => v.count > 0)
    .map(([range, v]) => ({
      range,
      avgFishCount: Math.round((v.total / v.count) * 10) / 10,
      entries: v.count,
    }));
}

interface AnglerUsageStat {
  anglerId: string;
  lureName: string;
  count: number;
}

export function getAnglerUsage(log: LogEntry[]): AnglerUsageStat[] {
  const usage = new Map<string, { anglerId: string; lureName: string; count: number }>();
  for (const entry of log) {
    const key = entry.topAnglerPick.anglerId;
    const existing = usage.get(key);
    if (existing) {
      existing.count++;
    } else {
      usage.set(key, {
        anglerId: entry.topAnglerPick.anglerId,
        lureName: entry.topAnglerPick.lureName,
        count: 1,
      });
    }
  }
  return [...usage.values()].sort((a, b) => b.count - a.count);
}

export function getBestConditions(log: LogEntry[], lakeId?: string): {
  avgFishCount: number;
  biteRange: string;
  entries: number;
} | null {
  const filtered = lakeId ? log.filter(e => e.lakeId === lakeId) : log;
  if (filtered.length === 0) return null;

  // Find the bite range bucket with the highest avg fish count
  const stats = getAccuracyByBiteRange(filtered);
  if (stats.length === 0) return null;

  const best = stats.reduce((a, b) => a.avgFishCount > b.avgFishCount ? a : b);
  return {
    avgFishCount: best.avgFishCount,
    biteRange: best.range,
    entries: best.entries,
  };
}
