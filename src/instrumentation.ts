
// Helper: retry an async fn up to `attempts` times, waiting `delayMs` between tries
async function withRetry<T>(fn: () => Promise<T>, attempts: number, delayMs: number): Promise<T> {
  let lastError: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { syncWeatherData, syncHistoricData } = await import('./lib/weather-service');
    
    console.log('--- NEW VERSION OF INSTRUMENTATION RUNNING ---');
    console.log('Starting background weather sync services...');

    // Guard flags to prevent overlapping calls
    let realtimeSyncing = false;
    let historicSyncing = false;

    // Schedule real-time sync every 20 seconds
    setInterval(async () => {
      if (realtimeSyncing) {
        console.log(`[${new Date().toLocaleString()}] Real-time sync skipped (previous still running)`);
        return;
      }
      realtimeSyncing = true;
      try {
        console.log(`[${new Date().toLocaleString()}] Starting real-time sync...`);
        // Retry once after 5 s on transient failures (e.g. API timeout)
        const result = await withRetry(() => syncWeatherData(), 2, 5000);
        console.log(`[${new Date().toLocaleString()}] Real-time sync success: ${result.timestamp}`);
      } catch (error: any) {
        console.error(`[${new Date().toLocaleString()}] Real-time sync failed:`, error.message);
      } finally {
        realtimeSyncing = false;
      }
    }, 20000);

    // Schedule historic sync every 5 minutes
    setInterval(async () => {
      if (historicSyncing) {
        console.log(`[${new Date().toLocaleString()}] Historic sync skipped (previous still running)`);
        return;
      }
      historicSyncing = true;
      try {
        console.log(`[${new Date().toLocaleString()}] Starting historic sync...`);
        const result = await syncHistoricData();
        console.log(`[${new Date().toLocaleString()}] Historic sync success: ${result.recordsProcessed} records`);
      } catch (error: any) {
        console.error(`[${new Date().toLocaleString()}] Historic sync failed:`, error.message);
      } finally {
        historicSyncing = false;
      }
    }, 300000); // 5 minutes

    // Initial syncs - executed in the background without blocking register()
    (async () => {
      console.log('Running initial weather sync...');
      try {
        await syncWeatherData();
        console.log('Initial weather sync completed successfully');
      } catch (error: any) {
        console.error('Initial weather sync failed:', error.message);
      }

      console.log('Running initial historic weather sync...');
      try {
        await syncHistoricData();
        console.log('Initial historic weather sync completed successfully');
      } catch (error: any) {
        console.error('Initial historic weather sync failed:', error.message);
      }
    })();
  }
}
