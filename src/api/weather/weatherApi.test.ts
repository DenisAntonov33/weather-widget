import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWeatherByCoords, searchCities } from './weatherApi';

// Mock global fetch
global.fetch = vi.fn();

describe('weatherApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchWeatherByCoords', () => {
    const mockWeatherResponse = {
      name: 'London',
      sys: { country: 'GB' },
      main: {
        temp: 15.5,
        feels_like: 14.2,
        humidity: 65,
        pressure: 1013
      },
      weather: [{
        main: 'Clouds',
        description: 'scattered clouds',
        icon: '03d'
      }],
      wind: {
        speed: 3.5,
        deg: 180
      },
      visibility: 10000
    };

    it('should fetch weather data by coordinates successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse
      });

      const result = await fetchWeatherByCoords(51.5074, -0.1278);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('lat=51.5074&lon=-0.1278')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('appid=')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('units=metric')
      );

      expect(result).toMatchObject({
        location: 'London',
        country: 'GB',
        temperature: 16, // Math.round(15.5)
        feelsLike: 14, // Math.round(14.2)
        condition: 'Clouds',
        description: 'scattered clouds',
        windSpeed: 3.5,
        windDirection: expect.any(String),
        windDegrees: 180,
        windDescription: expect.any(String),
        pressure: 1013,
        humidity: 65,
        dewPoint: expect.any(Number),
        visibility: 10, // Math.round(10000 / 1000 * 10) / 10
        icon: '03d'
      });
    });

    it('should handle missing wind degrees', async () => {
      const responseWithoutWindDeg = {
        ...mockWeatherResponse,
        wind: {
          speed: 2.0,
          deg: undefined
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutWindDeg
      });

      const result = await fetchWeatherByCoords(51.5074, -0.1278);

      expect(result.windDegrees).toBe(0);
      expect(result.windDirection).toBeDefined();
    });

    it('should handle missing visibility', async () => {
      const responseWithoutVisibility = {
        ...mockWeatherResponse,
        visibility: undefined
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutVisibility
      });

      const result = await fetchWeatherByCoords(51.5074, -0.1278);

      expect(result.visibility).toBe(10); // Default 10000 / 1000 * 10 / 10
    });

    it('should throw error when API response is not ok', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(fetchWeatherByCoords(51.5074, -0.1278)).rejects.toThrow(
        'Failed to fetch weather data'
      );
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchWeatherByCoords(51.5074, -0.1278)).rejects.toThrow(
        'Failed to fetch weather data'
      );
    });

    it('should calculate dew point correctly', async () => {
      const responseWithSpecificTemp = {
        ...mockWeatherResponse,
        main: {
          temp: 20,
          feels_like: 18,
          humidity: 70,
          pressure: 1013
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithSpecificTemp
      });

      const result = await fetchWeatherByCoords(51.5074, -0.1278);

      expect(result.dewPoint).toBeGreaterThanOrEqual(10);
      expect(result.dewPoint).toBeLessThanOrEqual(20);
      expect(Number.isInteger(result.dewPoint)).toBe(true);
    });

    it('should round temperature and feelsLike correctly', async () => {
      const responseWithDecimals = {
        ...mockWeatherResponse,
        main: {
          temp: 15.7,
          feels_like: 14.3,
          humidity: 65,
          pressure: 1013
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithDecimals
      });

      const result = await fetchWeatherByCoords(51.5074, -0.1278);

      expect(result.temperature).toBe(16);
      expect(result.feelsLike).toBe(14);
    });
  });

  describe('searchCities', () => {
    const mockSearchResponse = [
      {
        name: 'London',
        country: 'GB',
        state: 'England',
        lat: 51.5074,
        lon: -0.1278
      },
      {
        name: 'London',
        country: 'CA',
        state: 'Ontario',
        lat: 42.9849,
        lon: -81.2453
      },
      {
        name: 'Londonderry',
        country: 'GB',
        lat: 54.9966,
        lon: -7.3086
      }
    ];

    it('should search cities successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      });

      const result = await searchCities('London', 5);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=London')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=5')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('appid=')
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        name: 'London',
        country: 'GB',
        state: 'England',
        lat: 51.5074,
        lon: -0.1278
      });
      expect(result[1]).toEqual({
        name: 'London',
        country: 'CA',
        state: 'Ontario',
        lat: 42.9849,
        lon: -81.2453
      });
      expect(result[2]).toEqual({
        name: 'Londonderry',
        country: 'GB',
        state: undefined,
        lat: 54.9966,
        lon: -7.3086
      });
    });

    it('should return empty array for query shorter than 2 characters', async () => {
      const result1 = await searchCities('L', 5);
      const result2 = await searchCities('', 5);
      const result3 = await searchCities('   ', 5);

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(result3).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should use default limit of 3 when not specified', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse.slice(0, 3)
      });

      await searchCities('London');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=3')
      );
    });

    it('should encode query string correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await searchCities('New York', 5);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=New%20York')
      );
    });

    it('should handle query with leading/trailing spaces', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      // Note: The function checks trimmed length but uses original query in fetch
      await searchCities('  London  ', 5);

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should return empty array when API response is not ok', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await searchCities('London', 5);

      expect(result).toEqual([]);
    });

    it('should return empty array when fetch fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await searchCities('London', 5);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('City search error:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle cities without state property', async () => {
      const responseWithoutState = [
        {
          name: 'Paris',
          country: 'FR',
          lat: 48.8566,
          lon: 2.3522
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutState
      });

      const result = await searchCities('Paris', 5);

      expect(result[0].state).toBeUndefined();
      expect(result[0]).toEqual({
        name: 'Paris',
        country: 'FR',
        state: undefined,
        lat: 48.8566,
        lon: 2.3522
      });
    });


    it('should handle empty API response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const result = await searchCities('NonExistentCity12345', 5);

      expect(result).toEqual([]);
    });
  });
});

