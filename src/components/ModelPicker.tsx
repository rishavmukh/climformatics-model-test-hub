import { OPEN_METEO_MODELS, OPEN_METEO_MODEL_AGENCY_ORDER } from '../data/openMeteoModels';

export interface ModelPickerProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

/**
 * Multi-select over Open-Meteo's underlying NWP/AI models, grouped by
 * originating agency. Selecting 2+ here is how this hub actually compares
 * models against each other — Open-Meteo suffixes every series with the
 * model name once more than one is picked (see openMeteoClient.ts).
 */
export function ModelPicker({ selected, onChange }: ModelPickerProps): JSX.Element {
  const selectedSet = new Set(selected);
  const byAgency = new Map<string, typeof OPEN_METEO_MODELS>();
  for (const model of OPEN_METEO_MODELS) {
    const bucket = byAgency.get(model.agency) ?? [];
    bucket.push(model);
    byAgency.set(model.agency, bucket);
  }

  function toggle(key: string): void {
    onChange(selectedSet.has(key) ? selected.filter((existing) => existing !== key) : [...selected, key]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Weather models ({selected.length === 0 ? 'best_match default' : `${selected.length} selected`})
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(['best_match'])}
            className="text-xs font-medium text-accent-600 hover:text-accent-700"
          >
            Default only
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-medium text-ink-muted hover:text-ink-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        None selected uses Open-Meteo&apos;s best_match aggregator. Pick two or more to compare models
        side by side — each variable then comes back once per model.
      </p>

      <div className="flex max-h-80 flex-col gap-4 overflow-y-auto rounded-lg border border-hairline bg-surface-sunken p-3">
        {OPEN_METEO_MODEL_AGENCY_ORDER.filter((agency) => byAgency.has(agency)).map((agency) => (
          <div key={agency}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{agency}</p>
            <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {(byAgency.get(agency) ?? []).map((model) => (
                <label key={model.key} className="flex items-center gap-2 text-xs text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(model.key)}
                    onChange={() => toggle(model.key)}
                    className="h-3.5 w-3.5 rounded border-hairline text-accent-600 focus:ring-accent-500"
                  />
                  {model.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
