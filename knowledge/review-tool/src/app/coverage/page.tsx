'use client';

import { useState, useEffect } from 'react';
import CoverageMatrix from '@/components/CoverageMatrix';

interface CoverageCell {
  anglerId: string;
  anglerName: string;
  lure: string;
  tipCount: number;
  colorCount: number;
  emptyWhenTips: number;
  emptyWhenColors: number;
  nonStandardFields: number;
  hasCredibility: boolean;
  sources: string[];
}

export default function CoveragePage() {
  const [cells, setCells] = useState<CoverageCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/coverage').then(r => r.json()).then(data => {
      setCells(data.cells ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-500">Loading coverage data...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Coverage Matrix</h1>
      <p className="text-gray-500 mb-6">
        Heatmap showing data strength per angler × lure combination.
      </p>
      <CoverageMatrix cells={cells} />
    </div>
  );
}
