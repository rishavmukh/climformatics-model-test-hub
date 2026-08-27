import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenMeteoRequestError, fetchOpenMeteoGhi } from './openMeteoClient';

const fetchMock = vi.fn();

describe('fetchOpenMeteoGhi', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests shortwave_radiation and returns the parsed hourly series', async () => {
    const body = {
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'America/Los_Angeles',
      hourly_units: { shortwave_radiation: 'W/m²' },
      hourly: { time: ['2026-08-27T00:00'], shortwave_radiation: [0] },
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(body) });

    const result = await fetchOpenMeteoGhi(38.44, -122.71, 3);

    expect(result.unit).toBe('W/m²');
    expect(result.values).toEqual([0]);
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('api.open-meteo.com/v1/forecast');
    expect(calledUrl).toContain('hourly=shortwave_radiation');
    expect(calledUrl).toContain('forecast_days=3');
    expect(calledUrl).toContain('timezone=auto');
  });

  it('throws OpenMeteoRequestError using the API-provided reason on a structured error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: true, reason: 'Latitude must be in range of -90 to 90°' }),
    });

    await expect(fetchOpenMeteoGhi(999, 0, 3)).rejects.toThrow('Latitude must be in range of -90 to 90°');
  });

  it('falls back to an HTTP status message when the error body is not structured', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });

    await expect(fetchOpenMeteoGhi(38.44, -122.71, 3)).rejects.toBeInstanceOf(OpenMeteoRequestError);
    await expect(fetchOpenMeteoGhi(38.44, -122.71, 3)).rejects.toThrow('HTTP 500');
  });
});
