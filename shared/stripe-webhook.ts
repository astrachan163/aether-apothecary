import Stripe from 'stripe';

export function readWebhookEvent(payload: string, signature: string | undefined, secret: string | undefined): Stripe.Event {
  if (!signature || !secret) {
    const error = new Error('bad-signature');
    error.name = 'bad-signature';
    throw error;
  }
  const stripe = new Stripe('sk_test_x', { apiVersion: '2024-06-20' });
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
