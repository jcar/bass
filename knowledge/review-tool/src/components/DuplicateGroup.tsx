'use client';

import { useState } from 'react';

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

interface Props {
  group: DupGroup;
  onDelete: (anglerId: string, lure: string, type: string, ruleIndex: number) => void;
  onAutoResolve: (group: DupGroup) => void;
}

/** Highlight words unique to this item vs others in the group */
function highlightUnique(text: string, allTexts: string[]): React.ReactNode {
  const words = text.split(/\s+/);
  const otherWords = new Set<string>();
  for (const other of allTexts) {
    if (other === text) continue;
    for (const w of other.toLowerCase().split(/\s+/)) otherWords.add(w);
  }

  return words.map((word, i) => {
    const isUnique = !otherWords.has(word.toLowerCase().replace(/[^a-z0-9]/g, ''));
    return (
      <span key={i}>
        {i > 0 ? ' ' : ''}
        {isUnique ? <strong className="text-yellow-300">{word}</strong> : word}
      </span>
    );
  });
}

export default function DuplicateGroup({ group, onDelete, onAutoResolve }: Props) {
  const [expanded, setExpanded] = useState(true);
  const allTexts = group.items.map(i => i.text);
  const highestPriority = Math.max(...group.items.map(i => i.priority));

  return (
    <div className="mb-4 border border-gray-800 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-900 cursor-pointer hover:bg-gray-800"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500">{expanded ? '▼' : '▶'}</span>
          <span className="text-gray-300 font-medium">{group.anglerName}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-400">{group.lure}</span>
          <span className={`px-1.5 py-0.5 rounded text-xs ${
            group.type === 'tip' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
          }`}>
            {group.type}
          </span>
          <span className="text-gray-600 text-xs">{group.items.length} items · {Math.round(group.similarity * 100)}% similar</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onAutoResolve(group); }}
          className="px-2 py-1 text-xs bg-emerald-900/50 border border-emerald-800 rounded hover:bg-emerald-900"
        >
          Auto-resolve: keep p{highestPriority}
        </button>
      </div>

      {expanded && (
        <div className="divide-y divide-gray-800/50">
          {group.items.map((item, idx) => (
            <div key={idx} className="px-4 py-3 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-gray-500">p{item.priority}</span>
                  <span className="font-mono text-xs text-gray-600">idx:{item.ruleIndex}</span>
                  {item.whenKeys.length > 0 && (
                    <span className="text-xs text-gray-600">when: {item.whenKeys.join(', ')}</span>
                  )}
                  {item.priority === highestPriority && (
                    <span className="text-xs text-emerald-600">★ highest</span>
                  )}
                </div>
                <div className="text-sm text-gray-300">
                  {highlightUnique(item.text, allTexts)}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onDelete(group.anglerId, group.lure, group.type, item.ruleIndex)}
                  className="px-2 py-1 text-xs bg-red-900/50 border border-red-800 rounded hover:bg-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
