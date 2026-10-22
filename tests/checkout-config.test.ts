import { describe, expect, it } from 'vitest';
import { loadFunctions } from './helpers/load-functions';

function checkout(priceOverrides = {}, allowlist: unknown = ['price_server']) {
  let created = 0;
  const product = { published: true, active: true, inventory: 3, price: 16, stripePriceId: 'price_server' };
  const app = { firestore: () => ({ doc: () => ({ get: async () => ({ exists: true, data: () => product }) }) }) };
  class Stripe {
    prices = { retrieve: async () => ({ id: 'price_server', livemode: false, active: true, currency: 'usd', unit_amount: 1600, type: 'one_time', ...priceOverrides }) };
    checkout = { sessions: { create: async () => { created++; return { url: 'https://checkout.stripe.com/test' }; } } };
  }
  const handlers = loadFunctions({ app, Stripe, allowlist, secrets: { STRIPE_SECRET_KEY_TEST: ['sk', 'test', 'example'].join('_') } });
  return { create: handlers.createCheckoutSession, created: () => created };
}

describe('existing Stripe test configuration', () => {
  it.each([{ livemode: true }, { active: false }, { currency: 'eur' }, { unit_amount: 1700 }])('rejects a mismatched server Stripe price before creating checkout: %j', async mismatch => {
    const state = checkout(mismatch);
    await expect(state.create({ data: { items: [{ id: '1', qty: 1 }] } })).rejects.toMatchObject({ code: 'failed-precondition' });
    expect(state.created()).toBe(0);
  });

  it('keeps an empty allowlist checkout-off', async () => {
    const state = checkout({}, []);
    await expect(state.create({ data: { items: [{ id: '1', qty: 1 }] } })).rejects.toMatchObject({ code: 'failed-precondition' });
    expect(state.created()).toBe(0);
  });

  it('rejects duplicate configured IDs instead of silently accepting them', async () => {
    const state = checkout({}, ['price_server', 'price_server']);
    await expect(state.create({ data: { items: [{ id: '1', qty: 1 }] } })).rejects.toMatchObject({ code: 'failed-precondition' });
    expect(state.created()).toBe(0);
  });

  it('uses the existing matching test price without changing the catalog amount', async () => {
    const state = checkout();
    await expect(state.create({ data: { items: [{ id: '1', qty: 1 }] } })).resolves.toMatchObject({ url: 'https://checkout.stripe.com/test' });
    expect(state.created()).toBe(1);
  });
});
