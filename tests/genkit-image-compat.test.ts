import { afterEach, expect, it, vi } from 'vitest';
import '../src/ai/flows/generate-product-images';

const state = vi.hoisted(() => ({ response: { finishReason: 'stop', media: { url: 'data:image/png;base64,AA==' } }, flow: null as any }));
vi.mock('../src/ai/genkit', () => ({ ai: { defineFlow: (_config: unknown, handler: unknown) => { state.flow = handler; return handler; }, generate: async () => state.response } }));
afterEach(() => vi.restoreAllMocks());

it('reads the installed Genkit single-media response without changing provider/model configuration', async () => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const result = await state.flow({ name: 'Example product', description: 'Example description' });
  expect(result).toBe(state.response.media.url);
});

it('recognizes the installed lowercase blocked finish reason', async () => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  state.response.finishReason = 'blocked';
  await expect(state.flow({ name: 'Example product', description: 'Example description' })).rejects.toThrow('blocked for safety reasons');
});
