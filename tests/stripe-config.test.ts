import { expect, it } from 'vitest';
import { checkCatalogMappings } from '../functions/stripe-config';

it('keeps an empty allowlist disabled and validates mappings without changing prices', () => {
  expect(checkCatalogMappings([], [])).toEqual({ enabled: false, mappedProducts: 0 });
  const product = { published: true, active: true, inventory: 1, price: 16, stripePriceId: 'price_existing' };
  expect(checkCatalogMappings(['price_existing'], [product])).toEqual({ enabled: true, mappedProducts: 1 });
  expect(product.price).toBe(16);
  for (const price of [-1, 16.005]) {
    expect(() => checkCatalogMappings(['price_existing'], [{ ...product, price }])).toThrow();
  }
  expect(() => checkCatalogMappings(['price_other'], [product])).toThrow();
});
