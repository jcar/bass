'use client';

import type { KnowledgeEntry } from '@/lib/knowledge';

const CATEGORY_LABELS: Record<string, string> = {
  'retrieve-technique': 'Retrieve',
  'seasonal-pattern': 'Seasonal',
  'color-selection': 'Color',
  'structure-reading': 'Structure',
  'depth-strategy': 'Depth',
  'fish-behavior': 'Fish Behavior',
  'forage-matching': 'Forage',
  'weather-adaptation': 'Weather',
  'lure-selection': 'Lure Selection',
  'gear': 'Gear',
  'tournament-strategy': 'Tournament',
  'lake-reading': 'Lake Reading',
  'trailer-modification': 'Trailer',
  'bait-design': 'Bait Design',
  'electronics': 'Electronics',
  'mental-approach': 'Mindset',
};

interface KnowledgeCardProps {
  entry: KnowledgeEntry;
  accentColor: string;
}

export default function KnowledgeCard({ entry, accentColor }: KnowledgeCardProps) {
  const categoryLabel = CATEGORY_LABELS[entry.category] ?? entry.category;

  return (
    <div
      className="bg-slate-900 border border-slate-700/50 rounded-lg p-3 border-l-2"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: `${accentColor}15`, color: accentColor }}
        >
          {categoryLabel}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">{entry.angler}</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed italic">{entry.insight}</p>
    </div>
  );
}
