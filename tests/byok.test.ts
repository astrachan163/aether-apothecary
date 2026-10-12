import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); },
    clear: () => data.clear(),
  };
};

describe('byok', () => {
  beforeEach(() => {
    vi.resetModules();
    const session = storage();
    const local = storage();
    vi.stubGlobal('sessionStorage', session);
    vi.stubGlobal('localStorage', local);
    vi.stubGlobal('window', { addEventListener: () => undefined });
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('keeps the key off non-Google origins, URLs, and logs', async () => {
    const calls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      calls.push(String(url));
      if (String(url).includes('/models')) {
        return new Response(JSON.stringify({
          models: [
            { name: 'models/gemini-3.8-flash', displayName: 'Flash', supportedGenerationMethods: ['generateContent'], inputTokenLimit: 1, outputTokenLimit: 1 },
            { name: 'models/gemini-1.5-flash', displayName: 'Old', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.0-flash', displayName: 'Retired', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/imagen-3.0-generate', displayName: 'Image', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-3.5-flash-tts', displayName: 'Speech', supportedGenerationMethods: ['generateContent'] },
          ],
        }), { status: 200 });
      }
      return new Response('no', { status: 404 });
    }));
    const byok = await import('../vendor/byok-gemini/core/index');
    const models = await byok.saveKey('test-key-value-1234', { remember: false });
    expect(models[0]?.id).toBe('gemini-3.8-flash');
    expect(models.some((model) => model.id.includes('imagen') || model.id.startsWith('gemini-1') || model.id.startsWith('gemini-2.0') || model.id.includes('tts'))).toBe(false);
    expect(calls.every((url) => url.startsWith('https://generativelanguage.googleapis.com') && !url.includes('key='))).toBe(true);
    const logged = vi.mocked(console.log).mock.calls.flat().join(' ');
    expect(logged.includes('test-key-value-1234')).toBe(false);
    expect(byok.scrub('leak test-key-value-1234')).toBe('leak [redacted]');
    byok.clear();
    expect(byok.getState().hasKey).toBe(false);
    expect(sessionStorage.getItem('maqkrs.byok.gemini.v1')).toBeNull();
    expect(localStorage.getItem('maqkrs.byok.gemini.v1')).toBeNull();
  });
});
