# Stripe test mode

Checkout uses Stripe test mode only. There is no live-mode path in this repo.

Blank names live in `.env.example`:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST` for the browser. The client ignores any other prefix.
- `STRIPE_SECRET_KEY_TEST` and `STRIPE_WEBHOOK_SECRET_TEST` for Cloud Functions, via Secret Manager.

When those values are absent, the checkout button stays disabled and reads: Checkout is off today: no orders, no charges, and no card details are collected.

The webhook is the `stripeWebhook` function. It checks the Stripe signature and rejects a bad signature. Deploy steps are in `docs/deploy-runbook.md`. Do not deploy until review passes.
