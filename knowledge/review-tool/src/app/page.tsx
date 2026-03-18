import { getAnglerSummaries } from '@/lib/data';
import AnglerCard from '@/components/AnglerCard';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const anglers = await getAnglerSummaries();

  const totalSources = anglers.reduce((sum, a) => sum + a.sources, 0);
  const totalLures = new Set(anglers.flatMap(a => a.lureNames)).size;
  const totalKnowledge = anglers.reduce((sum, a) => sum + a.knowledge, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Knowledge Review Dashboard</h1>
        <div className="flex gap-6 text-sm text-gray-400">
          <span><strong className="text-gray-200">{anglers.length}</strong> anglers</span>
          <span><strong className="text-gray-200">{totalSources}</strong> articles</span>
          <span><strong className="text-gray-200">{totalLures}</strong> unique lures</span>
          <span><strong className="text-gray-200">{totalKnowledge}</strong> knowledge entries</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {anglers
          .sort((a, b) => b.knowledge - a.knowledge)
          .map(angler => (
            <AnglerCard key={angler.id} angler={angler} />
          ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Compare Lures</h2>
        <p className="text-sm text-gray-400 mb-3">Click a lure to see what all anglers say about it.</p>
        <div className="flex flex-wrap gap-2">
          {[...new Set(anglers.flatMap(a => a.lureNames))].sort().map(lure => (
            <a
              key={lure}
              href={`/lure/${encodeURIComponent(lure)}`}
              className="text-sm bg-gray-800 text-gray-300 px-3 py-1.5 rounded hover:bg-gray-700 hover:text-emerald-400 transition-colors"
            >
              {lure}
              <span className="text-xs text-gray-500 ml-1">
                ({anglers.filter(a => a.lureNames.includes(lure)).length})
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
