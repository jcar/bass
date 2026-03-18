'use client';

import { useState } from 'react';
import type { WhatToThrowResult } from '@/lib/whatToThrow';
import type { SeasonalPhase, StructureTarget, WeatherConditions } from '@/lib/types';
import { ANGLER_META } from '@/lib/theme';
import AnglerDeepDive from './AnglerDeepDive';
import WhatToThrowCard from './WhatToThrowCard';

interface WhatToThrowSectionProps {
  result: WhatToThrowResult;
  seasonalPhase: SeasonalPhase;
  structureTargets: StructureTarget[];
  conditions?: WeatherConditions;
  onFollowAngler?: (anglerId: string) => void;
}

export default function WhatToThrowSection({
  result, seasonalPhase, structureTargets, conditions, onFollowAngler,
}: WhatToThrowSectionProps) {
  const [followingAngler, setFollowingAngler] = useState<string | null>(null);

  // Rods 2-6 (rod 1 is handled by TopPickCard in page.tsx)
  const alternateCards = result.cards.slice(1);

  if (alternateCards.length === 0) return null;

  // Follow mode: show deep dive for the selected angler
  if (followingAngler) {
    const meta = ANGLER_META[followingAngler] ?? { fullName: followingAngler, style: '', accent: '#64748b' };
    return (
      <div className="space-y-4">
        <AnglerDeepDive
          anglerId={followingAngler}
          meta={meta}
          seasonalPhase={seasonalPhase}
          structureTargets={structureTargets}
          conditions={conditions}
          onBack={() => setFollowingAngler(null)}
        />
      </div>
    );
  }

  const handleFollow = (anglerId: string) => {
    if (onFollowAngler) {
      onFollowAngler(anglerId);
    } else {
      setFollowingAngler(anglerId);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Rods 2–{alternateCards.length + 1}
      </h2>
      {alternateCards.map(card => (
        <WhatToThrowCard
          key={card.lure.name}
          card={card}
          onFollowAngler={handleFollow}
        />
      ))}
    </div>
  );
}
