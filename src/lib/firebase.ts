import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: ReturnType<typeof getFirestore> | undefined;

try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error('Firebase credentials are not fully set in environment variables.');
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/
/g, '
'),
  };

  if (getApps().length === 0) {
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
