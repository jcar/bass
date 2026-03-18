'use client';

import { useState, useMemo } from 'react';
import type { KnowledgeEntry } from '@/lib/types';

interface Props {
  entries: KnowledgeEntry[];
  onDelete: (index: number) => void;
  onUpdate: (index: number, updated: KnowledgeEntry) => void;
}

export default function KnowledgeTable({ entries, onDelete, onUpdate }: Props) {
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(entries.map(e => e.category));
    return [...cats].sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e, _i) => {
      if (categoryFilter && e.category !== categoryFilter) return false;
      if (filter) {
        const q = filter.toLowerCase();
        return (
          e.topic.toLowerCase().includes(q) ||
          e.insight.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, filter, categoryFilter]);

  function startEdit(origIndex: number, insight: string) {
    setEditingRow(origIndex);
    setEditText(insight);
  }

  function saveEdit(origIndex: number) {
    const entry = entries[origIndex];
    onUpdate(origIndex, { ...entry, insight: editText });
    setEditingRow(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Search knowledge..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 bg-gray-800 text-sm text-gray-200 rounded px-3 py-2 border border-gray-700 focus:border-emerald-600 outline-none"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-gray-800 text-sm text-gray-200 rounded px-3 py-2 border border-gray-700"
        >
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="text-xs text-gray-500">{filtered.length} entries</span>
      </div>

      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 text-gray-500 text-xs uppercase">
              <th className="text-left px-3 py-2 w-36">Category</th>
              <th className="text-left px-3 py-2 w-44">Topic</th>
              <th className="text-left px-3 py-2">Insight</th>
              <th className="text-left px-3 py-2 w-24">Source</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const origIndex = entries.indexOf(entry);
              const isExpanded = expandedRow === origIndex;
              const isEditing = editingRow === origIndex;

              return (
                <tr
                  key={origIndex}
                  className="border-t border-gray-800 hover:bg-gray-900/50 cursor-pointer group"
                  onClick={() => setExpandedRow(isExpanded ? null : origIndex)}
                >
                  <td className="px-3 py-2 align-top">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-gray-400">{entry.topic}</td>
                  <td className="px-3 py-2 align-top text-gray-300">
                    {isEditing ? (
                      <div onClick={e => e.stopPropagation()}>
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="w-full bg-gray-800 text-sm text-gray-200 rounded p-2 border border-gray-700"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => saveEdit(origIndex)} className="text-xs text-emerald-400">Save</button>
                          <button onClick={() => setEditingRow(null)} className="text-xs text-gray-500">Cancel</button>
                        </div>
                      </div>
                    ) : isExpanded ? (
                      <div>
                        <p>{entry.insight}</p>
                        {Object.keys(entry.conditions).length > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            Conditions: {JSON.stringify(entry.conditions)}
                          </p>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); startEdit(origIndex, entry.insight); }}
                          className="text-xs text-emerald-400 mt-1"
                        >
                          edit
                        </button>
                      </div>
                    ) : (
                      <span className="line-clamp-1">{entry.insight}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-gray-600 truncate max-w-[100px]">
                    {entry.source.replace('.txt', '')}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(origIndex); }}
                      className="text-xs text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
