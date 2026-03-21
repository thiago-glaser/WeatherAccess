
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { syncWeatherData, syncHistoricData } = await import('./lib/weather-service');
    
    console.log('--- NEW VERSION OF INSTRUMENTATION RUNNING ---');
    console.log('Starting background weather sync services...');
    
    // Schedule real-time sync every 20 seconds
    setInterval(async () => {
      try {
        console.log(`[${new Date().toLocaleString()}] Starting real-time sync...`);
        const result = await syncWeatherData();
        console.log(`[${new Date().toLocaleString()}] Real-time sync success: ${result.timestamp}`);
      } catch (error: any) {
        console.error(`[${new Date().toLocaleString()}] Real-time sync failed:`, error.message);
      }
    }, 20000);

    // Schedule historic sync every 5 minutes
    setInterval(async () => {
      try {
        console.log(`[${new Date().toLocaleString()}] Starting historic sync...`);
        const result = await syncHistoricData();
        console.log(`[${new Date().toLocaleString()}] Historic sync success: ${result.recordsProcessed} records`);
      } catch (error: any) {
        console.error(`[${new Date().toLocaleString()}] Historic sync failed:`, error.message);
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
