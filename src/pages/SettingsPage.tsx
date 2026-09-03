import { useState } from 'react';
import { PROVIDERS } from '../data/providers';
import { getCredential, setCredential } from '../utils/credentials';
import { CONNECTION_TESTERS } from '../api/connectionTest';
import type { WeatherProvider } from '../types';

type FieldValues = Record<string, string>;
type ProviderValues = Record<string, FieldValues>;
type TestStatus = { status: 'testing' | 'success' | 'error'; message?: string };

function readStoredValues(providers: WeatherProvider[]): ProviderValues {
  const values: ProviderValues = {};
  for (const provider of providers) {
    const fieldValues: FieldValues = {};
    for (const field of provider.credentialFields) {
      fieldValues[field.key] = getCredential(provider.id, field.key);
    }
    values[provider.id] = fieldValues;
  }
  return values;
}

function hasAnyValue(fieldValues: FieldValues | undefined): boolean {
  return Object.values(fieldValues ?? {}).some((value) => value.length > 0);
}

function isDirty(draft: FieldValues | undefined, persisted: FieldValues | undefined): boolean {
  const keys = new Set([...Object.keys(draft ?? {}), ...Object.keys(persisted ?? {})]);
  for (const key of keys) {
    if ((draft?.[key] ?? '') !== (persisted?.[key] ?? '')) return true;
  }
  return false;
}

/**
 * Where credentials for paid providers get plugged in, once real clients
 * exist for them. Every value here lives only in this browser's
 * localStorage — nothing is sent anywhere except directly to that
 * provider's own API domain from whatever client eventually queries it.
 * Deliberately shows every provider that needs credentials, not just
 * implemented ones, so a key can be saved ahead of a client being wired in.
 *
 * Inputs are controlled + explicitly saved (not autosaved on every
 * keystroke) so there's a real "did this save?" signal — the previous
 * autosave-on-change version gave no feedback at all, which read as broken
 * even though the value was in fact reaching localStorage.
 */
export function SettingsPage(): JSX.Element {
  const credentialProviders = PROVIDERS.filter((provider) => provider.requiresCredentials);
  const [draftValues, setDraftValues] = useState<ProviderValues>(() => readStoredValues(credentialProviders));
  const [persistedValues, setPersistedValues] = useState<ProviderValues>(() => readStoredValues(credentialProviders));
  const [justSavedId, setJustSavedId] = useState<string | undefined>(undefined);
  const [testResults, setTestResults] = useState<Record<string, TestStatus>>({});

  function handleFieldChange(providerId: string, fieldKey: string, value: string): void {
    setDraftValues((prev) => ({ ...prev, [providerId]: { ...prev[providerId], [fieldKey]: value } }));
    if (justSavedId === providerId) setJustSavedId(undefined);
    setTestResults((prev) => {
      if (!(providerId in prev)) return prev;
      const next = { ...prev };
      delete next[providerId];
      return next;
    });
  }

  function handleSave(provider: WeatherProvider): void {
    const fieldValues = draftValues[provider.id] ?? {};
    for (const field of provider.credentialFields) {
      setCredential(provider.id, field.key, fieldValues[field.key] ?? '');
    }
    setPersistedValues((prev) => ({ ...prev, [provider.id]: { ...fieldValues } }));
    setJustSavedId(provider.id);
  }

  function handleTest(provider: WeatherProvider): void {
    const tester = CONNECTION_TESTERS[provider.id];
    if (!tester) return;

    setTestResults((prev) => ({ ...prev, [provider.id]: { status: 'testing' } }));
    tester(draftValues[provider.id] ?? {})
      .then((result) => {
        setTestResults((prev) => ({
          ...prev,
          [provider.id]: { status: result.ok ? 'success' : 'error', message: result.message },
        }));
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Request failed';
        setTestResults((prev) => ({ ...prev, [provider.id]: { status: 'error', message } }));
      });
  }

  return (
    <>
      <header className="border-b border-hairline bg-surface-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Credentials</p>
          <h1 className="text-2xl font-semibold text-ink-primary">Settings</h1>
          <p className="text-sm text-ink-secondary">
            Stored only in this browser&apos;s local storage. Nothing here is sent anywhere except
            directly to each provider&apos;s own API, and only once a real client exists for that
            provider — most of the list below is catalog-only today (see the Providers page).
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
        {credentialProviders.map((provider) => {
          const draft = draftValues[provider.id];
          const persisted = persistedValues[provider.id];
          const dirty = isDirty(draft, persisted);
          const saved = hasAnyValue(persisted);
          const canTest = provider.id in CONNECTION_TESTERS;
          const testResult = testResults[provider.id];

          return (
            <div key={provider.id} className="rounded-xl border border-hairline bg-surface-card p-5 shadow-card">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-ink-primary">{provider.name}</h2>
                  <p className="text-xs text-ink-muted">{provider.company}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      saved
                        ? 'border-accent-100 bg-accent-50 text-accent-700'
                        : 'border-hairline bg-surface-sunken text-ink-muted'
                    }`}
                  >
                    {saved ? 'Key saved' : 'No key saved'}
                  </span>
                  {!provider.implemented && (
                    <span className="inline-flex w-fit items-center rounded-full border border-hairline bg-surface-sunken px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                      No client yet
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                {provider.credentialFields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1">
                    <label
                      htmlFor={`${provider.id}-${field.key}`}
                      className="text-xs font-medium text-ink-secondary"
                    >
                      {field.label}
                    </label>
                    <input
                      id={`${provider.id}-${field.key}`}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={draft?.[field.key] ?? ''}
                      onChange={(event) => handleFieldChange(provider.id, field.key, event.target.value)}
                      className="w-64 rounded-md border border-hairline bg-surface-card px-3 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleSave(provider)}
                  disabled={!dirty}
                  className="rounded-md bg-accent-600 px-3 py-1.5 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save
                </button>
                {!dirty && justSavedId === provider.id && (
                  <span className="text-xs font-medium text-accent-700">Saved ✓</span>
                )}
                {canTest && (
                  <button
                    type="button"
                    onClick={() => handleTest(provider)}
                    disabled={testResult?.status === 'testing' || !hasAnyValue(draft)}
                    className="rounded-md border border-hairline px-3 py-1.5 text-sm font-medium text-ink-secondary shadow-card transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {testResult?.status === 'testing' ? 'Testing…' : 'Test key'}
                  </button>
                )}
              </div>
              {canTest && testResult && testResult.status !== 'testing' && (
                <p
                  className={`mt-2 text-xs font-medium ${
                    testResult.status === 'success' ? 'text-accent-700' : 'text-red-600'
                  }`}
                >
                  {testResult.status === 'success' ? '✓ ' : '✗ '}
                  {testResult.message}
                </p>
              )}
            </div>
          );
        })}
      </main>
    </>
  );
}
