'use client';

import { useState, useEffect, useCallback } from 'react';
import CredibilityEditor from '@/components/CredibilityEditor';

interface AnglerData {
  id: string;
  name: string;
  opinions: Record<string, { tipRules: { tip: string }[]; sources: string[] }>;
  credibility: Record<string, number | Array<{ score: number; source: string }>>;
}

export default function CredibilityPage() {
  const [anglers, setAnglers] = useState<AnglerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const listRes = await fetch('/api/anglers');
    const summaries = await listRes.json();

    const anglerData: AnglerData[] = [];
    for (const s of summaries) {
      const res = await fetch(`/api/angler/${s.id}`);
      const data = await res.json();
      anglerData.push({ id: s.id, name: s.name, opinions: data.opinions, credibility: data.credibility });
    }
    setAnglers(anglerData);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSave = async (anglerId: string, credibility: Record<string, number>) => {
    setSaving(true);
    const res = await fetch(`/api/angler/${anglerId}`);
    const data = await res.json();
    data.credibility = credibility;
    await fetch(`/api/angler/${anglerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
    await loadAll();
  };

  if (loading) return <div className="text-gray-500">Loading credibility data...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Credibility Editor</h1>
      <p className="text-gray-500 mb-6">
        Set per-lure credibility weights (0-1) for each angler. Higher = more influence when anglers disagree.
      </p>

      {saving && (
        <div className="fixed top-4 right-4 bg-yellow-900 border border-yellow-700 rounded px-4 py-2 text-sm text-yellow-300 z-50">
          Saving...
        </div>
      )}

      <CredibilityEditor anglers={anglers} onSave={handleSave} />
    </div>
  );
}
