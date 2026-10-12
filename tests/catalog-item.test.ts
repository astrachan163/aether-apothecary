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
        return { ok: true, status: 200, json: async () => ({ fields: { ids: { arrayValue: { values: [] } } } }) };
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
