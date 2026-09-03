export interface OpenMeteoModelDef {
  key: string;
  label: string;
  agency: string;
}

/**
 * The underlying NWP/AI weather models Open-Meteo lets &models= select
 * between — this is the actual "test the models" lever for this hub, since
 * Open-Meteo is the one provider with a working client. Sourced from the
 * `models` enum in Open-Meteo's own OpenAPI spec
 * (github.com/open-meteo/open-meteo, openapi/forecast.yml) rather than the
 * public docs page — that page is a client-rendered app and doesn't serve
 * a machine-readable list, so the spec in source is the trustworthy source
 * of truth. Re-check there before adding to this list; Open-Meteo adds and
 * retires upstream models over time.
 */
export const OPEN_METEO_MODELS: OpenMeteoModelDef[] = [
  { key: 'best_match', label: 'Best match (Open-Meteo default)', agency: 'Open-Meteo' },

  { key: 'ecmwf_ifs', label: 'IFS', agency: 'ECMWF' },
  { key: 'ecmwf_ifs025', label: 'IFS 0.25°', agency: 'ECMWF' },
  { key: 'ecmwf_aifs025_single', label: 'AIFS 0.25° (AI, single)', agency: 'ECMWF' },

  { key: 'cma_grapes_global', label: 'GRAPES global', agency: 'CMA (China)' },
  { key: 'bom_access_global', label: 'ACCESS global', agency: 'BOM (Australia)' },

  { key: 'ncep_gfs_seamless', label: 'GFS seamless', agency: 'NOAA / NCEP' },
  { key: 'ncep_gfs_global', label: 'GFS global', agency: 'NOAA / NCEP' },
  { key: 'ncep_hrrr_conus', label: 'HRRR CONUS', agency: 'NOAA / NCEP' },
  { key: 'ncep_nbm_conus', label: 'NBM CONUS', agency: 'NOAA / NCEP' },
  { key: 'ncep_nam_conus', label: 'NAM CONUS', agency: 'NOAA / NCEP' },
  { key: 'ncep_gfs_graphcast025', label: 'GFS GraphCast 0.25° (AI)', agency: 'NOAA / NCEP' },
  { key: 'ncep_aigfs025', label: 'AI-GFS 0.25° (AI)', agency: 'NOAA / NCEP' },
  { key: 'ncep_hgefs025_ensemble_mean', label: 'HGEFS ensemble mean 0.25°', agency: 'NOAA / NCEP' },

  { key: 'jma_seamless', label: 'JMA seamless', agency: 'JMA (Japan)' },
  { key: 'jma_msm', label: 'MSM', agency: 'JMA (Japan)' },
  { key: 'jma_gsm', label: 'GSM', agency: 'JMA (Japan)' },

  { key: 'kma_seamless', label: 'KMA seamless', agency: 'KMA (South Korea)' },
  { key: 'kma_ldps', label: 'LDPS', agency: 'KMA (South Korea)' },
  { key: 'kma_gdps', label: 'GDPS', agency: 'KMA (South Korea)' },

  { key: 'icon_seamless', label: 'ICON seamless', agency: 'DWD (Germany)' },
  { key: 'icon_global', label: 'ICON global', agency: 'DWD (Germany)' },
  { key: 'icon_eu', label: 'ICON EU', agency: 'DWD (Germany)' },
  { key: 'icon_d2', label: 'ICON D2', agency: 'DWD (Germany)' },

  { key: 'cmc_gem_seamless', label: 'GEM seamless', agency: 'ECCC (Canada)' },
  { key: 'cmc_gem_gdps', label: 'GEM GDPS (global)', agency: 'ECCC (Canada)' },
  { key: 'cmc_gem_rdps', label: 'GEM RDPS (regional)', agency: 'ECCC (Canada)' },
  { key: 'cmc_gem_hrdps', label: 'GEM HRDPS', agency: 'ECCC (Canada)' },
  { key: 'cmc_gem_hrdps_west', label: 'GEM HRDPS west', agency: 'ECCC (Canada)' },

  { key: 'meteofrance_seamless', label: 'Météo-France seamless', agency: 'Météo-France' },
  { key: 'meteofrance_arpege_world', label: 'ARPEGE world', agency: 'Météo-France' },
  { key: 'meteofrance_arpege_europe', label: 'ARPEGE Europe', agency: 'Météo-France' },
  { key: 'meteofrance_arome_france', label: 'AROME France', agency: 'Météo-France' },
  { key: 'meteofrance_arome_france_hd', label: 'AROME France HD', agency: 'Météo-France' },

  { key: 'italia_meteo_arpae_icon_2i', label: 'ICON-2I', agency: 'ARPAE (Italy)' },

  { key: 'metno_seamless', label: 'MET Nordic seamless', agency: 'MET Norway' },
  { key: 'metno_nordic', label: 'MET Nordic', agency: 'MET Norway' },

  { key: 'knmi_seamless', label: 'KNMI seamless', agency: 'KNMI (Netherlands)' },
  { key: 'knmi_harmonie_arome_europe', label: 'HARMONIE-AROME Europe', agency: 'KNMI (Netherlands)' },
  { key: 'knmi_harmonie_arome_netherlands', label: 'HARMONIE-AROME Netherlands', agency: 'KNMI (Netherlands)' },

  { key: 'dmi_seamless', label: 'DMI seamless', agency: 'DMI (Denmark)' },
  { key: 'dmi_harmonie_arome_europe', label: 'HARMONIE-AROME Europe', agency: 'DMI (Denmark)' },

  { key: 'ukmo_seamless', label: 'UK Met Office seamless', agency: 'UK Met Office' },
  { key: 'ukmo_global_deterministic_10km', label: 'Global deterministic 10km', agency: 'UK Met Office' },
  { key: 'ukmo_uk_deterministic_2km', label: 'UK deterministic 2km', agency: 'UK Met Office' },

  { key: 'meteoswiss_icon_seamless', label: 'ICON seamless', agency: 'MeteoSwiss' },
  { key: 'meteoswiss_icon_ch1', label: 'ICON CH1', agency: 'MeteoSwiss' },
  { key: 'meteoswiss_icon_ch2', label: 'ICON CH2', agency: 'MeteoSwiss' },

  { key: 'geosphere_seamless', label: 'GeoSphere seamless', agency: 'GeoSphere Austria' },
  { key: 'geosphere_arome_austria', label: 'AROME Austria', agency: 'GeoSphere Austria' },
];

export const OPEN_METEO_MODEL_AGENCY_ORDER = [
  'Open-Meteo',
  'ECMWF',
  'NOAA / NCEP',
  'DWD (Germany)',
  'ECCC (Canada)',
  'Météo-France',
  'JMA (Japan)',
  'KMA (South Korea)',
  'CMA (China)',
  'BOM (Australia)',
  'MET Norway',
  'KNMI (Netherlands)',
  'DMI (Denmark)',
  'UK Met Office',
  'MeteoSwiss',
  'GeoSphere Austria',
  'ARPAE (Italy)',
];
