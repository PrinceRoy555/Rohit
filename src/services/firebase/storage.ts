import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import { storage, isFirebaseConfigured, isStorageAvailable } from '../../lib/firebase';
import {
  validateAttachment,
  sanitizeFileName
} from '../../lib/validation';

export interface UploadResult {
  success: boolean;
  downloadUrl?: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  storagePath?: string;
  error?: string;
}

export type UploadProgressCallback = (progressPercent: number) => void;

export async function uploadProjectBrief(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  if (!isFirebaseConfigured() || !storage || !isStorageAvailable()) {
    return {
      success: false,
      error: 'File upload is temporarily unavailable. You can still submit your enquiry without an attachment.'
    };
  }

  // Validate File
  const validation = validateAttachment(file);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    };
  }

  // Generate safe path: project-briefs/{year}/{month}/{uniqueId}-{safeName}
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const safeName = sanitizeFileName(file.name);
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `project-briefs/${year}/${month}/${uniqueId}-${safeName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    return new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(percent);
          }
        },
        (error) => {
          console.warn('[Firebase Storage] Upload skipped or unavailable:', error?.code || error);
          resolve({
            success: false,
            error: 'File upload is temporarily unavailable. You can still submit your enquiry without an attachment.'
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              downloadUrl,
              originalFilename: file.name,
              mimeType: file.type || 'application/octet-stream',
              fileSize: file.size,
              storagePath
            });
          } catch (urlError) {
            console.error('[Firebase Storage] Error fetching download URL:', urlError);
            resolve({
              success: false,
              error: 'Failed to retrieve uploaded file URL.'
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('[Firebase Storage] Initialization error:', error);
    return {
      success: false,
      error: 'Unable to start file upload.'
    };
  }
}

/**
 * Upload CMS media asset to Firebase Storage path: cms-media/{userId}/{fileName}
 */
export async function uploadAdminCMSMedia(
  file: File,
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  if (!isFirebaseConfigured() || !storage || !isStorageAvailable()) {
    return {
      success: false,
      error: 'Firebase Storage is currently unavailable.'
    };
  }

  // Validate File
  const validation = validateAttachment(file);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    };
  }

  const safeName = sanitizeFileName(file.name);
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `cms-media/${userId}/${uniqueId}-${safeName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userId
      }
    });

    return new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(percent);
          }
        },
        (error) => {
          console.warn('[Firebase Storage] Admin upload error:', error?.code || error);
          resolve({
            success: false,
            error: error?.message || 'File upload failed.'
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              downloadUrl,
              originalFilename: file.name,
              mimeType: file.type || 'application/octet-stream',
              fileSize: file.size,
              storagePath
            });
          } catch (urlError) {
            console.error('[Firebase Storage] Error fetching download URL:', urlError);
            resolve({
              success: false,
              error: 'Failed to retrieve uploaded file URL.'
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('[Firebase Storage] Admin upload initialization error:', error);
    return {
      success: false,
      error: 'Unable to start file upload.'
    };
  }
}
