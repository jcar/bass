'use client';

import { useState } from 'react';
import type { TipRule } from '@/lib/types';

interface Props {
  rule: TipRule;
  index: number;
  onUpdate: (index: number, updated: TipRule) => void;
  onDelete: (index: number) => void;
}

export default function TipEditor({ rule, index, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(rule.tip);
  const [priority, setPriority] = useState(rule.priority);

  const conditionText = formatConditions(rule.when);

  function save() {
    onUpdate(index, { ...rule, tip: text, priority });
    setEditing(false);
  }

  function cancel() {
    setText(rule.tip);
    setPriority(rule.priority);
    setEditing(false);
  }

  return (
    <div className="border-b border-gray-800 py-3 group">
      <div className="flex items-start gap-2">
        <span className="text-xs text-yellow-600 font-mono shrink-0 mt-0.5">p{rule.priority}</span>
        {editing ? (
          <div className="flex-1 space-y-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-gray-800 text-sm text-gray-200 rounded p-2 border border-gray-700 focus:border-emerald-600 outline-none"
              rows={3}
            />
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500">Priority:</label>
              <input
                type="number"
                value={priority}
                onChange={e => setPriority(Number(e.target.value))}
                className="w-16 bg-gray-800 text-sm text-gray-200 rounded px-2 py-1 border border-gray-700"
              />
              <button onClick={save} className="text-xs text-emerald-400 hover:text-emerald-300">Save</button>
              <button onClick={cancel} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
            </div>
          </div>
        ) : (
          <p
            className="text-sm text-gray-300 flex-1 cursor-pointer hover:text-gray-100"
            onClick={() => setEditing(true)}
          >
            {rule.tip}
          </p>
        )}
        <button
          onClick={() => onDelete(index)}
          className="text-xs text-red-500 opacity-0 group-hover:opacity-100 shrink-0"
        >
          delete
        </button>
      </div>
      {conditionText && (
        <p className="text-xs text-gray-600 mt-1 ml-8">{conditionText}</p>
      )}
    </div>
  );
}

function formatConditions(when: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(when)) {
    if (Array.isArray(val)) parts.push(`${key}: ${val.join(', ')}`);
    else if (typeof val === 'boolean') parts.push(key);
    else if (val != null) parts.push(`${key}: ${String(val)}`);
  }
  return parts.join(' | ');
}
