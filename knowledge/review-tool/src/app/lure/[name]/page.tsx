'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { LureOpinion } from '@/lib/types';
import CompareView from '@/components/CompareView';

const BASE_LURES = [
  'Swim Jig', 'Structure Jig', 'Shakyhead', 'Neko Rig', 'Strolling Rig',
  'Spinnerbait (Colorado/Willow)', 'Chatterbait', 'Squarebill Crankbait',
  'Medium Diving Crankbait', 'Deep Diving Crankbait', 'Lipless Crankbait',
  'Suspending Jerkbait', 'Walking Topwater', 'Buzzbait', 'Drop Shot',
  'Ned Rig', 'Texas Rig (Creature Bait)', 'Carolina Rig', 'Flipping Jig',
  'Football Jig', 'Hair Jig / Finesse Jig', 'Crawfish Pattern Jig',
  'Blade Bait', 'Jigging Spoon', 'Spy Bait', '10" Worm (Shakey/TX)',
];

export default function LureComparePage() {
  const { name } = useParams<{ name: string }>();
  const lureName = decodeURIComponent(name);
  const [data, setData] = useState<Record<string, { name: string; opinion: LureOpinion }> | null>(null);

  useEffect(() => {
    fetch(`/api/compare/${encodeURIComponent(lureName)}`)
      .then(r => r.json())
      .then(setData);
  }, [lureName]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Lure Comparison: {lureName}</h1>
        <p className="text-sm text-gray-400">
          What each angler says about this lure, side by side.
        </p>
      </div>

      {/* Lure selector */}
      <div className="flex flex-wrap gap-2">
        {BASE_LURES.map(lure => (
          <a
            key={lure}
            href={`/lure/${encodeURIComponent(lure)}`}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              lure === lureName
                ? 'bg-emerald-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {lure}
          </a>
        ))}
      </div>

      {data === null ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <CompareView data={data} />
      )}
    </div>
  );
}
