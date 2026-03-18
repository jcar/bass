'use client';

import { useState } from 'react';
import { STRUCTURE_TYPES } from '@/lib/constants';

interface StructureCandidate {
  anglerId: string;
  anglerName: string;
  source: 'knowledge' | 'tipRule';
  text: string;
  lure?: string;
  suggestedType: string | null;
  confidence: number;
}

interface AnglerStructure {
  id: string;
  name: string;
  structureAdvice: Record<string, Array<{ advice: string; source: string }>>;
}

interface Props {
  candidates: StructureCandidate[];
  anglerStructure: AnglerStructure[];
  onAssign: (anglerId: string, structureType: string, advice: string) => void;
}

export default function StructureBuilder({ candidates, anglerStructure, onAssign }: Props) {
  const [selectedAngler, setSelectedAngler] = useState(anglerStructure[0]?.id ?? '');
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState('');
  const [filterAngler, setFilterAngler] = useState('');

  const currentAngler = anglerStructure.find(a => a.id === selectedAngler);

  const filteredCandidates = filterAngler
    ? candidates.filter(c => c.anglerId === filterAngler)
    : candidates;

  // Group candidates by angler
  const grouped = new Map<string, StructureCandidate[]>();
  for (const c of filteredCandidates) {
    const list = grouped.get(c.anglerId) ?? [];
    list.push(c);
    grouped.set(c.anglerId, list);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Candidate list */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-900 flex items-center gap-3">
          <span className="text-sm font-medium">Candidates</span>
          <select
            value={filterAngler}
            onChange={e => setFilterAngler(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs"
          >
            <option value="">All anglers</option>
            {anglerStructure.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-800/50">
          {[...grouped.entries()].map(([anglerId, items]) => (
            <div key={anglerId}>
              <div className="px-4 py-2 bg-gray-900/50 text-xs text-gray-500 font-medium sticky top-0">
                {items[0].anglerName} ({items.length} candidates)
              </div>
              {items.map((c, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-900/30 cursor-pointer"
                  onClick={() => {
                    setEditText(c.text);
                    setEditType(c.suggestedType ?? '');
                    setSelectedAngler(c.anglerId);
                  }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      c.source === 'knowledge' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                    }`}>
                      {c.source}
                    </span>
                    {c.suggestedType && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-900 text-emerald-300">
                        {c.suggestedType}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600">
                      {Math.round(c.confidence * 100)}% conf
                    </span>
                    {c.lure && <span className="text-[10px] text-gray-600">{c.lure}</span>}
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-2">{c.text}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Structure slots */}
      <div>
        {/* Angler selector */}
        <div className="mb-4">
          <select
            value={selectedAngler}
            onChange={e => setSelectedAngler(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm w-full"
          >
            {anglerStructure.map(a => {
              const filled = STRUCTURE_TYPES.filter(t => a.structureAdvice[t]?.length > 0).length;
              return (
                <option key={a.id} value={a.id}>
                  {a.name} — {filled}/{STRUCTURE_TYPES.length} filled
                </option>
              );
            })}
          </select>
        </div>

        {/* Structure type slots */}
        <div className="space-y-2">
          {STRUCTURE_TYPES.map(type => {
            const existing = currentAngler?.structureAdvice[type];
            const hasAdvice = existing && existing.length > 0;

            return (
              <div key={type} className={`border rounded-lg p-3 ${hasAdvice ? 'border-emerald-800 bg-emerald-900/10' : 'border-gray-800'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${hasAdvice ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {type}
                  </span>
                  {hasAdvice && <span className="text-xs text-emerald-600">filled</span>}
                </div>

                {hasAdvice ? (
                  <div className="text-xs text-gray-400">{existing[0].advice}</div>
                ) : (
                  <div className="text-xs text-gray-600 italic">No advice yet</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Edit/assign panel */}
        {editText && (
          <div className="mt-4 border border-yellow-800 rounded-lg p-3 bg-yellow-900/10">
            <div className="text-xs text-yellow-400 mb-2">Assign to structure type:</div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm h-20 mb-2"
            />
            <div className="flex items-center gap-2">
              <select
                value={editType}
                onChange={e => setEditType(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm flex-1"
              >
                <option value="">Select type...</option>
                {STRUCTURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                onClick={() => {
                  if (editType && selectedAngler && editText) {
                    onAssign(selectedAngler, editType, editText);
                    setEditText('');
                    setEditType('');
                  }
                }}
                disabled={!editType || !selectedAngler || !editText}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded text-sm disabled:opacity-50"
              >
                Assign
              </button>
              <button
                onClick={() => { setEditText(''); setEditType(''); }}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
