export const fahrenheitToCelsius = (f: number): number => {
  if (f === null || f === undefined) return 0;
  return (f - 32) * 5 / 9;
};

export const inchesOfMercuryToHectopascal = (inHg: number): number => {
  if (inHg === null || inHg === undefined) return 0;
  return inHg * 33.8639;
};

export const mphToKmh = (mph: number): number => {
  if (mph === null || mph === undefined) return 0;
  return mph * 1.60934;
};

export const inchesToMillimeters = (inches: number): number => {
  if (inches === null || inches === undefined) return 0;
  return inches * 25.4;
};

export const getUnixTimestampToDate = (unixTimestamp: string | number): Date => {
  if (!unixTimestamp) {
    return new Date();
  }
  const ts = typeof unixTimestamp === 'string' ? parseInt(unixTimestamp, 10) : unixTimestamp;
  return new Date(ts * 1000);
};


// Helper: Converts a standard UTC date instant into a new Date object whose UTC 
// components match the wall-clock time in America/Winnipeg.
export function getWinnipegWallClock(date: Date): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Winnipeg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);

  const m = new Map(parts.map(p => [p.type, p.value]));
  
  // Parse numeric values from segments
  const yr = parseInt(m.get('year')!, 10);
  const mo = parseInt(m.get('month')!, 10) - 1;
  const dy = parseInt(m.get('day')!, 10);
  const hr = parseInt(m.get('hour')!, 10);
  const mi = parseInt(m.get('minute')!, 10);
  const sc = parseInt(m.get('second')!, 10);

  // Return a new Date where the UTC values reflect the local wall-clock
  return new Date(Date.UTC(yr, mo, dy, hr, mi, sc));
}
