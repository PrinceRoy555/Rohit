import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { SectionsConfig, CustomPageItem } from '../../../types/cms';
import { PageHeader } from '../layout/PageHeader';
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Page & Section Manager"
        description="Toggle visibility, adjust headlines and badges, and manage custom standalone pages."
        actions={
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer select-none"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Draft Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </>
            )}
          </button>
        }
      />

      {/* Sub-nav */}
      <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 sm:gap-2 p-1.5 bg-bg-card border border-border-color rounded-xl sm:rounded-2xl shadow-xs">
        {[
          { id: 'sections', label: 'Sections Visibility & Copy', icon: Layers },
          { id: 'hero', label: 'Hero Headline & CTA', icon: Sparkles },
          { id: 'pages', label: 'Standalone Pages', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-shrink-0 whitespace-nowrap min-h-[38px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-98 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'
              }`}
            >
              <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-SECTION 1: HOMEPAGE SECTIONS */}
      {activeSubTab === 'sections' && (
        <div className="space-y-3 sm:space-y-4">
          {sectionKeys.map((key) => {
            const sec = sections[key];
            if (!sec) return null;
            const isEditing = editingSectionId === key;

            return (
              <div
                key={key}
                className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleVisibility(key)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all active:scale-95 flex-shrink-0 ${
                        sec.isVisible
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-bg-secondary border-border-color text-text-muted'
                      }`}
                      title={sec.isVisible ? 'Visible on site' : 'Hidden from site'}
                    >
                      {sec.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-text-primary">{sec.title}</h4>
                        {sec.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {sec.badge}
                          </span>
                        )}
                        {!sec.isVisible && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-bg-secondary text-text-muted border border-border-color">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{sec.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingSectionId(isEditing ? null : key)}
                    className="min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-secondary border border-border-color flex items-center justify-center gap-1.5 self-stretch sm:self-auto transition-colors active:scale-98"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Done' : 'Edit Copy'}</span>
                  </button>
                </div>

                {isEditing && (
                  <div className="pt-3.5 border-t border-border-color grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Section Title</label>
                      <input
                        type="text"
                        value={sec.title || ''}
                        onChange={(e) => handleUpdateSectionInfo(key, 'title', e.target.value)}
                        className="w-full min-h-[40px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={sec.badge || ''}
                        onChange={(e) => handleUpdateSectionInfo(key, 'badge', e.target.value)}
                        className="w-full min-h-[40px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Subtitle / Description</label>
                      <input
                        type="text"
                        value={sec.subtitle || ''}
                        onChange={(e) => handleUpdateSectionInfo(key, 'subtitle', e.target.value)}
                        className="w-full min-h-[40px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
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
        <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xs">
          <h3 className="text-sm sm:text-base font-bold text-text-primary mb-1 sm:mb-2">Homepage Hero Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Headline Prefix</label>
              <input
                type="text"
                value={sections.hero.headlinePrefix || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'headlinePrefix', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Headline Highlight (Red Gradient)</label>
              <input
                type="text"
                value={sections.hero.headlineHighlight || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'headlineHighlight', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Headline Suffix</label>
              <input
                type="text"
                value={sections.hero.headlineSuffix || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'headlineSuffix', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-3.5 sm:pt-4 border-t border-border-color">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Primary CTA Button Text</label>
              <input
                type="text"
                value={sections.hero.ctaPrimaryText || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'ctaPrimaryText', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Primary CTA Link</label>
              <input
                type="text"
                value={sections.hero.ctaPrimaryLink || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'ctaPrimaryLink', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Secondary CTA Button Text</label>
              <input
                type="text"
                value={sections.hero.ctaSecondaryText || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'ctaSecondaryText', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Secondary CTA Link</label>
              <input
                type="text"
                value={sections.hero.ctaSecondaryLink || ''}
                onChange={(e) => handleUpdateSectionInfo('hero', 'ctaSecondaryLink', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: CUSTOM STANDALONE PAGES */}
      {activeSubTab === 'pages' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm sm:text-base font-bold text-text-primary">Custom Pages & Legal Documents</h3>
            <button
              onClick={() => setShowAddPageModal(true)}
              className="min-h-[38px] sm:min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center justify-center gap-1.5 self-stretch sm:self-auto active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Page</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {(draftConfig.customPages || []).map((page) => (
              <div
                key={page.id}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-bg-card border border-border-color hover:border-rose-500/30 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base font-bold text-text-primary">{page.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-mono bg-bg-secondary text-text-muted border border-border-color">
                      /{page.slug}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 line-clamp-2">{page.metaDescription}</p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-border-color flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs text-text-muted">
                    Updated: {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center transition-colors active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl text-text-primary max-h-[92vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">Create New Custom Page</h3>

            <form onSubmit={handleAddPage} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Client FAQ & Onboarding"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g., client-faq"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Meta Description</label>
                <input
                  type="text"
                  placeholder="SEO meta summary..."
                  value={newPageDesc}
                  onChange={(e) => setNewPageDesc(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Page Content (Markdown)</label>
                <textarea
                  rows={6}
                  placeholder="# Page Heading&#10;&#10;Enter detailed page content here..."
                  value={newPageContent}
                  onChange={(e) => setNewPageContent(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-xs font-mono text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setShowAddPageModal(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color transition-colors active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all active:scale-98"
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
