<p align="center">
  <img src="docs/brand/banner.webp" alt="Victorious Herbal Elements: sample storefront for herbal products" width="880">
</p>

# Victorious Herbal Elements

The Victorious Herbal Elements store, built by Andrew Strachan. Shoppers can browse the catalog, read the ingredient glossary, and keep a cart in the browser.

**Live status:** Static sample storefront; checkout and admin are offline. PR2 was published on October 22, 2026. The backend implementation in PR3 is source only and has not been activated.

Live: [herbal.nonartificialsi.com](https://herbal.nonartificialsi.com) · [aether-apothecary.web.app](https://aether-apothecary.web.app) · Part of [Andrew Strachan's portfolio](https://www.nonartificialsi.com)

## What it does today

- Shows the sample product catalog, with photos, prices, and categories, and filters it by category, ingredient text, and the tags stored on each product.
- Product pages list ingredients and related sample stories. **Add to cart** keeps a browser cart. **Buy Now** explains that checkout is off; no card details are collected.
- The ingredient glossary and community page read `src/data`. Stories added on the community page stay in memory for the current visit.
- The public pages do not link to admin. The sample catalog lives in `src/data` for the current visit.
- Product creation and legacy AI generation are explicitly unavailable. No Genkit provider is configured; the dormant prompts/models remain for a separately reviewed provider decision.

## PR3 source, pending activation review

- Configured readers select published products, ingredients and stories from `catalog/{kind}/items`, or the signed-in demo's own sandbox. Missing configuration or denied catalog reads restore the existing sample data, visibly read-only. Owner orders and demo sample orders are separate; unavailable order reads show no customer records.
- Existing sample URLs stay unchanged. Other catalog IDs use the static `/product?id=...` page and the same detail component. Missing or unknown IDs show an unavailable selection.
- Owner removal awaits `saveCatalogItem` with `published:false`; records and server price mappings are retained. Demo removal deletes only its own item without reducing the lifetime item counter. Local story previews never become backend records on removal.
- App Check protected demo minting and test Checkout remain gated. An empty Stripe allowlist keeps checkout off. The server verifies an existing Stripe price is active, test mode, one-time USD and matches the catalog amount before creating a session. No prices or price IDs are supplied by this change.
- Nightly reset deletes only `demo_store-admin_<16hex>` sandboxes with `app:'herbal'` on both root and item counter. It does not scan/delete Auth users, reset rate counters, or touch unmarked/foreign records. Mint refuses to adopt an unmarked legacy rate counter.
- Candidate rules retain the recorded legacy `/demo` paths. Their whole published catalog documents and catalog Storage objects would be readable under the candidate policy. UI projection does not conceal fields delivered in Firestore snapshots. Public classification and broader legacy-admin compatibility need a decision before any project-wide rules activation; see [DEPLOY.md](DEPLOY.md).

## Screens

| Home | Products |
|---|---|
| ![Home page of the Victorious Herbal Elements store](docs/screens/home.webp) | ![Sample product catalog](docs/screens/products.webp) |

| Product | Community |
|---|---|
| ![Sample product page with simulated checkout](docs/screens/product.webp) | ![Community stories from sample data](docs/screens/community.webp) |

Captured from the local store with sample data. No real user data, keys, emails, or tokens appear in them.

## How it's built

- Next.js 15 (App Router), React 18, and TypeScript, styled with Tailwind. The shop's own colors in `src/app/globals.css` are soft lavender `#D0BFFF`, deep teal `#1f6b45`, and light gray `#F0F0F0`.
- Sample products, ingredients, and stories live in `src/data` and provide the offline fallback. Connected PR3 readers use the existing Firebase SDK.
- Stripe test configuration stays in server environment variables. It is not part of the browser bundle.
- Legacy description/image exports in `src/ai` fail explicitly as unavailable before invoking a flow. Current PR3 owner AI uses separate callables and has separate configuration gates.

## Run it locally

```sh
npm ci
cp .env.example .env.local   # fill in your own values; never commit them
npm run dev
```

The dev server listens on port 9002. Use Node.js 24 (`engines.node` is `24.x`). The catalog still builds when no environment variables are set.

Firebase Hosting serves the static `out/` export. With no environment configuration, catalog reads use the read-only fallback and admin stays offline. The separate `functions/` source is not deployed by a static build. `firebase.json` points hosting at `out/`.

## Tests and checks

```sh
npm run check
npm run typecheck
node scripts/check-stripe-config.cjs
npm run build:static
gitleaks dir . --redact
```

`npm run check` runs claims, emoji, client-secret and committed-CSP gates. Vitest tests live in `tests/`; `rules.test.ts` requires local Firestore/Storage emulators. The preview-removal regression uses headless WebKit. The static build's existing configuration skips type validation, so run `typecheck` separately. No package, model or compiler-ignore changes accompany this correction.

## Security

No secrets are committed. Configuration comes from environment variables listed in `.env.example`. Billable AI keys never reach the browser. Report a problem to strachan@uab.edu.

## Credits

The Victorious Herbal Elements store, built by Andrew Strachan.

## License

All rights reserved. Source shared for review.
