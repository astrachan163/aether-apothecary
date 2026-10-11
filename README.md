<p align="center">
  <img src="docs/brand/banner.webp" alt="Victorious Herbal Elements: sample storefront for herbal products" width="880">
</p>

# Victorious Herbal Elements

A Next.js storefront demo for Victorious Herbal Elements. Shoppers can browse a sample catalog, read an ingredient glossary, and add community stories that stay in the browser.

**Status:** Demo with sample data. The product page uses a simulated checkout, so this build does not charge a card. Catalog edits last until the tab is closed.

Live: [aether-apothecary.vercel.app](https://aether-apothecary.vercel.app) · [aether-apothecary.web.app](https://aether-apothecary.web.app) · Part of [Andrew Strachan's portfolio](https://www.nonartificialsi.com)

## What it does today

- Shows the sample product catalog, with photos, prices, and categories, and filters it by category, ingredient text, and the tags stored on each product.
- Product pages list ingredients and related sample stories. **Buy Now (Simulated)** opens a mock payment form and does not call Stripe.
- The ingredient glossary and community page read `src/data`. Stories added on the community page stay in memory for the current visit.
- The admin screen can add or remove products and stories for that same visit. The password is checked on the server against `ADMIN_PASSWORD`. This repository does not contain that password.
- Optional admin buttons call server actions that draft a description or images. Those calls need Google Cloud credentials on the server. No API key is shipped here, so the buttons stay offline until a host provides credentials.

## Planned

- Saving the catalog, stories, and orders in Firebase [planned]. `src/lib/firebase.ts` is a stub.
- Connecting the product page to Stripe Checkout [planned]. `src/app/api/checkout/route.ts` can create a session, and the product page does not call it. The webhook route returns `{ received: true }` and does not verify a signature.
- A real admin session, instead of a browser flag set after the password check [planned].

## Screens

| Home | Products |
|---|---|
| ![Home page of the Victorious Herbal Elements demo](docs/screens/home.webp) | ![Sample product catalog](docs/screens/products.webp) |

| Product | Community |
|---|---|
| ![Sample product page with simulated checkout](docs/screens/product.webp) | ![Community stories from sample data](docs/screens/community.webp) |

Captured from the local demo with sample data. No real user data, keys, emails, or tokens appear in them.

## How it's built

- Next.js 15 (App Router), React 18, and TypeScript, styled with Tailwind. The shop's own colors in `src/app/globals.css` are soft lavender `#D0BFFF`, muted teal `#74C69D`, and light gray `#F0F0F0`.
- Sample products, ingredients, and stories live in `src/data` and are held in React context. A refresh restores the sample set.
- Stripe and the admin password are server environment variables. They are not part of the browser bundle.
- Description and image flows use Genkit on the server (`src/ai`). They do not run unless the host has Google Cloud credentials.

## Run it locally

```sh
npm ci
cp .env.example .env.local   # fill in your own values; never commit them
npm run dev
```

The dev server listens on port 9002. Leave `ADMIN_PASSWORD` blank if you only want the public catalog. The admin page will say that login is not configured.

## Tests and checks

```sh
npm run check
npm run build
gitleaks dir . --redact
```

`npm run check` runs the claims gate, the emoji gate, and the client-secret gate. This repo has no unit-test suite.

## Security

No secrets are committed. Configuration comes from environment variables listed in `.env.example`. Billable AI keys never reach the browser. Report a problem to strachan@uab.edu.

## Credits

Storefront demo for Victorious Herbal Elements. Repository author: Andrew Strachan.

## License

All rights reserved. Source shared for review.
