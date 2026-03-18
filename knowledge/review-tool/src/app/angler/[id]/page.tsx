'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { MergedReview, LureOpinion, KnowledgeEntry } from '@/lib/types';
import LurePanel from '@/components/LurePanel';
import KnowledgeTable from '@/components/KnowledgeTable';
import ExportPanel from '@/components/ExportPanel';

type Tab = 'opinions' | 'knowledge' | 'export';

export default function AnglerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MergedReview | null>(null);
  const [tab, setTab] = useState<Tab>('opinions');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch(`/api/angler/${id}`).then(r => r.json()).then(setData);
  }, [id]);

  const save = useCallback(async (updated: MergedReview) => {
    setSaving(true);
    await fetch(`/api/angler/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setSaving(false);
    setDirty(false);
  }, [id]);

  function updateOpinion(lureName: string, updated: LureOpinion) {
    if (!data) return;
    const newData = {
      ...data,
      opinions: { ...data.opinions, [lureName]: updated },
    };
    setData(newData);
    setDirty(true);
    save(newData);
  }

  function deleteKnowledge(index: number) {
    if (!data) return;
    const knowledge = data.knowledge.filter((_, i) => i !== index);
    const newData = { ...data, knowledge };
    setData(newData);
    setDirty(true);
    save(newData);
  }

  function updateKnowledge(index: number, updated: KnowledgeEntry) {
    if (!data) return;
    const knowledge = [...data.knowledge];
    knowledge[index] = updated;
    const newData = { ...data, knowledge };
    setData(newData);
    setDirty(true);
    save(newData);
  }

  if (!data) return <p className="text-gray-500">Loading...</p>;

  const lures = Object.values(data.opinions).sort((a, b) => b.tipRules.length - a.tipRules.length);
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'opinions', label: 'Lure Opinions', count: lures.length },
    { key: 'knowledge', label: 'Knowledge', count: data.knowledge.length },
    { key: 'export', label: 'Export' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{id.toUpperCase()}</h1>
          <p className="text-sm text-gray-400">
            {data.sources.length} sources, {lures.length} lures, {data.knowledge.length} knowledge entries
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-yellow-500">Saving...</span>}
          {dirty && !saving && <span className="text-xs text-yellow-500">Unsaved changes</span>}
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-800">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              tab === t.key
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
            {t.count != null && <span className="ml-1 text-xs text-gray-600">({t.count})</span>}
          </button>
        ))}
      </div>

      {tab === 'opinions' && (
        <div className="space-y-3">
          {lures.map(opinion => (
            <LurePanel
              key={opinion.lure}
              opinion={opinion}
              onUpdate={updated => updateOpinion(opinion.lure, updated)}
            />
          ))}
        </div>
      )}

      {tab === 'knowledge' && (
        <KnowledgeTable
          entries={data.knowledge}
          onDelete={deleteKnowledge}
          onUpdate={updateKnowledge}
        />
      )}

      {tab === 'export' && <ExportPanel anglerId={id} />}
    </div>
  );
}
