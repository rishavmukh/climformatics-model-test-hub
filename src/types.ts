export interface ProviderCredentialField {
  /** Storage key and the field name sent to the provider, e.g. 'apiKey', 'username'. */
  key: string;
  label: string;
  type: 'text' | 'password';
  placeholder?: string;
}

/** 'unverified' means research hasn't confirmed this one way or the other yet — never guess this to true or false. */
export type VariableAvailability = boolean | 'unverified';

/**
 * Full per-provider variable breakdown, replacing the old single
 * includesShortwaveRadiation flag. Keys map to the standard meteorological
 * parameters most weather APIs expose in some form; the three radiation
 * keys are split out because GHI/DNI/DHI are frequently offered
 * independently of one another (e.g. a provider may have GHI but not DNI).
 */
export interface ProviderVariables {
  temperature: VariableAvailability;
  windSpeedDirection: VariableAvailability;
  humidity: VariableAvailability;
  precipitation: VariableAvailability;
  cloudCover: VariableAvailability;
  pressure: VariableAvailability;
  /** GHI — global horizontal irradiance. */
  shortwaveRadiation: VariableAvailability;
  /** DNI — direct normal irradiance. */
  directNormalIrradiance: VariableAvailability;
  /** DHI — diffuse horizontal irradiance. */
  diffuseHorizontalIrradiance: VariableAvailability;
  uvIndex: VariableAvailability;
}

/**
 * One weather data provider in the catalog. `implemented` and
 * `requiresCredentials` are deliberately separate — a provider can need
 * credentials and still have no working client yet (nothing wired in),
 * or need no credentials and still be unimplemented. Only providers with
 * `implemented: true` show a "Run test" control on the Dashboard; the rest
 * are catalog-only entries with their docs link, so the registry can carry
 * real research (like the paid-provider survey this hub is meant to hold)
 * before there's client code to back it.
 */
export interface WeatherProvider {
  id: string;
  name: string;
  company: string;
  description: string;
  variables: ProviderVariables;
  requiresCredentials: boolean;
  credentialFields: ProviderCredentialField[];
  docsUrl: string;
  implemented: boolean;
  pricingNote: string;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}
