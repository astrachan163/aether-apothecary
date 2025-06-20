# Stripe Integration and Deployment Guide

Follow these steps to integrate Stripe payments and deploy your application.

## 1. Get Stripe API Keys

*   **Secret Key:**
    *   Go to your [Stripe Dashboard](https://dashboard.stripe.com/apikeys).
    *   Make sure you are in **Test mode**.
    *   Under "Standard keys", find your "Secret key" and click to reveal it.
*   **Publishable Key:**
    *   In the same section of the Stripe Dashboard, you will find your "Publishable key".
*   **Webhook Secret:**
    *   Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks).
    *   Click "Add endpoint".
    *   For the "Endpoint URL", you will need the URL of your deployed application followed by `/api/stripe-webhook`. You can fill this in after you deploy. For now, you can leave it blank or use the Stripe CLI for local testing.
    *   Select the `checkout.session.completed` event.
    *   Click "Add endpoint".
    *   On the next page, you will see a "Signing secret". Click to reveal it.

## 2. Set Up Firebase

*   **Enable Firestore:**
    *   Go to your [Firebase Console](https://console.firebase.google.com/).
    *   Select your project.
    *   In the left-hand menu, go to "Firestore Database" and create a database if you haven't already.
*   **Get Firebase Admin SDK Credentials:**
    *   In your Firebase Console, go to "Project settings" (the gear icon).
    *   Go to the "Service accounts" tab.
    *   Click "Generate new private key". A JSON file will be downloaded.

## 3. Configure Environment Variables

Create a file named `.env.local` in the root of your project and add the following:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
```

*   Replace `sk_test_...` with your Stripe Secret Key.
*   Replace `whsec_...` with your Stripe Webhook Secret.
*   Replace `pk_test_...` with your Stripe Publishable Key.
*   Open the JSON file you downloaded from Firebase.
    *   `FIREBASE_PROJECT_ID` is the `project_id`.
    *   `FIREBASE_CLIENT_EMAIL` is the `client_email`.
    *   `FIREBASE_PRIVATE_KEY` is the `private_key`.  **Important**: Your hosting provider (Vercel) should handle the formatting of the private key correctly.

## 4. Deploy Your Application on Vercel

We recommend using a platform like [Vercel](https://vercel.com) for deploying Next.js applications.

1.  **Sign up on Vercel:** Create an account on Vercel and connect it to your GitHub account.
2.  **Import Project:** From your Vercel dashboard, click "Add New..." -> "Project". Find your `aether-apothecary` repository and click "Import".
3.  **Configure Project:** Vercel will automatically detect that you have a Next.js project.
4.  **Add Environment Variables:** In the project settings, go to "Environment Variables". Add the same keys and values from your `.env.local` file. This is a crucial step for your deployed application to have access to your Stripe and Firebase credentials.
5.  **Deploy:** Click "Deploy". Vercel will build and deploy your application. Once it's done, you'll get a public URL (e.g., `aether-apothecary.vercel.app`).

## 5. Point Your Squarespace Domain (`victoriousherb.com`) to Vercel

Once your application is deployed on Vercel, you need to connect your Squarespace domain to it.

### Step 5.1: Add Your Domain to Vercel

1.  In your Vercel project dashboard, go to the **Settings** tab and select **Domains**.
2.  Enter `victoriousherb.com` and click **Add**.
3.  Vercel will show you the DNS records you need to configure. It will be an **A record** (an IP address like `76.76.21.21`) and a **CNAME record**. Keep this page open.

### Step 5.2: Configure DNS Records in Squarespace

1.  Log in to your **Squarespace account**.
2.  In the main dashboard, click on **Settings**, then go to **Domains**.
3.  Click on your domain, `victoriousherb.com`.
4.  Click on **DNS Settings**. You will see a list of your current DNS records. **Do not delete existing Squarespace records unless instructed.**
5.  In the **Custom Records** section, you will add the records provided by Vercel:
    *   **To point the root domain (`victoriousherb.com`):**
        *   In a new row, select **A** from the **Type** dropdown.
        *   In the **Host** column, enter **@**. If Squarespace gives an error like "Custom record not saved," try entering your full domain name, **`victoriousherb.com`**, instead.
        *   In the **Data** column, paste the IP address that Vercel gave you (e.g., `76.76.21.21`).
        *   Click **Add**.
    *   **To point the `www` subdomain (`www.victoriousherb.com`):**
        *   In another row, select **CNAME** from the **Type** dropdown.
        *   In the **Host** column, enter **www**. If you get an error, try entering the full subdomain, **`www.victoriousherb.com`**.
        *   In the **Data** column, enter **`cname.vercel-dns.com`**.
        *   Click **Add**.

### Step 5.3: Wait for Propagation and Verify

*   DNS changes can take anywhere from a few minutes to 48 hours to take effect (though it's usually much faster).
*   Vercel will automatically check the status and let you know when the domain is configured correctly. Once it's ready, visiting `victoriousherb.com` will show your deployed Vercel application.

### Step 5.4: Update Your Stripe Webhook

*   Once your domain is live, go back to your [Stripe Webhooks dashboard](https://dashboard.stripe.com/webhooks).
*   Update your webhook's "Endpoint URL" to use your live domain: **`https://victoriousherb.com/api/stripe-webhook`**. This ensures you receive payment confirmations for real transactions.

## 6. Local Testing (Optional)

To test your webhook locally without deploying, use the Stripe CLI:

1.  [Install the Stripe CLI](https://stripe.com/docs/stripe-cli).
2.  Run `stripe login`.
3.  Run `stripe listen --forward-to localhost:3000/api/stripe-webhook`.

This will give you a webhook signing secret to use in your `.env.local` file for testing.
