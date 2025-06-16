import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { ServiceAccount } from 'firebase-admin/app';

let db: ReturnType<typeof getFirestore>;

try {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/
/g, '
');

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  };

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase initialized successfully.');
  }
  db = getFirestore();
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { db };
