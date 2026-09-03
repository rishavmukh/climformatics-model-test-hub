import type { SeriesBlock, SeriesResult, SeriesValue } from './seriesTypes';

const BASE_URL = 'https://api.weatherbit.io/v2.0/forecast/energy';

export class WeatherbitRequestError extends Error {}

export interface WeatherbitQuery {
  latitude: number;
  longitude: number;
  hourlyVariables: string[];
  dailyVariables: string[];
  apiKey: string;
}

/** Units fixed to Metric — see weatherbitVariables.ts for why. */
const UNIT_TABLE: Record<string, string> = {
  t_ghi: 'W/m²',
  t_dhi: 'W/m²',
  t_ni: 'W/m²',
  t_solar_rad: 'W/m²',
  sun_hours: 'h',
  cdd: '°C-days',
  hdd: '°C-days',
  temp: '°C',
  temp_wetbulb: '°C',
  dewpt: '°C',
  rh: '%',
  precip: 'mm',
  snow: 'mm',
  wind_spd: 'm/s',
  wind_spd_100m: 'm/s',
  wind_dir: '°',
  wind_dir_100m: '°',
  max_wind_spd: 'm/s',
  max_wind_spd_100m: 'm/s',
  clouds: '%',
};

type RawRow = Record<string, unknown>;
interface RawResponse {
  lat: number;
  lon: number;
  timezone?: string;
  data?: RawRow[];
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

async function fetchBlock(
  latitude: number,
  longitude: number,
  apiKey: string,
  tp: 'hourly' | 'daily',
  variables: string[],
): Promise<SeriesBlock | undefined> {
  if (variables.length === 0) return undefined;

  const params = new URLSearchParams({ lat: String(latitude), lon: String(longitude), key: apiKey, units: 'M', tp });
  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  const parsed = await parseBody(response);

  if (!response.ok) {
    const body = parsed as { error?: string } | string;
    const message = typeof body === 'string' ? body : (body.error ?? `HTTP ${response.status}`);
    throw new WeatherbitRequestError(message);
  }

  const body = parsed as RawResponse;
  const rows = body.data ?? [];

  const units: Record<string, string> = {};
  const series: Record<string, SeriesValue[]> = {};
  for (const variable of variables) {
    units[variable] = UNIT_TABLE[variable] ?? '';
    series[variable] = rows.map((row) => normalizeValue(row[variable]));
  }

  return {
    time: rows.map((row) => String(row['timestamp_local'] ?? row['date'] ?? '')),
    units,
    series,
  };
}

/**
 * Weatherbit's Energy/Degree-Day Forecast API — one request per time
 * period (`tp=hourly` or `tp=daily`; the endpoint doesn't take both at
 * once like Open-Meteo does), so hourly and daily variables mean two
 * parallel requests here rather than one. No `models=` concept and no
 * configurable date range — the endpoint returns its own fixed forecast
 * window.
 */
export async function fetchWeatherbitSeries(query: WeatherbitQuery): Promise<SeriesResult> {
  if (!query.apiKey) {
    throw new WeatherbitRequestError('No API key saved for Weatherbit — add one on the Settings page.');
  }
  if (query.hourlyVariables.length === 0 && query.dailyVariables.length === 0) {
    throw new WeatherbitRequestError('Select at least one hourly or daily variable.');
  }

  const [hourly, daily] = await Promise.all([
    fetchBlock(query.latitude, query.longitude, query.apiKey, 'hourly', query.hourlyVariables),
    fetchBlock(query.latitude, query.longitude, query.apiKey, 'daily', query.dailyVariables),
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
