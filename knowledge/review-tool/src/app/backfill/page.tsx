'use client';

import { useEffect, useState, useCallback } from 'react';
import BackfillReview from '@/components/BackfillReview';

interface AnglerSummary {
  id: string;
  totalEmpty: number;
  total: number;
  pending: number;
  accepted: number;
  skipped: number;
  edited: number;
  withConditions: number;
}

interface BackfillData {
  anglerId: string;
  totalEmpty: number;
  processed: number;
  suggestions: Array<{
    lure: string;
    ruleType: 'tip' | 'color';
    ruleIndex: number;
    originalText: string;
    priority: number;
    suggestedWhen: Record<string, unknown>;
    confidence: number;
    reasoning: string;
    status: 'pending' | 'accepted' | 'skipped' | 'edited';
  }>;
}

export default function BackfillPage() {
  const [summaries, setSummaries] = useState<AnglerSummary[]>([]);
  const [selectedAngler, setSelectedAngler] = useState<string | null>(null);
  const [anglerData, setAnglerData] = useState<BackfillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummaries = useCallback(async () => {
    try {
      const res = await fetch('/api/backfill/all');
      if (res.ok) {
        const data = await res.json();
        setSummaries(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSummaries(); }, [loadSummaries]);

  const loadAngler = useCallback(async (id: string) => {
    setSelectedAngler(id);
    setError(null);
    try {
      const res = await fetch(`/api/backfill/${id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to load');
        setAnglerData(null);
        return;
      }
      setAnglerData(await res.json());
    } catch {
      setError('Failed to load backfill data');
    }
  }, []);

  const refresh = useCallback(() => {
    if (selectedAngler) loadAngler(selectedAngler);
    loadSummaries();
  }, [selectedAngler, loadAngler, loadSummaries]);

  if (loading) {
    return <p className="text-gray-500">Loading backfill data...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Condition Backfill</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review LLM-suggested conditions for rules with empty <code className="text-gray-400">when</code> clauses.
          Run <code className="text-gray-400">python3 scripts/backfill-conditions.py --all</code> to generate suggestions.
        </p>
      </div>

      {summaries.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">No backfill data found.</p>
          <p className="text-sm text-gray-600 mt-2">
            Run: <code className="text-gray-400">python3 scripts/backfill-conditions.py --all</code>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {summaries.map(s => (
            <button
              key={s.id}
              onClick={() => loadAngler(s.id)}
              className={`text-left border rounded-lg p-3 transition-colors ${
                selectedAngler === s.id
                  ? 'border-emerald-600 bg-emerald-950'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
            >
              <div className="font-medium text-gray-200 text-sm">{s.id}</div>
              <div className="text-xs text-gray-500 mt-1">
                {s.total} suggestions · {s.pending} pending
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${((s.accepted + s.edited + s.skipped) / Math.max(s.total, 1)) * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {anglerData && (
        <BackfillReview data={anglerData} onRefresh={refresh} />
      )}
    </div>
  );
}
