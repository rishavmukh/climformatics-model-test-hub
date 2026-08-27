import { ExternalLink } from 'lucide-react';
import { PROVIDERS } from '../data/providers';
import type { WeatherProvider } from '../types';

function RadiationBadge({ value }: { value: WeatherProvider['includesShortwaveRadiation'] }): JSX.Element {
  if (value === true) {
    return (
      <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
        Yes
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex w-fit items-center rounded-full border border-hairline bg-surface-sunken px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
        No
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
      Unverified
    </span>
  );
}

function ProviderTable({ providers }: { providers: WeatherProvider[] }): JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-sunken">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Provider</th>
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Radiation</th>
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Access</th>
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Pricing</th>
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Status</th>
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Docs</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.id} className="border-t border-hairline align-top">
                <td className="px-3 py-2.5">
                  <p className="font-medium text-ink-primary">{provider.name}</p>
                  <p className="text-[11px] text-ink-muted">{provider.company}</p>
                  <p className="mt-1 max-w-xs text-[11px] text-ink-secondary">{provider.description}</p>
                </td>
                <td className="px-3 py-2.5">
                  <RadiationBadge value={provider.includesShortwaveRadiation} />
                </td>
                <td className="px-3 py-2.5 text-ink-secondary">
                  {provider.requiresCredentials
                    ? provider.credentialFields.map((field) => field.label).join(' + ')
                    : 'Keyless'}
                </td>
                <td className="px-3 py-2.5 max-w-xs text-ink-secondary">{provider.pricingNote}</td>
                <td className="px-3 py-2.5">
                  {provider.implemented ? (
                    <span className="inline-flex w-fit items-center rounded-full border border-accent-100 bg-accent-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-700">
                      Implemented
                    </span>
                  ) : (
                    <span className="inline-flex w-fit items-center rounded-full border border-hairline bg-surface-sunken px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                      Catalog only
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700"
                  >
                    Source <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProvidersPage(): JSX.Element {
  const withRadiation = PROVIDERS.filter((provider) => provider.includesShortwaveRadiation !== false);
  const withoutRadiation = PROVIDERS.filter((provider) => provider.includesShortwaveRadiation === false);

  return (
    <>
      <header className="border-b border-hairline bg-surface-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Weather model &amp; provider catalog
          </p>
          <h1 className="text-2xl font-semibold text-ink-primary">Climformatics Model Test Hub</h1>
          <p className="text-sm text-ink-secondary">
            {PROVIDERS.length} providers surveyed — {withRadiation.length} include shortwave radiation
            (GHI/DNI/DHI), {withoutRadiation.length} don&apos;t. Only Open-Meteo has a working client so
            far; everything else is sourced research, ready to wire in.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">Includes shortwave radiation ({withRadiation.length})</h2>
            <p className="text-xs text-ink-muted">GHI, DNI, or DHI confirmed (or default-included for the free Open-Meteo baseline).</p>
          </div>
          <ProviderTable providers={withRadiation} />
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">No shortwave radiation ({withoutRadiation.length})</h2>
            <p className="text-xs text-ink-muted">General NWP/AI model access — temperature, wind, pressure, precipitation, etc.</p>
          </div>
          <ProviderTable providers={withoutRadiation} />
        </section>
      </main>
    </>
  );
}
