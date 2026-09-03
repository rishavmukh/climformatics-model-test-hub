import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VisualCrossingRequestError, fetchVisualCrossingSeries } from './visualCrossingClient';
import type { VisualCrossingQuery } from './visualCrossingClient';

const fetchMock = vi.fn();

function baseQuery(overrides: Partial<VisualCrossingQuery> = {}): VisualCrossingQuery {
  return {
    latitude: 38.44,
    longitude: -122.71,
    hourlyVariables: ['solarradiation'],
    dailyVariables: [],
    unitGroup: 'metric',
    timeRange: { mode: 'range', startDate: '2026-09-02', endDate: '2026-09-02' },
    apiKey: 'test-key',
    ...overrides,
  };
}

describe('fetchVisualCrossingSeries', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects immediately when no API key is set, without making a request', async () => {
    await expect(fetchVisualCrossingSeries(baseQuery({ apiKey: '' }))).rejects.toThrow(
      'No API key saved for Visual Crossing',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('builds the request URL with location, dates, elements, and unit group', async () => {
    const body = { latitude: 38.44, longitude: -122.71, timezone: 'America/Los_Angeles', days: [] };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    await fetchVisualCrossingSeries(baseQuery());

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline');
    expect(calledUrl).toContain('38.44%2C-122.71/2026-09-02/2026-09-02');
    expect(calledUrl).toContain('key=test-key');
    expect(calledUrl).toContain('unitGroup=metric');
    expect(calledUrl).toContain('include=days%2Chours');
    expect(calledUrl).toContain('elements=datetime%2Csolarradiation');
  });

  it('flattens nested hourly data into a time-indexed series with units', async () => {
    const body = {
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'America/Los_Angeles',
      days: [{ datetime: '2026-09-02', hours: [{ datetime: '00:00:00', solarradiation: 0 }, { datetime: '01:00:00', solarradiation: 5 }] }],
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    const result = await fetchVisualCrossingSeries(baseQuery());

    expect(result.hourly?.time).toEqual(['2026-09-02T00:00:00', '2026-09-02T01:00:00']);
    expect(result.hourly?.series.solarradiation).toEqual([0, 5]);
    expect(result.hourly?.units.solarradiation).toBe('W/m²');
  });

  it('parses daily variables straight off the day objects', async () => {
    const body = {
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'America/Los_Angeles',
      days: [{ datetime: '2026-09-02', tempmax: 30, preciptype: ['rain'] }],
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    const result = await fetchVisualCrossingSeries(baseQuery({ hourlyVariables: [], dailyVariables: ['tempmax', 'preciptype'] }));

    expect(result.daily?.series.tempmax).toEqual([30]);
    expect(result.daily?.series.preciptype).toEqual(['rain']);
  });

  it('surfaces a plain-text error body as the error message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('No account found with API key'),
    });

    await expect(fetchVisualCrossingSeries(baseQuery())).rejects.toBeInstanceOf(VisualCrossingRequestError);
    await expect(fetchVisualCrossingSeries(baseQuery())).rejects.toThrow('No account found with API key');
  });
});
