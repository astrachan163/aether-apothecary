import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { ServiceAccount } from 'firebase-admin/app';

const hasEnv = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

let db: ReturnType<typeof getFirestore>;

if (!hasEnv) {
  console.warn(
    'Firebase environment variables are not set. Skipping Firebase initialization.'
  );
  // In a non-server environment or if variables are missing,
  // getFirestore might be used elsewhere. We create a dummy object
  // or handle this case as appropriate for the app's architecture.
  // For now, we allow it to fail later if actually used.
} else {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // This is the crucial part: correctly format the private key
    // by replacing the literal `
` strings with actual newline characters.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/
/g, '
'),
  };

  if (getApps().length === 0) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase initialized successfully.');
    } catch (e) {
      console.error('Firebase initialization error', e);
    }
  }
  db = getFirestore();
}


export { db };
