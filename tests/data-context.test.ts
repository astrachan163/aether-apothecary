import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { DataProvider, useData } from '../src/contexts/DataContext';

vi.mock('../src/lib/firebase', () => ({ getFirebase: () => null, protectedCallable: () => null }));
vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => ({ uid: null, isAdmin: false, isDemo: false, isLoading: false }) }));

describe('sample fallback', () => {
  it('starts explicitly offline and read-only with the existing prices and no customer orders', () => {
    function Consumer() {
      const data = useData();
      return React.createElement('p', null, `${data.catalogStatus}|${data.canPersist}|${data.getProducts()[0].price}|${data.orders?.length}`);
    }
    const html = renderToStaticMarkup(React.createElement(DataProvider, null, React.createElement(Consumer)));
    expect(html).toBe('<p>offline|false|22|0</p>');
  });
});
