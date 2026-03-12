'use client';

import { Thermometer, Wind, Droplets, Eye, Cloud, Gauge, Waves } from 'lucide-react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { WeatherConditions, BiteWindow, WaterClarity } from '@/lib/types';
import PressureIndicator from './PressureIndicator';
import SolunarTimeline from './SolunarTimeline';

interface ConditionsPanelProps {
  conditions: WeatherConditions;
  biteWindows: BiteWindow[];
  lakeMaxDepth: number;
  onLakeMaxDepthChange: (depth: number) => void;
  onWaterClarityChange: (clarity: WaterClarity) => void;
}

const trendIcon: Record<string, React.ReactNode> = {
  falling: <TrendingDown className="w-3 h-3" />,
  rising: <TrendingUp className="w-3 h-3" />,
  steady: <Minus className="w-3 h-3" />,
};

function ConditionReadonly({ icon, label, value, estimated }: { icon: React.ReactNode; label: string; value: string; estimated?: boolean }) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/40 rounded px-2.5 py-2">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</span>
          {estimated && <span className="text-[8px] text-amber-500/60 font-mono">EST</span>}
        </div>
        <div className="text-sm font-mono text-white capitalize">{value}</div>
      </div>
    </div>
  );
}

function ClaritySelect({ value, onChange }: { value: WaterClarity; onChange: (v: WaterClarity) => void }) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/40 rounded px-2.5 py-2">
      <Eye className="w-3.5 h-3.5 text-emerald-400" />
      <div className="flex-1 min-w-0">
        <div className="text-[9px] text-slate-500 uppercase tracking-wider">Clarity</div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as WaterClarity)}
          className="w-full bg-transparent text-sm font-mono text-white capitalize cursor-pointer focus:outline-none"
        >
          <option value="clear" className="bg-slate-900">Clear</option>
          <option value="stained" className="bg-slate-900">Stained</option>
          <option value="muddy" className="bg-slate-900">Muddy</option>
        </select>
      </div>
    </div>
  );
}

export default function ConditionsPanel({ conditions, biteWindows, lakeMaxDepth, onLakeMaxDepthChange, onWaterClarityChange }: ConditionsPanelProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
        <Cloud className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Conditions</h3>
      </div>

      {/* Lake Max Depth */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-700/30">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Lake Max Depth</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono font-bold text-white">{lakeMaxDepth}</span>
            <span className="text-[9px] text-slate-500">ft</span>
          </div>
        </div>
        <div className="relative h-5 flex items-center">
          <div className="absolute inset-x-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-900/40 to-cyan-600"
              style={{ width: `${((lakeMaxDepth - 8) / (80 - 8)) * 100}%` }} />
          </div>
          <input type="range" min={8} max={80} step={1} value={lakeMaxDepth}
            onChange={(e) => onLakeMaxDepthChange(+e.target.value)}
            className="absolute inset-x-0 w-full h-5 opacity-0 cursor-pointer" />
          <div className="absolute w-3 h-3 rounded-full border-2 border-cyan-400 bg-cyan-600 pointer-events-none"
            style={{ left: `calc(${((lakeMaxDepth - 8) / (80 - 8)) * 100}% - 6px)` }} />
        </div>
      </div>

      {/* Weather conditions grid */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <ConditionReadonly icon={<Thermometer className="w-3.5 h-3.5 text-rose-400" />} label="Air Temp" value={`${conditions.airTemp}°F`} />
          <ConditionReadonly icon={<Droplets className="w-3.5 h-3.5 text-sky-400" />} label="Water Temp" value={`${conditions.waterTemp}°F`} estimated />
          <ConditionReadonly icon={<Wind className="w-3.5 h-3.5 text-teal-400" />} label="Wind" value={`${conditions.windSpeed}mph ${conditions.windDirection}`} />
          <ConditionReadonly icon={<Gauge className="w-3.5 h-3.5 text-violet-400" />} label="Pressure" value={`${conditions.barometricPressure.toFixed(2)} inHg`} />
          <ConditionReadonly icon={<Cloud className="w-3.5 h-3.5 text-gray-400" />} label="Sky" value={conditions.skyCondition} />
          <ClaritySelect value={conditions.waterClarity} onChange={onWaterClarityChange} />
          <ConditionReadonly icon={<Cloud className="w-3.5 h-3.5 text-amber-400" />} label="Front" value={conditions.frontalSystem} />
          <ConditionReadonly icon={trendIcon[conditions.pressureTrend]} label="Trend" value={conditions.pressureTrend} />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/30" />

        {/* Barometric Pressure */}
        <PressureIndicator pressure={conditions.barometricPressure} trend={conditions.pressureTrend} />

        {/* Divider */}
        <div className="border-t border-slate-700/30" />

        {/* Solunar Peaks */}
        <SolunarTimeline windows={biteWindows} />
      </div>
    </div>
  );
}
