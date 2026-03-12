'use client';

import type { PressureTrend } from '@/lib/types';

interface PressureIndicatorProps {
  pressure: number;
  trend: PressureTrend;
}

const trendData: Record<PressureTrend, { label: string; color: string; arrow: string; impact: string }> = {
  falling: {
    label: 'FALLING',
    color: '#10b981',
    arrow: 'M12,4 L12,20 M6,14 L12,20 L18,14',
    impact: 'Fish moving up, feeding aggressively. Prime bite window.',
  },
  rising: {
    label: 'RISING',
    color: '#ef4444',
    arrow: 'M12,20 L12,4 M6,10 L12,4 L18,10',
    impact: 'Fish retreating to cover. Slow presentations needed.',
  },
  steady: {
    label: 'STEADY',
    color: '#38bdf8',
    arrow: 'M4,12 L20,12 M14,6 L20,12 L14,18',
    impact: 'Stable conditions. Consistent, predictable patterns.',
  },
};

export default function PressureIndicator({ pressure, trend }: PressureIndicatorProps) {
  const data = trendData[trend];

  // Mini sparkline showing pressure range
  const normalizedPressure = Math.max(0, Math.min(100, ((pressure - 29.4) / 1.2) * 100));

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Barometric Pressure</h3>

      <div className="flex items-center gap-4">
        {/* Animated arrow indicator */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="11" fill="none" stroke={`${data.color}30`} strokeWidth="1.5" />
            <path d={data.arrow} fill="none" stroke={data.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{pressure.toFixed(2)}</span>
            <span className="text-xs text-slate-500">inHg</span>
          </div>
          <div className="text-xs font-mono font-bold mt-0.5" style={{ color: data.color }}>
            {data.label}
          </div>
        </div>
      </div>

      {/* Pressure gauge bar */}
      <div className="mt-3 relative h-2 bg-slate-900 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${normalizedPressure}%`,
            background: `linear-gradient(to right, #ef4444, #f59e0b, #10b981)`,
          }} />
        {/* Range labels */}
        <div className="absolute -bottom-3.5 left-0 text-[8px] font-mono text-slate-600">29.40</div>
        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-600">30.00</div>
        <div className="absolute -bottom-3.5 right-0 text-[8px] font-mono text-slate-600">30.60</div>
      </div>

      <p className="text-[11px] text-slate-400 mt-5 leading-relaxed">{data.impact}</p>
    </div>
  );
}
