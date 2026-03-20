'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const triggerSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weather/sync');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: 'Failed to connect to API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full glassmorphism p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Weather Access
          </h1>
          <p className="text-slate-400">Ecowitt Data Synchronizer</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={triggerSync}
            disabled={loading}
            className={`px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center gap-2 ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Synchronizing...
              </>
            ) : (
              'Sync Real-Time Data'
            )}
          </button>
        </div>

        {result && (
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 animate-in zoom-in-95 duration-300">
            <h2 className={`text-lg font-semibold mb-2 ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.success ? 'Success' : 'Error'}
            </h2>
            <pre className="text-xs text-slate-400 overflow-auto max-h-40 p-2 bg-slate-900 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <style jsx global>{`
        .glassmorphism {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
    </main>
  );
}
