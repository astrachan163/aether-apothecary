import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { runInNewContext } from 'node:vm';

const filename = fileURLToPath(new URL('../functions/index.js', import.meta.url));
const localRequire = createRequire(filename);
const product = {
  name: 'Oil', shortDescription: 'A short note.', description: 'A longer note about the bottle.',
  imageUrl: '/images/products/oil.webp', price: 12, category: 'Oils', uses: ['physical'],
  ingredients: ['Olive'], sku: 'VHE-9', inventory: 3, active: true, published: true,
};
const owner = { uid: 'owner', token: { admin: true, email: 'strachan@uab.edu', email_verified: true } };

// Exercise the exported handler with cloud entry points and the document store
// substituted; no credentials, network, or Firebase project is used here.
function catalogHandler(initial: Record<string, unknown> | undefined) {
  let stored = initial;
  const document = {
    async set(data: Record<string, unknown>, options?: { merge?: boolean }) {
      stored = options?.merge ? { ...stored, ...data } : { ...data };
    },
  };
  class HttpsError extends Error {
    constructor(public code: string, message: string) { super(message); }
  }
  const app = { firestore: () => ({ doc: () => document }) };
  const mocks: Record<string, unknown> = {
    'firebase-functions/v2/https': { onCall: (_options: unknown, handler: unknown) => handler, onRequest: () => undefined, HttpsError },
    'firebase-functions/v2/scheduler': { onSchedule: () => undefined },
    'firebase-functions/params': { defineSecret: () => ({ value: () => undefined }) },
    'firebase-functions/v2': { setGlobalOptions: () => undefined },
    'firebase-admin': { apps: [app], app: () => app },
    stripe: class {},
  };
  const entry = { exports: {} as Record<string, (request: unknown) => Promise<unknown>> };
  runInNewContext(readFileSync(filename, 'utf8'), {
    require: (name: string) => name in mocks ? mocks[name] : localRequire(name),
    module: entry, exports: entry.exports, __dirname: dirname(filename), process: { env: {} },
  }, { filename });
  return { save: entry.exports.saveCatalogItem, stored: () => stored };
}

describe('admin catalog persistence', () => {
  it('keeps the server Stripe mapping when an owner edits a product', async () => {
    const handler = catalogHandler({ ...product, id: '1', stripePriceId: 'price_server' });
    await handler.save({ auth: owner, data: { kind: 'products', id: '1', data: { ...product, name: 'Updated oil', stripePriceId: 'price_caller' } } });
    expect(handler.stored()).toMatchObject({ name: 'Updated oil', price: 12, stripePriceId: 'price_server' });
  });

  it('does not accept a caller Stripe mapping for a new product', async () => {
    const handler = catalogHandler(undefined);
    await handler.save({ auth: owner, data: { kind: 'products', id: '1', data: { ...product, stripePriceId: 'price_caller' } } });
    expect(handler.stored()).not.toHaveProperty('stripePriceId');
  });

  it('continues to reject an admin claim without the verified owner identity', async () => {
    const handler = catalogHandler({ ...product, stripePriceId: 'price_server' });
    await expect(handler.save({ auth: { uid: 'other', token: { admin: true } }, data: { kind: 'products', id: '1', data: product } })).rejects.toMatchObject({ code: 'permission-denied' });
    expect(handler.stored()).toMatchObject({ stripePriceId: 'price_server' });
  });
});
