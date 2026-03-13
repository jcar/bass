'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Crosshair, AlertTriangle } from 'lucide-react';
import { loadTuning, saveTuning, resetTuning, type TuningConfig } from '@/lib/tuning';
import LakePicker from '@/components/LakePicker';
import type { WeatherConditions, StrikeAnalysis, DayForecast, Lake, WaterClarity } from '@/lib/types';
import { runStrikeAnalysis } from '@/lib/StrikeEngine';
import WaterColumn from '@/components/WaterColumn';
import ConditionsPanel from '@/components/ConditionsPanel';
import StructureTargets from '@/components/StructureTargets';
import OutlookHero from '@/components/OutlookHero';
import TuningPanel from '@/components/TuningPanel';
import AnglerPickCard from '@/components/AnglerPickCard';
import TacticalBriefing from '@/components/TacticalBriefing';
import { getBriefingsForAnalysis } from '@/lib/briefings';

const DEFAULT_CONDITIONS: WeatherConditions = {
  airTemp: 68,
  waterTemp: 62,
  windSpeed: 8,
  windDirection: 'SW',
  barometricPressure: 29.92,
  pressureTrend: 'steady',
  skyCondition: 'partly-cloudy',
  humidity: 65,
  waterClarity: 'stained',
  frontalSystem: 'stable',
};

function deriveFrontalSystem(days: DayForecast[], index: number): WeatherConditions['frontalSystem'] {
  if (index === 0 || days.length < 2) return 'stable';
  const prev = days[index - 1];
  const curr = days[index];
  const pressureDiff = curr.barometricPressure - prev.barometricPressure;
  const tempDiff = curr.airTemp - prev.airTemp;

  if (pressureDiff < -0.15 && tempDiff < -5) return 'cold-front';
  if (pressureDiff < -0.08) return 'pre-frontal';
  if (pressureDiff > 0.1 && prev.barometricPressure < 29.85) return 'post-frontal';
  return 'stable';
}

function derivePressureTrend(days: DayForecast[], index: number): WeatherConditions['pressureTrend'] {
  if (days.length < 2) return 'steady';
  const start = Math.max(0, index - 1);
  const end = Math.min(days.length - 1, index + 1);
  const diff = days[end].barometricPressure - days[start].barometricPressure;
  if (diff > 0.04) return 'rising';
  if (diff < -0.04) return 'falling';
  return 'steady';
}

export default function Dashboard() {
  const [conditions, setConditions] = useState<WeatherConditions>(DEFAULT_CONDITIONS);
  const [analysis, setAnalysis] = useState<StrikeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: '', lon: '', name: 'Detecting location...' });
  const [locationReady, setLocationReady] = useState(false);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [tuning, setTuning] = useState<TuningConfig>(() => loadTuning());
  const [lakeMaxDepth, setLakeMaxDepth] = useState(40);
  const [selectedLake, setSelectedLake] = useState<Lake | null>(null);
  const [gpsLocating, setGpsLocating] = useState(false);

  const handleLakeSelect = useCallback((lake: Lake) => {
    setSelectedLake(lake);
    if (lake.maxDepth) {
      setLakeMaxDepth(Math.min(lake.maxDepth, 80));
    }
    setLocation({
      lat: String(lake.lat),
      lon: String(lake.lon),
      name: `${lake.name}, ${lake.state}`,
    });
    setLocationReady(true);
  }, []);

  const handleLakeClear = useCallback(() => {
    setSelectedLake(null);
    setLakeMaxDepth(40);
  }, []);

  // Find and select the nearest lake to given coordinates
  const selectNearestLake = useCallback(async (lat: string, lon: string) => {
    try {
      const res = await fetch(`/api/lakes?lat=${lat}&lon=${lon}&limit=1&minAcres=50`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        handleLakeSelect(data[0]);
      }
    } catch {
      // Fall back to just using the coordinates
    }
  }, [handleLakeSelect]);

  const handleUseGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const lat = String(latitude);
        const lon = String(longitude);
        try {
          // Try to find the nearest lake to GPS coordinates
          await selectNearestLake(lat, lon);
        } catch {
          // Fall back to just coordinates
          setLocation({ lat, lon, name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` });
        } finally {
          setGpsLocating(false);
        }
      },
      () => { setGpsLocating(false); },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [selectNearestLake]);

  const handleTuningChange = useCallback((cfg: TuningConfig) => {
    setTuning(cfg);
    saveTuning(cfg);
  }, []);

  const handleTuningReset = useCallback(() => {
    const defaults = resetTuning();
    setTuning(defaults);
  }, []);

  const handleWaterClarityChange = useCallback((clarity: WaterClarity) => {
    setConditions((prev) => ({ ...prev, waterClarity: clarity }));
  }, []);

  const conditionsFromForecast = useCallback((days: DayForecast[], index: number): WeatherConditions => {
    const day = days[index];
    if (!day) return DEFAULT_CONDITIONS;
    return {
      airTemp: day.airTemp,
      waterTemp: day.waterTemp,
      windSpeed: day.windSpeed,
      windDirection: day.windDirection,
      barometricPressure: day.barometricPressure,
      pressureTrend: derivePressureTrend(days, index),
      skyCondition: day.skyCondition,
      humidity: day.humidity,
      waterClarity: conditions.waterClarity,
      frontalSystem: deriveFrontalSystem(days, index),
    };
  }, [conditions.waterClarity]);

  const fetchForecast = useCallback(async (lat: string, lon: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setForecast(data);
        setSelectedDay(0);
        const day = data[0];
        const trend = derivePressureTrend(data, 0);
        setConditions((prev) => ({
          ...prev,
          airTemp: day.airTemp,
          waterTemp: day.waterTemp,
          windSpeed: day.windSpeed,
          windDirection: day.windDirection,
          barometricPressure: day.barometricPressure,
          humidity: day.humidity,
          skyCondition: day.skyCondition,
          pressureTrend: trend,
          frontalSystem: 'stable',
        }));
      }
    } catch {
      // Keep current conditions on error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDaySelect = useCallback((index: number) => {
    setSelectedDay(index);
    if (forecast.length > 0) {
      const newConditions = conditionsFromForecast(forecast, index);
      setConditions(newConditions);
    }
  }, [forecast, conditionsFromForecast]);

  // Auto-detect location from IP on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/geoip');
        const data = await res.json();
        if (data.lat && data.lon) {
          const lat = String(data.lat);
          const lon = String(data.lon);
          setLocation({
            lat, lon,
            name: data.region
              ? `${data.city}, ${data.region}`
              : `${data.city}, ${data.country}`,
          });
          setLocationReady(true);
          await selectNearestLake(lat, lon);
        } else {
          setLocation({ lat: '35.96', lon: '-93.31', name: 'Table Rock Lake, MO' });
          setLocationReady(true);
        }
      } catch {
        setLocation({ lat: '35.96', lon: '-93.31', name: 'Table Rock Lake, MO' });
        setLocationReady(true);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch forecast when location is resolved
  useEffect(() => {
    if (locationReady && location.lat && location.lon) {
      fetchForecast(location.lat, location.lon);
    }
  }, [location.lat, location.lon, locationReady, fetchForecast]);

  // Re-run analysis when conditions change
  useEffect(() => {
    setAnalysis(runStrikeAnalysis(conditions, tuning, lakeMaxDepth));
  }, [conditions, tuning, lakeMaxDepth]);

  const briefings = useMemo(() => {
    if (!analysis) return [];
    const topLures = analysis.anglerPicks.map(p => p.lure.name);
    return getBriefingsForAnalysis(
      analysis.seasonalPhase.season,
      conditions.waterClarity,
      conditions.frontalSystem,
      topLures,
    );
  }, [analysis, conditions.waterClarity, conditions.frontalSystem]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-400 font-mono animate-pulse">Analyzing conditions...</div>
      </div>
    );
  }

  const currentDayForecast = forecast[selectedDay];
  const isFutureDay = selectedDay > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">StrikeZone</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">The Visual Bass Guide</p>
            </div>
          </div>

          <LakePicker
            selectedLake={selectedLake}
            onLakeSelect={handleLakeSelect}
            onClear={handleLakeClear}
            onUseGPS={handleUseGPS}
            gpsLocating={gpsLocating}
            locationName={location.name}
            forecast={forecast}
            selectedDay={selectedDay}
            onDaySelect={handleDaySelect}
            loading={loading}
            onRefresh={() => fetchForecast(location.lat, location.lon)}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Future day banner */}
        {isFutureDay && currentDayForecast && (
          <div className={`flex items-center gap-3 rounded-lg px-4 py-2.5 border text-xs font-mono
            ${currentDayForecast.isExtrapolated
              ? 'bg-amber-500/5 border-amber-500/20 text-amber-300/80'
              : 'bg-sky-500/5 border-sky-500/20 text-sky-300/80'
            }`}>
            <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${currentDayForecast.isExtrapolated ? 'text-amber-500' : 'text-sky-500'}`} />
            <div>
              <span className="font-semibold">
                {currentDayForecast.dayOfWeek}, {new Date(currentDayForecast.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
              {currentDayForecast.isExtrapolated
                ? <span className="text-amber-500/60 ml-2">Extended forecast -- extrapolated from trend data ({currentDayForecast.dataConfidence}% confidence)</span>
                : <span className="text-sky-500/60 ml-2">Forecast data ({currentDayForecast.dataConfidence}% confidence)</span>
              }
            </div>
          </div>
        )}

        {/* Outlook Hero — the one-glance game plan */}
        <OutlookHero analysis={analysis} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Row 1: Conditions + Water Column */}
          <div className="md:col-span-1 lg:col-span-5">
            <ConditionsPanel
              conditions={conditions}
              biteWindows={analysis.biteWindows}
              lakeMaxDepth={lakeMaxDepth}
              onLakeMaxDepthChange={setLakeMaxDepth}
              onWaterClarityChange={handleWaterClarityChange}
            />
          </div>
          <div className="md:col-span-1 lg:col-span-7">
            <WaterColumn
              fishPosition={analysis.fishPosition}
              fishDepth={analysis.fishDepth}
              frontalSystem={conditions.frontalSystem}
              waterTemp={conditions.waterTemp}
              depthRange={analysis.seasonalPhase.depthRange}
              lakeMaxDepth={lakeMaxDepth}
              season={analysis.seasonalPhase.season}
              windSpeed={conditions.windSpeed}
              skyCondition={conditions.skyCondition}
              waterClarity={conditions.waterClarity}
            />
          </div>

          {/* Row 2: Structure Targets */}
          <div className="md:col-span-2 lg:col-span-12">
            <StructureTargets
              targets={analysis.structureTargets}
              seasonalPhase={analysis.seasonalPhase}
            />
          </div>
        </div>

        {/* Pro Angler Picks */}
        {analysis.anglerPicks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">What the Pros Would Throw</h2>
              <span className="text-[10px] font-mono text-slate-500">{analysis.anglerPicks.reduce((sum, p) => sum + 1 + p.endorsers.length, 0)} anglers</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {analysis.anglerPicks.map((pick) => (
                <AnglerPickCard key={pick.anglerId} pick={pick} />
              ))}
            </div>
          </div>
        )}

        {/* Tactical Briefing */}
        {briefings.length > 0 && <TacticalBriefing briefings={briefings} />}

        {/* Engine Tuning */}
        <TuningPanel config={tuning} onChange={handleTuningChange} onReset={handleTuningReset} />

        {/* Footer */}
        <footer className="border-t border-slate-800 pt-4 pb-8 text-center">
          <p className="text-[10px] text-slate-600 font-mono">
            StrikeZone v1.0 | Days 1-5: OpenWeather API | Days 6-10: Trend extrapolation | Solunar calculations are approximate
          </p>
        </footer>
      </main>
    </div>
  );
}
