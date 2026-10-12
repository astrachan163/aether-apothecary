# Deploy

Do not deploy until review passes. Never run a bare `firebase deploy`.

Project: `aether-apothecary`. Functions codebase: `herbal`. Region: `us-central1`.

Rules deploys are project-wide. `firestore:rules` and `storage` replace the rules for the whole Firebase project, not only the herbal hosting site.

## 1. List functions first

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

## 3. Rules, then hosting

```sh
firebase deploy --only firestore:rules --project aether-apothecary
firebase deploy --only firestore:indexes --project aether-apothecary
firebase deploy --only storage --project aether-apothecary
npm run build:static
firebase deploy --only hosting:aether-apothecary --project aether-apothecary
```

`npm run build:static` writes `out/` and fills script hashes in `firebase.json`. Those rules commands change project-wide rules.

Stripe test price IDs belong in `functions/stripe-price-allowlist.json`. Checkout refuses a price that is not on that list.
