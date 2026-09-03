/**
 * Provider-agnostic result shape every implemented client normalizes into,
 * so the Dashboard can render one results table regardless of which
 * provider answered. `series` is keyed by variable name, or by
 * `${variable}::${model}` when a provider that supports comparing multiple
 * models (currently just Open-Meteo) was asked to compare more than one.
 */
/** Most series are numeric; a few provider fields (conditions text, precip type, sunrise/sunset clock times) are strings — both render fine as-is in the results table. */
export type SeriesValue = number | string | null;

export interface SeriesBlock {
  time: string[];
  units: Record<string, string>;
  series: Record<string, SeriesValue[]>;
}

export interface SeriesResult {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
  requestedModels: string[];
  hourly?: SeriesBlock;
  daily?: SeriesBlock;
}

export interface VariableDef {
  key: string;
  label: string;
  category: string;
}

export type TimeRange =
  | { mode: 'forecast'; forecastDays: number; pastDays: number }
  | { mode: 'range'; startDate: string; endDate: string };
