import type { VariableDef } from '../api/seriesTypes';

/**
 * Every element Visual Crossing's Timeline Weather API can return, split
 * into the hourly and daily lists from their own docs
 * (visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/).
 * Unlike Open-Meteo, Visual Crossing has no `models=` concept — one request
 * returns one blended answer — and elements are requested via a single
 * `elements=` list shared by both the `days[]` and `hours[]` blocks, rather
 * than separate `hourly=`/`daily=` parameters.
 *
 * `solarradiation`, `solarenergy`, and `uvindex` are called out in the
 * provider catalog as gated behind Visual Crossing's paid "Advanced Energy"
 * tier — a free/basic key may get nulls or a 4xx for those specifically
 * even though the rest of the request succeeds.
 */
export const VISUAL_CROSSING_HOURLY_VARIABLES: VariableDef[] = [
  { key: 'temp', label: 'Temperature', category: 'Temperature' },
  { key: 'feelslike', label: 'Feels like', category: 'Temperature' },
  { key: 'dew', label: 'Dew point', category: 'Temperature' },

  { key: 'humidity', label: 'Relative humidity', category: 'Humidity & Moisture' },

  { key: 'precip', label: 'Precipitation', category: 'Precipitation' },
  { key: 'precipprob', label: 'Precipitation probability', category: 'Precipitation' },
  { key: 'preciptype', label: 'Precipitation type', category: 'Precipitation' },

  { key: 'windspeed', label: 'Wind speed', category: 'Wind' },
  { key: 'winddir', label: 'Wind direction', category: 'Wind' },
  { key: 'windgust', label: 'Wind gust', category: 'Wind' },

  { key: 'pressure', label: 'Sea level pressure', category: 'Pressure & Atmosphere' },
  { key: 'cape', label: 'CAPE', category: 'Pressure & Atmosphere' },
  { key: 'cin', label: 'Convective inhibition (CIN)', category: 'Pressure & Atmosphere' },
  { key: 'severerisk', label: 'Severe weather risk', category: 'Pressure & Atmosphere' },

  { key: 'cloudcover', label: 'Cloud cover', category: 'Cloud Cover & Visibility' },
  { key: 'visibility', label: 'Visibility', category: 'Cloud Cover & Visibility' },
  { key: 'reflectivity', label: 'Radar reflectivity', category: 'Cloud Cover & Visibility' },

  { key: 'solarradiation', label: 'Solar radiation (GHI)', category: 'Solar & Radiation' },
  { key: 'solarenergy', label: 'Solar energy', category: 'Solar & Radiation' },
  { key: 'uvindex', label: 'UV index', category: 'Solar & Radiation' },

  { key: 'conditions', label: 'Conditions (text)', category: 'General' },
  { key: 'icon', label: 'Icon', category: 'General' },
  { key: 'source', label: 'Data source', category: 'General' },
  { key: 'stations', label: 'Contributing stations', category: 'General' },
];

export const VISUAL_CROSSING_DAILY_VARIABLES: VariableDef[] = [
  { key: 'tempmax', label: 'Temperature max', category: 'Temperature' },
  { key: 'tempmin', label: 'Temperature min', category: 'Temperature' },
  { key: 'temp', label: 'Temperature mean', category: 'Temperature' },
  { key: 'feelslikemax', label: 'Feels like max', category: 'Temperature' },
  { key: 'feelslikemin', label: 'Feels like min', category: 'Temperature' },
  { key: 'feelslike', label: 'Feels like mean', category: 'Temperature' },
  { key: 'dew', label: 'Dew point', category: 'Temperature' },

  { key: 'humidity', label: 'Relative humidity', category: 'Humidity & Moisture' },

  { key: 'precip', label: 'Precipitation', category: 'Precipitation' },
  { key: 'precipprob', label: 'Precipitation probability', category: 'Precipitation' },
  { key: 'preciptype', label: 'Precipitation type', category: 'Precipitation' },
  { key: 'precipcover', label: 'Precipitation cover (% of period)', category: 'Precipitation' },
  { key: 'snow', label: 'Snowfall', category: 'Precipitation' },
  { key: 'snowdepth', label: 'Snow depth', category: 'Precipitation' },

  { key: 'windspeed', label: 'Wind speed', category: 'Wind' },
  { key: 'windspeedmax', label: 'Wind speed max', category: 'Wind' },
  { key: 'windspeedmin', label: 'Wind speed min', category: 'Wind' },
  { key: 'windspeedmean', label: 'Wind speed mean', category: 'Wind' },
  { key: 'winddir', label: 'Wind direction', category: 'Wind' },
  { key: 'windgust', label: 'Wind gust', category: 'Wind' },

  { key: 'pressure', label: 'Sea level pressure', category: 'Pressure & Atmosphere' },
  { key: 'cape', label: 'CAPE', category: 'Pressure & Atmosphere' },
  { key: 'cin', label: 'Convective inhibition (CIN)', category: 'Pressure & Atmosphere' },
  { key: 'severerisk', label: 'Severe weather risk', category: 'Pressure & Atmosphere' },

  { key: 'cloudcover', label: 'Cloud cover', category: 'Cloud Cover & Visibility' },
  { key: 'visibility', label: 'Visibility', category: 'Cloud Cover & Visibility' },

  { key: 'solarradiation', label: 'Solar radiation (GHI)', category: 'Solar & Radiation' },
  { key: 'solarenergy', label: 'Solar energy', category: 'Solar & Radiation' },
  { key: 'uvindex', label: 'UV index', category: 'Solar & Radiation' },
  { key: 'uvindex2', label: 'UV index (secondary)', category: 'Solar & Radiation' },

  { key: 'sunrise', label: 'Sunrise', category: 'Sun & Moon' },
  { key: 'sunset', label: 'Sunset', category: 'Sun & Moon' },
  { key: 'moonphase', label: 'Moon phase', category: 'Sun & Moon' },
  { key: 'moonrise', label: 'Moonrise', category: 'Sun & Moon' },
  { key: 'moonset', label: 'Moonset', category: 'Sun & Moon' },
  { key: 'civildawn', label: 'Civil dawn', category: 'Sun & Moon' },
  { key: 'civildusk', label: 'Civil dusk', category: 'Sun & Moon' },
  { key: 'nauticaldawn', label: 'Nautical dawn', category: 'Sun & Moon' },
  { key: 'nauticaldusk', label: 'Nautical dusk', category: 'Sun & Moon' },
  { key: 'astronomicdawn', label: 'Astronomical dawn', category: 'Sun & Moon' },
  { key: 'astronomicdusk', label: 'Astronomical dusk', category: 'Sun & Moon' },

  { key: 'degreedays', label: 'Degree days', category: 'Agriculture & Degree Days' },
  { key: 'accdegreedays', label: 'Accumulated degree days', category: 'Agriculture & Degree Days' },

  { key: 'conditions', label: 'Conditions (text)', category: 'General' },
  { key: 'description', label: 'Description (text)', category: 'General' },
  { key: 'icon', label: 'Icon', category: 'General' },
  { key: 'source', label: 'Data source', category: 'General' },
  { key: 'stations', label: 'Contributing stations', category: 'General' },
];

export const VISUAL_CROSSING_HOURLY_CATEGORY_ORDER = [
  'Solar & Radiation',
  'Temperature',
  'Humidity & Moisture',
  'Precipitation',
  'Wind',
  'Pressure & Atmosphere',
  'Cloud Cover & Visibility',
  'General',
];

export const VISUAL_CROSSING_DAILY_CATEGORY_ORDER = [
  'Solar & Radiation',
  'Temperature',
  'Humidity & Moisture',
  'Precipitation',
  'Wind',
  'Pressure & Atmosphere',
  'Cloud Cover & Visibility',
  'Sun & Moon',
  'Agriculture & Degree Days',
  'General',
];

export const VISUAL_CROSSING_DEFAULT_HOURLY_VARIABLES = ['solarradiation', 'temp', 'humidity', 'windspeed'];

export type VisualCrossingUnitGroup = 'us' | 'uk' | 'metric' | 'base';
