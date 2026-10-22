import { describe, expect, it } from 'vitest';
import { assertAllowlistedPrice, assertCheckoutItem, validateCatalogItem } from '../functions/catalog-item.js';
import { commitSandboxItem } from '../functions/sandbox-write.js';

const product = {
  name: 'Oil',
  shortDescription: 'A short note.',
  description: 'A longer note about the bottle.',
  imageUrl: '/images/products/oil.webp',
  price: 12,
  category: 'Oils',
  uses: ['physical'],
  ingredients: ['Olive'],
  sku: 'VHE-9',
  inventory: 3,
  active: true,
  published: true,
};

describe('catalog validation', () => {
  it('rejects nested values, bad kinds, and non-numeric prices', () => {
    expect(() => validateCatalogItem('nope', '1', product)).toThrow(/kind/);
    expect(() => validateCatalogItem('products', '../x', product)).toThrow(/id/);
    expect(() => validateCatalogItem('products', '1', { ...product, price: '12' })).toThrow(/price/);
    expect(() => validateCatalogItem('products', '1', { ...product, name: { nested: true } })).toThrow(/nesting/);
    expect(validateCatalogItem('products', '1', product).price).toBe(12);
  });

  it('rejects a bad quantity and a price that is not allowlisted', () => {
    expect(() => assertCheckoutItem({ id: '1', qty: 1.5 })).toThrow(/quantity/);
    expect(() => assertCheckoutItem({ id: '1', qty: 0 })).toThrow(/quantity/);
    expect(assertCheckoutItem({ id: '1', qty: 2 })).toEqual({ id: '1', qty: 2 });
    expect(() => assertAllowlistedPrice('price_other', new Set(['price_ok']))).toThrow(/price/);
    expect(assertAllowlistedPrice('price_ok', new Set(['price_ok']))).toBe('price_ok');
  });

  it('writes demo items with the user token, not an admin client', async () => {
    const calls: { url: string; authorization?: string }[] = [];
    const fetchImpl = async (url: string, init?: { headers?: Record<string, string> }) => {
      calls.push({ url, authorization: init?.headers?.authorization });
      if (String(url).endsWith('/counters/docs')) {
        return { ok: true, status: 200, json: async () => ({ fields: { count: { integerValue: '3' } } }) };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    };
    const status = await commitSandboxItem({
      token: 'user-token',
      projectId: 'aether-apothecary',
      uid: 'demo_store-admin_abcdabcdabcdabcd',
      kind: 'products',
      id: '1',
      data: validateCatalogItem('products', '1', product),
      fetchImpl,
    });
    expect(status).toBe(200);
    expect(calls.every((call) => call.authorization === 'Bearer user-token')).toBe(true);
    expect(calls.some((call) => call.url.includes(':commit'))).toBe(true);
  });
});

describe('sandbox saves', () => {
  function store(count: number, exists: boolean) {
    let saved: Record<string, unknown> | undefined = exists ? { name: 'Original oil' } : undefined;
    const fetchImpl = async (url: string, init?: { body?: string }) => {
      if (url.endsWith('/counters/docs')) return { ok: true, status: 200, json: async () => ({ fields: { count: { integerValue: String(count) } } }) };
      if (!url.endsWith(':commit')) return { ok: exists, status: exists ? 200 : 404, json: async () => ({}) };
      const { writes } = JSON.parse(init!.body!);
      for (const write of writes) {
        if (write.update.name.endsWith('/counters/docs')) count = Number(write.update.fields.count.integerValue);
        else saved = write.update.fields;
      }
      return { ok: true, status: 200, json: async () => ({}) };
    };
    return { fetchImpl, count: () => count, saved: () => saved };
  }
  async function save(state: ReturnType<typeof store>) {
    return commitSandboxItem({ token: 'user-token', projectId: 'aether-apothecary', uid: 'demo_store-admin_abcdabcdabcdabcd', kind: 'products', id: '1', data: validateCatalogItem('products', '1', product), fetchImpl: state.fetchImpl });
  }

  it('updates an existing item without consuming another lifetime slot', async () => {
    const state = store(199, true);
    expect(await save(state)).toBe(200);
    expect(state.count()).toBe(199);
    expect(state.saved()).toHaveProperty('name.stringValue', 'Oil');
  });

  it('allows editing an existing item at the 200-slot cap', async () => {
    const state = store(200, true);
    expect(await save(state)).toBe(200);
    expect(state.count()).toBe(200);
    expect(state.saved()).toHaveProperty('name.stringValue', 'Oil');
  });

  it('counts a new item once and rejects a new item after 200 slots', async () => {
    const available = store(199, false);
    expect(await save(available)).toBe(200);
    expect(available.count()).toBe(200);
    const full = store(200, false);
    expect(await save(full)).toBe(409);
    expect(full.saved()).toBeUndefined();
    expect(full.count()).toBe(200);
  });
});
