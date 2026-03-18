'use client';

import ScoreBreakdown from './ScoreBreakdown';
import type { ScoreFactor } from '@/lib/types';

interface BiteGaugeProps {
  score: number;
  biteFactors: ScoreFactor[];
  /** Size of the SVG gauge in px */
  size?: number;
  /** Previous day's bite intensity for delta badge */
  prevBiteIntensity?: number;
}

function getVerdict(score: number): { label: string; sub: string; color: string; glow: string } {
  if (score >= 90) return { label: "They're Eating Everything", sub: 'Get on the water now.', color: '#10b981', glow: 'rgba(16,185,129,0.15)' };
  if (score >= 75) return { label: 'Go Fish', sub: 'Strong conditions. Cover water.', color: '#10b981', glow: 'rgba(16,185,129,0.10)' };
  if (score >= 60) return { label: 'Good Bite', sub: 'Fish are feeding. Be efficient.', color: '#38bdf8', glow: 'rgba(56,189,248,0.08)' };
  if (score >= 45) return { label: 'Gotta Work For It', sub: 'Downsize and slow down.', color: '#f59e0b', glow: 'rgba(245,158,11,0.08)' };
  if (score >= 30) return { label: 'Tough Bite', sub: 'Target tight to cover. Finesse.', color: '#f97316', glow: 'rgba(249,115,22,0.08)' };
  return { label: 'Lockjaw', sub: 'Smallest bait you own. Patience.', color: '#ef4444', glow: 'rgba(239,68,68,0.08)' };
}

export { getVerdict };

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, endDeg);
  const e = polarToCartesian(cx, cy, r, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

export default function BiteGauge({ score, biteFactors, size = 80, prevBiteIntensity }: BiteGaugeProps) {
  const verdict = getVerdict(score);
  const radius = (size - 12) / 2;
  const center = size / 2;
  const sweepAngle = 270;
  const startAngle = 135;
  const filledAngle = (score / 100) * sweepAngle;

  const bgArc = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);
  const fillArc = filledAngle > 0 ? describeArc(center, center, radius, startAngle, startAngle + filledAngle) : '';
  const biteDelta = prevBiteIntensity != null ? score - prevBiteIntensity : null;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = startAngle + (tick / 100) * sweepAngle;
            const outer = polarToCartesian(center, center, radius + 3, angle);
            const inner = polarToCartesian(center, center, radius - 3, angle);
            return <line key={tick} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#475569" strokeWidth="1" />;
          })}
          <path d={bgArc} fill="none" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
          {fillArc && (
            <path d={fillArc} fill="none" stroke={verdict.color} strokeWidth="7" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${verdict.color}60)` }} />
          )}
          <text x={center} y={center - 2} textAnchor="middle" fill={verdict.color}
            fontSize="20" fontWeight="bold" fontFamily="monospace">{score}</text>
          <text x={center} y={center + 10} textAnchor="middle" fill="#94a3b8"
            fontSize="7" fontWeight="600" fontFamily="monospace" letterSpacing="0.05em">BITE</text>
        </svg>
        <div className="absolute top-0 right-0">
          <ScoreBreakdown factors={biteFactors} title="What's Driving the Bite" />
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="text-sm font-bold text-white leading-tight">{verdict.label}</div>
          {biteDelta != null && biteDelta !== 0 && (
            <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded ${
              biteDelta > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {biteDelta > 0 ? '↑' : '↓'}{Math.abs(biteDelta)}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">{verdict.sub}</div>
      </div>
    </div>
  );
}
