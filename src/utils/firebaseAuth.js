/**
 * TRACCR by DMG Official — Authentication (official Firebase Auth SDK).
 *
 * - Every real account lives in Firebase Auth + Firestore (`users/{uid}`), so it works
 *   on every device. There is NO local/offline account fallback anymore (that fallback
 *   is what caused "account exists on my phone but not my computer").
 * - Firebase enforces one account per email address (no duplicates).
 * - Passwords are handled entirely by Firebase; nothing password-related is stored locally.
 * - The demo account stays local-only and never touches the cloud.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, isCloudConfigured, getConfigSummary } from './firebaseClient.js';
import {
  buildEmptyAccount,
  createCloudAccount,
  loadCloudAccount,
  saveCloudAccount,
} from './cloudSync.js';
import { DEFAULT_USER_PROFILE, saveAuthUser } from './dataStorage.js';

export const WELCOME_VERIFICATION_MESSAGE =
  'Congratulations. Thank you for signing up with TRACCR! You are one step closer to reaching your financial goals and building future wealth.';

let registrationInProgress = false;
export function isRegistrationInProgress() {
  return registrationInProgress;
}

function sanitizeText(str, maxLen = 120) {
  return String(str || '')
    .replace(/[\0<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Maps Firebase error codes to a plain-English message + the exact fix.
 */
export function explainFirebaseError(err) {
  const code = String(err?.code || err?.message || 'unknown');
  const table = [
    ['auth/email-already-in-use', 'An account with this email already exists.', 'Switch to "Log In", or use "Forgot password?".'],
    ['auth/invalid-credential', 'Email or password is incorrect.', 'Double-check both, or use "Forgot password?".'],
    ['auth/wrong-password', 'Email or password is incorrect.', 'Double-check both, or use "Forgot password?".'],
    ['auth/user-not-found', 'Email or password is incorrect.', 'If you never signed up with this email, create an account.'],
    ['auth/invalid-email', 'That email address is not valid.', 'Check the spelling of the email.'],
    ['auth/weak-password', 'Password is too weak.', 'Use at least 6 characters.'],
    ['auth/missing-password', 'Please enter a password.', ''],
    ['auth/too-many-requests', 'Too many attempts. Firebase temporarily blocked this device.', 'Wait 5–15 minutes, then try again.'],
    ['auth/network-request-failed', 'Could not reach Firebase.', 'Check your internet connection or disable ad/tracker blockers for this site.'],
    ['auth/operation-not-allowed', 'Email/Password sign-in is turned OFF in Firebase.', 'Firebase Console → Authentication → Sign-in method → Email/Password → Enable → Save.'],
    ['auth/configuration-not-found', 'Firebase Authentication is not set up for this project.', 'Firebase Console → Authentication → click "Get started", then enable Email/Password.'],
    ['auth/api-key-not-valid', 'The Firebase API key in GitHub Secrets is wrong.', 'Re-copy apiKey from Firebase Console → Project settings → General → Your apps, into the TRACCR_FIREBASE_API_KEY secret.'],
    ['auth/invalid-api-key', 'The Firebase API key in GitHub Secrets is wrong.', 'Re-copy apiKey from Firebase Console → Project settings → General → Your apps, into the TRACCR_FIREBASE_API_KEY secret.'],
    ['auth/requests-from-referer', 'Your Google Cloud API key restriction is blocking this website.', 'Google Cloud Console → APIs & Services → Credentials → your Browser key → Website restrictions → add https://devgat718.github.io/* (and http://localhost:3000/*).'],
    ['auth/unauthorized-domain', 'This website is not in Firebase Authorized domains.', 'Firebase Console → Authentication → Settings → Authorized domains → add devgat718.github.io'],
    ['auth/unauthorized-continue-uri', 'This website is not in Firebase Authorized domains.', 'Firebase Console → Authentication → Settings → Authorized domains → add devgat718.github.io'],
    ['auth/quota-exceeded', 'Firebase daily email quota reached.', 'Wait until tomorrow (free plan limit) or upgrade the Firebase plan.'],
    ['auth/user-token-expired', 'Your login session expired.', 'Log out and log back in.'],
    ['auth/requires-recent-login', 'Your login session is too old for this action.', 'Log out and log back in.'],
    ['permission-denied', 'Firestore Security Rules blocked the request.', 'Firebase Console → Firestore Database → Rules → paste the rules from firestore.rules → Publish.'],
    ['not-found', 'The Firestore database does not exist yet.', 'Firebase Console → Firestore Database → Create database.'],
    ['failed-precondition', 'The Firestore database is not ready.', 'Firebase Console → Firestore Database → Create database (Native mode).'],
    ['unavailable', 'Firestore is unreachable right now.', 'Check your internet connection and try again.'],
  ];
  const hit = table.find(([key]) => code.includes(key));
  if (hit) return { code, message: hit[1], fix: hit[2] };
  return { code, message: err?.message || 'Something went wrong.', fix: '' };
}

function requireCloud() {
  if (!isCloudConfigured || !auth) {
    throw new Error(
      'TRACCR Cloud is not connected on this build, so accounts cannot be created or logged into yet. (Missing Firebase GitHub Secrets.)'
    );
  }
}

function friendlyError(err) {
  const info = explainFirebaseError(err);
  const e = new Error(info.fix ? `${info.message} ${info.fix}` : info.message);
  e.code = info.code;
  return e;
}

function sessionFromAccount(firebaseUser, account) {
  const p = account?.profile || {};
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: Boolean(firebaseUser.emailVerified),
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    userName: p.userName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
    phone: p.phone || '',
    photoURL: p.photoURL || '',
    userRole: p.userRole || 'TRACCR Member • DMG Official',
    isDemo: false,
    provider: 'firebase',
  };
}

/** Sends the Firebase verification email and reports exactly what happened. */
export async function sendTraccrVerificationEmail() {
  if (!isCloudConfigured || !auth) {
    return { sent: false, ...explainFirebaseError({ code: 'not-configured', message: 'TRACCR Cloud is not connected on this build.' }), fix: 'Add the Firebase GitHub Secrets and redeploy.' };
  }
  const user = auth.currentUser;
  if (!user) {
    return { sent: false, code: 'no-user', message: 'You are not logged into a cloud account.', fix: 'Log out and log back in with your email + password.' };
  }
  try {
    await user.reload();
    if (user.emailVerified) {
      return { sent: false, code: 'already-verified', message: 'This email is already verified. ✅', fix: '' };
    }
    await sendEmailVerification(user);
    return {
      sent: true,
      code: 'ok',
      message: `Firebase accepted the request and sent the verification email to ${user.email}.`,
      fix: 'If it is not in your Inbox within 2 minutes, check Spam/Junk/Promotions for "noreply@" + your Firebase project.',
    };
  } catch (err) {
    return { sent: false, ...explainFirebaseError(err) };
  }
}

export async function sendTraccrPasswordReset(email) {
  requireCloud();
  const cleanEmail = sanitizeText(email, 160).toLowerCase();
  if (!cleanEmail) throw new Error('Enter your email address first, then tap "Forgot password?".');
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (err) {
    // Don't reveal whether the email exists; only surface configuration problems.
    const info = explainFirebaseError(err);
    if (!info.code.includes('user-not-found') && !info.code.includes('invalid-credential')) {
      throw friendlyError(err);
    }
  }
}

/**
 * Creates a Firebase account + an empty cloud profile, then sends the verification email.
 * Returns { user, account, emailResult }.
 */
export async function registerTraccrUser({ firstName, lastName, email, phone, password, photoURL = '' }) {
  requireCloud();
  const cleanEmail = sanitizeText(email, 160).toLowerCase();
  const cleanFirst = sanitizeText(firstName, 60);
  const cleanLast = sanitizeText(lastName, 60);
  const cleanPhone = sanitizeText(phone, 30);

  if (!cleanLast) throw new Error('Please enter your Last Name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error('Please enter a valid Email Address.');
  if (!cleanPhone) throw new Error('Please enter your Phone Number.');
  if (!password || password.length < 6) throw new Error('Please enter a password (at least 6 characters).');

  const fullName = cleanFirst ? `${cleanFirst} ${cleanLast}` : cleanLast;
  registrationInProgress = true;
  try {
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    } catch (err) {
      throw friendlyError(err);
    }
    const fbUser = cred.user;
    await updateProfile(fbUser, { displayName: fullName }).catch(() => {});

    const account = buildEmptyAccount({
      uid: fbUser.uid,
      email: fbUser.email,
      firstName: cleanFirst,
      lastName: cleanLast,
      userName: fullName,
      phone: cleanPhone,
      photoURL,
    });
    let cloudError = null;
    try {
      await createCloudAccount(account);
    } catch (err) {
      cloudError = explainFirebaseError(err);
    }

    const emailResult = await sendTraccrVerificationEmail();
    const user = { ...sessionFromAccount(fbUser, account), justSignedUp: true };
    return { user, account, emailResult, cloudError };
  } finally {
    registrationInProgress = false;
  }
}

/**
 * Loads (or repairs) the cloud account for a signed-in Firebase user.
 */
export async function loadAccountForFirebaseUser(fbUser) {
  let account = await loadCloudAccount(fbUser.uid);
  if (!account) {
    account = buildEmptyAccount({
      uid: fbUser.uid,
      email: fbUser.email,
      userName: fbUser.displayName || fbUser.email.split('@')[0],
    });
    await createCloudAccount(account);
  }
  return { user: sessionFromAccount(fbUser, account), account };
}

export async function signInTraccrUser({ email, password }) {
  requireCloud();
  const cleanEmail = sanitizeText(email, 160).toLowerCase();
  if (!cleanEmail || !password) throw new Error('Please enter both your email address and password.');
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  } catch (err) {
    throw friendlyError(err);
  }
  try {
    return await loadAccountForFirebaseUser(cred.user);
  } catch (err) {
    await signOut(auth).catch(() => {});
    throw friendlyError(err);
  }
}

export function signInDemoUser() {
  const sessionUser = { ...DEFAULT_USER_PROFILE, isDemo: true };
  saveAuthUser(sessionUser);
  return sessionUser;
}

export async function signOutTraccrUser() {
  saveAuthUser(null);
  if (auth) await signOut(auth).catch(() => {});
}

/**
 * Runs every check between "Sign Up" and "email in inbox / data in cloud".
 * Each step: { label, status: 'pass' | 'fail' | 'warn', detail, fix }
 */
export async function runCloudDiagnostics({ sendEmail = false } = {}) {
  const steps = [];
  const cfg = getConfigSummary();

  steps.push(
    cfg.apiKeyLoaded && cfg.projectId !== '(missing)' && cfg.authDomain !== '(missing)'
      ? { label: 'Firebase config in this build', status: 'pass', detail: `Project: ${cfg.projectId} • Auth domain: ${cfg.authDomain}` }
      : {
          label: 'Firebase config in this build',
          status: 'fail',
          detail: `API key loaded: ${cfg.apiKeyLoaded ? 'yes' : 'NO'} • Project: ${cfg.projectId} • Auth domain: ${cfg.authDomain}`,
          fix: 'GitHub repo → Settings → Secrets and variables → Actions → "Repository secrets" must contain TRACCR_FIREBASE_API_KEY, TRACCR_FIREBASE_AUTH_DOMAIN, TRACCR_FIREBASE_PROJECT_ID. Then re-run the Deploy workflow.',
        }
  );
  if (!isCloudConfigured || !auth) return steps;

  steps.push({
    label: 'Website domain',
    status: 'warn',
    detail: `This page is running on "${window.location.hostname}".`,
    fix: `Make sure "${window.location.hostname}" is listed in Firebase Console → Authentication → Settings → Authorized domains.`,
  });

  const user = auth.currentUser;
  if (!user) {
    steps.push({ label: 'Signed in to Firebase', status: 'fail', detail: 'No cloud user is signed in (demo accounts are local-only).', fix: 'Log out and log in with a real email + password account.' });
    return steps;
  }
  steps.push({ label: 'Signed in to Firebase', status: 'pass', detail: `${user.email} (uid ${user.uid.slice(0, 6)}…)` });

  try {
    await user.getIdToken(true);
    steps.push({ label: 'API key + token refresh', status: 'pass', detail: 'Firebase accepted this site and refreshed the login token.' });
  } catch (err) {
    const info = explainFirebaseError(err);
    steps.push({ label: 'API key + token refresh', status: 'fail', detail: `${info.message} (${info.code})`, fix: info.fix });
    return steps;
  }

  try {
    const acct = await loadCloudAccount(user.uid);
    steps.push(
      acct
        ? { label: 'Cloud database read', status: 'pass', detail: `Found your account document (last saved ${acct.updatedAt || 'n/a'}).` }
        : { label: 'Cloud database read', status: 'warn', detail: 'Read worked, but no account document exists yet.', fix: 'Log out and back in to recreate it.' }
    );
    if (acct) {
      await saveCloudAccount(user.uid, user.email, acct);
      steps.push({ label: 'Cloud database write', status: 'pass', detail: 'Saved successfully — your data syncs across devices.' });
    }
  } catch (err) {
    const info = explainFirebaseError(err);
    steps.push({ label: 'Cloud database read/write', status: 'fail', detail: `${info.message} (${info.code})`, fix: info.fix });
  }

  try {
    await user.reload();
  } catch (_) {}
  steps.push(
    user.emailVerified
      ? { label: 'Email verified', status: 'pass', detail: `${user.email} is verified.` }
      : { label: 'Email verified', status: 'warn', detail: `${user.email} has not clicked the verification link yet.` }
  );

  if (sendEmail && !user.emailVerified) {
    const r = await sendTraccrVerificationEmail();
    steps.push({
      label: 'Send verification email',
      status: r.sent ? 'pass' : 'fail',
      detail: `${r.message}${r.code && !r.sent ? ` (${r.code})` : ''}`,
      fix: r.fix,
    });
  }

  return steps;
}
