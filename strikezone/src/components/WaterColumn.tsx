'use client';

import type { FishPosition, FrontalSystem, Season } from '@/lib/types';
import { FRONTAL_BADGE } from '@/lib/theme';

interface DepthPoint {
  hour: number;
  depth: number;
}

interface WaterColumnProps {
  fishPosition: FishPosition;
  fishDepth: number;
  frontalSystem: FrontalSystem;
  waterTemp: number;
  depthRange: { min: number; max: number };
  lakeMaxDepth?: number;
  season?: Season;
  windSpeed?: number;
  skyCondition?: string;
  waterClarity?: string;
  depthCurve?: DepthPoint[];
}

// Position label mapping
const positionInfo: Record<FishPosition, { label: string; detail: string }> = {
  shallow: { label: 'Shallow', detail: 'Fish are shallow and active. Cover water quickly.' },
  'mid-column': { label: 'Mid-Column', detail: 'Fish are off bottom, relating to bait or structure edges.' },
  suspended: { label: 'Suspended', detail: 'Fish are between zones. Check multiple depths.' },
  deep: { label: 'Deep', detail: 'Fish are tight to structure. Drag baits along bottom.' },
};

export default function WaterColumn({
  fishPosition, fishDepth, frontalSystem, waterTemp, depthRange, lakeMaxDepth,
  windSpeed = 0, skyCondition = 'partly-cloudy', waterClarity = 'stained',
  depthCurve,
}: WaterColumnProps) {
  // Dynamic scale: fit to the lake depth or seasonal range
  const scaleMin = 0;
  const scaleMax = lakeMaxDepth
    ? Math.max(lakeMaxDepth + 3, fishDepth + 3)
    : Math.max(depthRange.max + 8, fishDepth + 5);
  const scaleRange = scaleMax - scaleMin;
  const isShallowLake = lakeMaxDepth !== undefined && lakeMaxDepth <= 25;

  // Convert depth to Y percentage (0% = surface, ~90% = bottom of scale)
  const toY = (depth: number) => 4 + ((depth - scaleMin) / scaleRange) * 84;

  const fishY = toY(fishDepth);

  // Strike zone: 2ft above fish to fish depth (or slightly below for bottom fish)
  const strikeTop = Math.max(depthRange.min - 1, fishDepth - 3);
  const strikeBot = fishPosition === 'deep' ? fishDepth + 1 : fishDepth + 2;
  const strikeTopY = toY(strikeTop);
  const strikeBotY = toY(strikeBot);

  // Thermocline — only when stratification occurs (warm water + deep enough lake)
  const canStratify = !lakeMaxDepth || lakeMaxDepth >= 25;
  const showThermocline = waterTemp > 72 && canStratify;
  const thermoclineDepth = waterTemp > 82 ? 16 : waterTemp > 75 ? 20 : 24;
  const thermoclineY = toY(thermoclineDepth);

  // Lake bottom position (if known)
  const showLakeBottom = lakeMaxDepth !== undefined && lakeMaxDepth > 0;
  const lakeBottomY = showLakeBottom ? toY(lakeMaxDepth) : 100;

  // Seasonal depth zone
  const zoneTopY = toY(depthRange.min);
  const zoneBotY = toY(depthRange.max);

  // Depth scale labels — adaptive step
  const step = scaleMax <= 15 ? 2 : scaleMax <= 25 ? 5 : 10;
  const depthLabels: { depth: number; y: number }[] = [];
  for (let d = 0; d <= scaleMax; d += step) {
    depthLabels.push({ depth: d, y: toY(d) });
  }

  // Determine cover zone based on clarity
  const coverNote = waterClarity === 'muddy'
    ? 'Muddy: Fish within 2ft of cover'
    : waterClarity === 'clear'
      ? 'Clear: Fish may hold 5-10ft off structure'
      : 'Stained: Fish hold tight to cover';

  // Presentation tip based on fish position and lake type
  let presentationTip: string;
  if (isShallowLake) {
    presentationTip = fishPosition === 'deep'
      ? 'Shallow lake — drag baits tight to cover on bottom'
      : fishPosition === 'shallow'
        ? 'Shallow lake — topwater and shallow cranks over cover'
        : 'Shallow lake — fish relate to cover, not depth. Target structure.';
  } else {
    presentationTip = fishPosition === 'deep'
      ? 'Drag or hop bait on bottom'
      : fishPosition === 'shallow'
        ? 'Topwater or shallow running baits'
        : fishPosition === 'suspended'
          ? 'Count bait down to target depth'
          : 'Work multiple levels of water column';
  }

  const badge = FRONTAL_BADGE[frontalSystem];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Water Column</h3>
        <span className="text-xs font-mono px-1.5 py-0.5 rounded"
          style={{ background: `${badge.color}15`, color: badge.color, border: `1px solid ${badge.color}30` }}>
          {badge.label}
        </span>
      </div>

      {/* Visualization */}
      <div className="relative flex-1 min-h-[280px]"
        style={{
          background: `linear-gradient(to bottom,
            #0e4d6e 0%,
            #0c3d5a ${toY(depthRange.min) - 5}%,
            #0a2d46 ${toY(depthRange.min)}%,
            #081f32 ${toY(depthRange.max)}%,
            #06141f 100%)`,
        }}>

        {/* Surface ripples */}
        <div className="absolute top-0 left-0 right-0 h-5 opacity-30 overflow-hidden">
          <svg width="100%" height="20" preserveAspectRatio="none">
            <path d="M0,10 Q25,3 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.7">
              <animate attributeName="d" values="M0,10 Q25,3 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10;M0,10 Q25,17 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10;M0,10 Q25,3 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10" dur="3s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>

        {/* Depth scale — left side ruler */}
        {depthLabels.map(({ depth, y }) => (
          <div key={depth} className="absolute left-0 flex items-center" style={{ top: `${y}%`, transform: 'translateY(-50%)' }}>
            <div className="w-2 border-t border-sky-700/30" />
            <span className="text-xs font-mono text-sky-600/50 ml-1 tabular-nums">{depth}</span>
          </div>
        ))}
        {depthLabels.map(({ depth, y }) => (
          <div key={`g-${depth}`} className="absolute left-8 right-0 border-t border-sky-900/15"
            style={{ top: `${y}%` }} />
        ))}

        {/* Seasonal depth zone band */}
        <div className="absolute left-8 right-0 border-y border-emerald-500/20"
          style={{ top: `${zoneTopY}%`, height: `${zoneBotY - zoneTopY}%`, background: 'rgba(16,185,129,0.03)' }}>
          <span className="absolute right-2 top-1 text-[7px] font-mono text-emerald-500/30 uppercase">
            Seasonal Zone
          </span>
          {/* Min depth label */}
          <span className="absolute left-2 -top-3 text-xs font-mono text-emerald-500/40">
            {depthRange.min}ft
          </span>
          {/* Max depth label */}
          <span className="absolute left-2 -bottom-3 text-xs font-mono text-emerald-500/40">
            {depthRange.max}ft
          </span>
        </div>

        {/* Strike Zone highlight — where you need to present your bait */}
        <div className="absolute left-10 right-4 rounded border border-emerald-400/25"
          style={{
            top: `${strikeTopY}%`,
            height: `${strikeBotY - strikeTopY}%`,
            background: 'linear-gradient(to bottom, rgba(16,185,129,0.08), rgba(16,185,129,0.15))',
          }}>
          <div className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-emerald-400/40 rounded" />
          <span className="absolute -right-0 top-1/2 -translate-y-1/2 text-[7px] font-mono text-emerald-400/60 uppercase tracking-wider"
            style={{ writingMode: 'vertical-rl' }}>
            Strike Zone
          </span>
        </div>

        {/* Thermocline */}
        {showThermocline && (
          <div className="absolute left-8 right-0" style={{ top: `${thermoclineY}%` }}>
            <svg width="100%" height="6" className="overflow-visible">
              <line x1="0" y1="3" x2="100%" y2="3" stroke="#f97316" strokeWidth="1" strokeDasharray="6,4" opacity="0.4" />
            </svg>
            <span className="absolute right-2 -top-3 text-xs font-mono text-orange-400/50">
              Thermocline ~{thermoclineDepth}ft
            </span>
          </div>
        )}

        {/* Lake bottom indicator — positioned at actual lake depth */}
        {showLakeBottom && (
          <div className="absolute left-8 right-0" style={{ top: `${lakeBottomY}%` }}>
            <div className="border-t-2 border-amber-800/40" style={{ borderStyle: 'solid' }} />
            <span className="absolute right-2 -top-4 text-xs font-mono text-amber-600/50">
              Lake Bottom {lakeMaxDepth}ft
            </span>
          </div>
        )}

        {/* Bottom structure — positioned at lake bottom or visual bottom */}
        <svg className="absolute left-0 right-0 h-12" preserveAspectRatio="none" viewBox="0 0 300 40"
          style={showLakeBottom ? { top: `calc(${lakeBottomY}% - 12px)` } : { bottom: 0 }}>
          {/* Main bottom contour */}
          <path d="M0,40 L0,28 Q20,18 45,25 Q70,32 100,20 Q130,12 160,22 Q190,30 220,15 Q250,25 280,20 L300,22 L300,40 Z"
            fill="#141e2a" stroke="#1e3040" strokeWidth="0.8" />
          {/* Rocks/rubble */}
          <circle cx="35" cy="30" r="2.5" fill="#1a2838" stroke="#253548" strokeWidth="0.5" />
          <circle cx="110" cy="22" r="3" fill="#1a2838" stroke="#253548" strokeWidth="0.5" />
          <circle cx="165" cy="26" r="2" fill="#1a2838" stroke="#253548" strokeWidth="0.5" />
          <circle cx="235" cy="20" r="2.5" fill="#1a2838" stroke="#253548" strokeWidth="0.5" />
          {/* Stumps */}
          <line x1="75" y1="28" x2="75" y2="20" stroke="#253548" strokeWidth="1.5" />
          <line x1="73" y1="22" x2="78" y2="19" stroke="#253548" strokeWidth="1" />
          <line x1="200" y1="24" x2="200" y2="16" stroke="#253548" strokeWidth="1.5" />
          <line x1="198" y1="18" x2="203" y2="15" stroke="#253548" strokeWidth="1" />
        </svg>

        {/* Depth curve — shows fish depth variation over the day */}
        {depthCurve && depthCurve.length > 0 && (() => {
          const curveMin = Math.min(...depthCurve.map(p => p.depth));
          const curveMax = Math.max(...depthCurve.map(p => p.depth));
          const currentHour = new Date().getHours();
          // Build SVG path: X = hour (0-23 mapped to 15%-85% width), Y = depth mapped to water column
          const points = depthCurve.map(p => {
            const x = 15 + (p.hour / 23) * 70; // 15-85% of width
            const y = toY(p.depth);
            return `${x},${y}`;
          });
          const pathD = `M${points.join(' L')}`;
          // Fill area under curve
          const fillD = `M${points[0].split(',')[0]},${toY(curveMin - 0.5)} L${points.join(' L')} L${points[points.length - 1].split(',')[0]},${toY(curveMin - 0.5)} Z`;
          // Current hour marker position
          const cx = 15 + (currentHour / 23) * 70;
          const cy = toY(fishDepth);
          return (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              {/* Filled area showing depth range over day */}
              <path d={fillD} fill="rgba(16,185,129,0.06)" />
              {/* The curve line */}
              <path d={pathD} fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5" strokeLinejoin="round" />
              {/* Current hour dot */}
              <circle cx={`${cx}%`} cy={`${cy}%`} r="4" fill="#10b981" stroke="#34d399" strokeWidth="1" opacity="0.9">
                <animate attributeName="r" values="4;5.5;4" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Dawn/dusk time labels */}
              <text x="15%" y="99%" fill="#38bdf8" opacity="0.25" fontSize="8" fontFamily="monospace" textAnchor="middle">12a</text>
              <text x={`${15 + (6/23)*70}%`} y="99%" fill="#f59e0b" opacity="0.3" fontSize="8" fontFamily="monospace" textAnchor="middle">6a</text>
              <text x={`${15 + (12/23)*70}%`} y="99%" fill="#38bdf8" opacity="0.25" fontSize="8" fontFamily="monospace" textAnchor="middle">12p</text>
              <text x={`${15 + (18/23)*70}%`} y="99%" fill="#f59e0b" opacity="0.3" fontSize="8" fontFamily="monospace" textAnchor="middle">6p</text>
              <text x="85%" y="99%" fill="#38bdf8" opacity="0.25" fontSize="8" fontFamily="monospace" textAnchor="middle">11p</text>
            </svg>
          );
        })()}

        {/* The fish group — positioned at calculated depth */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-in-out"
          style={{ top: `${fishY}%`, transform: 'translate(-50%, -50%)' }}
        >
          {/* Glow ring */}
          <div className="absolute -inset-4 rounded-full bg-emerald-500/10 blur-lg animate-pulse" />

          {/* Fish group */}
          <div className="relative flex items-center gap-0.5">
            {/* Lead fish */}
            <svg width="32" height="20" viewBox="0 0 32 20" className="relative">
              <path d="M6,10 Q10,2 20,5 L28,10 L20,15 Q10,18 6,10 Z"
                fill="#10b981" stroke="#34d399" strokeWidth="0.5" opacity="0.9" />
              <circle cx="22" cy="9" r="1.2" fill="#0f172a" />
              <path d="M3,5 Q6,10 3,15" fill="none" stroke="#10b981" strokeWidth="1.2" />
            </svg>
            {/* Trailing fish */}
            <svg width="22" height="14" viewBox="0 0 32 20" className="relative -ml-2 opacity-60">
              <path d="M6,10 Q10,2 20,5 L28,10 L20,15 Q10,18 6,10 Z"
                fill="#10b981" stroke="#34d399" strokeWidth="0.5" />
              <path d="M3,5 Q6,10 3,15" fill="none" stroke="#10b981" strokeWidth="1" />
            </svg>
            <svg width="18" height="12" viewBox="0 0 32 20" className="relative -ml-1.5 opacity-40">
              <path d="M6,10 Q10,2 20,5 L28,10 L20,15 Q10,18 6,10 Z"
                fill="#10b981" stroke="#34d399" strokeWidth="0.5" />
              <path d="M3,5 Q6,10 3,15" fill="none" stroke="#10b981" strokeWidth="1" />
            </svg>
          </div>

          {/* Depth callout — shows current depth + daily range */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-4 border-t border-emerald-400/40" />
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
              <span className="text-sm font-mono font-bold text-emerald-400">{fishDepth}</span>
              <span className="text-xs font-mono text-emerald-400/60">ft</span>
              {depthCurve && depthCurve.length > 0 && (() => {
                const curveMin = Math.min(...depthCurve.map(p => p.depth));
                const curveMax = Math.max(...depthCurve.map(p => p.depth));
                return curveMin !== curveMax ? (
                  <span className="text-xs font-mono text-emerald-400/40 ml-1">
                    ({curveMin}-{curveMax})
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        </div>

        {/* Surface label */}
        <div className="absolute top-1 right-2 text-xs font-mono text-sky-500/30">0ft</div>
      </div>

      {/* Info panel below the visualization */}
      <div className="border-t border-slate-700/50 bg-slate-900/40 px-4 py-3 space-y-2.5">
        {/* Fish position + depth */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-white">{positionInfo[fishPosition].label}</span>
            <span className="text-xs text-slate-500">now</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{fishDepth}ft</span>
            {depthCurve && depthCurve.length > 0 && (() => {
              const curveMin = Math.min(...depthCurve.map(p => p.depth));
              const curveMax = Math.max(...depthCurve.map(p => p.depth));
              return curveMin !== curveMax ? (
                <span className="text-xs font-mono text-slate-500">({curveMin}-{curveMax}ft today)</span>
              ) : null;
            })()}
          </div>
          <span className="text-xs font-mono text-slate-500">{waterTemp}°F</span>
        </div>

        {/* Key insight line */}
        <p className="text-[11px] text-slate-400 leading-relaxed">{positionInfo[fishPosition].detail}</p>

        {/* Quick reference chips */}
        <div className="flex flex-wrap gap-1.5">
          <InfoChip label="Present" value={presentationTip} />
          <InfoChip label="Cover" value={coverNote} />
          {showThermocline && <InfoChip label="Thermocline" value={`~${thermoclineDepth}ft`} />}
          {windSpeed >= 10 && <InfoChip label="Wind" value="Fish windblown side shallower" />}
          {frontalSystem === 'post-frontal' && <InfoChip label="Post-Front" value="Tight to cover, downsize baits" />}
          {frontalSystem === 'pre-frontal' && <InfoChip label="Pre-Front" value="Moving up and feeding aggressively" />}
        </div>
      </div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 bg-slate-800/60 rounded px-1.5 py-0.5">
      <span className="text-xs font-mono text-slate-600 uppercase">{label}:</span>
      <span className="text-xs font-mono text-slate-400">{value}</span>
    </div>
  );
}
