import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { SiteTemplate } from '../../../types/cms';
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Client Reselling System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-500" />
            <span>Template Management & Reseller Hub</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Switch between pre-built niche templates with 1 click, or export website configurations to sell to new clients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Import Template</span>
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Save Current Site as Template</span>
          </button>
        </div>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Info Callout */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex items-start gap-3.5 text-xs sm:text-sm text-neutral-300">
        <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white font-semibold">How the Template System works:</strong> When you activate a template, your existing website is immediately backed up to the <strong>Revision History</strong>. You can restore it anytime with one click.
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => {
          const isActivating = activatingId === tpl.id;
          return (
            <div
              key={tpl.id}
              className="bg-neutral-900/80 border border-white/10 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-44 w-full overflow-hidden bg-black/50">
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                      {tpl.category}
                    </span>
                    {tpl.isBuiltIn && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/80 text-white backdrop-blur-md">
                        Official Preset
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-2 line-clamp-2">
                    {tpl.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                    <span>Author: <strong className="text-neutral-300">{tpl.author}</strong></span>
                    <span>Version 1.0</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 pt-0 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleActivate(tpl.id, tpl.name)}
                  disabled={isActivating}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isActivating ? 'Activating...' : '1-Click Activate'}</span>
                </button>

                <button
                  onClick={() => handleExportTemplate(tpl)}
                  title="Export JSON"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>

                {!tpl.isBuiltIn && (
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    title="Delete Custom Template"
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
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
      <div className="p-6 rounded-2xl bg-neutral-900/40 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset Website to Default Baseline</span>
          </h4>
          <p className="text-xs text-neutral-400 mt-1">
            Restores all sections, copywriting, and theme colors to the clean Rohit Verma creator template.
          </p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all self-start sm:self-auto"
        >
          Reset Website
        </button>
      </div>

      {/* MODAL: Save Current Site as Template */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Save Current Website as Template</h3>
            <p className="text-xs text-neutral-400">
              Save your current theme colors, copywriting, projects, and services as a reusable template to sell to clients.
            </p>

            <form onSubmit={handleSaveCurrentAsTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Client Luxe Fashion Studio"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Category</label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Creator & Motion">Creator & Motion</option>
                  <option value="Creative Agency">Creative Agency</option>
                  <option value="Minimalist">Minimalist</option>
                  <option value="SaaS & Tech">SaaS & Tech</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this template layout..."
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Import Template JSON</h3>
            <p className="text-xs text-neutral-400">
              Paste the exported template JSON code below to install it into your template library.
            </p>

            <form onSubmit={handleImportJson} className="space-y-4">
              <div>
                <textarea
                  rows={8}
                  required
                  placeholder='Paste JSON here: { "name": "...", "config": { ... } }'
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>Confirm Site Reset</span>
            </h3>
            <p className="text-xs text-neutral-300">
              This will overwrite all active website content with the default template. An automated snapshot will be saved in your <strong>Revision History</strong> before reset.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetSite}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30"
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
