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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
        {/* Mobile: row 1 = gauge + solunar, row 2 = forecast
            Desktop: horizontal 3 zones via sm:contents */}
        <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3">
          {/* Gauge + Solunar share row 1 on mobile, act as independent flex children on desktop */}
          <div className="flex sm:contents items-center gap-3 w-full sm:w-auto">
            <div className="flex-shrink-0 flex items-center">
              <BiteGauge
                score={analysis.biteIntensity}
                biteFactors={analysis.biteFactors}
                prevBiteIntensity={prevBiteIntensity}
              />
            </div>
            <div className="flex-shrink-0 flex items-center ml-auto sm:ml-0 sm:order-last">
              <SolunarCountdown windows={analysis.biteWindows} />
            </div>
          </div>

          {/* Forecast — full width row 2 on mobile, center on desktop */}
          <div className="flex-1 min-w-0 overflow-hidden flex items-center w-full sm:w-auto">
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
        </div>
      </div>
    </div>
  );
}
