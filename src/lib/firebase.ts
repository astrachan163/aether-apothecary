import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: ReturnType<typeof getFirestore> | undefined;

try {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    // Relying on the hosting environment (Vercel) to correctly handle the private key format.
    // The problematic .replace() call has been removed.
    privateKey: process.env.FIREBASE_PRIVATE_KEY!,
  };

  if (!serviceAccount.privateKey) {
    throw new Error('Firebase private key is not set in environment variables.');
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  
  db = getFirestore();

} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { db };
