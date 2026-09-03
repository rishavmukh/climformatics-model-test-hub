import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WindyRequestError, fetchWindySeries } from './windyClient';
import type { WindyQuery } from './windyClient';

const fetchMock = vi.fn();

function baseQuery(overrides: Partial<WindyQuery> = {}): WindyQuery {
  return {
    latitude: 38.44,
    longitude: -122.71,
    variables: ['temp'],
    model: 'gfs',
    apiKey: 'test-key',
    ...overrides,
  };
}

describe('fetchWindySeries', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects immediately when no API key is set, without making a request', async () => {
    await expect(fetchWindySeries(baseQuery({ apiKey: '' }))).rejects.toThrow('No API key saved for Windy.com');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs a JSON body with lat, lon, model, parameters, levels, and key', async () => {
    const body = { ts: [1893456000000], units: { 'temp-surface': '°C' }, 'temp-surface': [20] };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    await fetchWindySeries(baseQuery());

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.windy.com/api/point-forecast/v2');
    expect(options.method).toBe('POST');
    const sentBody = JSON.parse(options.body as string) as Record<string, unknown>;
    expect(sentBody).toMatchObject({ lat: 38.44, lon: -122.71, model: 'gfs', parameters: ['temp'], levels: ['surface'], key: 'test-key' });
  });

  it('parses a simple scalar variable using the response units object', async () => {
    const body = { ts: [1893456000000], units: { 'temp-surface': '°C' }, 'temp-surface': [20] };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    const result = await fetchWindySeries(baseQuery());

    expect(result.hourly?.series.temp).toEqual([20]);
    expect(result.hourly?.units.temp).toBe('°C');
    expect(result.hourly?.time).toEqual([new Date(1893456000000).toISOString()]);
  });

  it('combines wind_u/wind_v into wind speed and meteorological direction', async () => {
    const body = {
      ts: [1893456000000],
      units: { 'wind_u-surface': 'm*s-1' },
      'wind_u-surface': [0],
      'wind_v-surface': [-5],
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    const result = await fetchWindySeries(baseQuery({ variables: ['wind_speed', 'wind_direction'] }));

    expect(result.hourly?.series.wind_speed).toEqual([5]);
    // u=0, v=-5 (blowing due south) => wind is FROM the north => 0 degrees
    expect(result.hourly?.series.wind_direction).toEqual([0]);

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sentBody = JSON.parse(options.body as string) as Record<string, unknown>;
    expect(sentBody['parameters']).toEqual(['wind']);
  });

  it('surfaces the API-provided message on a non-ok response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({ message: 'Invalid API key', error: 'Bad Request', statusCode: 400 })),
    });

    await expect(fetchWindySeries(baseQuery())).rejects.toBeInstanceOf(WindyRequestError);
    await expect(fetchWindySeries(baseQuery())).rejects.toThrow('Invalid API key');
  });
});
