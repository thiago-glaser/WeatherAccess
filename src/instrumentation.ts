
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { syncWeatherData } = await import('./lib/weather-service');
    
    console.log('Starting background weather sync service...');
    
    // Initial sync
    try {
      await syncWeatherData();
      console.log('Initial weather sync completed successfully');
    } catch (error: any) {
      console.error('Initial weather sync failed:', error.message);
    }

    // Schedule every 20 seconds
    setInterval(async () => {
      try {
        const result = await syncWeatherData();
        console.log(`[${new Date().toLocaleString()}] Background sync success: ${result.timestamp}`);
      } catch (error: any) {
        console.error(`[${new Date().toLocaleString()}] Background sync failed:`, error.message);
      }
    }, 20000);
  }
}
