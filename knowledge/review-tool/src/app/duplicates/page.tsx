'use client';

import { useState, useEffect, useCallback } from 'react';
import DuplicateGroup from '@/components/DuplicateGroup';

interface DuplicateItem {
  ruleIndex: number;
  text: string;
  priority: number;
  whenKeys: string[];
}

interface DupGroup {
  anglerId: string;
  anglerName: string;
  lure: string;
  type: 'tip' | 'color';
  items: DuplicateItem[];
  similarity: number;
}

export default function DuplicatesPage() {
  const [groups, setGroups] = useState<DupGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDuplicates = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/duplicates');
    const data = await res.json();
    setGroups(data.groups ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadDuplicates(); }, [loadDuplicates]);

  const handleDelete = async (anglerId: string, lure: string, type: string, ruleIndex: number) => {
    // Load angler data, remove rule at index, save
    const res = await fetch(`/api/angler/${anglerId}`);
    const data = await res.json();
    const opinion = data.opinions[lure];
    if (!opinion) return;

    if (type === 'tip') {
      opinion.tipRules.splice(ruleIndex, 1);
    } else {
      opinion.colorRules.splice(ruleIndex, 1);
    }

    await fetch(`/api/angler/${anglerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await loadDuplicates();
  };

  const handleAutoResolve = async (group: DupGroup) => {
    // Keep the highest priority item, delete the rest
    const sorted = [...group.items].sort((a, b) => b.priority - a.priority);
    const toDelete = sorted.slice(1);

    const res = await fetch(`/api/angler/${group.anglerId}`);
    const data = await res.json();
    const opinion = data.opinions[group.lure];
    if (!opinion) return;

    // Delete from highest index first to avoid shifting
    const indices = toDelete.map(d => d.ruleIndex).sort((a, b) => b - a);
    for (const idx of indices) {
      if (group.type === 'tip') {
        opinion.tipRules.splice(idx, 1);
      } else {
        opinion.colorRules.splice(idx, 1);
      }
    }

    await fetch(`/api/angler/${group.anglerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await loadDuplicates();
  };

  if (loading) return <div className="text-gray-500">Scanning for duplicates...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Duplicate Detector</h1>
      <p className="text-gray-500 mb-6">
        {groups.length} duplicate groups found (Jaccard similarity ≥ 0.7).
      </p>

      {groups.length === 0 ? (
        <div className="text-emerald-400 text-lg font-medium p-8 text-center border border-emerald-800 rounded bg-emerald-900/20">
          No duplicates found!
        </div>
      ) : (
        groups.map((group, idx) => (
          <DuplicateGroup
            key={idx}
            group={group}
            onDelete={handleDelete}
            onAutoResolve={handleAutoResolve}
          />
        ))
      )}
    </div>
  );
}
