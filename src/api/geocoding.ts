import type { GeocodingResponse, GeocodingResult } from '../types';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/** Free, keyless place search — same endpoint the sibling SRAD dashboard uses for location entry. */
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (query.trim().length < 2) return [];

  const params = new URLSearchParams({ name: query.trim(), count: '8', language: 'en' });
  const response = await fetch(`${GEOCODING_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const body = (await response.json()) as GeocodingResponse;
  return body.results ?? [];
}
