import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import firebaseConfigJson from '../../firebase-applet-config.json';

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
      storageBucket: cleanEnvVal(metaEnv.VITE_FIREBASE_STORAGE_BUCKET) || `${envProjectId}.appspot.com`,
      messagingSenderId: cleanEnvVal(metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID),
      appId: cleanEnvVal(metaEnv.VITE_FIREBASE_APP_ID),
      measurementId: cleanEnvVal(metaEnv.VITE_FIREBASE_MEASUREMENT_ID),
      firestoreDatabaseId: cleanEnvVal(metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID) || '(default)'
    };
  }

  // Fallback to firebase-applet-config.json if provisioned
  if (firebaseConfigJson && firebaseConfigJson.projectId && firebaseConfigJson.apiKey) {
    const projId = cleanEnvVal(firebaseConfigJson.projectId) || 'rohit-portfolio-e5225';
    return {
      apiKey: cleanEnvVal(firebaseConfigJson.apiKey),
      authDomain: cleanEnvVal(firebaseConfigJson.authDomain) || `${projId}.firebaseapp.com`,
      projectId: projId,
      storageBucket: cleanEnvVal(firebaseConfigJson.storageBucket) || `${projId}.firebasestorage.app`,
      messagingSenderId: cleanEnvVal(firebaseConfigJson.messagingSenderId),
      appId: cleanEnvVal(firebaseConfigJson.appId),
      measurementId: cleanEnvVal(firebaseConfigJson.measurementId),
      firestoreDatabaseId: cleanEnvVal(firebaseConfigJson.firestoreDatabaseId) || '(default)'
    };
  }

  return null;
};

const rawConfig = getFirebaseConfig();

export const isFirebaseConfigured = (): boolean => {
  return Boolean(rawConfig && rawConfig.apiKey && rawConfig.projectId);
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let appCheck: AppCheck | null = null;

if (rawConfig && rawConfig.apiKey && rawConfig.projectId) {
  try {
    if (!getApps().length) {
      app = initializeApp(rawConfig);
    } else {
      app = getApp();
    }

    if (app) {
      // Initialize Firestore with auto-detect long polling and ignoreUndefinedProperties
      try {
        db = initializeFirestore(app, {
          experimentalAutoDetectLongPolling: true,
          ignoreUndefinedProperties: true,
        });
      } catch (initDbError) {
        db = getFirestore(app);
      }

      auth = getAuth(app);
      storage = getStorage(app);

      // App Check Initialization - strictly optional
      const metaEnv = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (process.env as unknown as Record<string, string>);
      const rawSiteKey = metaEnv?.VITE_FIREBASE_APP_CHECK_SITE_KEY || (firebaseConfigJson as { recaptchaSiteKey?: string })?.recaptchaSiteKey;
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
  console.warn('[Firebase] Missing Firebase configuration. Features will fall back gracefully.');
}

export { app, db, auth, storage, appCheck };

export function getFirebaseConfigDetails() {
  return {
    projectId: rawConfig?.projectId || 'rohit-portfolio-e5225',
    firestoreDatabaseId: rawConfig?.firestoreDatabaseId || '(default)',
    isAppInitialized: Boolean(app),
    hasDb: Boolean(db),
    rawConfig
  };
}

/**
 * Helper to check if Firebase Storage is active and enabled for uploads.
 * On Spark plan or when Storage bucket is disabled/unavailable, returns false.
 */
export function isStorageAvailable(): boolean {
  if (!isFirebaseConfigured() || !storage) return false;

  const metaEnv = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (process.env as unknown as Record<string, string>);
  const storageEnabledEnv = metaEnv?.VITE_FIREBASE_STORAGE_ENABLED;
  if (storageEnabledEnv === 'false' || storageEnabledEnv === '0') {
    return false;
  }

  const bucket = (firebaseConfigJson as { storageBucket?: string })?.storageBucket || metaEnv?.VITE_FIREBASE_STORAGE_BUCKET || '';
  if (!bucket || bucket.includes('PLACEHOLDER') || bucket.includes('<')) {
    return false;
  }

  // If explicitly enabled via VITE_FIREBASE_STORAGE_ENABLED="true", return true
  if (storageEnabledEnv === 'true') {
    return true;
  }

  // Default to false while Storage is temporarily disabled on Spark plan
  return false;
}
