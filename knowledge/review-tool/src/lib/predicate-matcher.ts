// ─── Ported from strikezone/src/lib/anglers/composer.ts:6-46 ───
// Checks whether a set of conditions matches a ConditionPredicate.
// Used by the simulator and health checks.

import type { ConditionPredicate } from './types';
import { VALID_WHEN_KEYS, type ValidWhenKey } from './constants';

/** Input conditions for simulation — mirrors StrikeZone's LureContext shape */
export interface SimulationConditions {
  season?: string;
  waterTemp?: number;
  waterClarity?: string;
  skyCondition?: string;
  frontalSystem?: string;
  pressureTrend?: string;
  windSpeed?: number;
  fishDepth?: number;
  timeOfDay?: string;
  isLowLight?: boolean;
  isStained?: boolean;
}

/** Test whether conditions match a predicate. Returns true if all specified fields match. */
export function matchesPredicate(ctx: SimulationConditions, pred: ConditionPredicate): boolean {
  // season — array-includes
  if (pred.season !== undefined) {
    const vals = Array.isArray(pred.season) ? pred.season : [pred.season];
    if (ctx.season === undefined || !vals.includes(ctx.season)) return false;
  }

  // waterTemp — min/max range
  if (pred.waterTemp !== undefined) {
    if (ctx.waterTemp === undefined) return false;
    if (pred.waterTemp.min !== undefined && ctx.waterTemp < pred.waterTemp.min) return false;
    if (pred.waterTemp.max !== undefined && ctx.waterTemp > pred.waterTemp.max) return false;
  }

  // waterClarity — array-includes
  if (pred.waterClarity !== undefined) {
    const vals = Array.isArray(pred.waterClarity) ? pred.waterClarity : [pred.waterClarity];
    if (ctx.waterClarity === undefined || !vals.includes(ctx.waterClarity)) return false;
  }

  // skyCondition — array-includes
  if (pred.skyCondition !== undefined) {
    const vals = Array.isArray(pred.skyCondition) ? pred.skyCondition : [pred.skyCondition];
    if (ctx.skyCondition === undefined || !vals.includes(ctx.skyCondition)) return false;
  }

  // frontalSystem — array-includes
  if (pred.frontalSystem !== undefined) {
    const vals = Array.isArray(pred.frontalSystem) ? pred.frontalSystem : [pred.frontalSystem];
    if (ctx.frontalSystem === undefined || !vals.includes(ctx.frontalSystem)) return false;
  }

  // pressureTrend — array-includes
  if (pred.pressureTrend !== undefined) {
    const vals = Array.isArray(pred.pressureTrend) ? pred.pressureTrend : [pred.pressureTrend];
    if (ctx.pressureTrend === undefined || !vals.includes(ctx.pressureTrend)) return false;
  }

  // windSpeed — min/max range
  if (pred.windSpeed !== undefined) {
    if (ctx.windSpeed === undefined) return false;
    const ws = pred.windSpeed as { min?: number; max?: number };
    if (ws.min !== undefined && ctx.windSpeed < ws.min) return false;
    if (ws.max !== undefined && ctx.windSpeed > ws.max) return false;
  }

  // fishDepth — min/max range
  if (pred.fishDepth !== undefined) {
    if (ctx.fishDepth === undefined) return false;
    const fd = pred.fishDepth as { min?: number; max?: number };
    if (fd.min !== undefined && ctx.fishDepth < fd.min) return false;
    if (fd.max !== undefined && ctx.fishDepth > fd.max) return false;
  }

  // timeOfDay — array-includes
  if (pred.timeOfDay !== undefined) {
    const vals = Array.isArray(pred.timeOfDay) ? pred.timeOfDay : [pred.timeOfDay];
    if (ctx.timeOfDay === undefined || !vals.includes(ctx.timeOfDay)) return false;
  }

  // isLowLight — boolean equality
  if (pred.isLowLight !== undefined && ctx.isLowLight !== pred.isLowLight) return false;

  // isStained — boolean equality
  if (pred.isStained !== undefined && ctx.isStained !== pred.isStained) return false;

  return true;
}

/** Get non-standard keys from a predicate (keys not in VALID_WHEN_KEYS) */
export function getNonStandardKeys(pred: ConditionPredicate): string[] {
  const validSet = new Set<string>(VALID_WHEN_KEYS);
  return Object.keys(pred).filter(k => !validSet.has(k));
}

/** Check if a predicate is empty (no keys) */
export function isEmptyPredicate(pred: ConditionPredicate): boolean {
  return Object.keys(pred).length === 0;
}

/** Check if a predicate has only non-standard keys (would be silently ignored) */
export function hasOnlyNonStandardKeys(pred: ConditionPredicate): boolean {
  const keys = Object.keys(pred);
  if (keys.length === 0) return false;
  const validSet = new Set<string>(VALID_WHEN_KEYS);
  return keys.every(k => !validSet.has(k));
}
