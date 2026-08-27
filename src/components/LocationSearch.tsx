import { useEffect, useRef, useState } from 'react';
import { searchLocations } from '../api/geocoding';
import type { GeocodingResult } from '../types';

export interface LocationSearchProps {
  onSelect: (result: GeocodingResult) => void;
}

const DEBOUNCE_MS = 350;

export function LocationSearch({ onSelect }: LocationSearchProps): JSX.Element {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (term.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      searchLocations(term)
        .then((found) => {
          setResults(found);
          setError(undefined);
          setIsOpen(true);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Location search failed');
        })
        .finally(() => setIsLoading(false));
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term]);

  function handleSelect(result: GeocodingResult): void {
    onSelect(result);
    setTerm(`${result.name}${result.admin1 ? `, ${result.admin1}` : ''}`);
    setIsOpen(false);
  }

  return (
    <div className="relative w-full max-w-xs">
      <label htmlFor="place-search" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Search a place
      </label>
      <input
        id="place-search"
        type="text"
        placeholder="e.g. Santa Rosa, CA"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        autoComplete="off"
        className="w-full rounded-md border border-hairline bg-surface-card px-3 py-2 text-sm text-ink-primary shadow-card focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
      />
      {isLoading && <p className="mt-1 text-xs text-ink-muted">Searching…</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-hairline bg-surface-card shadow-card">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent-50"
              >
                <span className="font-medium text-ink-primary">
                  {result.name}
                  {result.admin1 ? `, ${result.admin1}` : ''}
                  {result.country ? ` — ${result.country}` : ''}
                </span>
                <span className="text-xs text-ink-muted">
                  {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)} · {result.timezone}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
