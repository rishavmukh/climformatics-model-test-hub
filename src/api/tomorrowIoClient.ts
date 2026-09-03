import type { SeriesBlock, SeriesResult, SeriesValue, TimeRange } from './seriesTypes';

const BASE_URL = 'https://api.tomorrow.io/v4/timelines';

export class TomorrowIoRequestError extends Error {}

export interface TomorrowIoQuery {
  latitude: number;
  longitude: number;
  hourlyVariables: string[];
  dailyVariables: string[];
  timeRange: TimeRange;
  apiKey: string;
}

type RawInterval = { startTime?: string; values?: Record<string, unknown> };
interface RawResponse {
  data?: { timelines?: Array<{ intervals?: RawInterval[] }> };
  message?: string;
  type?: string;
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

/** ISO8601 — matches the exact format Tomorrow.io's own responses use for timestamps. */
function toIsoDateTime(date: string, endOfDay: boolean): string {
  return `${date}T${endOfDay ? '23:59:59' : '00:00:00'}Z`;
}

function resolveWindow(timeRange: TimeRange): { startTime?: string; endTime?: string } {
  if (timeRange.mode === 'range') {
    return { startTime: toIsoDateTime(timeRange.startDate, false), endTime: toIsoDateTime(timeRange.endDate, true) };
  }
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + timeRange.forecastDays);
  const result: { startTime?: string; endTime?: string } = { endTime: end.toISOString() };
  if (timeRange.pastDays > 0) {
    const start = new Date(now);
    start.setDate(start.getDate() - timeRange.pastDays);
    result.startTime = start.toISOString();
  }
  return result;
}

async function fetchTimestep(
  query: TomorrowIoQuery,
  timestep: '1h' | '1d',
  variables: string[],
): Promise<SeriesBlock | undefined> {
  if (variables.length === 0) return undefined;

  const window = resolveWindow(query.timeRange);
  const params = new URLSearchParams({
    location: `${query.latitude},${query.longitude}`,
    apikey: query.apiKey,
    fields: variables.join(','),
    timesteps: timestep,
    units: 'metric',
  });
  if (window.startTime) params.set('startTime', window.startTime);
  if (window.endTime) params.set('endTime', window.endTime);

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  const parsed = await parseBody(response);

  if (!response.ok) {
    const body = parsed as { message?: string } | string;
    const message = typeof body === 'string' ? body : (body.message ?? `HTTP ${response.status}`);
    throw new TomorrowIoRequestError(message);
  }

  const body = parsed as RawResponse;
  const intervals = body.data?.timelines?.[0]?.intervals ?? [];

  const units: Record<string, string> = {};
  const series: Record<string, SeriesValue[]> = {};
  for (const variable of variables) {
    series[variable] = intervals.map((interval) => normalizeValue(interval.values?.[variable]));
  }

  return { time: intervals.map((interval) => interval.startTime ?? ''), units, series };
}

/**
 * Tomorrow.io's Timelines API — the flexible endpoint that actually
 * respects field selection (their simpler `/v4/weather/forecast` returns
 * a fixed schema regardless of what you ask for; confirmed live). Billing
 * here is token-metered per request (roughly fields × intervals), so a
 * wide date range with many variables selected costs more than a narrow
 * one — worth keeping in mind on a metered plan. Fixed to metric units;
 * imperial wasn't verified live. Hourly and daily variables mean two
 * separate requests (`timesteps=1h` / `timesteps=1d`), same pattern as
 * Weatherbit/Atlas/Foreca/AccuWeather.
 */
export async function fetchTomorrowIoSeries(query: TomorrowIoQuery): Promise<SeriesResult> {
  if (!query.apiKey) {
    throw new TomorrowIoRequestError('No API key saved for Tomorrow.io — add one on the Settings page.');
  }
  if (query.hourlyVariables.length === 0 && query.dailyVariables.length === 0) {
    throw new TomorrowIoRequestError('Select at least one hourly or daily variable.');
  }

  const [hourly, daily] = await Promise.all([
    fetchTimestep(query, '1h', query.hourlyVariables),
    fetchTimestep(query, '1d', query.dailyVariables),
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
