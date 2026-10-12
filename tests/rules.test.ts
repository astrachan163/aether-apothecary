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
      await context.firestore().doc(`sandboxes/${uid}/counters/docs`).set({ count: 1 });
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
});
