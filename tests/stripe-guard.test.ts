import { describe, expect, it } from 'vitest';
import Stripe from 'stripe';
import { acceptPublishableTestKey, assertSecretTestKey } from '../shared/stripe-public';
import { readWebhookEvent } from '../shared/stripe-webhook';
import { CHECKOUT_OFF_LABEL } from '../shared/notices';

describe('stripe test mode', () => {
  it('rejects a missing publishable key', () => {
    expect(acceptPublishableTestKey('')).toBeNull();
    expect(acceptPublishableTestKey(undefined)).toBeNull();
  });

  it('rejects a live publishable key', () => {
    const liveKey = ['pk', 'live', 'example'].join('_');
    expect(acceptPublishableTestKey(liveKey)).toBeNull();
  });

  it('accepts a test publishable key', () => {
    const testKey = ['pk', 'test', 'example'].join('_');
    expect(acceptPublishableTestKey(testKey)).toBe(testKey);
  });

  it('rejects a missing or live secret', () => {
    const liveKey = ['sk', 'live', 'example'].join('_');
    expect(() => assertSecretTestKey(undefined)).toThrow(/failed-precondition/);
    expect(() => assertSecretTestKey(liveKey)).toThrow(/failed-precondition/);
  });

  it('accepts a test secret', () => {
    const testKey = ['sk', 'test', 'example'].join('_');
    expect(() => assertSecretTestKey(testKey)).not.toThrow();
  });

  it('names the disabled checkout label', () => {
    expect(CHECKOUT_OFF_LABEL).toBe('Checkout is off today: no orders, no charges, and no card details are collected.');
  });

  it('rejects a bad webhook signature', () => {
    const payload = JSON.stringify({ id: 'evt_test', object: 'event' });
    expect(() => readWebhookEvent(payload, 't=1,v1=deadbeef', 'whsec_test_secret_value')).toThrow();
  });

  it('accepts a signature from the Stripe helper', () => {
    const payload = JSON.stringify({
      id: 'evt_test_signature',
      object: 'event',
      api_version: '2024-06-20',
      created: 1_700_000_000,
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test' } },
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
    });
    const stripe = new Stripe(['sk', 'test', 'example'].join('_'), { apiVersion: '2024-06-20' });
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test_secret_value' });
    const event = readWebhookEvent(payload, signature, 'whsec_test_secret_value');
    expect(event.type).toBe('checkout.session.completed');
  });
});
