import type { SeriesResult, SeriesValue } from './seriesTypes';

const BASE_URL = 'https://api.windy.com/api/point-forecast/v2';
const LEVEL = 'surface';

export class WindyRequestError extends Error {}

export interface WindyQuery {
  latitude: number;
  longitude: number;
  variables: string[];
  model: string;
  apiKey: string;
}

/** Our synthetic key -> Windy's real `parameters` value and the raw response key it produces at the surface level. */
const SIMPLE_VARIABLES: Record<string, { parameter: string; responseKey: string }> = {
  temp: { parameter: 'temp', responseKey: `temp-${LEVEL}` },
  dewpoint: { parameter: 'dewpoint', responseKey: `dewpoint-${LEVEL}` },
  rh: { parameter: 'rh', responseKey: `rh-${LEVEL}` },
  precip: { parameter: 'precip', responseKey: `past3hprecip-${LEVEL}` },
  convPrecip: { parameter: 'convPrecip', responseKey: `past3hconvprecip-${LEVEL}` },
  snowPrecip: { parameter: 'snowPrecip', responseKey: `past3hsnowprecip-${LEVEL}` },
  ptype: { parameter: 'ptype', responseKey: `ptype-${LEVEL}` },
  windGust: { parameter: 'windGust', responseKey: `gust-${LEVEL}` },
  pressure: { parameter: 'pressure', responseKey: `pressure-${LEVEL}` },
  cape: { parameter: 'cape', responseKey: `cape-${LEVEL}` },
  gh: { parameter: 'gh', responseKey: `gh-${LEVEL}` },
  lclouds: { parameter: 'lclouds', responseKey: `lclouds-${LEVEL}` },
  mclouds: { parameter: 'mclouds', responseKey: `mclouds-${LEVEL}` },
  hclouds: { parameter: 'hclouds', responseKey: `hclouds-${LEVEL}` },
  cbase: { parameter: 'cbase', responseKey: `cbase-${LEVEL}` },
  visibility: { parameter: 'visibility', responseKey: `visibility-${LEVEL}` },
  weatherWarnings: { parameter: 'weatherWarnings', responseKey: `weatherwarnings-${LEVEL}` },
};

const WIND_U_KEY = `wind_u-${LEVEL}`;
const WIND_V_KEY = `wind_v-${LEVEL}`;

type RawResponse = { ts?: number[]; units?: Record<string, string>; [key: string]: unknown };

function buildParameters(variables: string[]): string[] {
  const parameters = new Set<string>();
  for (const variable of variables) {
    if (variable === 'wind_speed' || variable === 'wind_direction') {
      parameters.add('wind');
    } else if (variable in SIMPLE_VARIABLES) {
      parameters.add(SIMPLE_VARIABLES[variable]!.parameter);
    }
  }
  return Array.from(parameters);
}

function toNumberArray(raw: unknown): Array<number | null> {
  if (!Array.isArray(raw)) return [];
  return raw.map((value) => (typeof value === 'number' ? value : null));
}

/** Meteorological direction the wind is blowing FROM, in degrees clockwise from north. */
function windDirectionFrom(u: number, v: number): number {
  const degrees = Math.atan2(v, u) * (180 / Math.PI);
  return ((270 - degrees) % 360 + 360) % 360;
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
 * Windy.com's Point Forecast API — a single POST returning one continuous
 * time series at the model's native step (no separate hourly/daily
 * granularity, and no `models=` comparison the way Open-Meteo has). CORS
 * was confirmed open (reflects the request Origin) before wiring this up
 * for direct browser calls.
 */
export async function fetchWindySeries(query: WindyQuery): Promise<SeriesResult> {
  if (!query.apiKey) {
    throw new WindyRequestError('No API key saved for Windy.com — add one on the Settings page.');
  }
  if (query.variables.length === 0) {
    throw new WindyRequestError('Select at least one variable.');
  }

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: query.latitude,
      lon: query.longitude,
      model: query.model,
      parameters: buildParameters(query.variables),
      levels: [LEVEL],
      key: query.apiKey,
    }),
  });

  const parsed = await parseBody(response);

  if (!response.ok) {
    const body = parsed as { message?: string; error?: string } | string;
    const message = typeof body === 'string' ? body : (body.message ?? body.error ?? `HTTP ${response.status}`);
    throw new WindyRequestError(message);
  }

  const body = parsed as RawResponse;
  const rawTs = body.ts ?? [];
  const units = body.units ?? {};

  const series: Record<string, SeriesValue[]> = {};
  const outputUnits: Record<string, string> = {};

  for (const variable of query.variables) {
    if (variable === 'wind_speed' || variable === 'wind_direction') {
      const u = toNumberArray(body[WIND_U_KEY]);
      const v = toNumberArray(body[WIND_V_KEY]);
      if (variable === 'wind_speed') {
        series.wind_speed = u.map((uVal, index) => {
          const vVal = v[index];
          return typeof uVal === 'number' && typeof vVal === 'number' ? Math.sqrt(uVal ** 2 + vVal ** 2) : null;
        });
        outputUnits.wind_speed = units[WIND_U_KEY] ?? 'm/s';
      } else {
        series.wind_direction = u.map((uVal, index) => {
          const vVal = v[index];
          return typeof uVal === 'number' && typeof vVal === 'number' ? windDirectionFrom(uVal, vVal) : null;
        });
        outputUnits.wind_direction = '°';
      }
      continue;
    }

    const spec = SIMPLE_VARIABLES[variable];
    if (!spec) continue;
    series[variable] = toNumberArray(body[spec.responseKey]);
    outputUnits[variable] = units[spec.responseKey] ?? '';
  }

  // Windy's docs don't guarantee `ts` arrives sorted, and at longer lead times point-forecast
  // APIs commonly stitch together separate forecast-run chunks — if those land out of order,
  // plotting by raw array position produces a sawtooth even though each individual value is
  // real. Sort by actual timestamp and drop exact-duplicate timestamps (keeping the first) so
  // a chart of this series is never worse than chronological, regardless of what the API sent.
  const order = rawTs.map((_, index) => index).sort((a, b) => (rawTs[a] ?? 0) - (rawTs[b] ?? 0));
  const seenTs = new Set<number>();
  const dedupedOrder = order.filter((index) => {
    const ts = rawTs[index];
    if (ts === undefined || seenTs.has(ts)) return false;
    seenTs.add(ts);
    return true;
  });

  const time = dedupedOrder.map((index) => new Date(rawTs[index] ?? 0).toISOString());
  const sortedSeries: Record<string, SeriesValue[]> = {};
  for (const [variable, values] of Object.entries(series)) {
    sortedSeries[variable] = dedupedOrder.map((index) => values[index] ?? null);
  }

  return {
    latitude: query.latitude,
    longitude: query.longitude,
    timezone: 'UTC',
    requestedModels: [query.model],
    hourly: { time, units: outputUnits, series: sortedSeries },
  };
}
