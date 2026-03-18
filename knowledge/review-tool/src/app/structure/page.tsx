'use client';

import { useState, useEffect, useCallback } from 'react';
import StructureBuilder from '@/components/StructureBuilder';
import { STRUCTURE_TYPES } from '@/lib/constants';

interface StructureCandidate {
  anglerId: string;
  anglerName: string;
  source: 'knowledge' | 'tipRule';
  text: string;
  lure?: string;
  ruleIndex?: number;
  suggestedType: string | null;
  confidence: number;
}

interface AnglerStructure {
  id: string;
  name: string;
  structureAdvice: Record<string, Array<{ advice: string; source: string }>>;
}

export default function StructurePage() {
  const [candidates, setCandidates] = useState<StructureCandidate[]>([]);
  const [anglerStructure, setAnglerStructure] = useState<AnglerStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [candRes, anglersRes] = await Promise.all([
      fetch('/api/structure/candidates'),
      fetch('/api/anglers'),
    ]);
    const candData = await candRes.json();
    const summaries = await anglersRes.json();

    setCandidates(candData.candidates ?? []);

    // Load structure advice for each angler
    const structures: AnglerStructure[] = [];
    for (const s of summaries) {
      const res = await fetch(`/api/angler/${s.id}`);
      const data = await res.json();
      structures.push({
        id: s.id,
        name: s.name,
        structureAdvice: data.structureAdvice ?? {},
      });
    }
    setAnglerStructure(structures);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAssign = async (anglerId: string, structureType: string, advice: string) => {
    setSaving(true);
    await fetch('/api/structure/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anglerId, structureType, advice }),
    });
    setSaving(false);
    await loadData();
  };

  if (loading) return <div className="text-gray-500">Loading structure data...</div>;

  // Summary stats
  const totalSlots = anglerStructure.length * STRUCTURE_TYPES.length;
  const filledSlots = anglerStructure.reduce((sum, a) => {
    return sum + STRUCTURE_TYPES.filter(t => a.structureAdvice[t]?.length > 0).length;
  }, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Structure Advice Builder</h1>
      <p className="text-gray-500 mb-4">
        {candidates.length} candidates found. {filledSlots}/{totalSlots} structure slots filled.
      </p>

      {saving && (
        <div className="fixed top-4 right-4 bg-yellow-900 border border-yellow-700 rounded px-4 py-2 text-sm text-yellow-300 z-50">
          Saving...
        </div>
      )}

      <StructureBuilder
        candidates={candidates}
        anglerStructure={anglerStructure}
        onAssign={handleAssign}
      />
    </div>
  );
}
