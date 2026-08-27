import { useState } from 'react';
import { LocationSearch } from '../components/LocationSearch';
import { fetchOpenMeteoGhi, OpenMeteoRequestError } from '../api/openMeteoClient';
import { PROVIDERS } from '../data/providers';
import type { GeocodingResult } from '../types';
import type { OpenMeteoGhiResult } from '../api/openMeteoClient';

const IMPLEMENTED_PROVIDERS = PROVIDERS.filter((provider) => provider.implemented);

/**
 * The one page that actually calls a provider. Right now that's only
 * Open-Meteo — this exists to prove the harness (location search, run,
 * error handling, results table) works end to end, as the template every
 * future provider client gets wired into the same way.
 */
export function DashboardPage(): JSX.Element {
  const [latitude, setLatitude] = useState(38.4404);
  const [longitude, setLongitude] = useState(-122.7141);
  const [placeName, setPlaceName] = useState('Santa Rosa, California');
  const [forecastDays, setForecastDays] = useState(3);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<OpenMeteoGhiResult | undefined>(undefined);

  function handleLocationSelect(location: GeocodingResult): void {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setPlaceName(`${location.name}${location.admin1 ? `, ${location.admin1}` : ''}`);
  }

  function handleRun(): void {
    setIsLoading(true);
    setError(undefined);
    setResult(undefined);
    fetchOpenMeteoGhi(latitude, longitude, forecastDays)
      .then(setResult)
      .catch((err: unknown) => {
        const message = err instanceof OpenMeteoRequestError || err instanceof Error ? err.message : 'Request failed';
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <>
      <header className="border-b border-hairline bg-surface-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Run a test</p>
          <h1 className="text-2xl font-semibold text-ink-primary">Dashboard</h1>
          <p className="text-sm text-ink-secondary">
            {IMPLEMENTED_PROVIDERS.length} of {PROVIDERS.length} catalogued providers have a working
            client so far. As paid providers get wired in, they&apos;ll show up here as additional
            options, using whichever credentials are saved on the Settings page.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-5 rounded-xl border border-hairline bg-surface-card p-5 shadow-card">
          <LocationSearch onSelect={handleLocationSelect} />

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
            <button
              type="button"
              onClick={handleRun}
              disabled={isLoading}
              className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Running…' : 'Run test (Open-Meteo)'}
            </button>
          </div>

          <p className="text-xs text-ink-muted">
            Testing at {placeName} ({latitude.toFixed(4)}, {longitude.toFixed(4)}).
          </p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {result && (
          <div className="overflow-hidden rounded-xl border border-hairline bg-surface-card shadow-card">
            <div className="border-b border-hairline px-4 py-3">
              <h2 className="text-sm font-semibold text-ink-primary">
                Shortwave radiation (GHI) — {result.unit}
              </h2>
              <p className="text-xs text-ink-muted">{result.timezone}</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-surface-sunken">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Time</th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold uppercase tracking-wide text-ink-muted">
                      GHI ({result.unit})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.time.map((time, index) => (
                    <tr key={time} className="border-t border-hairline">
                      <td className="px-3 py-1.5 font-mono tabular-nums text-ink-secondary">{time}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-ink-primary">
                        {result.values[index] ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
