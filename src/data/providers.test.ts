import { describe, expect, it } from 'vitest';
import { PROVIDERS, getProviderMeta } from './providers';

describe('PROVIDERS registry', () => {
  it('has no duplicate ids', () => {
    const ids = PROVIDERS.map((provider) => provider.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every provider that requires credentials at least one credential field', () => {
    for (const provider of PROVIDERS) {
      if (provider.requiresCredentials) {
        expect(provider.credentialFields.length).toBeGreaterThan(0);
      }
    }
  });

  it('gives every provider that requires no credentials an empty credential field list', () => {
    for (const provider of PROVIDERS) {
      if (!provider.requiresCredentials) {
        expect(provider.credentialFields).toEqual([]);
      }
    }
  });

  it('includes exactly the implemented providers with working clients today', () => {
    const implemented = PROVIDERS.filter((provider) => provider.implemented);
    expect(implemented.map((provider) => provider.id)).toEqual([
      'open-meteo',
      'visual-crossing-energy',
      'weatherbit',
      'accuweather-enterprise',
      'openweather-solar',
      'foreca',
      'athenium-atlas',
      'windy-point-forecast',
    ]);
  });

  it('every docsUrl is a well-formed https URL', () => {
    for (const provider of PROVIDERS) {
      expect(provider.docsUrl).toMatch(/^https:\/\//);
    }
  });
});

describe('getProviderMeta', () => {
  it('finds a known provider by id', () => {
    expect(getProviderMeta('open-meteo')?.name).toBe('Open-Meteo Forecast API');
  });

  it('returns undefined for an unknown id', () => {
    expect(getProviderMeta('not-a-real-provider')).toBeUndefined();
  });
});
