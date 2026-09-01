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

  const header = draftConfig.header;
  const footer = draftConfig.footer;
  const socialLinks = draftConfig.socialLinks || [];

  const handleUpdateHeaderCta = (field: string, val: any) => {
    updateDraft((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        ctaButton: {
          ...prev.header.ctaButton,
          [field]: val
        }
      }
    }));
  };

  const handleAddNavItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNavLabel.trim() || !newNavPath.trim()) return;

    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: newNavLabel.trim(),
      path: newNavPath.trim(),
      order: header.navigation.length + 1
    };

    updateDraft((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        navigation: [...prev.header.navigation, newItem]
      }
    }));

    setIsModalOpen(false);
    setNewNavLabel('');
    setNewNavPath('');
  };

  const handleDeleteNavItem = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        navigation: prev.header.navigation.filter((n) => n.id !== id)
      }
    }));
  };

  const handleUpdateFooter = (field: string, val: any) => {
    updateDraft((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: val
      }
    }));
  };

  const handleToggleSocial = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).map((s) =>
        s.id === id ? { ...s, isVisible: !s.isVisible } : s
      )
    }));
  };

  const handleUpdateSocialUrl = (id: string, url: string) => {
    updateDraft((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).map((s) =>
        s.id === id ? { ...s, url } : s
      )
    }));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Menu className="w-6 h-6 text-rose-500" />
            <span>Navigation, Footer & Social Profiles</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
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
      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Header Menu Items</h3>
            <p className="text-xs text-neutral-400">Navigation links displayed on top of the website.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Link</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {header.navigation.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between"
            >
              <div>
                <span className="text-sm font-bold text-white">{item.label}</span>
                <span className="text-xs text-neutral-400 font-mono ml-2">{item.path}</span>
              </div>
              <button
                onClick={() => handleDeleteNavItem(item.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Header CTA Button Text</label>
            <input
              type="text"
              value={header.ctaButton?.text || ''}
              onChange={(e) => handleUpdateHeaderCta('text', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Header CTA Link Target</label>
            <input
              type="text"
              value={header.ctaButton?.link || ''}
              onChange={(e) => handleUpdateHeaderCta('link', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: SOCIAL PROFILES */}
      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-white">Social Media Profiles</h3>
          <p className="text-xs text-neutral-400">Direct profile URLs and visibility toggles.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socialLinks.map((social) => (
            <div
              key={social.id}
              className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{social.platform}</span>
                <button
                  onClick={() => handleToggleSocial(social.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    social.isVisible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {social.isVisible ? 'Active' : 'Hidden'}
                </button>
              </div>

              <input
                type="text"
                value={social.url}
                onChange={(e) => handleUpdateSocialUrl(social.id, e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: FOOTER SETTINGS */}
      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Footer Copywriting</h3>
          <p className="text-xs text-neutral-400">Copyright notices and closing statements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Copyright Notice</label>
            <input
              type="text"
              value={footer.copyrightText || ''}
              onChange={(e) => handleUpdateFooter('copyrightText', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Footer Tagline</label>
            <input
              type="text"
              value={footer.tagline || ''}
              onChange={(e) => handleUpdateFooter('tagline', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Bottom Subtext</label>
            <input
              type="text"
              value={footer.bottomSubtext || ''}
              onChange={(e) => handleUpdateFooter('bottomSubtext', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* MODAL: Add Nav Link */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Menu Link</h3>

            <form onSubmit={handleAddNavItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Menu Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Insights"
                  value={newNavLabel}
                  onChange={(e) => setNewNavLabel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Target Path / Anchor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., #insights or /insights"
                  value={newNavPath}
                  onChange={(e) => setNewNavPath(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
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
