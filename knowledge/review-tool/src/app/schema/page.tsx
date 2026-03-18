'use client';

import { useState, useEffect, useCallback } from 'react';
import SchemaIssueTable from '@/components/SchemaIssueTable';

interface SchemaIssue {
  anglerId: string;
  anglerName: string;
  lure: string;
  ruleType: 'tip' | 'color' | 'modifier';
  ruleIndex: number;
  field: string;
  value: unknown;
  tip: string;
}

export default function SchemaPage() {
  const [issues, setIssues] = useState<SchemaIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/schema/issues');
    const data = await res.json();
    setIssues(data.issues ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadIssues(); }, [loadIssues]);

  const handleAction = async (
    items: SchemaIssue[],
    action: 'appendToTip' | 'delete'
  ) => {
    setSaving(true);
    const payload = items.map(i => ({
      anglerId: i.anglerId,
      lure: i.lure,
      ruleType: i.ruleType,
      ruleIndex: i.ruleIndex,
      field: i.field,
      action,
    }));
    await fetch('/api/schema/remap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    await loadIssues();
  };

  const handleRemap = async (
    issue: SchemaIssue,
    remapTo: string,
    remapValue?: unknown,
  ) => {
    setSaving(true);
    await fetch('/api/schema/remap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anglerId: issue.anglerId,
        lure: issue.lure,
        ruleType: issue.ruleType,
        ruleIndex: issue.ruleIndex,
        field: issue.field,
        action: 'remap',
        remapTo,
        remapValue,
      }),
    });
    setSaving(false);
    await loadIssues();
  };

  // Group by field name
  const grouped = new Map<string, SchemaIssue[]>();
  for (const issue of issues) {
    const list = grouped.get(issue.field) ?? [];
    list.push(issue);
    grouped.set(issue.field, list);
  }
  const sortedGroups = [...grouped.entries()].sort(([, a], [, b]) => b.length - a.length);

  if (loading) {
    return <div className="text-gray-500">Loading schema issues...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Schema Validation & Cleanup</h1>
      <p className="text-gray-500 mb-4">
        {issues.length} non-standard <code className="text-gray-400">when</code> fields across {grouped.size} field names.
      </p>

      {saving && (
        <div className="fixed top-4 right-4 bg-yellow-900 border border-yellow-700 rounded px-4 py-2 text-sm text-yellow-300 z-50">
          Saving...
        </div>
      )}

      {/* Explainer */}
      <div className="mb-6">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showHelp ? 'Hide' : 'Show'} how this works
        </button>
        {showHelp && (
          <div className="mt-2 bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm space-y-3">
            <div>
              <div className="text-gray-300 font-medium mb-1">What&apos;s the problem?</div>
              <div className="text-gray-500">
                Each tip/color/modifier rule has a <code className="text-gray-400">when</code> condition that controls when it fires.
                StrikeZone only understands 11 specific fields (season, waterTemp, waterClarity, etc.).
                The fields listed below were extracted from transcripts but don&apos;t match any of those 11 —
                so StrikeZone <span className="text-red-400">silently ignores them</span>, and the rule fires more broadly than intended.
              </div>
            </div>
            <div>
              <div className="text-gray-300 font-medium mb-1">What can I do about each one?</div>
              <div className="text-gray-500 space-y-2">
                <div className="flex gap-2">
                  <span className="shrink-0 px-1.5 py-0.5 bg-yellow-900/50 border border-yellow-800 rounded text-xs text-yellow-300">Append to tip</span>
                  <span>Moves the info into the tip text as a bracketed note, e.g. <code className="text-gray-400">[cover: lily pads]</code>. The context is preserved for humans reading the tip, but removed from the condition. <span className="text-emerald-400">Best for context that&apos;s useful but can&apos;t be mapped to a valid field.</span></span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300">Remap</span>
                  <span>Moves the value to a valid field. For example, <code className="text-gray-400">depth: &quot;deep&quot;</code> could be remapped to <code className="text-gray-400">fishDepth</code>. Use the dropdown to pick the target field. <span className="text-emerald-400">Best when there&apos;s a direct mapping to a valid field.</span></span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 px-1.5 py-0.5 bg-red-900/50 border border-red-800 rounded text-xs text-red-300">Delete</span>
                  <span>Removes the field entirely. The rule will still exist but without this condition. <span className="text-emerald-400">Best for fields that are redundant or not useful.</span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {sortedGroups.length === 0 ? (
        <div className="text-emerald-400 text-lg font-medium p-8 text-center border border-emerald-800 rounded bg-emerald-900/20">
          All fields are valid! No schema issues found.
        </div>
      ) : (
        sortedGroups.map(([field, fieldIssues]) => (
          <SchemaIssueTable
            key={field}
            field={field}
            issues={fieldIssues}
            onBatchAction={handleAction}
            onRemap={handleRemap}
          />
        ))
      )}
    </div>
  );
}
