'use client';

import { X } from 'lucide-react';
import type { StrikeAnalysis, WeatherConditions } from '@/lib/types';

interface DayComparisonProps {
  dayA: { index: number; label: string; analysis: StrikeAnalysis; conditions: WeatherConditions };
  dayB: { index: number; label: string; analysis: StrikeAnalysis; conditions: WeatherConditions };
  onDismiss: () => void;
}

function DeltaBadge({ label, valueA, valueB, unit, invert }: {
  label: string; valueA: number; valueB: number; unit: string; invert?: boolean;
}) {
  const delta = valueB - valueA;
  if (Math.abs(delta) < 0.01) return null;
  const isPositive = invert ? delta < 0 : delta > 0;
  const sign = delta > 0 ? '+' : '';
  const formatted = Number.isInteger(delta) ? delta : delta.toFixed(2);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs font-mono text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-500">{valueA}{unit}</span>
        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {sign}{formatted}{unit}
        </span>
        <span className="text-xs font-mono text-slate-500">{valueB}{unit}</span>
      </div>
    </div>
  );
}

export default function DayComparison({ dayA, dayB, onDismiss }: DayComparisonProps) {
  const { analysis: a, conditions: ca } = dayA;
  const { analysis: b, conditions: cb } = dayB;

  // Key insight: largest factor score delta
  const deltas = [
    { label: 'Bite Rating', delta: Math.abs(b.biteIntensity - a.biteIntensity) },
    { label: 'Fish Depth', delta: Math.abs(b.fishDepth - a.fishDepth) },
    { label: 'Water Temp', delta: Math.abs(cb.waterTemp - ca.waterTemp) * 2 },
    { label: 'Pressure', delta: Math.abs(cb.barometricPressure - ca.barometricPressure) * 50 },
    { label: 'Wind', delta: Math.abs(cb.windSpeed - ca.windSpeed) },
  ];
  const keyInsight = deltas.sort((x, y) => y.delta - x.delta)[0];

  // Lure pick changes
  const lureA = a.anglerPicks[0]?.lure.name ?? '—';
  const lureB = b.anglerPicks[0]?.lure.name ?? '—';

  return (
    <div className="border border-slate-700 rounded-lg bg-slate-900/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 border-b border-slate-700/50">
        <span className="text-xs font-mono text-sky-400 uppercase tracking-wider font-semibold">
          {dayA.label} vs {dayB.label}
        </span>
        <button onClick={onDismiss} className="ml-auto text-slate-500 hover:text-slate-300 p-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="px-4 py-3 space-y-1">
        <DeltaBadge label="Bite Rating" valueA={a.biteIntensity} valueB={b.biteIntensity} unit="" />
        <DeltaBadge label="Fish Depth" valueA={a.fishDepth} valueB={b.fishDepth} unit="ft" invert />
        <DeltaBadge label="Water Temp" valueA={ca.waterTemp} valueB={cb.waterTemp} unit="°F" />
        <DeltaBadge label="Pressure" valueA={ca.barometricPressure} valueB={cb.barometricPressure} unit=" inHg" />
        <DeltaBadge label="Wind" valueA={ca.windSpeed} valueB={cb.windSpeed} unit="mph" />
        {lureA !== lureB && (
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-mono text-slate-400">Top Lure</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">{lureA}</span>
              <span className="text-xs font-mono text-amber-400">→</span>
              <span className="text-xs font-mono text-slate-500">{lureB}</span>
            </div>
          </div>
        )}
        {/* Key insight */}
        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 italic">
            Key difference: <span className="text-white font-semibold">{keyInsight.label}</span> has the biggest swing between these days.
          </p>
        </div>
      </div>
    </div>
  );
}
