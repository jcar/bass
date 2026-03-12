// ─── StrikeZone: Core Type System ───

export type Season = 'pre-spawn' | 'spawn' | 'post-spawn' | 'summer' | 'fall' | 'winter';
export type FrontalSystem = 'pre-frontal' | 'post-frontal' | 'stable' | 'cold-front';
export type SkyCondition = 'clear' | 'partly-cloudy' | 'overcast' | 'rain';
export type WaterClarity = 'clear' | 'stained' | 'muddy';
export type WindIntensity = 'calm' | 'light' | 'moderate' | 'heavy';
export type FishPosition = 'surface' | 'suspended' | 'transitioning' | 'bottom';
export type PressureTrend = 'rising' | 'falling' | 'steady';
export type SolunarPhase = 'major' | 'minor' | 'off';
export type RetrieveSpeed = 'slow' | 'moderate' | 'fast' | 'burn';
export type LureAction = 'finesse' | 'reaction' | 'search' | 'power';

export interface WeatherConditions {
  airTemp: number;         // Fahrenheit
  waterTemp: number;       // Fahrenheit
  windSpeed: number;       // mph
  windDirection: string;   // cardinal
  barometricPressure: number; // inHg
  pressureTrend: PressureTrend;
  skyCondition: SkyCondition;
  humidity: number;        // percentage
  waterClarity: WaterClarity;
  frontalSystem: FrontalSystem;
}

export interface SeasonalPhase {
  season: Season;
  label: string;
  description: string;
  keyTargets: StructureTarget[];
  depthRange: { min: number; max: number }; // feet
}

export interface StructureTarget {
  id: string;
  name: string;
  type: 'point' | 'bluff' | 'grass' | 'flat' | 'dock' | 'creek-channel' | 'hump' | 'riprap' | 'laydown';
  priority: 'primary' | 'secondary' | 'tertiary';
  description: string;
  x: number; // % position on tactical map
  y: number; // % position on tactical map
}

export interface LureRecommendation {
  name: string;
  category: string;
  color: string;
  colorHex: string;
  retrieveSpeed: RetrieveSpeed;
  action: LureAction;
  confidence: number; // 0-100
  depthRange: string;
  proTip: string;
}

export interface BiteWindow {
  phase: SolunarPhase;
  startHour: number;   // 0-23
  startMinute: number;
  durationMinutes: number;
  intensity: number;   // 0-100
}

export interface ScoreFactor {
  label: string;          // "Water Temp", "Pressure", etc.
  score: number;          // 0-100 raw score for this factor
  weight: number;         // 0-1, how much it contributes
  detail: string;         // human-readable explanation
  impact: 'positive' | 'negative' | 'neutral';
}

export interface StrikeAnalysis {
  biteIntensity: number;         // 0-100
  confidenceIndex: number;       // 0-100
  seasonalPhase: SeasonalPhase;
  fishPosition: FishPosition;
  fishDepth: number;             // feet
  lureRecommendations: LureRecommendation[];
  structureTargets: StructureTarget[];
  biteWindows: BiteWindow[];
  pressureTrend: PressureTrend;
  tacticalNotes: string[];
  anglerPicks: AnglerPick[];
  biteFactors: ScoreFactor[];
  confidenceFactors: ScoreFactor[];
  depthFactors: ScoreFactor[];
}

export interface AnglerEndorsement {
  anglerId: string;
  anglerName: string;
  confidence: number;
  rationale: string;
  proTip: string;
}

export interface AnglerPick {
  anglerId: string;
  anglerName: string;
  lure: LureRecommendation;
  /** Why this angler favors this lure right now */
  rationale: string;
  endorsers: AnglerEndorsement[];
}

export interface Lake {
  id: string;
  name: string;
  state: string;
  county: string;
  lat: number;
  lon: number;
  type: 'lake' | 'reservoir';
  maxDepth: number | null;
  surfaceAcres: number | null;
}

export interface DayForecast {
  date: string;           // YYYY-MM-DD
  dayLabel: string;       // "Today", "Mon", "Tue", etc.
  dayOfWeek: string;      // Full day name
  airTempHigh: number;
  airTempLow: number;
  airTemp: number;        // midday representative temp
  waterTemp: number;
  windSpeed: number;
  windDirection: string;
  barometricPressure: number;
  humidity: number;
  skyCondition: SkyCondition;
  description: string;
  isExtrapolated: boolean; // true for days 6-10
  dataConfidence: number;  // 0-100, decays for extrapolated days
}
