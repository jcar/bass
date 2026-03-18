'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BASE_LURE_NAMES } from '@/lib/constants';

interface CoverageCell {
  anglerId: string;
  anglerName: string;
  lure: string;
  tipCount: number;
  colorCount: number;
  emptyWhenTips: number;
  emptyWhenColors: number;
  nonStandardFields: number;
  hasCredibility: boolean;
  sources: string[];
}

interface Props {
  cells: CoverageCell[];
}

interface CellIssue {
  label: string;
  severity: 'red' | 'yellow';
  fix: string;
  fixHref: string;
}

function getCellIssues(cell: CoverageCell): CellIssue[] {
  const issues: CellIssue[] = [];
  if (cell.nonStandardFields > 0) {
    issues.push({
      label: `${cell.nonStandardFields} non-standard when field${cell.nonStandardFields > 1 ? 's' : ''}`,
      severity: 'red',
      fix: 'Fix in Schema tool',
      fixHref: '/schema',
    });
  }
  if (cell.emptyWhenTips > 2) {
    issues.push({
      label: `${cell.emptyWhenTips} tip rules with empty conditions (always fire)`,
      severity: 'red',
      fix: 'Edit in angler detail',
      fixHref: `/angler/${cell.anglerId}`,
    });
  } else if (cell.emptyWhenTips > 0) {
    issues.push({
      label: `${cell.emptyWhenTips} tip rule${cell.emptyWhenTips > 1 ? 's' : ''} with empty conditions`,
      severity: 'yellow',
      fix: 'Edit in angler detail',
      fixHref: `/angler/${cell.anglerId}`,
    });
  }
  if (cell.emptyWhenColors > 2) {
    issues.push({
      label: `${cell.emptyWhenColors} color rules with empty conditions (always fire)`,
      severity: 'red',
      fix: 'Edit in angler detail',
      fixHref: `/angler/${cell.anglerId}`,
    });
  } else if (cell.emptyWhenColors > 0) {
    issues.push({
      label: `${cell.emptyWhenColors} color rule${cell.emptyWhenColors > 1 ? 's' : ''} with empty conditions`,
      severity: 'yellow',
      fix: 'Edit in angler detail',
      fixHref: `/angler/${cell.anglerId}`,
    });
  }
  if (!cell.hasCredibility) {
    issues.push({
      label: 'No credibility score set (defaults to 0.5)',
      severity: 'yellow',
      fix: 'Set in Credibility editor',
      fixHref: '/credibility',
    });
  }
  return issues;
}

function cellStatus(cell: CoverageCell | undefined): 'none' | 'red' | 'yellow' | 'green' {
  if (!cell) return 'none';
  const issues = getCellIssues(cell);
  if (issues.some(i => i.severity === 'red')) return 'red';
  if (issues.length > 0) return 'yellow';
  return 'green';
}

const statusColors = {
  none: 'bg-gray-800',
  red: 'bg-red-900/60',
  yellow: 'bg-yellow-900/40',
  green: 'bg-emerald-900/40',
};

export default function CoverageMatrix({ cells }: Props) {
  const [selected, setSelected] = useState<CoverageCell | null>(null);

  // Build lookup: anglerId → lure → cell
  const lookup = new Map<string, Map<string, CoverageCell>>();
  const anglerIds = new Map<string, string>(); // id → name

  for (const cell of cells) {
    if (!lookup.has(cell.anglerId)) lookup.set(cell.anglerId, new Map());
    lookup.get(cell.anglerId)!.set(cell.lure, cell);
    anglerIds.set(cell.anglerId, cell.anglerName);
  }

  const sortedAnglers = [...anglerIds.entries()].sort(([, a], [, b]) => a.localeCompare(b));

  // Compute column totals
  const colTotals = new Map<string, number>();
  for (const lure of BASE_LURE_NAMES) {
    let count = 0;
    for (const [anglerId] of sortedAnglers) {
      if (lookup.get(anglerId)?.has(lure)) count++;
    }
    colTotals.set(lure, count);
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-gray-950 z-10 px-3 py-2 text-left text-gray-500 min-w-[140px]">
                Angler
              </th>
              {BASE_LURE_NAMES.map(lure => (
                <th key={lure} className="px-1 py-2 text-gray-600 font-normal" style={{ writingMode: 'vertical-lr' }}>
                  <span className="block max-h-[120px] overflow-hidden">{lure}</span>
                </th>
              ))}
              <th className="px-3 py-2 text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedAnglers.map(([anglerId, anglerName]) => {
              const anglerLures = lookup.get(anglerId) ?? new Map();
              const rowTotal = anglerLures.size;
              return (
                <tr key={anglerId} className="border-t border-gray-800/30">
                  <td className="sticky left-0 bg-gray-950 z-10 px-3 py-1">
                    <Link href={`/angler/${anglerId}`} className="text-emerald-400 hover:text-emerald-300">
                      {anglerName}
                    </Link>
                  </td>
                  {BASE_LURE_NAMES.map(lure => {
                    const cell = anglerLures.get(lure);
                    const status = cellStatus(cell);
                    const isSelected = selected && selected.anglerId === cell?.anglerId && selected.lure === cell?.lure;
                    return (
                      <td key={lure} className="px-0.5 py-0.5">
                        <div
                          onClick={() => cell && setSelected(isSelected ? null : cell)}
                          className={`w-6 h-6 rounded-sm ${statusColors[status]} ${cell ? 'cursor-pointer hover:ring-1 hover:ring-gray-500' : ''} ${isSelected ? 'ring-2 ring-white' : ''}`}
                        >
                          {cell && (
                            <span className="flex items-center justify-center h-full text-[9px] text-gray-400">
                              {cell.tipCount}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-1 text-gray-500 font-mono">{rowTotal}</td>
                </tr>
              );
            })}
            {/* Column totals */}
            <tr className="border-t border-gray-700">
              <td className="sticky left-0 bg-gray-950 z-10 px-3 py-1 text-gray-500 font-medium">Total</td>
              {BASE_LURE_NAMES.map(lure => (
                <td key={lure} className="px-0.5 py-1 text-center text-gray-600 font-mono text-[10px]">
                  {colTotals.get(lure) ?? 0}
                </td>
              ))}
              <td className="px-3 py-1 text-gray-500 font-mono">{cells.length}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-800 inline-block" /> No opinion</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-900/60 inline-block" /> Non-standard fields or 3+ empty conditions</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-900/40 inline-block" /> Some empty conditions or missing credibility</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-900/40 inline-block" /> Clean — no issues</span>
        <span className="text-gray-600">Number = tip count. Click a cell for details.</span>
      </div>

      {/* Detail panel */}
      {selected && (
        <CellDetail cell={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function CellDetail({ cell, onClose }: { cell: CoverageCell; onClose: () => void }) {
  const issues = getCellIssues(cell);
  const status = cellStatus(cell);

  return (
    <div className={`mt-4 border rounded-lg p-4 ${
      status === 'red' ? 'border-red-800 bg-red-900/10' :
      status === 'yellow' ? 'border-yellow-800 bg-yellow-900/10' :
      'border-emerald-800 bg-emerald-900/10'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-emerald-400 font-medium">{cell.anglerName}</span>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">{cell.lure}</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm">close</button>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-3 text-sm">
        <div>
          <span className="text-gray-500">Tips:</span>{' '}
          <span className="font-mono text-gray-300">{cell.tipCount}</span>
        </div>
        <div>
          <span className="text-gray-500">Colors:</span>{' '}
          <span className="font-mono text-gray-300">{cell.colorCount}</span>
        </div>
        <div>
          <span className="text-gray-500">Sources:</span>{' '}
          <span className="text-gray-400">{cell.sources.length > 0 ? cell.sources.join(', ') : 'none'}</span>
        </div>
        <div>
          <span className="text-gray-500">Credibility:</span>{' '}
          <span className={cell.hasCredibility ? 'text-emerald-400' : 'text-yellow-400'}>
            {cell.hasCredibility ? 'set' : 'missing'}
          </span>
        </div>
      </div>

      {/* Issues */}
      {issues.length === 0 ? (
        <div className="text-emerald-400 text-sm">No issues — this lure opinion is ready for integration.</div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-gray-400 font-medium">Issues to fix:</div>
          {issues.map((issue, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${issue.severity === 'red' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                <span className="text-gray-300">{issue.label}</span>
              </div>
              <Link href={issue.fixHref} className="text-emerald-400 hover:text-emerald-300 text-xs shrink-0">
                {issue.fix} →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
