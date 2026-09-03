import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenWeatherRequestError, fetchOpenWeatherSeries } from './openWeatherClient';
import type { OpenWeatherQuery } from './openWeatherClient';

const fetchMock = vi.fn();

function baseQuery(overrides: Partial<OpenWeatherQuery> = {}): OpenWeatherQuery {
  return {
    latitude: 38.44,
    longitude: -122.71,
    date: '2026-09-03',
    hourlyVariables: ['avgGhiClearSky'],
    dailyVariables: [],
    apiKey: 'test-key',
    ...overrides,
  };
}

function jsonResponse(body: unknown, ok = true, status = 200): { ok: boolean; status: number; text: () => Promise<string> } {
  return { ok, status, text: () => Promise.resolve(JSON.stringify(body)) };
}

describe('fetchOpenWeatherSeries', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects immediately when no API key is set, without making a request', async () => {
    await expect(fetchOpenWeatherSeries(baseQuery({ apiKey: '' }))).rejects.toThrow('No API key saved for OpenWeather');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects when no variables are selected at all', async () => {
    await expect(fetchOpenWeatherSeries(baseQuery({ hourlyVariables: [], dailyVariables: [] }))).rejects.toThrow(
      'Select at least one hourly or daily variable',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests interval=1h for hourly variables and extracts the nested clear_sky/avg_irradiance/ghi path', async () => {
    const body = {
      date: '2026-09-03',
      intervals: [{ start: '08:00', end: '08:59', avg_irradiance: { clear_sky: { ghi: 8.16, dni: 66.84, dhi: 11.48 }, cloudy_sky: { ghi: 2.04, dni: 0, dhi: 2.04 } } }],
    };
    fetchMock.mockResolvedValueOnce(jsonResponse(body));

    const result = await fetchOpenWeatherSeries(baseQuery());

    expect(result.hourly?.series.avgGhiClearSky).toEqual([8.16]);
    expect(result.hourly?.units.avgGhiClearSky).toBe('W/m²');
    expect(result.hourly?.time).toEqual(['2026-09-03T08:00']);
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('date=2026-09-03');
    expect(calledUrl).toContain('interval=1h');
    expect(calledUrl).toContain('appid=test-key');
  });

  it('uses Wh/m² for irradiation-family variables', async () => {
    const body = {
      date: '2026-09-03',
      intervals: [{ start: '08:00', irradiation: { clear_sky: { ghi: 8.15 } } }],
    };
    fetchMock.mockResolvedValueOnce(jsonResponse(body));

    const result = await fetchOpenWeatherSeries(baseQuery({ hourlyVariables: ['irradiationGhiClearSky'] }));

    expect(result.hourly?.series.irradiationGhiClearSky).toEqual([8.15]);
    expect(result.hourly?.units.irradiationGhiClearSky).toBe('Wh/m²');
  });

  it('extracts top-level sunrise/sunset for daily variables using interval=1d', async () => {
    const body = {
      date: '2026-09-03',
      sunrise: '2026-09-03T06:41:00',
      sunset: '2026-09-03T19:32:00',
      intervals: [{ start: '00:00', end: '23:59' }],
    };
    fetchMock.mockResolvedValueOnce(jsonResponse(body));

    const result = await fetchOpenWeatherSeries(baseQuery({ hourlyVariables: [], dailyVariables: ['sunrise', 'sunset'] }));

    expect(result.daily?.series.sunrise).toEqual(['2026-09-03T06:41:00']);
    expect(result.daily?.series.sunset).toEqual(['2026-09-03T19:32:00']);
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('interval=1d');
  });

  it('fires both hourly and daily requests in parallel when both are selected', async () => {
    fetchMock.mockImplementation((url: string) => {
      const isDaily = url.includes('interval=1d');
      const body = { date: '2026-09-03', intervals: [{ start: isDaily ? '00:00' : '08:00', avg_irradiance: { clear_sky: { ghi: isDaily ? 100 : 8 } } }] };
      return Promise.resolve(jsonResponse(body));
    });

    const result = await fetchOpenWeatherSeries(
      baseQuery({ hourlyVariables: ['avgGhiClearSky'], dailyVariables: ['avgGhiClearSky'] }),
    );

    expect(result.hourly?.series.avgGhiClearSky).toEqual([8]);
    expect(result.daily?.series.avgGhiClearSky).toEqual([100]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces the API-provided message on a non-ok response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ cod: 401, message: 'Invalid API key.' }, false, 401));

    await expect(fetchOpenWeatherSeries(baseQuery())).rejects.toBeInstanceOf(OpenWeatherRequestError);
    await expect(fetchOpenWeatherSeries(baseQuery())).rejects.toThrow('Invalid API key.');
  });
});
