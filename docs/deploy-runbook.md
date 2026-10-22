# Deploy runbook

Source review and deployment are separate. Complete the exact decisions in `DEPLOY.md` before enabling backend features. No backend/rules/settings changes are part of this source closeout. Never run a bare `firebase deploy`.

Project: `aether-apothecary`. Hosting site: `aether-apothecary`. Functions runtime: Node 22, region `us-central1`.

## Commands, in order

Follow `DEPLOY.md`. List functions first, deploy each function by name (`functions:herbal:<name>`), and remember that Firestore and Storage rules deploys are project-wide.

`build:static` writes `out/`. Hosting serves that folder.

The existing 24-hour `expiresAt` is on `sandboxes/{uid}`, not a `meta` document. A TTL policy on the `sandboxes` collection group requires separate assessment: deleting a root through TTL does not recursively delete subcollections or Storage objects. The 3:00 AM America/Chicago reset recursively deletes only app-marked Herbal sandboxes; it leaves all Auth accounts and all rate counters unchanged.

## Secret Manager names

`STRIPE_SECRET_KEY_TEST`, `STRIPE_WEBHOOK_SECRET_TEST`, `GEMINI_API_KEY`.

The functions refuse a Stripe secret that does not start with the test prefix. There is no live-mode path.

## Admin claim

Any owner-claim write is a separate identity-permission action. Do not run `scripts/grant-admin-claim.mjs` as part of source work. Source authorization remains restricted to the existing verified owner identity; no claim was changed.

## Andrew-only settings

- Billing is already enabled. Confirm applicable runtime budgets/quotas separately; this code does not implement a $5 hard spend cap.
- Metadata confirms all three Secret Manager names above are absent. Owner-provided existing-account configuration is required; no secret values were read or created.
- Stripe test keys and a test webhook pointed at `stripeWebhook`.
- The Firebase WEB app already exists; App Check provider/site configuration does not. Assess existing-domain configuration without creating a new registration or enabling enforcement in this change.
- AI Logic quotas for the demo model.
- Public sign-up off. Enable delete off.
- Key referrer restrictions.
- Real charges stay off until Andrew turns them on outside this app.

No Genkit provider is configured. Legacy description/image exports fail before generation. Choosing a provider/package or activating those dormant prompts is a separate decision; current callable AI also remains gated on its own missing configuration.
