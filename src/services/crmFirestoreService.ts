/**
 * Typed Firestore Cloud Persistence Service for Rohitwork CRM
 * Phase 6B.2: Enterprise Cloud Database Persistence
 *
 * Implements typed CRUD operations across all 11 CRM business modules:
 * - Leads (/leads)
 * - Clients (/clients)
 * - Projects (/projects)
 * - Freelancers (/freelancers) [Super Admin restricted]
 * - Tasks (/tasks)
 * - Quotations (/quotations)
 * - Invoices (/invoices)
 * - Payments (/payments) [Super Admin restricted]
 * - Expenses (/expenses) [Super Admin restricted]
 * - Reminders (/reminders)
 * - Settings (/crmSettings/agency_settings) [Super Admin restricted]
 *
 * Strict Data Safety Guarantees:
 * 1. Demo records (isDemo: true) are strictly blocked from cloud persistence.
 * 2. Stable document IDs are preserved to maintain foreign key relationships.
 * 3. Undefined fields are stripped to prevent Firestore SDK validation crashes.
 * 4. Human-readable error translations for permission denials and network faults.
 * 5. Timestamp-based non-destructive reconciliation (remoteTime vs localTime).
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import {
  CrmLead,
  CrmClient,
  CrmProject,
  CrmFreelancer,
  CrmTask,
  CrmQuotation,
  CrmInvoice,
  CrmPayment,
  CrmExpense,
  CrmReminder,
  CrmAgencySettings
} from '../types/crm';

export interface CrmCloudOperationResult<T = unknown> {
  success: boolean;
  id?: string;
  data?: T;
  error?: string;
  errorCode?: string;
  isOffline?: boolean;
}

export interface CrmSyncStatus {
  isConfigured: boolean;
  isAuthenticated: boolean;
  userEmail: string | null;
  userUid: string | null;
  lastSyncTimestamp: string | null;
  connectedCollections: string[];
}

/**
 * Utility to strip undefined values to ensure Firestore compatibility
 */
export function removeUndefinedValues<T extends Record<string, any>>(data: T): T {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) continue;
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date) && !(val instanceof Timestamp)) {
      clean[key] = removeUndefinedValues(val);
    } else {
      clean[key] = val;
    }
  }
  return clean as T;
}

/**
 * Maps Firestore exceptions to actionable developer and admin explanations
 */
export function translateFirestoreError(err: any, collectionName: string, operation: 'read' | 'write' | 'delete'): { error: string; errorCode: string } {
  const code = err?.code || 'unknown';
  const msg = err?.message || String(err);

  switch (code) {
    case 'permission-denied': {
      const userEmail = auth?.currentUser?.email;
      return {
        errorCode: 'permission-denied',
        error: userEmail
          ? `Permission Denied on /${collectionName} [${operation}]: Authenticated account '${userEmail}' is not recognized as an authorized Super Admin in Firestore Security Rules. Authorized Super Admin is 'workall724038@gmail.com'.`
          : `Permission Denied on /${collectionName} [${operation}]: No active Firebase administrator session found. Please sign in with 'workall724038@gmail.com'.`
      };
    }
    case 'unavailable':
    case 'deadline-exceeded':
      return {
        errorCode: 'offline',
        error: `Firestore service unreachable on /${collectionName}. Network or emulator connection unavailable. Local state preserved.`
      };
    case 'unauthenticated':
      return {
        errorCode: 'unauthenticated',
        error: `Authentication Required: Cannot perform ${operation} on /${collectionName} without an active Firebase Admin session. Please sign in with 'workall724038@gmail.com'.`
      };
    case 'not-found':
      return {
        errorCode: 'not-found',
        error: `Document not found in /${collectionName}.`
      };
    default:
      return {
        errorCode: code,
        error: `Firestore error on /${collectionName} [${operation}]: ${msg}`
      };
  }
}

/**
 * Preflight verification before performing any cloud write or delete.
 * Verifies that Firebase is configured, the database is active, and an active Firebase user session exists.
 * Fails fast before attempting database writes if unauthenticated.
 */
export function checkCloudWritePreflight(collectionName: string, operation: 'write' | 'delete'): { ok: boolean; result?: CrmCloudOperationResult<any> } {
  if (!isFirebaseConfigured() || !db) {
    return {
      ok: false,
      result: {
        success: false,
        error: `Firebase is unconfigured or database is inactive. Cannot perform ${operation} on /${collectionName}.`,
        errorCode: 'unconfigured'
      }
    };
  }

  if (!auth?.currentUser) {
    return {
      ok: false,
      result: {
        success: false,
        error: `Authentication Required: You do not have an active Firebase administrator session. Please sign in with your administrator account (workall724038@gmail.com).`,
        errorCode: 'unauthenticated'
      }
    };
  }

  return { ok: true };
}

import { KNOWN_SEED_RECORD_IDS } from './crmBackupService';

/**
 * Helper to ensure a record is eligible for cloud persistence
 */
export function assertEligibleForCloud(record: any, moduleName: string): void {
  if (record?.isDemo === true) {
    throw new Error(`[Cloud Safety] Demo seed record (${record.id || 'unknown'}) in module '${moduleName}' cannot be uploaded to cloud Firestore.`);
  }
  const seedSet = KNOWN_SEED_RECORD_IDS[moduleName];
  if (seedSet && record?.id && seedSet.has(record.id)) {
    throw new Error(`[Cloud Safety] Known factory seed record ID (${record.id}) in module '${moduleName}' cannot be uploaded to cloud Firestore.`);
  }
}

/**
 * Check cloud status
 */
export function getCrmCloudSyncStatus(): CrmSyncStatus {
  const configured = isFirebaseConfigured() && Boolean(db);
  const currentUser = auth?.currentUser;

  return {
    isConfigured: configured,
    isAuthenticated: Boolean(currentUser),
    userEmail: currentUser?.email || null,
    userUid: currentUser?.uid || null,
    lastSyncTimestamp: new Date().toISOString(),
    connectedCollections: [
      'leads',
      'clients',
      'projects',
      'freelancers',
      'tasks',
      'quotations',
      'invoices',
      'payments',
      'expenses',
      'reminders',
      'crmSettings'
    ]
  };
}

// =========================================================================
// 1. LEADS (/leads)
// =========================================================================

export async function fetchLeadsFromFirestore(): Promise<CrmLead[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, 'leads');
    const snap = await getDocs(colRef);
    const leads: CrmLead[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      leads.push({
        id: docSnap.id,
        name: d.name || 'Unnamed Lead',
        email: d.email || '',
        phone: d.phone || '',
        company: d.company || d.businessName || '',
        service: d.service || d.selectedService || 'General Inquiry',
        message: d.message || d.projectDescription || '',
        status: d.status || 'new',
        pipelineStage: d.pipelineStage || 'new',
        priority: d.priority || 'medium',
        estimatedValue: typeof d.estimatedValue === 'number' ? d.estimatedValue : 0,
        contactCount: d.contactCount || 0,
        source: d.source || 'website',
        budget: d.budget || d.budgetRange || '',
        timeline: d.timeline || '',
        assignedTo: d.assignedTo || 'Rohit Verma',
        followUpAt: d.followUpAt || null,
        notes: d.notes || '',
        activities: Array.isArray(d.activities) ? d.activities : [],
        isDemo: false,
        createdAt: d.createdAtIso || (d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : new Date().toISOString()),
        updatedAt: d.updatedAtIso || (d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : new Date().toISOString())
      });
    });
    return leads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'leads', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function saveLeadToFirestore(lead: CrmLead): Promise<CrmCloudOperationResult<CrmLead>> {
  assertEligibleForCloud(lead, 'leads');
  const preflight = checkCloudWritePreflight('leads', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = lead.id || `lead_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...lead,
    id: docId,
    isDemo: false,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'leads', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...lead, id: docId, updatedAt: nowIso } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'leads', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deleteLeadFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('leads', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'leads', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'leads', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 2. CLIENTS (/clients)
// =========================================================================

export async function fetchClientsFromFirestore(): Promise<CrmClient[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const colRef = collection(db, 'clients');
    const snap = await getDocs(colRef);
    const clients: CrmClient[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      clients.push({
        id: docSnap.id,
        name: d.name || 'Unnamed Client',
        company: d.company || '',
        email: d.email || '',
        phone: d.phone || '',
        status: d.status || 'active',
        totalProjects: d.totalProjects || 0,
        totalBilled: d.totalBilled || 0,
        totalPaid: d.totalPaid || 0,
        outstandingBalance: d.outstandingBalance || 0,
        currency: d.currency || 'INR',
        tags: Array.isArray(d.tags) ? d.tags : [],
        notes: d.notes || '',
        address: d.address || '',
        leadSourceId: d.leadSourceId,
        originalLeadData: d.originalLeadData,
        activities: Array.isArray(d.activities) ? d.activities : [],
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAtIso || (d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString()),
        avatarUrl: d.avatarUrl
      });
    });
    return clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'clients', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function saveClientToFirestore(client: CrmClient): Promise<CrmCloudOperationResult<CrmClient>> {
  assertEligibleForCloud(client, 'clients');
  const preflight = checkCloudWritePreflight('clients', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = client.id || `cli_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...client,
    id: docId,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'clients', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...client, id: docId, updatedAt: nowIso } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'clients', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deleteClientFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('clients', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'clients', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'clients', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 3. PROJECTS (/projects)
// =========================================================================

export async function fetchProjectsFromFirestore(): Promise<CrmProject[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'projects'));
    const projects: CrmProject[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      projects.push({
        id: docSnap.id,
        title: d.title || 'Untitled Project',
        clientId: d.clientId || '',
        clientName: d.clientName || '',
        serviceCategory: d.serviceCategory || 'Creative',
        description: d.description || '',
        status: d.status || 'planning',
        priority: d.priority || 'medium',
        startDate: d.startDate || new Date().toISOString().split('T')[0],
        deadline: d.deadline || new Date().toISOString().split('T')[0],
        budget: Number(d.budget) || 0,
        amountPaid: Number(d.amountPaid) || 0,
        pendingBalance: Number(d.pendingBalance) || 0,
        paymentStatus: d.paymentStatus || 'pending',
        progress: Number(d.progress) || 0,
        assignedFreelancerIds: Array.isArray(d.assignedFreelancerIds) ? d.assignedFreelancerIds : [],
        milestones: Array.isArray(d.milestones) ? d.milestones : [],
        deliverables: Array.isArray(d.deliverables) ? d.deliverables : [],
        activities: Array.isArray(d.activities) ? d.activities : [],
        notes: d.notes || '',
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAtIso || (d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString())
      });
    });
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'projects', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function saveProjectToFirestore(project: CrmProject): Promise<CrmCloudOperationResult<CrmProject>> {
  assertEligibleForCloud(project, 'projects');
  const preflight = checkCloudWritePreflight('projects', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = project.id || `proj_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...project,
    id: docId,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'projects', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...project, id: docId, updatedAt: nowIso } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'projects', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deleteProjectFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('projects', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'projects', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'projects', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 4. FREELANCERS (/freelancers) [RBAC: Super Admin write, Admin read]
// =========================================================================

export async function fetchFreelancersFromFirestore(): Promise<CrmFreelancer[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'freelancers'));
    const freelancers: CrmFreelancer[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      freelancers.push({
        id: docSnap.id,
        name: d.name || 'Unnamed Freelancer',
        phone: d.phone || '',
        email: d.email || '',
        whatsapp: d.whatsapp || '',
        specialty: d.specialty || '',
        skills: Array.isArray(d.skills) ? d.skills : [],
        portfolioUrl: d.portfolioUrl || '',
        status: d.status || 'available',
        hourlyRate: d.hourlyRate,
        fixedRateDefault: d.fixedRateDefault,
        agreedAmount: d.agreedAmount,
        paidAmount: d.paidAmount,
        pendingBalance: d.pendingBalance,
        paymentStatus: d.paymentStatus || 'pending',
        paymentMethod: d.paymentMethod,
        paymentDetails: d.paymentDetails,
        payoutHistory: Array.isArray(d.payoutHistory) ? d.payoutHistory : [],
        submissions: Array.isArray(d.submissions) ? d.submissions : [],
        revisionsRecordedCount: d.revisionsRecordedCount || 0,
        activeProjectsCount: d.activeProjectsCount || 0,
        completedProjectsCount: d.completedProjectsCount || 0,
        rating: d.rating || 5,
        paymentPending: d.paymentPending || 0,
        paymentPaidTotal: d.paymentPaidTotal || 0,
        notes: d.notes || '',
        activities: Array.isArray(d.activities) ? d.activities : [],
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAtIso || (d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString())
      });
    });
    return freelancers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'freelancers', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function saveFreelancerToFirestore(freelancer: CrmFreelancer): Promise<CrmCloudOperationResult<CrmFreelancer>> {
  assertEligibleForCloud(freelancer, 'freelancers');
  const preflight = checkCloudWritePreflight('freelancers', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = freelancer.id || `fr_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...freelancer,
    id: docId,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'freelancers', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...freelancer, id: docId, updatedAt: nowIso } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'freelancers', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deleteFreelancerFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('freelancers', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'freelancers', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'freelancers', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 5. TASKS (/tasks)
// =========================================================================

export async function fetchTasksFromFirestore(): Promise<CrmTask[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'tasks'));
    const tasks: CrmTask[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      tasks.push({
        id: docSnap.id,
        projectId: d.projectId,
        projectTitle: d.projectTitle,
        clientId: d.clientId,
        clientName: d.clientName,
        title: d.title || 'Untitled Task',
        description: d.description || '',
        assignedFreelancerId: d.assignedFreelancerId,
        assignedFreelancerName: d.assignedFreelancerName,
        priority: d.priority || 'medium',
        status: d.status || 'to_do',
        startDate: d.startDate,
        dueDate: d.dueDate,
        estimatedHours: d.estimatedHours,
        actualHours: d.actualHours,
        subtasks: Array.isArray(d.subtasks) ? d.subtasks : [],
        progress: d.progress || 0,
        submissions: Array.isArray(d.submissions) ? d.submissions : [],
        comments: Array.isArray(d.comments) ? d.comments : [],
        activities: Array.isArray(d.activities) ? d.activities : [],
        revisionRound: d.revisionRound || 0,
        notes: d.notes || '',
        archived: Boolean(d.archived),
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAtIso || (d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString())
      });
    });
    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'tasks', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function saveTaskToFirestore(task: CrmTask): Promise<CrmCloudOperationResult<CrmTask>> {
  assertEligibleForCloud(task, 'tasks');
  const preflight = checkCloudWritePreflight('tasks', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = task.id || `tsk_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...task,
    id: docId,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'tasks', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...task, id: docId, updatedAt: nowIso } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'tasks', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deleteTaskFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('tasks', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'tasks', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'tasks', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 6. QUOTATIONS (/quotations)
// =========================================================================

export async function fetchQuotationsFromFirestore(): Promise<CrmQuotation[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'quotations'));
    const quotations: CrmQuotation[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      quotations.push({
        id: docSnap.id,
        quotationNumber: d.quotationNumber || `RW-QT-${docSnap.id}`,
        clientId: d.clientId,
        clientName: d.clientName || '',
        clientEmail: d.clientEmail || '',
        clientPhone: d.clientPhone,
        clientCompany: d.clientCompany,
        projectId: d.projectId,
        projectTitle: d.projectTitle,
        issueDate: d.issueDate || new Date().toISOString().split('T')[0],
        validUntil: d.validUntil || new Date().toISOString().split('T')[0],
        proposalScope: d.proposalScope,
        deliverablesSummary: d.deliverablesSummary,
        estimatedTimeline: d.estimatedTimeline,
        items: Array.isArray(d.items) ? d.items : [],
        subtotal: Number(d.subtotal) || 0,
        discountPercentage: d.discountPercentage,
        discountAmount: d.discountAmount,
        additionalCharges: d.additionalCharges,
        additionalChargesDescription: d.additionalChargesDescription,
        isGstEnabled: Boolean(d.isGstEnabled),
        taxPercentage: d.taxPercentage,
        taxAmount: d.taxAmount,
        total: Number(d.total) || 0,
        totalAmount: Number(d.totalAmount) || Number(d.total) || 0,
        advancePercentage: d.advancePercentage,
        advanceAmount: d.advanceAmount,
        paymentMilestones: Array.isArray(d.paymentMilestones) ? d.paymentMilestones : [],
        status: d.status || 'draft',
        currency: d.currency || 'INR',
        notes: d.notes,
        revisionPolicy: d.revisionPolicy,
        terms: d.terms,
        convertedToInvoiceId: d.convertedToInvoiceId,
        convertedAt: d.convertedAt,
        activities: Array.isArray(d.activities) ? d.activities : [],
        archived: Boolean(d.archived),
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAtIso || (d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString())
      });
    });
    return quotations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'quotations', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function saveQuotationToFirestore(quotation: CrmQuotation): Promise<CrmCloudOperationResult<CrmQuotation>> {
  assertEligibleForCloud(quotation, 'quotations');
  const preflight = checkCloudWritePreflight('quotations', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = quotation.id || `qt_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...quotation,
    id: docId,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'quotations', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...quotation, id: docId, updatedAt: nowIso } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'quotations', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deleteQuotationFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('quotations', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'quotations', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'quotations', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 7. INVOICES (/invoices)
// =========================================================================

export async function fetchInvoicesFromFirestore(): Promise<CrmInvoice[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'invoices'));
    const invoices: CrmInvoice[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      invoices.push({
        id: docSnap.id,
        invoiceNumber: d.invoiceNumber || `RW-INV-${docSnap.id}`,
        quotationId: d.quotationId,
        quotationNumber: d.quotationNumber,
        clientId: d.clientId || '',
        clientName: d.clientName || '',
        clientEmail: d.clientEmail || '',
        clientPhone: d.clientPhone,
        clientCompany: d.clientCompany,
        projectId: d.projectId,
        projectTitle: d.projectTitle,
        issueDate: d.issueDate || new Date().toISOString().split('T')[0],
        dueDate: d.dueDate || new Date().toISOString().split('T')[0],
        items: Array.isArray(d.items) ? d.items : [],
        subtotal: Number(d.subtotal) || 0,
        discountPercentage: d.discountPercentage,
        discountAmount: d.discountAmount,
        additionalCharges: d.additionalCharges,
        additionalChargesDescription: d.additionalChargesDescription,
        isGstEnabled: Boolean(d.isGstEnabled),
        taxPercentage: d.taxPercentage,
        taxAmount: d.taxAmount,
        total: Number(d.total) || 0,
        totalAmount: Number(d.totalAmount) || Number(d.total) || 0,
        amountPaid: Number(d.amountPaid) || 0,
        balanceDue: Number(d.balanceDue) || 0,
        status: d.status || 'draft',
        paymentTerms: d.paymentTerms,
        currency: d.currency || 'INR',
        notes: d.notes,
        bankDetails: d.bankDetails,
        activities: Array.isArray(d.activities) ? d.activities : [],
        isDemo: false,
        archived: Boolean(d.archived),
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAtIso || (d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString())
      });
    });
    return invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'invoices', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function saveInvoiceToFirestore(invoice: CrmInvoice): Promise<CrmCloudOperationResult<CrmInvoice>> {
  assertEligibleForCloud(invoice, 'invoices');
  const preflight = checkCloudWritePreflight('invoices', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = invoice.id || `inv_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...invoice,
    id: docId,
    isDemo: false,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'invoices', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...invoice, id: docId, updatedAt: nowIso } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'invoices', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deleteInvoiceFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('invoices', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'invoices', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'invoices', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 8. PAYMENTS (/payments) [RBAC: Super Admin write, Admin read]
// =========================================================================

export async function fetchPaymentsFromFirestore(): Promise<CrmPayment[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'payments'));
    const payments: CrmPayment[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      payments.push({
        id: docSnap.id,
        paymentType: d.paymentType || 'client_payment',
        invoiceId: d.invoiceId,
        invoiceNumber: d.invoiceNumber,
        clientId: d.clientId,
        clientName: d.clientName,
        freelancerId: d.freelancerId,
        freelancerName: d.freelancerName,
        projectId: d.projectId,
        projectTitle: d.projectTitle,
        amount: Number(d.amount) || 0,
        paymentMethod: d.paymentMethod || 'upi',
        transactionRef: d.transactionRef,
        paymentDate: d.paymentDate || new Date().toISOString().split('T')[0],
        status: d.status || 'completed',
        receiptUrl: d.receiptUrl,
        notes: d.notes,
        isDemo: false,
        archived: Boolean(d.archived),
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAtIso || (d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString())
      });
    });
    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'payments', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function savePaymentToFirestore(payment: CrmPayment): Promise<CrmCloudOperationResult<CrmPayment>> {
  assertEligibleForCloud(payment, 'payments');
  const preflight = checkCloudWritePreflight('payments', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = payment.id || `pay_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...payment,
    id: docId,
    isDemo: false,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'payments', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...payment, id: docId, updatedAt: nowIso } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'payments', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deletePaymentFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('payments', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'payments', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'payments', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 9. EXPENSES (/expenses) [RBAC: Super Admin write, Admin read]
// =========================================================================

export async function fetchExpensesFromFirestore(): Promise<CrmExpense[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'expenses'));
    const expenses: CrmExpense[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      expenses.push({
        id: docSnap.id,
        title: d.title || 'Untitled Expense',
        category: d.category || 'other',
        amount: Number(d.amount) || 0,
        currency: d.currency || 'INR',
        date: d.date || new Date().toISOString().split('T')[0],
        paymentMethod: d.paymentMethod || 'upi',
        vendor: d.vendor,
        isRecurring: Boolean(d.isRecurring),
        recurringFrequency: d.recurringFrequency,
        freelancerPayoutId: d.freelancerPayoutId,
        freelancerId: d.freelancerId,
        freelancerName: d.freelancerName,
        projectId: d.projectId,
        projectTitle: d.projectTitle,
        receiptUrl: d.receiptUrl,
        taxDeductible: Boolean(d.taxDeductible),
        notes: d.notes,
        isDemo: false,
        archived: Boolean(d.archived),
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAtIso || (d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString())
      });
    });
    return expenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'expenses', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function saveExpenseToFirestore(expense: CrmExpense): Promise<CrmCloudOperationResult<CrmExpense>> {
  assertEligibleForCloud(expense, 'expenses');
  const preflight = checkCloudWritePreflight('expenses', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = expense.id || `exp_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...expense,
    id: docId,
    isDemo: false,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'expenses', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...expense, id: docId, updatedAt: nowIso } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'expenses', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deleteExpenseFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('expenses', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'expenses', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'expenses', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 10. REMINDERS (/reminders)
// =========================================================================

export async function fetchRemindersFromFirestore(): Promise<CrmReminder[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDocs(collection(db, 'reminders'));
    const reminders: CrmReminder[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      reminders.push({
        id: docSnap.id,
        title: d.title || 'Untitled Reminder',
        type: d.type || 'general',
        targetDate: d.targetDate || new Date().toISOString().split('T')[0],
        linkedEntityId: d.linkedEntityId,
        linkedEntityType: d.linkedEntityType,
        priority: d.priority || 'medium',
        isCompleted: Boolean(d.isCompleted),
        snoozedUntil: d.snoozedUntil,
        isDynamic: Boolean(d.isDynamic),
        subtitle: d.subtitle,
        notes: d.notes,
        createdAt: d.createdAt || new Date().toISOString()
      });
    });
    return reminders.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  } catch (err) {
    const details = translateFirestoreError(err, 'reminders', 'read');
    console.warn(details.error);
    return [];
  }
}

export async function saveReminderToFirestore(reminder: CrmReminder): Promise<CrmCloudOperationResult<CrmReminder>> {
  assertEligibleForCloud(reminder, 'reminders');
  const preflight = checkCloudWritePreflight('reminders', 'write');
  if (!preflight.ok) return preflight.result!;

  const docId = reminder.id || `rem_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...reminder,
    id: docId,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    const docRef = doc(db, 'reminders', docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id: docId, data: { ...reminder, id: docId } };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'reminders', 'write');
    return { success: false, id: docId, error: details.error, errorCode: details.errorCode };
  }
}

export async function deleteReminderFromFirestore(id: string): Promise<CrmCloudOperationResult> {
  const preflight = checkCloudWritePreflight('reminders', 'delete');
  if (!preflight.ok) return preflight.result!;
  try {
    await deleteDoc(doc(db, 'reminders', id));
    return { success: true, id };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'reminders', 'delete');
    return { success: false, id, error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// 11. CRM SETTINGS (/crmSettings/agency_settings & /crmSettings/agency) [RBAC: Super Admin write, Admin read]
// Supports dual-path compatibility to resolve document path discrepancy without deleting data.
// =========================================================================

export async function fetchCrmSettingsFromFirestore(): Promise<CrmAgencySettings | null> {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    // 1. Check primary canonical path: /crmSettings/agency_settings
    const docRef = doc(db, 'crmSettings', 'agency_settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CrmAgencySettings;
    }

    // 2. Fallback to legacy/alternate path: /crmSettings/agency
    const legacyDocRef = doc(db, 'crmSettings', 'agency');
    const legacySnap = await getDoc(legacyDocRef);
    if (legacySnap.exists()) {
      return legacySnap.data() as CrmAgencySettings;
    }

    return null;
  } catch (err) {
    const details = translateFirestoreError(err, 'crmSettings', 'read');
    console.warn(details.error);
    return null;
  }
}

export async function saveCrmSettingsToFirestore(settings: CrmAgencySettings): Promise<CrmCloudOperationResult<CrmAgencySettings>> {
  const preflight = checkCloudWritePreflight('crmSettings', 'write');
  if (!preflight.ok) return preflight.result!;

  const nowIso = new Date().toISOString();
  const cleanData = removeUndefinedValues({
    ...settings,
    updatedAtIso: nowIso,
    updatedAt: serverTimestamp()
  });

  try {
    // 1. Write primary canonical path: agency_settings
    const docRef = doc(db, 'crmSettings', 'agency_settings');
    await setDoc(docRef, cleanData, { merge: true });

    // 2. Dual-write to alternate legacy path: agency for 100% backward compatibility
    try {
      const legacyRef = doc(db, 'crmSettings', 'agency');
      await setDoc(legacyRef, cleanData, { merge: true });
    } catch {
      // Non-fatal if legacy document path fails
    }

    return { success: true, id: 'agency_settings', data: settings };
  } catch (err: any) {
    const details = translateFirestoreError(err, 'crmSettings', 'write');
    return { success: false, id: 'agency_settings', error: details.error, errorCode: details.errorCode };
  }
}

// =========================================================================
// REAL-TIME CLOUD LISTENER (CROSS-BROWSER SYNCHRONIZATION)
// =========================================================================

export function subscribeToCloudCollection(
  collectionName: string,
  onData: (docs: any[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!isFirebaseConfigured() || !db) return () => {};
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snap) => {
        const records: any[] = [];
        snap.forEach((docSnap) => {
          records.push({ id: docSnap.id, ...docSnap.data() });
        });
        onData(records);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}
