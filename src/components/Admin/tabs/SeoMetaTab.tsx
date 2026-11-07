import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { SeoConfig } from '../../../types/cms';
import { PageHeader } from '../layout/PageHeader';
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="SEO, Social Graph & Meta Settings"
        description="Fine-tune search engine ranking, social media share cards, and tracking scripts."
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

      {/* Google Search Live Preview */}
      <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Google Search SERP Preview</span>
          </h3>
          <span className="text-[10px] sm:text-[11px] font-medium text-text-muted bg-bg-secondary px-2.5 py-0.5 sm:py-1 rounded-full border border-border-color">
            Real-time Simulation
          </span>
        </div>

        {/* Google SERP Card */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-bg-secondary border border-border-color shadow-xs hover:shadow-sm transition-shadow max-w-2xl font-sans">
          {/* Favicon & Site Name Badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-bg-card border border-border-color flex items-center justify-center flex-shrink-0 text-text-muted">
              <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </div>
            <span className="text-xs sm:text-[13px] font-medium text-text-primary">
              Rohit Verma Portfolio
            </span>
          </div>

          {/* Title: 18–22px, blue search-result style, medium/semi-bold */}
          <h4 className="text-[15px] sm:text-[18px] font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1">
            {seo.metaTitle || 'Rohit Verma | Graphic Designer & Video Editor in Jaipur'}
          </h4>

          {/* URL: muted green/gray, small text */}
          <div className="text-[11px] sm:text-[13px] text-emerald-700 dark:text-emerald-400 font-normal mt-0.5 truncate">
            https://rohitverma.design
          </div>

          {/* Description: 14–16px, dark gray, readable contrast, proper line height */}
          <p className="text-xs sm:text-sm text-text-secondary mt-1.5 sm:mt-2 line-clamp-2 leading-relaxed">
            {seo.metaDescription || 'Graphic designer and video editor in Jaipur specializing in branding, social media creatives, motion graphics and visual design.'}
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Browser & Meta Title ({seo.metaTitle?.length || 0} / 60 chars recommended)
            </label>
            <input
              type="text"
              value={seo.metaTitle || ''}
              onChange={(e) => handleUpdate('metaTitle', e.target.value)}
              className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Meta Description ({seo.metaDescription?.length || 0} / 160 chars recommended)
            </label>
            <textarea
              rows={3}
              value={seo.metaDescription || ''}
              onChange={(e) => handleUpdate('metaDescription', e.target.value)}
              className="w-full bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Keywords (comma separated)</label>
            <input
              type="text"
              value={seo.keywords || ''}
              onChange={(e) => handleUpdate('keywords', e.target.value)}
              className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Author Tag</label>
            <input
              type="text"
              value={seo.author || ''}
              onChange={(e) => handleUpdate('author', e.target.value)}
              className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary mb-1">Social Share OpenGraph Image URL</label>
            <input
              type="text"
              value={seo.ogImage || ''}
              onChange={(e) => handleUpdate('ogImage', e.target.value)}
              className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Google Analytics Tag (e.g. G-XXXXXXX)</label>
            <input
              type="text"
              placeholder="G-..."
              value={seo.googleAnalyticsId || ''}
              onChange={(e) => handleUpdate('googleAnalyticsId', e.target.value)}
              className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Twitter / X Handle</label>
            <input
              type="text"
              placeholder="@rohitverma"
              value={seo.twitterHandle || ''}
              onChange={(e) => handleUpdate('twitterHandle', e.target.value)}
              className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
