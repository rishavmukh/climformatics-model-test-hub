import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ForecaRequestError, fetchForecaSeries } from './forecaClient';
import type { ForecaQuery } from './forecaClient';

const fetchMock = vi.fn();

function baseQuery(overrides: Partial<ForecaQuery> = {}): ForecaQuery {
  return {
    latitude: 38.44,
    longitude: -122.71,
    hourlyVariables: ['solarRadiation'],
    dailyVariables: [],
    tempUnit: 'C',
    windUnit: 'KMH',
    apiKey: 'test-key',
    ...overrides,
  };
}

describe('fetchForecaSeries', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects immediately when no API key is set, without making a request', async () => {
    await expect(fetchForecaSeries(baseQuery({ apiKey: '' }))).rejects.toThrow('No API key saved for Foreca');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests the hourly endpoint with tempunit/windunit/token and parses the forecast array', async () => {
    const body = { forecast: [{ time: '2026-09-02T00:00+00:00', solarRadiation: 0 }, { time: '2026-09-02T01:00+00:00', solarRadiation: 140 }] };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    const result = await fetchForecaSeries(baseQuery());

    expect(result.hourly?.series.solarRadiation).toEqual([0, 140]);
    expect(result.hourly?.units.solarRadiation).toBe('W/m²');
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('/api/v1/forecast/hourly/38.44,-122.71');
    expect(calledUrl).toContain('tempunit=C');
    expect(calledUrl).toContain('windunit=KMH');
    expect(calledUrl).toContain('token=test-key');
  });

  it('uses the selected temperature unit for temperature-family fields', async () => {
    const body = { forecast: [{ time: '2026-09-02T00:00+00:00', temperature: 68 }] };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    const result = await fetchForecaSeries(baseQuery({ hourlyVariables: ['temperature'], tempUnit: 'F' }));

    expect(result.hourly?.units.temperature).toBe('°F');
  });

  it('fires both hourly and daily requests in parallel', async () => {
    fetchMock.mockImplementation((url: string) => {
      const isDaily = url.includes('/forecast/daily/');
      const body = { forecast: [{ [isDaily ? 'date' : 'time']: '2026-09-02', maxTemp: isDaily ? 25 : undefined, temperature: isDaily ? undefined : 20 }] };
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });
    });

    const result = await fetchForecaSeries(baseQuery({ hourlyVariables: ['temperature'], dailyVariables: ['maxTemp'] }));

    expect(result.hourly?.series.temperature).toEqual([20]);
    expect(result.daily?.series.maxTemp).toEqual([25]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces the API-provided message on a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve(JSON.stringify({ error: 'invalid_token', message: 'Invalid token: Wrong number of segments' })),
    });

    await expect(fetchForecaSeries(baseQuery())).rejects.toBeInstanceOf(ForecaRequestError);
    await expect(fetchForecaSeries(baseQuery())).rejects.toThrow('Wrong number of segments');
  });
});
