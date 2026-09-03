import type { SeriesBlock, SeriesResult, SeriesValue } from './seriesTypes';

const BASE_URL = 'https://weatherapi.foreca.net/api/v1/forecast';

export class ForecaRequestError extends Error {}

export type ForecaTempUnit = 'C' | 'F';
export type ForecaWindUnit = 'MS' | 'KTS' | 'KMH' | 'MPH';

export interface ForecaQuery {
  latitude: number;
  longitude: number;
  hourlyVariables: string[];
  dailyVariables: string[];
  tempUnit: ForecaTempUnit;
  windUnit: ForecaWindUnit;
  apiKey: string;
}

const WIND_UNIT_LABEL: Record<ForecaWindUnit, string> = { MS: 'm/s', KTS: 'kt', KMH: 'km/h', MPH: 'mph' };

/**
 * Units per field. Most are confirmed from Foreca's docs (solarRadiation
 * in W/m², visibility in meters, pressure in hPa). precipAccum/snowAccum/
 * snowDepth aren't documented with an explicit unit — millimeters is the
 * common default for this class of API and Foreca is Finland-based, but
 * that specific assumption isn't independently confirmed.
 */
function unitFor(variable: string, tempUnit: ForecaTempUnit, windUnit: ForecaWindUnit): string {
  if (['temperature', 'feelsLikeTemp', 'dewPoint', 'maxTemp', 'minTemp'].includes(variable)) {
    return tempUnit === 'C' ? '°C' : '°F';
  }
  if (['windSpeed', 'windGust', 'maxWindSpeed', 'maxWindGust'].includes(variable)) return WIND_UNIT_LABEL[windUnit];
  if (['relHumidity', 'precipProb', 'thunderProb', 'cloudiness'].includes(variable)) return '%';
  if (variable === 'windDir') return '°';
  if (variable === 'pressure') return 'hPa';
  if (variable === 'visibility') return 'm';
  if (variable === 'solarRadiation') return 'W/m²';
  if (variable === 'solarRadiationSum') return 'Wh/m²';
  if (variable === 'sunhours') return 'h';
  if (['precipAccum', 'snowAccum', 'snowDepth'].includes(variable)) return 'mm';
  return '';
}

type RawRow = Record<string, unknown>;
interface RawResponse {
  forecast?: RawRow[];
  message?: string;
  error?: string;
}

function normalizeValue(raw: unknown): SeriesValue {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') return raw;
  return null;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function fetchGranularity(
  query: ForecaQuery,
  granularity: 'hourly' | 'daily',
  variables: string[],
): Promise<SeriesBlock | undefined> {
  if (variables.length === 0) return undefined;

  const params = new URLSearchParams({ tempunit: query.tempUnit, windunit: query.windUnit, token: query.apiKey });
  const location = `${query.latitude},${query.longitude}`;
  const response = await fetch(`${BASE_URL}/${granularity}/${location}?${params.toString()}`);
  const parsed = await parseBody(response);

  if (!response.ok) {
    const body = parsed as { message?: string; error?: string } | string;
    const message = typeof body === 'string' ? body : (body.message ?? body.error ?? `HTTP ${response.status}`);
    throw new ForecaRequestError(message);
  }

  const body = parsed as RawResponse;
  const rows = body.forecast ?? [];
  const timeKey = granularity === 'hourly' ? 'time' : 'date';

  const units: Record<string, string> = {};
  const series: Record<string, SeriesValue[]> = {};
  for (const variable of variables) {
    units[variable] = unitFor(variable, query.tempUnit, query.windUnit);
    series[variable] = rows.map((row) => normalizeValue(row[variable]));
  }

  return { time: rows.map((row) => String(row[timeKey] ?? '')), units, series };
}

/**
 * Foreca's forecast API — separate hourly and daily endpoints (not one
 * request with both), each returning `{ forecast: [...] }`. No `models=`
 * concept and no configurable date range beyond each endpoint's own
 * default window (24 hours / 7 days), so — like Weatherbit and Windy —
 * this hub's Time range controls don't apply here.
 */
export async function fetchForecaSeries(query: ForecaQuery): Promise<SeriesResult> {
  if (!query.apiKey) {
    throw new ForecaRequestError('No API key saved for Foreca — add one on the Settings page.');
  }
  if (query.hourlyVariables.length === 0 && query.dailyVariables.length === 0) {
    throw new ForecaRequestError('Select at least one hourly or daily variable.');
  }

  const [hourly, daily] = await Promise.all([
    fetchGranularity(query, 'hourly', query.hourlyVariables),
    fetchGranularity(query, 'daily', query.dailyVariables),
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
