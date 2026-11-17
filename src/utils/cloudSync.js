/**
 * TRACCR by DMG Official — Cloud Firestore account storage.
 * One document per user: `users/{uid}`. Cloud is the single source of truth,
 * so the same account + data loads on every device.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseClient.js';

export const SCHEMA_VERSION = 4;

/** Firestore rejects `undefined`; a JSON round-trip strips it safely. */
function clean(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export function buildEmptyAccount(profile) {
  const now = new Date().toISOString();
  return {
    uid: profile.uid,
    email: profile.email,
    profile: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      userName: profile.userName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      photoURL: profile.photoURL || '',
      userRole: profile.userRole || 'TRACCR Member • DMG Official',
    },
    incomes: [],
    expenses: [],
    mileageLogs: [],
    goals: [],
    vehicles: [],
    settings: {},
    createdAt: now,
    updatedAt: now,
    schemaVersion: SCHEMA_VERSION,
  };
}

export async function loadCloudAccount(uid) {
  if (!db || !uid) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function createCloudAccount(account) {
  if (!db) throw new Error('Cloud database is not configured.');
  await setDoc(doc(db, 'users', account.uid), clean(account));
}

/** Writes the full account snapshot (owner-only, enforced by firestore.rules). */
export async function saveCloudAccount(uid, email, data) {
  if (!db || !uid) return;
  const payload = clean({
    uid,
    email,
    profile: data.profile,
    incomes: data.incomes,
    expenses: data.expenses,
    mileageLogs: data.mileageLogs,
    goals: data.goals,
    vehicles: data.vehicles,
    settings: data.settings,
    updatedAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
  });
  await setDoc(doc(db, 'users', uid), payload, { merge: true });
}
