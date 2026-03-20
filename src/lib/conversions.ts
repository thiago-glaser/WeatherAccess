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
  if (!unixTimestamp) return new Date();
  const ts = typeof unixTimestamp === 'string' ? parseInt(unixTimestamp, 10) : unixTimestamp;
  return new Date(ts * 1000);
};
