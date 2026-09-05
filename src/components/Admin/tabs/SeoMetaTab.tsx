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
      <div className="bg-bg-card dark:bg-neutral-900 border border-border-color dark:border-neutral-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Google Search SERP Preview</span>
          </h3>
          <span className="text-[11px] font-medium text-text-muted dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full border border-border-color dark:border-neutral-700">
            Real-time Simulation
          </span>
        </div>

        {/* Google SERP Card */}
        <div className="p-5 sm:p-6 rounded-[16px] bg-[#ffffff] dark:bg-[#202124] border border-neutral-200/90 dark:border-neutral-700/60 shadow-sm hover:shadow-md transition-shadow max-w-2xl font-sans">
          {/* Favicon & Site Name Badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center flex-shrink-0 text-neutral-600 dark:text-neutral-400">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="text-[12px] sm:text-[13px] font-medium text-neutral-800 dark:text-neutral-200">
              Rohit Verma Portfolio
            </span>
          </div>

          {/* Title: 18–22px, blue search-result style, medium/semi-bold */}
          <h4 className="text-[18px] sm:text-[20px] font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1">
            {seo.metaTitle || 'Rohit Verma | Graphic Designer & Video Editor in Jaipur'}
          </h4>

          {/* URL: muted green/gray, small text */}
          <div className="text-xs sm:text-[13px] text-emerald-700 dark:text-emerald-400 font-normal mt-0.5 truncate">
            https://rohitverma.design
          </div>

          {/* Description: 14–16px, dark gray, readable contrast, proper line height */}
          <p className="text-[14px] sm:text-[15px] text-[#4d5156] dark:text-[#bdc1c6] mt-2 line-clamp-2 leading-relaxed">
            {seo.metaDescription || 'Graphic designer and video editor in Jaipur specializing in branding, social media creatives, motion graphics and visual design.'}
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
