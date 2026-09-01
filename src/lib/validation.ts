/**
 * Central Input Validation & Sanitization Helpers
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Strip HTML tags and dangerous characters
export function sanitizeText(text: string | null | undefined, maxLength = 5000): string {
  if (!text) return '';
  // Remove HTML tags
  const sanitized = text
    .replace(/<[^>]*>?/gm, '')
    .trim();
  return sanitized.slice(0, maxLength);
}

// Normalize email address
export function normalizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

// Validate email format
export function validateEmail(email: string): ValidationResult {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return { isValid: false, error: 'Email address is required.' };
  }
  if (normalized.length > 200) {
    return { isValid: false, error: 'Email address must not exceed 200 characters.' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalized)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true };
}

// Validate name (2 - 100 chars)
export function validateName(name: string): ValidationResult {
  const sanitized = sanitizeText(name, 100);
  if (!sanitized || sanitized.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' };
  }
  if (sanitized.length > 100) {
    return { isValid: false, error: 'Name must not exceed 100 characters.' };
  }
  return { isValid: true };
}

// Validate business name (0 - 150 chars)
export function validateBusinessName(businessName?: string): ValidationResult {
  if (!businessName) return { isValid: true };
  const sanitized = sanitizeText(businessName, 150);
  if (sanitized.length > 150) {
    return { isValid: false, error: 'Business name must not exceed 150 characters.' };
  }
  return { isValid: true };
}

// Validate phone (up to 30 chars)
export function validatePhone(phone?: string, required = false): ValidationResult {
  if (!phone || !phone.trim()) {
    if (required) {
      return { isValid: false, error: 'Phone or WhatsApp number is required.' };
    }
    return { isValid: true };
  }
  const sanitized = phone.trim();
  if (sanitized.length < 7 || sanitized.length > 30) {
    return { isValid: false, error: 'Phone number must be between 7 and 30 characters.' };
  }
  return { isValid: true };
}

// Validate project description (10 - 5000 chars)
export function validateProjectDescription(description: string, minLength = 10): ValidationResult {
  const sanitized = sanitizeText(description, 5000);
  if (!sanitized || sanitized.length < minLength) {
    return { isValid: false, error: `Project details must be at least ${minLength} characters long.` };
  }
  return { isValid: true };
}

// Allowed file types for brief attachments
export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'zip'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed'
];
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export function validateAttachment(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'File size exceeds the 15 MB limit. Please upload a smaller file.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: `File type .${ext} is not allowed. Supported formats: PDF, JPG, PNG, WEBP, DOC, DOCX, ZIP.` };
  }

  return { isValid: true };
}

// Create safe sanitized filename
export function sanitizeFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const safeBase = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 50);
  return `${safeBase}.${ext}`;
}

// Helper to generate doc ID hash for emails (simple deterministic hash for browser)
export function hashEmailToDocId(email: string): string {
  const norm = normalizeEmail(email);
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    const char = norm.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Convert email to base64url safe string or prefixed hash
  const safePrefix = norm.replace(/[^a-z0-9]/g, '_').slice(0, 30);
  return `sub_${safePrefix}_${Math.abs(hash)}`;
}
