import type { SeriesBlock, SeriesResult, SeriesValue } from './seriesTypes';

const BASE_URL = 'https://api.atheniumanalytics.com/v3/forecast';

export class AtlasRequestError extends Error {}

export type AtlasUnits = 'METRIC' | 'IMPERIAL';

export interface AtlasQuery {
  latitude: number;
  longitude: number;
  hourlyVariables: string[];
  dailyVariables: string[];
  units: AtlasUnits;
  /** MM/DD/YYYY, per Atlas's own date format — omit both for the endpoint's own default window. */
  startDate?: string;
  endDate?: string;
  apiKey: string;
}

type RawRow = Record<string, unknown>;
interface RawResponse {
  weatherData?: {
    hourly?: { hours?: RawRow[] };
    dailyAverages?: { averages?: RawRow[] };
  };
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

async function fetchInterval(
  query: AtlasQuery,
  interval: 'HOURLY' | 'DAILY',
  variables: string[],
): Promise<SeriesBlock | undefined> {
  if (variables.length === 0) return undefined;

  const params = new URLSearchParams({
    interval,
    units: query.units,
    format: 'json',
    fields: variables.join(','),
    userKey: query.apiKey,
  });
  if (query.startDate) params.set('startDate', query.startDate);
  if (query.endDate) params.set('endDate', query.endDate);

  const response = await fetch(`${BASE_URL}/[${query.latitude},${query.longitude}]?${params.toString()}`);
  const parsed = await parseBody(response);

  if (!response.ok) {
    const body = parsed as { message?: string; error?: string } | string;
    const message = typeof body === 'string' ? body : (body.message ?? body.error ?? `HTTP ${response.status}`);
    throw new AtlasRequestError(message);
  }

  const body = parsed as RawResponse;
  const rows = interval === 'HOURLY' ? (body.weatherData?.hourly?.hours ?? []) : (body.weatherData?.dailyAverages?.averages ?? []);

  const series: Record<string, SeriesValue[]> = {};
  for (const variable of variables) {
    series[variable] = rows.map((row) => normalizeValue(row[variable]));
  }

  const time =
    interval === 'HOURLY'
      ? rows.map((row) => String(row['dateHrGmt'] ?? ''))
      : rows.map((row) => `${String(row['year'] ?? '')}-${String(row['month'] ?? '')}-${String(row['day'] ?? '')}`);

  return { time, units: {}, series };
}

/**
 * Athenium Analytics' Atlas API — one request per interval (`HOURLY` or
 * `DAILY`; the endpoint takes a single required `interval` value, not
 * both at once), so hourly and daily variables mean two parallel requests
 * here, same shape as the Weatherbit client. `units` (METRIC/IMPERIAL) is
 * a required query param, but both Celsius/Fahrenheit (and all wind-speed
 * unit) fields are separate named fields in their schema regardless — see
 * atlasVariables.ts for why both are exposed rather than picked for you.
 * No `models=` concept and no `fields`-object units in the response, so
 * results render without a unit suffix in the column header (the unit is
 * already baked into each field's name/label, e.g. "Temperature (°C)").
 * Unlike Weatherbit/Windy/Foreca, Atlas does take an explicit startDate/
 * endDate (MM/DD/YYYY) — a real configurable date range, confirmed in
 * their live OpenAPI spec.
 */
export async function fetchAtlasSeries(query: AtlasQuery): Promise<SeriesResult> {
  if (!query.apiKey) {
    throw new AtlasRequestError('No API key saved for Atlas — add one on the Settings page.');
  }
  if (query.hourlyVariables.length === 0 && query.dailyVariables.length === 0) {
    throw new AtlasRequestError('Select at least one hourly or daily variable.');
  }

  const [hourly, daily] = await Promise.all([
    fetchInterval(query, 'HOURLY', query.hourlyVariables),
    fetchInterval(query, 'DAILY', query.dailyVariables),
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
