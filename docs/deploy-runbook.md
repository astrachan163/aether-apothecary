# Deploy runbook

Do not run these commands until Cody's PASS and Andrew has finished the settings list below. Never run a bare `firebase deploy`.

Project: `aether-apothecary`. Hosting site: `aether-apothecary`. Functions runtime: Node 22, region `us-central1`.

## Commands, in order

```sh
firebase deploy --only firestore:rules --project aether-apothecary
firebase deploy --only firestore:indexes --project aether-apothecary
firebase deploy --only storage --project aether-apothecary
firebase deploy --only functions:startDemoSession,functions:resetDemo,functions:saveCatalogItem,functions:createCheckoutSession,functions:stripeWebhook,functions:aiGenerate,functions:aiModels --project aether-apothecary
npm run build:static
firebase deploy --only hosting --project aether-apothecary
```

`build:static` writes `out/`. Hosting serves that folder.

Set a Firestore TTL policy on `sandboxes/{uid}/meta` field `expiresAt` in the console. That is a backstop for the 3:00 AM America/Chicago `resetDemo` function.

## Secret Manager names

`STRIPE_SECRET_KEY_TEST`, `STRIPE_WEBHOOK_SECRET_TEST`, `GEMINI_API_KEY`.

The functions refuse a Stripe secret that does not start with the test prefix. There is no live-mode path.

## Admin claim

Portfolio Bot runs `scripts/grant-admin-claim.mjs` with `ALLOW_ADMIN_CLAIM_WRITE=1` after review. It sets `admin: true` on the existing `strachan@uab.edu` user. It does not create users. The password stays out of this repo.

## Andrew-only settings

- Blaze on `aether-apothecary`, with a budget and the $5 spend cap first.
- Secret Manager values for the three names above.
- Stripe test keys and a test webhook pointed at `stripeWebhook`.
- App Check for herbal.nonartificialsi.com, aether-apothecary.web.app, and aether-apothecary.firebaseapp.com.
- AI Logic quotas for the demo model.
- Public sign-up off. Enable delete off.
- Key referrer restrictions.
- Real charges stay off until Andrew turns them on outside this app.
