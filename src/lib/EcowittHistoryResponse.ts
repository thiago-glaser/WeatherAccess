
export interface EcowittHistoryResponse {
    code: number;
    msg: string;
    time: string;
    data: {
        outdoor?: {
            temperature?: { list: Record<string, string>; };
            humidity?: { list: Record<string, string>; };
            feels_like?: { list: Record<string, string>; };
            app_temp?: { list: Record<string, string>; };
            dew_point?: { list: Record<string, string>; };
        };
        indoor?: {
            temperature?: { list: Record<string, string>; };
            humidity?: { list: Record<string, string>; };
        };
        pressure?: {
            absolute?: { list: Record<string, string>; };
            relative?: { list: Record<string, string>; };
        };
        wind?: {
            wind_speed?: { list: Record<string, string>; };
            wind_gust?: { list: Record<string, string>; };
            wind_direction?: { list: Record<string, string>; };
        };
        solar_and_uvi?: {
            solar?: { list: Record<string, string>; };
            uvi?: { list: Record<string, string>; };
        };
        rainfall?: {
            rain_rate?: { list: Record<string, string>; };
            event?: { list: Record<string, string>; };
            daily?: { list: Record<string, string>; };
            weekly?: { list: Record<string, string>; };
            monthly?: { list: Record<string, string>; };
            yearly?: { list: Record<string, string>; };
        };
    };
}
