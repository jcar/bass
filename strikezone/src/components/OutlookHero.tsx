'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { StrikeAnalysis, ScoreFactor, BiteWindow } from '@/lib/types';
import ScoreBreakdown from './ScoreBreakdown';

interface OutlookHeroProps {
  analysis: StrikeAnalysis;
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

const impactDot: Record<string, string> = {
  positive: 'bg-emerald-400',
  neutral: 'bg-slate-500',
  negative: 'bg-rose-400',
};

const impactText: Record<string, string> = {
  positive: 'text-emerald-400',
  neutral: 'text-slate-500',
  negative: 'text-rose-400',
};

const positionLabels: Record<string, string> = {
  surface: 'Surface',
  suspended: 'Suspended',
  transitioning: 'Transitioning',
  bottom: 'Bottom',
};

const trendIcons: Record<string, React.ReactNode> = {
  falling: <ArrowDown className="w-3 h-3 text-emerald-400" />,
  rising: <ArrowUp className="w-3 h-3 text-rose-400" />,
  steady: <Minus className="w-3 h-3 text-sky-400" />,
};

function useNextPeak(windows: BiteWindow[]): { label: string; phase: string; color: string } | null {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const currentMin = now.getHours() * 60 + now.getMinutes();

  for (const w of [...windows].sort((a, b) => (a.startHour * 60 + a.startMinute) - (b.startHour * 60 + b.startMinute))) {
    const wStart = w.startHour * 60 + w.startMinute;
    const wEnd = wStart + w.durationMinutes;
    const isMajor = w.phase === 'major';
    const color = isMajor ? '#10b981' : '#38bdf8';
    const phase = isMajor ? 'Major' : 'Minor';

    if (currentMin >= wStart && currentMin <= wEnd) {
      const left = wEnd - currentMin;
      return { label: `In ${phase} Peak — ${left}m left`, phase, color };
    }
    if (currentMin < wStart) {
      const diff = wStart - currentMin;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      const time = h > 0 ? `${h}h ${m}m` : `${m}m`;
      return { label: `${phase} Peak in ${time}`, phase, color };
    }
  }
  return null;
}

function FactorBar({ factor }: { factor: ScoreFactor }) {
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

export default function OutlookHero({ analysis, prevBiteIntensity }: OutlookHeroProps) {
  const score = analysis.biteIntensity;
  const verdict = getVerdict(score);
  const nextPeak = useNextPeak(analysis.biteWindows);
  const biteDelta = prevBiteIntensity != null ? score - prevBiteIntensity : null;

  // Ring gauge math
  const size = 130;
  const radius = (size - 16) / 2;
  const center = size / 2;
  const sweepAngle = 270;
  const startAngle = 135;
  const filledAngle = (score / 100) * sweepAngle;

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

  const bgArc = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);
  const fillArc = filledAngle > 0 ? describeArc(center, center, radius, startAngle, startAngle + filledAngle) : '';

  // Top 3 tactical notes
  const topNotes = analysis.tacticalNotes.slice(0, 3);

  return (
    <div
      className="border border-slate-700 rounded-lg overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${verdict.glow}, transparent 60%), rgba(30,41,59,0.5)` }}
    >
      <div className="p-4 sm:p-5">
        {/* Top row: Score + Verdict + Season strip */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* LEFT: Bite Rating gauge + verdict */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {[0, 25, 50, 75, 100].map((tick) => {
                  const angle = startAngle + (tick / 100) * sweepAngle;
                  const outer = polarToCartesian(center, center, radius + 4, angle);
                  const inner = polarToCartesian(center, center, radius - 4, angle);
                  return <line key={tick} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#475569" strokeWidth="1.5" />;
                })}
                <path d={bgArc} fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                {fillArc && (
                  <path d={fillArc} fill="none" stroke={verdict.color} strokeWidth="10" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 8px ${verdict.color}60)` }} />
                )}
                <text x={center} y={center - 6} textAnchor="middle" fill={verdict.color}
                  fontSize="28" fontWeight="bold" fontFamily="monospace">{score}</text>
                <text x={center} y={center + 12} textAnchor="middle" fill="#94a3b8"
                  fontSize="9" fontWeight="600" fontFamily="monospace" letterSpacing="0.05em">BITE RATING</text>
              </svg>
              <div className="absolute top-1 right-1">
                <ScoreBreakdown factors={analysis.biteFactors} title="What's Driving the Bite" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-white leading-tight">{verdict.label}</div>
                {biteDelta != null && biteDelta !== 0 && (
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    biteDelta > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {biteDelta > 0 ? '↑' : '↓'}{Math.abs(biteDelta)} vs yesterday
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{verdict.sub}</div>
              {/* Season + Depth */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {analysis.seasonalPhase.label}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {analysis.seasonalPhase.depthRange.min}-{analysis.seasonalPhase.depthRange.max}ft range
                </span>
              </div>
              {/* Fish Depth + Position */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-mono font-bold text-white">{analysis.fishDepth}</span>
                  <span className="text-xs text-slate-500">ft</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{positionLabels[analysis.fishPosition]}</span>
                <div className="relative">
                  <ScoreBreakdown factors={analysis.depthFactors} title="What's Driving Fish Depth" mode="list" />
                </div>
                {/* Pressure trend */}
                <div className="flex items-center gap-1 ml-auto lg:ml-2">
                  {trendIcons[analysis.pressureTrend]}
                  <span className="text-xs font-mono text-slate-500 capitalize">{analysis.pressureTrend}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE: Factor breakdown */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">What&apos;s Driving It</div>
            <div className="space-y-1.5">
              {analysis.biteFactors.map((f, i) => (
                <FactorBar key={i} factor={f} />
              ))}
            </div>
          </div>

          {/* RIGHT: Next peak + Tactical notes */}
          <div className="lg:w-64 flex-shrink-0 space-y-3">
            {/* Solunar countdown */}
            {nextPeak && (
              <div className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 border ${
                nextPeak.label.includes('In ') ? 'bg-emerald-500/10 border-emerald-500/30 animate-pulse' : 'bg-slate-900/50 border-slate-700/50'
              }`}>
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: nextPeak.color }} />
                <div>
                  <span className="text-sm font-mono font-bold block" style={{ color: nextPeak.color }}>
                    {nextPeak.label.includes('In ')
                      ? 'BITE WINDOW ACTIVE'
                      : nextPeak.label}
                  </span>
                  {nextPeak.label.includes('In ') && (
                    <span className="text-xs font-mono text-emerald-400/70">{nextPeak.label}</span>
                  )}
                </div>
              </div>
            )}

            {/* Top tactical notes */}
            {topNotes.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Game Plan</div>
                {topNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-500/70 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-slate-400 leading-snug">{note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Season description */}
            <p className="text-[11px] text-slate-500 leading-relaxed">{analysis.seasonalPhase.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
