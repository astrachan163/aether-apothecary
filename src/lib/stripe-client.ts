import { acceptPublishableTestKey } from '../../shared/stripe-public';
import { CHECKOUT_OFF_LABEL } from '../../shared/notices';

export function publishableTestKey(): string | null {
  return acceptPublishableTestKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST);
}

export function checkoutEnabled(): boolean {
  return publishableTestKey() !== null;
}

export { CHECKOUT_OFF_LABEL };
