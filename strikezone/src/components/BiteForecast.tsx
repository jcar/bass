'use client';

import { useMemo } from 'react';
import { Sun, Cloud, CloudRain, CloudSun, Droplets, Wind } from 'lucide-react';
import type { StrikeAnalysis, DayForecast, SkyCondition } from '@/lib/types';

interface BiteForecastProps {
  analyses: StrikeAnalysis[];
  forecast: DayForecast[];
  selectedDay: number;
  onDaySelect: (index: number) => void;
  compact?: boolean;
}

function getBarColor(score: number): string {
  if (score >= 70) return '#10b981'; // emerald
  if (score >= 50) return '#38bdf8'; // sky
  if (score >= 30) return '#f59e0b'; // amber
  return '#f43f5e';                   // rose
}

function getBiteLabel(score: number): string {
  if (score >= 75) return 'Go Fish';
  if (score >= 60) return 'Good';
  if (score >= 45) return 'Work It';
  if (score >= 30) return 'Tough';
  return 'Lockjaw';
}

function getPressureArrow(trend: string): string {
  if (trend === 'rising') return '▲';
  if (trend === 'falling') return '▼';
  return '—';
}

function getPressureColor(trend: string): string {
  if (trend === 'falling') return '#10b981';
  if (trend === 'rising') return '#f43f5e';
  return '#64748b';
}

const skyIcon: Record<SkyCondition, React.ReactNode> = {
  clear: <Sun className="w-3.5 h-3.5 text-amber-400" />,
  'partly-cloudy': <CloudSun className="w-3.5 h-3.5 text-sky-300" />,
  overcast: <Cloud className="w-3.5 h-3.5 text-slate-400" />,
  rain: <CloudRain className="w-3.5 h-3.5 text-blue-400" />,
};

export default function BiteForecast({
  analyses, forecast, selectedDay, onDaySelect, compact,
}: BiteForecastProps) {
  const maxBite = 100;

  // Find best day
  const bestDayIndex = useMemo(() => {
    let best = 0;
    for (let i = 1; i < analyses.length; i++) {
      if (analyses[i].biteIntensity > analyses[best].biteIntensity) best = i;
    }
    return best;
  }, [analyses]);

  // Water temp range for line scaling
  const waterTemps = forecast.map(d => d.waterTemp);
  const { tempMin, tempMax } = useMemo(() => {
    const temps = waterTemps.filter(t => t > 0);
    if (temps.length === 0) return { tempMin: 50, tempMax: 80 };
    const min = Math.floor(Math.min(...temps) - 2);
    const max = Math.ceil(Math.max(...temps) + 2);
    return { tempMin: min, tempMax: max };
  }, [waterTemps]);

  if (analyses.length === 0) return null;

  // ── Compact mode: tight day-picker strip ──
  if (compact) {
    return (
      <div className="px-3 py-1.5">
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {forecast.map((day, i) => {
            const a = analyses[i];
            if (!a) return null;
            const bite = a.biteIntensity;
            const isSelected = i === selectedDay;
            const isNow = i === 0;
            const isBest = i === bestDayIndex;
            const barColor = getBarColor(bite);

            return (
              <button
                key={day.date}
                onClick={() => onDaySelect(i)}
                className={`flex-1 min-w-0 rounded-md px-1 py-1 transition-all text-center relative
                  ${isSelected
                    ? isNow
                      ? 'bg-slate-800/80 border-sky-400/50 border ring-1 ring-sky-400/20'
                      : 'bg-emerald-500/15 border-emerald-500/40 border ring-1 ring-emerald-500/20'
                    : isNow
                      ? 'bg-slate-800/60 border border-sky-500/25 hover:border-sky-400/40'
                      : 'bg-slate-800/30 border border-slate-700/30 hover:border-slate-600'
                  }
                  ${day.isExtrapolated && !isNow ? 'opacity-70 hover:opacity-100' : ''}
                `}
              >
                {/* Day label */}
                <div className={`text-[9px] font-mono font-bold uppercase leading-none
                  ${isNow ? 'text-sky-400' : isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isNow ? 'Now' : day.dayLabel}
                </div>

                {/* Sky + bite score row */}
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="[&>svg]:w-3 [&>svg]:h-3">{skyIcon[day.skyCondition]}</span>
                  <span className="text-xs font-mono font-bold leading-none" style={{ color: barColor }}>{bite}</span>
                </div>

                {/* Bite bar */}
                <div className="mx-auto mt-0.5 w-full max-w-[36px] h-1 bg-slate-900/80 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${bite}%`, background: barColor }} />
                </div>

                {/* Temps: high/low air, water */}
                <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                  <span className="text-[9px] font-mono font-bold text-white leading-none">{day.airTempHigh}°</span>
                  <span className="text-[9px] font-mono text-slate-600 leading-none">{day.airTempLow}°</span>
                </div>
                <div className="text-[9px] font-mono text-sky-400/70 leading-none mt-px">
                  {day.waterTemp}°<span className="text-sky-500/40">w</span>
                </div>

                {/* Wind + pressure trend packed into one line */}
                <div className="text-[8px] font-mono text-slate-600 leading-none mt-px whitespace-nowrap">
                  {day.windSpeed}{day.windDirection}{' '}
                  <span style={{ color: getPressureColor(a.pressureTrend) }}>{getPressureArrow(a.pressureTrend)}</span>
                </div>

                {/* Best day badge */}
                {isBest && (
                  <div className="absolute -top-0.5 -right-0.5 px-0.5 rounded text-[7px] font-mono font-bold bg-emerald-500 text-white leading-tight">
                    GO
                  </div>
                )}

                {/* Extrapolated dot */}
                {day.isExtrapolated && !isBest && (
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-500/50" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Full mode: SVG chart with bars, water temp line, pressure arrows ──
  const barCount = analyses.length;
  const chartHeight = 120;
  const chartWidth = barCount * 60;
  const barWidth = 36;
  const barGap = 24;
  const topPad = 20;
  const bottomPad = 30;
  const usableHeight = chartHeight - topPad - bottomPad;

  return (
    <div className="px-4 py-4">
      <svg
        width={chartWidth}
        height={chartHeight + 50}
        viewBox={`0 0 ${chartWidth} ${chartHeight + 50}`}
        className="w-full"
        style={{ maxWidth: chartWidth }}
      >
        {/* Bars */}
        {analyses.map((a, i) => {
          const bite = a.biteIntensity;
          const barH = (bite / maxBite) * usableHeight;
          const x = i * (barWidth + barGap) + barGap / 2;
          const y = topPad + usableHeight - barH;
          const isSelected = i === selectedDay;
          const isBest = i === bestDayIndex;
          const color = getBarColor(bite);

          return (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => onDaySelect(i)}>
              {/* Best day pulsing ring */}
              {isBest && (
                <rect
                  x={x - 3} y={y - 3}
                  width={barWidth + 6} height={barH + 6}
                  rx={6}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={2}
                  opacity={0.6}
                >
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
                </rect>
              )}

              {/* Bar */}
              <rect
                x={x} y={y}
                width={barWidth} height={Math.max(barH, 2)}
                rx={4}
                fill={color}
                opacity={isSelected ? 1 : 0.7}
                stroke={isSelected ? '#fff' : 'none'}
                strokeWidth={isSelected ? 1.5 : 0}
              />

              {/* Score label on bar */}
              {barH > 16 && (
                <text
                  x={x + barWidth / 2}
                  y={y + barH / 2 + 4}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={11}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {bite}
                </text>
              )}

              {/* Day label below */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 14}
                textAnchor="middle"
                fill={isSelected ? '#10b981' : '#94a3b8'}
                fontSize={10}
                fontWeight={isSelected ? 'bold' : 'normal'}
                fontFamily="monospace"
              >
                {forecast[i]?.dayLabel ?? ''}
              </text>
              {/* Pressure trend arrow */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 28}
                textAnchor="middle"
                fill={getPressureColor(a.pressureTrend)}
                fontSize={10}
                fontFamily="monospace"
              >
                {getPressureArrow(a.pressureTrend)}
              </text>
              {/* Best day badge */}
              {isBest && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fill="#10b981"
                  fontSize={9}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  GO
                </text>
              )}
            </g>
          );
        })}

        {/* Water temp line */}
        {waterTemps.length > 0 && (
          <>
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              opacity={0.5}
              points={waterTemps.map((t, i) => {
                const x = i * (barWidth + barGap) + barGap / 2 + barWidth / 2;
                const y = topPad + usableHeight - ((t - tempMin) / (tempMax - tempMin)) * usableHeight;
                return `${x},${y}`;
              }).join(' ')}
            />
            {waterTemps.map((t, i) => {
              const x = i * (barWidth + barGap) + barGap / 2 + barWidth / 2;
              const y = topPad + usableHeight - ((t - tempMin) / (tempMax - tempMin)) * usableHeight;
              return (
                <g key={`temp-${i}`}>
                  <circle cx={x} cy={y} r={2.5} fill="#38bdf8" opacity={0.7} />
                  <text
                    x={x}
                    y={y - 6}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize={8}
                    fontFamily="monospace"
                    opacity={0.6}
                  >
                    {t}°
                  </text>
                </g>
              );
            })}
            <text x={chartWidth - 4} y={topPad + 4} textAnchor="end" fill="#38bdf8" fontSize={8} fontFamily="monospace" opacity={0.4}>
              H₂O°F
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
