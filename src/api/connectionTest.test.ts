import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONNECTION_TESTERS } from './connectionTest';

const fetchMock = vi.fn();

describe('CONNECTION_TESTERS', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fails fast without making a request when the API key field is empty', async () => {
    const tester = CONNECTION_TESTERS['visual-crossing-energy'];
    const result = await tester?.({ apiKey: '' });

    expect(result?.ok).toBe(false);
    expect(result?.message).toContain('Enter an API key');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports success with a sample value when the live call succeeds', async () => {
    const body = {
      latitude: 38.44,
      longitude: -122.71,
      timezone: 'America/Los_Angeles',
      days: [{ datetime: '2026-09-02', hours: [{ datetime: '00:00:00', temp: 18.5 }] }],
    };
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

    const tester = CONNECTION_TESTERS['visual-crossing-energy'];
    const result = await tester?.({ apiKey: 'real-key' });

    expect(result?.ok).toBe(true);
    expect(result?.message).toContain('18.5');
  });

  it('reports failure with the provider error message when the key is rejected', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, text: () => Promise.resolve('No account found with API key') });

    const tester = CONNECTION_TESTERS['visual-crossing-energy'];
    const result = await tester?.({ apiKey: 'bad-key' });

    expect(result?.ok).toBe(false);
    expect(result?.message).toBe('No account found with API key');
  });
});
