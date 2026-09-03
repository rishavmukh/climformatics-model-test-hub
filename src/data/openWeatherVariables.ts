import type { VariableDef } from '../api/seriesTypes';

/**
 * OpenWeather's Solar Irradiance API (docs.openweather.co.uk/api/solar-irradiance)
 * has a genuinely different shape from every other provider here: one
 * request covers a single calendar date, split into `interval`-sized time
 * slices (15m/1h/1d), and every slice carries GHI/DNI/DHI under BOTH a
 * `clear_sky` and `cloudy_sky` model, each reported three ways —
 * `avg_irradiance`/`max_irradiance` (instantaneous power, W/m²) and
 * `irradiation` (accumulated energy over the slice, Wh/m²). That's the 18
 * combinations below (3 metrics x 2 sky models x 3 aggregations).
 *
 * This client was built from OpenWeather's own docs before the API key
 * activated (new keys take ~2 hours) — the shape hasn't been independently
 * verified against a live response yet. Re-check field names with a real
 * call once the key is active, via the Settings "Test key" button.
 */
function buildCombinations(): VariableDef[] {
  const metrics: Array<{ key: string; label: string }> = [
    { key: 'Ghi', label: 'GHI' },
    { key: 'Dni', label: 'DNI' },
    { key: 'Dhi', label: 'DHI' },
  ];
  const skies: Array<{ key: string; label: string }> = [
    { key: 'ClearSky', label: 'clear sky' },
    { key: 'CloudySky', label: 'cloudy sky' },
  ];
  const aggregations: Array<{ key: string; label: string; category: string }> = [
    { key: 'avg', label: 'avg', category: 'Average irradiance (W/m²)' },
    { key: 'max', label: 'max', category: 'Max irradiance (W/m²)' },
    { key: 'irradiation', label: 'irradiation', category: 'Irradiation (Wh/m²)' },
  ];

  const defs: VariableDef[] = [];
  for (const aggregation of aggregations) {
    for (const metric of metrics) {
      for (const sky of skies) {
        defs.push({
          key: `${aggregation.key}${metric.key}${sky.key}`,
          label: `${metric.label} ${aggregation.label} (${sky.label})`,
          category: aggregation.category,
        });
      }
    }
  }
  return defs;
}

export const OPEN_WEATHER_IRRADIANCE_VARIABLES = buildCombinations();

export const OPEN_WEATHER_HOURLY_VARIABLES: VariableDef[] = OPEN_WEATHER_IRRADIANCE_VARIABLES;

export const OPEN_WEATHER_DAILY_VARIABLES: VariableDef[] = [
  ...OPEN_WEATHER_IRRADIANCE_VARIABLES,
  { key: 'sunrise', label: 'Sunrise', category: 'Sun Times' },
  { key: 'sunset', label: 'Sunset', category: 'Sun Times' },
];

export const OPEN_WEATHER_CATEGORY_ORDER = [
  'Average irradiance (W/m²)',
  'Max irradiance (W/m²)',
  'Irradiation (Wh/m²)',
  'Sun Times',
];

export const OPEN_WEATHER_DEFAULT_HOURLY_VARIABLES = ['avgGhiClearSky', 'avgGhiCloudySky'];
