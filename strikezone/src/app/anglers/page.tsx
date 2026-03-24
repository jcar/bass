'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { loadTuning } from '@/lib/tuning';
import { runStrikeAnalysis } from '@/lib/StrikeEngine';
import AnglerRoster from '@/components/AnglerRoster';
import type { WeatherConditions } from '@/lib/types';

const DEFAULT_CONDITIONS: WeatherConditions = {
  airTemp: 68,
  waterTemp: 62,
  windSpeed: 8,
  windDirection: 'SW',
  barometricPressure: 29.92,
  pressureTrend: 'steady',
  skyCondition: 'partly-cloudy',
  humidity: 65,
  waterClarity: 'stained',
  frontalSystem: 'stable',
};

export default function AnglersPage() {
  const [conditions] = useState<WeatherConditions>(DEFAULT_CONDITIONS);
  const tuning = useMemo(() => loadTuning(), []);

  const analysis = useMemo(
    () => runStrikeAnalysis(conditions, tuning, 40),
    [conditions, tuning],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Pro Anglers</h1>
            <p className="text-xs text-slate-500">
              {analysis.seasonalPhase.label} &middot; {conditions.waterClarity} &middot; {conditions.frontalSystem}
            </p>
          </div>
        </div>

        <AnglerRoster
          anglerPicks={analysis.anglerPicks}
          structureTargets={analysis.structureTargets}
          seasonalPhase={analysis.seasonalPhase}
          conditions={conditions}
        />
      </div>
    </div>
  );
}
