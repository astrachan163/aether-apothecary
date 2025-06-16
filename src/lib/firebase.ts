
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The private key must be correctly formatted. The replace function ensures that the `
` characters
  // from the environment variable are converted into actual newlines for the Firebase SDK.
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/
/g, '
'),
};

// Initialize Firebase only if all credentials are provided
if (serviceAccount.projectId && serviceAccount.clientEmail && process.env.FIREBASE_PRIVATE_KEY) {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error("Firebase Admin SDK initialization error:", error);
    }
  }
} else {
  console.warn("Firebase Admin SDK credentials are not fully provided in environment variables. Firebase will not be initialized.");
}

const db = getFirestore();

export { db };
