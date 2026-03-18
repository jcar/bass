'use client';

import type { LureOpinion } from '@/lib/types';
import ColorSwatch from './ColorSwatch';

interface AnglerOpinion {
  name: string;
  opinion: LureOpinion;
}

export default function CompareView({ data }: { data: Record<string, AnglerOpinion> }) {
  const anglerIds = Object.keys(data).sort();

  if (anglerIds.length === 0) {
    return <p className="text-gray-500">No anglers have opinions on this lure.</p>;
  }

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(anglerIds.length, 3)}, 1fr)` }}>
      {anglerIds.map(id => {
        const { name, opinion } = data[id];
        return (
          <div key={id} className="border border-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-emerald-400">{name}</h3>
            <p className="text-xs text-gray-500">
              {opinion.tipRules.length} tips, {opinion.colorRules.length} colors, {opinion.sources.length} sources
            </p>

            {/* Colors */}
            {opinion.colorRules.length > 0 && (
              <div>
                <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Colors</h4>
                {opinion.colorRules.slice(0, 5).map((rule, i) => (
                  <ColorSwatch key={i} rule={rule} />
                ))}
                {opinion.colorRules.length > 5 && (
                  <p className="text-xs text-gray-600">+{opinion.colorRules.length - 5} more</p>
                )}
              </div>
            )}

            {/* Top Tips */}
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Top Tips</h4>
              {opinion.tipRules
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 5)
                .map((rule, i) => (
                  <div key={i} className="text-sm text-gray-300 py-1.5 border-b border-gray-800 last:border-0">
                    <span className="text-xs text-yellow-600 font-mono mr-2">p{rule.priority}</span>
                    {rule.tip}
                  </div>
                ))}
              {opinion.tipRules.length > 5 && (
                <p className="text-xs text-gray-600 mt-1">+{opinion.tipRules.length - 5} more tips</p>
              )}
            </div>

            {/* Confidence Modifiers */}
            {opinion.confidenceModifiers.length > 0 && (
              <div>
                <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Confidence Modifiers</h4>
                {opinion.confidenceModifiers.map((mod, i) => (
                  <p key={i} className="text-xs text-gray-400">
                    <span className={mod.adjustment > 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {mod.adjustment > 0 ? '+' : ''}{mod.adjustment}
                    </span>
                    {' '}
                    {JSON.stringify(mod.when)}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
