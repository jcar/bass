'use client';

interface ConfidenceGaugeProps {
  value: number; // 0-100
  label: string;
  size?: number;
}

export default function ConfidenceGauge({ value, label, size = 160 }: ConfidenceGaugeProps) {
  const radius = (size - 20) / 2;
  const center = size / 2;
  // Arc from 225deg to -45deg (270deg sweep)
  const sweepAngle = 270;
  const startAngle = 135; // degrees from top, clockwise
  const filledAngle = (value / 100) * sweepAngle;

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const start = polarToCartesian(cx, cy, r, endDeg);
    const end = polarToCartesian(cx, cy, r, startDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  const bgArc = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);
  const fillArc = filledAngle > 0
    ? describeArc(center, center, radius, startAngle, startAngle + filledAngle)
    : '';

  const color = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : value >= 25 ? '#f97316' : '#ef4444';
  const rating = value >= 80 ? 'ELITE' : value >= 60 ? 'GOOD' : value >= 40 ? 'FAIR' : 'TOUGH';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = startAngle + (tick / 100) * sweepAngle;
          const outer = polarToCartesian(center, center, radius + 6, angle);
          const inner = polarToCartesian(center, center, radius - 6, angle);
          return (
            <line key={tick} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
              stroke="#475569" strokeWidth="2" />
          );
        })}
        {/* Background arc */}
        <path d={bgArc} fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
        {/* Filled arc */}
        {fillArc && (
          <path d={fillArc} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
        )}
        {/* Center text */}
        <text x={center} y={center - 8} textAnchor="middle" fill={color}
          fontSize="32" fontWeight="bold" fontFamily="monospace">{value}</text>
        <text x={center} y={center + 14} textAnchor="middle" fill="#94a3b8"
          fontSize="11" fontWeight="600" fontFamily="monospace">{rating}</text>
      </svg>
      <span className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">{label}</span>
    </div>
  );
}
