import { expect, it, vi } from 'vitest';

it('keeps both actual legacy generation exports offline without a provider or network call', async () => {
  const network = vi.fn(() => { throw new Error('Unexpected network request'); });
  vi.stubGlobal('fetch', network);
  try {
    const { ai } = await import('../src/ai/genkit');
    const generate = vi.spyOn(ai, 'generate');
    const { generateProductImages } = await import('../src/ai/flows/generate-product-images');
    const { generateProductDescription } = await import('../src/ai/flows/generate-product-description');
    expect(ai.options.plugins).toEqual([]);
    await expect(generateProductImages({ name: 'Example', description: 'Example' })).rejects.toThrow('unavailable');
    await expect(generateProductDescription({ name: 'Example', shortDescription: 'Example', keywords: 'Example' })).rejects.toThrow('unavailable');
    expect(generate).not.toHaveBeenCalled();
    expect(network).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); vi.restoreAllMocks(); }
});
