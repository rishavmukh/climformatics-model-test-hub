import type { SeriesBlock, SeriesResult, SeriesValue, TimeRange } from './seriesTypes';
import type { VisualCrossingUnitGroup } from '../data/visualCrossingVariables';
import { resolveTimeRange } from '../utils/dateRange';

const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

export class VisualCrossingRequestError extends Error {}

export interface VisualCrossingQuery {
  latitude: number;
  longitude: number;
  hourlyVariables: string[];
  dailyVariables: string[];
  unitGroup: VisualCrossingUnitGroup;
  timeRange: TimeRange;
  apiKey: string;
}

type RawRecord = Record<string, unknown>;
interface RawResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  days?: RawRecord[];
}

/** Units are fixed per unitGroup (not returned by the API) — see visualcrossing.com/resources/documentation/weather-api/unit-groups-and-measurement-units. Pressure/solar are the same across all groups. */
const UNIT_TABLE: Record<VisualCrossingUnitGroup, { temp: string; speed: string; precip: string }> = {
  us: { temp: '°F', speed: 'mph', precip: 'in' },
  uk: { temp: '°C', speed: 'mph', precip: 'mm' },
  metric: { temp: '°C', speed: 'km/h', precip: 'mm' },
  base: { temp: 'K', speed: 'm/s', precip: 'mm' },
};

const TEMP_KEYS = new Set(['temp', 'feelslike', 'dew', 'tempmax', 'tempmin', 'feelslikemax', 'feelslikemin']);
const SPEED_KEYS = new Set(['windspeed', 'windgust', 'windspeedmax', 'windspeedmin', 'windspeedmean']);
const PRECIP_LENGTH_KEYS = new Set(['precip', 'snow', 'snowdepth']);
const PERCENT_KEYS = new Set(['humidity', 'cloudcover', 'precipprob', 'precipcover', 'moonphase']);

function unitForVariable(key: string, unitGroup: VisualCrossingUnitGroup): string {
  const table = UNIT_TABLE[unitGroup];
  if (TEMP_KEYS.has(key)) return table.temp;
  if (SPEED_KEYS.has(key)) return table.speed;
  if (PRECIP_LENGTH_KEYS.has(key)) return table.precip;
  if (PERCENT_KEYS.has(key)) return '%';
  if (key === 'winddir') return '°';
  if (key === 'pressure') return 'hPa';
  if (key === 'visibility') return unitGroup === 'metric' || unitGroup === 'base' ? 'km' : 'mi';
  if (key === 'solarradiation') return 'W/m²';
  if (key === 'solarenergy') return 'MJ/m²';
  if (key === 'uvindex' || key === 'uvindex2' || key === 'severerisk') return 'index';
  return '';
}

function normalizeValue(raw: unknown): SeriesValue {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.join(', ');
  return null;
}

function buildElementList(hourlyVariables: string[], dailyVariables: string[]): string[] {
  return Array.from(new Set(['datetime', ...hourlyVariables, ...dailyVariables]));
}

function buildDailyBlock(days: RawRecord[], variables: string[], unitGroup: VisualCrossingUnitGroup): SeriesBlock | undefined {
  if (variables.length === 0) return undefined;

  const units: Record<string, string> = {};
  const series: Record<string, SeriesValue[]> = {};
  for (const variable of variables) {
    units[variable] = unitForVariable(variable, unitGroup);
    series[variable] = days.map((day) => normalizeValue(day[variable]));
  }

  return { time: days.map((day) => String(day['datetime'] ?? '')), units, series };
}

function buildHourlyBlock(days: RawRecord[], variables: string[], unitGroup: VisualCrossingUnitGroup): SeriesBlock | undefined {
  if (variables.length === 0) return undefined;

  const rows: Array<{ time: string; hour: RawRecord }> = [];
  for (const day of days) {
    const hours = Array.isArray(day['hours']) ? (day['hours'] as RawRecord[]) : [];
    for (const hour of hours) {
      rows.push({ time: `${String(day['datetime'] ?? '')}T${String(hour['datetime'] ?? '')}`, hour });
    }
  }

  const units: Record<string, string> = {};
  const series: Record<string, SeriesValue[]> = {};
  for (const variable of variables) {
    units[variable] = unitForVariable(variable, unitGroup);
    series[variable] = rows.map((row) => normalizeValue(row.hour[variable]));
  }

  return { time: rows.map((row) => row.time), units, series };
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Visual Crossing's Timeline Weather API — single blended answer per
 * request (no `models=` concept), one shared `elements=` list driving both
 * the daily and hourly blocks, and an API key sent straight from the
 * browser (their CORS policy allows it, confirmed against the live API
 * before wiring this up).
 */
export async function fetchVisualCrossingSeries(query: VisualCrossingQuery): Promise<SeriesResult> {
  if (!query.apiKey) {
    throw new VisualCrossingRequestError('No API key saved for Visual Crossing — add one on the Settings page.');
  }

  const { startDate, endDate } = resolveTimeRange(query.timeRange);
  const includeParts = ['days'];
  if (query.hourlyVariables.length > 0) includeParts.push('hours');

  const params = new URLSearchParams({
    key: query.apiKey,
    unitGroup: query.unitGroup,
    include: includeParts.join(','),
    elements: buildElementList(query.hourlyVariables, query.dailyVariables).join(','),
    contentType: 'json',
  });

  const location = `${query.latitude},${query.longitude}`;
  const url = `${BASE_URL}/${encodeURIComponent(location)}/${startDate}/${endDate}?${params.toString()}`;

  const response = await fetch(url);
  const parsed = await parseBody(response);

  if (!response.ok) {
    const reason = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    throw new VisualCrossingRequestError(reason.length > 0 ? reason : `HTTP ${response.status}`);
  }

  const body = parsed as RawResponse;
  const days = body.days ?? [];

  return {
    latitude: body.latitude,
    longitude: body.longitude,
    timezone: body.timezone,
    requestedModels: [],
    hourly: buildHourlyBlock(days, query.hourlyVariables, query.unitGroup),
    daily: buildDailyBlock(days, query.dailyVariables, query.unitGroup),
  };
}
