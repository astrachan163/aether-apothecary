
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure the private key is correctly formatted for JSON parsing
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/
/g, '
')
  : undefined;

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey,
};

// Check if all necessary service account details are present
if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error("Firebase Admin SDK credentials are not fully provided in environment variables.");
} else {
    if (!getApps().length) {
      try {
        initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (error) {
        console.error("Firebase Admin SDK initialization error:", error);
      }
    }
}


const db = getFirestore();

export { db };
