'use client';

import { findForCategory } from '@/lib/knowledge';
import type { ColorAlternate } from '@/lib/anglers/composer';

/** Format a condition predicate for human display. */
function describeCondition(conditions: Record<string, unknown>): string {
  const parts: string[] = [];

  if (conditions.season) {
    const v = Array.isArray(conditions.season) ? conditions.season.join('/') : conditions.season;
    parts.push(String(v));
  }
  if (conditions.waterClarity) {
    const v = Array.isArray(conditions.waterClarity) ? conditions.waterClarity.join('/') : conditions.waterClarity;
    parts.push(`${v} water`);
  }
  if (conditions.skyCondition) {
    const v = Array.isArray(conditions.skyCondition) ? conditions.skyCondition.join('/') : conditions.skyCondition;
    parts.push(`${v} skies`);
  }
  if (conditions.isStained) parts.push('stained water');
  if (conditions.isLowLight) parts.push('low light');

  return parts.length > 0 ? parts.join(', ') : 'general conditions';
}

interface ColorDeepDiveProps {
  currentColor: string;
  currentHex: string;
  alternates: ColorAlternate[];
  anglerId: string;
  accentColor: string;
}

export default function ColorDeepDive({ currentColor, currentHex, alternates, anglerId, accentColor }: ColorDeepDiveProps) {
  // Split into current match and non-matching alternates
  const nonMatching = alternates.filter(a => !a.matched && a.color !== currentColor).slice(0, 3);

  // Pull a color-selection knowledge entry if available
  const colorInsights = findForCategory('color-selection', { angler: anglerId, limit: 1 });

  return (
    <div className="mt-2 bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 space-y-3">
      {/* Current color */}
      <div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Chosen Color</div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 rounded border border-slate-600" style={{ background: currentHex }} />
          <span className="text-sm font-semibold text-white">{currentColor}</span>
          <span className="text-[10px] text-slate-400">Best match for current conditions</span>
        </div>
      </div>

      {/* Alternates */}
      {nonMatching.length > 0 && (
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">If Conditions Change</div>
          <div className="space-y-1.5">
            {nonMatching.map((alt) => (
              <div key={alt.color} className="flex items-center gap-2">
                <div className="w-6 h-3 rounded border border-slate-600" style={{ background: alt.hex }} />
                <span className="text-xs text-slate-300">{alt.color}</span>
                <span className="text-[10px] text-slate-500">&mdash; {describeCondition(alt.conditions as Record<string, unknown>)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color philosophy from knowledge bundle */}
      {colorInsights.length > 0 && (
        <p
          className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 pl-2"
          style={{ borderColor: `${accentColor}40` }}
        >
          {colorInsights[0].insight}
        </p>
      )}
    </div>
  );
}
