import type { SeriesBlock, SeriesResult, TimeRange } from './seriesTypes';

const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export class OpenMeteoRequestError extends Error {}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'ms' | 'mph' | 'kn';
export type PrecipitationUnit = 'mm' | 'inch';

export interface OpenMeteoQuery {
  latitude: number;
  longitude: number;
  /** Empty means "don't request hourly data at all". */
  hourlyVariables: string[];
  /** Empty means "don't request daily data at all". */
  dailyVariables: string[];
  /** Empty means Open-Meteo's own best_match default; one entry keeps plain variable names in the response, 2+ suffixes every series with its model. */
  models: string[];
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  precipitationUnit: PrecipitationUnit;
  timeRange: TimeRange;
}

type RawSeriesBlock = { time?: string[]; [variable: string]: string[] | Array<number | null> | undefined };
type RawUnits = Record<string, string | undefined>;

interface RawResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
  hourly_units?: RawUnits;
  hourly?: RawSeriesBlock;
  daily_units?: RawUnits;
  daily?: RawSeriesBlock;
  error?: boolean;
  reason?: string;
}

function buildParams(query: OpenMeteoQuery): URLSearchParams {
  const params = new URLSearchParams({
    latitude: String(query.latitude),
    longitude: String(query.longitude),
    timezone: 'auto',
    temperature_unit: query.temperatureUnit,
    wind_speed_unit: query.windSpeedUnit,
    precipitation_unit: query.precipitationUnit,
  });

  if (query.hourlyVariables.length > 0) params.set('hourly', query.hourlyVariables.join(','));
  if (query.dailyVariables.length > 0) params.set('daily', query.dailyVariables.join(','));
  if (query.models.length > 0) params.set('models', query.models.join(','));

  if (query.timeRange.mode === 'range') {
    params.set('start_date', query.timeRange.startDate);
    params.set('end_date', query.timeRange.endDate);
  } else {
    params.set('forecast_days', String(query.timeRange.forecastDays));
    if (query.timeRange.pastDays > 0) params.set('past_days', String(query.timeRange.pastDays));
  }

  return params;
}

function extractBlock(
  rawBlock: RawSeriesBlock | undefined,
  rawUnits: RawUnits | undefined,
  variables: string[],
  models: string[],
): SeriesBlock | undefined {
  if (!rawBlock || variables.length === 0) return undefined;

  const isMultiModel = models.length > 1;
  const modelsForLookup = models.length > 0 ? models : [undefined];
  const units: Record<string, string> = {};
  const series: Record<string, Array<number | null>> = {};

  for (const variable of variables) {
    for (const model of modelsForLookup) {
      const rawKey = isMultiModel && model ? `${variable}_${model}` : variable;
      const rawValues = rawBlock[rawKey];
      if (!Array.isArray(rawValues)) continue;

      const outKey = isMultiModel && model ? `${variable}::${model}` : variable;
      series[outKey] = rawValues as Array<number | null>;
      units[outKey] = rawUnits?.[rawKey] ?? '';
    }
  }

  return { time: rawBlock.time ?? [], units, series };
}

/**
 * The one working provider client in this hub so far — proves the harness
 * end to end. Free, keyless, same Open-Meteo Forecast API this hub's
 * sibling project (srad-ensembletest-dashboard) already relies on. Requests
 * whatever hourly/daily variables and models the caller asks for, rather
 * than a single hardcoded shortwave_radiation series.
 */
export async function fetchOpenMeteoSeries(query: OpenMeteoQuery): Promise<SeriesResult> {
  const params = buildParams(query);
  const response = await fetch(`${FORECAST_BASE_URL}?${params.toString()}`);
  const body = (await response.json()) as RawResponse;

  if (!response.ok || body.error) {
    throw new OpenMeteoRequestError(body.reason ?? `HTTP ${response.status}`);
  }

  return {
    latitude: body.latitude,
    longitude: body.longitude,
    timezone: body.timezone,
    elevation: body.elevation,
    requestedModels: query.models,
    hourly: extractBlock(body.hourly, body.hourly_units, query.hourlyVariables, query.models),
    daily: extractBlock(body.daily, body.daily_units, query.dailyVariables, query.models),
  };
}
