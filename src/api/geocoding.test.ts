import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchLocations } from './geocoding';

const fetchMock = vi.fn();

describe('searchLocations', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty array without calling fetch for a query under 2 characters', async () => {
    const result = await searchLocations('s');
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns the results array from a successful response', async () => {
    const results = [{ id: 1, name: 'Santa Rosa', latitude: 38.44, longitude: -122.71, timezone: 'America/Los_Angeles' }];
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ results }) });

    expect(await searchLocations('santa rosa')).toEqual(results);
  });

  it('returns an empty array when the response has no results field', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    expect(await searchLocations('nowhere')).toEqual([]);
  });

  it('throws when the response is not ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) });
    await expect(searchLocations('santa rosa')).rejects.toThrow('status 500');
  });
});
