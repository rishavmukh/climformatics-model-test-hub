import type { VariableDef } from '../api/seriesTypes';

/**
 * Fields returned by Weatherbit's Energy/Degree-Day Forecast API
 * (api.weatherbit.io/v2.0/forecast/energy, `tp=hourly` or `tp=daily`) —
 * the endpoint that actually matches this hub's "Weatherbit.io Energy API"
 * catalog entry, as opposed to Weatherbit's separate general-purpose
 * forecast endpoints. Sourced from weatherbit.io/api/weather-energy-forecast.
 * The solar/irradiance fields (t_ghi, t_dhi, t_ni, t_solar_rad) are
 * documented as gated behind Weatherbit's Business tier or higher — a
 * free-tier key will likely 403 on this endpoint entirely (confirmed live:
 * even an invalid key gets "Your API Key does not allow access to this
 * endpoint" rather than an auth-specific error, so a real free-tier key may
 * read the same way — that's an account/tier problem, not a bug here).
 *
 * Units are Metric only (°C, m/s, mm, W/m²) — Weatherbit's docs confirm the
 * metric defaults but don't clearly spell out the Imperial/Scientific unit
 * conversions, so rather than guess at labels this client always requests
 * `units=M`.
 */
export const WEATHERBIT_VARIABLES: VariableDef[] = [
  { key: 't_ghi', label: 'Global horizontal irradiance (GHI, clear sky)', category: 'Solar & Radiation' },
  { key: 't_dhi', label: 'Diffuse horizontal irradiance (DHI, clear sky)', category: 'Solar & Radiation' },
  { key: 't_ni', label: 'Direct normal irradiance (DNI, clear sky)', category: 'Solar & Radiation' },
  { key: 't_solar_rad', label: 'Solar radiation (cloud-adjusted)', category: 'Solar & Radiation' },
  { key: 'sun_hours', label: 'Sun hours (GHI > 1000 W/m²)', category: 'Solar & Radiation' },

  { key: 'cdd', label: 'Cooling degree days', category: 'Degree Days' },
  { key: 'hdd', label: 'Heating degree days', category: 'Degree Days' },

  { key: 'temp', label: 'Temperature', category: 'Temperature' },
  { key: 'temp_wetbulb', label: 'Wet bulb temperature', category: 'Temperature' },
  { key: 'dewpt', label: 'Dew point', category: 'Temperature' },

  { key: 'rh', label: 'Relative humidity', category: 'Humidity & Moisture' },

  { key: 'precip', label: 'Precipitation', category: 'Precipitation' },
  { key: 'snow', label: 'Snowfall', category: 'Precipitation' },

  { key: 'wind_spd', label: 'Wind speed', category: 'Wind' },
  { key: 'wind_spd_100m', label: 'Wind speed (100m)', category: 'Wind' },
  { key: 'wind_dir', label: 'Wind direction', category: 'Wind' },
  { key: 'wind_dir_100m', label: 'Wind direction (100m)', category: 'Wind' },
  { key: 'max_wind_spd', label: 'Wind speed max', category: 'Wind' },
  { key: 'max_wind_spd_100m', label: 'Wind speed max (100m)', category: 'Wind' },

  { key: 'clouds', label: 'Cloud cover', category: 'Cloud Cover' },
];

export const WEATHERBIT_CATEGORY_ORDER = [
  'Solar & Radiation',
  'Degree Days',
  'Temperature',
  'Humidity & Moisture',
  'Precipitation',
  'Wind',
  'Cloud Cover',
];

export const WEATHERBIT_DEFAULT_VARIABLES = ['t_ghi', 't_solar_rad', 'temp'];
