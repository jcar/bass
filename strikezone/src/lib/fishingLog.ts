// ─── Fishing Log: localStorage CRUD ───
// ~1.5KB per entry. localStorage 5MB ≈ 3,000 entries.

import type { WeatherConditions } from './types';

export interface LogEntry {
  id: string;
  timestamp: number;
  lakeId: string;
  lakeName: string;
  conditions: WeatherConditions;
  biteIntensity: number;
  fishDepth: number;
  seasonLabel: string;
  topAnglerPick: { anglerId: string; lureName: string };
  userReport: {
    fishCount: number;
    biggestFish: number | null;  // lbs
    lureUsed: string;
    rating: 1 | 2 | 3 | 4 | 5;
    notes: string;
  };
}

const STORAGE_KEY = 'strikezone-log-v1';

export function loadLog(): LogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLog(log: LogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // localStorage full or unavailable
  }
}

export function saveEntry(entry: LogEntry): void {
  const log = loadLog();
  log.unshift(entry); // newest first
  saveLog(log);
}

export function deleteEntry(id: string): void {
  const log = loadLog().filter(e => e.id !== id);
  saveLog(log);
}
