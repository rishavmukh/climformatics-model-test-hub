import type { VariableDef } from '../api/seriesTypes';

export type OpenMeteoVariableDef = VariableDef;

/**
 * Every hourly/daily variable Open-Meteo's Forecast API accepts, not just
 * the shortwave-radiation family this hub started with. Sourced from the
 * `hourly`/`daily` enums in Open-Meteo's own OpenAPI spec
 * (github.com/open-meteo/open-meteo, openapi/forecast.yml) — the public
 * docs page is a client-rendered app with no machine-readable variable
 * list, so the spec in source is the trustworthy source of truth. An
 * earlier pass at this file was built from a summarized reading of the
 * docs page and contained several invented variable names the API
 * actually rejects (e.g. `terrestrial_solar_radiation` instead of
 * `terrestrial_radiation`) — this version is checked against the real
 * enum. Re-check there before adding to this list, since Open-Meteo adds
 * variables as new upstream models add fields.
 */
export const HOURLY_VARIABLES: OpenMeteoVariableDef[] = [
  { key: 'temperature_2m', label: 'Temperature (2m)', category: 'Temperature' },
  { key: 'temperature_2m_min', label: 'Temperature min (2m)', category: 'Temperature' },
  { key: 'temperature_2m_max', label: 'Temperature max (2m)', category: 'Temperature' },
  { key: 'apparent_temperature', label: 'Apparent temperature', category: 'Temperature' },
  { key: 'dew_point_2m', label: 'Dew point (2m)', category: 'Temperature' },
  { key: 'wet_bulb_temperature_2m', label: 'Wet bulb temperature (2m)', category: 'Temperature' },
  { key: 'surface_temperature', label: 'Surface temperature', category: 'Temperature' },
  { key: 'temperature_20m', label: 'Temperature (20m)', category: 'Temperature' },
  { key: 'temperature_40m', label: 'Temperature (40m)', category: 'Temperature' },
  { key: 'temperature_50m', label: 'Temperature (50m)', category: 'Temperature' },
  { key: 'temperature_80m', label: 'Temperature (80m)', category: 'Temperature' },
  { key: 'temperature_100m', label: 'Temperature (100m)', category: 'Temperature' },
  { key: 'temperature_120m', label: 'Temperature (120m)', category: 'Temperature' },
  { key: 'temperature_150m', label: 'Temperature (150m)', category: 'Temperature' },
  { key: 'temperature_180m', label: 'Temperature (180m)', category: 'Temperature' },
  { key: 'temperature_200m', label: 'Temperature (200m)', category: 'Temperature' },

  { key: 'relative_humidity_2m', label: 'Relative humidity (2m)', category: 'Humidity & Moisture' },
  { key: 'vapour_pressure_deficit', label: 'Vapour pressure deficit', category: 'Humidity & Moisture' },
  { key: 'total_column_integrated_water_vapour', label: 'Total column water vapour', category: 'Humidity & Moisture' },

  { key: 'precipitation_probability', label: 'Precipitation probability', category: 'Precipitation' },
  { key: 'precipitation', label: 'Precipitation', category: 'Precipitation' },
  { key: 'rain', label: 'Rain', category: 'Precipitation' },
  { key: 'showers', label: 'Showers', category: 'Precipitation' },
  { key: 'snowfall', label: 'Snowfall', category: 'Precipitation' },
  { key: 'snow_depth', label: 'Snow depth', category: 'Precipitation' },
  { key: 'snowfall_water_equivalent', label: 'Snowfall water equivalent', category: 'Precipitation' },
  { key: 'snow_depth_water_equivalent', label: 'Snow depth water equivalent', category: 'Precipitation' },
  { key: 'weather_code', label: 'Weather code (WMO)', category: 'Precipitation' },
  { key: 'runoff', label: 'Runoff', category: 'Precipitation' },
  { key: 'precipitation_type', label: 'Precipitation type', category: 'Precipitation' },
  { key: 'rain_probability', label: 'Rain probability', category: 'Precipitation' },
  { key: 'snowfall_probability', label: 'Snowfall probability', category: 'Precipitation' },
  { key: 'freezing_rain_probability', label: 'Freezing rain probability', category: 'Precipitation' },
  { key: 'ice_pellets_probability', label: 'Ice pellets probability', category: 'Precipitation' },
  { key: 'thunderstorm_probability', label: 'Thunderstorm probability', category: 'Precipitation' },
  { key: 'snowfall_height', label: 'Snowfall height', category: 'Precipitation' },
  { key: 'snow_height', label: 'Snow height', category: 'Precipitation' },

  { key: 'wind_speed_10m', label: 'Wind speed (10m)', category: 'Wind' },
  { key: 'wind_speed_20m', label: 'Wind speed (20m)', category: 'Wind' },
  { key: 'wind_speed_30m', label: 'Wind speed (30m)', category: 'Wind' },
  { key: 'wind_speed_40m', label: 'Wind speed (40m)', category: 'Wind' },
  { key: 'wind_speed_50m', label: 'Wind speed (50m)', category: 'Wind' },
  { key: 'wind_speed_70m', label: 'Wind speed (70m)', category: 'Wind' },
  { key: 'wind_speed_80m', label: 'Wind speed (80m)', category: 'Wind' },
  { key: 'wind_speed_100m', label: 'Wind speed (100m)', category: 'Wind' },
  { key: 'wind_speed_120m', label: 'Wind speed (120m)', category: 'Wind' },
  { key: 'wind_speed_140m', label: 'Wind speed (140m)', category: 'Wind' },
  { key: 'wind_speed_150m', label: 'Wind speed (150m)', category: 'Wind' },
  { key: 'wind_speed_160m', label: 'Wind speed (160m)', category: 'Wind' },
  { key: 'wind_speed_180m', label: 'Wind speed (180m)', category: 'Wind' },
  { key: 'wind_speed_200m', label: 'Wind speed (200m)', category: 'Wind' },
  { key: 'wind_direction_10m', label: 'Wind direction (10m)', category: 'Wind' },
  { key: 'wind_direction_20m', label: 'Wind direction (20m)', category: 'Wind' },
  { key: 'wind_direction_30m', label: 'Wind direction (30m)', category: 'Wind' },
  { key: 'wind_direction_40m', label: 'Wind direction (40m)', category: 'Wind' },
  { key: 'wind_direction_50m', label: 'Wind direction (50m)', category: 'Wind' },
  { key: 'wind_direction_70m', label: 'Wind direction (70m)', category: 'Wind' },
  { key: 'wind_direction_80m', label: 'Wind direction (80m)', category: 'Wind' },
  { key: 'wind_direction_100m', label: 'Wind direction (100m)', category: 'Wind' },
  { key: 'wind_direction_120m', label: 'Wind direction (120m)', category: 'Wind' },
  { key: 'wind_direction_140m', label: 'Wind direction (140m)', category: 'Wind' },
  { key: 'wind_direction_150m', label: 'Wind direction (150m)', category: 'Wind' },
  { key: 'wind_direction_160m', label: 'Wind direction (160m)', category: 'Wind' },
  { key: 'wind_direction_180m', label: 'Wind direction (180m)', category: 'Wind' },
  { key: 'wind_direction_200m', label: 'Wind direction (200m)', category: 'Wind' },
  { key: 'wind_gusts_10m', label: 'Wind gusts (10m)', category: 'Wind' },

  { key: 'pressure_msl', label: 'Mean sea level pressure', category: 'Pressure & Atmosphere' },
  { key: 'surface_pressure', label: 'Surface pressure', category: 'Pressure & Atmosphere' },
  { key: 'cape', label: 'CAPE', category: 'Pressure & Atmosphere' },
  { key: 'lifted_index', label: 'Lifted index', category: 'Pressure & Atmosphere' },
  { key: 'convective_inhibition', label: 'Convective inhibition', category: 'Pressure & Atmosphere' },
  { key: 'freezing_level_height', label: 'Freezing level height', category: 'Pressure & Atmosphere' },
  { key: 'boundary_layer_height', label: 'Boundary layer height', category: 'Pressure & Atmosphere' },
  { key: 'mass_density_8m', label: 'Mass density (8m)', category: 'Pressure & Atmosphere' },
  { key: 'convective_cloud_base', label: 'Convective cloud base', category: 'Pressure & Atmosphere' },
  { key: 'convective_cloud_top', label: 'Convective cloud top', category: 'Pressure & Atmosphere' },
  { key: 'updraft', label: 'Updraft', category: 'Pressure & Atmosphere' },
  { key: 'lightning_potential', label: 'Lightning potential', category: 'Pressure & Atmosphere' },
  { key: 'lightning_density', label: 'Lightning density', category: 'Pressure & Atmosphere' },
  { key: 'roughness_length', label: 'Roughness length', category: 'Pressure & Atmosphere' },
  { key: 'albedo', label: 'Albedo', category: 'Pressure & Atmosphere' },
  { key: 'k_index', label: 'K index', category: 'Pressure & Atmosphere' },

  { key: 'cloud_cover', label: 'Cloud cover (total)', category: 'Cloud Cover & Visibility' },
  { key: 'cloud_cover_low', label: 'Cloud cover (low)', category: 'Cloud Cover & Visibility' },
  { key: 'cloud_cover_mid', label: 'Cloud cover (mid)', category: 'Cloud Cover & Visibility' },
  { key: 'cloud_cover_high', label: 'Cloud cover (high)', category: 'Cloud Cover & Visibility' },
  { key: 'visibility', label: 'Visibility', category: 'Cloud Cover & Visibility' },

  { key: 'evapotranspiration', label: 'Evapotranspiration', category: 'Evapotranspiration' },
  { key: 'et0_fao_evapotranspiration', label: 'ET0 (FAO reference)', category: 'Evapotranspiration' },

  { key: 'soil_temperature_0cm', label: 'Soil temperature (0cm)', category: 'Soil' },
  { key: 'soil_temperature_6cm', label: 'Soil temperature (6cm)', category: 'Soil' },
  { key: 'soil_temperature_18cm', label: 'Soil temperature (18cm)', category: 'Soil' },
  { key: 'soil_temperature_54cm', label: 'Soil temperature (54cm)', category: 'Soil' },
  { key: 'soil_temperature_162cm', label: 'Soil temperature (162cm)', category: 'Soil' },
  { key: 'soil_temperature_486cm', label: 'Soil temperature (486cm)', category: 'Soil' },
  { key: 'soil_temperature_1458cm', label: 'Soil temperature (1458cm)', category: 'Soil' },
  { key: 'soil_temperature_0_to_7cm', label: 'Soil temperature (0-7cm)', category: 'Soil' },
  { key: 'soil_temperature_7_to_28cm', label: 'Soil temperature (7-28cm)', category: 'Soil' },
  { key: 'soil_temperature_28_to_100cm', label: 'Soil temperature (28-100cm)', category: 'Soil' },
  { key: 'soil_temperature_100_to_255cm', label: 'Soil temperature (100-255cm)', category: 'Soil' },
  { key: 'soil_temperature_0_to_10cm', label: 'Soil temperature (0-10cm)', category: 'Soil' },
  { key: 'soil_temperature_10_to_40cm', label: 'Soil temperature (10-40cm)', category: 'Soil' },
  { key: 'soil_temperature_40_to_100cm', label: 'Soil temperature (40-100cm)', category: 'Soil' },
  { key: 'soil_temperature_100_to_200cm', label: 'Soil temperature (100-200cm)', category: 'Soil' },
  { key: 'soil_temperature_10_to_35cm', label: 'Soil temperature (10-35cm)', category: 'Soil' },
  { key: 'soil_temperature_35_to_100cm', label: 'Soil temperature (35-100cm)', category: 'Soil' },
  { key: 'soil_temperature_100_to_300cm', label: 'Soil temperature (100-300cm)', category: 'Soil' },
  { key: 'soil_moisture_0_to_1cm', label: 'Soil moisture (0-1cm)', category: 'Soil' },
  { key: 'soil_moisture_1_to_3cm', label: 'Soil moisture (1-3cm)', category: 'Soil' },
  { key: 'soil_moisture_3_to_9cm', label: 'Soil moisture (3-9cm)', category: 'Soil' },
  { key: 'soil_moisture_9_to_27cm', label: 'Soil moisture (9-27cm)', category: 'Soil' },
  { key: 'soil_moisture_27_to_81cm', label: 'Soil moisture (27-81cm)', category: 'Soil' },
  { key: 'soil_moisture_81_to_243cm', label: 'Soil moisture (81-243cm)', category: 'Soil' },
  { key: 'soil_moisture_243_to_729cm', label: 'Soil moisture (243-729cm)', category: 'Soil' },
  { key: 'soil_moisture_729_to_2187cm', label: 'Soil moisture (729-2187cm)', category: 'Soil' },
  { key: 'soil_moisture_0_to_7cm', label: 'Soil moisture (0-7cm)', category: 'Soil' },
  { key: 'soil_moisture_7_to_28cm', label: 'Soil moisture (7-28cm)', category: 'Soil' },
  { key: 'soil_moisture_28_to_100cm', label: 'Soil moisture (28-100cm)', category: 'Soil' },
  { key: 'soil_moisture_100_to_255cm', label: 'Soil moisture (100-255cm)', category: 'Soil' },
  { key: 'soil_moisture_0_to_10cm', label: 'Soil moisture (0-10cm)', category: 'Soil' },
  { key: 'soil_moisture_10_to_40cm', label: 'Soil moisture (10-40cm)', category: 'Soil' },
  { key: 'soil_moisture_40_to_100cm', label: 'Soil moisture (40-100cm)', category: 'Soil' },
  { key: 'soil_moisture_100_to_200cm', label: 'Soil moisture (100-200cm)', category: 'Soil' },
  { key: 'soil_moisture_10_to_35cm', label: 'Soil moisture (10-35cm)', category: 'Soil' },
  { key: 'soil_moisture_35_to_100cm', label: 'Soil moisture (35-100cm)', category: 'Soil' },
  { key: 'soil_moisture_100_to_300cm', label: 'Soil moisture (100-300cm)', category: 'Soil' },

  { key: 'uv_index', label: 'UV index', category: 'Solar & Radiation' },
  { key: 'uv_index_clear_sky', label: 'UV index (clear sky)', category: 'Solar & Radiation' },
  { key: 'is_day', label: 'Is day', category: 'Solar & Radiation' },
  { key: 'sunshine_duration', label: 'Sunshine duration', category: 'Solar & Radiation' },
  { key: 'shortwave_radiation', label: 'Shortwave radiation (GHI)', category: 'Solar & Radiation' },
  { key: 'direct_radiation', label: 'Direct radiation', category: 'Solar & Radiation' },
  { key: 'diffuse_radiation', label: 'Diffuse radiation (DHI)', category: 'Solar & Radiation' },
  { key: 'direct_normal_irradiance', label: 'Direct normal irradiance (DNI)', category: 'Solar & Radiation' },
  { key: 'global_tilted_irradiance', label: 'Global tilted irradiance', category: 'Solar & Radiation' },
  { key: 'terrestrial_radiation', label: 'Terrestrial radiation', category: 'Solar & Radiation' },
  { key: 'shortwave_radiation_instant', label: 'Shortwave radiation (instant)', category: 'Solar & Radiation' },
  { key: 'direct_radiation_instant', label: 'Direct radiation (instant)', category: 'Solar & Radiation' },
  { key: 'diffuse_radiation_instant', label: 'DHI (instant)', category: 'Solar & Radiation' },
  { key: 'direct_normal_irradiance_instant', label: 'DNI (instant)', category: 'Solar & Radiation' },
  { key: 'global_tilted_irradiance_instant', label: 'Global tilted irradiance (instant)', category: 'Solar & Radiation' },
  { key: 'terrestrial_radiation_instant', label: 'Terrestrial radiation (instant)', category: 'Solar & Radiation' },

  { key: 'sea_level_height_msl', label: 'Sea level height (MSL)', category: 'Ocean & Marine' },
  { key: 'sea_ice_thickness', label: 'Sea ice thickness', category: 'Ocean & Marine' },
  { key: 'sea_surface_temperature', label: 'Sea surface temperature', category: 'Ocean & Marine' },
  { key: 'ocean_current_velocity', label: 'Ocean current velocity', category: 'Ocean & Marine' },
  { key: 'ocean_current_direction', label: 'Ocean current direction', category: 'Ocean & Marine' },
];

export const DAILY_VARIABLES: OpenMeteoVariableDef[] = [
  { key: 'weather_code', label: 'Weather code (WMO)', category: 'General' },

  { key: 'temperature_2m_max', label: 'Temperature max', category: 'Temperature' },
  { key: 'temperature_2m_min', label: 'Temperature min', category: 'Temperature' },
  { key: 'apparent_temperature_max', label: 'Apparent temperature max', category: 'Temperature' },
  { key: 'apparent_temperature_min', label: 'Apparent temperature min', category: 'Temperature' },

  { key: 'sunrise', label: 'Sunrise', category: 'Sun Times' },
  { key: 'sunset', label: 'Sunset', category: 'Sun Times' },
  { key: 'daylight_duration', label: 'Daylight duration', category: 'Sun Times' },
  { key: 'sunshine_duration', label: 'Sunshine duration', category: 'Sun Times' },

  { key: 'uv_index_max', label: 'UV index max', category: 'Solar & Radiation' },
  { key: 'uv_index_clear_sky_max', label: 'UV index max (clear sky)', category: 'Solar & Radiation' },
  { key: 'shortwave_radiation_sum', label: 'Shortwave radiation sum (GHI)', category: 'Solar & Radiation' },

  { key: 'rain_sum', label: 'Rain sum', category: 'Precipitation' },
  { key: 'showers_sum', label: 'Showers sum', category: 'Precipitation' },
  { key: 'snowfall_sum', label: 'Snowfall sum', category: 'Precipitation' },
  { key: 'precipitation_sum', label: 'Precipitation sum', category: 'Precipitation' },
  { key: 'precipitation_hours', label: 'Precipitation hours', category: 'Precipitation' },
  { key: 'precipitation_probability_max', label: 'Precipitation probability max', category: 'Precipitation' },

  { key: 'wind_speed_10m_max', label: 'Wind speed max', category: 'Wind' },
  { key: 'wind_gusts_10m_max', label: 'Wind gusts max', category: 'Wind' },
  { key: 'wind_direction_10m_dominant', label: 'Wind direction (dominant)', category: 'Wind' },

  { key: 'et0_fao_evapotranspiration', label: 'ET0 (FAO reference)', category: 'Evapotranspiration' },
];

export const HOURLY_CATEGORY_ORDER = [
  'Solar & Radiation',
  'Temperature',
  'Humidity & Moisture',
  'Precipitation',
  'Wind',
  'Pressure & Atmosphere',
  'Cloud Cover & Visibility',
  'Soil',
  'Evapotranspiration',
  'Ocean & Marine',
];

export const DAILY_CATEGORY_ORDER = [
  'General',
  'Solar & Radiation',
  'Sun Times',
  'Temperature',
  'Precipitation',
  'Wind',
  'Evapotranspiration',
];

export const DEFAULT_HOURLY_VARIABLES = [
  'shortwave_radiation',
  'direct_radiation',
  'direct_normal_irradiance',
  'diffuse_radiation',
];
