import Link from 'next/link';
import { getAnglerIds, loadMergedReview, getAnglerName } from '@/lib/data';
import { computeHealth, type AnglerHealth } from '@/lib/health';

function readinessColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function readinessBg(score: number): string {
  if (score >= 70) return 'bg-emerald-900/30 border-emerald-700';
  if (score >= 40) return 'bg-yellow-900/30 border-yellow-700';
  return 'bg-red-900/30 border-red-700';
}

function Badge({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? value / max : 0;
  const color = pct >= 0.7 ? 'bg-emerald-800 text-emerald-300' :
    pct >= 0.3 ? 'bg-yellow-800 text-yellow-300' : 'bg-red-800 text-red-300';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${color}`}>
      {value}/{max} {label}
    </span>
  );
}

function IssueCount({ count, label, inverse }: { count: number; label: string; inverse?: boolean }) {
  const isGood = inverse ? count > 0 : count === 0;
  const color = isGood ? 'text-emerald-400' : count > 10 ? 'text-red-400' : 'text-yellow-400';
  return (
    <span className={`font-mono text-sm ${color}`}>
      {count} <span className="text-gray-500 text-xs">{label}</span>
    </span>
  );
}

export default async function HealthPage() {
  const ids = await getAnglerIds();
  const anglers = await Promise.all(
    ids.map(async id => ({
      id,
      name: getAnglerName(id),
      data: await loadMergedReview(id),
    }))
  );
  const health = computeHealth(anglers);

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Data Health Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        <div className={`border rounded-lg px-4 py-3 ${readinessBg(health.overallReadiness)}`}>
          <div className={`text-2xl font-bold ${readinessColor(health.overallReadiness)}`}>
            {health.overallReadiness}%
          </div>
          <div className="text-gray-500 text-xs">Readiness</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
          <div className="text-2xl font-bold">{health.totalAnglers}</div>
          <div className="text-gray-500 text-xs">Anglers</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
          <div className="text-2xl font-bold">{health.totalTips + health.totalColors + health.totalModifiers}</div>
          <div className="text-gray-500 text-xs">Rules</div>
          <div className="text-[10px] text-gray-600 mt-0.5">
            {health.totalTips} tips · {health.totalColors} col · {health.totalModifiers} mod
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
          <div className={`text-2xl font-bold ${health.totalNonStandardFields > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {health.totalNonStandardFields}
          </div>
          <div className="text-gray-500 text-xs">Non-Standard</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
          <div className={`text-2xl font-bold ${(health.totalEmptyWhenTips + health.totalEmptyWhenColors) > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {health.totalEmptyWhenTips + health.totalEmptyWhenColors + health.totalEmptyWhenModifiers}
          </div>
          <div className="text-gray-500 text-xs">Empty Whens</div>
          <div className="text-[10px] text-gray-600 mt-0.5">
            {health.totalEmptyWhenTips} tips · {health.totalEmptyWhenColors} col · {health.totalEmptyWhenModifiers} mod
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-2 mb-5 text-xs">
        <Link href="/schema" className="px-2.5 py-1 bg-red-900/30 border border-red-800 rounded hover:bg-red-900/50">
          Fix {health.totalNonStandardFields} schema issues →
        </Link>
        <Link href="/duplicates" className="px-2.5 py-1 bg-yellow-900/30 border border-yellow-800 rounded hover:bg-yellow-900/50">
          Check duplicates →
        </Link>
        <Link href="/coverage" className="px-2.5 py-1 bg-blue-900/30 border border-blue-800 rounded hover:bg-blue-900/50">
          View coverage →
        </Link>
      </div>

      {/* Per-angler table */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Per-Angler Scorecard</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-left">
              <th className="py-1.5 pr-3">Angler</th>
              <th className="py-1.5 pr-3 text-right">Ready</th>
              <th className="py-1.5 pr-3 text-right">Lures</th>
              <th className="py-1.5 pr-3 text-right">Tips</th>
              <th className="py-1.5 pr-3 text-right">Empty</th>
              <th className="py-1.5 pr-3 text-right">Schema</th>
              <th className="py-1.5 pr-3">Credibility</th>
              <th className="py-1.5">Structure</th>
            </tr>
          </thead>
          <tbody>
            {health.anglers.map((a: AnglerHealth) => (
              <tr key={a.id} className="border-b border-gray-800/40 hover:bg-gray-900/50">
                <td className="py-1.5 pr-3">
                  <Link href={`/angler/${a.id}`} className="text-emerald-400 hover:text-emerald-300 font-medium">
                    {a.name}
                  </Link>
                </td>
                <td className="py-1.5 pr-3 text-right">
                  <span className={`font-bold ${readinessColor(a.readiness)}`}>{a.readiness}%</span>
                </td>
                <td className="py-1.5 pr-3 text-right font-mono text-gray-300">{a.lureCount}</td>
                <td className="py-1.5 pr-3 text-right font-mono text-gray-300">{a.tipCount}</td>
                <td className="py-1.5 pr-3 text-right">
                  <IssueCount count={a.emptyWhenTips + a.emptyWhenColors + a.emptyWhenModifiers} label="" />
                </td>
                <td className="py-1.5 pr-3 text-right">
                  <IssueCount count={a.nonStandardFields} label="" />
                </td>
                <td className="py-1.5 pr-3">
                  <Badge value={a.credibilityFilled} max={a.credibilityTotal} label="lures" />
                </td>
                <td className="py-1.5">
                  <Badge value={a.structureFilled} max={a.structureTotal} label="types" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
