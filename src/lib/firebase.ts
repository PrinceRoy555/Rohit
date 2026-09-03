import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Firebase integration toggle - Set to true to enable all Firebase services, authentication, and database connections
export const FIREBASE_INTEGRATION_ENABLED = true;

// Exact Firebase Web App Configuration
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB_TS7hxSqENHMERmVhfPY-myZW5crYEig",
  authDomain: "rohit-72bfa.firebaseapp.com",
  projectId: "rohit-72bfa",
  storageBucket: "rohit-72bfa.firebasestorage.app",
  messagingSenderId: "444813274833",
  appId: "1:444813274833:web:7a4faf76c2090a4b57dff0",
  measurementId: "G-PRMKZMV6LR"
};

// Central contact fallbacks when Firebase is unavailable
export const FIREBASE_FALLBACK_CONTACT = {
  whatsapp: 'https://wa.me/message/E53AXF7SH5OMI1',
  email: 'mailto:workall724038@gmail.com',
  phone: 'tel:+919376569027',
  phoneDisplay: '+91 9376569027',
  emailDisplay: 'workall724038@gmail.com',
  message: 'Online enquiry submission is temporarily unavailable. Please contact Rohit through WhatsApp, email or phone.'
};

// Helper to clean environment variable strings (strips quotes, prefixes, brackets)
function cleanEnvVal(val: unknown): string {
  if (typeof val !== 'string') return '';
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  cleaned = cleaned.replace(/^(apiKey|ID|VITE_[A_Z0-9_]+)=/i, '').trim();
  if (cleaned.startsWith('<') && cleaned.endsWith('>')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

// Retrieve environment or config values
const getFirebaseConfig = () => {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (process.env as unknown as Record<string, string>);
  const envKey = cleanEnvVal(metaEnv?.VITE_FIREBASE_API_KEY);
  const envProjectId = cleanEnvVal(metaEnv?.VITE_FIREBASE_PROJECT_ID);

  if (envKey && envProjectId && envProjectId !== 'gen-lang-client-0536814422') {
    return {
      apiKey: envKey,
      authDomain: cleanEnvVal(metaEnv.VITE_FIREBASE_AUTH_DOMAIN) || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: cleanEnvVal(metaEnv.VITE_FIREBASE_STORAGE_BUCKET) || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: cleanEnvVal(metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID) || FIREBASE_CONFIG.messagingSenderId,
      appId: cleanEnvVal(metaEnv.VITE_FIREBASE_APP_ID) || FIREBASE_CONFIG.appId,
      measurementId: cleanEnvVal(metaEnv.VITE_FIREBASE_MEASUREMENT_ID) || FIREBASE_CONFIG.measurementId,
      firestoreDatabaseId: '(default)'
    };
  }

  // Authoritative Firebase web configuration
  return {
    apiKey: cleanEnvVal(firebaseConfigJson?.apiKey) || FIREBASE_CONFIG.apiKey,
    authDomain: cleanEnvVal(firebaseConfigJson?.authDomain) || FIREBASE_CONFIG.authDomain,
    projectId: cleanEnvVal(firebaseConfigJson?.projectId) || FIREBASE_CONFIG.projectId,
    storageBucket: cleanEnvVal(firebaseConfigJson?.storageBucket) || FIREBASE_CONFIG.storageBucket,
    messagingSenderId: cleanEnvVal(firebaseConfigJson?.messagingSenderId) || FIREBASE_CONFIG.messagingSenderId,
    appId: cleanEnvVal(firebaseConfigJson?.appId) || FIREBASE_CONFIG.appId,
    measurementId: cleanEnvVal(firebaseConfigJson?.measurementId) || FIREBASE_CONFIG.measurementId,
    firestoreDatabaseId: '(default)'
  };
};

const rawConfig = FIREBASE_INTEGRATION_ENABLED ? getFirebaseConfig() : null;

export const isFirebaseConfigured = (): boolean => {
  return Boolean(FIREBASE_INTEGRATION_ENABLED && rawConfig && rawConfig.apiKey && rawConfig.projectId);
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let appCheck: AppCheck | null = null;
const analytics = null;

if (FIREBASE_INTEGRATION_ENABLED && rawConfig && rawConfig.apiKey && rawConfig.projectId) {
  try {
    if (!getApps().length) {
      app = initializeApp(rawConfig);
    } else {
      app = getApp();
    }

    if (app) {
      // Initialize Firestore with forced long-polling and ignoreUndefinedProperties
      // This prevents WebSocket connection hangs in sandboxed iframes, proxies, and preview containers
      try {
        db = initializeFirestore(app, {
          experimentalForceLongPolling: true,
          ignoreUndefinedProperties: true,
        });
      } catch (initDbError) {
        db = getFirestore(app);
      }

      auth = getAuth(app);
      storage = getStorage(app);

      // App Check Initialization - strictly optional
      const metaEnv = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (process.env as unknown as Record<string, string>);
      const rawSiteKey = metaEnv?.VITE_FIREBASE_APP_CHECK_SITE_KEY;
      const appCheckSiteKey = typeof rawSiteKey === 'string' ? rawSiteKey.trim() : '';

      // Only initialize if key is present, non-empty, and not a template placeholder
      const isValidKeyFormat = appCheckSiteKey && 
        !appCheckSiteKey.startsWith('<') && 
        !appCheckSiteKey.includes('YOUR_') && 
        !appCheckSiteKey.includes('PLACEHOLDER') &&
        appCheckSiteKey.length > 10;

      if (isValidKeyFormat && typeof window !== 'undefined') {
        try {
          appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(appCheckSiteKey),
            isTokenAutoRefreshEnabled: true
          });
          console.log('[Firebase] App Check initialized successfully.');
        } catch (appCheckError) {
          console.warn('[Firebase] Optional App Check failed to initialize (continuing without App Check):', appCheckError);
          appCheck = null;
        }
      }
    }
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase:', error);
  }
} else {
  // Firebase integration is disabled or not configured
  if (!FIREBASE_INTEGRATION_ENABLED) {
    console.log('[Firebase] Firebase integration is disabled. App is operating in standalone full-stack mode.');
  } else {
    console.warn('[Firebase] Missing Firebase configuration. Features will fall back gracefully.');
  }
}

export { app, db, auth, storage, appCheck, analytics };

export function getFirebaseConfigDetails() {
  return {
    projectId: rawConfig?.projectId || 'rohit-72bfa',
    firestoreDatabaseId: rawConfig?.firestoreDatabaseId || '(default)',
    isAppInitialized: Boolean(app),
    hasDb: Boolean(db),
    rawConfig
  };
}

/**
 * Helper to check if Firebase Storage is active and enabled for uploads.
 * Uses the configured Firebase Storage bucket (rohit-72bfa.firebasestorage.app).
 */
export function isStorageAvailable(): boolean {
  if (!isFirebaseConfigured() || !storage) return false;

  const metaEnv = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (process.env as unknown as Record<string, string>);
  const storageEnabledEnv = metaEnv?.VITE_FIREBASE_STORAGE_ENABLED;
  if (storageEnabledEnv === 'false' || storageEnabledEnv === '0') {
    return false;
  }

  const bucket = (firebaseConfigJson as { storageBucket?: string })?.storageBucket || metaEnv?.VITE_FIREBASE_STORAGE_BUCKET || FIREBASE_CONFIG.storageBucket || '';
  if (!bucket || bucket.includes('PLACEHOLDER') || bucket.includes('<')) {
    return false;
  }

  return true;
}
