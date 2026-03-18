'use client';

import { useState, useCallback } from 'react';

interface Suggestion {
  lure: string;
  ruleType: 'tip' | 'color';
  ruleIndex: number;
  originalText: string;
  priority: number;
  suggestedWhen: Record<string, unknown>;
  confidence: number;
  reasoning: string;
  status: 'pending' | 'accepted' | 'skipped' | 'edited' | 'confirmed';
}

interface BackfillData {
  anglerId: string;
  totalEmpty: number;
  processed: number;
  suggestions: Suggestion[];
}

interface Props {
  data: BackfillData;
  onRefresh: () => void;
}

function formatWhen(when: Record<string, unknown>): string {
  if (!when || Object.keys(when).length === 0) return '(no conditions — universal)';
  const parts: string[] = [];
  for (const [key, val] of Object.entries(when)) {
    if (Array.isArray(val)) parts.push(`${key}: ${val.join(', ')}`);
    else if (typeof val === 'boolean') parts.push(key);
    else if (typeof val === 'object' && val !== null) {
      const range = val as { min?: number; max?: number };
      const rangeParts: string[] = [];
      if (range.min != null) rangeParts.push(`≥${range.min}`);
      if (range.max != null) rangeParts.push(`≤${range.max}`);
      parts.push(`${key}: ${rangeParts.join(' & ')}`);
    }
  }
  return parts.join(' · ');
}

function confidenceColor(c: number): string {
  if (c >= 0.8) return 'text-emerald-400';
  if (c >= 0.5) return 'text-yellow-400';
  return 'text-red-400';
}

function confidenceBg(c: number): string {
  if (c >= 0.8) return 'border-emerald-900/40';
  if (c >= 0.5) return 'border-yellow-900/40';
  return 'border-red-900/40';
}

function statusBadge(status: string): React.ReactNode {
  const colors: Record<string, string> = {
    pending: 'bg-gray-700 text-gray-300',
    accepted: 'bg-emerald-900 text-emerald-300',
    skipped: 'bg-gray-800 text-gray-500',
    edited: 'bg-blue-900 text-blue-300',
    confirmed: 'bg-gray-800 text-gray-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

type FilterType = 'all' | 'pending' | 'with-conditions' | 'universal' | 'accepted' | 'skipped' | 'confirmed';

export default function BackfillReview({ data, onRefresh }: Props) {
  const [filter, setFilter] = useState<FilterType>('pending');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editJson, setEditJson] = useState('');
  const [busy, setBusy] = useState(false);

  const filtered = data.suggestions.filter(s => {
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'with-conditions') return s.status === 'pending' && Object.keys(s.suggestedWhen).length > 0;
    if (filter === 'universal') return s.status === 'pending' && Object.keys(s.suggestedWhen).length === 0;
    if (filter === 'accepted') return s.status === 'accepted' || s.status === 'edited';
    if (filter === 'skipped') return s.status === 'skipped';
    if (filter === 'confirmed') return s.status === 'confirmed';
    return true;
  });

  const counts = {
    total: data.suggestions.length,
    pending: data.suggestions.filter(s => s.status === 'pending').length,
    accepted: data.suggestions.filter(s => s.status === 'accepted').length,
    edited: data.suggestions.filter(s => s.status === 'edited').length,
    skipped: data.suggestions.filter(s => s.status === 'skipped').length,
    confirmed: data.suggestions.filter(s => s.status === 'confirmed').length,
    withConditions: data.suggestions.filter(s => s.status === 'pending' && Object.keys(s.suggestedWhen).length > 0).length,
    universal: data.suggestions.filter(s => s.status === 'pending' && Object.keys(s.suggestedWhen).length === 0).length,
    highConf: data.suggestions.filter(s => s.status === 'pending' && s.confidence >= 0.8 && Object.keys(s.suggestedWhen).length > 0).length,
  };

  const doAction = useCallback(async (action: string, index?: number, when?: Record<string, unknown>) => {
    setBusy(true);
    try {
      const body: Record<string, unknown> = { action };
      if (index != null) body.index = index;
      if (when) body.when = when;
      await fetch(`/api/backfill/${data.anglerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      onRefresh();
    } finally {
      setBusy(false);
      setEditIndex(null);
    }
  }, [data.anglerId, onRefresh]);

  const realIndex = (s: Suggestion) => data.suggestions.indexOf(s);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            {counts.total} suggestions · {counts.accepted + counts.edited} accepted · {counts.confirmed} confirmed · {counts.skipped} skipped · {counts.pending} pending
          </span>
          <div className="flex gap-2">
            {counts.universal > 0 && (
              <button
                onClick={() => doAction('confirm-all-universal')}
                disabled={busy}
                className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                Confirm all universal ({counts.universal})
              </button>
            )}
            {counts.highConf > 0 && (
              <button
                onClick={() => doAction('accept-all-high')}
                disabled={busy}
                className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                Accept all high-confidence ({counts.highConf})
              </button>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${((counts.accepted + counts.edited + counts.confirmed + counts.skipped) / Math.max(counts.total, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {([
          ['all', `All (${counts.total})`],
          ['pending', `Pending (${counts.pending})`],
          ['with-conditions', `With conditions (${counts.withConditions})`],
          ['universal', `Universal (${counts.universal})`],
          ['accepted', `Accepted (${counts.accepted + counts.edited})`],
          ['confirmed', `Confirmed (${counts.confirmed})`],
          ['skipped', `Skipped (${counts.skipped})`],
        ] as [FilterType, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs px-3 py-1 rounded border ${
              filter === key
                ? 'border-emerald-600 text-emerald-400 bg-emerald-950'
                : 'border-gray-700 text-gray-400 hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Suggestion list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm py-8 text-center">No suggestions match this filter.</p>
        )}
        {filtered.map((s) => {
          const idx = realIndex(s);
          const hasConditions = Object.keys(s.suggestedWhen).length > 0;
          const isEditing = editIndex === idx;

          return (
            <div
              key={`${s.lure}-${s.ruleType}-${s.ruleIndex}`}
              className={`border rounded-lg p-3 ${confidenceBg(s.confidence)} bg-gray-900`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{s.ruleType}</span>
                    <span className="text-sm font-medium text-gray-200">{s.lure}</span>
                    <span className="text-xs text-yellow-600 font-mono">p{s.priority}</span>
                    {statusBadge(s.status)}
                    <span className={`text-xs font-mono ${confidenceColor(s.confidence)}`}>
                      {(s.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1 break-words">{s.originalText}</p>
                  {hasConditions ? (
                    <p className="text-xs text-emerald-400 font-mono">{formatWhen(s.suggestedWhen)}</p>
                  ) : (
                    <p className="text-xs text-gray-600 italic">No conditions — genuinely universal</p>
                  )}
                  {s.reasoning && (
                    <p className="text-xs text-gray-600 mt-1">{s.reasoning}</p>
                  )}
                </div>

                {s.status === 'pending' && (
                  <div className="flex gap-1 shrink-0">
                    {hasConditions ? (
                      <button
                        onClick={() => doAction('accept', idx)}
                        disabled={busy}
                        className="text-xs bg-emerald-800 hover:bg-emerald-700 text-emerald-200 px-2 py-1 rounded disabled:opacity-50"
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        onClick={() => doAction('confirm', idx)}
                        disabled={busy}
                        className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 px-2 py-1 rounded disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditIndex(idx);
                        setEditJson(JSON.stringify(s.suggestedWhen, null, 2));
                      }}
                      disabled={busy}
                      className="text-xs bg-blue-800 hover:bg-blue-700 text-blue-200 px-2 py-1 rounded disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => doAction('skip', idx)}
                      disabled={busy}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded disabled:opacity-50"
                    >
                      Skip
                    </button>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editJson}
                    onChange={e => setEditJson(e.target.value)}
                    className="w-full bg-gray-800 text-sm text-gray-200 rounded p-2 border border-gray-700 focus:border-blue-600 outline-none font-mono"
                    rows={5}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(editJson);
                          doAction('edit', idx, parsed);
                        } catch {
                          alert('Invalid JSON');
                        }
                      }}
                      disabled={busy}
                      className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      Save edit
                    </button>
                    <button
                      onClick={() => setEditIndex(null)}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
