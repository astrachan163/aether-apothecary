import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { ServiceAccount } from 'firebase-admin/app';

let db: ReturnType<typeof getFirestore> | undefined;

try {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/
/g, '
');

  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
  }

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  };

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase initialized successfully.');
    db = getFirestore();
  } else {
    db = getFirestore(getApps()[0]);
  }

} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// Export a potentially undefined db object.
// Code using this module should handle the case where db is not initialized.
export { db };
