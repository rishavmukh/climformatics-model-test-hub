import { useState } from 'react';
import { PROVIDERS } from '../data/providers';
import { getCredential, setCredential } from '../utils/credentials';

/**
 * Where credentials for paid providers get plugged in, once real clients
 * exist for them. Every value here lives only in this browser's
 * localStorage — nothing is sent anywhere except directly to that
 * provider's own API domain from whatever client eventually queries it.
 * Deliberately shows every provider that needs credentials, not just
 * implemented ones, so a key can be saved ahead of a client being wired in.
 */
export function SettingsPage(): JSX.Element {
  const credentialProviders = PROVIDERS.filter((provider) => provider.requiresCredentials);
  const [, forceRerender] = useState(0);

  function handleChange(providerId: string, fieldKey: string, value: string): void {
    setCredential(providerId, fieldKey, value);
    forceRerender((n) => n + 1);
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
        {credentialProviders.map((provider) => (
          <div key={provider.id} className="rounded-xl border border-hairline bg-surface-card p-5 shadow-card">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-ink-primary">{provider.name}</h2>
                <p className="text-xs text-ink-muted">{provider.company}</p>
              </div>
              {!provider.implemented && (
                <span className="inline-flex w-fit items-center rounded-full border border-hairline bg-surface-sunken px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                  No client yet — key saved for later
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
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
                    defaultValue={getCredential(provider.id, field.key)}
                    onChange={(event) => handleChange(provider.id, field.key, event.target.value)}
                    className="w-64 rounded-md border border-hairline bg-surface-card px-3 py-1.5 text-sm text-ink-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
