'use client';

import { useRef } from 'react';
import { Sun, Cloud, CloudRain, CloudSun, Droplets, Wind, AlertTriangle } from 'lucide-react';
import type { DayForecast, SkyCondition } from '@/lib/types';

interface ForecastGridProps {
  forecast: DayForecast[];
  selectedDay: number;
  onDaySelect: (index: number) => void;
  loading?: boolean;
}

const skyIcon: Record<SkyCondition, React.ReactNode> = {
  clear: <Sun className="w-3.5 h-3.5 text-amber-400" />,
  'partly-cloudy': <CloudSun className="w-3.5 h-3.5 text-sky-300" />,
  overcast: <Cloud className="w-3.5 h-3.5 text-slate-400" />,
  rain: <CloudRain className="w-3.5 h-3.5 text-blue-400" />,
};

export default function ForecastGrid({ forecast, selectedDay, onDaySelect, loading }: ForecastGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = forecast[selectedDay];

  if (forecast.length === 0) {
    return (
      <div className="p-3">
        <div className="py-8 text-center">
          <Cloud className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-mono">
            {loading ? 'Loading forecast...' : 'Select a lake to see the forecast'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Forecast grid */}
      <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {forecast.map((day, i) => {
          const isSelected = i === selectedDay;
          const isToday = i === 0;
          return (
            <button
              key={day.date}
              onClick={() => onDaySelect(i)}
              className={`flex-shrink-0 rounded-lg p-1.5 transition-all text-center relative group
                ${isSelected
                  ? 'bg-emerald-500/15 border-emerald-500/40 border ring-1 ring-emerald-500/20'
                  : 'bg-slate-800/40 border border-slate-700/40 hover:border-slate-600 hover:bg-slate-800/60'
                }
                ${day.isExtrapolated ? 'opacity-75 hover:opacity-100' : ''}
              `}
              style={{ width: `${100 / Math.min(forecast.length, 10)}%`, minWidth: '46px' }}
            >
              {/* Day label */}
              <div className={`text-[9px] font-mono font-bold tracking-wider uppercase leading-none
                ${isSelected ? 'text-emerald-400' : isToday ? 'text-sky-400' : 'text-slate-400'}`}>
                {day.dayLabel}
              </div>

              {/* Sky icon */}
              <div className="flex justify-center my-1">
                {skyIcon[day.skyCondition]}
              </div>

              {/* Temps */}
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-[11px] font-mono font-bold text-white leading-none">{day.airTempHigh}°</span>
                <span className="text-[9px] font-mono text-slate-500 leading-none">{day.airTempLow}°</span>
              </div>

              {/* Water temp */}
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                <Droplets className="w-2 h-2 text-sky-500/60" />
                <span className="text-[9px] font-mono text-sky-400/80 leading-none">{day.waterTemp}°</span>
              </div>

              {/* Wind */}
              <div className="text-[8px] font-mono text-slate-600 mt-0.5 leading-none">
                {day.windSpeed}<span className="text-slate-700">mph</span>
              </div>

              {/* Confidence bar */}
              <div className="mt-1 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${day.dataConfidence}%`,
                    background: day.dataConfidence >= 70 ? '#10b981' : day.dataConfidence >= 45 ? '#f59e0b' : '#ef4444',
                  }} />
              </div>

              {/* Extrapolated dot */}
              {day.isExtrapolated && (
                <div className="absolute top-1 right-1">
                  <div className="w-1 h-1 rounded-full bg-amber-500/60" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail strip */}
      {today && (
        <div className={`mt-2 rounded-lg px-3 py-2 flex items-center gap-4 text-[10px] font-mono
          ${today.isExtrapolated
            ? 'bg-amber-500/5 border border-amber-500/15'
            : 'bg-slate-800/40 border border-slate-700/30'
          }`}>
          <div className="flex items-center gap-1.5">
            {skyIcon[today.skyCondition]}
            <span className="text-white font-semibold">
              {today.dayOfWeek}{selectedDay === 0 ? ' (Today)' : ''}
            </span>
          </div>
          <span className="text-slate-400">{today.description}</span>
          <div className="ml-auto flex items-center gap-3 text-slate-500 flex-shrink-0">
            <span><Wind className="w-3 h-3 inline -mt-0.5 mr-0.5" />{today.windSpeed}mph {today.windDirection}</span>
            <span>{today.barometricPressure} inHg</span>
            {today.isExtrapolated && (
              <span className="text-amber-500/80 flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                {today.dataConfidence}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
