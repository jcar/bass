// ─── Shared visual constants ───
import type { LureAction, FrontalSystem } from './types';

export const ANGLER_META: Record<string, { fullName: string; style: string; accent: string }> = {
  kvd: { fullName: 'Kevin VanDam', style: 'Cranking & Power Fishing', accent: '#f59e0b' },
  hackney: { fullName: 'Greg Hackney', style: 'Flipping & Shallow Power', accent: '#ef4444' },
  wheeler: { fullName: 'Jacob Wheeler', style: 'Versatile & Electronics', accent: '#38bdf8' },
  yamamoto: { fullName: 'Gary Yamamoto', style: 'Soft Plastics & Finesse', accent: '#a78bfa' },
  milliken: { fullName: 'Ben Milliken', style: 'Big Baits & Sonar', accent: '#10b981' },
  palaniuk: { fullName: 'Brandon Palaniuk', style: 'Deep Finesse & Current', accent: '#06b6d4' },
  johnston: { fullName: 'Cory Johnston', style: 'Drop Shot & Smallmouth', accent: '#f472b6' },
  robertson: { fullName: 'Matt Robertson', style: 'Offshore Ledge Fishing', accent: '#fb923c' },
};

export const ACTION_COLORS: Record<LureAction, string> = {
  finesse: '#a78bfa',
  reaction: '#f97316',
  search: '#38bdf8',
  power: '#ef4444',
};

export function confidenceColor(value: number): string {
  if (value >= 85) return '#10b981';
  if (value >= 70) return '#f59e0b';
  return '#64748b';
}

export const FRONTAL_BADGE: Record<FrontalSystem, { label: string; color: string }> = {
  'pre-frontal': { label: 'PRE-FRONTAL', color: '#10b981' },
  'post-frontal': { label: 'POST-FRONTAL', color: '#ef4444' },
  stable: { label: 'STABLE', color: '#38bdf8' },
  'cold-front': { label: 'COLD FRONT', color: '#a78bfa' },
};
