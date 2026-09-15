import type { SeriesBlock, SeriesValue, TimeRange } from './seriesTypes';
import { PROVIDER_VARIABLE_MAP } from '../data/comparisonVariables';
import { PROVIDERS } from '../data/providers';
import { getCredential, hasAllCredentials } from '../utils/credentials';
import { fetchOpenMeteoSeries } from './openMeteoClient';
import { fetchVisualCrossingSeries } from './visualCrossingClient';
import { fetchWeatherbitSeries } from './weatherbitClient';
import { fetchAccuWeatherSeries } from './accuweatherClient';
import { fetchOpenWeatherSeries } from './openWeatherClient';
import { fetchForecaSeries } from './forecaClient';
import { fetchAtlasSeries } from './atlasClient';
import { fetchWindySeries } from './windyClient';
import { fetchTomorrowIoSeries } from './tomorrowIoClient';

export interface ComparisonSeries {
  time: string[];
  values: SeriesValue[];
}

export type ProviderVariableStatus = 'ok' | 'error' | 'skipped' | 'unavailable';

export interface ProviderVariableResult {
  status: ProviderVariableStatus;
  message?: string;
  series?: ComparisonSeries;
}

/** [canonicalVariableKey][providerId] -> that provider's result for that variable. */
export type ComparisonResults = Record<string, Record<string, ProviderVariableResult>>;

/** Target unit each canonical variable is normalized to for comparison — shown as an axis/table label. */
export const COMPARISON_UNITS: Record<string, string> = {
  temperature: '°C',
  humidity: '%',
  windSpeed: 'km/h',
  precipitation: 'mm',
  cloudCover: '%',
  pressure: 'hPa',
  solarGhi: 'W/m²',
};

/**
 * A few providers report a mapped field in a different unit than the rest
 * (confirmed from their own client code/docs, not guessed) — left as-is
 * these would silently plot as if comparable when they aren't. Weatherbit
 * and Windy report wind speed in m/s while everyone else here uses km/h;
 * Atlas's precipitation field is centimeters, not millimeters. Windy's own
 * unit for temperature/pressure varies by model (°C or K; Pa or hPa per
 * their docs), so those two are checked against the actual unit string in
 * the response rather than assumed. Windy's precipitation is a 3-hour
 * accumulation, not directly comparable to everyone else's hourly figure —
 * that one is excluded at the mapping level (comparisonVariables.ts)
 * instead of rescaled, since there's no factor that fixes a different
 * integration window.
 */
function normalizeComparisonValue(providerId: string, variableKey: string, value: SeriesValue, unit: string | undefined): SeriesValue {
  if (typeof value !== 'number') return value;

  if (variableKey === 'windSpeed' && providerId === 'weatherbit') return value * 3.6; // m/s -> km/h
  if (variableKey === 'windSpeed' && providerId === 'windy-point-forecast' && (unit === undefined || unit === 'm/s' || unit === 'm*s-1')) {
    return value * 3.6;
  }
  if (variableKey === 'precipitation' && providerId === 'athenium-atlas') return value * 10; // cm -> mm
  if (variableKey === 'temperature' && providerId === 'windy-point-forecast' && unit === 'K') return value - 273.15;
  if (variableKey === 'pressure' && providerId === 'windy-point-forecast' && unit === 'Pa') return value / 100;

  return value;
}

export interface ComparisonQuery {
  latitude: number;
  longitude: number;
  providerIds: string[];
  variableKeys: string[];
  forecastDays: number;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchProviderHourly(providerId: string, nativeKeys: string[], query: ComparisonQuery, apiKey: string): Promise<SeriesBlock | undefined> {
  const timeRange: TimeRange = { mode: 'forecast', forecastDays: query.forecastDays, pastDays: 0 };
  const { latitude, longitude } = query;

  switch (providerId) {
    case 'open-meteo':
      return (
        await fetchOpenMeteoSeries({
          latitude,
          longitude,
          hourlyVariables: nativeKeys,
          dailyVariables: [],
          models: [],
          temperatureUnit: 'celsius',
          windSpeedUnit: 'kmh',
          precipitationUnit: 'mm',
          timeRange,
        })
      ).hourly;
    case 'visual-crossing-energy':
      return (
        await fetchVisualCrossingSeries({ latitude, longitude, hourlyVariables: nativeKeys, dailyVariables: [], unitGroup: 'metric', timeRange, apiKey })
      ).hourly;
    case 'weatherbit':
      return (await fetchWeatherbitSeries({ latitude, longitude, hourlyVariables: nativeKeys, dailyVariables: [], apiKey })).hourly;
    case 'accuweather-enterprise':
      return (await fetchAccuWeatherSeries({ latitude, longitude, hourlyVariables: nativeKeys, dailyVariables: [], metric: true, apiKey })).hourly;
    case 'openweather-solar':
      return (await fetchOpenWeatherSeries({ latitude, longitude, date: todayIso(), hourlyVariables: nativeKeys, dailyVariables: [], apiKey })).hourly;
    case 'foreca':
      return (
        await fetchForecaSeries({ latitude, longitude, hourlyVariables: nativeKeys, dailyVariables: [], tempUnit: 'C', windUnit: 'KMH', apiKey })
      ).hourly;
    case 'athenium-atlas':
      return (await fetchAtlasSeries({ latitude, longitude, hourlyVariables: nativeKeys, dailyVariables: [], units: 'METRIC', apiKey })).hourly;
    case 'windy-point-forecast':
      return (await fetchWindySeries({ latitude, longitude, variables: nativeKeys, model: 'gfs', apiKey })).hourly;
    case 'tomorrow-io-solar':
      return (await fetchTomorrowIoSeries({ latitude, longitude, hourlyVariables: nativeKeys, dailyVariables: [], timeRange, apiKey })).hourly;
    default:
      return undefined;
  }
}

async function runProvider(providerId: string, variableKeys: string[], query: ComparisonQuery): Promise<Record<string, ProviderVariableResult>> {
  const provider = PROVIDERS.find((candidate) => candidate.id === providerId);
  const out: Record<string, ProviderVariableResult> = {};

  const nativeKeyForVariable: Record<string, string> = {};
  for (const variableKey of variableKeys) {
    const nativeKey = PROVIDER_VARIABLE_MAP[variableKey]?.[providerId];
    if (nativeKey) {
      nativeKeyForVariable[variableKey] = nativeKey;
    } else {
      out[variableKey] = { status: 'unavailable' };
    }
  }

  const nativeKeys = Array.from(new Set(Object.values(nativeKeyForVariable)));
  if (nativeKeys.length === 0) return out;

  if (provider?.requiresCredentials && !hasAllCredentials(provider)) {
    for (const variableKey of Object.keys(nativeKeyForVariable)) {
      out[variableKey] = { status: 'skipped', message: 'No credentials saved for this provider.' };
    }
    return out;
  }

  const apiKey = provider?.requiresCredentials ? getCredential(providerId, 'apiKey') : '';

  try {
    const hourly = await fetchProviderHourly(providerId, nativeKeys, query, apiKey);
    for (const [variableKey, nativeKey] of Object.entries(nativeKeyForVariable)) {
      const series = hourly?.series[nativeKey];
      if (!hourly || !series) {
        out[variableKey] = { status: 'error', message: 'Provider returned no data for this field.' };
        continue;
      }
      const unit = hourly.units[nativeKey];
      const values = series.map((value) => normalizeComparisonValue(providerId, variableKey, value, unit));
      out[variableKey] = { status: 'ok', series: { time: hourly.time, values } };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    for (const variableKey of Object.keys(nativeKeyForVariable)) {
      out[variableKey] = { status: 'error', message };
    }
  }

  return out;
}

/**
 * Fans out one comparison run across every selected provider in parallel
 * (a failure in one provider doesn't affect the others — each gets its own
 * status), then reshapes the results by canonical variable so the Compare
 * page can render one table per variable with one column per provider.
 * Providers with no configurable date range (Weatherbit, Windy, Foreca,
 * AccuWeather) ignore `forecastDays` and just return their own fixed
 * window, same as the Testing page.
 */
export async function runComparison(query: ComparisonQuery): Promise<ComparisonResults> {
  const perProvider = await Promise.all(
    query.providerIds.map(async (providerId): Promise<[string, Record<string, ProviderVariableResult>]> => [
      providerId,
      await runProvider(providerId, query.variableKeys, query),
    ]),
  );

  const results: ComparisonResults = {};
  for (const variableKey of query.variableKeys) results[variableKey] = {};
  for (const [providerId, variableResults] of perProvider) {
    for (const [variableKey, result] of Object.entries(variableResults)) {
      const bucket = results[variableKey] ?? {};
      bucket[providerId] = result;
      results[variableKey] = bucket;
    }
  }
  return results;
}
