'use client';

import { useState } from 'react';
import ConditionSimulator from '@/components/ConditionSimulator';
import SimulationResults from '@/components/SimulationResults';

interface SimResult {
  matchingTips: Array<{
    anglerId: string; anglerName: string; lure: string;
    tip: string; priority: number; skippedFields: string[];
  }>;
  matchingColors: Array<{
    anglerId: string; anglerName: string; lure: string;
    color: string; hex: string; priority: number; skippedFields: string[];
  }>;
  matchingModifiers: Array<{
    anglerId: string; anglerName: string; lure: string;
    adjustment: number; skippedFields: string[];
  }>;
  totalRules: number;
  nonFiringCount: number;
  skippedFieldWarnings: string[];
}

export default function SimulatePage() {
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (conditions: Record<string, unknown>) => {
    setLoading(true);
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conditions),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Condition Simulator</h1>
      <p className="text-gray-500 mb-6">
        Preview what StrikeZone would see. Input conditions, see which tips/colors/modifiers fire.
      </p>

      <ConditionSimulator onSimulate={handleSimulate} loading={loading} />

      {result && <SimulationResults result={result} />}
    </div>
  );
}
