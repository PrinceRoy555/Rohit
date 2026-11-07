import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { SiteTemplate } from '../../../types/cms';
import { PageHeader } from '../layout/PageHeader';
import {
  fetchTemplates,
  createTemplate,
  deleteTemplate,
  importTemplate,
  resetSiteConfig
} from '../../../services/cmsApi';
import {
  Layers,
  Sparkles,
  Download,
  Upload,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Copy,
  Info
} from 'lucide-react';

export const TemplateSystemTab: React.FC = () => {
  const { config, activateTemplate, refreshConfig } = useSiteConfig();
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Form states
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<any>('Custom');
  const [importJsonText, setImportJsonText] = useState('');

  const loadAllTemplates = async () => {
    setLoading(true);
    const res = await fetchTemplates();
    if (res.success) {
      setTemplates(res.templates);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAllTemplates();
  }, []);

  const handleActivate = async (templateId: string, templateName: string) => {
    if (!window.confirm(`Activate template "${templateName}"? Your current website will be automatically backed up as a revision.`)) {
      return;
    }
    setActivatingId(templateId);
    setActionSuccess(null);
    setActionError(null);

    const success = await activateTemplate(templateId);
    if (success) {
      setActionSuccess(`Template "${templateName}" activated successfully!`);
      await refreshConfig();
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setActionError('Failed to activate template');
    }
    setActivatingId(null);
  };

  const handleSaveCurrentAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const res = await createTemplate({
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim(),
      category: newTemplateCategory,
      thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80',
      config: JSON.parse(JSON.stringify(config))
    });

    if (res.success && res.template) {
      setTemplates((prev) => [...prev, res.template!]);
      setShowSaveModal(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
      setActionSuccess(`Template "${res.template.name}" created! You can now export or reuse it.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setActionError(res.error || 'Failed to create template');
    }
  };

  const handleImportJson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await importTemplate(parsed);
      if (res.success && res.template) {
        setTemplates((prev) => [...prev, res.template!]);
        setShowImportModal(false);
        setImportJsonText('');
        setActionSuccess(`Template "${res.template.name}" imported successfully!`);
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setActionError(res.error || 'Failed to import template');
      }
    } catch (err: any) {
      setActionError('Invalid JSON format. Please check the file contents.');
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Delete custom template "${name}"?`)) return;
    const res = await deleteTemplate(id);
    if (res.success) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setActionSuccess(`Deleted template "${name}"`);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(res.error || 'Failed to delete');
    }
  };

  const handleExportTemplate = (t: SiteTemplate) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(t, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetSite = async () => {
    if (!window.confirm('Are you sure you want to reset the website? Current changes will be replaced by the default template.')) {
      return;
    }
    const res = await resetSiteConfig();
    if (res.success) {
      setShowResetModal(false);
      setActionSuccess('Website has been reset to default template.');
      await refreshConfig();
      setTimeout(() => setActionSuccess(null), 4000);
    } else {
      setActionError(res.error || 'Failed to reset website');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Template Management & Reseller Hub"
        description="Switch between pre-built niche templates with 1 click, or export website configurations to sell to new clients."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-bg-card hover:bg-bg-secondary text-text-primary border border-border-color flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer select-none"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Template</span>
            </button>

            <button
              onClick={() => setShowSaveModal(true)}
              className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer select-none"
            >
              <Plus className="w-4 h-4" />
              <span>Save Current Site as Template</span>
            </button>
          </div>
        }
      />

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3">
          <Check className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 dark:text-red-400 text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3">
          <ShieldAlert className="w-4 sm:w-5 h-4 sm:h-5 text-accent-primary flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Info Callout */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-card border border-border-color flex items-start gap-2.5 sm:gap-3.5 text-xs sm:text-sm text-text-secondary shadow-xs">
        <Info className="w-4 sm:w-5 h-4 sm:h-5 text-accent-primary flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-text-primary font-semibold">How the Template System works:</strong> When you activate a template, your existing website is immediately backed up to the <strong>Revision History</strong>. You can restore it anytime with one click.
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
        {templates.map((tpl) => {
          const isActivating = activatingId === tpl.id;
          return (
            <div
              key={tpl.id}
              className="bg-bg-card border border-border-color hover:border-accent-primary/30 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between group shadow-xs"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-bg-secondary">
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                      {tpl.category}
                    </span>
                    {tpl.isBuiltIn && (
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-accent-primary text-white backdrop-blur-md">
                        Official Preset
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-border-color flex items-center justify-between text-[11px] sm:text-xs text-text-muted">
                    <span>Author: <strong className="text-text-primary">{tpl.author}</strong></span>
                    <span>Version 1.0</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3.5 sm:p-5 pt-0 flex items-center justify-between gap-2 sm:gap-3">
                <button
                  onClick={() => handleActivate(tpl.id, tpl.name)}
                  disabled={isActivating}
                  className="flex-1 min-h-[40px] py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-98"
                >
                  <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>{isActivating ? 'Activating...' : '1-Click Activate'}</span>
                </button>

                <button
                  onClick={() => handleExportTemplate(tpl)}
                  title="Export JSON"
                  className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-bg-secondary hover:bg-bg-card text-text-secondary hover:text-text-primary border border-border-color transition-all flex items-center justify-center active:scale-95"
                >
                  <Download className="w-4 h-4" />
                </button>

                {!tpl.isBuiltIn && (
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    title="Delete Custom Template"
                    className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/20 transition-all flex items-center justify-center active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Danger Zone: Reset Website */}
      <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-bg-card border border-accent-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-accent-primary" />
            <span>Reset Website to Default Baseline</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5 sm:mt-1">
            Restores all sections, copywriting, and theme colors to the clean Rohit Verma creator template.
          </p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/30 transition-all self-stretch sm:self-auto flex items-center justify-center active:scale-98"
        >
          Reset Website
        </button>
      </div>

      {/* MODAL: Save Current Site as Template */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">Save Current Website as Template</h3>
            <p className="text-xs text-text-muted">
              Save your current theme colors, copywriting, projects, and services as a reusable template to sell to clients.
            </p>

            <form onSubmit={handleSaveCurrentAsTemplate} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Client Luxe Fashion Studio"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value as any)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="Creator & Motion">Creator & Motion</option>
                  <option value="Creative Agency">Creative Agency</option>
                  <option value="Minimalist">Minimalist</option>
                  <option value="SaaS & Tech">SaaS & Tech</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this template layout..."
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card text-text-secondary border border-border-color active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-xs active:scale-98"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Import Template JSON */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">Import Template JSON</h3>
            <p className="text-xs text-text-muted">
              Paste the exported template JSON code below to install it into your template library.
            </p>

            <form onSubmit={handleImportJson} className="space-y-3.5 sm:space-y-4">
              <div>
                <textarea
                  rows={8}
                  required
                  placeholder='Paste JSON here: { "name": "...", "config": { ... } }'
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-xs font-mono text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card text-text-secondary border border-border-color active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-xs active:scale-98"
                >
                  Import Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reset Site Confirmation */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-bg-card border border-red-500/30 rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-accent-primary" />
              <span>Confirm Site Reset</span>
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              This will overwrite all active website content with the default template. An automated snapshot will be saved in your <strong>Revision History</strong> before reset.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card text-text-secondary border border-border-color active:scale-98"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetSite}
                className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-xs active:scale-98"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
