import { useState } from 'react';
import { LocationSearch } from '../components/LocationSearch';
import { ComparisonChart } from '../components/ComparisonChart';
import { COMPARISON_UNITS, runComparison } from '../api/comparisonRunner';
import type { ComparisonResults, ProviderVariableResult } from '../api/comparisonRunner';
import { COMPARISON_VARIABLES, PROVIDER_VARIABLE_MAP } from '../data/comparisonVariables';
import { PROVIDERS } from '../data/providers';
import { hasAllCredentials } from '../utils/credentials';
import type { GeocodingResult } from '../types';
import type { SeriesValue } from '../api/seriesTypes';

const IMPLEMENTED_PROVIDERS = PROVIDERS.filter((provider) => provider.implemented);
const DEFAULT_VARIABLE_KEYS = COMPARISON_VARIABLES.map((variable) => variable.key);

interface TableRow {
  time: string;
  cells: Record<string, SeriesValue | undefined>;
  spread: number | undefined;
  avg: number | undefined;
}

function buildRows(providerResults: Record<string, ProviderVariableResult>, okProviders: string[]): TableRow[] {
  const maxLength = Math.max(0, ...okProviders.map((id) => providerResults[id]?.series?.time.length ?? 0));
  const rows: TableRow[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const cells: Record<string, SeriesValue | undefined> = {};
    let time = '';
    const numeric: number[] = [];

    for (const providerId of okProviders) {
      const series = providerResults[providerId]?.series;
      const value = series?.values[index];
      cells[providerId] = value;
      if (!time && series?.time[index]) time = series.time[index] as string;
      if (typeof value === 'number') numeric.push(value);
    }

    const spread = numeric.length >= 2 ? Math.max(...numeric) - Math.min(...numeric) : undefined;
    const avg = numeric.length > 0 ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : undefined;
    rows.push({ time, cells, spread, avg });
  }

  return rows;
}

interface ComparisonTableProps {
  title: string;
  unit: string;
  providerResults: Record<string, ProviderVariableResult>;
  providerIds: string[];
}

function ComparisonTable({ title, unit, providerResults, providerIds }: ComparisonTableProps): JSX.Element {
  const okProviders = providerIds.filter((id) => providerResults[id]?.status === 'ok');
  const otherProviders = providerIds
    .filter((id) => providerResults[id]?.status !== 'ok')
    .map((id) => ({ id, result: providerResults[id] }));
  const rows = buildRows(providerResults, okProviders);
  const chartSeries = okProviders.map((id) => ({ id, label: PROVIDERS.find((candidate) => candidate.id === id)?.company ?? id }));

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-card shadow-card">
      <div className="border-b border-hairline px-4 py-3">
        <h2 className="text-sm font-semibold text-ink-primary">
          {title} {unit && <span className="font-normal text-ink-muted">({unit})</span>}
        </h2>
        <p className="text-xs text-ink-muted">
          {okProviders.length} provider{okProviders.length === 1 ? '' : 's'} reporting · {rows.length} time steps
        </p>
      </div>

      {okProviders.length > 0 && <ComparisonChart rows={rows} series={chartSeries} unit={unit} />}

      {otherProviders.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-hairline bg-surface-sunken px-4 py-2 text-xs text-ink-muted">
          {otherProviders.map(({ id, result }) => {
            const provider = PROVIDERS.find((candidate) => candidate.id === id);
            const label =
              result?.status === 'unavailable'
                ? 'no equivalent field'
                : result?.status === 'skipped'
                  ? 'no credentials saved'
                  : (result?.message ?? 'request failed');
            return (
              <span key={id}>
                <span className="font-medium">{provider?.company ?? id}</span>: {label}
              </span>
            );
          })}
        </div>
      )}

      {okProviders.length === 0 ? (
        <p className="px-4 py-4 text-sm text-ink-muted">No provider returned data for this variable.</p>
      ) : (
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-surface-sunken">
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-surface-sunken px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">
                  Time
                </th>
                {okProviders.map((id) => (
                  <th key={id} scope="col" className="whitespace-nowrap px-3 py-2 text-right font-semibold uppercase tracking-wide text-ink-muted">
                    {PROVIDERS.find((candidate) => candidate.id === id)?.company ?? id}
                  </th>
                ))}
                {okProviders.length >= 2 && (
                  <>
                    <th scope="col" className="whitespace-nowrap px-3 py-2 text-right font-semibold uppercase tracking-wide text-ink-muted">
                      Spread
                    </th>
                    <th scope="col" className="whitespace-nowrap px-3 py-2 text-right font-semibold uppercase tracking-wide text-ink-muted">
                      Avg
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-hairline">
                  <td className="sticky left-0 bg-surface-card px-3 py-1.5 font-mono tabular-nums text-ink-secondary">{row.time || '—'}</td>
                  {okProviders.map((id) => (
                    <td
                      key={id}
                      title={providerResults[id]?.series?.time[index]}
                      className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-ink-primary"
                    >
                      {row.cells[id] ?? '—'}
                    </td>
                  ))}
                  {okProviders.length >= 2 && (
                    <>
                      <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-ink-primary">
                        {row.spread !== undefined ? row.spread.toFixed(2) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-ink-primary">
                        {row.avg !== undefined ? row.avg.toFixed(2) : '—'}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Cross-provider comparison, distinct from the Testing page's per-provider
 * full-catalog exploration. Every provider names things differently, so
 * this runs off a small canonical variable set (comparisonVariables.ts)
 * mapped to each provider's own native field — a provider with no real
 * equivalent for a variable is left out of that table rather than faked.
 * Rows are aligned by position, not a shared absolute timestamp (providers
 * report in different timezone conventions); hover a cell to see that
 * provider's own reported time for it.
 */
export function ComparePage(): JSX.Element {
  const [latitude, setLatitude] = useState(38.4404);
  const [longitude, setLongitude] = useState(-122.7141);
  const [placeName, setPlaceName] = useState('Santa Rosa, California');

  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);
  const [selectedVariableKeys, setSelectedVariableKeys] = useState<string[]>(DEFAULT_VARIABLE_KEYS);
  const [forecastDays, setForecastDays] = useState(2);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<ComparisonResults | undefined>(undefined);
  const [ranProviderIds, setRanProviderIds] = useState<string[]>([]);

  function handleLocationSelect(location: GeocodingResult): void {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setPlaceName(`${location.name}${location.admin1 ? `, ${location.admin1}` : ''}`);
  }

  function toggleProvider(id: string): void {
    setSelectedProviderIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }

  function toggleVariable(key: string): void {
    setSelectedVariableKeys((prev) => (prev.includes(key) ? prev.filter((existing) => existing !== key) : [...prev, key]));
  }

  function handleRun(): void {
    if (selectedProviderIds.length === 0) {
      setError('Select at least one provider to compare.');
      return;
    }
    if (selectedVariableKeys.length === 0) {
      setError('Select at least one variable to compare.');
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setResults(undefined);
    runComparison({ latitude, longitude, providerIds: selectedProviderIds, variableKeys: selectedVariableKeys, forecastDays })
      .then((next) => {
        setResults(next);
        setRanProviderIds(selectedProviderIds);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Comparison failed to run.');
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <>
      <header className="border-b border-hairline bg-surface-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Run models against each other</p>
          <h1 className="text-2xl font-semibold text-ink-primary">Compare</h1>
          <p className="text-sm text-ink-secondary">
            One table per variable, one column per provider, same location and time window. Providers call out to
            their own real APIs here just like the Testing page — several are metered or billed per call, so only
            select the ones you actually want to spend a request on.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 rounded-xl border border-hairline bg-surface-card p-5 shadow-card">
          <LocationSearch onSelect={handleLocationSelect} />

          <div className="flex flex-col gap-1 border-t border-hairline pt-5">
            <label htmlFor="compare-forecast-days" className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Forecast days
            </label>
            <input
              id="compare-forecast-days"
              type="number"
              min={1}
              max={10}
              value={forecastDays}
              onChange={(event) => setForecastDays(Number(event.target.value))}
              className="w-24 rounded-md border border-hairline bg-surface-card px-2 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
            <p className="mt-1 text-xs text-ink-muted">
              Only honored by providers with a configurable range (Open-Meteo, Visual Crossing, Tomorrow.io) — the
              rest use their own fixed forecast window regardless.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-hairline pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Providers ({selectedProviderIds.length} of {IMPLEMENTED_PROVIDERS.length} selected)
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {IMPLEMENTED_PROVIDERS.map((provider) => {
                const missingCredentials = provider.requiresCredentials && !hasAllCredentials(provider);
                return (
                  <label key={provider.id} className="flex items-start gap-2 rounded-lg border border-hairline p-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedProviderIds.includes(provider.id)}
                      onChange={() => toggleProvider(provider.id)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-hairline text-accent-600 focus:ring-accent-500"
                    />
                    <span className="flex flex-col">
                      <span className="font-medium text-ink-primary">{provider.company}</span>
                      {missingCredentials && <span className="text-xs text-red-600">No key saved</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-hairline pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Variables ({selectedVariableKeys.length} of {COMPARISON_VARIABLES.length} selected)
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {COMPARISON_VARIABLES.map((variable) => {
                const coverageCount = Object.values(PROVIDER_VARIABLE_MAP[variable.key] ?? {}).filter(Boolean).length;
                return (
                  <label key={variable.key} className="flex items-center gap-2 text-sm text-ink-secondary">
                    <input
                      type="checkbox"
                      checked={selectedVariableKeys.includes(variable.key)}
                      onChange={() => toggleVariable(variable.key)}
                      className="h-3.5 w-3.5 rounded border-hairline text-accent-600 focus:ring-accent-500"
                    />
                    {variable.label}
                    <span className="text-xs text-ink-muted">({coverageCount}/{IMPLEMENTED_PROVIDERS.length} support it)</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-5">
            <button
              type="button"
              onClick={handleRun}
              disabled={isLoading}
              className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Running…' : 'Run comparison'}
            </button>
            <p className="text-xs text-ink-muted">
              Comparing at {placeName} ({latitude.toFixed(4)}, {longitude.toFixed(4)}).
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {results &&
          COMPARISON_VARIABLES.filter((variable) => selectedVariableKeys.includes(variable.key)).map((variable) => (
            <ComparisonTable
              key={variable.key}
              title={variable.label}
              unit={COMPARISON_UNITS[variable.key] ?? ''}
              providerResults={results[variable.key] ?? {}}
              providerIds={ranProviderIds}
            />
          ))}
      </main>
    </>
  );
}
