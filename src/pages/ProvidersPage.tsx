import { ExternalLink } from 'lucide-react';
import { PROVIDERS } from '../data/providers';
import type { ProviderVariables, VariableAvailability, WeatherProvider } from '../types';

const VARIABLE_DEFS: Array<{ key: keyof ProviderVariables; short: string; label: string }> = [
  { key: 'temperature', short: 'Temp', label: 'Temperature' },
  { key: 'windSpeedDirection', short: 'Wind', label: 'Wind speed & direction' },
  { key: 'humidity', short: 'RH', label: 'Relative humidity' },
  { key: 'precipitation', short: 'Precip', label: 'Precipitation' },
  { key: 'cloudCover', short: 'Cloud', label: 'Cloud cover' },
  { key: 'pressure', short: 'Pres', label: 'Pressure' },
  { key: 'shortwaveRadiation', short: 'GHI', label: 'Shortwave radiation (GHI)' },
  { key: 'directNormalIrradiance', short: 'DNI', label: 'Direct normal irradiance' },
  { key: 'diffuseHorizontalIrradiance', short: 'DHI', label: 'Diffuse horizontal irradiance' },
  { key: 'uvIndex', short: 'UV', label: 'UV index' },
];

function VariableCell({ value, label }: { value: VariableAvailability; label: string }): JSX.Element {
  if (value === true) {
    return (
      <span
        title={`${label}: confirmed included`}
        className="inline-flex h-5 w-5 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700"
      >
        ✓
      </span>
    );
  }
  if (value === false) {
    return (
      <span
        title={`${label}: confirmed not included`}
        className="inline-flex h-5 w-5 items-center justify-center rounded border border-hairline bg-surface-sunken text-[10px] font-bold text-ink-muted"
      >
        –
      </span>
    );
  }
  return (
    <span
      title={`${label}: unverified — research hasn't confirmed either way`}
      className="inline-flex h-5 w-5 items-center justify-center rounded border border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-800"
    >
      ?
    </span>
  );
}

function countByAvailability(providers: WeatherProvider[], key: keyof ProviderVariables): { yes: number; unverified: number } {
  let yes = 0;
  let unverified = 0;
  for (const provider of providers) {
    const value = provider.variables[key];
    if (value === true) yes += 1;
    else if (value === 'unverified') unverified += 1;
  }
  return { yes, unverified };
}

function ProviderMatrix({ providers }: { providers: WeatherProvider[] }): JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-sunken">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-surface-sunken px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">
                Provider
              </th>
              {VARIABLE_DEFS.map((def) => (
                <th
                  key={def.key}
                  scope="col"
                  title={def.label}
                  className="px-1.5 py-2 text-center font-semibold uppercase tracking-wide text-ink-muted"
                >
                  {def.short}
                </th>
              ))}
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Access</th>
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Pricing</th>
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Status</th>
              <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wide text-ink-muted">Docs</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.id} className="border-t border-hairline align-top">
                <td className="sticky left-0 z-10 bg-surface-card px-3 py-2.5">
                  <p className="font-medium text-ink-primary">{provider.name}</p>
                  <p className="text-[11px] text-ink-muted">{provider.company}</p>
                  <p className="mt-1 max-w-xs text-[11px] text-ink-secondary">{provider.description}</p>
                </td>
                {VARIABLE_DEFS.map((def) => (
                  <td key={def.key} className="px-1.5 py-2.5 text-center">
                    <VariableCell value={provider.variables[def.key]} label={def.label} />
                  </td>
                ))}
                <td className="px-3 py-2.5 text-ink-secondary">
                  {provider.requiresCredentials
                    ? provider.credentialFields.map((field) => field.label).join(' + ')
                    : 'Keyless'}
                </td>
                <td className="max-w-xs px-3 py-2.5 text-ink-secondary">{provider.pricingNote}</td>
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
  const withRadiation = PROVIDERS.filter((provider) => provider.variables.shortwaveRadiation !== false);
  const withoutRadiation = PROVIDERS.filter((provider) => provider.variables.shortwaveRadiation === false);

  return (
    <>
      <header className="border-b border-hairline bg-surface-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Weather model &amp; provider catalog
          </p>
          <h1 className="text-2xl font-semibold text-ink-primary">Climformatics Model Test Hub</h1>
          <p className="text-sm text-ink-secondary">
            {PROVIDERS.length} providers surveyed across {VARIABLE_DEFS.length} variables — {withRadiation.length}
            {' '}include shortwave radiation (GHI/DNI/DHI), {withoutRadiation.length} don&apos;t. Only Open-Meteo
            has a working client so far; everything else is sourced research, ready to wire in.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink-primary">Full variable matrix ({PROVIDERS.length} providers)</h2>
            <p className="text-[11px] text-ink-muted">✓ confirmed included · – confirmed absent · ? unverified</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-muted">
            {VARIABLE_DEFS.map((def) => {
              const { yes, unverified } = countByAvailability(PROVIDERS, def.key);
              return (
                <span key={def.key} title={def.label}>
                  <span className="font-semibold text-ink-secondary">{def.short}</span>: {yes}/{PROVIDERS.length}
                  {unverified > 0 ? ` (+${unverified} unverified)` : ''}
                </span>
              );
            })}
          </div>
          <ProviderMatrix providers={PROVIDERS} />
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">Includes shortwave radiation ({withRadiation.length})</h2>
            <p className="text-xs text-ink-muted">GHI, DNI, or DHI confirmed (or default-included for the free Open-Meteo baseline).</p>
          </div>
          <ProviderMatrix providers={withRadiation} />
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">No shortwave radiation ({withoutRadiation.length})</h2>
            <p className="text-xs text-ink-muted">General NWP/AI model access — temperature, wind, pressure, precipitation, etc.</p>
          </div>
          <ProviderMatrix providers={withoutRadiation} />
        </section>
      </main>
    </>
  );
}
