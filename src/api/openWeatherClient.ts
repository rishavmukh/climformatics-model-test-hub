import type { SeriesBlock, SeriesResult, SeriesValue } from './seriesTypes';

const BASE_URL = 'https://api.openweathermap.org/energy/2.0/solar/interval_data';

export class OpenWeatherRequestError extends Error {}

export interface OpenWeatherQuery {
  latitude: number;
  longitude: number;
  date: string;
  hourlyVariables: string[];
  dailyVariables: string[];
  apiKey: string;
}

/** [aggregation, skyModel, metric] path into one interval object's nested irradiance data. */
const IRRADIANCE_FIELD_PATHS: Record<string, [string, string, string]> = {};
for (const [aggPrefix, aggKey] of [
  ['avg', 'avg_irradiance'],
  ['max', 'max_irradiance'],
  ['irradiation', 'irradiation'],
] as const) {
  for (const [metricSuffix, metricKey] of [
    ['Ghi', 'ghi'],
    ['Dni', 'dni'],
    ['Dhi', 'dhi'],
  ] as const) {
    for (const [skySuffix, skyKey] of [
      ['ClearSky', 'clear_sky'],
      ['CloudySky', 'cloudy_sky'],
    ] as const) {
      IRRADIANCE_FIELD_PATHS[`${aggPrefix}${metricSuffix}${skySuffix}`] = [aggKey, skyKey, metricKey];
    }
  }
}

function unitFor(variable: string): string {
  if (variable === 'sunrise' || variable === 'sunset') return '';
  return variable.startsWith('irradiation') ? 'Wh/m²' : 'W/m²';
}

type RawInterval = {
  start?: string;
  end?: string;
  avg_irradiance?: Record<string, Record<string, number>>;
  max_irradiance?: Record<string, Record<string, number>>;
  irradiation?: Record<string, Record<string, number>>;
};
interface RawResponse {
  date?: string;
  sunrise?: string;
  sunset?: string;
  intervals?: RawInterval[];
  message?: string;
  cod?: number;
}

function normalizeValue(raw: unknown): SeriesValue {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') return raw;
  return null;
}

function extractIrradiance(interval: RawInterval, path: [string, string, string]): number | undefined {
  const [aggKey, skyKey, metricKey] = path;
  const aggregation = interval[aggKey as 'avg_irradiance' | 'max_irradiance' | 'irradiation'];
  const sky = aggregation?.[skyKey];
  return sky?.[metricKey];
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function fetchInterval(
  query: OpenWeatherQuery,
  interval: '1h' | '1d',
  variables: string[],
): Promise<SeriesBlock | undefined> {
  if (variables.length === 0) return undefined;

  const params = new URLSearchParams({
    lat: String(query.latitude),
    lon: String(query.longitude),
    date: query.date,
    interval,
    appid: query.apiKey,
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  const parsed = await parseBody(response);

  if (!response.ok) {
    const body = parsed as { message?: string } | string;
    const message = typeof body === 'string' ? body : (body.message ?? `HTTP ${response.status}`);
    throw new OpenWeatherRequestError(message);
  }

  const body = parsed as RawResponse;
  const intervals = body.intervals ?? [];

  const units: Record<string, string> = {};
  const series: Record<string, SeriesValue[]> = {};
  for (const variable of variables) {
    units[variable] = unitFor(variable);
    if (variable === 'sunrise' || variable === 'sunset') {
      series[variable] = intervals.map(() => normalizeValue(body[variable]));
      continue;
    }
    const path = IRRADIANCE_FIELD_PATHS[variable];
    if (!path) continue;
    series[variable] = intervals.map((entry) => normalizeValue(extractIrradiance(entry, path)));
  }

  const time = intervals.map((entry) => `${body.date ?? query.date}T${entry.start ?? ''}`);
  return { time, units, series };
}

/**
 * OpenWeather's Solar Irradiance API — a paid, per-call product distinct
 * from OpenWeatherMap's general forecast APIs. One request covers exactly
 * one calendar date (no multi-day range, no forecast_days), so unlike
 * every other client here there's no way to widen a single call to cover
 * more days — the Dashboard exposes a single date picker for this
 * provider instead of the shared Time range control, specifically so
 * running a test here can't silently fan out into multiple billed calls.
 * Hourly variables use `interval=1h`; daily variables use `interval=1d`
 * (a single whole-day slice) — two separate requests, same as the
 * Weatherbit/Atlas/Foreca clients.
 */
export async function fetchOpenWeatherSeries(query: OpenWeatherQuery): Promise<SeriesResult> {
  if (!query.apiKey) {
    throw new OpenWeatherRequestError('No API key saved for OpenWeather — add one on the Settings page.');
  }
  if (query.hourlyVariables.length === 0 && query.dailyVariables.length === 0) {
    throw new OpenWeatherRequestError('Select at least one hourly or daily variable.');
  }

  const [hourly, daily] = await Promise.all([
    fetchInterval(query, '1h', query.hourlyVariables),
    fetchInterval(query, '1d', query.dailyVariables),
  ]);

  return {
    latitude: query.latitude,
    longitude: query.longitude,
    timezone: '',
    requestedModels: [],
    hourly,
    daily,
  };
}
