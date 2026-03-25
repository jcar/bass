'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Crosshair, AlertTriangle, MapPin, X, RefreshCw } from 'lucide-react';
import { loadTuning } from '@/lib/tuning';
import { loadSession, saveSession, updateLakeMemory, toggleFavorite, type SessionState } from '@/lib/session';
import { nearestLake, getLakeById } from '@/data/bass-lakes';
import { generateMorningBriefing } from '@/lib/morningBriefing';
import LakePicker from '@/components/LakePicker';
import type { WeatherConditions, StrikeAnalysis, DayForecast, Lake, WaterClarity } from '@/lib/types';
import { runStrikeAnalysis, calculateDepthCurve } from '@/lib/StrikeEngine';
import { fetchForecast } from '@/lib/fetchForecast';
import ConditionsPanel from '@/components/ConditionsPanel';
import type { ConditionDelta } from '@/components/ConditionsPanel';
import WhatToThrowSection from '@/components/WhatToThrowSection';
import MorningBriefing from '@/components/MorningBriefing';
import CommandStrip from '@/components/CommandStrip';
import TopPickCard from '@/components/TopPickCard';
import GamePlanSection from '@/components/GamePlanSection';
import { buildWhatToThrow } from '@/lib/whatToThrow';

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

  if (pressureDiff < -0.15 && tempDiff < -3) return 'cold-front';
  if (pressureDiff < -0.08) return 'pre-frontal';
  if (pressureDiff > 0.1 && (prev.barometricPressure < 29.85 || pressureDiff > 0.15)) return 'post-frontal';
  return 'stable';
}

export default function Dashboard() {
  const [conditions, setConditions] = useState<WeatherConditions>(DEFAULT_CONDITIONS);
  const [analysis, setAnalysis] = useState<StrikeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: '', lon: '', name: 'Detecting location...' });
  const [locationReady, setLocationReady] = useState(false);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const tuning = useMemo(() => loadTuning(), []);
  const [lakeMaxDepth, setLakeMaxDepth] = useState(40);
  const [selectedLake, setSelectedLake] = useState<Lake | null>(null);
  const [gpsLocating, setGpsLocating] = useState(false);

  // C4: Water temp override
  const [waterTempOverride, setWaterTempOverride] = useState<number | null>(null);

  // C2: Auto-detect confirmation toast
  const [autoDetectLake, setAutoDetectLake] = useState<string | null>(null);

  // P10: Condition change deltas
  const prevConditionsRef = useRef<WeatherConditions | null>(null);
  const [deltas, setDeltas] = useState<ConditionDelta | null>(null);
  const deltasTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Feature 3: Session Memory
  const [session, setSession] = useState<SessionState>(() => loadSession());
  const sessionInitRef = useRef(false);

  // Angler deep dive state (shared between TopPickCard and WhatToThrowSection)
  const [followingAngler, setFollowingAngler] = useState<string | null>(null);

  // ── Session persistence helpers ──
  const updateSession = useCallback((updater: (prev: SessionState) => SessionState) => {
    setSession(prev => {
      const next = updater(prev);
      saveSession(next);
      return next;
    });
  }, []);

  // ── Lake selection ──
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

    // Session: save as default lake + restore lake memory
    updateSession(s => {
      const mem = s.lakeMemory[lake.id];
      if (mem) {
        // Restore user's saved clarity and temp override for this lake
        setConditions(prev => ({ ...prev, waterClarity: mem.clarity }));
        setWaterTempOverride(mem.waterTempOverride);
        setLakeMaxDepth(mem.maxDepth);
      }
      return {
        ...s,
        defaultLake: {
          id: lake.id,
          name: lake.name,
          state: lake.state,
          lat: lake.lat,
          lon: lake.lon,
          maxDepth: lake.maxDepth,
        },
      };
    });
  }, [updateSession]);

  const handleLakeClear = useCallback(() => {
    setSelectedLake(null);
    setLakeMaxDepth(40);
  }, []);

  // Find and select the nearest curated bass lake to given coordinates
  const selectNearestLake = useCallback((lat: string, lon: string) => {
    const lake = nearestLake(Number(lat), Number(lon));
    if (lake) {
      handleLakeSelect(lake);
      setAutoDetectLake(`${lake.name}, ${lake.state}`);
    }
  }, [handleLakeSelect]);

  // C2: Auto-dismiss auto-detect toast after 5s
  useEffect(() => {
    if (!autoDetectLake) return;
    const id = setTimeout(() => setAutoDetectLake(null), 5000);
    return () => clearTimeout(id);
  }, [autoDetectLake]);

  const handleUseGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const lat = String(latitude);
        const lon = String(longitude);
        selectNearestLake(lat, lon);
        if (!nearestLake(Number(lat), Number(lon))) {
          setLocation({ lat, lon, name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` });
        }
        setGpsLocating(false);
      },
      () => { setGpsLocating(false); },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [selectNearestLake]);

  const handleWaterClarityChange = useCallback((clarity: WaterClarity) => {
    setConditions((prev) => ({ ...prev, waterClarity: clarity }));
    // Session: save clarity per lake
    if (selectedLake) {
      updateSession(s => updateLakeMemory(s, selectedLake.id, { clarity }));
    }
  }, [selectedLake, updateSession]);

  // C4: Handle water temp override
  const handleWaterTempOverride = useCallback((temp: number | null) => {
    setWaterTempOverride(temp);
    // Session: save temp override per lake
    if (selectedLake) {
      updateSession(s => updateLakeMemory(s, selectedLake.id, { waterTempOverride: temp }));
    }
  }, [selectedLake, updateSession]);

  // Session: save max depth per lake
  const handleLakeMaxDepthChange = useCallback((depth: number) => {
    setLakeMaxDepth(depth);
    if (selectedLake) {
      updateSession(s => updateLakeMemory(s, selectedLake.id, { maxDepth: depth }));
    }
  }, [selectedLake, updateSession]);

  // Feature 3: Favorite toggle
  const handleToggleFavorite = useCallback((lakeId: string) => {
    updateSession(s => toggleFavorite(s, lakeId));
  }, [updateSession]);

  // Build favorite Lake objects from curated dataset
  const favoriteLakes = useMemo((): Lake[] => {
    return session.favoriteLakeIds
      .map(id => getLakeById(id))
      .filter((l): l is Lake => l != null);
  }, [session.favoriteLakeIds]);

  const conditionsFromForecast = useCallback((days: DayForecast[], index: number): WeatherConditions => {
    const day = days[index];
    if (!day) return DEFAULT_CONDITIONS;
    return {
      airTemp: day.airTemp,
      waterTemp: day.waterTemp,
      windSpeed: day.windSpeed,
      windDirection: day.windDirection,
      barometricPressure: day.barometricPressure,
      pressureTrend: day.pressureTrend ?? 'steady',
      skyCondition: day.skyCondition,
      humidity: day.humidity,
      waterClarity: conditions.waterClarity,
      frontalSystem: deriveFrontalSystem(days, index),
    };
  }, [conditions.waterClarity]);

  const loadForecast = useCallback(async (lat: string, lon: string) => {
    setLoading(true);
    try {
      const data = await fetchForecast(parseFloat(lat), parseFloat(lon));
      if (data.length > 0) {
        setForecast(data);
        // Find the first non-yesterday day for selection
        const todayIndex = data.findIndex((d: DayForecast) => !d.isYesterday);
        setSelectedDay(todayIndex >= 0 ? todayIndex : 0);
        const day = data[todayIndex >= 0 ? todayIndex : 0];
        if (day) {
          setConditions((prev) => ({
            ...prev,
            airTemp: day.airTemp,
            waterTemp: day.waterTemp,
            windSpeed: day.windSpeed,
            windDirection: day.windDirection,
            barometricPressure: day.barometricPressure,
            humidity: day.humidity,
            skyCondition: day.skyCondition,
            pressureTrend: day.pressureTrend ?? 'steady',
            frontalSystem: 'stable',
          }));
        }
        // Session: record fetch timestamp
        updateSession(s => ({ ...s, lastFetchTimestamp: Date.now() }));
      }
    } catch {
      // Keep current conditions on error
    } finally {
      setLoading(false);
    }
  }, [updateSession]);

  const handleDaySelect = useCallback((index: number) => {
    setSelectedDay(index);
    if (forecast.length > 0) {
      const newConditions = conditionsFromForecast(forecast, index);
      setConditions(newConditions);
    }
  }, [forecast, conditionsFromForecast]);

  // Feature 3: Hydrate from session on mount
  useEffect(() => {
    if (sessionInitRef.current) return;
    sessionInitRef.current = true;
    const s = loadSession();
    if (s.defaultLake) {
      const lake = getLakeById(s.defaultLake.id) ?? {
        id: s.defaultLake.id,
        name: s.defaultLake.name,
        state: s.defaultLake.state,
        lat: s.defaultLake.lat,
        lon: s.defaultLake.lon,
        maxDepth: s.defaultLake.maxDepth ?? 40,
        surfaceAcres: 0,
        bassRating: 3,
        aliases: [],
      };
      handleLakeSelect(lake);
    }
  }, [handleLakeSelect]);

  // Auto-detect location on mount (skip if session has a lake)
  useEffect(() => {
    if (session.defaultLake) return; // session hydration will handle it
    const fallback = () => {
      setLocation({ lat: '35.96', lon: '-93.31', name: 'Table Rock Lake, MO' });
      setLocationReady(true);
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = String(pos.coords.latitude.toFixed(4));
          const lon = String(pos.coords.longitude.toFixed(4));
          setLocation({ lat, lon, name: 'Your location' });
          setLocationReady(true);
          selectNearestLake(lat, lon);
        },
        fallback,
        { timeout: 5000 },
      );
    } else {
      fallback();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch forecast when location is resolved
  useEffect(() => {
    if (locationReady && location.lat && location.lon) {
      loadForecast(location.lat, location.lon);
    }
  }, [location.lat, location.lon, locationReady, loadForecast]);

  // C4: Apply water temp override to conditions
  const effectiveConditions = useMemo((): WeatherConditions => {
    if (waterTempOverride != null) {
      return { ...conditions, waterTemp: waterTempOverride };
    }
    return conditions;
  }, [conditions, waterTempOverride]);

  // Re-run analysis when conditions change
  useEffect(() => {
    setAnalysis(runStrikeAnalysis(effectiveConditions, tuning, lakeMaxDepth));
  }, [effectiveConditions, tuning, lakeMaxDepth]);

  // P10: Compute deltas when conditions change from day selection
  useEffect(() => {
    if (prevConditionsRef.current) {
      const prev = prevConditionsRef.current;
      const d: ConditionDelta = {
        waterTemp: Math.round(effectiveConditions.waterTemp - prev.waterTemp),
        airTemp: Math.round(effectiveConditions.airTemp - prev.airTemp),
        windSpeed: Math.round(effectiveConditions.windSpeed - prev.windSpeed),
        barometricPressure: +(effectiveConditions.barometricPressure - prev.barometricPressure).toFixed(2),
      };
      const hasChange = d.waterTemp !== 0 || d.airTemp !== 0 || d.windSpeed !== 0 || d.barometricPressure !== 0;
      if (hasChange) {
        setDeltas(d);
        if (deltasTimerRef.current) clearTimeout(deltasTimerRef.current);
        deltasTimerRef.current = setTimeout(() => setDeltas(null), 5000);
      }
    }
    prevConditionsRef.current = effectiveConditions;
  }, [effectiveConditions]);

  // P8: Compute previous-day bite intensity for delta display
  const prevBiteIntensity = useMemo(() => {
    if (forecast.length < 2 || selectedDay < 1) return undefined;
    const prevIndex = selectedDay - 1;
    const prevConditions = conditionsFromForecast(forecast, prevIndex);
    const prevAnalysis = runStrikeAnalysis(prevConditions, tuning, lakeMaxDepth);
    return prevAnalysis.biteIntensity;
  }, [forecast, selectedDay, conditionsFromForecast, tuning, lakeMaxDepth]);

  const whatToThrow = useMemo(() => {
    if (!analysis) return null;
    return buildWhatToThrow(analysis, effectiveConditions);
  }, [analysis, effectiveConditions]);

  // ── Feature 1: Morning Briefing ──
  // Compute yesterday's analysis from the isYesterday forecast entry
  const yesterdayData = useMemo(() => {
    const yday = forecast.find(d => d.isYesterday);
    if (!yday) return null;
    const ydayIndex = forecast.indexOf(yday);
    const ydayConditions = conditionsFromForecast(forecast, ydayIndex);
    const ydayAnalysis = runStrikeAnalysis(ydayConditions, tuning, lakeMaxDepth);
    return { conditions: ydayConditions, analysis: ydayAnalysis };
  }, [forecast, conditionsFromForecast, tuning, lakeMaxDepth]);

  const morningBullets = useMemo(() => {
    if (!analysis || !yesterdayData) return [];
    return generateMorningBriefing(analysis, yesterdayData.analysis, effectiveConditions, yesterdayData.conditions);
  }, [analysis, yesterdayData, effectiveConditions]);

  // ── Feature 2: All-day analyses for bite forecast chart ──
  // Filter out the yesterday entry for display purposes
  const forecastDays = useMemo(
    () => forecast.filter(d => !d.isYesterday),
    [forecast],
  );

  const allDayAnalyses = useMemo(() =>
    forecastDays.map((_, i) => {
      const idx = forecast.indexOf(forecastDays[i]);
      const conds = conditionsFromForecast(forecast, idx);
      return runStrikeAnalysis(conds, tuning, lakeMaxDepth);
    }),
    [forecastDays, forecast, conditionsFromForecast, tuning, lakeMaxDepth]
  );

  // Map selectedDay to the forecastDays array index
  const displaySelectedDay = useMemo(() => {
    const currentForecast = forecast[selectedDay];
    if (!currentForecast) return 0;
    return forecastDays.indexOf(currentForecast);
  }, [forecast, forecastDays, selectedDay]);

  // Handle day selection from the chart (maps back to forecast array index)
  const handleChartDaySelect = useCallback((displayIndex: number) => {
    const day = forecastDays[displayIndex];
    if (!day) return;
    const realIndex = forecast.indexOf(day);
    if (realIndex >= 0) handleDaySelect(realIndex);
  }, [forecastDays, forecast, handleDaySelect]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-400 font-mono animate-pulse">Analyzing conditions...</div>
      </div>
    );
  }

  const currentDayForecast = forecast[selectedDay];
  const isFutureDay = selectedDay > 0 && !currentDayForecast?.isYesterday;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
      {/* 0. Header (unchanged, sticky) */}
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

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={() => loadForecast(location.lat, location.lon)}
              className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh forecast"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <LakePicker
              selectedLake={selectedLake}
              onLakeSelect={handleLakeSelect}
              onClear={handleLakeClear}
              onUseGPS={handleUseGPS}
              gpsLocating={gpsLocating}
              locationName={location.name}
              today={forecastDays[displaySelectedDay] ? {
                skyCondition: forecastDays[displaySelectedDay].skyCondition,
                airTempHigh: forecastDays[displaySelectedDay].airTempHigh,
                airTempLow: forecastDays[displaySelectedDay].airTempLow,
                waterTemp: forecastDays[displaySelectedDay].waterTemp,
              } : undefined}
              favoriteLakeIds={session.favoriteLakeIds}
              onToggleFavorite={handleToggleFavorite}
              lastFetchTimestamp={session.lastFetchTimestamp}
              userLat={parseFloat(location.lat) || undefined}
              userLon={parseFloat(location.lon) || undefined}
              favoriteLakes={favoriteLakes}
            />
          </div>
        </div>
      </header>

      {/* 1. CommandStrip — Bite gauge + compact forecast + solunar countdown */}
      {forecastDays.length > 0 && allDayAnalyses.length > 0 && (
        <CommandStrip
          analysis={analysis}
          prevBiteIntensity={prevBiteIntensity}
          analyses={allDayAnalyses}
          forecast={forecastDays}
          selectedDay={displaySelectedDay}
          onDaySelect={handleChartDaySelect}
        />
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* 2. Conditional Alerts */}
        {/* C2: Auto-detect confirmation toast */}
        {autoDetectLake && (
          <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 animate-in fade-in">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Located: <strong>{autoDetectLake}</strong></span>
            <button
              onClick={() => { setAutoDetectLake(null); }}
              className="ml-auto text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

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

        {/* Morning Briefing (starts collapsed) */}
        <MorningBriefing bullets={morningBullets} />

        {/* ── GROUP: WHERE TO FISH ── */}
        {whatToThrow && (
          <section className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3 sm:p-4 space-y-4">
            <GamePlanSection
              analysis={analysis}
              conditions={effectiveConditions}
              whatToThrow={whatToThrow}
              waterClarity={effectiveConditions.waterClarity}
              onWaterClarityChange={handleWaterClarityChange}
              lakeMaxDepth={lakeMaxDepth}
              depthCurve={calculateDepthCurve(effectiveConditions, analysis.seasonalPhase, tuning)}
            />

            <ConditionsPanel
              conditions={effectiveConditions}
              biteWindows={analysis.biteWindows}
              lakeMaxDepth={lakeMaxDepth}
              onLakeMaxDepthChange={handleLakeMaxDepthChange}
              onWaterClarityChange={handleWaterClarityChange}
              waterTempOverride={waterTempOverride}
              onWaterTempOverride={handleWaterTempOverride}
              deltas={deltas}
              biteFactors={analysis.biteFactors}
              defaultCollapsed
            />
          </section>
        )}

        {/* ── GROUP: WHAT TO THROW ── */}
        {whatToThrow && whatToThrow.cards.length > 0 && (
          <section className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3 sm:p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">What to Throw</h2>
              <span className="text-xs font-mono text-slate-500">{whatToThrow.cards.length} rods</span>
            </div>

            <TopPickCard
              card={whatToThrow.cards[0]}
              analysis={analysis}
              conditions={effectiveConditions}
              onFollowAngler={setFollowingAngler}
            />

            <WhatToThrowSection
              result={whatToThrow}
              seasonalPhase={analysis.seasonalPhase}
              structureTargets={analysis.structureTargets}
              conditions={effectiveConditions}
              onFollowAngler={setFollowingAngler}
            />
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-800 pt-4 pb-8 text-center" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          <p className="text-xs text-slate-600 font-mono">
            StrikeZone v2.0 | Days 1-5: Open-Meteo API | Days 6-7: Trend extrapolation | Solunar calculations are approximate
          </p>
        </footer>
      </main>

    </div>
  );
}
