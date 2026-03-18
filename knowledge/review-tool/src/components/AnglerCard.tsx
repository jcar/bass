'use client';

import Link from 'next/link';
import type { AnglerSummary } from '@/lib/types';

export default function AnglerCard({ angler }: { angler: AnglerSummary }) {
  return (
    <Link
      href={`/angler/${angler.id}`}
      className="block bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-emerald-600 transition-colors"
    >
      <h2 className="text-xl font-semibold text-emerald-400 mb-2">{angler.name}</h2>
      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
        <div>
          <span className="text-gray-500">Sources</span>
          <p className="text-lg font-mono">{angler.sources}</p>
        </div>
        <div>
          <span className="text-gray-500">Lures</span>
          <p className="text-lg font-mono">{angler.lures}</p>
        </div>
        <div>
          <span className="text-gray-500">Knowledge</span>
          <p className="text-lg font-mono">{angler.knowledge}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {angler.topCategories.map(cat => (
          <span key={cat} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
            {cat}
          </span>
        ))}
      </div>
    </Link>
  );
}
