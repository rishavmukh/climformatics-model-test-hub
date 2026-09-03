import type { VariableDef } from '../api/seriesTypes';

/**
 * Surface-level variables exposed through this hub for Windy.com's Point
 * Forecast API (api.windy.com/api/point-forecast/v2), sourced from
 * api.windy.com/point-forecast/docs. Scoped deliberately to the "Weather"
 * parameter group at the `surface` level only — Windy also has Sea and Air
 * Quality parameter groups tied to different models (wave models, CAMS),
 * which don't mix sensibly with a single weather-model request and would
 * need their own model/level picker to do justice; out of scope here.
 *
 * `wind_speed`/`wind_direction` aren't real Windy parameters — Windy's
 * `wind` parameter returns raw `wind_u`/`wind_v` vector components, which
 * the client combines into speed (m/s) and meteorological direction
 * (degrees, direction the wind is coming FROM) since those are what a
 * human actually wants to read off a table.
 */
export const WINDY_VARIABLES: VariableDef[] = [
  { key: 'temp', label: 'Temperature', category: 'Temperature' },
  { key: 'dewpoint', label: 'Dew point', category: 'Temperature' },

  { key: 'rh', label: 'Relative humidity', category: 'Humidity & Moisture' },

  { key: 'precip', label: 'Precipitation (past 3h)', category: 'Precipitation' },
  { key: 'convPrecip', label: 'Convective precipitation (past 3h)', category: 'Precipitation' },
  { key: 'snowPrecip', label: 'Snowfall (past 3h)', category: 'Precipitation' },
  { key: 'ptype', label: 'Precipitation type (code)', category: 'Precipitation' },

  { key: 'wind_speed', label: 'Wind speed', category: 'Wind' },
  { key: 'wind_direction', label: 'Wind direction (from)', category: 'Wind' },
  { key: 'windGust', label: 'Wind gust', category: 'Wind' },

  { key: 'pressure', label: 'Surface pressure', category: 'Pressure & Atmosphere' },
  { key: 'cape', label: 'CAPE', category: 'Pressure & Atmosphere' },
  { key: 'gh', label: 'Geopotential height', category: 'Pressure & Atmosphere' },

  { key: 'lclouds', label: 'Low cloud cover', category: 'Cloud Cover & Visibility' },
  { key: 'mclouds', label: 'Mid cloud cover', category: 'Cloud Cover & Visibility' },
  { key: 'hclouds', label: 'High cloud cover', category: 'Cloud Cover & Visibility' },
  { key: 'cbase', label: 'Cloud base height', category: 'Cloud Cover & Visibility' },
  { key: 'visibility', label: 'Visibility', category: 'Cloud Cover & Visibility' },

  { key: 'weatherWarnings', label: 'Weather warnings (code)', category: 'General' },
];

export const WINDY_CATEGORY_ORDER = [
  'Temperature',
  'Humidity & Moisture',
  'Precipitation',
  'Wind',
  'Pressure & Atmosphere',
  'Cloud Cover & Visibility',
  'General',
];

export const WINDY_DEFAULT_VARIABLES = ['temp', 'wind_speed', 'precip'];

export interface WindyModelDef {
  key: string;
  label: string;
}

/** Weather-model subset of Windy's `model` values — Sea and Air Quality models are out of scope here (see file comment above). */
export const WINDY_MODELS: WindyModelDef[] = [
  { key: 'gfs', label: 'GFS (global)' },
  { key: 'icon', label: 'ICON (global)' },
  { key: 'iconEu', label: 'ICON EU' },
  { key: 'iconD2', label: 'ICON D2' },
  { key: 'arome', label: 'AROME' },
  { key: 'aromeFrance', label: 'AROME France' },
  { key: 'aromeAntilles', label: 'AROME Antilles' },
  { key: 'aromeReunion', label: 'AROME Réunion' },
  { key: 'namConus', label: 'NAM CONUS' },
  { key: 'namHawaii', label: 'NAM Hawaii' },
  { key: 'namAlaska', label: 'NAM Alaska' },
  { key: 'hrrrConus', label: 'HRRR CONUS' },
  { key: 'hrrrAlaska', label: 'HRRR Alaska' },
  { key: 'canHrdps', label: 'Canadian HRDPS' },
];
