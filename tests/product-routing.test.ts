import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard } from '../src/components/products/ProductCard';
import ProductDetail from '../src/app/products/[id]/product-detail';
import { mockProducts } from '../src/data/products';

const customId = 'existing-catalog-id';
vi.mock('next/navigation', () => ({ useParams: () => ({ id: '1' }), notFound: () => { throw new Error('unexpected notFound'); } }));
vi.mock('../src/contexts/DataContext', () => ({ useData: () => ({ catalogStatus: 'ready', getProducts: () => [...mockProducts, { ...mockProducts[0], id: 'existing-catalog-id', name: 'Catalog item' }], getStories: () => [] }) }));
vi.mock('../src/components/checkout/CheckoutActions', () => ({ CheckoutActions: () => null }));

describe('static catalog detail fallback', () => {
  it('keeps all exported sample links and sends other catalog IDs to the static query page', () => {
    for (const sample of mockProducts) {
      expect(renderToStaticMarkup(React.createElement(ProductCard, { product: sample }))).toContain(`href="/products/${sample.id}"`);
    }
    expect(renderToStaticMarkup(React.createElement(ProductCard, { product: { ...mockProducts[0], id: customId } }))).toContain(`href="/product?id=${customId}"`);
  });

  it('uses the same detail for a selected catalog ID with its unchanged price', () => {
    const html = renderToStaticMarkup(React.createElement(ProductDetail as React.ComponentType<{ productId: string | null }>, { productId: customId }));
    expect(html).toContain('Catalog item');
    expect(html).toContain(`$${mockProducts[0].price.toFixed(2)}`);
  });

  it('shows missing, malformed and unknown selections as unavailable without substituting a sample', () => {
    for (const productId of [null, '', '../other', 'unknown-id']) {
      const html = renderToStaticMarkup(React.createElement(ProductDetail as React.ComponentType<{ productId: string | null }>, { productId }));
      expect(html).toContain('Product unavailable');
      expect(html).not.toContain(mockProducts[0].name);
    }
  });
});
