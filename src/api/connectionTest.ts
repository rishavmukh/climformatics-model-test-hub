import { fetchVisualCrossingSeries, VisualCrossingRequestError } from './visualCrossingClient';
import { fetchWeatherbitSeries, WeatherbitRequestError } from './weatherbitClient';
import { fetchWindySeries, WindyRequestError } from './windyClient';
import { fetchForecaSeries, ForecaRequestError } from './forecaClient';
import { fetchAtlasSeries, AtlasRequestError } from './atlasClient';
import { fetchAccuWeatherSeries, AccuWeatherRequestError } from './accuweatherClient';
import { fetchOpenWeatherSeries, OpenWeatherRequestError } from './openWeatherClient';

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
}

type ConnectionTester = (fieldValues: Record<string, string>) => Promise<ConnectionTestResult>;

const TEST_LOCATION = { latitude: 38.4404, longitude: -122.7141 };

async function testVisualCrossing(fieldValues: Record<string, string>): Promise<ConnectionTestResult> {
  const apiKey = fieldValues['apiKey'] ?? '';
  if (!apiKey) return { ok: false, message: 'Enter an API key before testing.' };

  try {
    const result = await fetchVisualCrossingSeries({
      latitude: TEST_LOCATION.latitude,
      longitude: TEST_LOCATION.longitude,
      hourlyVariables: ['temp'],
      dailyVariables: [],
      unitGroup: 'metric',
      timeRange: { mode: 'forecast', forecastDays: 1, pastDays: 0 },
      apiKey,
    });
    const sample = result.hourly?.series['temp']?.[0];
    return {
      ok: true,
      message: typeof sample === 'number' ? `Key works — sample temperature ${sample}°C.` : 'Key works, but the test request returned no data.',
    };
  } catch (err) {
    const message = err instanceof VisualCrossingRequestError || err instanceof Error ? err.message : 'Request failed';
    return { ok: false, message };
  }
}

async function testWeatherbit(fieldValues: Record<string, string>): Promise<ConnectionTestResult> {
  const apiKey = fieldValues['apiKey'] ?? '';
  if (!apiKey) return { ok: false, message: 'Enter an API key before testing.' };

  try {
    const result = await fetchWeatherbitSeries({
      latitude: TEST_LOCATION.latitude,
      longitude: TEST_LOCATION.longitude,
      hourlyVariables: ['temp'],
      dailyVariables: [],
      apiKey,
    });
    const sample = result.hourly?.series['temp']?.[0];
    return {
      ok: true,
      message: typeof sample === 'number' ? `Key works — sample temperature ${sample}°C.` : 'Key works, but the test request returned no data.',
    };
  } catch (err) {
    const message = err instanceof WeatherbitRequestError || err instanceof Error ? err.message : 'Request failed';
    return { ok: false, message };
  }
}

async function testWindy(fieldValues: Record<string, string>): Promise<ConnectionTestResult> {
  const apiKey = fieldValues['apiKey'] ?? '';
  if (!apiKey) return { ok: false, message: 'Enter an API key before testing.' };

  try {
    const result = await fetchWindySeries({
      latitude: TEST_LOCATION.latitude,
      longitude: TEST_LOCATION.longitude,
      variables: ['temp'],
      model: 'gfs',
      apiKey,
    });
    const sample = result.hourly?.series['temp']?.[0];
    return {
      ok: true,
      message: typeof sample === 'number' ? `Key works — sample temperature ${sample}.` : 'Key works, but the test request returned no data.',
    };
  } catch (err) {
    const message = err instanceof WindyRequestError || err instanceof Error ? err.message : 'Request failed';
    return { ok: false, message };
  }
}

async function testForeca(fieldValues: Record<string, string>): Promise<ConnectionTestResult> {
  const apiKey = fieldValues['apiKey'] ?? '';
  if (!apiKey) return { ok: false, message: 'Enter an API key before testing.' };

  try {
    const result = await fetchForecaSeries({
      latitude: TEST_LOCATION.latitude,
      longitude: TEST_LOCATION.longitude,
      hourlyVariables: ['temperature'],
      dailyVariables: [],
      tempUnit: 'C',
      windUnit: 'KMH',
      apiKey,
    });
    const sample = result.hourly?.series['temperature']?.[0];
    return {
      ok: true,
      message: typeof sample === 'number' ? `Key works — sample temperature ${sample}°C.` : 'Key works, but the test request returned no data.',
    };
  } catch (err) {
    const message = err instanceof ForecaRequestError || err instanceof Error ? err.message : 'Request failed';
    return { ok: false, message };
  }
}

async function testAtlas(fieldValues: Record<string, string>): Promise<ConnectionTestResult> {
  const apiKey = fieldValues['apiKey'] ?? '';
  if (!apiKey) return { ok: false, message: 'Enter an API key before testing.' };

  try {
    const result = await fetchAtlasSeries({
      latitude: TEST_LOCATION.latitude,
      longitude: TEST_LOCATION.longitude,
      hourlyVariables: ['surfaceTemperatureCelsius'],
      dailyVariables: [],
      units: 'METRIC',
      apiKey,
    });
    const sample = result.hourly?.series['surfaceTemperatureCelsius']?.[0];
    return {
      ok: true,
      message: typeof sample === 'number' ? `Key works — sample temperature ${sample}°C.` : 'Key works, but the test request returned no data.',
    };
  } catch (err) {
    const message = err instanceof AtlasRequestError || err instanceof Error ? err.message : 'Request failed';
    return { ok: false, message };
  }
}

async function testAccuWeather(fieldValues: Record<string, string>): Promise<ConnectionTestResult> {
  const apiKey = fieldValues['apiKey'] ?? '';
  if (!apiKey) return { ok: false, message: 'Enter an API key before testing.' };

  try {
    const result = await fetchAccuWeatherSeries({
      latitude: TEST_LOCATION.latitude,
      longitude: TEST_LOCATION.longitude,
      hourlyVariables: ['temperature'],
      dailyVariables: [],
      metric: true,
      apiKey,
    });
    const sample = result.hourly?.series['temperature']?.[0];
    return {
      ok: true,
      message: typeof sample === 'number' ? `Key works — sample temperature ${sample}°C.` : 'Key works, but the test request returned no data.',
    };
  } catch (err) {
    const message = err instanceof AccuWeatherRequestError || err instanceof Error ? err.message : 'Request failed';
    return { ok: false, message };
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function testOpenWeather(fieldValues: Record<string, string>): Promise<ConnectionTestResult> {
  const apiKey = fieldValues['apiKey'] ?? '';
  if (!apiKey) return { ok: false, message: 'Enter an API key before testing.' };

  try {
    const result = await fetchOpenWeatherSeries({
      latitude: TEST_LOCATION.latitude,
      longitude: TEST_LOCATION.longitude,
      date: todayIso(),
      hourlyVariables: ['avgGhiClearSky'],
      dailyVariables: [],
      apiKey,
    });
    const sample = result.hourly?.series['avgGhiClearSky']?.[0];
    return {
      ok: true,
      message: typeof sample === 'number' ? `Key works — sample GHI ${sample} W/m².` : 'Key works, but the test request returned no data.',
    };
  } catch (err) {
    const message = err instanceof OpenWeatherRequestError || err instanceof Error ? err.message : 'Request failed';
    return { ok: false, message };
  }
}

/**
 * Live "does this key actually work" checks, one per provider that both
 * requires credentials and has a real client — the other cataloged
 * providers have nothing to call yet, so there's nothing to test.
 */
export const CONNECTION_TESTERS: Record<string, ConnectionTester> = {
  'visual-crossing-energy': testVisualCrossing,
  weatherbit: testWeatherbit,
  'windy-point-forecast': testWindy,
  foreca: testForeca,
  'athenium-atlas': testAtlas,
  'accuweather-enterprise': testAccuWeather,
  'openweather-solar': testOpenWeather,
};
