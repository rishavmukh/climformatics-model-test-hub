import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TomorrowIoRequestError, fetchTomorrowIoSeries } from './tomorrowIoClient';
import type { TomorrowIoQuery } from './tomorrowIoClient';

const fetchMock = vi.fn();

function baseQuery(overrides: Partial<TomorrowIoQuery> = {}): TomorrowIoQuery {
  return {
    latitude: 38.44,
    longitude: -122.71,
    hourlyVariables: ['temperature'],
    dailyVariables: [],
    timeRange: { mode: 'forecast', forecastDays: 3, pastDays: 0 },
    apiKey: 'test-key',
    ...overrides,
  };
}

function jsonResponse(body: unknown, ok = true, status = 200): { ok: boolean; status: number; text: () => Promise<string> } {
  return { ok, status, text: () => Promise.resolve(JSON.stringify(body)) };
}

describe('fetchTomorrowIoSeries', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects immediately when no API key is set, without making a request', async () => {
    await expect(fetchTomorrowIoSeries(baseQuery({ apiKey: '' }))).rejects.toThrow('No API key saved for Tomorrow.io');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects when no variables are selected at all', async () => {
    await expect(fetchTomorrowIoSeries(baseQuery({ hourlyVariables: [], dailyVariables: [] }))).rejects.toThrow(
      'Select at least one hourly or daily variable',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests timesteps=1h with metric units and parses intervals', async () => {
    const body = { data: { timelines: [{ intervals: [{ startTime: '2026-09-03T04:00:00Z', values: { temperature: 17.02 } }] }] } };
    fetchMock.mockResolvedValueOnce(jsonResponse(body));

    const result = await fetchTomorrowIoSeries(baseQuery());

    expect(result.hourly?.series.temperature).toEqual([17.02]);
    expect(result.hourly?.time).toEqual(['2026-09-03T04:00:00Z']);
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('timesteps=1h');
    expect(calledUrl).toContain('units=metric');
    expect(calledUrl).toContain('apikey=test-key');
    expect(calledUrl).toContain('location=38.44%2C-122.71');
  });

  it('builds an ISO8601 startTime/endTime window in custom range mode', async () => {
    const body = { data: { timelines: [{ intervals: [] }] } };
    fetchMock.mockResolvedValueOnce(jsonResponse(body));

    await fetchTomorrowIoSeries(baseQuery({ timeRange: { mode: 'range', startDate: '2026-09-01', endDate: '2026-09-05' } }));

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain(encodeURIComponent('2026-09-01T00:00:00Z'));
    expect(calledUrl).toContain(encodeURIComponent('2026-09-05T23:59:59Z'));
  });

  it('fires both hourly (1h) and daily (1d) requests in parallel', async () => {
    fetchMock.mockImplementation((url: string) => {
      const isDaily = url.includes('timesteps=1d');
      const body = { data: { timelines: [{ intervals: [{ startTime: '2026-09-03', values: { temperature: isDaily ? 20 : 15 } }] }] } };
      return Promise.resolve(jsonResponse(body));
    });

    const result = await fetchTomorrowIoSeries(baseQuery({ hourlyVariables: ['temperature'], dailyVariables: ['temperature'] }));

    expect(result.hourly?.series.temperature).toEqual([15]);
    expect(result.daily?.series.temperature).toEqual([20]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces the API-provided message on a non-ok response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 400001, type: 'Invalid Query Parameters', message: 'the field moonPhase is not allowed for the following timesteps: ,1h' }, false, 400));

    await expect(fetchTomorrowIoSeries(baseQuery())).rejects.toBeInstanceOf(TomorrowIoRequestError);
    await expect(fetchTomorrowIoSeries(baseQuery())).rejects.toThrow('not allowed for the following timesteps');
  });
});
