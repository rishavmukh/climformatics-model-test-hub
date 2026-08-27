const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export class OpenMeteoRequestError extends Error {}

export interface OpenMeteoGhiResult {
  latitude: number;
  longitude: number;
  timezone: string;
  unit: string;
  time: string[];
  values: Array<number | null>;
}

interface RawResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly_units: { shortwave_radiation?: string };
  hourly: { time: string[]; shortwave_radiation?: Array<number | null> };
  error?: boolean;
  reason?: string;
}

/**
 * The one working provider client in this hub so far — proves the
 * harness end to end. Free, keyless, same Open-Meteo Forecast API this
 * hub's sibling project (srad-ensembletest-dashboard) already relies on.
 */
export async function fetchOpenMeteoGhi(
  latitude: number,
  longitude: number,
  forecastDays: number,
): Promise<OpenMeteoGhiResult> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: 'shortwave_radiation',
    forecast_days: String(forecastDays),
    timezone: 'auto',
  });

  const response = await fetch(`${FORECAST_BASE_URL}?${params.toString()}`);
  const body = (await response.json()) as RawResponse;

  if (!response.ok || body.error) {
    throw new OpenMeteoRequestError(body.reason ?? `HTTP ${response.status}`);
  }

  return {
    latitude: body.latitude,
    longitude: body.longitude,
    timezone: body.timezone,
    unit: body.hourly_units.shortwave_radiation ?? '',
    time: body.hourly.time,
    values: body.hourly.shortwave_radiation ?? [],
  };
}
