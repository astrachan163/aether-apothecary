# Stripe Integration Guide

Follow these steps to integrate Stripe payments into your application.

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
    *   For the "Endpoint URL", you will need the URL of your deployed application followed by `/api/stripe-webhook`. For local testing, you can use the Stripe CLI. I will provide more instructions on this later.
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
    *   `FIREBASE_PRIVATE_KEY` is the `private_key`.  **Important**: When you copy the private key, make sure it's on a single line. It should start with `-----BEGIN PRIVATE KEY-----` and end with `-----END PRIVATE KEY-----
`.

## 4. Deploy

Once the code changes are complete, you will need to deploy your application.

## 5. Local Testing (Optional but Recommended)

To test your webhook locally, you can use the Stripe CLI:

1.  [Install the Stripe CLI](https://stripe.com/docs/stripe-cli).
2.  Run `stripe login`.
3.  Run `stripe listen --forward-to localhost:3000/api/stripe-webhook`.

This will give you a webhook signing secret to use in your `.env.local` file for testing.
