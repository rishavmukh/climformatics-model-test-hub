import type { SeriesBlock, SeriesResult, SeriesValue } from './seriesTypes';

const BASE_URL = 'https://dataservice.accuweather.com';

export class AccuWeatherRequestError extends Error {}

export interface AccuWeatherQuery {
  latitude: number;
  longitude: number;
  hourlyVariables: string[];
  dailyVariables: string[];
  metric: boolean;
  apiKey: string;
}

/** Extraction paths into the raw AccuWeather JSON, keyed by our catalog keys in accuweatherVariables.ts — generated from the same live response inspection, kept together so they can't drift apart. */
const HOURLY_FIELD_PATHS: Record<string, string[]> = {
  temperature: ['Temperature', 'Value'],
  realFeelTemperature: ['RealFeelTemperature', 'Value'],
  realFeelTemperatureShade: ['RealFeelTemperatureShade', 'Value'],
  wetBulbTemperature: ['WetBulbTemperature', 'Value'],
  wetBulbGlobeTemperature: ['WetBulbGlobeTemperature', 'Value'],
  dewPoint: ['DewPoint', 'Value'],
  windChillTemperature: ['WindChillTemperature', 'Value'],
  heatIndex: ['HeatIndex', 'Value'],
  windSpeed: ['Wind', 'Speed', 'Value'],
  windDirectionDegrees: ['Wind', 'Direction', 'Degrees'],
  windGustSpeed: ['WindGust', 'Speed', 'Value'],
  relativeHumidity: ['RelativeHumidity'],
  indoorRelativeHumidity: ['IndoorRelativeHumidity'],
  visibility: ['Visibility', 'Value'],
  ceiling: ['Ceiling', 'Value'],
  uvIndex: ['UVIndex'],
  uvIndexFloat: ['UVIndexFloat'],
  precipitationProbability: ['PrecipitationProbability'],
  thunderstormProbability: ['ThunderstormProbability'],
  rainProbability: ['RainProbability'],
  snowProbability: ['SnowProbability'],
  iceProbability: ['IceProbability'],
  totalLiquid: ['TotalLiquid', 'Value'],
  rain: ['Rain', 'Value'],
  snow: ['Snow', 'Value'],
  ice: ['Ice', 'Value'],
  cloudCover: ['CloudCover'],
  evapotranspiration: ['Evapotranspiration', 'Value'],
  solarIrradiance: ['SolarIrradiance', 'Value'],
  accuLumenBrightnessIndex: ['AccuLumenBrightnessIndex'],
};

const DAILY_FIELD_PATHS: Record<string, string[]> = {
  temperatureMin: ['Temperature', 'Minimum', 'Value'],
  temperatureMax: ['Temperature', 'Maximum', 'Value'],
  realFeelTemperatureMin: ['RealFeelTemperature', 'Minimum', 'Value'],
  realFeelTemperatureMax: ['RealFeelTemperature', 'Maximum', 'Value'],
  realFeelTemperatureShadeMin: ['RealFeelTemperatureShade', 'Minimum', 'Value'],
  realFeelTemperatureShadeMax: ['RealFeelTemperatureShade', 'Maximum', 'Value'],
  hoursOfSun: ['HoursOfSun'],
  degreeDaysHeating: ['DegreeDaySummary', 'Heating', 'Value'],
  degreeDaysCooling: ['DegreeDaySummary', 'Cooling', 'Value'],

  dayWindSpeed: ['Day', 'Wind', 'Speed', 'Value'],
  dayWindDirectionDegrees: ['Day', 'Wind', 'Direction', 'Degrees'],
  dayWindGustSpeed: ['Day', 'WindGust', 'Speed', 'Value'],
  dayTotalLiquid: ['Day', 'TotalLiquid', 'Value'],
  dayRain: ['Day', 'Rain', 'Value'],
  daySnow: ['Day', 'Snow', 'Value'],
  dayIce: ['Day', 'Ice', 'Value'],
  dayCloudCover: ['Day', 'CloudCover'],
  dayEvapotranspiration: ['Day', 'Evapotranspiration', 'Value'],
  daySolarIrradiance: ['Day', 'SolarIrradiance', 'Value'],
  dayRelativeHumidityMin: ['Day', 'RelativeHumidity', 'Minimum'],
  dayRelativeHumidityMax: ['Day', 'RelativeHumidity', 'Maximum'],
  dayRelativeHumidityAverage: ['Day', 'RelativeHumidity', 'Average'],
  dayWetBulbTemperatureMin: ['Day', 'WetBulbTemperature', 'Minimum', 'Value'],
  dayWetBulbTemperatureMax: ['Day', 'WetBulbTemperature', 'Maximum', 'Value'],
  dayWetBulbTemperatureAverage: ['Day', 'WetBulbTemperature', 'Average', 'Value'],
  dayWetBulbGlobeTemperatureMin: ['Day', 'WetBulbGlobeTemperature', 'Minimum', 'Value'],
  dayWetBulbGlobeTemperatureMax: ['Day', 'WetBulbGlobeTemperature', 'Maximum', 'Value'],
  dayWetBulbGlobeTemperatureAverage: ['Day', 'WetBulbGlobeTemperature', 'Average', 'Value'],
  dayUvIndexFloatMin: ['Day', 'UVIndexFloat', 'Minimum'],
  dayUvIndexFloatMax: ['Day', 'UVIndexFloat', 'Maximum'],
  dayPrecipitationProbability: ['Day', 'PrecipitationProbability'],
  dayThunderstormProbability: ['Day', 'ThunderstormProbability'],
  dayRainProbability: ['Day', 'RainProbability'],
  daySnowProbability: ['Day', 'SnowProbability'],
  dayIceProbability: ['Day', 'IceProbability'],
  dayHoursOfPrecipitation: ['Day', 'HoursOfPrecipitation'],
  dayHoursOfRain: ['Day', 'HoursOfRain'],
  dayHoursOfSnow: ['Day', 'HoursOfSnow'],
  dayHoursOfIce: ['Day', 'HoursOfIce'],

  nightWindSpeed: ['Night', 'Wind', 'Speed', 'Value'],
  nightWindDirectionDegrees: ['Night', 'Wind', 'Direction', 'Degrees'],
  nightWindGustSpeed: ['Night', 'WindGust', 'Speed', 'Value'],
  nightTotalLiquid: ['Night', 'TotalLiquid', 'Value'],
  nightRain: ['Night', 'Rain', 'Value'],
  nightSnow: ['Night', 'Snow', 'Value'],
  nightIce: ['Night', 'Ice', 'Value'],
  nightCloudCover: ['Night', 'CloudCover'],
  nightEvapotranspiration: ['Night', 'Evapotranspiration', 'Value'],
  nightSolarIrradiance: ['Night', 'SolarIrradiance', 'Value'],
  nightRelativeHumidityMin: ['Night', 'RelativeHumidity', 'Minimum'],
  nightRelativeHumidityMax: ['Night', 'RelativeHumidity', 'Maximum'],
  nightRelativeHumidityAverage: ['Night', 'RelativeHumidity', 'Average'],
  nightWetBulbTemperatureMin: ['Night', 'WetBulbTemperature', 'Minimum', 'Value'],
  nightWetBulbTemperatureMax: ['Night', 'WetBulbTemperature', 'Maximum', 'Value'],
  nightWetBulbTemperatureAverage: ['Night', 'WetBulbTemperature', 'Average', 'Value'],
  nightWetBulbGlobeTemperatureMin: ['Night', 'WetBulbGlobeTemperature', 'Minimum', 'Value'],
  nightWetBulbGlobeTemperatureMax: ['Night', 'WetBulbGlobeTemperature', 'Maximum', 'Value'],
  nightWetBulbGlobeTemperatureAverage: ['Night', 'WetBulbGlobeTemperature', 'Average', 'Value'],
  nightUvIndexFloatMin: ['Night', 'UVIndexFloat', 'Minimum'],
  nightUvIndexFloatMax: ['Night', 'UVIndexFloat', 'Maximum'],
  nightPrecipitationProbability: ['Night', 'PrecipitationProbability'],
  nightThunderstormProbability: ['Night', 'ThunderstormProbability'],
  nightRainProbability: ['Night', 'RainProbability'],
  nightSnowProbability: ['Night', 'SnowProbability'],
  nightIceProbability: ['Night', 'IceProbability'],
  nightHoursOfPrecipitation: ['Night', 'HoursOfPrecipitation'],
  nightHoursOfRain: ['Night', 'HoursOfRain'],
  nightHoursOfSnow: ['Night', 'HoursOfSnow'],
  nightHoursOfIce: ['Night', 'HoursOfIce'],
};

/** Units confirmed live with metric=true; imperial values are AccuWeather's standard equivalents (not independently re-verified with metric=false to conserve the shared key's daily quota). */
function unitFor(key: string, metric: boolean): string {
  const k = key.toLowerCase();
  if (k.includes('probability') || k.includes('humidity') || k.includes('cloudcover')) return '%';
  if (k.includes('directiondegrees')) return '°';
  if (k.includes('uvindex') || k.includes('brightnessindex')) return 'index';
  if (k.includes('solarirradiance')) return 'W/m²';
  if (k.includes('hoursof') || key === 'hoursOfSun') return 'h';
  if (k.includes('degreedays')) return metric ? '°C-days' : '°F-days';
  if (k.includes('windspeed') || k.includes('windgustspeed')) return metric ? 'km/h' : 'mph';
  if (k.includes('visibility')) return metric ? 'km' : 'mi';
  if (k.includes('ceiling')) return metric ? 'm' : 'ft';
  if (k.includes('snow')) return metric ? 'cm' : 'in';
  if (k.includes('temperature') || k.includes('dewpoint') || k.includes('windchill') || k.includes('heatindex')) {
    return metric ? '°C' : '°F';
  }
  if (k.includes('liquid') || k.includes('rain') || k.includes('ice') || k.includes('evapotranspiration')) {
    return metric ? 'mm' : 'in';
  }
  return '';
}

function getByPath(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const segment of path) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
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

async function accuweatherFetch(path: string, params: URLSearchParams): Promise<unknown> {
  const response = await fetch(`${BASE_URL}${path}?${params.toString()}`);
  const parsed = await parseBody(response);
  if (!response.ok) {
    const body = parsed as { Message?: string; message?: string } | string;
    const message = typeof body === 'string' ? body : (body.Message ?? body.message ?? `HTTP ${response.status}`);
    throw new AccuWeatherRequestError(message);
  }
  return parsed;
}

async function resolveLocationKey(latitude: number, longitude: number, apiKey: string): Promise<string> {
  const params = new URLSearchParams({ apikey: apiKey, q: `${latitude},${longitude}` });
  const body = (await accuweatherFetch('/locations/v1/cities/geoposition/search', params)) as { Key?: string };
  if (!body.Key) throw new AccuWeatherRequestError('AccuWeather did not return a location for these coordinates.');
  return body.Key;
}

function buildBlock(rows: Record<string, unknown>[], fieldPaths: Record<string, string[]>, variables: string[], metric: boolean): SeriesBlock {
  const units: Record<string, string> = {};
  const series: Record<string, SeriesValue[]> = {};
  for (const variable of variables) {
    const path = fieldPaths[variable];
    if (!path) continue;
    units[variable] = unitFor(variable, metric);
    series[variable] = rows.map((row) => normalizeValue(getByPath(row, path)));
  }
  return { time: rows.map((row) => String(row['DateTime'] ?? row['Date'] ?? '')), units, series };
}

/**
 * AccuWeather's classic dataservice API. Unlike every other client here,
 * this needs a location-key lookup first (`/locations/v1/cities/
 * geoposition/search`) before either forecast call can run — AccuWeather
 * addresses locations by an internal key, not raw lat/lon. Uses the fixed
 * 12-hour and 5-day forecast tiers (their API offers longer tiers — 24h/
 * 72h/120h hourly, 10/15/25/45-day daily — as separate endpoints, not a
 * request parameter, so supporting those would mean a tier picker rather
 * than the Time range control this hub uses elsewhere; out of scope here).
 */
export async function fetchAccuWeatherSeries(query: AccuWeatherQuery): Promise<SeriesResult> {
  if (!query.apiKey) {
    throw new AccuWeatherRequestError('No API key saved for AccuWeather — add one on the Settings page.');
  }
  if (query.hourlyVariables.length === 0 && query.dailyVariables.length === 0) {
    throw new AccuWeatherRequestError('Select at least one hourly or daily variable.');
  }

  const locationKey = await resolveLocationKey(query.latitude, query.longitude, query.apiKey);
  const commonParams = { apikey: query.apiKey, details: 'true', metric: String(query.metric) };

  const [hourlyRows, dailyRows] = await Promise.all([
    query.hourlyVariables.length > 0
      ? (accuweatherFetch(`/forecasts/v1/hourly/12hour/${locationKey}`, new URLSearchParams(commonParams)) as Promise<Record<string, unknown>[]>)
      : Promise.resolve(undefined),
    query.dailyVariables.length > 0
      ? (accuweatherFetch(`/forecasts/v1/daily/5day/${locationKey}`, new URLSearchParams(commonParams)) as Promise<{
          DailyForecasts?: Record<string, unknown>[];
        }>)
      : Promise.resolve(undefined),
  ]);

  return {
    latitude: query.latitude,
    longitude: query.longitude,
    timezone: '',
    requestedModels: [],
    hourly: hourlyRows ? buildBlock(hourlyRows, HOURLY_FIELD_PATHS, query.hourlyVariables, query.metric) : undefined,
    daily: dailyRows ? buildBlock(dailyRows.DailyForecasts ?? [], DAILY_FIELD_PATHS, query.dailyVariables, query.metric) : undefined,
  };
}
