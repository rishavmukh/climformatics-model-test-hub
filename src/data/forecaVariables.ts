import type { VariableDef } from '../api/seriesTypes';

/**
 * Fields returned by Foreca's hourly and daily forecast endpoints
 * (weatherapi.foreca.net/api/v1/forecast/{hourly,daily}), confirmed
 * against developer.foreca.com and a live call (their auth error —
 * "Wrong number of segments" — confirms the API key itself is a JWT used
 * directly as a Bearer token, no separate exchange step).
 */
export const FORECA_HOURLY_VARIABLES: VariableDef[] = [
  { key: 'solarRadiation', label: 'Solar radiation (W/m²)', category: 'Solar & Radiation' },
  { key: 'uvIndex', label: 'UV index', category: 'Solar & Radiation' },

  { key: 'temperature', label: 'Temperature', category: 'Temperature' },
  { key: 'feelsLikeTemp', label: 'Feels like temperature', category: 'Temperature' },
  { key: 'dewPoint', label: 'Dew point', category: 'Temperature' },

  { key: 'relHumidity', label: 'Relative humidity (%)', category: 'Humidity & Moisture' },

  { key: 'precipProb', label: 'Precipitation probability (%)', category: 'Precipitation' },
  { key: 'precipAccum', label: 'Precipitation accumulation', category: 'Precipitation' },
  { key: 'precipType', label: 'Precipitation type', category: 'Precipitation' },
  { key: 'snowAccum', label: 'Snowfall accumulation', category: 'Precipitation' },
  { key: 'snowDepth', label: 'Snow depth', category: 'Precipitation' },
  { key: 'thunderProb', label: 'Thunderstorm probability (%)', category: 'Precipitation' },

  { key: 'windSpeed', label: 'Wind speed', category: 'Wind' },
  { key: 'windGust', label: 'Wind gust', category: 'Wind' },
  { key: 'windDir', label: 'Wind direction (°)', category: 'Wind' },
  { key: 'windDirString', label: 'Wind direction (compass)', category: 'Wind' },

  { key: 'pressure', label: 'Pressure (hPa)', category: 'Pressure & Atmosphere' },

  { key: 'cloudiness', label: 'Cloudiness (%)', category: 'Cloud Cover & Visibility' },
  { key: 'visibility', label: 'Visibility (m)', category: 'Cloud Cover & Visibility' },

  { key: 'symbol', label: 'Weather symbol (code)', category: 'General' },
  { key: 'symbolPhrase', label: 'Weather symbol (text)', category: 'General' },
];

export const FORECA_DAILY_VARIABLES: VariableDef[] = [
  { key: 'solarRadiationSum', label: 'Solar radiation sum (Wh/m²)', category: 'Solar & Radiation' },
  { key: 'uvIndex', label: 'UV index', category: 'Solar & Radiation' },
  { key: 'sunhours', label: 'Sun hours', category: 'Solar & Radiation' },
  { key: 'sunrise', label: 'Sunrise', category: 'Solar & Radiation' },
  { key: 'sunset', label: 'Sunset', category: 'Solar & Radiation' },

  { key: 'maxTemp', label: 'Temperature max', category: 'Temperature' },
  { key: 'minTemp', label: 'Temperature min', category: 'Temperature' },

  { key: 'precipAccum', label: 'Precipitation accumulation', category: 'Precipitation' },
  { key: 'snowDepth', label: 'Snow depth', category: 'Precipitation' },

  { key: 'maxWindSpeed', label: 'Wind speed max', category: 'Wind' },
  { key: 'maxWindGust', label: 'Wind gust max', category: 'Wind' },

  { key: 'symbol', label: 'Weather symbol (code)', category: 'General' },
  { key: 'symbolPhrase', label: 'Weather symbol (text)', category: 'General' },
];

export const FORECA_CATEGORY_ORDER = [
  'Solar & Radiation',
  'Temperature',
  'Humidity & Moisture',
  'Precipitation',
  'Wind',
  'Pressure & Atmosphere',
  'Cloud Cover & Visibility',
  'General',
];

export const FORECA_DEFAULT_HOURLY_VARIABLES = ['solarRadiation', 'temperature', 'precipProb'];
