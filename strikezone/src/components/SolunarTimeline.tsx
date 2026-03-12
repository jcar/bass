'use client';

import { useEffect, useState } from 'react';
import type { BiteWindow } from '@/lib/types';

interface SolunarTimelineProps {
  windows: BiteWindow[];
}

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
}

export default function SolunarTimeline({ windows }: SolunarTimelineProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const timelineStart = 0;   // midnight
  const timelineEnd = 1440;  // midnight next day
  const nowPct = ((currentMinute - timelineStart) / (timelineEnd - timelineStart)) * 100;

  // Find next window
  let nextWindow: { window: BiteWindow; minutesUntil: number } | null = null;
  for (const w of windows) {
    const wStart = w.startHour * 60 + w.startMinute;
    const wEnd = wStart + w.durationMinutes;
    if (currentMinute < wStart) {
      const diff = wStart - currentMinute;
      if (!nextWindow || diff < nextWindow.minutesUntil) {
        nextWindow = { window: w, minutesUntil: diff };
      }
    } else if (currentMinute >= wStart && currentMinute <= wEnd) {
      nextWindow = { window: w, minutesUntil: 0 };
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Solunar Peaks</h3>
        {nextWindow && (
          <span className="text-xs font-mono text-sky-400">
            {nextWindow.minutesUntil === 0
              ? `IN ${nextWindow.window.phase.toUpperCase()} PEAK NOW`
              : `Next: ${Math.floor(nextWindow.minutesUntil / 60)}h ${nextWindow.minutesUntil % 60}m`}
          </span>
        )}
      </div>

      {/* Timeline bar */}
      <div className="relative h-10 bg-slate-900/60 rounded-lg overflow-hidden mb-3">
        {/* Hour markers */}
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
          <div key={h} className="absolute top-0 bottom-0 border-l border-slate-700/50"
            style={{ left: `${(h / 24) * 100}%` }}>
            <span className="absolute -bottom-4 left-0 text-[8px] text-slate-500 font-mono -translate-x-1/2">
              {h === 0 ? '12A' : h === 12 ? '12P' : h < 12 ? `${h}A` : `${h - 12}P`}
            </span>
          </div>
        ))}

        {/* Bite windows */}
        {windows.map((w, i) => {
          const startPct = ((w.startHour * 60 + w.startMinute) / 1440) * 100;
          const widthPct = (w.durationMinutes / 1440) * 100;
          const isMajor = w.phase === 'major';
          return (
            <div
              key={i}
              className="absolute top-1 bottom-1 rounded"
              style={{
                left: `${startPct}%`,
                width: `${widthPct}%`,
                background: isMajor
                  ? 'linear-gradient(to bottom, #10b98160, #10b98130)'
                  : 'linear-gradient(to bottom, #38bdf840, #38bdf820)',
                border: `1px solid ${isMajor ? '#10b98180' : '#38bdf860'}`,
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono uppercase tracking-wider"
                style={{ color: isMajor ? '#10b981' : '#38bdf8' }}>
                {isMajor ? 'MAJ' : 'MIN'}
              </span>
            </div>
          );
        })}

        {/* Current time indicator */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${nowPct}%` }}>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
        </div>
      </div>

      {/* Window details */}
      <div className="grid grid-cols-2 gap-2 mt-6">
        {windows.map((w, i) => {
          const startMin = w.startHour * 60 + w.startMinute;
          const endMin = startMin + w.durationMinutes;
          const isActive = currentMinute >= startMin && currentMinute <= endMin;
          const isMajor = w.phase === 'major';
          return (
            <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-mono
              ${isActive ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-900/40'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                style={{ background: isMajor ? '#10b981' : '#38bdf8' }} />
              <span className={isMajor ? 'text-emerald-400' : 'text-sky-400'}>
                {w.phase.toUpperCase()}
              </span>
              <span className="text-slate-500 ml-auto">
                {formatTime(w.startHour, w.startMinute)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
