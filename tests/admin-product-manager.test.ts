import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import AdminProductManager from '../src/components/admin/AdminProductManager';

vi.mock('../src/contexts/DataContext', () => ({
  useData: () => ({ products: [], getProducts: () => [], removeProduct: () => undefined }),
}));

describe('offline product creation', () => {
  it('renders product creation disabled with an explicit offline explanation', () => {
    const html = renderToStaticMarkup(React.createElement(AdminProductManager));
    const button = html.match(/<button\b[^>]*>[\s\S]*?Add New Product[\s\S]*?<\/button>/)?.[0];
    expect(button).toBeDefined();
    expect(button).toMatch(/\bdisabled=""/);
    expect(html).toContain('Adding products is offline in this build.');
  });
});
