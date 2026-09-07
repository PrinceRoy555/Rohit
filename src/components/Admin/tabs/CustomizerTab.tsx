import React, { useState } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { ThemeConfig, BrandingConfig, ThemeBorderRadius } from '../../../types/cms';
import ThemeToggle from '../../ThemeToggle';
import { PageHeader } from '../layout/PageHeader';
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
      fontHeading: 'Manrope',
      fontBody: 'Manrope',
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
      fontHeading: 'Manrope',
      fontBody: 'Manrope',
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
      fontHeading: 'Manrope',
      fontBody: 'Manrope',
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

const HEADING_FONTS = ['Manrope', 'Plus Jakarta Sans', 'Syne', 'Outfit', 'Space Grotesk'];
const BODY_FONTS = ['Manrope', 'Plus Jakarta Sans', 'Inter', 'Space Grotesk'];
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Website Customizer & Theme"
        description="Instantly preview and customize color schemes, typography, and personal brand identities."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center" title="Toggle Light / Dark Theme">
              <ThemeToggle id="admin-customizer-theme-toggle" />
            </div>

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
          </div>
        }
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 p-1.5 bg-bg-card border border-border-color rounded-xl sm:rounded-2xl shadow-xs">
        {[
          { id: 'presets', label: 'Presets', icon: Sparkles },
          { id: 'colors', label: 'Palette', icon: Sliders },
          { id: 'typography', label: 'Typography', icon: Type },
          { id: 'branding', label: 'Branding', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubSection(tab.id as any)}
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

      {/* SUB-SECTION 1: PRESETS */}
      {activeSubSection === 'presets' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {PRESET_PALETTES.map((preset, idx) => {
              const isSelected = currentTheme.presetName === preset.theme.presetName;
              return (
                <div
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden group shadow-xs active:scale-99 ${
                    isSelected
                      ? 'bg-bg-card border-rose-500 ring-2 ring-rose-500/30 shadow-sm'
                      : 'bg-bg-card border-border-color hover:border-border-hover hover:bg-bg-card-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-xs sm:text-sm font-bold text-text-primary group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Swatches preview */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-3 p-2.5 sm:p-3 rounded-xl bg-bg-secondary border border-border-color">
                    <div
                      className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg shadow-inner border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: preset.theme.primaryAccent }}
                      title="Primary Accent"
                    />
                    <div
                      className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg shadow-inner border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: preset.theme.secondaryAccent }}
                      title="Secondary Accent"
                    />
                    <div
                      className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg shadow-inner border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: preset.theme.bgPrimary }}
                      title="Background"
                    />
                    <div
                      className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg shadow-inner border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: preset.theme.bgCard }}
                      title="Card Background"
                    />
                    <span className="text-[11px] sm:text-xs text-text-muted ml-auto font-mono">
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
        <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary">Custom Color Tuning</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Changes update the live preview instantly via dynamic CSS variables.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Primary Accent Color</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentTheme.primaryAccent || '#A50C18'}
                  onChange={(e) => handleColorChange('primaryAccent', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-color flex-shrink-0"
                />
                <input
                  type="text"
                  value={currentTheme.primaryAccent || ''}
                  onChange={(e) => handleColorChange('primaryAccent', e.target.value)}
                  className="flex-1 min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary font-mono focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Secondary Accent / Hover</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentTheme.secondaryAccent || '#D31322'}
                  onChange={(e) => handleColorChange('secondaryAccent', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-color flex-shrink-0"
                />
                <input
                  type="text"
                  value={currentTheme.secondaryAccent || ''}
                  onChange={(e) => handleColorChange('secondaryAccent', e.target.value)}
                  className="flex-1 min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary font-mono focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Dark Accent (Shadow / Gradient)</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentTheme.accentDark || '#35070B'}
                  onChange={(e) => handleColorChange('accentDark', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-color flex-shrink-0"
                />
                <input
                  type="text"
                  value={currentTheme.accentDark || ''}
                  onChange={(e) => handleColorChange('accentDark', e.target.value)}
                  className="flex-1 min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary font-mono focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Canvas / Body Background</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentTheme.bgPrimary || '#F8F5F2'}
                  onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-color flex-shrink-0"
                />
                <input
                  type="text"
                  value={currentTheme.bgPrimary || ''}
                  onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                  className="flex-1 min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary font-mono focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Card & Container Background</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentTheme.bgCard || '#FFFFFF'}
                  onChange={(e) => handleColorChange('bgCard', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-color flex-shrink-0"
                />
                <input
                  type="text"
                  value={currentTheme.bgCard || ''}
                  onChange={(e) => handleColorChange('bgCard', e.target.value)}
                  className="flex-1 min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary font-mono focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Text Primary Color</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={currentTheme.textPrimary || '#1A090A'}
                  onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-color flex-shrink-0"
                />
                <input
                  type="text"
                  value={currentTheme.textPrimary || ''}
                  onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                  className="flex-1 min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary font-mono focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: TYPOGRAPHY & RADIUS */}
      {activeSubSection === 'typography' && (
        <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Display & Heading Font</label>
              <select
                value={currentTheme.fontHeading || 'Manrope'}
                onChange={(e) => handleColorChange('fontHeading', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              >
                {HEADING_FONTS.map((font) => (
                  <option key={font} value={font} className="bg-bg-card text-text-primary">
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-muted mt-1">Applied to main section titles, hero headings, and cards.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Body & Paragraph Font</label>
              <select
                value={currentTheme.fontBody || 'Manrope'}
                onChange={(e) => handleColorChange('fontBody', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              >
                {BODY_FONTS.map((font) => (
                  <option key={font} value={font} className="bg-bg-card text-text-primary">
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-muted mt-1">Applied to navigation, body copy, and form inputs.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">Card & Button Corner Style (Border Radius)</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {BORDER_RADII.map((r) => {
                const isSelected = (currentTheme.borderRadius || 'full') === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => handleColorChange('borderRadius', r.value)}
                    className={`min-h-[40px] p-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-bg-secondary text-text-muted border-border-color hover:text-text-primary hover:border-border-hover'
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
        <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xs">
          <h3 className="text-sm sm:text-base font-bold text-text-primary mb-1">Personal & Agency Branding</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Display Name / Site Name</label>
              <input
                type="text"
                value={currentBranding.siteName || ''}
                onChange={(e) => handleBrandingChange('siteName', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Tagline / Professional Title</label>
              <input
                type="text"
                value={currentBranding.tagline || ''}
                onChange={(e) => handleBrandingChange('tagline', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1">Short Bio</label>
              <textarea
                rows={3}
                value={currentBranding.bio || ''}
                onChange={(e) => handleBrandingChange('bio', e.target.value)}
                className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-sm text-text-primary focus:border-rose-500 focus:outline-none resize-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Contact Email</label>
              <input
                type="email"
                value={currentBranding.email || ''}
                onChange={(e) => handleBrandingChange('email', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Contact Phone</label>
              <input
                type="text"
                value={currentBranding.phone || ''}
                onChange={(e) => handleBrandingChange('phone', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Location</label>
              <input
                type="text"
                value={currentBranding.location || ''}
                onChange={(e) => handleBrandingChange('location', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Avatar / Portrait URL</label>
              <input
                type="text"
                value={currentBranding.avatarImage || ''}
                onChange={(e) => handleBrandingChange('avatarImage', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">WhatsApp Direct Link</label>
              <input
                type="text"
                value={currentBranding.whatsappUrl || ''}
                onChange={(e) => handleBrandingChange('whatsappUrl', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Resume PDF URL</label>
              <input
                type="text"
                value={currentBranding.resumeUrl || ''}
                onChange={(e) => handleBrandingChange('resumeUrl', e.target.value)}
                className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2 md:col-span-2">
              <input
                type="checkbox"
                id="availableForWork"
                checked={currentBranding.availableForWork}
                onChange={(e) => handleBrandingChange('availableForWork', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded bg-bg-secondary border-border-color focus:ring-rose-500"
              />
              <label htmlFor="availableForWork" className="text-xs sm:text-sm font-semibold text-text-primary cursor-pointer">
                Available for New Projects & Freelance Work (Green Status Badge)
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
