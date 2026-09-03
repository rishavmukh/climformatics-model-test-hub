import type { OpenMeteoVariableDef } from '../data/openMeteoVariables';

export interface VariablePickerProps {
  title: string;
  variables: OpenMeteoVariableDef[];
  categoryOrder: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/**
 * Grouped checkbox grid over an Open-Meteo variable catalog (hourly or
 * daily). Shared by both blocks on the Dashboard so "show every variable
 * the model provides" means the same picker either way, not two bespoke UIs.
 */
export function VariablePicker({ title, variables, categoryOrder, selected, onChange }: VariablePickerProps): JSX.Element {
  const selectedSet = new Set(selected);
  const byCategory = new Map<string, OpenMeteoVariableDef[]>();
  for (const variable of variables) {
    const bucket = byCategory.get(variable.category) ?? [];
    bucket.push(variable);
    byCategory.set(variable.category, bucket);
  }

  function toggle(key: string): void {
    onChange(selectedSet.has(key) ? selected.filter((existing) => existing !== key) : [...selected, key]);
  }

  function setCategory(categoryKeys: string[], checked: boolean): void {
    const withoutCategory = selected.filter((key) => !categoryKeys.includes(key));
    onChange(checked ? [...withoutCategory, ...categoryKeys] : withoutCategory);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {title} ({selected.length} of {variables.length} selected)
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(variables.map((variable) => variable.key))}
            className="text-xs font-medium text-accent-600 hover:text-accent-700"
          >
            Select all
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

      <div className="flex max-h-80 flex-col gap-4 overflow-y-auto rounded-lg border border-hairline bg-surface-sunken p-3">
        {categoryOrder
          .filter((category) => byCategory.has(category))
          .map((category) => {
            const categoryVariables = byCategory.get(category) ?? [];
            const categoryKeys = categoryVariables.map((variable) => variable.key);
            const allSelected = categoryKeys.every((key) => selectedSet.has(key));

            return (
              <div key={category}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{category}</p>
                  <button
                    type="button"
                    onClick={() => setCategory(categoryKeys, !allSelected)}
                    className="text-[11px] font-medium text-accent-600 hover:text-accent-700"
                  >
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryVariables.map((variable) => (
                    <label key={variable.key} className="flex items-center gap-2 text-xs text-ink-secondary">
                      <input
                        type="checkbox"
                        checked={selectedSet.has(variable.key)}
                        onChange={() => toggle(variable.key)}
                        className="h-3.5 w-3.5 rounded border-hairline text-accent-600 focus:ring-accent-500"
                      />
                      {variable.label}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
