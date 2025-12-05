import { WeatherData, WeatherApiResponse } from './types';

export interface CitySearchResult {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
}

const API_KEY = 'ed341caa54a850b39807080283b1e9fb'; // Replace with your OpenWeatherMap API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

// Convert wind direction in degrees to compass direction
function getWindDirection(deg: number): string {
    const FULL_CIRCLE_DEGREES = 360;
    const degInCircle = FULL_CIRCLE_DEGREES / directions.length;
    const index = Math.round(deg / degInCircle) % directions.length;
    return directions[index];
}

// Get wind description based on speed
function getWindDescription(speed: number): string {
    if (speed < 0.5) return 'Calm';
    if (speed < 1.5) return 'Light air';
    if (speed < 3.3) return 'Light breeze';
    if (speed < 5.5) return 'Gentle breeze';
    if (speed < 8) return 'Moderate breeze';
    if (speed < 10.8) return 'Fresh breeze';
    if (speed < 13.9) return 'Strong breeze';
    if (speed < 17.2) return 'Near gale';
    if (speed < 20.8) return 'Gale';
    if (speed < 24.5) return 'Strong gale';
    if (speed < 28.5) return 'Storm';
    if (speed < 32.7) return 'Violent storm';
    return 'Hurricane';
}

// Calculate dew point.
// Source: https://en.wikipedia.org/wiki/Dew_point#Calculating_the_dew_point
function calculateDewPoint(temp: number, humidity: number): number {
    const MAGNUS_COEFFICIENT_B = 17.625;
    const MAGNUS_COEFFICIENT_C = 243.04; // degrees Celsius

    const gamma = Math.log(humidity / 100.0) + (MAGNUS_COEFFICIENT_B * temp) / (MAGNUS_COEFFICIENT_C + temp);
    const dewPoint = (MAGNUS_COEFFICIENT_C * gamma) / (MAGNUS_COEFFICIENT_B - gamma);

    return Math.round(dewPoint);
}

// Transform API response to WeatherData format
function transformWeatherData(data: WeatherApiResponse): WeatherData {
    const windDegrees = data.wind.deg || 0;
    const windDirection = getWindDirection(windDegrees);
    const windDescription = getWindDescription(data.wind.speed);
    const dewPoint = calculateDewPoint(data.main.temp, data.main.humidity);

    return {
        location: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        windSpeed: Math.round(data.wind.speed * 10) / 10,
        windDirection: windDirection,
        windDegrees: windDegrees,
        windDescription: windDescription,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        dewPoint: dewPoint,
        visibility: Math.round((data.visibility || 10000) / 1000 * 10) / 10,
        icon: data.weather[0].icon
    };
}

export async function fetchWeather(city: string = 'London'): Promise<WeatherData> {
    try {
        const response = await fetch(
            `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Weather data not available');
        }

        const data: WeatherApiResponse = await response.json();
        return transformWeatherData(data);
    } catch (error) {
        throw new Error('Failed to fetch weather data');
    }
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
        const response = await fetch(
            `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Weather data not available');
        }

        const data: WeatherApiResponse = await response.json();
        return transformWeatherData(data);
    } catch (error) {
        throw new Error('Failed to fetch weather data');
    }
}

export async function searchCities(query: string, limit: number = 3): Promise<CitySearchResult[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const response = await fetch(
            `${GEOCODING_URL}?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.map((item: any) => ({
            name: item.name,
            country: item.country,
            state: item.state,
            lat: item.lat,
            lon: item.lon
        }));
    } catch (error) {
        console.error('City search error:', error);
        return [];
    }
}
