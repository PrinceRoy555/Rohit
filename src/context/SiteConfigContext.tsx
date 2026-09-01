import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SiteConfig, SiteTemplate, ThemeConfig } from '../types/cms';
import { DEFAULT_SITE_CONFIG } from '../data/defaultSiteConfig';
import {
  fetchPublicSiteConfig,
  fetchDraftSiteConfig,
  saveDraftSiteConfig,
  publishSiteConfig,
  discardDraftSiteConfig,
  activateTemplate as apiActivateTemplate
} from '../services/cmsApi';
import { getAdminToken } from '../services/adminApi';

interface SiteConfigContextType {
  config: SiteConfig;
  activeConfig: SiteConfig;
  draftConfig: SiteConfig;
  hasUnpublishedChanges: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  error: string | null;
  isPreviewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
  updateDraft: (updater: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => void;
  saveDraft: () => Promise<boolean>;
  publish: (summary?: string) => Promise<boolean>;
  discardDraft: () => Promise<boolean>;
  activateTemplate: (templateId: string) => Promise<boolean>;
  refreshConfig: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

/**
 * Helper to apply dynamic Brand CSS variables to document root.
 * Mode tokens (surfaces, backgrounds, text colors, card colors, borders) are strictly
 * managed by CSS semantic variables for Light & Dark mode ([data-theme="light"] and [data-theme="dark"]).
 */
function applyThemeToDom(theme: ThemeConfig) {
  if (!theme || typeof document === 'undefined') return;
  const root = document.documentElement;

  // Clear any legacy mode surface properties that could conflict with Light/Dark CSS rules
  const modePropertiesToClear = [
    '--bg-primary',
    '--bg-secondary',
    '--bg-card',
    '--bg-card-hover',
    '--text-primary',
    '--text-secondary',
    '--text-muted',
    '--border-color',
    '--chat-window-bg',
    '--chat-body-bg',
    '--chat-surface',
    '--chat-surface-hover',
    '--chat-text-primary',
    '--chat-text-secondary',
    '--chat-border',
    '--chat-input-bg',
    '--chat-input-text'
  ];
  modePropertiesToClear.forEach((prop) => root.style.removeProperty(prop));

  // Apply BRAND tokens (Accents, Fonts, Radii)
  if (theme.primaryAccent) {
    root.style.setProperty('--accent-primary', theme.primaryAccent);
    root.style.setProperty('--chat-accent', theme.primaryAccent);
    root.style.setProperty('--chat-user-bg', theme.primaryAccent);
    root.style.setProperty('--chat-header-bg-start', theme.primaryAccent);
  }
  if (theme.secondaryAccent) {
    root.style.setProperty('--accent-secondary', theme.secondaryAccent);
    root.style.setProperty('--chat-accent-hover', theme.secondaryAccent);
  }
  if (theme.accentDark) {
    root.style.setProperty('--accent-dark', theme.accentDark);
    root.style.setProperty('--chat-header-bg-end', theme.accentDark);
  }

  if (theme.fontHeading) {
    root.style.setProperty('--font-display', `"${theme.fontHeading}", "Inter", sans-serif`);
  }
  if (theme.fontBody) {
    root.style.setProperty('--font-sans', `"${theme.fontBody}", ui-sans-serif, system-ui, sans-serif`);
  }

  // Border radius map
  const radiusMap: Record<string, string> = {
    none: '0px',
    sm: '6px',
    md: '12px',
    lg: '20px',
    full: '9999px'
  };
  if (theme.borderRadius) {
    root.style.setProperty('--theme-border-radius', radiusMap[theme.borderRadius] || '16px');
  }
}

export const SiteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(false);
  const [isPreviewMode, setPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial configuration fetch
  const refreshConfig = useCallback(async () => {
    try {
      const token = getAdminToken();
      if (token) {
        // Fetch draft if logged in
        const draftRes = await fetchDraftSiteConfig();
        if (draftRes.success && draftRes.config) {
          setDraftConfig(draftRes.config);
          setHasUnpublishedChanges(Boolean(draftRes.hasUnpublishedChanges));
        }
      }

      // Fetch public live config
      const publicRes = await fetchPublicSiteConfig();
      if (publicRes.success && publicRes.config) {
        setConfig(publicRes.config);
        if (!getAdminToken()) {
          setDraftConfig(publicRes.config);
        }
      }
    } catch (err: any) {
      console.warn('Failed to load live site config, using fallback data:', err);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  // 2. Synchronize theme with DOM
  useEffect(() => {
    const activeTheme = isPreviewMode ? draftConfig.theme : config.theme;
    if (activeTheme) {
      applyThemeToDom(activeTheme);
    }
  }, [config.theme, draftConfig.theme, isPreviewMode]);

  // 3. Update working draft locally
  const updateDraft = useCallback((updater: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => {
    setDraftConfig((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
    setHasUnpublishedChanges(true);
  }, []);

  // 4. Save draft to backend
  const saveDraft = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await saveDraftSiteConfig(draftConfig);
      if (res.success && res.config) {
        setDraftConfig(res.config);
        setHasUnpublishedChanges(true);
        setIsSaving(false);
        return true;
      }
      setError(res.error || 'Failed to save draft');
      setIsSaving(false);
      return false;
    } catch (err: any) {
      setError(err.message || 'Error saving draft');
      setIsSaving(false);
      return false;
    }
  }, [draftConfig]);

  // 5. Publish changes live
  const publish = useCallback(async (summary?: string): Promise<boolean> => {
    setIsPublishing(true);
    setError(null);
    try {
      // First save draft if modified
      await saveDraftSiteConfig(draftConfig);
      const res = await publishSiteConfig(summary);
      if (res.success && res.config) {
        setConfig(res.config);
        setDraftConfig(res.config);
        setHasUnpublishedChanges(false);
        setIsPublishing(false);
        return true;
      }
      setError(res.error || 'Failed to publish website');
      setIsPublishing(false);
      return false;
    } catch (err: any) {
      setError(err.message || 'Error publishing website');
      setIsPublishing(false);
      return false;
    }
  }, [draftConfig]);

  // 6. Discard draft changes
  const discardDraft = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await discardDraftSiteConfig();
      if (res.success && res.config) {
        setConfig(res.config);
        setDraftConfig(res.config);
        setHasUnpublishedChanges(false);
        setIsSaving(false);
        return true;
      }
      setError(res.error || 'Failed to discard draft');
      setIsSaving(false);
      return false;
    } catch (err: any) {
      setError(err.message || 'Error discarding draft');
      setIsSaving(false);
      return false;
    }
  }, []);

  // 7. Activate template
  const activateTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await apiActivateTemplate(templateId);
      if (res.success && res.config) {
        setConfig(res.config);
        setDraftConfig(res.config);
        setHasUnpublishedChanges(false);
        setIsSaving(false);
        return true;
      }
      setError(res.error || 'Failed to activate template');
      setIsSaving(false);
      return false;
    } catch (err: any) {
      setError(err.message || 'Error activating template');
      setIsSaving(false);
      return false;
    }
  }, []);

  const activeConfig = isPreviewMode ? draftConfig : config;

  return (
    <SiteConfigContext.Provider
      value={{
        config: activeConfig,
        activeConfig,
        draftConfig,
        hasUnpublishedChanges,
        isSaving,
        isPublishing,
        error,
        isPreviewMode,
        setPreviewMode,
        updateDraft,
        saveDraft,
        publish,
        discardDraft,
        activateTemplate,
        refreshConfig
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export function useSiteConfig(): SiteConfigContextType {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}
