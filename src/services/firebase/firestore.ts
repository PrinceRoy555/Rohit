import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured, FIREBASE_FALLBACK_CONTACT, getFirebaseConfigDetails } from '../../lib/firebase';
import {
  normalizeEmail,
  sanitizeText,
  hashEmailToDocId,
  validateEmail,
  validateName,
  validatePhone,
  validateProjectDescription
} from '../../lib/validation';
import { Insight, InsightAutomationSettings } from '../../types';
import { INITIAL_INSIGHTS, DEFAULT_AUTOMATION_SETTINGS } from '../../insightsData';


export interface ServiceResponse<T = unknown> {
  success: boolean;
  id?: string;
  data?: T;
  error?: string;
  errorCode?: string;
  isDuplicate?: boolean;
}

export interface ContactEnquiryPayload {
  submissionId?: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  selectedService: string;
  budgetRange?: string;
  deadline?: string;
  projectDescription: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number | null;
  attachmentPath?: string | null;
  attachmentStatus?: string;
  consentAccepted: boolean;
  pageUrl?: string;
  source?: string;
}

export interface ChatbotLeadPayload {
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  requiredService?: string;
  projectDescription?: string;
  preferredStyle?: string;
  targetAudience?: string;
  budgetRange?: string;
  deadline?: string;
  conversationSummary?: string;
  consentAccepted?: boolean;
  pageUrl?: string;
}

export interface QuoteRequestPayload {
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  packageName?: string;
  requiredService?: string;
  projectDescription?: string;
  budgetRange?: string;
  deadline?: string;
  pageUrl?: string;
}

/**
 * Helper to purge undefined values from Firestore payloads
 */
function removeUndefinedValues<T extends Record<string, unknown>>(data: T): T {
  const cleanData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      cleanData[key] = val;
    }
  }
  return cleanData as T;
}

/**
 * Submit Contact Enquiry to 'contactEnquiries'
 */
export async function submitContactEnquiry(payload: ContactEnquiryPayload): Promise<ServiceResponse> {
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
  const configDetails = getFirebaseConfigDetails();
  const projectId = configDetails.projectId;
  const isDbAvailable = Boolean(db);

  if (isDev) {
    console.log('[CONTACT-DEBUG] firebase-project', projectId);
    console.log('[Contact] Firestore available:', isDbAvailable);
  }

  // Sanitization & Validation
  const nameVal = validateName(payload.name);
  if (!nameVal.isValid) return { success: false, errorCode: 'invalid-argument', error: nameVal.error };

  const emailVal = validateEmail(payload.email);
  if (!emailVal.isValid) return { success: false, errorCode: 'invalid-argument', error: emailVal.error };

  const phoneVal = validatePhone(payload.phone, false);
  if (!phoneVal.isValid) return { success: false, errorCode: 'invalid-argument', error: phoneVal.error };

  const descVal = validateProjectDescription(payload.projectDescription, 10);
  if (!descVal.isValid) return { success: false, errorCode: 'invalid-argument', error: descVal.error };

  if (!payload.consentAccepted) {
    return { success: false, errorCode: 'invalid-argument', error: 'Please accept the consent checkbox to submit your enquiry.' };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      success: false,
      errorCode: 'offline',
      error: 'You appear to be offline. Please reconnect and try again.'
    };
  }

  if (!isFirebaseConfigured() || !db) {
    if (isDev) {
      console.warn('[Contact] Firestore not configured or db is null');
    }
    return {
      success: false,
      errorCode: 'not-configured',
      error: FIREBASE_FALLBACK_CONTACT.message
    };
  }

  const docData: Record<string, unknown> = {
    name: sanitizeText(payload.name, 100),
    email: normalizeEmail(payload.email),
    selectedService: sanitizeText(payload.selectedService, 100),
    projectDescription: sanitizeText(payload.projectDescription, 5000),
    consentAccepted: true,
    source: payload.source ? sanitizeText(payload.source, 100) : 'website-contact-form',
    status: 'new',
    createdAt: serverTimestamp()
  };

  if (payload.businessName && payload.businessName.trim()) {
    docData.businessName = sanitizeText(payload.businessName, 150);
  }
  if (payload.phone && payload.phone.trim()) {
    docData.phone = sanitizeText(payload.phone, 30);
  }
  if (payload.budgetRange && payload.budgetRange.trim()) {
    docData.budgetRange = sanitizeText(payload.budgetRange, 100);
  }
  if (payload.deadline && payload.deadline.trim()) {
    docData.deadline = sanitizeText(payload.deadline, 100);
  }

  if (payload.attachmentUrl) {
    docData.attachmentUrl = payload.attachmentUrl;
    docData.attachmentName = payload.attachmentName ? sanitizeText(payload.attachmentName, 150) : null;
    docData.attachmentStatus = payload.attachmentStatus || 'uploaded';
    if (payload.attachmentType) docData.attachmentType = payload.attachmentType;
    if (payload.attachmentSize) docData.attachmentSize = payload.attachmentSize;
    if (payload.attachmentPath) docData.attachmentPath = payload.attachmentPath;
  }

  const pageUrl = payload.pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
  if (pageUrl) {
    docData.pageUrl = sanitizeText(pageUrl, 2000);
  }
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (userAgent) {
    docData.userAgent = sanitizeText(userAgent, 500);
  }

  const cleanPayload = removeUndefinedValues(docData);

  if (isDev) {
    console.log('[CONTACT-DEBUG] firestore-start');
  }

  try {
    let submissionId: string;
    if (payload.submissionId) {
      const docRef = doc(db, 'contactEnquiries', payload.submissionId);
      submissionId = docRef.id;
      await setDoc(docRef, cleanPayload);
    } else {
      const colRef = collection(db, 'contactEnquiries');
      const docRef = await addDoc(colRef, cleanPayload);
      submissionId = docRef.id;
    }

    if (isDev) {
      console.log('[CONTACT-DEBUG] firestore-success', submissionId);
    }
    return { success: true, id: submissionId };
  } catch (error: unknown) {
    const errObj = error as { code?: string; message?: string };
    const rawCode = errObj?.code || errObj?.message || 'unknown-error';
    const cleanCode = typeof rawCode === 'string'
      ? rawCode.replace(/^firestore\//, '').replace(/^FirebaseError:\s*/, '')
      : 'unknown-error';

    if (isDev) {
      console.error('[Contact] Firestore write error + Firebase error code:', cleanCode, error);
    }

    return {
      success: false,
      errorCode: cleanCode,
      error: getReadableFirebaseError(cleanCode)
    };
  }
}

/**
 * Submit Uni AI Chatbot Lead to 'chatbotLeads'
 */
export async function submitChatbotLead(payload: ChatbotLeadPayload): Promise<ServiceResponse> {
  if (!isFirebaseConfigured() || !db) {
    return {
      success: false,
      error: FIREBASE_FALLBACK_CONTACT.message
    };
  }

  const emailVal = validateEmail(payload.email);
  if (!emailVal.isValid) return { success: false, error: emailVal.error };

  const docData: Record<string, unknown> = {
    name: sanitizeText(payload.name || 'Anonymous Visitor', 100),
    email: normalizeEmail(payload.email),
    source: 'uni-ai-chatbot',
    status: 'new',
    createdAt: serverTimestamp(),
    pageUrl: payload.pageUrl || (typeof window !== 'undefined' ? window.location.href : '')
  };

  if (payload.businessName) docData.businessName = sanitizeText(payload.businessName, 150);
  if (payload.phone) docData.phone = sanitizeText(payload.phone, 30);
  if (payload.requiredService) docData.requiredService = sanitizeText(payload.requiredService, 100);
  if (payload.projectDescription) docData.projectDescription = sanitizeText(payload.projectDescription, 5000);
  if (payload.preferredStyle) docData.preferredStyle = sanitizeText(payload.preferredStyle, 200);
  if (payload.targetAudience) docData.targetAudience = sanitizeText(payload.targetAudience, 200);
  if (payload.budgetRange) docData.budgetRange = sanitizeText(payload.budgetRange, 100);
  if (payload.deadline) docData.deadline = sanitizeText(payload.deadline, 100);
  if (payload.conversationSummary) docData.conversationSummary = sanitizeText(payload.conversationSummary, 8000);
  if (typeof payload.consentAccepted === 'boolean') docData.consentAccepted = payload.consentAccepted;

  try {
    const colRef = collection(db, 'chatbotLeads');
    const docRef = await addDoc(colRef, removeUndefinedValues(docData));
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('[Firestore] Error submitting chatbot lead:', error);
    return {
      success: false,
      error: 'Unable to save your chatbot enquiry. Please reach out on WhatsApp directly.'
    };
  }
}

/**
 * Submit Quote Request to 'quoteRequests'
 */
export async function submitQuoteRequest(payload: QuoteRequestPayload): Promise<ServiceResponse> {
  if (!isFirebaseConfigured() || !db) {
    return {
      success: false,
      error: FIREBASE_FALLBACK_CONTACT.message
    };
  }

  const emailVal = validateEmail(payload.email);
  if (!emailVal.isValid) return { success: false, error: emailVal.error };

  const nameVal = validateName(payload.name);
  if (!nameVal.isValid) return { success: false, error: nameVal.error };

  const docData: Record<string, unknown> = {
    name: sanitizeText(payload.name, 100),
    email: normalizeEmail(payload.email),
    source: 'website-pricing',
    status: 'new',
    createdAt: serverTimestamp(),
    pageUrl: payload.pageUrl || (typeof window !== 'undefined' ? window.location.href : '')
  };

  if (payload.businessName) docData.businessName = sanitizeText(payload.businessName, 150);
  if (payload.phone) docData.phone = sanitizeText(payload.phone, 30);
  if (payload.packageName) docData.packageName = sanitizeText(payload.packageName, 100);
  if (payload.requiredService) docData.requiredService = sanitizeText(payload.requiredService, 100);
  if (payload.projectDescription) docData.projectDescription = sanitizeText(payload.projectDescription, 5000);
  if (payload.budgetRange) docData.budgetRange = sanitizeText(payload.budgetRange, 100);
  if (payload.deadline) docData.deadline = sanitizeText(payload.deadline, 100);

  try {
    const colRef = collection(db, 'quoteRequests');
    const docRef = await addDoc(colRef, removeUndefinedValues(docData));
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('[Firestore] Error submitting quote request:', error);
    return {
      success: false,
      error: 'Unable to process quote request. Please contact Rohit directly.'
    };
  }
}

/**
 * Subscribe to Newsletter in 'newsletterSubscribers'
 */
export async function subscribeToNewsletter(email: string): Promise<ServiceResponse> {
  if (!isFirebaseConfigured() || !db) {
    return {
      success: false,
      error: FIREBASE_FALLBACK_CONTACT.message
    };
  }

  const emailVal = validateEmail(email);
  if (!emailVal.isValid) return { success: false, error: emailVal.error };

  const normEmail = normalizeEmail(email);
  const docId = hashEmailToDocId(normEmail);
  const docRef = doc(db, 'newsletterSubscribers', docId);

  try {
    // Perform idempotent write directly without reading doc first (which is restricted by security rules)
    await setDoc(docRef, {
      email: normEmail,
      emailNormalised: normEmail,
      status: 'active',
      source: 'website-newsletter',
      subscribedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, id: docId };
  } catch (error) {
    console.error('[Firestore] Error subscribing to newsletter:', error);
    return {
      success: false,
      error: 'Unable to subscribe right now. Please try again later.'
    };
  }
}

/**
 * ========================================================
 * UNIFIED CRM LEADS FIRESTORE SERVICES
 * ========================================================
 */
export interface UnifiedLeadPayload {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  service?: string;
  packageName?: string;
  message?: string;
  projectDescription?: string;
  budget?: string;
  budgetRange?: string;
  deadline?: string;
  attachmentUrl?: string | null;
  conversationSummary?: string;
  source: string;
  status?: string;
  notes?: string;
  pageUrl?: string;
}

export async function submitUnifiedLead(payload: UnifiedLeadPayload): Promise<ServiceResponse> {
  if (!isFirebaseConfigured() || !db) {
    return {
      success: false,
      error: FIREBASE_FALLBACK_CONTACT.message
    };
  }

  const emailVal = validateEmail(payload.email);
  if (!emailVal.isValid) return { success: false, error: emailVal.error };

  const nameVal = validateName(payload.name);
  if (!nameVal.isValid) return { success: false, error: nameVal.error };

  const cleanDocId = payload.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const docData: Record<string, unknown> = {
    name: sanitizeText(payload.name, 100),
    email: normalizeEmail(payload.email),
    source: sanitizeText(payload.source || 'website-contact-form', 50),
    status: payload.status || 'new',
    createdAt: serverTimestamp(),
    createdAtIso: nowIso,
    pageUrl: payload.pageUrl || (typeof window !== 'undefined' ? window.location.href : '')
  };

  if (payload.phone) docData.phone = sanitizeText(payload.phone, 30);
  if (payload.businessName) docData.businessName = sanitizeText(payload.businessName, 150);
  if (payload.service) docData.service = sanitizeText(payload.service, 100);
  if (payload.packageName) docData.packageName = sanitizeText(payload.packageName, 100);
  if (payload.message) docData.message = sanitizeText(payload.message, 8000);
  if (payload.projectDescription) docData.projectDescription = sanitizeText(payload.projectDescription, 8000);
  if (payload.budget) docData.budget = sanitizeText(payload.budget, 100);
  if (payload.budgetRange) docData.budgetRange = sanitizeText(payload.budgetRange, 100);
  if (payload.deadline) docData.deadline = sanitizeText(payload.deadline, 100);
  if (payload.attachmentUrl) docData.attachmentUrl = sanitizeText(payload.attachmentUrl, 2000);
  if (payload.conversationSummary) docData.conversationSummary = sanitizeText(payload.conversationSummary, 8000);
  if (payload.notes) docData.notes = sanitizeText(payload.notes, 2000);

  try {
    const colRef = collection(db, 'leads');
    const docRef = doc(colRef, cleanDocId);
    await setDoc(docRef, removeUndefinedValues(docData));
    return { success: true, id: cleanDocId };
  } catch (error) {
    console.error('[Firestore] Error submitting unified lead:', error);
    return {
      success: false,
      error: 'Failed to record lead in Firestore.'
    };
  }
}

export async function fetchAllLeadsFromFirestore(): Promise<any[]> {
  if (!isFirebaseConfigured() || !db) return [];

  try {
    const results: any[] = [];
    const seenIds = new Set<string>();

    // 1. Fetch from canonical leads collection
    try {
      const leadsRef = collection(db, 'leads');
      const snap = await getDocs(leadsRef);
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        seenIds.add(docSnap.id);
        results.push({
          id: docSnap.id,
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          businessName: d.businessName || '',
          service: d.service || d.selectedService || d.requiredService || d.packageName || 'General Inquiry',
          message: d.message || d.projectDescription || d.conversationSummary || '',
          status: d.status || 'new',
          source: d.source || 'website-contact-form',
          createdAt: d.createdAtIso || (d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : new Date().toISOString()),
          notes: d.notes || '',
          budgetRange: d.budgetRange || d.budget || '',
          attachmentUrl: d.attachmentUrl || null,
          followUpAt: d.followUpAt?.toDate ? d.followUpAt.toDate().toISOString() : (d.followUpAt || null),
          followUpStatus: d.followUpStatus || (d.followUpAt ? 'pending' : null),
          nextAction: d.nextAction || '',
          lastContactedAt: d.lastContactedAt?.toDate ? d.lastContactedAt.toDate().toISOString() : (d.lastContactedAt || null),
          priority: d.priority || 'medium',
          leadScore: typeof d.leadScore === 'number' ? d.leadScore : undefined,
          isHotLead: typeof d.isHotLead === 'boolean' ? d.isHotLead : undefined,
          tags: Array.isArray(d.tags) ? d.tags : [],
          internalNotes: d.internalNotes || d.notes || ''
        });
      });
    } catch (e) {
      console.warn('[Firestore] Note fetching leads collection:', e);
    }

    // 2. Also fetch from contactEnquiries collection (shown in Firebase Console)
    try {
      const enquiriesRef = collection(db, 'contactEnquiries');
      const snap = await getDocs(enquiriesRef);
      snap.forEach((docSnap) => {
        if (!seenIds.has(docSnap.id)) {
          seenIds.add(docSnap.id);
          const d = docSnap.data();
          results.push({
            id: docSnap.id,
            name: d.name || '',
            email: d.email || '',
            phone: d.phone || '',
            businessName: d.businessName || '',
            service: d.service || d.selectedService || d.requiredService || d.packageName || 'Contact Form',
            message: d.message || d.projectDescription || d.conversationSummary || '',
            status: d.status || 'new',
            source: d.source || 'website-contact-form',
            createdAt: d.createdAtIso || (d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : (d.createdAt ? String(d.createdAt) : new Date().toISOString())),
            notes: d.notes || '',
            budgetRange: d.budgetRange || d.budget || '',
            attachmentUrl: d.attachmentUrl || null,
            followUpAt: d.followUpAt?.toDate ? d.followUpAt.toDate().toISOString() : (d.followUpAt || null),
            followUpStatus: d.followUpStatus || (d.followUpAt ? 'pending' : null),
            nextAction: d.nextAction || '',
            lastContactedAt: d.lastContactedAt?.toDate ? d.lastContactedAt.toDate().toISOString() : (d.lastContactedAt || null),
            priority: d.priority || 'medium',
            leadScore: typeof d.leadScore === 'number' ? d.leadScore : undefined,
            isHotLead: typeof d.isHotLead === 'boolean' ? d.isHotLead : undefined,
            tags: Array.isArray(d.tags) ? d.tags : [],
            internalNotes: d.internalNotes || d.notes || ''
          });
        }
      });
    } catch (e) {
      console.warn('[Firestore] Note fetching contactEnquiries collection:', e);
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('[Firestore] Error fetching all leads:', err);
    return [];
  }
}

export async function updateLeadStatusInFirestore(leadId: string, status: string, notes?: string): Promise<ServiceResponse> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Database unconfigured' };
  try {
    const updateData: Record<string, unknown> = { status };
    if (notes !== undefined) updateData.notes = notes;

    try {
      const docRef = doc(db, 'leads', leadId);
      await updateDoc(docRef, updateData);
    } catch (errLeads) {
      // Try contactEnquiries
      const enquiryRef = doc(db, 'contactEnquiries', leadId);
      await updateDoc(enquiryRef, updateData);
    }
    return { success: true, id: leadId };
  } catch (err) {
    console.error('[Firestore] Error updating lead:', err);
    return { success: false, error: 'Failed to update lead status' };
  }
}

export async function updateLeadCrmDataInFirestore(leadId: string, updates: Record<string, unknown>): Promise<ServiceResponse> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Database unconfigured' };
  try {
    const cleanUpdates = removeUndefinedValues(updates);

    try {
      const docRef = doc(db, 'leads', leadId);
      await updateDoc(docRef, cleanUpdates);
    } catch (errLeads) {
      // Fallback to contactEnquiries
      const enquiryRef = doc(db, 'contactEnquiries', leadId);
      await updateDoc(enquiryRef, cleanUpdates);
    }
    return { success: true, id: leadId };
  } catch (err) {
    console.error('[Firestore] Error updating CRM fields on lead:', err);
    return { success: false, error: 'Failed to update CRM data' };
  }
}

export async function deleteLeadFromFirestore(leadId: string): Promise<ServiceResponse> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Database unconfigured' };
  try {
    try {
      const docRef = doc(db, 'leads', leadId);
      await deleteDoc(docRef);
    } catch (errLeads) {
      const enquiryRef = doc(db, 'contactEnquiries', leadId);
      await deleteDoc(enquiryRef);
    }
    return { success: true, id: leadId };
  } catch (err) {
    console.error('[Firestore] Error deleting lead:', err);
    return { success: false, error: 'Failed to delete lead' };
  }
}

/**
 * ========================================================
 * SITE CONFIG, REVISIONS, AND TEMPLATES FIRESTORE SERVICES
 * ========================================================
 */
import { SiteConfig, SiteRevision, SiteTemplate, MediaItem } from '../../types/cms';
import { DEFAULT_SITE_CONFIG, BUILT_IN_TEMPLATES } from '../../data/defaultSiteConfig';

export async function fetchLiveSiteConfigFromFirestore(): Promise<SiteConfig | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const docRef = doc(db, 'siteConfig', 'live');
    const snap = await Promise.race([
      getDoc(docRef),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500))
    ]);
    if (snap && snap.exists()) {
      return snap.data() as SiteConfig;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Note: Could not fetch live siteConfig:', err);
    return null;
  }
}

export async function saveLiveSiteConfigToFirestore(config: SiteConfig): Promise<ServiceResponse<SiteConfig>> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firestore unconfigured' };
  try {
    const docRef = doc(db, 'siteConfig', 'live');
    const cleanConfig = removeUndefinedValues(JSON.parse(JSON.stringify(config)));
    await setDoc(docRef, cleanConfig, { merge: true });
    return { success: true, data: config };
  } catch (err: any) {
    console.error('[Firestore] Error saving live siteConfig:', err);
    return { success: false, error: err.message || 'Failed to save live config' };
  }
}

export async function fetchDraftSiteConfigFromFirestore(): Promise<SiteConfig | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const docRef = doc(db, 'siteConfig', 'draft');
    const snap = await Promise.race([
      getDoc(docRef),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500))
    ]);
    if (snap && snap.exists()) {
      return snap.data() as SiteConfig;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Could not fetch draft siteConfig:', err);
    return null;
  }
}

export async function saveDraftSiteConfigToFirestore(config: SiteConfig): Promise<ServiceResponse<SiteConfig>> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firestore unconfigured' };
  try {
    const docRef = doc(db, 'siteConfig', 'draft');
    const cleanConfig = removeUndefinedValues(JSON.parse(JSON.stringify(config)));
    await setDoc(docRef, cleanConfig, { merge: true });
    return { success: true, data: config };
  } catch (err: any) {
    console.error('[Firestore] Error saving draft siteConfig:', err);
    return { success: false, error: err.message || 'Failed to save draft config' };
  }
}

export async function clearDraftSiteConfigInFirestore(): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const docRef = doc(db, 'siteConfig', 'draft');
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] Error clearing draft doc:', err);
  }
}

export async function createSiteRevisionInFirestore(revision: SiteRevision): Promise<ServiceResponse<SiteRevision>> {
  if (!isFirebaseConfigured() || !db) return { success: false, error: 'Firestore unconfigured' };
  try {
    const docRef = doc(db, 'siteRevisions', revision.id);
    const cleanRev = removeUndefinedValues(JSON.parse(JSON.stringify(revision)));
    await setDoc(docRef, cleanRev);
    return { success: true, data: revision };
  } catch (err: any) {
    console.error('[Firestore] Error creating revision:', err);
    return { success: false, error: err.message || 'Failed to save revision' };
  }
}

export async function fetchSiteRevisionsFromFirestore(): Promise<SiteRevision[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, 'siteRevisions');
    const snap = await getDocs(colRef);
    const list: SiteRevision[] = [];
    snap.forEach((d) => {
      list.push(d.data() as SiteRevision);
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.warn('[Firestore] Error fetching revisions:', err);
    return [];
  }
}

export async function fetchSiteTemplatesFromFirestore(): Promise<SiteTemplate[]> {
  if (!isFirebaseConfigured() || !db) return BUILT_IN_TEMPLATES;
  try {
    const colRef = collection(db, 'siteTemplates');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Seed built in templates
      for (const t of BUILT_IN_TEMPLATES) {
        await setDoc(doc(db, 'siteTemplates', t.id), t).catch(() => {});
      }
      return BUILT_IN_TEMPLATES;
    }
    const list: SiteTemplate[] = [];
    snap.forEach((d) => list.push(d.data() as SiteTemplate));
    return list;
  } catch (err) {
    return BUILT_IN_TEMPLATES;
  }
}

export async function saveSiteTemplateToFirestore(template: SiteTemplate): Promise<ServiceResponse<SiteTemplate>> {
  if (!isFirebaseConfigured() || !db) return { success: true, data: template };
  try {
    const docRef = doc(db, 'siteTemplates', template.id);
    await setDoc(docRef, removeUndefinedValues(JSON.parse(JSON.stringify(template))));
    return { success: true, data: template };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save template' };
  }
}

/**
 * ========================================================
 * MEDIA ASSET LIBRARY FIRESTORE SERVICES
 * ========================================================
 */
export async function fetchMediaItemsFromFirestore(): Promise<MediaItem[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, 'media');
    const snap = await getDocs(colRef);
    const list: MediaItem[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as MediaItem));
    return list.sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());
  } catch (err) {
    console.warn('[Firestore] Error fetching media items:', err);
    return [];
  }
}

export async function saveMediaItemToFirestore(item: MediaItem): Promise<ServiceResponse<MediaItem>> {
  if (!isFirebaseConfigured() || !db) return { success: true, data: item };
  try {
    const docRef = doc(db, 'media', item.id);
    await setDoc(docRef, removeUndefinedValues(JSON.parse(JSON.stringify(item))));
    return { success: true, data: item };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save media item' };
  }
}

export async function deleteMediaItemFromFirestore(id: string): Promise<ServiceResponse> {
  if (!isFirebaseConfigured() || !db) return { success: true, id };
  try {
    const docRef = doc(db, 'media', id);
    await deleteDoc(docRef);
    return { success: true, id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete media item' };
  }
}

/**
 * ========================================================
 * INSIGHTS CMS & AUTOMATION FIRESTORE SERVICES
 * ========================================================
 */

let cachedInsights: Insight[] = [...INITIAL_INSIGHTS];

/**
 * Fetch all insights. If includeUnpublished is true, returns drafts/reviews too.
 */
export async function fetchInsights(includeUnpublished = false): Promise<Insight[]> {
  if (!isFirebaseConfigured() || !db) {
    if (includeUnpublished) return cachedInsights;
    return cachedInsights.filter(i => i.status === 'published');
  }

  try {
    const colRef = collection(db, 'insights');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Seed default insights so data is immediately available
      seedInitialInsights().catch(() => {});
      if (includeUnpublished) return cachedInsights;
      return cachedInsights.filter(i => i.status === 'published');
    }

    const list: Insight[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        title: data.title || '',
        slug: data.slug || docSnap.id,
        shortDescription: data.shortDescription || data.excerpt || '',
        content: data.content || '',
        featuredImage: data.featuredImage || data.image || '',
        category: data.category || 'General',
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: data.author || 'Rohit Verma',
        publishDate: data.publishDate || '',
        readingTime: data.readingTime || '4 min read',
        seoTitle: data.seoTitle || data.title || '',
        seoDescription: data.seoDescription || data.shortDescription || '',
        status: data.status || 'published',
        schedulePublishDate: data.schedulePublishDate || null,
        viewsCount: data.viewsCount || 0,
        createdDate: data.createdDate || new Date().toISOString(),
        updatedDate: data.updatedDate || new Date().toISOString(),
        isAiGenerated: Boolean(data.isAiGenerated)
      });
    });

    // Update memory cache
    cachedInsights = list;

    if (includeUnpublished) {
      return list.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }

    return list
      .filter((item) => item.status === 'published')
      .sort((a, b) => new Date(b.publishDate || b.createdDate).getTime() - new Date(a.publishDate || a.createdDate).getTime());
  } catch (error) {
    console.warn('[Firestore] Error fetching insights, using fallback cache:', error);
    if (includeUnpublished) return cachedInsights;
    return cachedInsights.filter(i => i.status === 'published');
  }
}

/**
 * Fetch a single insight by slug or id
 */
export async function fetchInsightBySlug(slug: string): Promise<Insight | null> {
  const cleanSlug = slug.toLowerCase().trim();

  // Check local cache first
  const localMatch = cachedInsights.find(i => i.slug.toLowerCase() === cleanSlug || i.id === cleanSlug);
  if (localMatch) return localMatch;

  if (!isFirebaseConfigured() || !db) {
    return null;
  }

  try {
    const colRef = collection(db, 'insights');
    const q = query(colRef, where('slug', '==', cleanSlug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || '',
        slug: data.slug || docSnap.id,
        shortDescription: data.shortDescription || data.excerpt || '',
        content: data.content || '',
        featuredImage: data.featuredImage || data.image || '',
        category: data.category || 'General',
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: data.author || 'Rohit Verma',
        publishDate: data.publishDate || '',
        readingTime: data.readingTime || '4 min read',
        seoTitle: data.seoTitle || data.title || '',
        seoDescription: data.seoDescription || data.shortDescription || '',
        status: data.status || 'published',
        schedulePublishDate: data.schedulePublishDate || null,
        viewsCount: data.viewsCount || 0,
        createdDate: data.createdDate || new Date().toISOString(),
        updatedDate: data.updatedDate || new Date().toISOString(),
        isAiGenerated: Boolean(data.isAiGenerated)
      };
    }

    // Try direct ID lookup
    const directDoc = await getDoc(doc(db, 'insights', cleanSlug));
    if (directDoc.exists()) {
      const data = directDoc.data();
      return {
        id: directDoc.id,
        title: data.title || '',
        slug: data.slug || directDoc.id,
        shortDescription: data.shortDescription || data.excerpt || '',
        content: data.content || '',
        featuredImage: data.featuredImage || data.image || '',
        category: data.category || 'General',
        tags: Array.isArray(data.tags) ? data.tags : [],
        author: data.author || 'Rohit Verma',
        publishDate: data.publishDate || '',
        readingTime: data.readingTime || '4 min read',
        seoTitle: data.seoTitle || data.title || '',
        seoDescription: data.seoDescription || data.shortDescription || '',
        status: data.status || 'published',
        schedulePublishDate: data.schedulePublishDate || null,
        viewsCount: data.viewsCount || 0,
        createdDate: data.createdDate || new Date().toISOString(),
        updatedDate: data.updatedDate || new Date().toISOString(),
        isAiGenerated: Boolean(data.isAiGenerated)
      };
    }

    return null;
  } catch (error) {
    console.error('[Firestore] Error looking up insight by slug:', error);
    return null;
  }
}

/**
 * Save or update an insight document in Firestore
 */
export async function saveInsight(insight: Partial<Insight>): Promise<ServiceResponse<Insight>> {
  const docId = insight.id || insight.slug || `insight-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const formatted: Insight = {
    id: docId,
    title: sanitizeText(insight.title || 'Untitled Insight', 250),
    slug: (insight.slug || docId).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
    shortDescription: sanitizeText(insight.shortDescription || '', 1000),
    content: insight.content || '',
    featuredImage: insight.featuredImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    category: sanitizeText(insight.category || 'Graphic Design', 100),
    tags: Array.isArray(insight.tags) ? insight.tags.map(t => sanitizeText(t, 50)) : ['Graphic Design'],
    author: sanitizeText(insight.author || 'Rohit Verma', 100),
    publishDate: insight.publishDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readingTime: insight.readingTime || '4 min read',
    seoTitle: sanitizeText(insight.seoTitle || insight.title || '', 200),
    seoDescription: sanitizeText(insight.seoDescription || insight.shortDescription || '', 500),
    status: (insight.status as any) || 'published',
    schedulePublishDate: insight.schedulePublishDate || null,
    viewsCount: insight.viewsCount || 0,
    createdDate: insight.createdDate || nowIso,
    updatedDate: nowIso,
    isAiGenerated: Boolean(insight.isAiGenerated)
  };

  // Update local cache immediately
  const existingIdx = cachedInsights.findIndex(i => i.id === docId || i.slug === formatted.slug);
  if (existingIdx >= 0) {
    cachedInsights[existingIdx] = formatted;
  } else {
    cachedInsights.unshift(formatted);
  }

  if (!isFirebaseConfigured() || !db) {
    return { success: true, id: docId, data: formatted };
  }

  try {
    const docRef = doc(db, 'insights', docId);
    await setDoc(docRef, removeUndefinedValues(formatted as unknown as Record<string, unknown>), { merge: true });
    return { success: true, id: docId, data: formatted };
  } catch (error) {
    console.error('[Firestore] Error saving insight:', error);
    return {
      success: false,
      error: 'Failed to write insight to Firestore. Changes saved in local session.'
    };
  }
}

/**
 * Delete an insight document
 */
export async function deleteInsight(id: string): Promise<ServiceResponse> {
  cachedInsights = cachedInsights.filter(i => i.id !== id && i.slug !== id);

  if (!isFirebaseConfigured() || !db) {
    return { success: true, id };
  }

  try {
    const docRef = doc(db, 'insights', id);
    await deleteDoc(docRef);
    return { success: true, id };
  } catch (error) {
    console.error('[Firestore] Error deleting insight:', error);
    return { success: false, error: 'Failed to delete insight from Firestore.' };
  }
}

/**
 * Quick toggle publish status
 */
export async function publishInsightDirect(id: string, publish: boolean): Promise<ServiceResponse> {
  const target = cachedInsights.find(i => i.id === id || i.slug === id);
  const newStatus = publish ? 'published' : 'draft';
  const nowFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (target) {
    target.status = newStatus;
    if (publish) target.publishDate = nowFormatted;
    target.updatedDate = new Date().toISOString();
  }

  if (!isFirebaseConfigured() || !db) {
    return { success: true };
  }

  try {
    const docRef = doc(db, 'insights', id);
    await updateDoc(docRef, {
      status: newStatus,
      publishDate: publish ? nowFormatted : target?.publishDate || '',
      updatedDate: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('[Firestore] Error updating publish state:', error);
    return { success: false, error: 'Failed to update publication status' };
  }
}

/**
 * Fetch automation configuration settings
 */
export async function fetchInsightSettings(): Promise<InsightAutomationSettings> {
  if (!isFirebaseConfigured() || !db) {
    return DEFAULT_AUTOMATION_SETTINGS;
  }

  try {
    const docRef = doc(db, 'insightSettings', 'automation');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as InsightAutomationSettings;
    }
    // Seed default settings
    await setDoc(docRef, DEFAULT_AUTOMATION_SETTINGS);
    return DEFAULT_AUTOMATION_SETTINGS;
  } catch (error) {
    console.warn('[Firestore] Error fetching automation settings:', error);
    return DEFAULT_AUTOMATION_SETTINGS;
  }
}

/**
 * Save automation configuration settings
 */
export async function saveInsightSettings(settings: Partial<InsightAutomationSettings>): Promise<ServiceResponse> {
  if (!isFirebaseConfigured() || !db) {
    return { success: true };
  }

  try {
    const docRef = doc(db, 'insightSettings', 'automation');
    await setDoc(docRef, settings, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('[Firestore] Error saving insight settings:', error);
    return { success: false, error: 'Failed to update automation settings.' };
  }
}

/**
 * Seed initial sample insights into Firestore
 */
export async function seedInitialInsights(): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;

  try {
    for (const insight of INITIAL_INSIGHTS) {
      const docRef = doc(db, 'insights', insight.id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, removeUndefinedValues(insight as unknown as Record<string, unknown>));
      }
    }
    console.log('[Firestore] Seeded initial insights successfully.');
  } catch (err) {
    console.warn('[Firestore] Note: Could not seed initial insights (might require auth or offline):', err);
  }
}

/**
 * Maps Firebase error codes to readable explanations.
 */
export function getReadableFirebaseError(code: string): string {
  switch (code) {
    case 'permission-denied':
      return 'Submission was blocked by security rules. Please check your entries or contact Rohit directly.';
    case 'not-found':
      return 'The configured database service could not be reached. Please contact Rohit directly.';
    case 'failed-precondition':
      return 'Firestore service is currently initializing. Please try again in a few moments.';
    case 'invalid-argument':
      return 'Please verify the submitted details and try again.';
    case 'unavailable':
    case 'deadline-exceeded':
    case 'connection-timeout':
    case 'offline':
      return 'Unable to submit your project right now. Please check your connection and try again.';
    case 'invalid-config':
      return 'Database configuration is incomplete. Please contact Rohit directly.';
    default:
      return 'Submission could not be completed. Please contact Rohit directly through WhatsApp, email or phone.';
  }
}


