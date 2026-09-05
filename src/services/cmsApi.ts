import { SiteConfig, SiteTemplate, SiteRevision, MediaItem, InquiryRecord, AdminUser } from '../types/cms';
import { getAdminToken, setAdminToken } from './adminApi';
import {
  fetchLiveSiteConfigFromFirestore,
  saveLiveSiteConfigToFirestore,
  fetchDraftSiteConfigFromFirestore,
  saveDraftSiteConfigToFirestore,
  clearDraftSiteConfigInFirestore,
  createSiteRevisionInFirestore,
  fetchSiteRevisionsFromFirestore,
  fetchSiteTemplatesFromFirestore,
  saveSiteTemplateToFirestore,
  fetchAllLeadsFromFirestore,
  updateLeadStatusInFirestore,
  deleteLeadFromFirestore,
  fetchMediaItemsFromFirestore,
  saveMediaItemToFirestore,
  deleteMediaItemFromFirestore,
  submitContactEnquiry
} from './firebase/firestore';
import { DEFAULT_SITE_CONFIG, BUILT_IN_TEMPLATES } from '../data/defaultSiteConfig';

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAdminToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Public: Fetch published live site configuration.
 */
export async function fetchPublicSiteConfig(): Promise<{ success: boolean; config?: SiteConfig; error?: string }> {
  // 1. Try Firestore first
  try {
    const fsConfig = await fetchLiveSiteConfigFromFirestore();
    if (fsConfig && fsConfig.branding) {
      return { success: true, config: fsConfig };
    }
  } catch (e) {
    console.warn('[CMS] Firestore public config read failed, trying server API:', e);
  }

  // 2. Fallback to server API
  try {
    const res = await fetch('/api/site-config', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data.config) {
        return { success: true, config: data.config };
      }
    }
  } catch (err: any) {
    console.warn('[CMS] Server API site-config fetch error:', err);
  }

  // 3. Fallback to default
  return { success: true, config: DEFAULT_SITE_CONFIG };
}

/**
 * Admin: Fetch current draft configuration (or live if no draft).
 */
export async function fetchDraftSiteConfig(): Promise<{
  success: boolean;
  config?: SiteConfig;
  hasUnpublishedChanges?: boolean;
  error?: string;
}> {
  // 1. Try Firestore
  try {
    const draft = await fetchDraftSiteConfigFromFirestore();
    if (draft && draft.branding) {
      return { success: true, config: draft, hasUnpublishedChanges: true };
    }
  } catch (e) {
    console.warn('[CMS] Firestore draft config read failed:', e);
  }

  // 2. Try Server API
  try {
    const res = await fetch('/api/site-config/draft', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return {
      success: true,
      config: data.config,
      hasUnpublishedChanges: Boolean(data.hasUnpublishedChanges)
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch draft config' };
  }
}

/**
 * Admin: Save draft configuration.
 */
export async function saveDraftSiteConfig(config: Partial<SiteConfig>): Promise<{ success: boolean; config?: SiteConfig; error?: string }> {
  // 1. Save to Firestore
  try {
    await saveDraftSiteConfigToFirestore(config as SiteConfig);
  } catch (e) {
    console.warn('[CMS] Firestore draft save error:', e);
  }

  // 2. Sync with server API
  try {
    const res = await fetch('/api/admin/site-config/draft', {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(config)
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to save draft' };
    }
    return { success: true, config: data.config || (config as SiteConfig) };
  } catch (err: any) {
    return { success: true, config: config as SiteConfig };
  }
}

/**
 * Admin: Publish draft changes live (creates automated revision snapshot).
 */
export async function publishSiteConfig(summary?: string): Promise<{ success: boolean; config?: SiteConfig; revision?: SiteRevision; error?: string }> {
  const publishSummary = summary || 'Published updates to live website';

  // 1. Fetch current draft
  let draftToPublish = await fetchDraftSiteConfigFromFirestore();
  if (!draftToPublish) {
    const pub = await fetchPublicSiteConfig();
    draftToPublish = pub.config || DEFAULT_SITE_CONFIG;
  }

  const newVersion = (draftToPublish.version || 1) + 1;
  const nowIso = new Date().toISOString();

  const publishedConfig: SiteConfig = {
    ...draftToPublish,
    version: newVersion,
    lastUpdated: nowIso,
    lastPublishedAt: nowIso,
    publishedBy: 'Rohit Verma (Admin)'
  };

  const revision: SiteRevision = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    version: newVersion,
    timestamp: nowIso,
    author: 'Rohit Verma',
    changeSummary: publishSummary,
    summary: publishSummary,
    type: 'publish',
    config: publishedConfig
  };

  // Save live config & revision to Firestore
  try {
    await saveLiveSiteConfigToFirestore(publishedConfig);
    await createSiteRevisionInFirestore(revision);
    await clearDraftSiteConfigInFirestore();
  } catch (e) {
    console.warn('[CMS] Firestore publish error:', e);
  }

  // Also sync with server API
  try {
    const res = await fetch('/api/admin/site-config/publish', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ summary: publishSummary })
    });
    if (res.status === 401) {
      setAdminToken(null);
    }
  } catch (err) {
    console.warn('[CMS] Server publish sync note:', err);
  }

  return { success: true, config: publishedConfig, revision };
}

/**
 * Admin: Discard current draft and reset to live published state.
 */
export async function discardDraftSiteConfig(): Promise<{ success: boolean; config?: SiteConfig; error?: string }> {
  try {
    await clearDraftSiteConfigInFirestore();
  } catch (e) {
    console.warn('[CMS] Clear draft error:', e);
  }

  try {
    const res = await fetch('/api/admin/site-config/discard-draft', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
  } catch (err: any) {
    console.warn('[CMS] Server discard draft sync note:', err);
  }

  const live = await fetchPublicSiteConfig();
  return { success: true, config: live.config };
}

/**
 * Admin: Reset site to default configuration or chosen template.
 */
export async function resetSiteConfig(templateId?: string): Promise<{ success: boolean; config?: SiteConfig; error?: string }> {
  let targetConfig = DEFAULT_SITE_CONFIG;
  if (templateId) {
    const found = BUILT_IN_TEMPLATES.find(t => t.id === templateId);
    if (found?.config) {
      targetConfig = { ...DEFAULT_SITE_CONFIG, ...found.config };
    }
  }

  try {
    await saveDraftSiteConfigToFirestore(targetConfig);
  } catch (e) {
    console.warn('[CMS] Reset draft error:', e);
  }

  try {
    await fetch('/api/admin/site-config/reset', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ templateId })
    });
  } catch (err: any) {
    console.warn('[CMS] Server reset note:', err);
  }

  return { success: true, config: targetConfig };
}

// =========================================================================
// TEMPLATE SYSTEM APIS
// =========================================================================

export async function fetchTemplates(): Promise<{ success: boolean; templates: SiteTemplate[]; error?: string }> {
  try {
    const templates = await fetchSiteTemplatesFromFirestore();
    if (templates && templates.length > 0) {
      return { success: true, templates };
    }
  } catch (e) {
    console.warn('[CMS] Firestore fetch templates failed, trying server API:', e);
  }

  try {
    const res = await fetch('/api/admin/templates', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, templates: BUILT_IN_TEMPLATES, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return { success: true, templates: data.templates || BUILT_IN_TEMPLATES };
  } catch (err: any) {
    return { success: true, templates: BUILT_IN_TEMPLATES };
  }
}

export async function createTemplate(template: Partial<SiteTemplate>): Promise<{ success: boolean; template?: SiteTemplate; error?: string }> {
  const fullTemplate: SiteTemplate = {
    id: template.id || `tpl-${Date.now()}`,
    name: template.name || 'Custom Template',
    description: template.description || 'Custom exported layout and color configuration.',
    category: template.category || 'Custom',
    thumbnail: template.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
    author: template.author || 'Rohit Verma',
    config: template.config || {}
  };

  try {
    await saveSiteTemplateToFirestore(fullTemplate);
  } catch (e) {
    console.warn('[CMS] Firestore template save failed:', e);
  }

  try {
    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(fullTemplate)
    });
    if (res.status === 401) {
      setAdminToken(null);
    }
  } catch (err: any) {
    console.warn('[CMS] Server template sync note:', err);
  }

  return { success: true, template: fullTemplate };
}

export async function updateTemplate(id: string, updates: Partial<SiteTemplate>): Promise<{ success: boolean; template?: SiteTemplate; error?: string }> {
  try {
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return { success: true, template: data.template };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update template' };
  }
}

export async function deleteTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete template' };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete template' };
  }
}

export async function activateTemplate(id: string): Promise<{ success: boolean; config?: SiteConfig; error?: string }> {
  return await resetSiteConfig(id);
}

export async function importTemplate(templateJson: any): Promise<{ success: boolean; template?: SiteTemplate; error?: string }> {
  return await createTemplate(templateJson);
}

// =========================================================================
// REVISIONS APIS
// =========================================================================

export async function fetchRevisions(): Promise<{ success: boolean; revisions: SiteRevision[]; error?: string }> {
  try {
    const revisions = await fetchSiteRevisionsFromFirestore();
    if (revisions && revisions.length > 0) {
      return { success: true, revisions };
    }
  } catch (e) {
    console.warn('[CMS] Firestore revisions read error:', e);
  }

  try {
    const res = await fetch('/api/admin/revisions', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, revisions: [], error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return { success: true, revisions: data.revisions || [] };
  } catch (err: any) {
    return { success: false, revisions: [], error: err.message || 'Failed to fetch revisions' };
  }
}

export async function restoreRevision(id: string): Promise<{ success: boolean; config?: SiteConfig; error?: string }> {
  try {
    const revisions = await fetchSiteRevisionsFromFirestore();
    const target = revisions.find(r => r.id === id);
    if (target?.config) {
      await saveDraftSiteConfigToFirestore(target.config);
      return { success: true, config: target.config };
    }
  } catch (e) {
    console.warn('[CMS] Firestore restore error:', e);
  }

  try {
    const res = await fetch(`/api/admin/revisions/${id}/restore`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to restore revision' };
    return { success: true, config: data.config };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore revision' };
  }
}

// =========================================================================
// INQUIRIES & LEADS APIS (CRM)
// =========================================================================

export async function submitContactInquiry(payload: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  source?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await submitContactEnquiry({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      selectedService: payload.service || 'General Inquiry',
      projectDescription: payload.message || 'Website inquiry',
      consentAccepted: true,
      source: payload.source || 'website-contact'
    });
    return { success: res.success, error: res.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchInquiries(filter?: { status?: string; search?: string }): Promise<{ success: boolean; inquiries: InquiryRecord[]; error?: string }> {
  // 1. Try Firestore canonical CRM
  try {
    const leads = await fetchAllLeadsFromFirestore();
    if (leads && leads.length > 0) {
      let filtered = leads;
      if (filter?.status && filter.status !== 'all') {
        filtered = filtered.filter(l => l.status === filter.status);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        filtered = filtered.filter(l =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.service?.toLowerCase().includes(q) ||
          l.message?.toLowerCase().includes(q)
        );
      }
      return { success: true, inquiries: filtered };
    }
  } catch (e) {
    console.warn('[CMS] Firestore leads fetch error, trying server API:', e);
  }

  // 2. Fallback to server API
  try {
    const params = new URLSearchParams();
    if (filter?.status && filter.status !== 'all') params.append('status', filter.status);
    if (filter?.search) params.append('search', filter.search);

    const url = `/api/admin/inquiries${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, inquiries: [], error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return { success: true, inquiries: data.inquiries || [] };
  } catch (err: any) {
    return { success: false, inquiries: [], error: err.message || 'Failed to fetch inquiries' };
  }
}

export async function updateInquiry(id: string, updates: { status?: string; notes?: string }): Promise<{ success: boolean; inquiry?: InquiryRecord; error?: string }> {
  // 1. Update in Firestore
  try {
    if (updates.status) {
      await updateLeadStatusInFirestore(id, updates.status, updates.notes);
    }
  } catch (e) {
    console.warn('[CMS] Firestore lead update error:', e);
  }

  // 2. Sync with server API
  try {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return { success: true, inquiry: data.inquiry };
  } catch (err: any) {
    return { success: true, inquiry: { id, ...updates } as any };
  }
}

export async function deleteInquiry(id: string): Promise<{ success: boolean; error?: string }> {
  // 1. Delete from Firestore
  try {
    await deleteLeadFromFirestore(id);
  } catch (e) {
    console.warn('[CMS] Firestore lead delete error:', e);
  }

  // 2. Sync with server API
  try {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: true };
  }
}

// =========================================================================
// MEDIA LIBRARY APIS
// =========================================================================

export async function fetchMediaItems(): Promise<{ success: boolean; media: MediaItem[]; error?: string }> {
  // 1. Try Firestore
  try {
    const media = await fetchMediaItemsFromFirestore();
    if (media && media.length > 0) {
      return { success: true, media };
    }
  } catch (e) {
    console.warn('[CMS] Firestore media fetch error, trying server API:', e);
  }

  // 2. Fallback to server API
  try {
    const res = await fetch('/api/admin/media', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, media: [], error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return { success: true, media: data.media || [] };
  } catch (err: any) {
    return { success: false, media: [], error: err.message || 'Failed to fetch media' };
  }
}

export async function uploadMediaItem(payload: { name: string; url: string; category?: string; size?: string; type?: string }): Promise<{ success: boolean; item?: MediaItem; error?: string }> {
  const newItem: MediaItem = {
    id: `media-${Date.now()}`,
    name: payload.name,
    url: payload.url,
    category: payload.category || 'General',
    size: payload.size || '1.2 MB',
    type: payload.type || 'image/jpeg',
    uploadedAt: new Date().toISOString()
  };

  try {
    await saveMediaItemToFirestore(newItem);
  } catch (e) {
    console.warn('[CMS] Firestore media upload error:', e);
  }

  try {
    const res = await fetch('/api/admin/media/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to upload media' };
    return { success: true, item: data.item || newItem };
  } catch (err: any) {
    return { success: true, item: newItem };
  }
}

export async function deleteMediaItem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteMediaItemFromFirestore(id);
  } catch (e) {
    console.warn('[CMS] Firestore media delete error:', e);
  }

  try {
    const res = await fetch(`/api/admin/media/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: true };
  }
}

// =========================================================================
// USERS & ROLES APIS
// =========================================================================

export async function fetchAdminUsers(): Promise<{ success: boolean; users: AdminUser[]; error?: string }> {
  try {
    const res = await fetch('/api/admin/users', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, users: [], error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return { success: true, users: data.users || [] };
  } catch (err: any) {
    return { success: false, users: [], error: err.message || 'Failed to fetch users' };
  }
}

export async function saveAdminUser(user: Partial<AdminUser>): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const isUpdate = Boolean(user.id);
    const url = isUpdate ? `/api/admin/users/${user.id}` : '/api/admin/users';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(user)
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to save user' };
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save user' };
  }
}

export async function deleteAdminUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete user' };
  }
}

export const createAdminUser = saveAdminUser;

export async function fetchAuditLogs(limitCount = 50): Promise<{ success: boolean; logs: any[]; error?: string }> {
  try {
    const res = await fetch(`/api/admin/audit-logs?limit=${limitCount}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, logs: [], error: 'SESSION_EXPIRED' };
    }
    const data = await res.json();
    return { success: true, logs: data.logs || [] };
  } catch (err: any) {
    return { success: false, logs: [], error: err.message || 'Failed to fetch audit logs' };
  }
}
