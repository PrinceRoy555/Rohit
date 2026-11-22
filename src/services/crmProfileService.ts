import { AdminUserProfile } from '../types/crmProfile';
import { db, auth, storage, isStorageAvailable } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PROFILE_STORAGE_KEY = 'rohitwork_crm_admin_profile';

export const DEFAULT_ADMIN_PROFILE: AdminUserProfile = {
  uid: 'rohit_super_admin',
  name: 'Rohit Verma',
  displayName: 'Rohit Verma',
  email: 'workall724038@gmail.com',
  role: 'super_admin',
  phone: '+91 7732869027',
  avatarType: 'library',
  avatarId: 'anime-shinobi',
  backgroundColor: '#6d28d9',
  bio: 'Founder & Creative Director at Rohitwork Creative Studios.',
  updatedAt: new Date().toISOString()
};

let cachedProfile: AdminUserProfile = (() => {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ADMIN_PROFILE, ...parsed };
    }
  } catch (e) {
    console.warn('[CRM Profile] Error reading local profile cache:', e);
  }
  return DEFAULT_ADMIN_PROFILE;
})();

const profileListeners = new Set<(profile: AdminUserProfile) => void>();

function notifyProfileListeners() {
  profileListeners.forEach((listener) => {
    try {
      listener(cachedProfile);
    } catch (err) {
      console.warn('[CRM Profile] Listener exception:', err);
    }
  });
}

/**
 * Returns current admin profile.
 */
export function getAdminProfile(): AdminUserProfile {
  return { ...cachedProfile };
}

/**
 * Subscribe to profile changes.
 */
export function subscribeAdminProfile(listener: (profile: AdminUserProfile) => void): () => void {
  profileListeners.add(listener);
  listener(cachedProfile);
  return () => {
    profileListeners.delete(listener);
  };
}

/**
 * Synchronize profile with Firestore if user is authenticated.
 */
export async function syncProfileWithFirestore(userUid?: string): Promise<AdminUserProfile> {
  const uid = userUid || auth?.currentUser?.uid || cachedProfile.uid || 'rohit_super_admin';
  if (!db) return cachedProfile;

  try {
    // 1. Try reading from adminProfiles collection
    const profileRef = doc(db, 'adminProfiles', uid);
    const snap = await getDoc(profileRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<AdminUserProfile>;
      cachedProfile = {
        ...cachedProfile,
        ...data,
        uid
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(cachedProfile));
      }
      notifyProfileListeners();
      return cachedProfile;
    }

    // 2. Try crmSettings/adminProfile as secondary cloud fallback
    const crmSettingsRef = doc(db, 'crmSettings', 'adminProfile');
    const crmSnap = await getDoc(crmSettingsRef);
    if (crmSnap.exists()) {
      const data = crmSnap.data() as Partial<AdminUserProfile>;
      cachedProfile = {
        ...cachedProfile,
        ...data,
        uid
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(cachedProfile));
      }
      notifyProfileListeners();
      return cachedProfile;
    }
  } catch (err) {
    console.info('[CRM Profile] Firestore sync skipped or offline:', err);
  }

  return cachedProfile;
}

/**
 * Save updated admin profile to local storage and Firestore.
 */
export async function saveAdminProfile(
  updates: Partial<AdminUserProfile>
): Promise<{ success: boolean; cloudSynced: boolean; profile: AdminUserProfile; error?: string }> {
  cachedProfile = {
    ...cachedProfile,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // 1. Write to localStorage immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(cachedProfile));
    } catch (e) {
      console.warn('[CRM Profile] Failed to write localStorage:', e);
    }
  }

  notifyProfileListeners();

  // 2. Persist to Firestore if available
  let cloudSynced = false;
  if (db) {
    const uid = auth?.currentUser?.uid || cachedProfile.uid || 'rohit_super_admin';
    try {
      const profileRef = doc(db, 'adminProfiles', uid);
      await setDoc(profileRef, cachedProfile, { merge: true });
      cloudSynced = true;
    } catch (err: any) {
      // If adminProfiles write fails due to permissions, try crmSettings fallback
      try {
        const crmRef = doc(db, 'crmSettings', 'adminProfile');
        await setDoc(crmRef, cachedProfile, { merge: true });
        cloudSynced = true;
      } catch (crmErr: any) {
        console.warn('[CRM Profile] Cloud sync notice:', crmErr?.message || err?.message);
      }
    }
  }

  return {
    success: true,
    cloudSynced,
    profile: { ...cachedProfile }
  };
}

/**
 * Resizes a custom photo client-side using an HTML Canvas to prevent storage bloat.
 */
async function resizeImageClientSide(file: File, maxDim = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export WebP or JPEG fallback
        const dataUrl = canvas.toDataURL('image/webp', 0.88);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload custom avatar image.
 * Uses Firebase Storage if configured and available; otherwise uses client-side compressed data URI.
 */
export async function uploadCustomProfilePhoto(
  file: File
): Promise<{ success: boolean; url?: string; storageType: 'cloud' | 'local'; error?: string }> {
  // 1. Validation
  const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validMimes.includes(file.type)) {
    return {
      success: false,
      storageType: 'local',
      error: 'Invalid file type. Please upload a PNG, JPG, WebP, or GIF image.'
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      storageType: 'local',
      error: 'File size exceeds 5MB limit. Please upload a smaller image.'
    };
  }

  // 2. Check Firebase Storage
  const storageActive = isStorageAvailable();
  const uid = auth?.currentUser?.uid || 'rohit_super_admin';

  if (storageActive && storage && auth?.currentUser) {
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `avatar_${Date.now()}.${ext}`;
      const storageRef = ref(storage, `crm-profiles/${uid}/${fileName}`);

      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: uid,
          uploadedAt: new Date().toISOString()
        }
      });

      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return {
        success: true,
        url: downloadUrl,
        storageType: 'cloud'
      };
    } catch (storageErr: any) {
      console.warn('[CRM Profile] Firebase Storage upload error, falling back to local compressed storage:', storageErr);
    }
  }

  // 3. Client-side compressed local fallback
  try {
    const dataUrl = await resizeImageClientSide(file, 256);
    return {
      success: true,
      url: dataUrl,
      storageType: 'local'
    };
  } catch (err: any) {
    return {
      success: false,
      storageType: 'local',
      error: err?.message || 'Failed to process image file.'
    };
  }
}

/**
 * Remove custom avatar and revert to library or initials.
 */
export async function removeCustomProfilePhoto(): Promise<{ success: boolean; profile: AdminUserProfile }> {
  const res = await saveAdminProfile({
    customPhotoUrl: undefined,
    avatarType: 'library',
    avatarId: cachedProfile.avatarId || 'anime-shinobi'
  });

  return {
    success: res.success,
    profile: res.profile
  };
}
