import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Knowledge Review Tool',
  description: 'Browse, compare, and curate angler knowledge data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="relative z-50 bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-emerald-400 hover:text-emerald-300 shrink-0">
            Knowledge Review
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-200">Dashboard</Link>
          <Link href="/health" className="text-sm text-gray-400 hover:text-gray-200">Health</Link>
          <Link href="/schema" className="text-sm text-gray-400 hover:text-gray-200">Schema</Link>
          <Link href="/coverage" className="text-sm text-gray-400 hover:text-gray-200">Coverage</Link>
          <Link href="/simulate" className="text-sm text-gray-400 hover:text-gray-200">Simulate</Link>
          <Link href="/lure/Swim%20Jig" className="text-sm text-gray-400 hover:text-gray-200">Compare Lures</Link>
          <div className="relative group shrink-0">
            <span className="text-sm text-gray-400 hover:text-gray-200 cursor-pointer">More ▾</span>
            <div className="absolute top-full left-0 pt-1 hidden group-hover:block min-w-[160px]">
            <div className="bg-gray-900 border border-gray-800 rounded-lg py-1 shadow-xl">
              <Link href="/credibility" className="block px-4 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800">Credibility</Link>
              <Link href="/duplicates" className="block px-4 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800">Duplicates</Link>
              <Link href="/structure" className="block px-4 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800">Structure</Link>
              <Link href="/backfill" className="block px-4 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800">Backfill</Link>
            </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
