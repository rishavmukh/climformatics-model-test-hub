import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LocationSearch } from '../components/LocationSearch';
import { VariablePicker } from '../components/VariablePicker';
import { ModelPicker } from '../components/ModelPicker';
import { fetchOpenMeteoSeries, OpenMeteoRequestError } from '../api/openMeteoClient';
import { fetchVisualCrossingSeries, VisualCrossingRequestError } from '../api/visualCrossingClient';
import { fetchWeatherbitSeries, WeatherbitRequestError } from '../api/weatherbitClient';
import { fetchWindySeries, WindyRequestError } from '../api/windyClient';
import { fetchForecaSeries, ForecaRequestError } from '../api/forecaClient';
import { fetchAtlasSeries, AtlasRequestError } from '../api/atlasClient';
import { fetchAccuWeatherSeries, AccuWeatherRequestError } from '../api/accuweatherClient';
import { fetchOpenWeatherSeries, OpenWeatherRequestError } from '../api/openWeatherClient';
import { fetchTomorrowIoSeries, TomorrowIoRequestError } from '../api/tomorrowIoClient';
import { PROVIDERS } from '../data/providers';
import { getCredential, hasAllCredentials } from '../utils/credentials';
import {
  DAILY_CATEGORY_ORDER,
  DAILY_VARIABLES,
  DEFAULT_HOURLY_VARIABLES,
  HOURLY_CATEGORY_ORDER,
  HOURLY_VARIABLES,
} from '../data/openMeteoVariables';
import { OPEN_METEO_MODELS } from '../data/openMeteoModels';
import {
  VISUAL_CROSSING_DAILY_CATEGORY_ORDER,
  VISUAL_CROSSING_DAILY_VARIABLES,
  VISUAL_CROSSING_DEFAULT_HOURLY_VARIABLES,
  VISUAL_CROSSING_HOURLY_CATEGORY_ORDER,
  VISUAL_CROSSING_HOURLY_VARIABLES,
} from '../data/visualCrossingVariables';
import type { VisualCrossingUnitGroup } from '../data/visualCrossingVariables';
import {
  WEATHERBIT_CATEGORY_ORDER,
  WEATHERBIT_DEFAULT_VARIABLES,
  WEATHERBIT_VARIABLES,
} from '../data/weatherbitVariables';
import { WINDY_CATEGORY_ORDER, WINDY_DEFAULT_VARIABLES, WINDY_MODELS, WINDY_VARIABLES } from '../data/windyVariables';
import { FORECA_CATEGORY_ORDER, FORECA_DAILY_VARIABLES, FORECA_DEFAULT_HOURLY_VARIABLES, FORECA_HOURLY_VARIABLES } from '../data/forecaVariables';
import type { ForecaTempUnit, ForecaWindUnit } from '../api/forecaClient';
import { ATLAS_CATEGORY_ORDER, ATLAS_DAILY_VARIABLES, ATLAS_DEFAULT_HOURLY_VARIABLES, ATLAS_HOURLY_VARIABLES } from '../data/atlasVariables';
import type { AtlasUnits } from '../api/atlasClient';
import {
  ACCUWEATHER_CATEGORY_ORDER,
  ACCUWEATHER_DAILY_VARIABLES,
  ACCUWEATHER_DEFAULT_HOURLY_VARIABLES,
  ACCUWEATHER_HOURLY_VARIABLES,
} from '../data/accuweatherVariables';
import {
  OPEN_WEATHER_CATEGORY_ORDER,
  OPEN_WEATHER_DAILY_VARIABLES,
  OPEN_WEATHER_DEFAULT_HOURLY_VARIABLES,
  OPEN_WEATHER_HOURLY_VARIABLES,
} from '../data/openWeatherVariables';
import {
  TOMORROW_IO_CATEGORY_ORDER,
  TOMORROW_IO_DAILY_VARIABLES,
  TOMORROW_IO_DEFAULT_HOURLY_VARIABLES,
  TOMORROW_IO_HOURLY_VARIABLES,
} from '../data/tomorrowIoVariables';
import type { GeocodingResult } from '../types';
import type { SeriesBlock, SeriesResult, TimeRange, VariableDef } from '../api/seriesTypes';
import type { PrecipitationUnit, TemperatureUnit, WindSpeedUnit } from '../api/openMeteoClient';

const IMPLEMENTED_PROVIDERS = PROVIDERS.filter((provider) => provider.implemented);
const OPEN_METEO_ID = 'open-meteo';
const VISUAL_CROSSING_ID = 'visual-crossing-energy';
const WEATHERBIT_ID = 'weatherbit';
const WINDY_ID = 'windy-point-forecast';
const FORECA_ID = 'foreca';
const ATLAS_ID = 'athenium-atlas';
const ACCUWEATHER_ID = 'accuweather-enterprise';
const OPEN_WEATHER_ID = 'openweather-solar';
const TOMORROW_IO_ID = 'tomorrow-io-solar';

function isoToMonthDayYear(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${month}/${day}/${year}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysFromTodayIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function describeColumn(seriesKey: string, variableDefs: VariableDef[]): string {
  const parts = seriesKey.split('::');
  const variableKey = parts[0] ?? seriesKey;
  const modelKey = parts[1];
  const variableLabel = variableDefs.find((variable) => variable.key === variableKey)?.label ?? variableKey;
  if (!modelKey) return variableLabel;
  const modelLabel = OPEN_METEO_MODELS.find((model) => model.key === modelKey)?.label ?? modelKey;
  return `${variableLabel} (${modelLabel})`;
}

interface ResultTableProps {
  title: string;
  block: SeriesBlock;
  variableDefs: VariableDef[];
}

function ResultTable({ title, block, variableDefs }: ResultTableProps): JSX.Element {
  const columns = Object.keys(block.series);

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-card shadow-card">
      <div className="border-b border-hairline px-4 py-3">
        <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
        <p className="text-xs text-ink-muted">{block.time.length} time steps</p>
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-surface-sunken">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-surface-sunken px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">
                Time
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="whitespace-nowrap px-3 py-2 text-right font-semibold uppercase tracking-wide text-ink-muted"
                >
                  {describeColumn(column, variableDefs)}
                  {block.units[column] ? ` (${block.units[column]})` : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.time.map((time, index) => (
              <tr key={time} className="border-t border-hairline">
                <td className="sticky left-0 bg-surface-card px-3 py-1.5 font-mono tabular-nums text-ink-secondary">
                  {time}
                </td>
                {columns.map((column) => (
                  <td key={column} className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-ink-primary">
                    {block.series[column]?.[index] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * The page that actually calls providers. Every implemented provider
 * (`WeatherProvider.implemented`) shows up in the selector here — Open-Meteo,
 * Visual Crossing, Weatherbit, and Windy.com today — each with its own
 * variable catalog, since their APIs don't share a variable namespace
 * (Open-Meteo's `shortwave_radiation` vs Visual Crossing's
 * `solarradiation`, for instance). Only Open-Meteo has a `models=` concept
 * for comparing multiple models in one run; Windy has a single-model
 * choice instead; Visual Crossing and Weatherbit each return one blended
 * answer per request. Weatherbit and Windy also have no configurable date
 * range — their APIs just return their own fixed forecast window — so the
 * Time range controls are hidden for those two rather than presented as if
 * they did something.
 */
export function DashboardPage(): JSX.Element {
  const [selectedProviderId, setSelectedProviderId] = useState(IMPLEMENTED_PROVIDERS[0]?.id ?? OPEN_METEO_ID);

  const [latitude, setLatitude] = useState(38.4404);
  const [longitude, setLongitude] = useState(-122.7141);
  const [placeName, setPlaceName] = useState('Santa Rosa, California');

  const [hourlyVariables, setHourlyVariables] = useState<string[]>(DEFAULT_HOURLY_VARIABLES);
  const [dailyVariables, setDailyVariables] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>('kmh');
  const [precipitationUnit, setPrecipitationUnit] = useState<PrecipitationUnit>('mm');
  const [unitGroup, setUnitGroup] = useState<VisualCrossingUnitGroup>('metric');
  const [windyModel, setWindyModel] = useState(WINDY_MODELS[0]?.key ?? 'gfs');
  const [forecaTempUnit, setForecaTempUnit] = useState<ForecaTempUnit>('C');
  const [forecaWindUnit, setForecaWindUnit] = useState<ForecaWindUnit>('KMH');
  const [atlasUnits, setAtlasUnits] = useState<AtlasUnits>('METRIC');
  const [accuweatherMetric, setAccuweatherMetric] = useState(true);
  const [openWeatherDate, setOpenWeatherDate] = useState(todayIso());

  const [timeRangeMode, setTimeRangeMode] = useState<'forecast' | 'range'>('forecast');
  const [forecastDays, setForecastDays] = useState(3);
  const [pastDays, setPastDays] = useState(0);
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(daysFromTodayIso(6));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<SeriesResult | undefined>(undefined);

  const selectedProvider = IMPLEMENTED_PROVIDERS.find((provider) => provider.id === selectedProviderId);
  const isOpenMeteo = selectedProviderId === OPEN_METEO_ID;
  const isVisualCrossing = selectedProviderId === VISUAL_CROSSING_ID;
  const isWeatherbit = selectedProviderId === WEATHERBIT_ID;
  const isWindy = selectedProviderId === WINDY_ID;
  const isForeca = selectedProviderId === FORECA_ID;
  const isAtlas = selectedProviderId === ATLAS_ID;
  const isAccuWeather = selectedProviderId === ACCUWEATHER_ID;
  const isOpenWeather = selectedProviderId === OPEN_WEATHER_ID;
  const isTomorrowIo = selectedProviderId === TOMORROW_IO_ID;
  const supportsFullTimeRange = isOpenMeteo || isVisualCrossing || isTomorrowIo;
  const supportsDateRangeOnly = isAtlas;
  const supportsTimeRange = supportsFullTimeRange || supportsDateRangeOnly;

  let hourlyCatalog: VariableDef[] = HOURLY_VARIABLES;
  let hourlyCategoryOrder: string[] = HOURLY_CATEGORY_ORDER;
  let dailyCatalog: VariableDef[] = DAILY_VARIABLES;
  let dailyCategoryOrder: string[] = DAILY_CATEGORY_ORDER;
  if (isVisualCrossing) {
    hourlyCatalog = VISUAL_CROSSING_HOURLY_VARIABLES;
    hourlyCategoryOrder = VISUAL_CROSSING_HOURLY_CATEGORY_ORDER;
    dailyCatalog = VISUAL_CROSSING_DAILY_VARIABLES;
    dailyCategoryOrder = VISUAL_CROSSING_DAILY_CATEGORY_ORDER;
  } else if (isWeatherbit) {
    hourlyCatalog = WEATHERBIT_VARIABLES;
    hourlyCategoryOrder = WEATHERBIT_CATEGORY_ORDER;
    dailyCatalog = WEATHERBIT_VARIABLES;
    dailyCategoryOrder = WEATHERBIT_CATEGORY_ORDER;
  } else if (isWindy) {
    hourlyCatalog = WINDY_VARIABLES;
    hourlyCategoryOrder = WINDY_CATEGORY_ORDER;
    dailyCatalog = [];
    dailyCategoryOrder = [];
  } else if (isForeca) {
    hourlyCatalog = FORECA_HOURLY_VARIABLES;
    hourlyCategoryOrder = FORECA_CATEGORY_ORDER;
    dailyCatalog = FORECA_DAILY_VARIABLES;
    dailyCategoryOrder = FORECA_CATEGORY_ORDER;
  } else if (isAtlas) {
    hourlyCatalog = ATLAS_HOURLY_VARIABLES;
    hourlyCategoryOrder = ATLAS_CATEGORY_ORDER;
    dailyCatalog = ATLAS_DAILY_VARIABLES;
    dailyCategoryOrder = ATLAS_CATEGORY_ORDER;
  } else if (isAccuWeather) {
    hourlyCatalog = ACCUWEATHER_HOURLY_VARIABLES;
    hourlyCategoryOrder = ACCUWEATHER_CATEGORY_ORDER;
    dailyCatalog = ACCUWEATHER_DAILY_VARIABLES;
    dailyCategoryOrder = ACCUWEATHER_CATEGORY_ORDER;
  } else if (isOpenWeather) {
    hourlyCatalog = OPEN_WEATHER_HOURLY_VARIABLES;
    hourlyCategoryOrder = OPEN_WEATHER_CATEGORY_ORDER;
    dailyCatalog = OPEN_WEATHER_DAILY_VARIABLES;
    dailyCategoryOrder = OPEN_WEATHER_CATEGORY_ORDER;
  } else if (isTomorrowIo) {
    hourlyCatalog = TOMORROW_IO_HOURLY_VARIABLES;
    hourlyCategoryOrder = TOMORROW_IO_CATEGORY_ORDER;
    dailyCatalog = TOMORROW_IO_DAILY_VARIABLES;
    dailyCategoryOrder = TOMORROW_IO_CATEGORY_ORDER;
  }

  const missingCredentials = selectedProvider?.requiresCredentials === true && !hasAllCredentials(selectedProvider);

  function handleProviderChange(nextId: string): void {
    setSelectedProviderId(nextId);
    setResult(undefined);
    setError(undefined);
    setModels([]);
    setDailyVariables([]);
    if (nextId === ATLAS_ID) setTimeRangeMode('range');
    if (nextId === VISUAL_CROSSING_ID) {
      setHourlyVariables(VISUAL_CROSSING_DEFAULT_HOURLY_VARIABLES);
    } else if (nextId === WEATHERBIT_ID) {
      setHourlyVariables(WEATHERBIT_DEFAULT_VARIABLES);
    } else if (nextId === WINDY_ID) {
      setHourlyVariables(WINDY_DEFAULT_VARIABLES);
    } else if (nextId === FORECA_ID) {
      setHourlyVariables(FORECA_DEFAULT_HOURLY_VARIABLES);
    } else if (nextId === ATLAS_ID) {
      setHourlyVariables(ATLAS_DEFAULT_HOURLY_VARIABLES);
    } else if (nextId === ACCUWEATHER_ID) {
      setHourlyVariables(ACCUWEATHER_DEFAULT_HOURLY_VARIABLES);
    } else if (nextId === OPEN_WEATHER_ID) {
      setHourlyVariables(OPEN_WEATHER_DEFAULT_HOURLY_VARIABLES);
    } else if (nextId === TOMORROW_IO_ID) {
      setHourlyVariables(TOMORROW_IO_DEFAULT_HOURLY_VARIABLES);
    } else {
      setHourlyVariables(DEFAULT_HOURLY_VARIABLES);
    }
  }

  function handleLocationSelect(location: GeocodingResult): void {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setPlaceName(`${location.name}${location.admin1 ? `, ${location.admin1}` : ''}`);
  }

  function handleRun(): void {
    if (!selectedProvider) return;

    if (hourlyVariables.length === 0 && dailyVariables.length === 0) {
      setError('Select at least one variable before running.');
      return;
    }
    if ((supportsFullTimeRange && timeRangeMode === 'range') || supportsDateRangeOnly) {
      if (startDate > endDate) {
        setError('Start date must be on or before end date.');
        return;
      }
    }
    if (missingCredentials) {
      setError(`No credentials saved for ${selectedProvider.name} yet — add them on the Settings page.`);
      return;
    }

    const timeRange: TimeRange =
      timeRangeMode === 'range' ? { mode: 'range', startDate, endDate } : { mode: 'forecast', forecastDays, pastDays };
    const apiKey = selectedProvider.requiresCredentials ? getCredential(selectedProvider.id, 'apiKey') : '';

    let request: Promise<SeriesResult>;
    if (isVisualCrossing) {
      request = fetchVisualCrossingSeries({ latitude, longitude, hourlyVariables, dailyVariables, unitGroup, timeRange, apiKey });
    } else if (isWeatherbit) {
      request = fetchWeatherbitSeries({ latitude, longitude, hourlyVariables, dailyVariables, apiKey });
    } else if (isWindy) {
      request = fetchWindySeries({ latitude, longitude, variables: hourlyVariables, model: windyModel, apiKey });
    } else if (isForeca) {
      request = fetchForecaSeries({
        latitude,
        longitude,
        hourlyVariables,
        dailyVariables,
        tempUnit: forecaTempUnit,
        windUnit: forecaWindUnit,
        apiKey,
      });
    } else if (isAtlas) {
      request = fetchAtlasSeries({
        latitude,
        longitude,
        hourlyVariables,
        dailyVariables,
        units: atlasUnits,
        startDate: isoToMonthDayYear(startDate),
        endDate: isoToMonthDayYear(endDate),
        apiKey,
      });
    } else if (isAccuWeather) {
      request = fetchAccuWeatherSeries({ latitude, longitude, hourlyVariables, dailyVariables, metric: accuweatherMetric, apiKey });
    } else if (isOpenWeather) {
      request = fetchOpenWeatherSeries({ latitude, longitude, date: openWeatherDate, hourlyVariables, dailyVariables, apiKey });
    } else if (isTomorrowIo) {
      request = fetchTomorrowIoSeries({ latitude, longitude, hourlyVariables, dailyVariables, timeRange, apiKey });
    } else {
      request = fetchOpenMeteoSeries({
        latitude,
        longitude,
        hourlyVariables,
        dailyVariables,
        models,
        temperatureUnit,
        windSpeedUnit,
        precipitationUnit,
        timeRange,
      });
    }

    setIsLoading(true);
    setError(undefined);
    setResult(undefined);
    request
      .then(setResult)
      .catch((err: unknown) => {
        const message =
          err instanceof OpenMeteoRequestError ||
          err instanceof VisualCrossingRequestError ||
          err instanceof WeatherbitRequestError ||
          err instanceof WindyRequestError ||
          err instanceof ForecaRequestError ||
          err instanceof AtlasRequestError ||
          err instanceof AccuWeatherRequestError ||
          err instanceof OpenWeatherRequestError ||
          err instanceof TomorrowIoRequestError ||
          err instanceof Error
            ? err.message
            : 'Request failed';
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <>
      <header className="border-b border-hairline bg-surface-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Run a test</p>
          <h1 className="text-2xl font-semibold text-ink-primary">Testing</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 rounded-xl border border-hairline bg-surface-card p-5 shadow-card">
          <div className="flex flex-col gap-1">
            <label htmlFor="provider-select" className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Provider
            </label>
            <select
              id="provider-select"
              value={selectedProviderId}
              onChange={(event) => handleProviderChange(event.target.value)}
              className="w-full max-w-md rounded-md border border-hairline bg-surface-card px-3 py-2 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            >
              {IMPLEMENTED_PROVIDERS.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            {missingCredentials && selectedProvider && (
              <p className="text-xs font-medium text-red-600">
                No API key saved for {selectedProvider.company} yet —{' '}
                <Link to="/settings" className="underline">
                  add one on the Settings page
                </Link>
                .
              </p>
            )}
          </div>

          <LocationSearch onSelect={handleLocationSelect} />

          <div className="flex flex-col gap-3 border-t border-hairline pt-5">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Time range</h3>
              {supportsFullTimeRange && (
                <div className="flex gap-1 rounded-md border border-hairline p-0.5">
                  <button
                    type="button"
                    onClick={() => setTimeRangeMode('forecast')}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      timeRangeMode === 'forecast' ? 'bg-accent-600 text-white' : 'text-ink-secondary hover:bg-accent-50'
                    }`}
                  >
                    Forecast / past days
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRangeMode('range')}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      timeRangeMode === 'range' ? 'bg-accent-600 text-white' : 'text-ink-secondary hover:bg-accent-50'
                    }`}
                  >
                    Custom date range
                  </button>
                </div>
              )}
            </div>

            {!supportsTimeRange && !isOpenWeather && (
              <p className="text-xs text-ink-muted">
                {selectedProvider?.company} returns its own fixed forecast window — this isn&apos;t configurable
                through their API.
              </p>
            )}

            {isOpenWeather && (
              <div className="flex flex-col gap-1">
                <label htmlFor="openweather-date" className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Date
                </label>
                <input
                  id="openweather-date"
                  type="date"
                  value={openWeatherDate}
                  onChange={(event) => setOpenWeatherDate(event.target.value)}
                  className="w-48 rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
                <p className="mt-1 text-xs text-ink-muted">
                  One date per request (this is a paid, per-call API) — no multi-day range here, unlike the other
                  providers.
                </p>
              </div>
            )}

            {(supportsFullTimeRange || supportsDateRangeOnly) && (supportsFullTimeRange && timeRangeMode === 'forecast' ? (
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="forecast-days" className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Forecast days
                  </label>
                  <input
                    id="forecast-days"
                    type="number"
                    min={1}
                    max={16}
                    value={forecastDays}
                    onChange={(event) => setForecastDays(Number(event.target.value))}
                    className="w-24 rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="past-days" className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Past days
                  </label>
                  <input
                    id="past-days"
                    type="number"
                    min={0}
                    max={92}
                    value={pastDays}
                    onChange={(event) => setPastDays(Number(event.target.value))}
                    className="w-24 rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="start-date" className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Start date
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="end-date" className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    End date
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-hairline pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Units</h3>
            {isVisualCrossing && (
              <div className="flex flex-col gap-1">
                <label htmlFor="unit-group" className="text-xs text-ink-secondary">
                  Unit system
                </label>
                <select
                  id="unit-group"
                  value={unitGroup}
                  onChange={(event) => setUnitGroup(event.target.value as VisualCrossingUnitGroup)}
                  className="w-48 rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                >
                  <option value="us">US (°F, mph, in)</option>
                  <option value="uk">UK (°C, mph, mm)</option>
                  <option value="metric">Metric (°C, km/h, mm)</option>
                  <option value="base">Base / SI (K, m/s, mm)</option>
                </select>
              </div>
            )}
            {isWeatherbit && (
              <p className="text-xs text-ink-muted">
                Fixed to Metric (°C, m/s, mm, W/m²) — Weatherbit&apos;s docs don&apos;t clearly spell out the
                Imperial/Scientific conversions, so this client only requests Metric.
              </p>
            )}
            {isWindy && (
              <p className="text-xs text-ink-muted">
                Windy returns each variable in its own fixed unit — shown directly in the column headers below.
              </p>
            )}
            {isForeca && (
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="foreca-temp-unit" className="text-xs text-ink-secondary">
                    Temperature
                  </label>
                  <select
                    id="foreca-temp-unit"
                    value={forecaTempUnit}
                    onChange={(event) => setForecaTempUnit(event.target.value as ForecaTempUnit)}
                    className="rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  >
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="foreca-wind-unit" className="text-xs text-ink-secondary">
                    Wind speed
                  </label>
                  <select
                    id="foreca-wind-unit"
                    value={forecaWindUnit}
                    onChange={(event) => setForecaWindUnit(event.target.value as ForecaWindUnit)}
                    className="rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  >
                    <option value="MS">m/s</option>
                    <option value="KMH">km/h</option>
                    <option value="MPH">mph</option>
                    <option value="KTS">knots</option>
                  </select>
                </div>
              </div>
            )}
            {isAtlas && (
              <div className="flex flex-col gap-1">
                <label htmlFor="atlas-units" className="text-xs text-ink-secondary">
                  Unit system
                </label>
                <select
                  id="atlas-units"
                  value={atlasUnits}
                  onChange={(event) => setAtlasUnits(event.target.value as AtlasUnits)}
                  className="w-48 rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                >
                  <option value="METRIC">Metric</option>
                  <option value="IMPERIAL">Imperial</option>
                </select>
                <p className="mt-1 text-xs text-ink-muted">
                  Both Celsius/Fahrenheit fields are selectable regardless — see the variable picker below.
                </p>
              </div>
            )}
            {isAccuWeather && (
              <div className="flex flex-col gap-1">
                <label htmlFor="accuweather-units" className="text-xs text-ink-secondary">
                  Unit system
                </label>
                <select
                  id="accuweather-units"
                  value={accuweatherMetric ? 'metric' : 'imperial'}
                  onChange={(event) => setAccuweatherMetric(event.target.value === 'metric')}
                  className="w-48 rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                >
                  <option value="metric">Metric (°C, km/h, mm)</option>
                  <option value="imperial">Imperial (°F, mph, in)</option>
                </select>
              </div>
            )}
            {isOpenWeather && (
              <p className="text-xs text-ink-muted">
                Fixed units — W/m² for instantaneous irradiance, Wh/m² for accumulated irradiation.
              </p>
            )}
            {isTomorrowIo && (
              <p className="text-xs text-ink-muted">
                Fixed to Metric — an Imperial option exists in Tomorrow.io&apos;s API but wasn&apos;t verified live.
              </p>
            )}
            {isOpenMeteo && (
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="temperature-unit" className="text-xs text-ink-secondary">
                    Temperature
                  </label>
                  <select
                    id="temperature-unit"
                    value={temperatureUnit}
                    onChange={(event) => setTemperatureUnit(event.target.value as TemperatureUnit)}
                    className="rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="wind-unit" className="text-xs text-ink-secondary">
                    Wind speed
                  </label>
                  <select
                    id="wind-unit"
                    value={windSpeedUnit}
                    onChange={(event) => setWindSpeedUnit(event.target.value as WindSpeedUnit)}
                    className="rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  >
                    <option value="kmh">km/h</option>
                    <option value="ms">m/s</option>
                    <option value="mph">mph</option>
                    <option value="kn">knots</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="precipitation-unit" className="text-xs text-ink-secondary">
                    Precipitation
                  </label>
                  <select
                    id="precipitation-unit"
                    value={precipitationUnit}
                    onChange={(event) => setPrecipitationUnit(event.target.value as PrecipitationUnit)}
                    className="rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  >
                    <option value="mm">Millimeters</option>
                    <option value="inch">Inches</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {isOpenMeteo && (
            <div className="border-t border-hairline pt-5">
              <ModelPicker selected={models} onChange={setModels} />
            </div>
          )}

          {isWindy && (
            <div className="flex flex-col gap-1 border-t border-hairline pt-5">
              <label htmlFor="windy-model" className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Weather model
              </label>
              <select
                id="windy-model"
                value={windyModel}
                onChange={(event) => setWindyModel(event.target.value)}
                className="w-64 rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              >
                {WINDY_MODELS.map((model) => (
                  <option key={model.key} value={model.key}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t border-hairline pt-5">
            <VariablePicker
              title={isWindy ? 'Variables' : 'Hourly variables'}
              variables={hourlyCatalog}
              categoryOrder={hourlyCategoryOrder}
              selected={hourlyVariables}
              onChange={setHourlyVariables}
            />
          </div>

          {dailyCatalog.length > 0 && (
            <div className="border-t border-hairline pt-5">
              <VariablePicker
                title="Daily variables"
                variables={dailyCatalog}
                categoryOrder={dailyCategoryOrder}
                selected={dailyVariables}
                onChange={setDailyVariables}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-5">
            <button
              type="button"
              onClick={handleRun}
              disabled={isLoading}
              className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Running…' : `Run test (${selectedProvider?.company ?? ''})`}
            </button>
            <p className="text-xs text-ink-muted">
              Testing at {placeName} ({latitude.toFixed(4)}, {longitude.toFixed(4)}).
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {result?.hourly && <ResultTable title="Hourly results" block={result.hourly} variableDefs={hourlyCatalog} />}
        {result?.daily && <ResultTable title="Daily results" block={result.daily} variableDefs={dailyCatalog} />}
      </main>
    </>
  );
}
