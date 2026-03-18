'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import type { BiteWindow } from '@/lib/types';

interface SolunarCountdownProps {
  windows: BiteWindow[];
}

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

export default function SolunarCountdown({ windows }: SolunarCountdownProps) {
  const nextPeak = useNextPeak(windows);

  if (!nextPeak) return null;

  const isActive = nextPeak.label.includes('In ') && nextPeak.label.includes('left');

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
      isActive ? 'bg-emerald-500/10 border-emerald-500/30 animate-pulse' : 'bg-slate-900/50 border-slate-700/50'
    }`}>
      <Clock className="w-4 h-4 flex-shrink-0" style={{ color: nextPeak.color }} />
      <div className="min-w-0">
        <span className="text-xs font-mono font-bold block leading-tight" style={{ color: nextPeak.color }}>
          {isActive ? 'BITE WINDOW ACTIVE' : nextPeak.label}
        </span>
        {isActive && (
          <span className="text-[10px] font-mono text-emerald-400/70">{nextPeak.label}</span>
        )}
      </div>
    </div>
  );
}
