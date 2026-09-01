import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';

export interface AuthStateResult {
  user: User | null;
  isFirebaseReady: boolean;
}

export async function signInAdmin(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, error: 'Firebase Auth is not configured.' };
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, user: cred.user };
  } catch (err) {
    const error = err as AuthError;
    console.error('[Firebase Auth] Sign in error:', error);
    return { success: false, error: error.message || 'Invalid administrator credentials.' };
  }
}

export async function signOutAdmin(): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { success: false, error: 'Firebase Auth is not configured.' };
  }
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: error.message };
  }
}

export function observeAuthState(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured() || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  if (!isFirebaseConfigured() || !auth) return null;
  return auth.currentUser;
}
