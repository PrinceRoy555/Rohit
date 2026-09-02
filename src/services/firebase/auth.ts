import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../../lib/firebase';

export interface AuthStateResult {
  user: User | null;
  isFirebaseReady: boolean;
}

export interface AdminRoleResult {
  authorized: boolean;
  role: 'super_admin' | 'admin' | 'editor';
  email: string;
  error?: string;
}

const SUPER_ADMIN_EMAIL = 'workall724038@gmail.com';

/**
 * Maps Firebase Auth error codes to user-friendly messages without exposing system internals.
 */
export function getFriendlyAuthErrorMessage(errorCodeOrMessage: string): string {
  if (!errorCodeOrMessage) return 'An error occurred during authentication. Please try again.';

  if (errorCodeOrMessage.includes('auth/invalid-credential') || errorCodeOrMessage.includes('auth/wrong-password') || errorCodeOrMessage.includes('auth/user-not-found')) {
    return 'Invalid administrator email or password. Please verify your credentials.';
  }
  if (errorCodeOrMessage.includes('auth/invalid-email')) {
    return 'Please provide a valid email address.';
  }
  if (errorCodeOrMessage.includes('auth/too-many-requests')) {
    return 'Too many unsuccessful attempts. Access temporarily restricted for security. Please try again shortly.';
  }
  if (errorCodeOrMessage.includes('auth/user-disabled')) {
    return 'This administrator account has been disabled by security policy.';
  }
  if (errorCodeOrMessage.includes('auth/network-request-failed')) {
    return 'Network error: Unable to reach authentication service. Please check your connection.';
  }
  if (errorCodeOrMessage.includes('auth/popup-closed-by-user')) {
    return 'Sign-in window was closed before completion.';
  }
  if (errorCodeOrMessage.includes('auth/popup-blocked')) {
    return 'Authentication popup was blocked by your browser. Please allow popups for this site.';
  }
  if (errorCodeOrMessage.includes('auth/unauthorized-domain')) {
    return 'Current domain is not authorized in Firebase Auth settings.';
  }

  return 'Authentication failed. Please verify your administrator credentials.';
}

/**
 * Sign in via Firebase Auth with Email and Password.
 */
export async function signInAdmin(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, error: 'Firebase Auth is not configured on this project.' };
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return { success: true, user: cred.user };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: getFriendlyAuthErrorMessage(error.code || error.message) };
  }
}

/**
 * Sign in via Firebase Auth with Google Provider.
 */
export async function signInAdminWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, error: 'Firebase Auth is not configured on this project.' };
  }
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    return { success: true, user: cred.user };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: getFriendlyAuthErrorMessage(error.code || error.message) };
  }
}

/**
 * Verify whether an authenticated Firebase User is authorized as an Administrator.
 * Checks:
 * 1. Primary bootstrapped Super Admin email
 * 2. Firestore /adminProfiles/{uid} record
 * 3. Firestore /admins/{uid} record
 */
export async function verifyAdminRole(user: User | null): Promise<AdminRoleResult> {
  if (!user || !user.email) {
    return {
      authorized: false,
      role: 'editor',
      email: '',
      error: 'Unauthenticated user session.'
    };
  }

  const cleanEmail = user.email.toLowerCase().trim();

  // 1. Primary Super Admin
  if (cleanEmail === SUPER_ADMIN_EMAIL) {
    return {
      authorized: true,
      role: 'super_admin',
      email: cleanEmail
    };
  }

  // 2. Check Firestore Role records if database is configured
  if (isFirebaseConfigured() && db && user.uid) {
    try {
      // Check adminProfiles collection (RBAC)
      const profileDoc = await getDoc(doc(db, 'adminProfiles', user.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        const role = (data?.role === 'super_admin' || data?.role === 'admin' || data?.role === 'editor') ? data.role : 'editor';
        return {
          authorized: true,
          role,
          email: cleanEmail
        };
      }

      // Check legacy admins collection
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        const role = (data?.role === 'super_admin' || data?.role === 'admin') ? data.role : 'admin';
        return {
          authorized: true,
          role,
          email: cleanEmail
        };
      }
    } catch (e) {
      console.warn('[Firebase Auth] Firestore admin role check error:', e);
    }
  }

  // Unauthorized
  return {
    authorized: false,
    role: 'editor',
    email: cleanEmail,
    error: 'Your account is authenticated, but not authorized for Administrator access.'
  };
}

/**
 * Sign out of Firebase Auth completely and invalidate the session.
 */
export async function signOutAdmin(): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: true };
  }
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: error.message };
  }
}

/**
 * Observe Firebase Authentication state changes.
 */
export function observeAuthState(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured() || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Returns currently authenticated Firebase user or null.
 */
export function getCurrentUser(): User | null {
  if (!isFirebaseConfigured() || !auth) return null;
  return auth.currentUser;
}

