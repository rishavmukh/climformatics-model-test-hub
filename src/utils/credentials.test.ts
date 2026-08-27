import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getCredential, hasAllCredentials, setCredential } from './credentials';
import type { WeatherProvider } from '../types';

function buildProvider(overrides: Partial<WeatherProvider> = {}): WeatherProvider {
  return {
    id: 'test-provider',
    name: 'Test Provider',
    company: 'Test Co',
    description: '',
    variables: {
      temperature: 'unverified',
      windSpeedDirection: 'unverified',
      humidity: 'unverified',
      precipitation: 'unverified',
      cloudCover: 'unverified',
      pressure: 'unverified',
      shortwaveRadiation: 'unverified',
      directNormalIrradiance: 'unverified',
      diffuseHorizontalIrradiance: 'unverified',
      uvIndex: 'unverified',
    },
    requiresCredentials: true,
    credentialFields: [{ key: 'apiKey', label: 'API key', type: 'password' }],
    docsUrl: 'https://example.com',
    implemented: false,
    pricingNote: '',
    ...overrides,
  };
}

describe('credentials storage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('stores and retrieves a credential value scoped to provider and field', () => {
    setCredential('test-provider', 'apiKey', 'secret-123');
    expect(getCredential('test-provider', 'apiKey')).toBe('secret-123');
  });

  it('returns an empty string for a credential that was never set', () => {
    expect(getCredential('unknown-provider', 'apiKey')).toBe('');
  });

  it('removes the stored value when set to an empty string', () => {
    setCredential('test-provider', 'apiKey', 'secret-123');
    setCredential('test-provider', 'apiKey', '');
    expect(getCredential('test-provider', 'apiKey')).toBe('');
  });

  it('does not leak one provider\'s credential into another provider with the same field key', () => {
    setCredential('provider-a', 'apiKey', 'a-secret');
    setCredential('provider-b', 'apiKey', 'b-secret');
    expect(getCredential('provider-a', 'apiKey')).toBe('a-secret');
    expect(getCredential('provider-b', 'apiKey')).toBe('b-secret');
  });
});

describe('hasAllCredentials', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('is true for a provider that requires no credentials', () => {
    const provider = buildProvider({ requiresCredentials: false, credentialFields: [] });
    expect(hasAllCredentials(provider)).toBe(true);
  });

  it('is false when a required field has not been set', () => {
    const provider = buildProvider();
    expect(hasAllCredentials(provider)).toBe(false);
  });

  it('is true only once every required field is set', () => {
    const provider = buildProvider({
      credentialFields: [
        { key: 'username', label: 'Username', type: 'text' },
        { key: 'password', label: 'Password', type: 'password' },
      ],
    });
    setCredential('test-provider', 'username', 'me');
    expect(hasAllCredentials(provider)).toBe(false);
    setCredential('test-provider', 'password', 'hunter2');
    expect(hasAllCredentials(provider)).toBe(true);
  });
});
