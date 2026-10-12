import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, describe, it } from 'vitest';

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
      await context.firestore().doc(`sandboxes/${uid}/counters/docs`).set({ ids: [] });
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
    const uid = 'demo_store-admin_abcdabcdabcdabcd';
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
      await context.firestore().doc(`sandboxes/${uid}/counters/docs`).set({ ids: [] });
    });
    const demo = env.authenticatedContext(uid, { demo: true, role: 'store-admin' });
    await assertFails(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/9`).set(product));
    const batch = demo.firestore().batch();
    batch.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/9`), product);
    batch.update(demo.firestore().doc(`sandboxes/${uid}/counters/docs`), { ids: ['products/9'] });
    await assertSucceeds(batch.commit());
    const nested = { ...product, id: '10', name: { nested: true } };
    const bad = demo.firestore().batch();
    bad.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/10`), nested);
    bad.update(demo.firestore().doc(`sandboxes/${uid}/counters/docs`), { ids: ['products/9', 'products/10'] });
    await assertFails(bad.commit());
    const both = demo.firestore().batch();
    both.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/11`), { ...product, id: '11' });
    both.set(demo.firestore().doc(`sandboxes/${uid}/catalog/products/items/12`), { ...product, id: '12' });
    both.update(demo.firestore().doc(`sandboxes/${uid}/counters/docs`), { ids: ['products/9', 'products/11'] });
    await assertFails(both.commit());
  });
});
