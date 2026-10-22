# Deploy

This PR is source only. No backend, rules, credential, claim, billing or production data changes are authorized by the source closeout. The published PR2 Hosting release remains unchanged. Never run a bare `firebase deploy`.

Project: `aether-apothecary`. Functions codebase: `herbal`. Region: `us-central1`.

Rules deploys are project-wide. `firestore:rules` and `storage` replace the rules for the whole Firebase project, not only the herbal hosting site.

## Activation decisions required

- Billing is already enabled. Do not request or perform an upgrade. Runtime usage/cost limits still need assessment; a budget notification is not an enforced spend cap.
- The existing Firebase WEB registration exists, but App Check Enterprise has no configured site key and v3 has no site secret. Provider/domain/enforcement configuration is a separate action.
- Metadata confirms `STRIPE_SECRET_KEY_TEST`, `STRIPE_WEBHOOK_SECRET_TEST` and `GEMINI_API_KEY` are absent. Creating secrets, using credentials or configuring existing external accounts requires the exact owner-approved setup. Gemini is optional for owner AI, not static browsing.
- `functions/stripe-price-allowlist.json` remains empty. Bind only verified existing test prices to the server catalog, without changing catalog prices. `node scripts/check-stripe-config.cjs --catalog <existing-export.json>` validates a proposed mapping offline. The callable also checks the actual Stripe test Price before Checkout.
- Classify WHOLE published Firestore catalog documents and catalog Storage objects before activating candidate public reads. Firestore sends the entire readable document to the browser; projection in `catalog-data.ts` shapes UI objects only. Any private fields require a separately reviewed server/public-schema boundary, not a projection-only security claim.
- Compare default-database and bucket rules for every retained app. The candidate restores only the recorded live `/demo` blocks, with the legacy admin predicate renamed locally. It deliberately omits the live global admin catch-all because that would override strict Herbal protections. The minimal further proposal is to retain legacy admin fallback only outside `catalog`, `orders`, `org`, `demo_seed`, `demo_meta`, `ai_usage` and `sandboxes`; it has NOT been added. Changing fallback access/classification remains a decision.
- New sandboxes carry `app:'herbal'` on root and item counter. The source rules require this root marker, exact namespace and role, preserve counter markers and deny client recreation of deleted roots. Unmarked legacy roots/counters need explicit classification; reset and mint do not silently adopt them. Reset never changes rate counters or Auth users. Retained Auth-account cleanup, Storage cleanup/total quotas and TTL policy remain separate assessed actions.

## 1. After activation review, list functions first

```sh
firebase functions:list --project aether-apothecary
```

Deploy only the names you intend to update. With a codebase, the name is `functions:herbal:<function>`.

## 2. Deploy by name

```sh
firebase deploy --only functions:herbal:startDemoSession --project aether-apothecary
firebase deploy --only functions:herbal:resetDemo --project aether-apothecary
firebase deploy --only functions:herbal:saveCatalogItem --project aether-apothecary
firebase deploy --only functions:herbal:createCheckoutSession --project aether-apothecary
firebase deploy --only functions:herbal:stripeWebhook --project aether-apothecary
firebase deploy --only functions:herbal:aiGenerate --project aether-apothecary
firebase deploy --only functions:herbal:aiModels --project aether-apothecary
```

Do not use `--only functions`. That would deploy every codebase in the project.

## 3. Rules and hosting are separate releases

Do not run project-wide rules commands as a routine part of a function or Hosting release. Candidate public data access, retained legacy-admin fallback, and sandbox Storage ownership/cleanup need review against the live project before any replacement. No rules activation is part of this PR's source closeout.

```sh
npm run build:static
firebase deploy --only hosting:aether-apothecary --project aether-apothecary
```

`npm run build:static` writes `out/` and, only in that working tree, fills script hashes into `firebase.json`. Do not commit those hashes. The file in git keeps `script-src` without `sha256-` entries so a later build is not stuck with a stale list. `style-src` includes `'unsafe-inline'` for style tags from dropdowns and dialogs. Scripts never use `'unsafe-inline'`.

Those Hosting commands are examples for a separately reviewed release. Building locally is not deployment approval.

Stripe test price IDs belong in `functions/stripe-price-allowlist.json`. Empty stays checkout-off. Catalog import/mapping is a separate production-data action; this PR does not seed or mutate production records.
