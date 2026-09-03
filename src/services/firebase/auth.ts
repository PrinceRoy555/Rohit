import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  User,
  AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

export interface PasswordRequirementsStatus {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
  score: number; // 0 to 5
}

export const SUPER_ADMIN_EMAIL = 'workall724038@gmail.com';
export const SUPER_ADMIN_UID = '7wupZnpLh1MPTYpci5keNIS1Fyt1';

/**
 * Validates password against enterprise strong-password policy:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 numeric digit
 * - At least 1 special character
 */
export function validatePasswordStrength(password: string): PasswordRequirementsStatus {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  let score = 0;
  if (minLength) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid,
    score
  };
}

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
  if (!user) {
    return {
      authorized: false,
      role: 'editor',
      email: '',
      error: 'Unauthenticated user session.'
    };
  }

  const cleanEmail = (user.email || '').toLowerCase().trim();

  // 1. Primary Super Admin by UID or Email
  if (
    (user.uid && user.uid === SUPER_ADMIN_UID) ||
    cleanEmail === SUPER_ADMIN_EMAIL ||
    cleanEmail === 'workall724038@gmail.com'
  ) {
    return {
      authorized: true,
      role: 'super_admin',
      email: cleanEmail || SUPER_ADMIN_EMAIL
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
 * Ensures admin profile document exists in Firestore for super admin UID
 */
export async function syncAdminFirestoreProfile(user: User): Promise<void> {
  if (!isFirebaseConfigured() || !db || !user?.uid) return;
  try {
    const isSuper = user.uid === SUPER_ADMIN_UID || (user.email || '').toLowerCase().trim() === SUPER_ADMIN_EMAIL;
    if (isSuper) {
      await setDoc(doc(db, 'adminProfiles', user.uid), {
        uid: user.uid,
        email: user.email || SUPER_ADMIN_EMAIL,
        name: 'Rohit Verma',
        role: 'super_admin',
        status: 'active',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email: user.email || SUPER_ADMIN_EMAIL,
        role: 'super_admin'
      }, { merge: true });
    }
  } catch (e) {
    console.warn('[Firebase Auth] syncAdminFirestoreProfile warning:', e);
  }
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

/**
 * Send single-use, time-limited password reset email to administrator.
 * Protects against account enumeration: Always returns a generic confirmation message
 * regardless of whether the email address exists in the authentication system.
 */
export async function sendAdminPasswordReset(email: string): Promise<{ success: boolean; message: string; error?: string; rateLimited?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return {
      success: false,
      message: 'Please provide a valid administrator email address.',
      error: 'Invalid email format'
    };
  }

  // 1. Notify backend endpoint for audit logging & rate limit tracking
  try {
    const serverRes = await fetch('/api/admin/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });

    if (serverRes.status === 429) {
      const data = await serverRes.json().catch(() => ({}));
      return {
        success: false,
        rateLimited: true,
        message: data.error || 'Too many reset requests. Please wait a few minutes before trying again.',
        error: 'RATE_LIMITED'
      };
    }
  } catch {
    // If server is unreachable, proceed to direct Firebase Auth reset
  }

  // 2. Dispatch password reset via Firebase Auth
  if (isFirebaseConfigured() && auth) {
    try {
      // Configure return URL pointing to /admin with reset query parameters
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const actionCodeSettings = {
        url: `${baseUrl}/admin`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
    } catch (err: any) {
      const authError = err as AuthError;
      const code = authError.code || '';

      if (code === 'auth/too-many-requests') {
        return {
          success: false,
          rateLimited: true,
          message: 'Too many reset requests. Access is temporarily restricted. Please try again later.',
          error: 'RATE_LIMITED'
        };
      }

      if (code === 'auth/network-request-failed') {
        return {
          success: false,
          message: 'Network error: Unable to communicate with authentication service. Please check your connection.',
          error: 'NETWORK_ERROR'
        };
      }

      // If user-not-found or invalid-credential, we purposely do NOT reveal account non-existence
      // We fall through to return generic message to preserve security against enumeration.
    }
  }

  return {
    success: true,
    message: 'If an account exists with this email, a password reset link has been sent.'
  };
}

/**
 * Verify a password reset code / oobCode from URL parameters.
 * Supports both Firebase Auth action codes and server-signed cryptographic reset tokens.
 */
export async function verifyAdminPasswordResetCode(oobCode: string): Promise<{ success: boolean; email?: string; error?: string }> {
  if (!oobCode || typeof oobCode !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid password reset token.'
    };
  }

  // 1. Try Firebase Auth verification if configured
  if (isFirebaseConfigured() && auth) {
    try {
      const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
      return {
        success: true,
        email: verifiedEmail
      };
    } catch {
      // If Firebase verification throws, try server-side reset token validation
    }
  }

  // 2. Try Server-side reset token endpoint
  try {
    const res = await fetch('/api/admin/verify-reset-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: oobCode })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        email: data.email
      };
    }
    return {
      success: false,
      error: data.error || 'This password reset link is invalid or has expired.'
    };
  } catch {
    return {
      success: false,
      error: 'Unable to verify reset link. Please check your connection or request a new reset link.'
    };
  }
}

/**
 * Complete the password reset by setting a new strong password.
 * Supports both Firebase Auth and server-managed password hashing.
 */
export async function confirmAdminPasswordReset(
  oobCode: string,
  newPassword: string
): Promise<{ success: boolean; message: string; error?: string }> {
  if (!oobCode) {
    return {
      success: false,
      message: 'Missing password reset token.',
      error: 'INVALID_TOKEN'
    };
  }

  // Validate strong password policy
  const strength = validatePasswordStrength(newPassword);
  if (!strength.isValid) {
    const missing: string[] = [];
    if (!strength.minLength) missing.push('at least 8 characters');
    if (!strength.hasUpper) missing.push('1 uppercase letter');
    if (!strength.hasLower) missing.push('1 lowercase letter');
    if (!strength.hasNumber) missing.push('1 number');
    if (!strength.hasSpecial) missing.push('1 special character');

    return {
      success: false,
      message: `Password does not meet requirements: Needs ${missing.join(', ')}.`,
      error: 'WEAK_PASSWORD'
    };
  }

  // 1. Try Firebase Auth confirmation if configured
  if (isFirebaseConfigured() && auth) {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);

      // Notify server of password update for audit logging
      try {
        await fetch('/api/admin/password-reset-completed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamp: Date.now() }),
        });
      } catch {
        // Non-critical audit call
      }

      return {
        success: true,
        message: 'Your administrator password has been reset successfully. You can now sign in with your new password.'
      };
    } catch {
      // If Firebase Auth fails, try server-side endpoint
    }
  }

  // 2. Try Server-side reset password endpoint
  try {
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: oobCode, newPassword })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Your administrator password has been updated successfully.'
      };
    }
    return {
      success: false,
      message: data.error || 'Failed to update password. Please request a new reset link.',
      error: 'RESET_FAILED'
    };
  } catch {
    return {
      success: false,
      message: 'Unable to communicate with the authentication server. Please try again.',
      error: 'NETWORK_ERROR'
    };
  }
}

