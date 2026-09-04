import { Insight, InsightAutomationSettings } from '../types';

export interface AdminSessionInfo {
  authenticated: boolean;
  adminEmail?: string;
  expiresAt?: number;
  timeRemainingMs?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  adminEmail: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning' | 'info';
}

// In-memory & browser storage token caching for cross-origin / iframe resilience
let inMemoryToken: string | null = null;

export function getAdminToken(): string | null {
  if (!inMemoryToken && typeof window !== 'undefined') {
    try {
      inMemoryToken = sessionStorage.getItem('rohit_admin_token') || localStorage.getItem('rohit_admin_token');
    } catch {
      // Storage access blocked or restricted
    }
  }
  return inMemoryToken;
}

export function setAdminToken(token: string | null) {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        sessionStorage.setItem('rohit_admin_token', token);
        localStorage.setItem('rohit_admin_token', token);
      } else {
        sessionStorage.removeItem('rohit_admin_token');
        localStorage.removeItem('rohit_admin_token');
      }
    } catch {
      // Storage access blocked or restricted
    }
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Synchronize authenticated Firebase Auth session with backend.
 */
export async function syncFirebaseAdminSession(email: string, idToken: string, uid?: string): Promise<{
  success: boolean;
  adminEmail?: string;
  token?: string;
  expiresAt?: number;
  sessionDurationMs?: number;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/firebase-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include HTTP-only cookies
      body: JSON.stringify({ email, idToken, uid }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Server authorization failed.'
      };
    }

    if (data.token) {
      setAdminToken(data.token);
    }

    return {
      success: true,
      adminEmail: data.adminEmail,
      token: data.token,
      expiresAt: data.expiresAt,
      sessionDurationMs: data.sessionDurationMs
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Network error communicating with server.'
    };
  }
}

/**
 * Authenticate with the server using Administrator credentials.
 */
export async function loginAdmin(email: string, password?: string, idToken?: string, uid?: string): Promise<{
  success: boolean;
  adminEmail?: string;
  token?: string;
  expiresAt?: number;
  sessionDurationMs?: number;
  error?: string;
  lockoutSeconds?: number;
}> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include HTTP-only cookies
      body: JSON.stringify({ email, password, idToken, uid }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Authentication failed. Please check credentials.',
        lockoutSeconds: data.lockoutSeconds
      };
    }

    if (data.token) {
      setAdminToken(data.token);
    }

    return {
      success: true,
      adminEmail: data.adminEmail,
      token: data.token,
      expiresAt: data.expiresAt,
      sessionDurationMs: data.sessionDurationMs
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Network error or server unreachable. Please try again.'
    };
  }
}

/**
 * Check if the current administrator session is valid on the server.
 */
export async function checkAdminSession(): Promise<AdminSessionInfo> {
  try {
    const res = await fetch('/api/admin/me', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      setAdminToken(null);
      return { authenticated: false };
    }

    const data = await res.json();
    return {
      authenticated: Boolean(data.authenticated),
      adminEmail: data.adminEmail,
      expiresAt: data.expiresAt,
      timeRemainingMs: data.timeRemainingMs
    };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Terminate active administrator session on the server.
 */
export async function logoutAdmin(): Promise<{ success: boolean }> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
  } catch (e) {
    // Ignore network error on logout
  } finally {
    setAdminToken(null);
  }
  return { success: true };
}

/**
 * Fetch all insights (Drafts, Review, Scheduled, Published) - Admin only.
 */
export async function fetchAdminInsights(): Promise<{ success: boolean; insights: Insight[]; error?: string }> {
  try {
    const res = await fetch('/api/admin/insights', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, insights: [], error: 'SESSION_EXPIRED' };
    }

    const data = await res.json();
    return { success: true, insights: data.insights || [] };
  } catch (err: any) {
    return { success: false, insights: [], error: err.message || 'Failed to fetch insights' };
  }
}

/**
 * Save or update an insight - Admin only.
 */
export async function saveAdminInsight(insight: Partial<Insight>): Promise<{ success: boolean; insight?: Insight; error?: string }> {
  try {
    const isUpdate = Boolean(insight.id && !insight.id.startsWith('temp-'));
    const url = isUpdate ? `/api/admin/insights/${insight.id}` : '/api/admin/insights';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(insight)
    });

    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to save insight' };
    }

    return { success: true, insight: data.insight };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error saving insight' };
  }
}

/**
 * Delete an insight - Admin only.
 */
export async function deleteAdminInsight(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/insights/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to delete insight' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete insight' };
  }
}

/**
 * Update publication status directly - Admin only.
 */
export async function setAdminInsightStatus(id: string, status: string): Promise<{ success: boolean; insight?: Insight; error?: string }> {
  try {
    const res = await fetch(`/api/admin/insights/${id}/status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status })
    });

    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }

    const data = await res.json();
    return { success: true, insight: data.insight };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update status' };
  }
}

/**
 * Fetch automation configuration settings - Admin only.
 */
export async function fetchAdminSettings(): Promise<{ success: boolean; settings?: InsightAutomationSettings; error?: string }> {
  try {
    const res = await fetch('/api/admin/automation-settings', {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }

    const data = await res.json();
    return { success: true, settings: data.settings };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch settings' };
  }
}

/**
 * Save automation configuration settings - Admin only.
 */
export async function saveAdminSettings(settings: Partial<InsightAutomationSettings>): Promise<{ success: boolean; settings?: InsightAutomationSettings; error?: string }> {
  try {
    const res = await fetch('/api/admin/automation-settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(settings)
    });

    if (res.status === 401) {
      setAdminToken(null);
      return { success: false, error: 'SESSION_EXPIRED' };
    }

    const data = await res.json();
    return { success: true, settings: data.settings };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save settings' };
  }
}

/**
 * Trigger server-side AI generation - Admin only.
 */
export async function generateAiInsight(payload: {
  topicPrompt?: string;
  targetCategory?: string;
  autoPublish?: boolean;
  mode?: string;
  customKeywords?: string;
}): Promise<{ success: boolean; insight?: Insight; error?: string }> {
  try {
    const res = await fetch('/api/admin/insights/generate', {
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
    if (!res.ok) {
      return { success: false, error: data.error || 'AI generation failed' };
    }

    return { success: true, insight: data.insight };
  } catch (err: any) {
    return { success: false, error: err.message || 'AI generation network error' };
  }
}

/**
 * Fetch administrative security and audit logs - Admin only.
 */
export async function fetchAdminAuditLogs(): Promise<{ success: boolean; logs: AuditLogEntry[]; error?: string }> {
  try {
    const res = await fetch('/api/admin/audit-logs', {
      method: 'GET',
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
