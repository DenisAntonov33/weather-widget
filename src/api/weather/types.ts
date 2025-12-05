export interface WeatherData {
    location: string;
    country: string;
    temperature: number;
    feelsLike: number;
    condition: string;
    description: string;
    windSpeed: number;
    windDirection: string;
    windDegrees: number;
    windDescription: string;
    pressure: number;
    humidity: number;
    dewPoint: number;
    visibility: number;
    icon: string;
}

export interface WeatherApiResponse {
    name: string;
    sys: {
        country: string;
    };
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
    };
    weather: Array<{
        main: string;
        description: string;
        icon: string;
    }>;
    wind: {
        speed: number;
        deg: number;
    };
    visibility: number;
}

export interface CitySearchResult {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
}