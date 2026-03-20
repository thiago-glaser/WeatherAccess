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
      }
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
      await Station.create({
        id: uuidv4().replace(/-/g, '').toUpperCase().substring(0, 32), // Simulate Sys_guid()
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
      });
    }

    // 4. Cleanup
    await Station.destroy({
      where: {
        localtimestamp: { [Op.is]: null }
      }
    });

    return { success: true, timestamp: local_date };
  } catch (error: any) {
    console.error('Error syncing weather data:', error.message);
    throw error;
  }
}
