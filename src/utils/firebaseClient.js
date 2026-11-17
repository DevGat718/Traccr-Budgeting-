/**
 * TRACCR by DMG Official — Firebase client (official Web SDK).
 *
 * Config is injected at build time from environment variables
 * (GitHub Actions repository secrets in production, `.env.local` locally).
 * Nothing is hardcoded in source control.
 *
 * NOTE: A Firebase *web* API key is an identifier, not a password. It always ends up
 * in the browser bundle of any deployed Firebase web app. Real protection comes from:
 *   1. Firestore Security Rules (firestore.rules)
 *   2. Firebase Auth "Authorized domains"
 *   3. Google Cloud API key "Website restrictions"
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.TRACCR_FIREBASE_API_KEY || '',
  authDomain: process.env.TRACCR_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.TRACCR_FIREBASE_PROJECT_ID || '',
  appId: process.env.TRACCR_FIREBASE_APP_ID || '',
};

export const isCloudConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;

if (isCloudConfigured) {
  const cfg = { ...firebaseConfig };
  if (!cfg.appId) delete cfg.appId;
  app = initializeApp(cfg);
  auth = getAuth(app);
  // Keep users signed in across tabs, browser restarts, and page reloads
  setPersistence(auth, browserLocalPersistence).catch(() => {});
  db = getFirestore(app);
}

export { app, auth, db };

/** Safe, non-secret summary for the diagnostics panel. */
export function getConfigSummary() {
  return {
    apiKeyLoaded: Boolean(firebaseConfig.apiKey),
    authDomain: firebaseConfig.authDomain || '(missing)',
    projectId: firebaseConfig.projectId || '(missing)',
    appIdLoaded: Boolean(firebaseConfig.appId),
  };
}
