import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Station } from './models/station';
import * as conversions from './conversions';
import { Op } from 'sequelize';

export interface EcowittRealTimeResponse {
  data: {
    outdoor: {
      temperature: { value: string; time: string };
      humidity: { value: string };
      feels_like: { value: string };
      app_temp: { value: string };
      dew_point: { value: string };
    };
    indoor: {
      temperature: { value: string };
      humidity: { value: string };
    };
    pressure: {
      absolute: { value: string };
      relative: { value: string };
    };
    wind: {
      wind_speed: { value: string };
      wind_gust: { value: string };
      wind_direction: { value: string };
    };
    solar_and_uvi: {
      solar: { value: string };
      uvi: { value: string };
    };
    rainfall: {
      rain_rate: { value: string };
      event: { value: string };
      daily: { value: string };
      weekly: { value: string };
      monthly: { value: string };
      yearly: { value: string };
    };
    battery: {
      sensor_array: { value: string };
    };
  };
}

export interface EcowittHistoryResponse {
  code: number;
  msg: string;
  time: string;
  data: {
    outdoor?: {
      temperature?: { list: Record<string, string> };
      humidity?: { list: Record<string, string> };
      feels_like?: { list: Record<string, string> };
      app_temp?: { list: Record<string, string> };
      dew_point?: { list: Record<string, string> };
    };
    indoor?: {
      temperature?: { list: Record<string, string> };
      humidity?: { list: Record<string, string> };
    };
    pressure?: {
      absolute?: { list: Record<string, string> };
      relative?: { list: Record<string, string> };
    };
    wind?: {
      wind_speed?: { list: Record<string, string> };
      wind_gust?: { list: Record<string, string> };
      wind_direction?: { list: Record<string, string> };
    };
    solar_and_uvi?: {
      solar?: { list: Record<string, string> };
      uvi?: { list: Record<string, string> };
    };
    rainfall?: {
      rain_rate?: { list: Record<string, string> };
      event?: { list: Record<string, string> };
      daily?: { list: Record<string, string> };
      weekly?: { list: Record<string, string> };
      monthly?: { list: Record<string, string> };
      yearly?: { list: Record<string, string> };
    };
  };
}

export async function syncWeatherData() {
  try {
    const application_key = process.env.APPLICATION_KEY;
    const api_key = process.env.API_KEY;
    const mac = process.env.MAC;

    if (!application_key || !api_key || !mac) {
      throw new Error('Missing required configuration in .env (APPLICATION_KEY, API_KEY, or MAC)');
    }

    // 2. Fetch data from Ecowitt
    const url = process.env.ECOWITT_API_URL || `https://api.ecowitt.net/api/v3/device/real_time`;
    const response = await axios.get<EcowittRealTimeResponse>(url, {
      params: {
        application_key,
        api_key,
        mac,
        call_back: 'all'
      },
      timeout: 30000 // 30 second timeout
    });

    const data = response.data.data;
    if (!data) {
      throw new Error('Invalid response from Ecowitt API');
    }

    // 3. Convert data
    const local_date = conversions.getUnixTimestampToDate(data.outdoor.temperature.time);
    
    // Check if record exists
    const existing = await Station.findOne({
      where: { localtimestamp: local_date }
    });

    if (!existing) {
      console.log(`[${new Date().toLocaleString()}] Database: Creating record for timestamp ${local_date.toISOString()}...`);
      await Station.create({
        id: uuidv4().replace(/-/g, '').toUpperCase().substring(0, 32),
        localtimestamp: local_date,
        externaltemperature: conversions.fahrenheitToCelsius(parseFloat(data.outdoor.temperature.value)),
        internaltemperature: conversions.fahrenheitToCelsius(parseFloat(data.indoor.temperature.value)),
        feelslike: conversions.fahrenheitToCelsius(parseFloat(data.outdoor.feels_like.value)),
        apparenttemperature: conversions.fahrenheitToCelsius(parseFloat(data.outdoor.app_temp.value)),
        dewpoint: conversions.fahrenheitToCelsius(parseFloat(data.outdoor.dew_point.value)),
        externalhumidity: parseFloat(data.outdoor.humidity.value),
        internalhumidity: parseFloat(data.indoor.humidity.value),
        internalpressureabs: conversions.inchesOfMercuryToHectopascal(parseFloat(data.pressure.absolute.value)),
        internalpressurerel: conversions.inchesOfMercuryToHectopascal(parseFloat(data.pressure.relative.value)),
        windspeed: conversions.mphToKmh(parseFloat(data.wind.wind_speed.value)),
        windgust: conversions.mphToKmh(parseFloat(data.wind.wind_gust.value)),
        winddirection: parseFloat(data.wind.wind_direction.value),
        solarradiation: parseFloat(data.solar_and_uvi.solar.value),
        uv: parseFloat(data.solar_and_uvi.uvi.value),
        rain: conversions.inchesToMillimeters(parseFloat(data.rainfall.rain_rate.value)),
        eventrain: conversions.inchesToMillimeters(parseFloat(data.rainfall.event.value)),
        dailyrain: conversions.inchesToMillimeters(parseFloat(data.rainfall.daily.value)),
        weeklyrain: conversions.inchesToMillimeters(parseFloat(data.rainfall.weekly.value)),
        monthlyrain: conversions.inchesToMillimeters(parseFloat(data.rainfall.monthly.value)),
        yearlyrain: conversions.inchesToMillimeters(parseFloat(data.rainfall.yearly.value)),
        batterystatus: parseFloat(data.battery.sensor_array.value),
        origem: 0
      }, { returning: false });
      console.log(`[${new Date().toLocaleString()}] Database: Record created successfully.`);
    } else {
      console.log(`[${new Date().toLocaleString()}] Database: Record already exists for this timestamp.`);
    }

    // 4. Cleanup
/* Removed frequent cleanup to improve performance and prevent hangs */

    return { success: true, timestamp: local_date };
  } catch (error: any) {
    console.error('Error syncing weather data:', error.message);
    throw error;
  }
}

export async function syncHistoricData() {
  console.log('Starting syncHistoricData...');
  try {
    const application_key = process.env.APPLICATION_KEY;
    const api_key = process.env.API_KEY;
    const mac = process.env.MAC;

    if (!application_key || !api_key || !mac) {
      throw new Error('Missing required configuration in .env (APPLICATION_KEY, API_KEY, or MAC)');
    }

    // 1. Get start_date (MAX(LOCALTIMESTAMP) + 1 second for ORIGEM = 1)
    const lastRecord = await Station.findOne({
      where: { origem: 1 },
      order: [['localtimestamp', 'DESC']]
    });

    let startDate: Date;
    if (lastRecord) {
      startDate = new Date(lastRecord.localtimestamp.getTime() + 1000);
      console.log(`Last record found at: ${lastRecord.localtimestamp.toISOString()}. New start date: ${startDate.toISOString()}`);
    } else {
      // Default to 6 hours ago if no records exist
      startDate = new Date(Date.now() - 6 * 60 * 60 * 1000);
      console.log(`No records found for ORIGEM=1. Using default start date: ${startDate.toISOString()}`);
    }

    // end_date = start_date + 6 hours - 1 second
    const endDate = new Date(startDate.getTime() + 6 * 60 * 60 * 1000 - 1000);

    // Synchronize with Ecowitt History API using the station's local time format as requested
    const formatDate = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    console.log(`Fetching history from ${startStr} to ${endStr} (Local Time)`);

    const url = `https://api.ecowitt.net/api/v3/device/history`;
    const response = await axios.get<EcowittHistoryResponse>(url, {
      params: {
        application_key,
        api_key,
        mac,
        start_date: startStr,
        end_date: endStr,
        call_back: 'outdoor,indoor,battery,wind,solar_and_uvi,rainfall,wind,pressure'
      },
      timeout: 60000 // 60 second timeout for history
    });

    if (response.data.code !== 0) {
      console.error(`Ecowitt API Error: Code ${response.data.code} - ${response.data.msg}`);
      return { success: false, recordsProcessed: 0, error: response.data.msg };
    }

    const data = response.data.data;
    if (!data || Object.keys(data).length === 0) {
      console.log('No historical data returned from Ecowitt API for the given range.');
      return { success: true, recordsProcessed: 0 };
    }

    // Aggregator map to collect all sensor data by timestamp
    const timestampMap = new Map<string, any>();

    const getEntry = (ts: string) => {
      if (!timestampMap.has(ts)) {
        timestampMap.set(ts, {
          id: uuidv4().replace(/-/g, '').toUpperCase().substring(0, 32),
          localtimestamp: conversions.getUnixTimestampToDate(ts),
          origem: 1,
          batterystatus: 0
        });
      }
      return timestampMap.get(ts);
    };

    // Helper to process sensor lists with safety checks
    const processList = (list: Record<string, string> | undefined, field: string, convertFn?: (v: number) => number) => {
      if (!list) return;
      for (const [ts, val] of Object.entries(list)) {
        const entry = getEntry(ts);
        const rawValue = parseFloat(val);
        if (!isNaN(rawValue)) {
          entry[field] = convertFn ? convertFn(rawValue) : rawValue;
        }
      }
    };

    // Process all sensor data into the map
    processList(data.outdoor?.temperature?.list, 'externaltemperature', conversions.fahrenheitToCelsius);
    processList(data.indoor?.temperature?.list, 'internaltemperature', conversions.fahrenheitToCelsius);
    processList(data.outdoor?.feels_like?.list, 'feelslike', conversions.fahrenheitToCelsius);
    processList(data.outdoor?.app_temp?.list, 'apparenttemperature', conversions.fahrenheitToCelsius);
    processList(data.outdoor?.dew_point?.list, 'dewpoint', conversions.fahrenheitToCelsius);
    processList(data.outdoor?.humidity?.list, 'externalhumidity');
    processList(data.indoor?.humidity?.list, 'internalhumidity');
    processList(data.solar_and_uvi?.solar?.list, 'solarradiation');
    processList(data.solar_and_uvi?.uvi?.list, 'uv');
    processList(data.pressure?.relative?.list, 'internalpressurerel', conversions.inchesOfMercuryToHectopascal);
    processList(data.pressure?.absolute?.list, 'internalpressureabs', conversions.inchesOfMercuryToHectopascal);
    processList(data.wind?.wind_speed?.list, 'windspeed', conversions.mphToKmh);
    processList(data.wind?.wind_gust?.list, 'windgust', conversions.mphToKmh);
    processList(data.wind?.wind_direction?.list, 'winddirection');
    processList(data.rainfall?.rain_rate?.list, 'rain', conversions.inchesToMillimeters);
    processList(data.rainfall?.daily?.list, 'dailyrain', conversions.inchesToMillimeters);
    processList(data.rainfall?.event?.list, 'eventrain', conversions.inchesToMillimeters);
    processList(data.rainfall?.weekly?.list, 'weeklyrain', conversions.inchesToMillimeters);
    processList(data.rainfall?.monthly?.list, 'monthlyrain', conversions.inchesToMillimeters);
    processList(data.rainfall?.yearly?.list, 'yearlyrain', conversions.inchesToMillimeters);

    console.log(`Prepared ${timestampMap.size} records for database sync.`);

    // 3. Save all entries to the database efficiently
    console.log(`Checking for existing records in range ${startDate.toISOString()} to ${endDate.toISOString()}...`);
    const existingRecords = await Station.findAll({
      where: {
        localtimestamp: {
          [Op.between]: [startDate, endDate]
        },
        origem: 1
      }
    });

    const existingMap = new Map<string, Station>();
    for (const record of existingRecords) {
      existingMap.set(record.localtimestamp.getTime().toString(), record);
    }

    let recordsProcessed = 0;
    let createdCount = 0;
    let updatedCount = 0;

    for (const entryData of timestampMap.values()) {
      const tsKey = entryData.localtimestamp.getTime().toString();
      const existing = existingMap.get(tsKey);

      if (existing) {
        // Omit fixed fields from update to prevent PK or fixed info changes
        const { id, localtimestamp, origem, ...updateData } = entryData;
        await existing.update(updateData);
        updatedCount++;
      } else {
        await Station.create(entryData);
        createdCount++;
      }
      recordsProcessed++;
      if (recordsProcessed % 50 === 0) console.log(`Sync progress: ${recordsProcessed}/${timestampMap.size} records...`);
    }

    console.log(`Sync completed successfully. ${recordsProcessed} records processed (${createdCount} created, ${updatedCount} updated).`);
    return { success: true, recordsProcessed };
  } catch (error: any) {
    console.error('Error syncing historic weather data:', error.message);
    throw error;
  }
}
