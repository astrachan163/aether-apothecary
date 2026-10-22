import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMockUserToken } from '@firebase/util';
import { commitSandboxItem } from '../functions/sandbox-write.js';
import { validateCatalogItem } from '../functions/catalog-item.js';

const projectId = 'aether-apothecary-rules';
let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

describe('firestore rules', () => {
  it('saves through the user-token helper without charging updates another slot', async () => {
    const uid = 'demo_store-admin_abcdef0123456789';
    const product = {
      name: 'Oil', shortDescription: 'A short note.', description: 'A longer note about the bottle.',
      imageUrl: '/images/products/oil.webp', price: 12, category: 'Oils', uses: ['physical'],
      ingredients: ['Olive'], sku: 'VHE-9', inventory: 3, active: true, published: true,
    };
    await env.withSecurityRulesDisabled(async context => {
      await context.firestore().doc(`sandboxes/${uid}/counters/docs`).set({ count: 199 });
      await context.firestore().doc(`sandboxes/${uid}/catalog/products/items/1`).set(validateCatalogItem('products', '1', product));
    });
    const host = process.env.FIRESTORE_EMULATOR_HOST;
    if (!host) throw new Error('This regression requires the local Firestore emulator.');
    const token = createMockUserToken({ sub: uid, demo: true, role: 'store-admin' }, projectId);
    const fetchImpl = (url: string, init: RequestInit) => {
      if (!url.startsWith('https://firestore.googleapis.com/v1/')) throw new Error('Unexpected service.');
      return fetch(url.replace('https://firestore.googleapis.com', `http://${host}`), init);
    };
    const save = (id: string, name: string) => commitSandboxItem({
      token, projectId, uid, kind: 'products', id,
      data: validateCatalogItem('products', id, { ...product, name }), fetchImpl,
    });
    const demo = env.authenticatedContext(uid, { demo: true, role: 'store-admin' }).firestore();
    const count = async () => (await demo.doc(`sandboxes/${uid}/counters/docs`).get()).data()?.count;
    expect(await save('1', 'Updated oil')).toBe(200);
    expect(await count()).toBe(199);
    expect(await save('2', 'Second oil')).toBe(200);
    expect(await count()).toBe(200);
    expect(await save('1', 'Oil at full cap')).toBe(200);
    expect(await count()).toBe(200);
    expect((await demo.doc(`sandboxes/${uid}/catalog/products/items/1`).get()).data()?.name).toBe('Oil at full cap');
    expect(await save('3', 'Over cap')).toBe(409);
    expect((await demo.doc(`sandboxes/${uid}/catalog/products/items/3`).get()).exists).toBe(false);
  });

  it('lets the public read a published product and nobody write the catalog', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('catalog/products/items/1').set({ published: true, name: 'Oil' });
      await context.firestore().doc('catalog/products/items/2').set({ published: false, name: 'Hidden' });
    });
    const anon = env.unauthenticatedContext();
    await assertSucceeds(anon.firestore().doc('catalog/products/items/1').get());
    await assertFails(anon.firestore().doc('catalog/products/items/2').get());
    await assertFails(anon.firestore().doc('catalog/products/items/1').set({ published: true, name: 'Changed' }));
    const noClaim = env.authenticatedContext('plain-user', { email_verified: false });
    await assertFails(noClaim.firestore().doc('catalog/products/items/1').get());
  });

  it('keeps orders and org data away from demo users', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('orders/1').set({ email: 'buyer@example.com' });
      await context.firestore().doc('org/main').set({ secret: true });
    });
    const demo = env.authenticatedContext('demo_store-admin_abcdabcdabcdabcd', { demo: true, role: 'store-admin' });
    await assertFails(demo.firestore().doc('orders/1').get());
    await assertFails(demo.firestore().doc('org/main').get());
    await assertFails(demo.firestore().doc('orders/1').set({ email: 'x' }));
    const other = env.authenticatedContext('demo_store-admin_ffffeeeeddddcccc', { demo: true, role: 'store-admin' });
    await assertFails(other.firestore().doc('sandboxes/demo_store-admin_abcdabcdabcdabcd').get());
  });

  it('lets a demo user increment only its own AI counter', async () => {
    const uid = 'demo_store-admin_abcdabcdabcdabcd';
    await env.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc(`sandboxes/${uid}`).set({ aiCalls: 0, expiresAt: new Date() });
      await context.firestore().doc(`sandboxes/${uid}/counters/docs`).set({ count: 0 });
    });
    const demo = env.authenticatedContext(uid, { demo: true, role: 'store-admin' });
    await assertSucceeds(demo.firestore().doc(`sandboxes/${uid}`).update({ aiCalls: 1 }));
    await assertFails(demo.firestore().doc(`sandboxes/${uid}`).update({ aiCalls: 1 }));
    await assertFails(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/9`).set({
      id: '9',
      name: 'Oil',
      role: 'admin',
    }));
  });

  it('counts sandbox items and checks every product field', async () => {
    const uid = 'demo_store-admin_1111222233334444';
    const product = {
      id: '9',
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
    await env.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc(`sandboxes/${uid}/counters/docs`).set({ count: 0 });
    });
    const demo = env.authenticatedContext(uid, { demo: true, role: 'store-admin' });
    await assertFails(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/9`).set(product));
    const batch = demo.firestore().batch();
    batch.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/9`), product);
    batch.update(demo.firestore().doc(`sandboxes/${uid}/counters/docs`), { count: 1, kind: 'products', itemId: '9' });
    await assertSucceeds(batch.commit());
  });

  it('rejects dropping the count and then creating an item', async () => {
    const uid = 'demo_store-admin_2222333344445555';
    const product = {
      id: '2',
      name: 'Oil',
      shortDescription: 'A short note.',
      description: 'A longer note about the bottle.',
      imageUrl: '/images/products/oil.webp',
      price: 12,
      category: 'Oils',
      uses: ['physical'],
      ingredients: ['Olive'],
      sku: 'VHE-2',
      inventory: 3,
      active: true,
      published: true,
    };
    await env.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc(`sandboxes/${uid}/counters/docs`).set({ count: 1 });
      await context.firestore().doc(`sandboxes/${uid}/catalog/products/items/1`).set({ ...product, id: '1' });
    });
    const demo = env.authenticatedContext(uid, { demo: true, role: 'store-admin' });
    const dropped = demo.firestore().batch();
    dropped.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/2`), product);
    dropped.update(demo.firestore().doc(`sandboxes/${uid}/counters/docs`), { count: 1, kind: 'products', itemId: '2' });
    await assertFails(dropped.commit());
    const lowered = demo.firestore().batch();
    lowered.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/2`), product);
    lowered.update(demo.firestore().doc(`sandboxes/${uid}/counters/docs`), { count: 0, kind: 'products', itemId: '2' });
    await assertFails(lowered.commit());
  });

  it('rejects oversized and nested counter writes', async () => {
    const uid = 'demo_store-admin_3333444455556666';
    const product = {
      id: '3',
      name: 'Oil',
      shortDescription: 'A short note.',
      description: 'A longer note about the bottle.',
      imageUrl: '/images/products/oil.webp',
      price: 12,
      category: 'Oils',
      uses: ['physical'],
      ingredients: ['Olive'],
      sku: 'VHE-3',
      inventory: 3,
      active: true,
      published: true,
    };
    await env.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc(`sandboxes/${uid}/counters/docs`).set({ count: 200 });
    });
    const demo = env.authenticatedContext(uid, { demo: true, role: 'store-admin' });
    const over = demo.firestore().batch();
    over.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/3`), product);
    over.update(demo.firestore().doc(`sandboxes/${uid}/counters/docs`), { count: 201, kind: 'products', itemId: '3' });
    await assertFails(over.commit());
    await env.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc(`sandboxes/${uid}/counters/docs`).set({ count: 4 });
    });
    const jump = demo.firestore().batch();
    jump.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/3`), product);
    jump.update(demo.firestore().doc(`sandboxes/${uid}/counters/docs`), { count: 9, kind: 'products', itemId: '3' });
    await assertFails(jump.commit());
    const nested = demo.firestore().batch();
    nested.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/3`), product);
    nested.update(demo.firestore().doc(`sandboxes/${uid}/counters/docs`), { count: { value: 5 }, kind: 'products', itemId: '3' });
    await assertFails(nested.commit());
  });
});
