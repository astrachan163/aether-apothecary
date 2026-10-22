import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import AdminOrders from '../src/components/admin/AdminOrders';

const state = vi.hoisted(() => ({ isDemo: true, ordersStatus: 'ready', orders: [{ id: 'sample-order', name: 'Sample order', email: '', amountTotal: 0, sample: true }] }));
vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => state }));
vi.mock('../src/contexts/DataContext', () => ({ useData: () => state }));

describe('scoped order summaries', () => {
  it('labels demo orders as samples rather than customer orders', () => {
    const html = renderToStaticMarkup(React.createElement(AdminOrders));
    expect(html).toContain('Sample orders');
    expect(html).toContain('No customer orders or charges');
    expect(html).toContain('$0.00');
  });
  it('shows no order records when the connection is denied', () => {
    state.ordersStatus = 'error';
    const html = renderToStaticMarkup(React.createElement(AdminOrders));
    expect(html).toContain('Orders unavailable');
    expect(html).not.toContain('sample-order');
  });
});
