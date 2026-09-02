import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { NavigationItem, SocialLinkItem } from '../../../types/cms';
import {
  Menu,
  Globe,
  Plus,
  Trash2,
  Save,
  Check,
  Share2,
  ExternalLink,
  Sliders
} from 'lucide-react';

export const NavigationFooterTab: React.FC = () => {
  const { draftConfig, updateDraft, saveDraft, isSaving } = useSiteConfig();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Link States
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavPath, setNewNavPath] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Safe navigation items resolution
  const navItems: NavigationItem[] =
    draftConfig?.navigation?.items ||
    draftConfig?.navigation?.navigation ||
    draftConfig?.header?.navigation ||
    draftConfig?.header?.items ||
    [];

  const ctaButton =
    draftConfig?.navigation?.ctaButton ||
    draftConfig?.header?.ctaButton ||
    {};

  const footer = draftConfig?.footer || {};
  const socialLinks = draftConfig?.socialLinks || draftConfig?.branding?.socials || [];

  const handleUpdateHeaderCta = (field: string, val: any) => {
    updateDraft((prev) => {
      const prevNav = prev?.navigation || {};
      const prevHeader = prev?.header || {};
      const updatedCta = {
        ...(prevNav.ctaButton || prevHeader.ctaButton || {}),
        [field]: val,
        // Sync text <-> label and link <-> route
        ...(field === 'text' ? { label: val } : {}),
        ...(field === 'label' ? { text: val } : {}),
        ...(field === 'link' ? { route: val } : {}),
        ...(field === 'route' ? { link: val } : {})
      };

      return {
        ...prev,
        navigation: {
          ...prevNav,
          items: prevNav.items || prevHeader.navigation || [],
          ctaButton: updatedCta
        },
        header: {
          ...prevHeader,
          navigation: prevHeader.navigation || prevNav.items || [],
          ctaButton: updatedCta
        }
      };
    });
  };

  const handleAddNavItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNavLabel.trim() || !newNavPath.trim()) return;

    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: newNavLabel.trim(),
      path: newNavPath.trim(),
      route: newNavPath.trim().replace(/^#|^\//, '') || 'home',
      order: navItems.length + 1,
      isVisible: true
    };

    updateDraft((prev) => {
      const currentList =
        prev?.navigation?.items ||
        prev?.navigation?.navigation ||
        prev?.header?.navigation ||
        prev?.header?.items ||
        [];
      const updatedList = [...currentList, newItem];

      return {
        ...prev,
        navigation: {
          ...(prev?.navigation || {}),
          items: updatedList
        },
        header: {
          ...(prev?.header || {}),
          navigation: updatedList
        }
      };
    });

    setIsModalOpen(false);
    setNewNavLabel('');
    setNewNavPath('');
  };

  const handleDeleteNavItem = (id: string) => {
    updateDraft((prev) => {
      const currentList =
        prev?.navigation?.items ||
        prev?.navigation?.navigation ||
        prev?.header?.navigation ||
        prev?.header?.items ||
        [];
      const updatedList = currentList.filter((n) => n.id !== id);

      return {
        ...prev,
        navigation: {
          ...(prev?.navigation || {}),
          items: updatedList
        },
        header: {
          ...(prev?.header || {}),
          navigation: updatedList
        }
      };
    });
  };

  const handleUpdateFooter = (field: string, val: any) => {
    updateDraft((prev) => ({
      ...prev,
      footer: {
        ...(prev?.footer || {}),
        [field]: val
      }
    }));
  };

  const handleToggleSocial = (id?: string) => {
    if (!id) return;
    updateDraft((prev) => {
      const currentSocials = prev?.socialLinks || prev?.branding?.socials || [];
      const updatedSocials = currentSocials.map((s) =>
        s.id === id ? { ...s, isVisible: s.isVisible !== false ? false : true } : s
      );
      return {
        ...prev,
        socialLinks: updatedSocials,
        branding: {
          ...(prev?.branding || {}),
          socials: updatedSocials
        } as any
      };
    });
  };

  const handleUpdateSocialUrl = (id: string | undefined, url: string) => {
    if (!id) return;
    updateDraft((prev) => {
      const currentSocials = prev?.socialLinks || prev?.branding?.socials || [];
      const updatedSocials = currentSocials.map((s) =>
        s.id === id ? { ...s, url } : s
      );
      return {
        ...prev,
        socialLinks: updatedSocials,
        branding: {
          ...(prev?.branding || {}),
          socials: updatedSocials
        } as any
      };
    });
  };

  const handleSave = async () => {
    const success = await saveDraft();
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-color pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Menu className="w-6 h-6 text-rose-500" />
            <span>Navigation, Footer & Social Profiles</span>
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Configure header menu items, contact CTA buttons, social handles, and footer copywriting.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Draft Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: HEADER NAVIGATION */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-text-primary">Header Menu Items</h3>
            <p className="text-xs text-text-muted">Navigation links displayed on top of the website.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Link</span>
          </button>
        </div>

        {navItems.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-border-color text-center text-text-muted text-xs">
            No navigation items configured. Click "Add Menu Link" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-black/20 dark:bg-black/40 border border-border-color flex items-center justify-between"
              >
                <div>
                  <span className="text-sm font-bold text-text-primary">{item.label}</span>
                  <span className="text-xs text-text-muted font-mono ml-2">{item.path || item.route || '/'}</span>
                </div>
                <button
                  onClick={() => handleDeleteNavItem(item.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                  aria-label={`Delete ${item.label}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-border-color grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Header CTA Button Text</label>
            <input
              type="text"
              value={ctaButton.text || ctaButton.label || ''}
              onChange={(e) => handleUpdateHeaderCta('text', e.target.value)}
              className="w-full bg-input-bg border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Header CTA Link Target</label>
            <input
              type="text"
              value={ctaButton.link || ctaButton.route || ''}
              onChange={(e) => handleUpdateHeaderCta('link', e.target.value)}
              className="w-full bg-input-bg border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: SOCIAL PROFILES */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-text-primary">Social Media Profiles</h3>
          <p className="text-xs text-text-muted">Direct profile URLs and visibility toggles.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socialLinks.map((social, idx) => {
            const socialId = social.id || `social-${idx}`;
            const isVisible = social.isVisible !== false;
            return (
              <div
                key={socialId}
                className="p-4 rounded-xl bg-black/20 dark:bg-black/40 border border-border-color flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">{social.platform || social.name || social.label || 'Link'}</span>
                  <button
                    onClick={() => handleToggleSocial(social.id || socialId)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      isVisible ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/10 text-text-muted'
                    }`}
                  >
                    {isVisible ? 'Active' : 'Hidden'}
                  </button>
                </div>

                <input
                  type="text"
                  value={social.url || ''}
                  onChange={(e) => handleUpdateSocialUrl(social.id || socialId, e.target.value)}
                  className="w-full bg-input-bg border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:border-rose-500 focus:outline-none font-mono"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: FOOTER SETTINGS */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-text-primary">Footer Copywriting</h3>
          <p className="text-xs text-text-muted">Copyright notices and closing statements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Copyright Notice</label>
            <input
              type="text"
              value={footer.copyrightText || footer.copyright || ''}
              onChange={(e) => {
                handleUpdateFooter('copyrightText', e.target.value);
                handleUpdateFooter('copyright', e.target.value);
              }}
              className="w-full bg-input-bg border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Footer Tagline</label>
            <input
              type="text"
              value={footer.tagline || ''}
              onChange={(e) => handleUpdateFooter('tagline', e.target.value)}
              className="w-full bg-input-bg border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">Bottom Subtext</label>
            <input
              type="text"
              value={footer.bottomSubtext || footer.customNote || ''}
              onChange={(e) => {
                handleUpdateFooter('bottomSubtext', e.target.value);
                handleUpdateFooter('customNote', e.target.value);
              }}
              className="w-full bg-input-bg border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* MODAL: Add Nav Link */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="admin-modal bg-bg-card border border-border-color rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-text-primary">
            <h3 className="text-lg font-bold text-text-primary">Add Menu Link</h3>

            <form onSubmit={handleAddNavItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">Menu Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Insights"
                  value={newNavLabel}
                  onChange={(e) => setNewNavLabel(e.target.value)}
                  className="w-full bg-input-bg border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">Target Path / Anchor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., #insights or /insights"
                  value={newNavPath}
                  onChange={(e) => setNewNavPath(e.target.value)}
                  className="w-full bg-input-bg border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30"
                >
                  Add Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
