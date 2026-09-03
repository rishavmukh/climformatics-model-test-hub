import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccuWeatherRequestError, fetchAccuWeatherSeries } from './accuweatherClient';
import type { AccuWeatherQuery } from './accuweatherClient';

const fetchMock = vi.fn();

function baseQuery(overrides: Partial<AccuWeatherQuery> = {}): AccuWeatherQuery {
  return {
    latitude: 38.44,
    longitude: -122.71,
    hourlyVariables: ['temperature'],
    dailyVariables: [],
    metric: true,
    apiKey: 'test-key',
    ...overrides,
  };
}

function jsonResponse(body: unknown, ok = true, status = 200): { ok: boolean; status: number; text: () => Promise<string> } {
  return { ok, status, text: () => Promise.resolve(JSON.stringify(body)) };
}

describe('fetchAccuWeatherSeries', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects immediately when no API key is set, without making a request', async () => {
    await expect(fetchAccuWeatherSeries(baseQuery({ apiKey: '' }))).rejects.toThrow('No API key saved for AccuWeather');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects when no variables are selected at all, before resolving a location', async () => {
    await expect(fetchAccuWeatherSeries(baseQuery({ hourlyVariables: [], dailyVariables: [] }))).rejects.toThrow(
      'Select at least one hourly or daily variable',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('resolves a location key first, then requests the hourly forecast and extracts nested Value fields', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/locations/v1/cities/geoposition/search')) {
        return Promise.resolve(jsonResponse({ Key: '327139' }));
      }
      if (url.includes('/forecasts/v1/hourly/12hour/327139')) {
        return Promise.resolve(jsonResponse([{ DateTime: '2026-09-02T21:00:00-07:00', Temperature: { Value: 14.3, Unit: 'C' } }]));
      }
      throw new Error(`unexpected URL ${url}`);
    });

    const result = await fetchAccuWeatherSeries(baseQuery());

    expect(result.hourly?.series.temperature).toEqual([14.3]);
    expect(result.hourly?.units.temperature).toBe('°C');
    expect(result.hourly?.time).toEqual(['2026-09-02T21:00:00-07:00']);
    const locationCallUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(locationCallUrl).toContain('q=38.44%2C-122.71');
  });

  it('extracts deeply nested daily fields, including Day/Night period and Min/Max/Average variants', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/locations/v1/cities/geoposition/search')) {
        return Promise.resolve(jsonResponse({ Key: '327139' }));
      }
      if (url.includes('/forecasts/v1/daily/5day/327139')) {
        return Promise.resolve(
          jsonResponse({
            DailyForecasts: [
              {
                Date: '2026-09-02T07:00:00-07:00',
                Temperature: { Minimum: { Value: 12.4 }, Maximum: { Value: 23.1 } },
                Day: { RelativeHumidity: { Minimum: 49, Maximum: 95, Average: 70 } },
              },
            ],
          }),
        );
      }
      throw new Error(`unexpected URL ${url}`);
    });

    const result = await fetchAccuWeatherSeries(
      baseQuery({ hourlyVariables: [], dailyVariables: ['temperatureMax', 'dayRelativeHumidityAverage'] }),
    );

    expect(result.daily?.series.temperatureMax).toEqual([23.1]);
    expect(result.daily?.series.dayRelativeHumidityAverage).toEqual([70]);
    expect(result.daily?.units.dayRelativeHumidityAverage).toBe('%');
  });

  it('only calls the endpoints for granularities that have selected variables', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/locations/v1/cities/geoposition/search')) return Promise.resolve(jsonResponse({ Key: '327139' }));
      if (url.includes('/forecasts/v1/hourly/12hour/327139')) {
        return Promise.resolve(jsonResponse([{ DateTime: '2026-09-02T00:00', Temperature: { Value: 18 } }]));
      }
      throw new Error(`unexpected URL ${url}`);
    });

    const result = await fetchAccuWeatherSeries(baseQuery({ hourlyVariables: ['temperature'], dailyVariables: [] }));

    expect(result.daily).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces the API-provided message when location resolution fails', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ Message: 'Invalid apikey' }, false, 401));

    await expect(fetchAccuWeatherSeries(baseQuery())).rejects.toBeInstanceOf(AccuWeatherRequestError);
    await expect(fetchAccuWeatherSeries(baseQuery())).rejects.toThrow('Invalid apikey');
  });
});
