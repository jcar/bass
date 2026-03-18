// ─── Session Memory: Lake Preferences & Tackle Box ───
// Persists user state across sessions via localStorage.
// Same pattern as tuning.ts: load/save with safe defaults.

import type { WaterClarity } from './types';

export interface LakeMemory {
  clarity: WaterClarity;
  waterTempOverride: number | null;
  maxDepth: number;
}

export interface SessionState {
  defaultLake: {
    id: string;
    name: string;
    state: string;
    lat: number;
    lon: number;
    maxDepth: number | null;
  } | null;
  lakeMemory: Record<string, LakeMemory>;
  favoriteLakeIds: string[];
  favoriteLakesData?: Record<string, unknown>; // legacy, no longer written
  tackleBox: string[];           // lure names the user owns
  lastFetchTimestamp: number;
  followingAngler: string | null; // angler id when in "follow mode"
}

const STORAGE_KEY = 'strikezone-session-v1';

const DEFAULT_SESSION: SessionState = {
  defaultLake: null,
  lakeMemory: {},
  favoriteLakeIds: [],
  favoriteLakesData: {},
  tackleBox: [],
  lastFetchTimestamp: 0,
  followingAngler: null,
};

export function loadSession(): SessionState {
  if (typeof window === 'undefined') return DEFAULT_SESSION;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SESSION;
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_SESSION, ...parsed };
  } catch {
    return DEFAULT_SESSION;
  }
}

export function saveSession(s: SessionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // localStorage full or unavailable
  }
}

export function updateLakeMemory(
  session: SessionState,
  lakeId: string,
  update: Partial<LakeMemory>,
): SessionState {
  const existing = session.lakeMemory[lakeId] ?? {
    clarity: 'stained' as WaterClarity,
    waterTempOverride: null,
    maxDepth: 40,
  };
  return {
    ...session,
    lakeMemory: {
      ...session.lakeMemory,
      [lakeId]: { ...existing, ...update },
    },
  };
}

export function toggleFavorite(session: SessionState, lakeId: string): SessionState {
  const removing = session.favoriteLakeIds.includes(lakeId);
  const ids = removing
    ? session.favoriteLakeIds.filter(id => id !== lakeId)
    : [...session.favoriteLakeIds, lakeId];
  return { ...session, favoriteLakeIds: ids };
}

export function toggleTackleBox(session: SessionState, lureName: string): SessionState {
  const box = session.tackleBox.includes(lureName)
    ? session.tackleBox.filter(n => n !== lureName)
    : [...session.tackleBox, lureName];
  return { ...session, tackleBox: box };
}
