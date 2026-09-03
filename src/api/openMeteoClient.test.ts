import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenMeteoRequestError, fetchOpenMeteoSeries } from './openMeteoClient';
import type { OpenMeteoQuery } from './openMeteoClient';

const fetchMock = vi.fn();

function baseQuery(overrides: Partial<OpenMeteoQuery> = {}): OpenMeteoQuery {
  return {
    latitude: 38.44,
    longitude: -122.71,
    hourlyVariables: ['shortwave_radiation'],
    dailyVariables: [],
    models: [],
    temperatureUnit: 'celsius',
    windSpeedUnit: 'kmh',
    precipitationUnit: 'mm',
    timeRange: { mode: 'forecast', forecastDays: 3, pastDays: 0 },
    ...overrides,
  };
}

describe('fetchOpenMeteoSeries', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the given hourly variables and returns the parsed series', async () => {
    const body = {
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'America/Los_Angeles',
      hourly_units: { shortwave_radiation: 'W/m²' },
      hourly: { time: ['2026-08-27T00:00'], shortwave_radiation: [0] },
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(body) });

    const result = await fetchOpenMeteoSeries(baseQuery());

    expect(result.hourly?.units.shortwave_radiation).toBe('W/m²');
    expect(result.hourly?.series.shortwave_radiation).toEqual([0]);
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('api.open-meteo.com/v1/forecast');
    expect(calledUrl).toContain('hourly=shortwave_radiation');
    expect(calledUrl).toContain('forecast_days=3');
    expect(calledUrl).toContain('timezone=auto');
  });

  it('requests daily variables separately from hourly ones', async () => {
    const body = {
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'America/Los_Angeles',
      daily_units: { temperature_2m_max: '°C' },
      daily: { time: ['2026-08-27'], temperature_2m_max: [30] },
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(body) });

    const result = await fetchOpenMeteoSeries(
      baseQuery({ hourlyVariables: [], dailyVariables: ['temperature_2m_max'] }),
    );

    expect(result.hourly).toBeUndefined();
    expect(result.daily?.series.temperature_2m_max).toEqual([30]);
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('daily=temperature_2m_max');
    expect(calledUrl).not.toContain('hourly=');
  });

  it('reads model-suffixed keys when more than one model is requested', async () => {
    const body = {
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'America/Los_Angeles',
      hourly_units: {
        temperature_2m_ecmwf_ifs_seamless: '°C',
        temperature_2m_ncep_gfs_seamless: '°C',
      },
      hourly: {
        time: ['2026-08-27T00:00'],
        temperature_2m_ecmwf_ifs_seamless: [20],
        temperature_2m_ncep_gfs_seamless: [21],
      },
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(body) });

    const result = await fetchOpenMeteoSeries(
      baseQuery({
        hourlyVariables: ['temperature_2m'],
        models: ['ecmwf_ifs_seamless', 'ncep_gfs_seamless'],
      }),
    );

    expect(result.hourly?.series['temperature_2m::ecmwf_ifs_seamless']).toEqual([20]);
    expect(result.hourly?.series['temperature_2m::ncep_gfs_seamless']).toEqual([21]);
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('models=ecmwf_ifs_seamless%2Cncep_gfs_seamless');
  });

  it('uses a custom date range instead of forecast_days when mode is range', async () => {
    const body = {
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'America/Los_Angeles',
      hourly_units: { shortwave_radiation: 'W/m²' },
      hourly: { time: ['2026-01-01T00:00'], shortwave_radiation: [0] },
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(body) });

    await fetchOpenMeteoSeries(
      baseQuery({ timeRange: { mode: 'range', startDate: '2026-01-01', endDate: '2026-01-07' } }),
    );

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('start_date=2026-01-01');
    expect(calledUrl).toContain('end_date=2026-01-07');
    expect(calledUrl).not.toContain('forecast_days');
  });

  it('throws OpenMeteoRequestError using the API-provided reason on a structured error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: true, reason: 'Latitude must be in range of -90 to 90°' }),
    });

    await expect(fetchOpenMeteoSeries(baseQuery({ latitude: 999 }))).rejects.toThrow(
      'Latitude must be in range of -90 to 90°',
    );
  });

  it('falls back to an HTTP status message when the error body is not structured', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });

    await expect(fetchOpenMeteoSeries(baseQuery())).rejects.toBeInstanceOf(OpenMeteoRequestError);
    await expect(fetchOpenMeteoSeries(baseQuery())).rejects.toThrow('HTTP 500');
  });
});
