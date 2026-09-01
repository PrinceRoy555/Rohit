import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { ThemeConfig, BrandingConfig, ThemeBorderRadius } from '../../../types/cms';
import {
  Palette,
  Type,
  User,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Globe,
  Sliders,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

const PRESET_PALETTES: { name: string; theme: Partial<ThemeConfig> }[] = [
  {
    name: 'Scarlet Prestige (Default)',
    theme: {
      presetName: 'Scarlet Prestige',
      primaryAccent: '#A50C18',
      secondaryAccent: '#D31322',
      accentDark: '#35070B',
      bgPrimary: '#F8F5F2',
      bgSecondary: '#EFE8E5',
      bgCard: '#FFFFFF',
      bgCardHover: '#F5ECEA',
      textPrimary: '#1A090A',
      textSecondary: 'rgba(26, 9, 10, 0.82)',
      borderColor: 'rgba(26, 9, 10, 0.12)',
      fontHeading: 'Plus Jakarta Sans',
      fontBody: 'Plus Jakarta Sans',
      borderRadius: 'full',
      mode: 'light'
    }
  },
  {
    name: 'Royal Indigo (Agency)',
    theme: {
      presetName: 'Royal Indigo',
      primaryAccent: '#4F46E5',
      secondaryAccent: '#6366F1',
      accentDark: '#1E1B4B',
      bgPrimary: '#0F172A',
      bgSecondary: '#1E293B',
      bgCard: '#1E293B',
      bgCardHover: '#334155',
      textPrimary: '#F8FAFC',
      textSecondary: 'rgba(248, 250, 252, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      fontHeading: 'Syne',
      fontBody: 'Inter',
      borderRadius: 'lg',
      mode: 'dark'
    }
  },
  {
    name: 'Emerald Tech (SaaS)',
    theme: {
      presetName: 'Emerald Tech',
      primaryAccent: '#059669',
      secondaryAccent: '#10B981',
      accentDark: '#064E3B',
      bgPrimary: '#0A0E17',
      bgSecondary: '#111827',
      bgCard: '#131D2E',
      bgCardHover: '#1E293B',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.82)',
      borderColor: 'rgba(16, 185, 129, 0.20)',
      fontHeading: 'Space Grotesk',
      fontBody: 'Inter',
      borderRadius: 'md',
      mode: 'dark'
    }
  },
  {
    name: 'Obsidian Minimalist',
    theme: {
      presetName: 'Obsidian Minimalist',
      primaryAccent: '#18181B',
      secondaryAccent: '#3F3F46',
      accentDark: '#09090B',
      bgPrimary: '#FAFAFA',
      bgSecondary: '#F4F4F5',
      bgCard: '#FFFFFF',
      bgCardHover: '#F4F4F5',
      textPrimary: '#09090B',
      textSecondary: 'rgba(9, 9, 11, 0.80)',
      borderColor: 'rgba(9, 9, 11, 0.14)',
      fontHeading: 'Plus Jakarta Sans',
      fontBody: 'Plus Jakarta Sans',
      borderRadius: 'sm',
      mode: 'light'
    }
  },
  {
    name: 'Sunset Crimson (Luxury Dark)',
    theme: {
      presetName: 'Sunset Crimson',
      primaryAccent: '#E11D48',
      secondaryAccent: '#F43F5E',
      accentDark: '#4C0519',
      bgPrimary: '#0C0A09',
      bgSecondary: '#1C1917',
      bgCard: '#1C1917',
      bgCardHover: '#292524',
      textPrimary: '#FAFAF9',
      textSecondary: 'rgba(250, 250, 249, 0.82)',
      borderColor: 'rgba(225, 29, 72, 0.20)',
      fontHeading: 'Outfit',
      fontBody: 'Plus Jakarta Sans',
      borderRadius: 'full',
      mode: 'dark'
    }
  },
  {
    name: 'Cyber Violet',
    theme: {
      presetName: 'Cyber Violet',
      primaryAccent: '#8B5CF6',
      secondaryAccent: '#A78BFA',
      accentDark: '#2E1065',
      bgPrimary: '#0B0A10',
      bgSecondary: '#14121F',
      bgCard: '#1B172B',
      bgCardHover: '#27223D',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      borderColor: 'rgba(139, 92, 246, 0.25)',
      fontHeading: 'Space Grotesk',
      fontBody: 'Inter',
      borderRadius: 'lg',
      mode: 'dark'
    }
  }
];

const HEADING_FONTS = ['Plus Jakarta Sans', 'Syne', 'Outfit', 'Space Grotesk', 'Manrope'];
const BODY_FONTS = ['Plus Jakarta Sans', 'Inter', 'Manrope', 'Space Grotesk'];
const BORDER_RADII: { label: string; value: ThemeBorderRadius }[] = [
  { label: 'Sharp (0px)', value: 'none' },
  { label: 'Subtle (6px)', value: 'sm' },
  { label: 'Standard (12px)', value: 'md' },
  { label: 'Rounded (20px)', value: 'lg' },
  { label: 'Full Pill (9999px)', value: 'full' }
];

export const CustomizerTab: React.FC = () => {
  const { draftConfig, updateDraft, saveDraft, isSaving } = useSiteConfig();
  const [activeSubSection, setActiveSubSection] = useState<'presets' | 'colors' | 'typography' | 'branding'>('presets');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentTheme = draftConfig.theme;
  const currentBranding = draftConfig.branding;

  const handleApplyPreset = (preset: typeof PRESET_PALETTES[0]) => {
    updateDraft((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...preset.theme
      }
    }));
  };

  const handleColorChange = (key: keyof ThemeConfig, value: string) => {
    updateDraft((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value
      }
    }));
  };

  const handleBrandingChange = (key: keyof BrandingConfig, value: any) => {
    updateDraft((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        [key]: value
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
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-rose-500" />
            <span>Website Customizer & Theme</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Instantly preview and customize color schemes, typography, and personal brand identities.
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
              <span>{isSaving ? 'Saving...' : 'Save Customizer Draft'}</span>
            </>
          )}
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-900/80 border border-white/10 rounded-2xl">
        {[
          { id: 'presets', label: 'Theme Presets', icon: Sparkles },
          { id: 'colors', label: 'Custom Palette', icon: Sliders },
          { id: 'typography', label: 'Typography & Radius', icon: Type },
          { id: 'branding', label: 'Branding & Info', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-SECTION 1: PRESETS */}
      {activeSubSection === 'presets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_PALETTES.map((preset, idx) => {
              const isSelected = currentTheme.presetName === preset.theme.presetName;
              return (
                <div
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-neutral-900 border-rose-500 ring-2 ring-rose-500/30 shadow-xl shadow-rose-500/10'
                      : 'bg-neutral-900/60 border-white/10 hover:border-white/20 hover:bg-neutral-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Swatches preview */}
                  <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-black/40 border border-white/5">
                    <div
                      className="w-7 h-7 rounded-lg shadow-inner border border-white/10"
                      style={{ backgroundColor: preset.theme.primaryAccent }}
                      title="Primary Accent"
                    />
                    <div
                      className="w-7 h-7 rounded-lg shadow-inner border border-white/10"
                      style={{ backgroundColor: preset.theme.secondaryAccent }}
                      title="Secondary Accent"
                    />
                    <div
                      className="w-7 h-7 rounded-lg shadow-inner border border-white/10"
                      style={{ backgroundColor: preset.theme.bgPrimary }}
                      title="Background"
                    />
                    <div
                      className="w-7 h-7 rounded-lg shadow-inner border border-white/10"
                      style={{ backgroundColor: preset.theme.bgCard }}
                      title="Card Background"
                    />
                    <span className="text-xs text-neutral-400 ml-auto font-mono">
                      {preset.theme.mode === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: CUSTOM COLOR PALETTE */}
      {activeSubSection === 'colors' && (
        <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white mb-2">Custom Color Tuning</h3>
          <p className="text-xs text-neutral-400 -mt-4">
            Changes update the live preview instantly via dynamic CSS variables.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Primary Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.primaryAccent || '#A50C18'}
                  onChange={(e) => handleColorChange('primaryAccent', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={currentTheme.primaryAccent || ''}
                  onChange={(e) => handleColorChange('primaryAccent', e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Secondary Accent / Hover</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.secondaryAccent || '#D31322'}
                  onChange={(e) => handleColorChange('secondaryAccent', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={currentTheme.secondaryAccent || ''}
                  onChange={(e) => handleColorChange('secondaryAccent', e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Dark Accent (Shadow / Gradient)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.accentDark || '#35070B'}
                  onChange={(e) => handleColorChange('accentDark', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={currentTheme.accentDark || ''}
                  onChange={(e) => handleColorChange('accentDark', e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Canvas / Body Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.bgPrimary || '#F8F5F2'}
                  onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={currentTheme.bgPrimary || ''}
                  onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Card & Container Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.bgCard || '#FFFFFF'}
                  onChange={(e) => handleColorChange('bgCard', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={currentTheme.bgCard || ''}
                  onChange={(e) => handleColorChange('bgCard', e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Text Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentTheme.textPrimary || '#1A090A'}
                  onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={currentTheme.textPrimary || ''}
                  onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: TYPOGRAPHY & RADIUS */}
      {activeSubSection === 'typography' && (
        <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Display & Heading Font</label>
              <select
                value={currentTheme.fontHeading || 'Plus Jakarta Sans'}
                onChange={(e) => handleColorChange('fontHeading', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
              >
                {HEADING_FONTS.map((font) => (
                  <option key={font} value={font} className="bg-neutral-900 text-white">
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-400 mt-1.5">Applied to main section titles, hero headings, and cards.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Body & Paragraph Font</label>
              <select
                value={currentTheme.fontBody || 'Plus Jakarta Sans'}
                onChange={(e) => handleColorChange('fontBody', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
              >
                {BODY_FONTS.map((font) => (
                  <option key={font} value={font} className="bg-neutral-900 text-white">
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-400 mt-1.5">Applied to navigation, body copy, and form inputs.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-3">Card & Button Corner Style (Border Radius)</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {BORDER_RADII.map((r) => {
                const isSelected = (currentTheme.borderRadius || 'full') === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => handleColorChange('borderRadius', r.value)}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20'
                        : 'bg-black/30 text-neutral-400 border-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: BRANDING & PERSONAL INFO */}
      {activeSubSection === 'branding' && (
        <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white mb-2">Personal & Agency Branding</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Display Name / Site Name</label>
              <input
                type="text"
                value={currentBranding.siteName || ''}
                onChange={(e) => handleBrandingChange('siteName', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Tagline / Professional Title</label>
              <input
                type="text"
                value={currentBranding.tagline || ''}
                onChange={(e) => handleBrandingChange('tagline', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Short Bio</label>
              <textarea
                rows={3}
                value={currentBranding.bio || ''}
                onChange={(e) => handleBrandingChange('bio', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Contact Email</label>
              <input
                type="email"
                value={currentBranding.email || ''}
                onChange={(e) => handleBrandingChange('email', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Contact Phone</label>
              <input
                type="text"
                value={currentBranding.phone || ''}
                onChange={(e) => handleBrandingChange('phone', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Location</label>
              <input
                type="text"
                value={currentBranding.location || ''}
                onChange={(e) => handleBrandingChange('location', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Avatar / Portrait URL</label>
              <input
                type="text"
                value={currentBranding.avatarImage || ''}
                onChange={(e) => handleBrandingChange('avatarImage', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">WhatsApp Direct Link</label>
              <input
                type="text"
                value={currentBranding.whatsappUrl || ''}
                onChange={(e) => handleBrandingChange('whatsappUrl', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">Resume PDF URL</label>
              <input
                type="text"
                value={currentBranding.resumeUrl || ''}
                onChange={(e) => handleBrandingChange('resumeUrl', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="availableForWork"
                checked={currentBranding.availableForWork}
                onChange={(e) => handleBrandingChange('availableForWork', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded bg-black/40 border-white/20 focus:ring-rose-500"
              />
              <label htmlFor="availableForWork" className="text-sm font-semibold text-white cursor-pointer">
                Available for New Projects & Freelance Work (Green Status Badge)
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
