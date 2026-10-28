/**
 * TRACCR by DMG Official
 * Hardened Authentication Service (Web Crypto Salted SHA-256 + Firebase REST API)
 * Never stores plaintext passwords in browser storage.
 */

import {
  getRegisteredUsers,
  saveRegisteredUsers,
  saveAuthUser,
  getFirebaseConfig,
  DEFAULT_USER_PROFILE,
  wipeUserAccountData,
} from './dataStorage.js';

function sanitizeText(str, maxLen = 120) {
  return String(str || '')
    .replace(/[\0<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

function generateSalt() {
  const bytes = new Uint8Array(16);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPasswordWithSalt(password, salt) {
  const payload = `${salt}:${password}`;
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback deterministic hash if subtle crypto unavailable
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

/**
 * Registers a new TRACCR user account (First Name, Last Name, Email, Phone, Password, Photo).
 * Every newly created account is initialized completely empty (zero income, zero expenses, zero mileage, zero goals).
 */
export async function registerTraccrUser({
  firstName,
  lastName,
  email,
  phone,
  password,
  photoURL = '',
}) {
  const cleanEmail = sanitizeText(email, 160).toLowerCase();
  const cleanFirst = sanitizeText(firstName, 60);
  const cleanLast = sanitizeText(lastName, 60);
  const cleanPhone = sanitizeText(phone, 30);

  if (!cleanLast) {
    throw new Error('Please enter your Last Name.');
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid Email Address.');
  }
  if (!cleanPhone) {
    throw new Error('Please enter your Phone Number.');
  }
  if (!password || password.length < 6) {
    throw new Error('Please enter a password (at least 6 characters).');
  }

  const fbConfig = getFirebaseConfig();
  let firebaseUid = null;

  if (fbConfig && fbConfig.apiKey) {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(
          fbConfig.apiKey
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            returnSecureToken: true,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok && data?.error?.message) {
        throw new Error(`Firebase Auth: ${data.error.message}`);
      }
      firebaseUid = data.localId;
    } catch (err) {
      if (err.message.startsWith('Firebase Auth:')) throw err;
      console.warn('Firebase cloud signup fallback to local store');
    }
  }

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists. Please log in.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPasswordWithSalt(password, salt);

  const fullName = cleanFirst ? `${cleanFirst} ${cleanLast}` : cleanLast;
  const newUser = {
    uid: firebaseUid || `usr-${Date.now()}`,
    firstName: cleanFirst,
    lastName: cleanLast,
    userName: fullName,
    email: cleanEmail,
    phone: cleanPhone,
    userRole: 'TRACCR Member • DMG Official',
    photoURL: photoURL || '',
    salt,
    passwordHash,
    isDemo: false,
    provider: firebaseUid ? 'firebase' : 'firebase-local',
    createdAt: new Date().toISOString(),
  };

  // Ensure new user starts with 100% blank / zero data
  wipeUserAccountData(newUser);

  const updatedUsers = [newUser, ...users];
  saveRegisteredUsers(updatedUsers);

  const sessionUser = { ...newUser };
  delete sessionUser.passwordHash;
  delete sessionUser.salt;
  saveAuthUser(sessionUser);
  return sessionUser;
}

/**
 * Signs in an existing user with Email & Password.
 */
export async function signInTraccrUser({ email, password }) {
  const cleanEmail = sanitizeText(email, 160).toLowerCase();
  if (!cleanEmail || !password) {
    throw new Error('Please enter both your email address and password.');
  }

  const fbConfig = getFirebaseConfig();
  if (fbConfig && fbConfig.apiKey) {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(
          fbConfig.apiKey
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            returnSecureToken: true,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.localId) {
        const users = getRegisteredUsers();
        const localMatch = users.find((u) => u.email.toLowerCase() === cleanEmail);
        const sessionUser = localMatch
          ? { ...localMatch, uid: data.localId }
          : {
              uid: data.localId,
              firstName: cleanEmail.split('@')[0],
              lastName: '',
              userName: data.displayName || cleanEmail.split('@')[0],
              email: cleanEmail,
              phone: '',
              userRole: 'TRACCR Member',
              photoURL: '',
              isDemo: false,
              provider: 'firebase',
            };
        delete sessionUser.password;
        delete sessionUser.passwordHash;
        delete sessionUser.salt;
        saveAuthUser(sessionUser);
        return sessionUser;
      }
    } catch (_) {
      console.warn('Firebase cloud sign-in fallback to local store');
    }
  }

  const users = getRegisteredUsers();
  const match = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!match) {
    throw new Error('Invalid email or password.');
  }

  if (match.passwordHash && match.salt) {
    const candidateHash = await hashPasswordWithSalt(password, match.salt);
    if (candidateHash !== match.passwordHash) {
      throw new Error('Invalid email or password.');
    }
  } else if (match.password && match.password !== password) {
    throw new Error('Invalid email or password.');
  }

  const sessionUser = { ...match };
  delete sessionUser.password;
  delete sessionUser.passwordHash;
  delete sessionUser.salt;
  saveAuthUser(sessionUser);
  return sessionUser;
}

/**
 * Instant Demo Login as Devin Gatling (DMG Official).
 */
export function signInDemoUser() {
  const users = getRegisteredUsers();
  const demo =
    users.find((u) => u.email.toLowerCase() === DEFAULT_USER_PROFILE.email.toLowerCase()) ||
    DEFAULT_USER_PROFILE;
  const sessionUser = { ...demo, isDemo: true };
  delete sessionUser.password;
  delete sessionUser.passwordHash;
  delete sessionUser.salt;
  saveAuthUser(sessionUser);
  return sessionUser;
}

/**
 * Updates the currently signed-in user's profile in both session and users DB.
 */
export function updateAuthenticatedUserProfile(patch) {
  const users = getRegisteredUsers();
  const updatedUsers = users.map((u) => {
    if (
      (patch.uid && u.uid === patch.uid) ||
      (patch.email && u.email.toLowerCase() === patch.email.toLowerCase())
    ) {
      return { ...u, ...patch };
    }
    return u;
  });
  saveRegisteredUsers(updatedUsers);
  const safePatch = { ...patch };
  delete safePatch.password;
  delete safePatch.passwordHash;
  delete safePatch.salt;
  saveAuthUser(safePatch);
}
