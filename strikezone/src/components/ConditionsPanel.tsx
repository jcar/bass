'use client';

import { useState } from 'react';
import { Thermometer, Wind, Droplets, Eye, Cloud, Gauge, Waves, RotateCcw, ChevronDown } from 'lucide-react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { WeatherConditions, BiteWindow, WaterClarity, ScoreFactor } from '@/lib/types';
import PressureIndicator from './PressureIndicator';
import SolunarTimeline from './SolunarTimeline';

export interface ConditionDelta {
  waterTemp?: number;
  airTemp?: number;
  windSpeed?: number;
  barometricPressure?: number;
}

interface ConditionsPanelProps {
  conditions: WeatherConditions;
  biteWindows: BiteWindow[];
  lakeMaxDepth: number;
  onLakeMaxDepthChange: (depth: number) => void;
  onWaterClarityChange: (clarity: WaterClarity) => void;
  waterTempOverride?: number | null;
  onWaterTempOverride?: (temp: number | null) => void;
  deltas?: ConditionDelta | null;
  biteFactors?: ScoreFactor[];
  defaultCollapsed?: boolean;
}

const trendIcon: Record<string, React.ReactNode> = {
  falling: <TrendingDown className="w-3 h-3" />,
  rising: <TrendingUp className="w-3 h-3" />,
  steady: <Minus className="w-3 h-3" />,
};

const FRONTAL_SHORT: Record<string, string> = {
  'pre-frontal': 'Pre-Front',
  'post-frontal': 'Post-Front',
  stable: 'Stable',
  'cold-front': 'Cold Front',
};

const CLARITY_SHORT: Record<string, string> = {
  clear: 'Clear',
  stained: 'Stained',
  muddy: 'Muddy',
};

function ConditionReadonly({ icon, label, value, estimated, delta, deltaUnit }: { icon: React.ReactNode; label: string; value: string; estimated?: boolean; delta?: number; deltaUnit?: string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/40 rounded px-2.5 py-2">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
          {estimated && <span className="text-xs text-amber-500/60 font-mono">EST</span>}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-mono text-white capitalize">{value}</span>
          {delta != null && delta !== 0 && <DeltaBadge value={delta} unit={deltaUnit ?? ''} />}
        </div>
      </div>
    </div>
  );
}

function WaterTempCell({ waterTemp, override, onOverride, delta }: { waterTemp: number; override: number | null; onOverride?: (v: number | null) => void; delta?: number }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const displayTemp = override ?? waterTemp;
  const isOverridden = override != null;

  function startEdit() {
    if (!onOverride) return;
    setInputVal(String(displayTemp));
    setEditing(true);
  }

  function commitEdit() {
    const val = parseInt(inputVal, 10);
    if (!isNaN(val) && val >= 32 && val <= 100) {
      onOverride?.(val);
    }
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-2 bg-slate-900/40 rounded px-2.5 py-2 cursor-pointer" onClick={!editing ? startEdit : undefined}>
      <Droplets className="w-3.5 h-3.5 text-sky-400" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Water Temp</span>
          <span className={`text-xs font-mono ${isOverridden ? 'text-emerald-400' : 'text-amber-500/60'}`}>
            {isOverridden ? 'ACTUAL' : 'EST'}
          </span>
          {isOverridden && (
            <button
              onClick={(e) => { e.stopPropagation(); onOverride?.(null); }}
              className="text-slate-600 hover:text-slate-400 ml-0.5 p-1"
              title="Reset to estimate"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
        {editing ? (
          <input
            type="number"
            autoFocus
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
            className="w-20 bg-transparent text-sm font-mono text-white border-b border-sky-400 focus:outline-none"
          />
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-sm font-mono text-white">{displayTemp}°F</span>
            {delta != null && delta !== 0 && <DeltaBadge value={delta} unit="°F" />}
          </div>
        )}
      </div>
    </div>
  );
}

function ClaritySelect({ value, onChange }: { value: WaterClarity; onChange: (v: WaterClarity) => void }) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/40 rounded px-2.5 py-2">
      <Eye className="w-3.5 h-3.5 text-emerald-400" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 uppercase tracking-wider">Clarity</div>
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

function DeltaBadge({ value, unit }: { value: number; unit: string }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span className={`text-xs font-mono font-bold ml-1 transition-opacity duration-500 ${
      isPositive ? 'text-amber-400' : 'text-emerald-400'
    }`}>
      {isPositive ? '+' : ''}{unit === 'inHg' ? value.toFixed(2) : value}{unit}
    </span>
  );
}

function FactorBar({ factor }: { factor: ScoreFactor }) {
  const impactDot: Record<string, string> = { positive: 'bg-emerald-400', neutral: 'bg-slate-500', negative: 'bg-rose-400' };
  const impactText: Record<string, string> = { positive: 'text-emerald-400', neutral: 'text-slate-500', negative: 'text-rose-400' };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${impactDot[factor.impact]}`} />
      <span className="text-xs font-mono text-slate-400 w-20 truncate">{factor.label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${factor.score}%`,
            background: factor.impact === 'positive' ? '#10b981' : factor.impact === 'negative' ? '#f87171' : '#64748b',
            opacity: 0.6 + factor.weight * 0.4,
          }}
        />
      </div>
      <span className={`text-xs font-mono font-bold w-6 text-right ${impactText[factor.impact]}`}>{factor.score}</span>
    </div>
  );
}

export default function ConditionsPanel({ conditions, biteWindows, lakeMaxDepth, onLakeMaxDepthChange, onWaterClarityChange, waterTempOverride, onWaterTempOverride, deltas, biteFactors, defaultCollapsed = false }: ConditionsPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const displayWaterTemp = waterTempOverride ?? conditions.waterTemp;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
      {/* Clickable summary header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <Cloud className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {collapsed ? (
            <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap text-xs font-mono text-slate-300">
              <span>{conditions.airTemp}°F air</span>
              <span className="text-slate-600">/</span>
              <span>{displayWaterTemp}°F water</span>
              <span className="text-slate-600">/</span>
              <span>{conditions.windSpeed}mph {conditions.windDirection}</span>
              <span className="text-slate-600">/</span>
              <span>{CLARITY_SHORT[conditions.waterClarity]}</span>
              <span className="text-slate-600">/</span>
              <span>{FRONTAL_SHORT[conditions.frontalSystem]}</span>
            </div>
          ) : (
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Conditions</h3>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
        </div>
      </button>

      {/* Expanded content */}
      <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
        <div className="overflow-hidden">
          {/* Lake Max Depth */}
          <div className="px-4 pt-1 pb-2 border-b border-slate-700/30">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Lake Max Depth</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-white">{lakeMaxDepth}</span>
                <span className="text-xs text-slate-500">ft</span>
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
              <ConditionReadonly icon={<Thermometer className="w-3.5 h-3.5 text-rose-400" />} label="Air Temp" value={`${conditions.airTemp}°F`}
                delta={deltas?.airTemp} deltaUnit="°F" />
              <WaterTempCell
                waterTemp={conditions.waterTemp}
                override={waterTempOverride ?? null}
                onOverride={onWaterTempOverride}
                delta={deltas?.waterTemp}
              />
              <ConditionReadonly icon={<Wind className="w-3.5 h-3.5 text-teal-400" />} label="Wind" value={`${conditions.windSpeed}mph ${conditions.windDirection}`}
                delta={deltas?.windSpeed} deltaUnit="mph" />
              <ConditionReadonly icon={<Gauge className="w-3.5 h-3.5 text-violet-400" />} label="Pressure" value={`${conditions.barometricPressure.toFixed(2)} inHg`}
                delta={deltas?.barometricPressure} deltaUnit=" inHg" />
              <ConditionReadonly icon={<Cloud className="w-3.5 h-3.5 text-gray-400" />} label="Sky" value={conditions.skyCondition} />
              <ClaritySelect value={conditions.waterClarity} onChange={onWaterClarityChange} />
              <ConditionReadonly icon={<Cloud className="w-3.5 h-3.5 text-amber-400" />} label="Front" value={conditions.frontalSystem} />
              <ConditionReadonly icon={trendIcon[conditions.pressureTrend]} label="Trend" value={conditions.pressureTrend} />
            </div>

            <div className="border-t border-slate-700/30" />

            <PressureIndicator pressure={conditions.barometricPressure} trend={conditions.pressureTrend} />

            <div className="border-t border-slate-700/30" />

            <SolunarTimeline windows={biteWindows} />

            {/* What's Driving It — factor bars (moved from OutlookHero) */}
            {biteFactors && biteFactors.length > 0 && (
              <>
                <div className="border-t border-slate-700/30" />
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">What&apos;s Driving It</div>
                  <div className="space-y-1.5">
                    {biteFactors.map((f, i) => (
                      <FactorBar key={i} factor={f} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
