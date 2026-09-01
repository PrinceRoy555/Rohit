import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { SeoConfig } from '../../../types/cms';
import {
  Globe,
  Search,
  Share2,
  Code,
  Save,
  Check,
  Sparkles,
  Eye
} from 'lucide-react';

export const SeoMetaTab: React.FC = () => {
  const { draftConfig, updateDraft, saveDraft, isSaving } = useSiteConfig();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const seo = draftConfig.seo;

  const handleUpdate = (field: keyof SeoConfig, val: any) => {
    updateDraft((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: val
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Search className="w-6 h-6 text-rose-500" />
            <span>SEO, Social Graph & Meta Settings</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Fine-tune search engine ranking, social media share cards, and tracking scripts.
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

      {/* Google Search Live Preview */}
      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <span>Google Search SERP Preview</span>
        </h3>
        <div className="p-4 rounded-xl bg-white text-black max-w-2xl font-sans shadow-md">
          <div className="text-xs text-neutral-600 flex items-center gap-1 font-mono">
            <span>https://rohitverma.design</span>
            <span>›</span>
          </div>
          <h4 className="text-lg text-blue-800 hover:underline font-medium cursor-pointer line-clamp-1 mt-0.5">
            {seo.metaTitle || 'Rohit Verma — Graphic Designer & Video Editor | Jaipur'}
          </h4>
          <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
            {seo.metaDescription || 'Official portfolio of Rohit Verma, expert Graphic Designer & Video Editor in Jaipur, India. Specializing in branding, social creatives, and motion.'}
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Browser & Meta Title ({seo.metaTitle?.length || 0} / 60 chars recommended)
            </label>
            <input
              type="text"
              value={seo.metaTitle || ''}
              onChange={(e) => handleUpdate('metaTitle', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Meta Description ({seo.metaDescription?.length || 0} / 160 chars recommended)
            </label>
            <textarea
              rows={3}
              value={seo.metaDescription || ''}
              onChange={(e) => handleUpdate('metaDescription', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Keywords (comma separated)</label>
            <input
              type="text"
              value={seo.keywords || ''}
              onChange={(e) => handleUpdate('keywords', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Author Tag</label>
            <input
              type="text"
              value={seo.author || ''}
              onChange={(e) => handleUpdate('author', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Social Share OpenGraph Image URL</label>
            <input
              type="text"
              value={seo.ogImage || ''}
              onChange={(e) => handleUpdate('ogImage', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Google Analytics Tag (e.g. G-XXXXXXX)</label>
            <input
              type="text"
              placeholder="G-..."
              value={seo.googleAnalyticsId || ''}
              onChange={(e) => handleUpdate('googleAnalyticsId', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Twitter / X Handle</label>
            <input
              type="text"
              placeholder="@rohitverma"
              value={seo.twitterHandle || ''}
              onChange={(e) => handleUpdate('twitterHandle', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
