'use client';

import type { ColorRule } from '@/lib/types';

export default function ColorSwatch({ rule, onDelete }: { rule: ColorRule; onDelete?: () => void }) {
  const conditionText = formatConditions(rule.when);

  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <div
        className="w-6 h-6 rounded border border-gray-700 shrink-0"
        style={{ backgroundColor: rule.hex }}
        title={rule.hex}
      />
      <span className="text-sm font-medium">{rule.color}</span>
      <span className="text-xs text-gray-500 font-mono">{rule.hex}</span>
      <span className="text-xs text-yellow-600 font-mono">p{rule.priority}</span>
      {conditionText && (
        <span className="text-xs text-gray-500">{conditionText}</span>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-xs text-red-500 opacity-0 group-hover:opacity-100 ml-auto"
        >
          delete
        </button>
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
