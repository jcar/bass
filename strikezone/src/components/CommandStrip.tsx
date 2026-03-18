'use client';

import type { StrikeAnalysis, DayForecast } from '@/lib/types';
import BiteGauge from './BiteGauge';
import SolunarCountdown from './SolunarCountdown';
import BiteForecast from './BiteForecast';

interface CommandStripProps {
  analysis: StrikeAnalysis;
  prevBiteIntensity?: number;
  analyses: StrikeAnalysis[];
  forecast: DayForecast[];
  selectedDay: number;
  onDaySelect: (index: number) => void;
}

export default function CommandStrip({
  analysis,
  prevBiteIntensity,
  analyses,
  forecast,
  selectedDay,
  onDaySelect,
}: CommandStripProps) {
  return (
    <div className="border-b border-slate-800/50 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Desktop: horizontal 3 zones */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Left: Bite Gauge */}
          <div className="flex-shrink-0 flex items-center">
            <BiteGauge
              score={analysis.biteIntensity}
              biteFactors={analysis.biteFactors}
              prevBiteIntensity={prevBiteIntensity}
            />
          </div>

          {/* Center: Compact 7-day forecast */}
          <div className="flex-1 min-w-0 flex items-center">
            {analyses.length > 0 && forecast.length > 0 && (
              <div className="w-full">
                <BiteForecast
                  analyses={analyses}
                  forecast={forecast}
                  selectedDay={selectedDay}
                  onDaySelect={onDaySelect}
                  compact
                />
              </div>
            )}
          </div>

          {/* Right: Solunar countdown */}
          <div className="flex-shrink-0 flex items-center">
            <SolunarCountdown windows={analysis.biteWindows} />
          </div>
        </div>
      </div>
    </div>
  );
}
