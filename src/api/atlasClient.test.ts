import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AtlasRequestError, fetchAtlasSeries } from './atlasClient';
import type { AtlasQuery } from './atlasClient';

const fetchMock = vi.fn();

function baseQuery(overrides: Partial<AtlasQuery> = {}): AtlasQuery {
  return {
    latitude: 38.44,
    longitude: -122.71,
    hourlyVariables: ['surfaceTemperatureCelsius'],
    dailyVariables: [],
    units: 'METRIC',
    apiKey: 'test-key',
    ...overrides,
  };
}

describe('fetchAtlasSeries', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects immediately when no API key is set, without making a request', async () => {
    await expect(fetchAtlasSeries(baseQuery({ apiKey: '' }))).rejects.toThrow('No API key saved for Atlas');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects when no variables are selected at all', async () => {
    await expect(fetchAtlasSeries(baseQuery({ hourlyVariables: [], dailyVariables: [] }))).rejects.toThrow(
      'Select at least one hourly or daily variable',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests the bracketed [lat,lon] path with interval=HOURLY and parses the hours array', async () => {
    const body = {
      weatherData: { hourly: { hours: [{ dateHrGmt: '2026-09-02T00', surfaceTemperatureCelsius: 18 }] } },
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    const result = await fetchAtlasSeries(baseQuery());

    expect(result.hourly?.series.surfaceTemperatureCelsius).toEqual([18]);
    expect(result.hourly?.time).toEqual(['2026-09-02T00']);
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('/v3/forecast/[38.44,-122.71]');
    expect(calledUrl).toContain('interval=HOURLY');
    expect(calledUrl).toContain('units=METRIC');
    expect(calledUrl).toContain('fields=surfaceTemperatureCelsius');
    expect(calledUrl).toContain('userKey=test-key');
  });

  it('fires both hourly and daily requests in parallel and parses dailyAverages.averages', async () => {
    fetchMock.mockImplementation((url: string) => {
      const isDaily = url.includes('interval=DAILY');
      const body = isDaily
        ? { weatherData: { dailyAverages: { averages: [{ year: 2026, month: 9, day: 2, surfaceTemperatureCelsius: 20 }] } } }
        : { weatherData: { hourly: { hours: [{ dateHrGmt: '2026-09-02T00', surfaceTemperatureCelsius: 18 }] } } };
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });
    });

    const result = await fetchAtlasSeries(
      baseQuery({ hourlyVariables: ['surfaceTemperatureCelsius'], dailyVariables: ['surfaceTemperatureCelsius'] }),
    );

    expect(result.hourly?.series.surfaceTemperatureCelsius).toEqual([18]);
    expect(result.daily?.series.surfaceTemperatureCelsius).toEqual([20]);
    expect(result.daily?.time).toEqual(['2026-9-2']);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces the API-provided message on a non-ok response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, text: () => Promise.resolve(JSON.stringify({ message: 'Unauthorized' })) });

    await expect(fetchAtlasSeries(baseQuery())).rejects.toBeInstanceOf(AtlasRequestError);
    await expect(fetchAtlasSeries(baseQuery())).rejects.toThrow('Unauthorized');
  });
});
