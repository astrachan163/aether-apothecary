import { describe, expect, it, vi } from 'vitest';
import { catalogRoot, persistRemoval, projectProduct, projectOrder, watchStore, type CatalogReader } from '../src/lib/catalog-data';
import { mockProducts } from '../src/data/products';

const product = mockProducts[0];
const uid = 'demo_store-admin_0123456789abcdef';

describe('scoped catalog reads and removal', () => {
  it('projects public fields without exposing server Stripe mappings or private fields', () => {
    const projected = projectProduct({ id: product.id, data: { ...product, stripePriceId: 'price_private', private: 'hidden' } });
    expect(projected).toMatchObject({ id: product.id, name: product.name, price: product.price });
    expect(projected).not.toHaveProperty('stripePriceId');
    expect(projected).not.toHaveProperty('private');
    expect(projectOrder({ id: '1', data: { amountTotal: 1600, sample: true } }).sample).toBe(true);
  });

  it('keeps public readers out of orders and ignores callbacks after a catalog error', () => {
    const requests: any[] = [], callbacks: any[] = [];
    const events = { products: vi.fn(), stories: vi.fn(), ingredients: vi.fn(), orders: vi.fn(), ready: vi.fn(), error: vi.fn(), ordersError: vi.fn() };
    const read: CatalogReader = (request, next, error) => { requests.push(request); callbacks.push({ next, error }); return vi.fn(); };
    watchStore({ kind: 'public' }, read, events);
    expect(requests.map(request => request.path)).toEqual(['catalog/products/items', 'catalog/stories/items', 'catalog/ingredients/items']);
    expect(requests.every(request => request.publishedOnly)).toBe(true);
    callbacks[0].error();
    callbacks[1].next([]);
    expect(events.error).toHaveBeenCalledTimes(1);
    expect(events.stories).not.toHaveBeenCalled();
    expect(events.orders).not.toHaveBeenCalled();
  });

  it('stops even a synchronous denied subscription and reads only the current sandbox orders', () => {
    const stop = vi.fn(), events = { products: vi.fn(), stories: vi.fn(), ingredients: vi.fn(), orders: vi.fn(), ready: vi.fn(), error: vi.fn(), ordersError: vi.fn() };
    watchStore({ kind: 'public' }, (_request, _next, error) => { error(); return stop; }, events);
    expect(stop).toHaveBeenCalledTimes(1);
    const paths: string[] = [];
    watchStore({ kind: 'demo', uid }, request => { paths.push(request.path); return () => {}; }, events);
    expect(paths).toEqual(['products', 'stories', 'ingredients'].map(kind => `sandboxes/${uid}/catalog/${kind}/items`).concat(`sandboxes/${uid}/orders`));
    expect(() => catalogRoot({ kind: 'demo', uid: 'demo_other_0123456789abcdef' })).toThrow();
  });

  it('unpublishes an owner record through the existing save and awaits persistence', async () => {
    let finish!: (value: any) => void;
    const save = vi.fn((_request: any) => new Promise<{ data: { ok: boolean } }>(resolve => { finish = resolve; })), deleteDemo = vi.fn();
    let completed = false;
    const saving = persistRemoval({ kind: 'owner' }, 'products', product, { save, deleteDemo }).then(() => { completed = true; });
    expect(save.mock.calls[0][0]).toMatchObject({ kind: 'products', id: product.id, data: { published: false, price: product.price } });
    expect(completed).toBe(false);
    expect(deleteDemo).not.toHaveBeenCalled();
    finish({ data: { ok: true } });
    await saving;
    expect(completed).toBe(true);
  });

  it('does not report success on a rejected or unsuccessful save', async () => {
    const deleteDemo = vi.fn();
    await expect(persistRemoval({ kind: 'owner' }, 'products', product, { save: async () => { throw new Error('denied'); }, deleteDemo })).rejects.toThrow('denied');
    await expect(persistRemoval({ kind: 'owner' }, 'products', product, { save: async () => ({ data: { ok: false } }), deleteDemo })).rejects.toThrow();
    expect(deleteDemo).not.toHaveBeenCalled();
  });

  it('deletes only the demo item and refuses public or invalid-path removal', async () => {
    const paths: string[] = [];
    const transport = { save: vi.fn(), deleteDemo: async (path: string) => { paths.push(path); } };
    await persistRemoval({ kind: 'demo', uid }, 'products', product, transport);
    expect(paths).toEqual([`sandboxes/${uid}/catalog/products/items/${product.id}`]);
    expect(transport.save).not.toHaveBeenCalled();
    await expect(persistRemoval({ kind: 'public' }, 'products', product, transport)).rejects.toThrow();
    await expect(persistRemoval({ kind: 'demo', uid }, 'products', { ...product, id: '../foreign' }, transport)).rejects.toThrow();
  });
});
