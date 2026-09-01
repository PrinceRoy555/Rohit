import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { SectionsConfig, CustomPageItem } from '../../../types/cms';
import {
  LayoutDashboard,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Edit2,
  Save,
  Check,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  Layers
} from 'lucide-react';

export const SectionsManagerTab: React.FC = () => {
  const { draftConfig, updateDraft, saveDraft, isSaving } = useSiteConfig();
  const [activeSubTab, setActiveSubTab] = useState<'sections' | 'hero' | 'pages'>('sections');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<CustomPageItem | null>(null);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New page form
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageContent, setNewPageContent] = useState('');
  const [newPageDesc, setNewPageDesc] = useState('');

  const sections = draftConfig.sections;

  const sectionKeys: (keyof SectionsConfig)[] = [
    'hero',
    'portfolio',
    'services',
    'about',
    'experience',
    'skills',
    'testimonials',
    'pricing',
    'blog',
    'contact',
    'unicivix'
  ];

  const handleToggleVisibility = (key: keyof SectionsConfig) => {
    updateDraft((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: {
          ...prev.sections[key],
          isVisible: !prev.sections[key].isVisible
        }
      }
    }));
  };

  const handleUpdateSectionInfo = (key: keyof SectionsConfig, field: string, val: any) => {
    updateDraft((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: {
          ...prev.sections[key],
          [field]: val
        }
      }
    }));
  };

  const handleSave = async () => {
    const success = await saveDraft();
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const newPage: CustomPageItem = {
      id: `page-${Date.now()}`,
      title: newPageTitle.trim(),
      slug: (newPageSlug || newPageTitle).toLowerCase().replace(/[^a-z0-9]/g, '-'),
      content: newPageContent || '# ' + newPageTitle,
      metaDescription: newPageDesc,
      isPublished: true,
      updatedAt: new Date().toISOString()
    };

    updateDraft((prev) => ({
      ...prev,
      customPages: [...(prev.customPages || []), newPage]
    }));

    setShowAddPageModal(false);
    setNewPageTitle('');
    setNewPageSlug('');
    setNewPageContent('');
    setNewPageDesc('');
  };

  const handleDeletePage = (id: string) => {
    if (!window.confirm('Delete this custom page?')) return;
    updateDraft((prev) => ({
      ...prev,
      customPages: (prev.customPages || []).filter((p) => p.id !== id)
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-amber-500" />
            <span>Page & Section Manager</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Toggle visibility, adjust headlines and badges, and manage custom standalone pages.
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

      {/* Sub-nav */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-900/80 border border-white/10 rounded-2xl">
        {[
          { id: 'sections', label: 'Homepage Sections Visibility & Copy', icon: Layers },
          { id: 'hero', label: 'Hero Headline & CTA Links', icon: Sparkles },
          { id: 'pages', label: 'Custom Standalone Pages', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-SECTION 1: HOMEPAGE SECTIONS */}
      {activeSubTab === 'sections' && (
        <div className="space-y-4">
          {sectionKeys.map((key) => {
            const sec = sections[key];
            if (!sec) return null;
            const isEditing = editingSectionId === key;

            return (
              <div
                key={key}
                className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleVisibility(key)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                        sec.isVisible
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                      }`}
                      title={sec.isVisible ? 'Visible on site' : 'Hidden from site'}
                    >
                      {sec.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{sec.title}</h4>
                        {sec.badge && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            {sec.badge}
                          </span>
                        )}
                        {!sec.isVisible && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{sec.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingSectionId(isEditing ? null : key)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Done' : 'Edit Copy'}</span>
                  </button>
                </div>

                {isEditing && (
                  <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={sec.title || ''}
                        onChange={(e) => handleUpdateSectionInfo(key, 'title', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={sec.badge || ''}
                        onChange={(e) => handleUpdateSectionInfo(key, 'badge', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Subtitle / Description</label>
                      <input
                        type="text"
                        value={sec.subtitle || ''}
                        onChange={(e) => handleUpdateSectionInfo(key, 'subtitle', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-SECTION 2: HERO HEADLINE & CTA */}
      {activeSubTab === 'hero' && (
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white mb-2">Homepage Hero Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Headline Prefix</label>
              <input
                type="text"
                value={sections.hero.headlinePrefix || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'headlinePrefix', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Headline Highlight (Red Gradient)</label>
              <input
                type="text"
                value={sections.hero.headlineHighlight || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'headlineHighlight', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Headline Suffix</label>
              <input
                type="text"
                value={sections.hero.headlineSuffix || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'headlineSuffix', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Primary CTA Button Text</label>
              <input
                type="text"
                value={sections.hero.ctaPrimaryText || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'ctaPrimaryText', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Primary CTA Link</label>
              <input
                type="text"
                value={sections.hero.ctaPrimaryLink || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'ctaPrimaryLink', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Secondary CTA Button Text</label>
              <input
                type="text"
                value={sections.hero.ctaSecondaryText || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'ctaSecondaryText', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Secondary CTA Link</label>
              <input
                type="text"
                value={sections.hero.ctaSecondaryLink || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'ctaSecondaryLink', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: CUSTOM STANDALONE PAGES */}
      {activeSubTab === 'pages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Custom Pages & Legal Documents</h3>
            <button
              onClick={() => setShowAddPageModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Page</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(draftConfig.customPages || []).map((page) => (
              <div
                key={page.id}
                className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{page.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-white/5 text-neutral-300">
                      /{page.slug}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{page.metaDescription}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Updated: {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Create New Page */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Custom Page</h3>

            <form onSubmit={handleAddPage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Client FAQ & Onboarding"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g., client-faq"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Meta Description</label>
                <input
                  type="text"
                  placeholder="SEO meta summary..."
                  value={newPageDesc}
                  onChange={(e) => setNewPageDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Page Content (Markdown)</label>
                <textarea
                  rows={6}
                  placeholder="# Page Heading&#10;&#10;Enter detailed page content here..."
                  value={newPageContent}
                  onChange={(e) => setNewPageContent(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPageModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/30"
                >
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
