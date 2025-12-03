import { WeatherData, WeatherApiResponse } from './types';

const API_KEY = 'ed341caa54a850b39807080283b1e9fb\n'; // Replace with your OpenWeatherMap API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Convert wind direction in degrees to compass direction
function getWindDirection(deg: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
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

// Calculate dew point
function calculateDewPoint(temp: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0);
    return Math.round((b * alpha) / (a - alpha));
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
    } catch (error) {
        throw new Error('Failed to fetch weather data');
    }
}
