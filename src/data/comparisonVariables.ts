export interface ComparisonVariableDef {
  key: string;
  label: string;
  category: string;
}

/**
 * Canonical, cross-provider variables for the Compare page. Every
 * implemented provider names things differently (Open-Meteo's
 * `temperature_2m`, Visual Crossing's `temp`, Atlas's
 * `surfaceTemperatureCelsius`, ...), so this is the small set of concepts
 * that map reasonably cleanly across most of them — not the exhaustive
 * per-provider catalogs the Testing page already exposes for full
 * single-provider exploration.
 *
 * `PROVIDER_VARIABLE_MAP[canonicalKey][providerId]` gives the native hourly
 * key to request from that provider, or `undefined` when that provider has
 * no real equivalent (e.g. Windy has no single total cloud-cover field —
 * only low/mid/high layers — so it's left out rather than faked; OpenWeather
 * only has solar irradiance, nothing else). A missing mapping renders as an
 * excluded provider for that variable's comparison table, not a zero or a
 * blank cell — there's a real difference between "reported zero" and
 * "doesn't measure this."
 */
export const COMPARISON_VARIABLES: ComparisonVariableDef[] = [
  { key: 'temperature', label: 'Temperature', category: 'Core' },
  { key: 'humidity', label: 'Relative humidity', category: 'Core' },
  { key: 'windSpeed', label: 'Wind speed', category: 'Core' },
  { key: 'precipitation', label: 'Precipitation', category: 'Core' },
  { key: 'cloudCover', label: 'Cloud cover', category: 'Core' },
  { key: 'pressure', label: 'Pressure', category: 'Core' },
  { key: 'solarGhi', label: 'Solar GHI', category: 'Core' },
];

export const PROVIDER_VARIABLE_MAP: Record<string, Record<string, string | undefined>> = {
  temperature: {
    'open-meteo': 'temperature_2m',
    'visual-crossing-energy': 'temp',
    weatherbit: 'temp',
    'accuweather-enterprise': 'temperature',
    'openweather-solar': undefined,
    foreca: 'temperature',
    'athenium-atlas': 'surfaceTemperatureCelsius',
    'windy-point-forecast': 'temp',
    'tomorrow-io-solar': 'temperature',
  },
  humidity: {
    'open-meteo': 'relative_humidity_2m',
    'visual-crossing-energy': 'humidity',
    weatherbit: 'rh',
    'accuweather-enterprise': 'relativeHumidity',
    'openweather-solar': undefined,
    foreca: 'relHumidity',
    'athenium-atlas': 'relativeHumidityPercent',
    'windy-point-forecast': 'rh',
    'tomorrow-io-solar': 'humidity',
  },
  windSpeed: {
    'open-meteo': 'wind_speed_10m',
    'visual-crossing-energy': 'windspeed',
    weatherbit: 'wind_spd',
    'accuweather-enterprise': 'windSpeed',
    'openweather-solar': undefined,
    foreca: 'windSpeed',
    'athenium-atlas': 'windSpeedKph',
    'windy-point-forecast': 'wind_speed',
    'tomorrow-io-solar': 'windSpeed',
  },
  precipitation: {
    'open-meteo': 'precipitation',
    'visual-crossing-energy': 'precip',
    weatherbit: 'precip',
    'accuweather-enterprise': 'totalLiquid',
    'openweather-solar': undefined,
    foreca: 'precipAccum',
    'athenium-atlas': 'precipitationPreviousHourCentimeters',
    // Windy's `precip` is a 3-hour accumulation, not hourly like every other provider here —
    // no scale factor fixes a different integration window, so it's excluded rather than misrepresented.
    'windy-point-forecast': undefined,
    'tomorrow-io-solar': 'rainAccumulation',
  },
  cloudCover: {
    'open-meteo': 'cloud_cover',
    'visual-crossing-energy': 'cloudcover',
    weatherbit: 'clouds',
    'accuweather-enterprise': 'cloudCover',
    'openweather-solar': undefined,
    foreca: 'cloudiness',
    'athenium-atlas': 'cloudCoveragePercent',
    'windy-point-forecast': undefined,
    'tomorrow-io-solar': 'cloudCover',
  },
  pressure: {
    'open-meteo': 'pressure_msl',
    'visual-crossing-energy': 'pressure',
    weatherbit: undefined,
    'accuweather-enterprise': undefined,
    'openweather-solar': undefined,
    foreca: 'pressure',
    'athenium-atlas': 'surfaceAirPressureMillibars',
    'windy-point-forecast': 'pressure',
    'tomorrow-io-solar': 'pressureSurfaceLevel',
  },
  solarGhi: {
    'open-meteo': 'shortwave_radiation',
    'visual-crossing-energy': 'solarradiation',
    weatherbit: 't_ghi',
    'accuweather-enterprise': 'solarIrradiance',
    'openweather-solar': 'avgGhiClearSky',
    foreca: 'solarRadiation',
    'athenium-atlas': 'downwardSolarRadiationWsqm',
    'windy-point-forecast': undefined,
    'tomorrow-io-solar': 'solarGHI',
  },
};
