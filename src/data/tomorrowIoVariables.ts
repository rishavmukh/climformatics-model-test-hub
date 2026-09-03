import type { VariableDef } from '../api/seriesTypes';

/**
 * Fields from Tomorrow.io's Core weather layer, requested via their
 * `/v4/timelines` endpoint (the flexible one — `/v4/weather/forecast`
 * ignores the `fields` param entirely and just returns a fixed schema,
 * confirmed live). Every field below except the astronomical/degree-day
 * ones was confirmed live at the `1h` timestep with a real key; the daily-
 * only additions (sunrise/sunset, moon phase, growing degree days) were
 * confirmed only at `1d` — `moonPhase` specifically 400s at `1h`
 * ("not allowed for the following timesteps"), so all four are kept out
 * of the hourly catalog to avoid that.
 *
 * `solarGHI`/`solarDNI`/`solarDHI` are real, documented fields — the ones
 * this hub's catalog entry is actually about — but they're a separate
 * paid add-on Tomorrow.io doesn't error on when missing: request one on a
 * plan without it and the API just silently omits it from the response
 * (confirmed live) rather than 403ing. If these three always come back
 * empty, that's the add-on gate, not a bug here.
 */
export const TOMORROW_IO_HOURLY_VARIABLES: VariableDef[] = [
  { key: 'solarGHI', label: 'Solar GHI (paid add-on)', category: 'Solar & Radiation' },
  { key: 'solarDNI', label: 'Solar DNI (paid add-on)', category: 'Solar & Radiation' },
  { key: 'solarDHI', label: 'Solar DHI (paid add-on)', category: 'Solar & Radiation' },
  { key: 'uvIndex', label: 'UV index', category: 'Solar & Radiation' },
  { key: 'uvHealthConcern', label: 'UV health concern', category: 'Solar & Radiation' },

  { key: 'temperature', label: 'Temperature (°C)', category: 'Temperature' },
  { key: 'temperatureApparent', label: 'Apparent temperature (°C)', category: 'Temperature' },
  { key: 'dewPoint', label: 'Dew point (°C)', category: 'Temperature' },

  { key: 'humidity', label: 'Relative humidity', category: 'Humidity & Moisture' },

  { key: 'precipitationIntensity', label: 'Precipitation intensity', category: 'Precipitation' },
  { key: 'rainIntensity', label: 'Rain intensity', category: 'Precipitation' },
  { key: 'freezingRainIntensity', label: 'Freezing rain intensity', category: 'Precipitation' },
  { key: 'snowIntensity', label: 'Snow intensity', category: 'Precipitation' },
  { key: 'sleetIntensity', label: 'Sleet intensity', category: 'Precipitation' },
  { key: 'precipitationProbability', label: 'Precipitation probability', category: 'Precipitation' },
  { key: 'precipitationType', label: 'Precipitation type (code)', category: 'Precipitation' },
  { key: 'rainAccumulation', label: 'Rain accumulation', category: 'Precipitation' },
  { key: 'snowAccumulation', label: 'Snow accumulation', category: 'Precipitation' },
  { key: 'snowAccumulationLwe', label: 'Snow accumulation (liquid equiv.)', category: 'Precipitation' },
  { key: 'sleetAccumulation', label: 'Sleet accumulation', category: 'Precipitation' },
  { key: 'sleetAccumulationLwe', label: 'Sleet accumulation (liquid equiv.)', category: 'Precipitation' },
  { key: 'iceAccumulation', label: 'Ice accumulation', category: 'Precipitation' },
  { key: 'iceAccumulationLwe', label: 'Ice accumulation (liquid equiv.)', category: 'Precipitation' },
  { key: 'snowDepth', label: 'Snow depth', category: 'Precipitation' },
  { key: 'thunderstormProbability', label: 'Thunderstorm probability', category: 'Precipitation' },
  { key: 'weatherCode', label: 'Weather code', category: 'Precipitation' },

  { key: 'windSpeed', label: 'Wind speed', category: 'Wind' },
  { key: 'windDirection', label: 'Wind direction (°)', category: 'Wind' },
  { key: 'windGust', label: 'Wind gust', category: 'Wind' },

  { key: 'pressureSurfaceLevel', label: 'Surface pressure', category: 'Pressure & Atmosphere' },
  { key: 'pressureSeaLevel', label: 'Sea level pressure', category: 'Pressure & Atmosphere' },
  { key: 'ezHeatStressIndex', label: 'Heat stress index', category: 'Pressure & Atmosphere' },

  { key: 'cloudCover', label: 'Cloud cover', category: 'Cloud Cover & Visibility' },
  { key: 'cloudBase', label: 'Cloud base', category: 'Cloud Cover & Visibility' },
  { key: 'cloudCeiling', label: 'Cloud ceiling', category: 'Cloud Cover & Visibility' },
  { key: 'visibility', label: 'Visibility', category: 'Cloud Cover & Visibility' },

  { key: 'evapotranspiration', label: 'Evapotranspiration', category: 'Evapotranspiration & Agriculture' },
];

export const TOMORROW_IO_DAILY_VARIABLES: VariableDef[] = [
  ...TOMORROW_IO_HOURLY_VARIABLES,
  { key: 'sunriseTime', label: 'Sunrise', category: 'Sun & Moon' },
  { key: 'sunsetTime', label: 'Sunset', category: 'Sun & Moon' },
  { key: 'moonPhase', label: 'Moon phase', category: 'Sun & Moon' },
  { key: 'gdd10To30', label: 'Growing degree days (10-30°C)', category: 'Evapotranspiration & Agriculture' },
  { key: 'gdd10To31', label: 'Growing degree days (10-31°C)', category: 'Evapotranspiration & Agriculture' },
  { key: 'gdd08To30', label: 'Growing degree days (8-30°C)', category: 'Evapotranspiration & Agriculture' },
  { key: 'gdd03To25', label: 'Growing degree days (3-25°C)', category: 'Evapotranspiration & Agriculture' },
];

export const TOMORROW_IO_CATEGORY_ORDER = [
  'Solar & Radiation',
  'Temperature',
  'Humidity & Moisture',
  'Precipitation',
  'Wind',
  'Pressure & Atmosphere',
  'Cloud Cover & Visibility',
  'Sun & Moon',
  'Evapotranspiration & Agriculture',
];

export const TOMORROW_IO_DEFAULT_HOURLY_VARIABLES = ['solarGHI', 'temperature', 'cloudCover'];
