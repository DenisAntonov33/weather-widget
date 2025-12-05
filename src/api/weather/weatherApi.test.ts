import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { fetchWeatherByCoords, searchCities, CitySearchResult } from './weatherApi';
import { WeatherApiResponse } from './types';

// Test constants
const TEST_COORDINATES = {
  LONDON_LAT: 51.5074,
  LONDON_LON: -0.1278,
  PARIS_LAT: 48.8566,
  PARIS_LON: 2.3522,
  EKATERINBURG_LAT: 56.8431,
  EKATERINBURG_LON: 60.6454
};

const TEST_TEMPERATURES = {
  BASE_TEMP: 15.5,
  BASE_FEELS_LIKE: 14.2,
  ROUNDED_TEMP: 16,
  ROUNDED_FEELS_LIKE: 14,
  DEW_POINT_TEST_TEMP: 20,
  DEW_POINT_TEST_FEELS_LIKE: 18,
  DECIMAL_TEMP: 15.7,
  DECIMAL_FEELS_LIKE: 14.3
};

const TEST_WEATHER_DATA = {
  HUMIDITY: 65,
  PRESSURE: 1013,
  WIND_SPEED: 3.5,
  WIND_DEGREES: 180,
  WIND_SPEED_ALT: 2.0,
  VISIBILITY_METERS: 10000,
  VISIBILITY_KM: 10,
  DEW_POINT_TEST_HUMIDITY: 70,
  MIN_DEW_POINT: 10,
  MAX_DEW_POINT: 20
};

const TEST_LOCATIONS = {
  LONDON: 'London',
  LONDON_COUNTRY: 'GB',
  PARIS: 'Paris',
  PARIS_COUNTRY: 'FR',
  NEW_YORK: 'New York',
  LONDONDERRY: 'Londonderry'
};

const TEST_WEATHER_CONDITIONS = {
  CONDITION: 'Clouds',
  DESCRIPTION: 'scattered clouds',
  ICON: '03d'
};

const SEARCH_CONSTANTS = {
  MIN_QUERY_LENGTH: 2,
  DEFAULT_LIMIT: 3,
  CUSTOM_LIMIT: 5
};

const HTTP_STATUS = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 401
};

// Helper function to create mock fetch response
function createMockFetchResponse<T>(data: T, ok: boolean = true, status: number = 200): Response {
  return {
    ok,
    status,
    json: async () => data,
  } as Response;
}

// Helper function to create mock weather API response
function createMockWeatherResponse(overrides?: Partial<WeatherApiResponse>): WeatherApiResponse {
  return {
    name: TEST_LOCATIONS.LONDON,
    sys: { country: TEST_LOCATIONS.LONDON_COUNTRY },
    main: {
      temp: TEST_TEMPERATURES.BASE_TEMP,
      feels_like: TEST_TEMPERATURES.BASE_FEELS_LIKE,
      humidity: TEST_WEATHER_DATA.HUMIDITY,
      pressure: TEST_WEATHER_DATA.PRESSURE
    },
    weather: [{
      main: TEST_WEATHER_CONDITIONS.CONDITION,
      description: TEST_WEATHER_CONDITIONS.DESCRIPTION,
      icon: TEST_WEATHER_CONDITIONS.ICON
    }],
    wind: {
      speed: TEST_WEATHER_DATA.WIND_SPEED,
      deg: TEST_WEATHER_DATA.WIND_DEGREES
    },
    visibility: TEST_WEATHER_DATA.VISIBILITY_METERS,
    ...overrides
  };
}

// Helper function to create mock city search response
function createMockCitySearchResponse(): CitySearchResult[] {
  return [
    {
      name: TEST_LOCATIONS.LONDON,
      country: TEST_LOCATIONS.LONDON_COUNTRY,
      state: 'England',
      lat: TEST_COORDINATES.LONDON_LAT,
      lon: TEST_COORDINATES.LONDON_LON
    },
    {
      name: TEST_LOCATIONS.LONDON,
      country: 'CA',
      state: 'Ontario',
      lat: 42.9849,
      lon: -81.2453
    },
    {
      name: TEST_LOCATIONS.LONDONDERRY,
      country: TEST_LOCATIONS.LONDON_COUNTRY,
      lat: 54.9966,
      lon: -7.3086
    }
  ];
}

describe('weatherApi', () => {
  let mockFetch: MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchWeatherByCoords', () => {
    const mockWeatherResponse = createMockWeatherResponse();

    it('should fetch weather data by coordinates successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockWeatherResponse));

      const result = await fetchWeatherByCoords(TEST_COORDINATES.LONDON_LAT, TEST_COORDINATES.LONDON_LON);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`lat=${TEST_COORDINATES.LONDON_LAT}&lon=${TEST_COORDINATES.LONDON_LON}`)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('appid=')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('units=metric')
      );

      expect(result).toMatchObject({
        location: TEST_LOCATIONS.LONDON,
        country: TEST_LOCATIONS.LONDON_COUNTRY,
        temperature: TEST_TEMPERATURES.ROUNDED_TEMP,
        feelsLike: TEST_TEMPERATURES.ROUNDED_FEELS_LIKE,
        condition: TEST_WEATHER_CONDITIONS.CONDITION,
        description: TEST_WEATHER_CONDITIONS.DESCRIPTION,
        windSpeed: TEST_WEATHER_DATA.WIND_SPEED,
        windDirection: expect.any(String),
        windDegrees: TEST_WEATHER_DATA.WIND_DEGREES,
        windDescription: expect.any(String),
        pressure: TEST_WEATHER_DATA.PRESSURE,
        humidity: TEST_WEATHER_DATA.HUMIDITY,
        dewPoint: expect.any(Number),
        visibility: TEST_WEATHER_DATA.VISIBILITY_KM,
        icon: TEST_WEATHER_CONDITIONS.ICON
      });
    });

    it('should handle missing wind degrees', async () => {
      const responseWithoutWindDeg = createMockWeatherResponse({
        wind: {
          speed: TEST_WEATHER_DATA.WIND_SPEED_ALT,
          deg: undefined
        }
      });

      mockFetch.mockResolvedValueOnce(createMockFetchResponse(responseWithoutWindDeg));

      const result = await fetchWeatherByCoords(TEST_COORDINATES.LONDON_LAT, TEST_COORDINATES.LONDON_LON);

      expect(result.windDegrees).toBe(0);
      expect(result.windDirection).toBeDefined();
    });

    it('should handle missing visibility', async () => {
      const responseWithoutVisibility = createMockWeatherResponse({
        visibility: undefined
      });

      mockFetch.mockResolvedValueOnce(createMockFetchResponse(responseWithoutVisibility));

      const result = await fetchWeatherByCoords(TEST_COORDINATES.LONDON_LAT, TEST_COORDINATES.LONDON_LON);

      expect(result.visibility).toBe(TEST_WEATHER_DATA.VISIBILITY_KM);
    });

    it('should throw error when API response is not ok', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(null, false, HTTP_STATUS.NOT_FOUND));

      await expect(
        fetchWeatherByCoords(TEST_COORDINATES.LONDON_LAT, TEST_COORDINATES.LONDON_LON)
      ).rejects.toThrow('Failed to fetch weather data');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetchWeatherByCoords(TEST_COORDINATES.LONDON_LAT, TEST_COORDINATES.LONDON_LON)
      ).rejects.toThrow('Failed to fetch weather data');
    });

    it('should calculate dew point correctly', async () => {
      const responseWithSpecificTemp = createMockWeatherResponse({
        main: {
          temp: TEST_TEMPERATURES.DEW_POINT_TEST_TEMP,
          feels_like: TEST_TEMPERATURES.DEW_POINT_TEST_FEELS_LIKE,
          humidity: TEST_WEATHER_DATA.DEW_POINT_TEST_HUMIDITY,
          pressure: TEST_WEATHER_DATA.PRESSURE
        }
      });

      mockFetch.mockResolvedValueOnce(createMockFetchResponse(responseWithSpecificTemp));

      const result = await fetchWeatherByCoords(TEST_COORDINATES.LONDON_LAT, TEST_COORDINATES.LONDON_LON);

      expect(result.dewPoint).toBeGreaterThanOrEqual(TEST_WEATHER_DATA.MIN_DEW_POINT);
      expect(result.dewPoint).toBeLessThanOrEqual(TEST_WEATHER_DATA.MAX_DEW_POINT);
      expect(Number.isInteger(result.dewPoint)).toBe(true);
    });

    it('should round temperature and feelsLike correctly', async () => {
      const responseWithDecimals = createMockWeatherResponse({
        main: {
          temp: TEST_TEMPERATURES.DECIMAL_TEMP,
          feels_like: TEST_TEMPERATURES.DECIMAL_FEELS_LIKE,
          humidity: TEST_WEATHER_DATA.HUMIDITY,
          pressure: TEST_WEATHER_DATA.PRESSURE
        }
      });

      mockFetch.mockResolvedValueOnce(createMockFetchResponse(responseWithDecimals));

      const result = await fetchWeatherByCoords(TEST_COORDINATES.LONDON_LAT, TEST_COORDINATES.LONDON_LON);

      expect(result.temperature).toBe(TEST_TEMPERATURES.ROUNDED_TEMP);
      expect(result.feelsLike).toBe(TEST_TEMPERATURES.ROUNDED_FEELS_LIKE);
    });
  });

  describe('searchCities', () => {
    const mockSearchResponse = createMockCitySearchResponse();

    it('should search cities successfully', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockSearchResponse));

      const result = await searchCities(TEST_LOCATIONS.LONDON, SEARCH_CONSTANTS.CUSTOM_LIMIT);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`q=${TEST_LOCATIONS.LONDON}`)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`limit=${SEARCH_CONSTANTS.CUSTOM_LIMIT}`)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('appid=')
      );

      expect(result).toHaveLength(mockSearchResponse.length);
      expect(result[0]).toEqual(mockSearchResponse[0]);
      expect(result[1]).toEqual(mockSearchResponse[1]);
      expect(result[2]).toEqual(mockSearchResponse[2]);
    });

    it('should return empty array for query shorter than minimum length', async () => {
      const shortQuery = 'L';
      const emptyQuery = '';
      const whitespaceQuery = '   ';

      const result1 = await searchCities(shortQuery, SEARCH_CONSTANTS.CUSTOM_LIMIT);
      const result2 = await searchCities(emptyQuery, SEARCH_CONSTANTS.CUSTOM_LIMIT);
      const result3 = await searchCities(whitespaceQuery, SEARCH_CONSTANTS.CUSTOM_LIMIT);

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(result3).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should use default limit when not specified', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(mockSearchResponse.slice(0, SEARCH_CONSTANTS.DEFAULT_LIMIT)));

      await searchCities(TEST_LOCATIONS.LONDON);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`limit=${SEARCH_CONSTANTS.DEFAULT_LIMIT}`)
      );
    });

    it('should encode query string correctly', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchResponse([]));

      await searchCities(TEST_LOCATIONS.NEW_YORK, SEARCH_CONSTANTS.CUSTOM_LIMIT);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('q=New%20York')
      );
    });

    it('should handle query with leading/trailing spaces', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchResponse([]));

      const queryWithSpaces = `  ${TEST_LOCATIONS.LONDON}  `;
      await searchCities(queryWithSpaces, SEARCH_CONSTANTS.CUSTOM_LIMIT);

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should return empty array when API response is not ok', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchResponse(null, false, HTTP_STATUS.UNAUTHORIZED));

      const result = await searchCities(TEST_LOCATIONS.LONDON, SEARCH_CONSTANTS.CUSTOM_LIMIT);

      expect(result).toEqual([]);
    });

    it('should return empty array when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await searchCities(TEST_LOCATIONS.LONDON, SEARCH_CONSTANTS.CUSTOM_LIMIT);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('City search error:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle cities without state property', async () => {
      const responseWithoutState: CitySearchResult[] = [
        {
          name: TEST_LOCATIONS.PARIS,
          country: TEST_LOCATIONS.PARIS_COUNTRY,
          lat: TEST_COORDINATES.PARIS_LAT,
          lon: TEST_COORDINATES.PARIS_LON
        }
      ];

      mockFetch.mockResolvedValueOnce(createMockFetchResponse(responseWithoutState));

      const result = await searchCities(TEST_LOCATIONS.PARIS, SEARCH_CONSTANTS.CUSTOM_LIMIT);

      expect(result[0].state).toBeUndefined();
      expect(result[0]).toEqual(responseWithoutState[0]);
    });

    it('should handle empty API response', async () => {
      mockFetch.mockResolvedValueOnce(createMockFetchResponse([]));

      const result = await searchCities('NonExistentCity12345', SEARCH_CONSTANTS.CUSTOM_LIMIT);

      expect(result).toEqual([]);
    });
  });
});
