
export interface EcowittRealTimeResponse {
    data: {
        outdoor: {
            temperature: { value: string; time: string; };
            humidity: { value: string; };
            feels_like: { value: string; };
            app_temp: { value: string; };
            dew_point: { value: string; };
        };
        indoor: {
            temperature: { value: string; };
            humidity: { value: string; };
        };
        pressure: {
            absolute: { value: string; };
            relative: { value: string; };
        };
        wind: {
            wind_speed: { value: string; };
            wind_gust: { value: string; };
            wind_direction: { value: string; };
        };
        solar_and_uvi: {
            solar: { value: string; };
            uvi: { value: string; };
        };
        rainfall: {
            rain_rate: { value: string; };
            event: { value: string; };
            daily: { value: string; };
            weekly: { value: string; };
            monthly: { value: string; };
            yearly: { value: string; };
        };
        battery: {
            sensor_array: { value: string; };
        };
    };
}
