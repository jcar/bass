'use client';

import { useState } from 'react';

export default function ExportPanel({ anglerId }: { anglerId: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/export/${anglerId}`, { method: 'POST' });
      const data = await res.json();
      setCode(data.typescript);
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${anglerId}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={generate}
          disabled={loading}
          className="px-4 py-2 bg-emerald-700 text-white text-sm rounded hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate TypeScript Profile'}
        </button>
        {code && (
          <button
            onClick={download}
            className="px-4 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
          >
            Download {anglerId}.ts
          </button>
        )}
      </div>
      {code && (
        <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-auto max-h-[600px]">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
