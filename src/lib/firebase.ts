import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, httpsCallable, type Functions, type HttpsCallable } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';

export type FirebaseClients = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
  appCheck: AppCheck | null;
};

function readConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

let clients: FirebaseClients | null | undefined;

export function getFirebase(): FirebaseClients | null {
  if (clients !== undefined) return clients;
  const config = readConfig();
  if (!config) {
    clients = null;
    return null;
  }
  const app = getApps()[0] ?? initializeApp(config);
  clients = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    functions: getFunctions(app, 'us-central1'),
    appCheck: null,
  };
  return clients;
}

export function ensureAppCheck(): AppCheck | null {
  const ready = getFirebase();
  if (!ready || ready.appCheck || typeof window === 'undefined') return ready?.appCheck ?? null;
  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY;
  if (!siteKey) return null;
  ready.appCheck = initializeAppCheck(ready.app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return ready.appCheck;
}

export function protectedCallable<RequestData, ResponseData>(name: string): HttpsCallable<RequestData, ResponseData> | null {
  const ready = getFirebase();
  if (!ready) return null;
  ensureAppCheck();
  return httpsCallable<RequestData, ResponseData>(ready.functions, name, { limitedUseAppCheckTokens: true });
}

export const db = undefined;
