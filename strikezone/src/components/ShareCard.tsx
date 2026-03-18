'use client';

import { useRef, useCallback } from 'react';
import type { StrikeAnalysis, WeatherConditions, Lake } from '@/lib/types';

interface ShareCardProps {
  analysis: StrikeAnalysis;
  conditions: WeatherConditions;
  lake: Lake | null;
}

function getVerdictLabel(score: number): string {
  if (score >= 90) return "They're Eating Everything";
  if (score >= 75) return 'Go Fish';
  if (score >= 60) return 'Good Bite';
  if (score >= 45) return 'Gotta Work For It';
  if (score >= 30) return 'Tough Bite';
  return 'Lockjaw';
}

function getVerdictColor(score: number): string {
  if (score >= 75) return '#10b981';
  if (score >= 60) return '#38bdf8';
  if (score >= 45) return '#f59e0b';
  if (score >= 30) return '#f97316';
  return '#ef4444';
}

// Reuse arc math from OutlookHero
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, endDeg);
  const e = polarToCartesian(cx, cy, r, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

export default function ShareCard({ analysis, conditions, lake }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderCard = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) { resolve(null); return; }

      const W = 1200;
      const H = 630;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // Gradient accent
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, 'rgba(16,185,129,0.08)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Logo / Brand
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('STRIKEZONE', 40, 50);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.fillText('The Visual Bass Guide', 40, 72);

      // Lake name + date
      const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(lake?.name ?? 'Unknown Lake', 40, 130);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px monospace';
      ctx.fillText(dateStr, 40, 160);

      // Bite Rating Arc
      const score = analysis.biteIntensity;
      const color = getVerdictColor(score);
      const cx = 200, cy = 350, radius = 100;
      const sweepAngle = 270;
      const startAngle = 135;
      const filledAngle = (score / 100) * sweepAngle;

      // Background arc
      ctx.beginPath();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      const bgStart = polarToCartesian(cx, cy, radius, startAngle + sweepAngle);
      const bgEnd = polarToCartesian(cx, cy, radius, startAngle);
      ctx.arc(cx, cy, radius, ((startAngle - 90) * Math.PI) / 180, ((startAngle + sweepAngle - 90) * Math.PI) / 180);
      ctx.stroke();

      // Filled arc
      if (filledAngle > 0) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.arc(cx, cy, radius, ((startAngle - 90) * Math.PI) / 180, ((startAngle + filledAngle - 90) * Math.PI) / 180);
        ctx.stroke();
      }

      // Score text
      ctx.fillStyle = color;
      ctx.font = 'bold 56px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(score), cx, cy + 10);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText('BITE RATING', cx, cy + 34);

      // Verdict
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(getVerdictLabel(score), cx, cy + radius + 40);

      // Reset alignment
      ctx.textAlign = 'left';

      // Fish depth
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px monospace';
      ctx.fillText('FISH DEPTH', 40, 510);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 36px monospace';
      ctx.fillText(`${analysis.fishDepth}ft`, 40, 550);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.fillText(analysis.seasonalPhase.label, 40, 574);

      // Top 3 Picks
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px monospace';
      ctx.fillText('TOP PICKS', 450, 210);

      const topPicks = analysis.anglerPicks.slice(0, 3);
      topPicks.forEach((pick, i) => {
        const py = 240 + i * 100;

        // Color swatch
        ctx.fillStyle = pick.lure.colorHex;
        ctx.beginPath();
        ctx.roundRect(450, py, 30, 18, 4);
        ctx.fill();

        // Lure name
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(pick.lure.name, 494, py + 15);

        // Color name + confidence
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px monospace';
        ctx.fillText(`${pick.lure.color}  •  ${pick.lure.confidence}%`, 494, py + 38);

        // Angler name
        ctx.fillStyle = '#64748b';
        ctx.font = '13px monospace';
        ctx.fillText(pick.anglerName, 494, py + 58);
      });

      // Tactical note
      if (analysis.tacticalNotes[0]) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px monospace';
        ctx.fillText('TACTICAL NOTE', 450, 560);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px sans-serif';
        // Wrap text
        const note = analysis.tacticalNotes[0];
        const maxW = W - 490;
        const words = note.split(' ');
        let line = '';
        let ly = 584;
        for (const word of words) {
          const test = line + word + ' ';
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line.trim(), 450, ly);
            line = word + ' ';
            ly += 20;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line.trim(), 450, ly);
      }

      // Conditions strip at bottom
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, H - 40, W, 40);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      const strip = `${conditions.waterTemp}°F Water  •  ${conditions.airTemp}°F Air  •  ${conditions.windSpeed}mph ${conditions.windDirection}  •  ${conditions.barometricPressure.toFixed(2)} inHg ${conditions.pressureTrend}  •  ${conditions.skyCondition}  •  ${conditions.waterClarity}`;
      ctx.fillText(strip, 40, H - 14);

      canvas.toBlob(resolve, 'image/png');
    });
  }, [analysis, conditions, lake]);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} />
      <ShareCardRenderer renderCard={renderCard} />
    </>
  );
}

// Expose renderCard via a wrapper that parent can ref
function ShareCardRenderer({ renderCard }: { renderCard: () => Promise<Blob | null> }) {
  // Store the render function on a global so ShareButton can access it
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__strikezoneRenderCard = renderCard;
  }
  return null;
}
