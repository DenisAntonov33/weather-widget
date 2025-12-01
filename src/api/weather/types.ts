export interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
}

export interface WeatherApiResponse {
    name: string;
    main: {
        temp: number;
        humidity: number;
    };
    weather: Array<{
        main: string;
        description: string;
        icon: string;
    }>;
    wind: {
        speed: number;
    };
}