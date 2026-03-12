'use client';

import { useState } from 'react';
import { Settings, RotateCcw, ChevronDown, ChevronRight, Save } from 'lucide-react';
import type { TuningConfig } from '@/lib/tuning';
import { DEFAULT_TUNING } from '@/lib/tuning';

interface TuningPanelProps {
  config: TuningConfig;
  onChange: (config: TuningConfig) => void;
  onReset: () => void;
}

function Section({ title, open: defaultOpen = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-700/50">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-slate-800/30 transition-colors">
        {open ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{title}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1, suffix = '' }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; suffix?: string;
}) {
  const isChanged = false; // We don't track per-field defaults here
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number" value={step < 1 ? value.toFixed(2) : value}
          min={min} max={max} step={step}
          onChange={(e) => onChange(+e.target.value)}
          className={`w-20 bg-slate-900/60 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-right focus:outline-none focus:border-amber-500/50 ${isChanged ? 'text-amber-300' : 'text-white'}`}
        />
        {suffix && <span className="text-[9px] text-slate-600 font-mono w-6">{suffix}</span>}
      </div>
    </div>
  );
}

export default function TuningPanel({ config, onChange, onReset }: TuningPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  function update<K extends keyof TuningConfig>(section: K, values: Partial<TuningConfig[K]>) {
    onChange({
      ...config,
      [section]: { ...config[section], ...values },
    });
  }

  function setLureMultiplier(name: string, value: number) {
    onChange({
      ...config,
      lureMultipliers: { ...config.lureMultipliers, [name]: value },
    });
  }

  const hasChanges = JSON.stringify(config) !== JSON.stringify(DEFAULT_TUNING);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-amber-500/30 transition-colors">
        <Settings className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Engine Tuning</span>
        {hasChanges && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
      </button>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-amber-500/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Engine Tuning</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button onClick={onReset}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 transition-colors">
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          <button onClick={() => setIsOpen(false)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 transition-colors">
            Close
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="px-4 py-1.5 bg-amber-500/5 border-y border-amber-500/10">
          <div className="flex items-center gap-2">
            <Save className="w-3 h-3 text-amber-500/60" />
            <span className="text-[9px] font-mono text-amber-400/60 uppercase">Custom tuning active — saved to browser</span>
          </div>
        </div>
      )}

      {/* Sections */}
      <Section title="Seasonal Temperature Breakpoints" open>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <NumberInput label="Winter Ceiling" value={config.seasonalBreakpoints.winterCeiling}
            onChange={(v) => update('seasonalBreakpoints', { winterCeiling: v })} min={30} max={60} suffix="F" />
          <NumberInput label="Pre-Spawn Start" value={config.seasonalBreakpoints.preSpawnStart}
            onChange={(v) => update('seasonalBreakpoints', { preSpawnStart: v })} min={40} max={65} suffix="F" />
          <NumberInput label="Pre-Spawn to Spawn" value={config.seasonalBreakpoints.preSpawnToSpawn}
            onChange={(v) => update('seasonalBreakpoints', { preSpawnToSpawn: v })} min={50} max={72} suffix="F" />
          <NumberInput label="Spawn Peak" value={config.seasonalBreakpoints.spawnPeak}
            onChange={(v) => update('seasonalBreakpoints', { spawnPeak: v })} min={58} max={78} suffix="F" />
          <NumberInput label="Post-Spawn Start" value={config.seasonalBreakpoints.postSpawnStart}
            onChange={(v) => update('seasonalBreakpoints', { postSpawnStart: v })} min={65} max={85} suffix="F" />
          <NumberInput label="Summer Start" value={config.seasonalBreakpoints.summerStart}
            onChange={(v) => update('seasonalBreakpoints', { summerStart: v })} min={72} max={95} suffix="F" />
          <NumberInput label="Fall Start" value={config.seasonalBreakpoints.fallStart}
            onChange={(v) => update('seasonalBreakpoints', { fallStart: v })} min={65} max={90} suffix="F" />
          <NumberInput label="Fall End" value={config.seasonalBreakpoints.fallEnd}
            onChange={(v) => update('seasonalBreakpoints', { fallEnd: v })} min={40} max={65} suffix="F" />
        </div>
      </Section>

      <Section title="Bite Intensity Weights">
        <p className="text-[9px] text-slate-600 font-mono mb-2">Should sum to ~1.0. Current: {
          Object.values(config.biteWeights).reduce((a, b) => a + b, 0).toFixed(2)
        }</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <NumberInput label="Time of Day" value={config.biteWeights.timeOfDay}
            onChange={(v) => update('biteWeights', { timeOfDay: v })} min={0} max={1} step={0.01} />
          <NumberInput label="Water Temp" value={config.biteWeights.waterTemp}
            onChange={(v) => update('biteWeights', { waterTemp: v })} min={0} max={1} step={0.01} />
          <NumberInput label="Pressure" value={config.biteWeights.barometricPressure}
            onChange={(v) => update('biteWeights', { barometricPressure: v })} min={0} max={1} step={0.01} />
          <NumberInput label="Wind" value={config.biteWeights.wind}
            onChange={(v) => update('biteWeights', { wind: v })} min={0} max={1} step={0.01} />
          <NumberInput label="Water Clarity" value={config.biteWeights.waterClarity}
            onChange={(v) => update('biteWeights', { waterClarity: v })} min={0} max={1} step={0.01} />
          <NumberInput label="Sky Condition" value={config.biteWeights.skyCondition}
            onChange={(v) => update('biteWeights', { skyCondition: v })} min={0} max={1} step={0.01} />
          <NumberInput label="Frontal System" value={config.biteWeights.frontalSystem}
            onChange={(v) => update('biteWeights', { frontalSystem: v })} min={0} max={1} step={0.01} />
        </div>
      </Section>

      <Section title="Time of Day Periods">
        {(['dawn', 'morning', 'midday', 'afternoon', 'dusk'] as const).map((period) => {
          const p = config.timeOfDay[period];
          return (
            <div key={period} className="space-y-1.5">
              <span className="text-[10px] font-mono text-amber-400/60 uppercase">{period}</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-2">
                <NumberInput label="Start Hour" value={p.startHour}
                  onChange={(v) => update('timeOfDay', { [period]: { ...p, startHour: v } } as never)} min={0} max={23} suffix="h" />
                <NumberInput label="End Hour" value={p.endHour}
                  onChange={(v) => update('timeOfDay', { [period]: { ...p, endHour: v } } as never)} min={0} max={23} suffix="h" />
                {Object.entries(p).filter(([k]) => k !== 'startHour' && k !== 'endHour').map(([key, val]) => (
                  <NumberInput key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    value={val as number}
                    onChange={(v) => update('timeOfDay', { [period]: { ...p, [key]: v } } as never)}
                    min={0} max={100} step={key.includes('Bias') ? 0.05 : 1} />
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Depth Sensitivity">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <NumberInput label="Pressure Influence" value={config.depthSensitivity.pressureInfluence}
            onChange={(v) => update('depthSensitivity', { pressureInfluence: v })} min={0} max={1} step={0.05} />
          <NumberInput label="Frontal Influence" value={config.depthSensitivity.frontalInfluence}
            onChange={(v) => update('depthSensitivity', { frontalInfluence: v })} min={0} max={1} step={0.05} />
          <NumberInput label="Sky Influence" value={config.depthSensitivity.skyInfluence}
            onChange={(v) => update('depthSensitivity', { skyInfluence: v })} min={0} max={1} step={0.05} />
          <NumberInput label="Cold Water Deep Bias" value={config.depthSensitivity.coldWaterDeepBias}
            onChange={(v) => update('depthSensitivity', { coldWaterDeepBias: v })} min={0} max={1} step={0.05} />
          <NumberInput label="Wind Influence" value={config.depthSensitivity.windInfluence}
            onChange={(v) => update('depthSensitivity', { windInfluence: v })} min={0} max={1} step={0.05} />
          <NumberInput label="Clarity Influence" value={config.depthSensitivity.clarityInfluence}
            onChange={(v) => update('depthSensitivity', { clarityInfluence: v })} min={0} max={1} step={0.05} />
          <NumberInput label="Cold Front Ratio" value={config.depthSensitivity.coldFrontRatio}
            onChange={(v) => update('depthSensitivity', { coldFrontRatio: v })} min={0} max={1} step={0.05} />
        </div>
      </Section>

      <Section title="Pressure Thresholds">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <NumberInput label="High Threshold" value={config.pressure.highThreshold}
            onChange={(v) => update('pressure', { highThreshold: v })} min={29.5} max={31} step={0.02} suffix="inHg" />
          <NumberInput label="Low Threshold" value={config.pressure.lowThreshold}
            onChange={(v) => update('pressure', { lowThreshold: v })} min={29} max={30.5} step={0.02} suffix="inHg" />
          <NumberInput label="Trend Sensitivity" value={config.pressure.trendSensitivity}
            onChange={(v) => update('pressure', { trendSensitivity: v })} min={0.01} max={0.2} step={0.01} suffix="inHg" />
        </div>
      </Section>

      <Section title="Lure Confidence Multipliers">
        <p className="text-[9px] text-slate-600 font-mono mb-2">1.0 = default. &gt;1 = boost, &lt;1 = reduce.</p>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {Object.entries(config.lureMultipliers).map(([name, value]) => (
            <div key={name} className="flex items-center justify-between gap-2">
              <span className="text-[9px] text-slate-500 font-mono truncate flex-1">{name}</span>
              <input
                type="number" value={value.toFixed(1)} min={0} max={3} step={0.1}
                onChange={(e) => setLureMultiplier(name, +e.target.value)}
                className={`w-16 bg-slate-900/60 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-right focus:outline-none focus:border-amber-500/50 ${value !== 1.0 ? 'text-amber-300' : 'text-white'}`}
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
