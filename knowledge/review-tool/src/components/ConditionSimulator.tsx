'use client';

import { useState } from 'react';
import {
  SEASONS, WATER_CLARITIES, SKY_CONDITIONS, FRONTAL_SYSTEMS,
  PRESSURE_TRENDS, TIMES_OF_DAY,
} from '@/lib/constants';

interface Props {
  onSimulate: (conditions: Record<string, unknown>) => void;
  loading: boolean;
}

const PRESETS: Record<string, Record<string, unknown>> = {
  'Cold pre-spawn morning': {
    season: 'pre-spawn', waterTemp: 52, waterClarity: 'stained',
    skyCondition: 'overcast', frontalSystem: 'stable', pressureTrend: 'falling',
    windSpeed: 8, fishDepth: 6, timeOfDay: 'morning', isLowLight: false, isStained: true,
  },
  'Summer ledge fishing': {
    season: 'summer', waterTemp: 82, waterClarity: 'clear',
    skyCondition: 'clear', frontalSystem: 'stable', pressureTrend: 'steady',
    windSpeed: 5, fishDepth: 20, timeOfDay: 'midday', isLowLight: false, isStained: false,
  },
  'Fall overcast': {
    season: 'fall', waterTemp: 65, waterClarity: 'stained',
    skyCondition: 'overcast', frontalSystem: 'pre-frontal', pressureTrend: 'falling',
    windSpeed: 12, fishDepth: 8, timeOfDay: 'afternoon', isLowLight: false, isStained: true,
  },
  'Post-frontal bluebird': {
    season: 'post-spawn', waterTemp: 72, waterClarity: 'clear',
    skyCondition: 'clear', frontalSystem: 'post-frontal', pressureTrend: 'rising',
    windSpeed: 3, fishDepth: 10, timeOfDay: 'midday', isLowLight: false, isStained: false,
  },
  'Dawn topwater': {
    season: 'summer', waterTemp: 78, waterClarity: 'stained',
    skyCondition: 'partly-cloudy', frontalSystem: 'stable', pressureTrend: 'steady',
    windSpeed: 2, fishDepth: 3, timeOfDay: 'dawn', isLowLight: true, isStained: true,
  },
};

export default function ConditionSimulator({ onSimulate, loading }: Props) {
  const [conditions, setConditions] = useState<Record<string, unknown>>({});

  const set = (key: string, value: unknown) => {
    setConditions(prev => {
      if (value === '' || value === undefined) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const applyPreset = (name: string) => {
    setConditions(PRESETS[name]);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(PRESETS).map(name => (
          <button
            key={name}
            onClick={() => applyPreset(name)}
            className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Season */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Season</label>
          <select
            value={(conditions.season as string) ?? ''}
            onChange={e => set('season', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Water Temp */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Water Temp (°F)</label>
          <input
            type="number"
            value={(conditions.waterTemp as number) ?? ''}
            onChange={e => set('waterTemp', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
            placeholder="68"
          />
        </div>

        {/* Water Clarity */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Water Clarity</label>
          <select
            value={(conditions.waterClarity as string) ?? ''}
            onChange={e => set('waterClarity', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            {WATER_CLARITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Sky Condition */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Sky Condition</label>
          <select
            value={(conditions.skyCondition as string) ?? ''}
            onChange={e => set('skyCondition', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            {SKY_CONDITIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Frontal System */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Frontal System</label>
          <select
            value={(conditions.frontalSystem as string) ?? ''}
            onChange={e => set('frontalSystem', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            {FRONTAL_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Pressure Trend */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Pressure Trend</label>
          <select
            value={(conditions.pressureTrend as string) ?? ''}
            onChange={e => set('pressureTrend', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            {PRESSURE_TRENDS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Wind Speed */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Wind Speed (mph)</label>
          <input
            type="number"
            value={(conditions.windSpeed as number) ?? ''}
            onChange={e => set('windSpeed', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
            placeholder="8"
          />
        </div>

        {/* Fish Depth */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Fish Depth (ft)</label>
          <input
            type="number"
            value={(conditions.fishDepth as number) ?? ''}
            onChange={e => set('fishDepth', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
            placeholder="12"
          />
        </div>

        {/* Time of Day */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Time of Day</label>
          <select
            value={(conditions.timeOfDay as string) ?? ''}
            onChange={e => set('timeOfDay', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            {TIMES_OF_DAY.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* isLowLight */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Low Light</label>
          <select
            value={conditions.isLowLight === undefined ? '' : String(conditions.isLowLight)}
            onChange={e => set('isLowLight', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* isStained */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Stained</label>
          <select
            value={conditions.isStained === undefined ? '' : String(conditions.isStained)}
            onChange={e => set('isStained', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onSimulate(conditions)}
          disabled={loading}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
        <button
          onClick={() => setConditions({})}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
