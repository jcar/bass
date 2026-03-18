'use client';

import { useState } from 'react';
import type { LureOpinion, TipRule, ColorRule } from '@/lib/types';
import TipEditor from './TipEditor';
import ColorSwatch from './ColorSwatch';

interface Props {
  opinion: LureOpinion;
  onUpdate: (updated: LureOpinion) => void;
}

export default function LurePanel({ opinion, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);

  function updateTip(index: number, updated: TipRule) {
    const tipRules = [...opinion.tipRules];
    tipRules[index] = updated;
    onUpdate({ ...opinion, tipRules });
  }

  function deleteTip(index: number) {
    const tipRules = opinion.tipRules.filter((_, i) => i !== index);
    onUpdate({ ...opinion, tipRules });
  }

  function deleteColor(index: number) {
    const colorRules = opinion.colorRules.filter((_, i) => i !== index);
    onUpdate({ ...opinion, colorRules });
  }

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-medium">{opinion.lure}</span>
          <span className="text-xs text-gray-500">
            {opinion.tipRules.length} tips, {opinion.colorRules.length} colors
          </span>
          {opinion.confidenceModifiers.length > 0 && (
            <span className="text-xs text-yellow-600">{opinion.confidenceModifiers.length} modifiers</span>
          )}
        </div>
        <span className="text-gray-600">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="px-4 py-3 space-y-4">
          {/* Sources */}
          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sources ({opinion.sources.length})</h4>
            <div className="flex flex-wrap gap-1">
              {opinion.sources.map(s => (
                <span key={s} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded truncate max-w-xs">
                  {s.replace('.txt', '')}
                </span>
              ))}
            </div>
          </div>

          {/* Tip Rules */}
          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Tip Rules ({opinion.tipRules.length})
            </h4>
            {opinion.tipRules
              .sort((a, b) => b.priority - a.priority)
              .map((rule, i) => (
                <TipEditor key={i} rule={rule} index={i} onUpdate={updateTip} onDelete={deleteTip} />
              ))}
          </div>

          {/* Color Rules */}
          {opinion.colorRules.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Color Rules ({opinion.colorRules.length})
              </h4>
              {opinion.colorRules
                .sort((a: ColorRule, b: ColorRule) => b.priority - a.priority)
                .map((rule: ColorRule, i: number) => (
                  <ColorSwatch key={i} rule={rule} onDelete={() => deleteColor(i)} />
                ))}
            </div>
          )}

          {/* Confidence Modifiers */}
          {opinion.confidenceModifiers.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Confidence Modifiers</h4>
              {opinion.confidenceModifiers.map((mod, i) => (
                <div key={i} className="text-sm text-gray-400 py-1">
                  <span className={mod.adjustment > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {mod.adjustment > 0 ? '+' : ''}{mod.adjustment}
                  </span>
                  {' '}
                  <span className="text-xs text-gray-600">
                    {Object.entries(mod.when).map(([k, v]) =>
                      Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${String(v)}`
                    ).join(' | ')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Default Tips */}
          {opinion.defaultTips.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Default Tips</h4>
              {opinion.defaultTips.map((dt, i) => (
                <p key={i} className="text-sm text-gray-400 py-1">{dt.tip}</p>
              ))}
            </div>
          )}

          {/* Overrides */}
          {(opinion.seasonAdd.length > 0 || opinion.minTempOverride != null || opinion.maxFishDepthOverride != null) && (
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Overrides</h4>
              {opinion.seasonAdd.length > 0 && (
                <p className="text-sm text-gray-400">Season add: {opinion.seasonAdd.join(', ')}</p>
              )}
              {opinion.minTempOverride != null && (
                <p className="text-sm text-gray-400">Min temp override: {opinion.minTempOverride}°F</p>
              )}
              {opinion.maxFishDepthOverride != null && (
                <p className="text-sm text-gray-400">Max fish depth override: {opinion.maxFishDepthOverride}ft</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
