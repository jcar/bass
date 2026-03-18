'use client';

import { useState, useCallback } from 'react';
import { Share2, Check, Download } from 'lucide-react';
import type { WeatherConditions, Lake } from '@/lib/types';
import { encodeSnapshot } from '@/lib/shareUrl';

interface ShareButtonProps {
  lake: Lake | null;
  conditions: WeatherConditions;
  maxDepth: number;
}

export default function ShareButton({ lake, conditions, maxDepth }: ShareButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleShare = useCallback(async () => {
    const query = encodeSnapshot(lake, conditions, maxDepth);
    const url = `${window.location.origin}${window.location.pathname}?${query}`;

    // Try to render the share card image
    const renderCard = (window as unknown as Record<string, unknown>).__strikezoneRenderCard as (() => Promise<Blob | null>) | undefined;
    const blob = renderCard ? await renderCard() : null;

    const canNativeShare = typeof navigator.share === 'function';

    if (canNativeShare && blob) {
      try {
        const file = new File([blob], 'strikezone-report.png', { type: 'image/png' });
        await navigator.share({
          title: `StrikeZone — ${lake?.name ?? 'Fishing Report'}`,
          text: `Check out today's bite report`,
          url,
          files: [file],
        });
        setFeedback('Shared!');
      } catch (e) {
        // User cancelled or share failed — fall through to clipboard
        if ((e as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(url);
          setFeedback('Link copied!');
        }
      }
    } else {
      // Desktop: copy URL + download card
      await navigator.clipboard.writeText(url);
      setFeedback('Link copied!');

      if (blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'strikezone-report.png';
        a.click();
        URL.revokeObjectURL(a.href);
      }
    }

    if (feedback !== null) return; // prevent double-setting
    setTimeout(() => setFeedback(null), 2500);
  }, [lake, conditions, maxDepth, feedback]);

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
      title="Share snapshot"
    >
      {feedback ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">{feedback}</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </>
      )}
    </button>
  );
}
