import { WeatherData, WeatherApiResponse } from './types';

const API_KEY = 'ed341caa54a850b39807080283b1e9fb\n'; // Replace with your OpenWeatherMap API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeather(city: string = 'London'): Promise<WeatherData> {
    try {
        const response = await fetch(
            `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Weather data not available');
        }

        const data: WeatherApiResponse = await response.json();

        return {
            location: data.name,
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            icon: data.weather[0].icon
        };
    } catch (error) {
        throw new Error('Failed to fetch weather data');
    }
}
