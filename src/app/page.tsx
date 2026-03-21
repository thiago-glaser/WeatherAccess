'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);

  const fetchCurrent = async () => {
    try {
      const res = await fetch('/api/weather/current');
      const data = await res.json();
      if (data.success) {
        setCurrent(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch current weather:', err);
    }
  };

  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weather/sync');
      const data = await res.json();
      setSyncResult(data);
      if (data.success) {
        await fetchCurrent();
      }
    } catch (err) {
      setSyncResult({ success: false, error: 'Failed to connect to API' });
    } finally {
      setLoading(false);
    }
  };

  const formatTemp = (val: any) => {
    if (val === undefined || val === null) return '--.-';
    const num = parseFloat(val);
    return isNaN(num) ? '--.-' : num.toFixed(1);
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-start py-20 px-6 overflow-x-hidden bg-[#020617] text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[30%] w-[20%] h-[20%] bg-emerald-600/5 blur-[100px] rounded-full" />

      <div className="relative z-10 w-full max-w-[1200px] flex flex-col items-center gap-12">
        {/* Header Section */}
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="px-4 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50 backdrop-blur-md shadow-lg mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Atmospheric Data</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
            Weather Access
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]" />
            <p className="text-slate-400 font-medium tracking-wide">Real-time Weather Monitoring</p>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* External Section */}
          <div className="card-container group">
            <div className="relative p-1 rounded-[32px] overflow-hidden transition-all duration-700 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
              {/* Animated Gradient Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative bg-slate-900/80 backdrop-blur-3xl rounded-[28px] p-10 flex flex-col gap-6 border border-slate-700/30">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest">External</h2>
                    <p className="text-slate-500 text-[10px] items-center flex gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Outdoor Station
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-8xl font-black tracking-tighter tabular-nums text-white">
                    {formatTemp(current?.externaltemperature)}
                  </span>
                  <span className="text-4xl text-slate-500 font-light tracking-tighter">°C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Section */}
          <div className="card-container group">
            <div className="relative p-1 rounded-[32px] overflow-hidden transition-all duration-700 hover:shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
              {/* Animated Gradient Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative bg-slate-900/80 backdrop-blur-3xl rounded-[28px] p-10 flex flex-col gap-6 border border-slate-700/30">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Internal</h2>
                    <p className="text-slate-500 text-[10px] items-center flex gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Indoor Receiver
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-8xl font-black tracking-tighter tabular-nums text-white">
                    {formatTemp(current?.internaltemperature)}
                  </span>
                  <span className="text-4xl text-slate-500 font-light tracking-tighter">°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Controls */}
        <footer className="w-full flex flex-col items-center gap-6 mt-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={triggerSync}
              disabled={loading}
              className={`group flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 border ${
                loading 
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white shadow-xl hover:shadow-white/5 active:scale-95'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {loading ? 'Synchronizing...' : 'Sync Data'}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="min-h-[20px] flex items-center justify-center">
              {current?.localtimestamp && (
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  Last updated: {new Date(current.localtimestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
            
            <div className="min-h-[28px] flex items-center justify-center">
              {syncResult && (
                <div className={`mt-2 py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider border animate-in slide-in-from-bottom-1 duration-500 ${
                  syncResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {syncResult.success ? 'Success: Database Refreshed' : `Error: ${syncResult.error}`}
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        .card-container {
          perspective: 1000px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </main>
  );
}
