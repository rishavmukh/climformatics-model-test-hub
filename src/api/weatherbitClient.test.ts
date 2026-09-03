import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WeatherbitRequestError, fetchWeatherbitSeries } from './weatherbitClient';
import type { WeatherbitQuery } from './weatherbitClient';

const fetchMock = vi.fn();

function baseQuery(overrides: Partial<WeatherbitQuery> = {}): WeatherbitQuery {
  return {
    latitude: 38.44,
    longitude: -122.71,
    hourlyVariables: ['t_ghi'],
    dailyVariables: [],
    apiKey: 'test-key',
    ...overrides,
  };
}

describe('fetchWeatherbitSeries', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects immediately when no API key is set, without making a request', async () => {
    await expect(fetchWeatherbitSeries(baseQuery({ apiKey: '' }))).rejects.toThrow('No API key saved for Weatherbit');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects when no variables are selected at all', async () => {
    await expect(fetchWeatherbitSeries(baseQuery({ hourlyVariables: [], dailyVariables: [] }))).rejects.toThrow(
      'Select at least one hourly or daily variable',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests tp=hourly with units=M and parses the data rows', async () => {
    const body = { lat: 38.44, lon: -122.71, data: [{ timestamp_local: '2026-09-02:00', t_ghi: 0 }, { timestamp_local: '2026-09-02:01', t_ghi: 5 }] };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    const result = await fetchWeatherbitSeries(baseQuery());

    expect(result.hourly?.series.t_ghi).toEqual([0, 5]);
    expect(result.hourly?.units.t_ghi).toBe('W/m²');
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('tp=hourly');
    expect(calledUrl).toContain('units=M');
  });

  it('fires both hourly and daily requests in parallel when both are requested', async () => {
    fetchMock.mockImplementation((url: string) => {
      const isDaily = url.includes('tp=daily');
      const body = { data: [{ date: '2026-09-02', temp: isDaily ? 20 : 18 }] };
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });
    });

    const result = await fetchWeatherbitSeries(baseQuery({ hourlyVariables: ['temp'], dailyVariables: ['temp'] }));

    expect(result.hourly?.series.temp).toEqual([18]);
    expect(result.daily?.series.temp).toEqual([20]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces the API-provided error message on a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve(JSON.stringify({ error: 'Your API Key does not allow access to this endpoint.' })),
    });

    await expect(fetchWeatherbitSeries(baseQuery())).rejects.toBeInstanceOf(WeatherbitRequestError);
    await expect(fetchWeatherbitSeries(baseQuery())).rejects.toThrow('does not allow access');
  });
});
