import type { WeatherProvider } from '../types';

/**
 * Per-provider API credentials, stored in this browser's localStorage only —
 * never sent anywhere except directly to that provider's own API domain
 * from the client that queries it. Nothing here talks to a backend of ours,
 * because this app doesn't have one; that's a deliberate scope choice, not
 * an oversight (see the NVIDIA Earth-2 entry in the provider registry for
 * why some providers can't work that way at all).
 */

const STORAGE_PREFIX = 'climformatics-model-hub:credential:';

function storageKey(providerId: string, fieldKey: string): string {
  return `${STORAGE_PREFIX}${providerId}:${fieldKey}`;
}

export function getCredential(providerId: string, fieldKey: string): string {
  return localStorage.getItem(storageKey(providerId, fieldKey)) ?? '';
}

export function setCredential(providerId: string, fieldKey: string, value: string): void {
  const key = storageKey(providerId, fieldKey);
  if (value.trim().length > 0) localStorage.setItem(key, value);
  else localStorage.removeItem(key);
}

export function hasAllCredentials(provider: WeatherProvider): boolean {
  if (!provider.requiresCredentials) return true;
  return provider.credentialFields.every((field) => getCredential(provider.id, field.key).length > 0);
}
