'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MatchingTip {
  anglerId: string; anglerName: string; lure: string;
  tip: string; priority: number; skippedFields: string[];
}

interface MatchingColor {
  anglerId: string; anglerName: string; lure: string;
  color: string; hex: string; priority: number; skippedFields: string[];
}

interface MatchingModifier {
  anglerId: string; anglerName: string; lure: string;
  adjustment: number; skippedFields: string[];
}

interface SimResult {
  matchingTips: MatchingTip[];
  matchingColors: MatchingColor[];
  matchingModifiers: MatchingModifier[];
  totalRules: number;
  nonFiringCount: number;
  skippedFieldWarnings: string[];
}

interface Props {
  result: SimResult;
}

type Tab = 'tips' | 'colors' | 'modifiers';

export default function SimulationResults({ result }: Props) {
  const [tab, setTab] = useState<Tab>('tips');

  const firingPct = result.totalRules > 0
    ? Math.round(((result.totalRules - result.nonFiringCount) / result.totalRules) * 100)
    : 0;

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {/* Summary bar */}
      <div className="flex items-center gap-6 px-4 py-3 bg-gray-900 text-sm">
        <span>
          <span className="text-emerald-400 font-bold">{result.totalRules - result.nonFiringCount}</span>
          <span className="text-gray-500">/{result.totalRules} rules fired ({firingPct}%)</span>
        </span>
        <span>
          <span className="text-blue-400 font-bold">{result.matchingTips.length}</span>
          <span className="text-gray-500"> tips</span>
        </span>
        <span>
          <span className="text-purple-400 font-bold">{result.matchingColors.length}</span>
          <span className="text-gray-500"> colors</span>
        </span>
        <span>
          <span className="text-orange-400 font-bold">{result.matchingModifiers.length}</span>
          <span className="text-gray-500"> modifiers</span>
        </span>
      </div>

      {/* Skipped field warnings */}
      {result.skippedFieldWarnings.length > 0 && (
        <div className="px-4 py-2 bg-orange-900/20 border-b border-orange-800/50 text-sm">
          <span className="text-orange-400">⚠ Skipped non-standard fields:</span>{' '}
          <span className="text-orange-300">{result.skippedFieldWarnings.join(', ')}</span>
          <Link href="/schema" className="text-orange-400 hover:text-orange-300 ml-2">Fix in schema tool →</Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(['tips', 'colors', 'modifiers'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize ${tab === t ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t} ({t === 'tips' ? result.matchingTips.length : t === 'colors' ? result.matchingColors.length : result.matchingModifiers.length})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-[500px] overflow-y-auto">
        {tab === 'tips' && (
          <div className="divide-y divide-gray-800/50">
            {result.matchingTips.length === 0 && (
              <div className="p-4 text-gray-600 text-center">No matching tips</div>
            )}
            {result.matchingTips.map((tip, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1 text-xs">
                  <span className="text-emerald-400">{tip.anglerName}</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-500">{tip.lure}</span>
                  <span className="text-gray-600">·</span>
                  <span className="font-mono text-gray-600">p{tip.priority}</span>
                  {tip.skippedFields.length > 0 && (
                    <span className="text-orange-400">⚠ skipped: {tip.skippedFields.join(', ')}</span>
                  )}
                </div>
                <div className="text-sm text-gray-300">{tip.tip}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'colors' && (
          <div className="divide-y divide-gray-800/50">
            {result.matchingColors.length === 0 && (
              <div className="p-4 text-gray-600 text-center">No matching colors</div>
            )}
            {result.matchingColors.map((c, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border border-gray-700 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs mb-0.5">
                    <span className="text-emerald-400">{c.anglerName}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500">{c.lure}</span>
                    <span className="font-mono text-gray-600">p{c.priority}</span>
                    {c.skippedFields.length > 0 && (
                      <span className="text-orange-400">⚠ skipped: {c.skippedFields.join(', ')}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">{c.color} <span className="text-gray-600">{c.hex}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'modifiers' && (
          <div className="divide-y divide-gray-800/50">
            {result.matchingModifiers.length === 0 && (
              <div className="p-4 text-gray-600 text-center">No matching modifiers</div>
            )}
            {result.matchingModifiers.map((m, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <span className={`font-mono text-lg font-bold ${m.adjustment > 0 ? 'text-emerald-400' : m.adjustment < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {m.adjustment > 0 ? '+' : ''}{m.adjustment}
                </span>
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-400">{m.anglerName}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500">{m.lure}</span>
                    {m.skippedFields.length > 0 && (
                      <span className="text-orange-400">⚠ skipped: {m.skippedFields.join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
