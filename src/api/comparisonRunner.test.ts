import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runComparison } from './comparisonRunner';
import * as openMeteoClient from './openMeteoClient';
import * as visualCrossingClient from './visualCrossingClient';
import * as weatherbitClient from './weatherbitClient';
import * as atlasClient from './atlasClient';
import * as windyClient from './windyClient';
import { setCredential } from '../utils/credentials';

function baseQuery(overrides: Partial<Parameters<typeof runComparison>[0]> = {}) {
  return {
    latitude: 38.44,
    longitude: -122.71,
    providerIds: ['open-meteo'],
    variableKeys: ['temperature'],
    forecastDays: 2,
    ...overrides,
  };
}

describe('runComparison', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches the mapped native key for a keyless provider and returns it under the canonical key', async () => {
    vi.spyOn(openMeteoClient, 'fetchOpenMeteoSeries').mockResolvedValue({
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'auto',
      requestedModels: [],
      hourly: { time: ['2026-09-08T00:00'], units: { temperature_2m: '°C' }, series: { temperature_2m: [18.2] } },
    });

    const results = await runComparison(baseQuery());

    expect(results.temperature?.['open-meteo']).toEqual({
      status: 'ok',
      series: { time: ['2026-09-08T00:00'], values: [18.2] },
    });
    const call = vi.mocked(openMeteoClient.fetchOpenMeteoSeries).mock.calls[0]?.[0];
    expect(call?.hourlyVariables).toEqual(['temperature_2m']);
  });

  it('marks a provider "unavailable" for a variable it has no mapping for, without calling its client', async () => {
    const spy = vi.spyOn(openMeteoClient, 'fetchOpenMeteoSeries');

    const results = await runComparison(baseQuery({ providerIds: ['windy-point-forecast'], variableKeys: ['cloudCover'] }));

    expect(results.cloudCover?.['windy-point-forecast']).toEqual({ status: 'unavailable' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('marks a credentialed provider "skipped" when no key is saved, without calling its client', async () => {
    const spy = vi.spyOn(visualCrossingClient, 'fetchVisualCrossingSeries');

    const results = await runComparison(baseQuery({ providerIds: ['visual-crossing-energy'] }));

    expect(results.temperature?.['visual-crossing-energy']?.status).toBe('skipped');
    expect(spy).not.toHaveBeenCalled();
  });

  it('calls the client once credentials are saved for that provider', async () => {
    setCredential('visual-crossing-energy', 'apiKey', 'test-key');
    vi.spyOn(visualCrossingClient, 'fetchVisualCrossingSeries').mockResolvedValue({
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'auto',
      requestedModels: [],
      hourly: { time: ['2026-09-08T00:00'], units: {}, series: { temp: [20] } },
    });

    const results = await runComparison(baseQuery({ providerIds: ['visual-crossing-energy'] }));

    expect(results.temperature?.['visual-crossing-energy']).toEqual({ status: 'ok', series: { time: ['2026-09-08T00:00'], values: [20] } });
  });

  it('isolates one provider erroring from the others succeeding', async () => {
    vi.spyOn(openMeteoClient, 'fetchOpenMeteoSeries').mockResolvedValue({
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'auto',
      requestedModels: [],
      hourly: { time: ['2026-09-08T00:00'], units: {}, series: { temperature_2m: [18] } },
    });
    vi.spyOn(weatherbitClient, 'fetchWeatherbitSeries').mockRejectedValue(new Error('boom'));
    setCredential('weatherbit', 'apiKey', 'test-key');

    const results = await runComparison(baseQuery({ providerIds: ['open-meteo', 'weatherbit'] }));

    expect(results.temperature?.['open-meteo']?.status).toBe('ok');
    expect(results.temperature?.['weatherbit']).toEqual({ status: 'error', message: 'boom' });
  });

  it('normalizes Weatherbit wind speed from m/s to km/h', async () => {
    setCredential('weatherbit', 'apiKey', 'test-key');
    vi.spyOn(weatherbitClient, 'fetchWeatherbitSeries').mockResolvedValue({
      latitude: 38.44,
      longitude: -122.71,
      timezone: '',
      requestedModels: [],
      hourly: { time: ['2026-09-08T00:00'], units: { wind_spd: 'm/s' }, series: { wind_spd: [10] } },
    });

    const results = await runComparison(baseQuery({ providerIds: ['weatherbit'], variableKeys: ['windSpeed'] }));

    expect(results.windSpeed?.['weatherbit']?.series?.values).toEqual([36]);
  });

  it('normalizes Atlas precipitation from centimeters to millimeters', async () => {
    setCredential('athenium-atlas', 'apiKey', 'test-key');
    vi.spyOn(atlasClient, 'fetchAtlasSeries').mockResolvedValue({
      latitude: 38.44,
      longitude: -122.71,
      timezone: '',
      requestedModels: [],
      hourly: { time: ['2026-09-08T00:00'], units: {}, series: { precipitationPreviousHourCentimeters: [0.5] } },
    });

    const results = await runComparison(baseQuery({ providerIds: ['athenium-atlas'], variableKeys: ['precipitation'] }));

    expect(results.precipitation?.['athenium-atlas']?.series?.values).toEqual([5]);
  });

  it('excludes Windy from precipitation comparison entirely (3-hour window mismatch)', async () => {
    const spy = vi.spyOn(windyClient, 'fetchWindySeries');

    const results = await runComparison(baseQuery({ providerIds: ['windy-point-forecast'], variableKeys: ['precipitation'] }));

    expect(results.precipitation?.['windy-point-forecast']).toEqual({ status: 'unavailable' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('converts Windy temperature from Kelvin to Celsius only when the response says K', async () => {
    setCredential('windy-point-forecast', 'apiKey', 'test-key');
    vi.spyOn(windyClient, 'fetchWindySeries').mockResolvedValue({
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'UTC',
      requestedModels: ['gfs'],
      hourly: { time: ['2026-09-08T00:00'], units: { temp: 'K' }, series: { temp: [293.15] } },
    });

    const results = await runComparison(baseQuery({ providerIds: ['windy-point-forecast'], variableKeys: ['temperature'] }));

    expect(results.temperature?.['windy-point-forecast']?.series?.values).toEqual([20]);
  });
});
