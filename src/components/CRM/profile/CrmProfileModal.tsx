import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Trash2,
  Check,
  Shield,
  Palette,
  User,
  Mail,
  Phone,
  FileText,
  CloudCheck,
  RefreshCw,
  Camera,
  Layers
} from 'lucide-react';
import { AdminUserProfile, AvatarCategory, AvatarType } from '../../../types/crmProfile';
import {
  AVATAR_LIBRARY_CATALOG,
  AVATAR_BACKGROUND_PRESETS
} from '../../../data/crmAvatarLibrary';
import {
  getAdminProfile,
  saveAdminProfile,
  uploadCustomProfilePhoto,
  removeCustomProfilePhoto
} from '../../../services/crmProfileService';
import { CrmAvatar } from './CrmAvatar';
import { isStorageAvailable } from '../../../lib/firebase';

interface CrmProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: AdminUserProfile) => void;
}

export const CrmProfileModal: React.FC<CrmProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState<AdminUserProfile>(getAdminProfile());
  const [activeCategory, setActiveCategory] = useState<AvatarCategory | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'initials'>('library');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cloudSynced, setCloudSynced] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const current = getAdminProfile();
      setProfile(current);
      setActiveTab(current.avatarType === 'custom' ? 'upload' : current.avatarType || 'library');
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const storageAvailable = isStorageAvailable();

  const filteredAvatars =
    activeCategory === 'All'
      ? AVATAR_LIBRARY_CATALOG
      : AVATAR_LIBRARY_CATALOG.filter((item) => item.category === activeCategory);

  const handleSelectLibraryAvatar = (avatarId: string) => {
    setProfile((prev) => ({
      ...prev,
      avatarType: 'library',
      avatarId
    }));
    setActiveTab('library');
  };

  const handleSelectBackground = (bgColor: string) => {
    setProfile((prev) => ({
      ...prev,
      backgroundColor: bgColor
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image file must be under 10MB.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const res = await uploadCustomProfilePhoto(file);
    setIsUploading(false);

    if (res.success && res.url) {
      setProfile((prev) => ({
        ...prev,
        avatarType: 'custom',
        customPhotoUrl: res.url
      }));
      setActiveTab('upload');
    } else {
      setErrorMessage(res.error || 'Failed to process image.');
    }
  };

  const handleRemoveCustomPhoto = async () => {
    await removeCustomProfilePhoto();
    setProfile((prev) => ({
      ...prev,
      avatarType: 'library',
      customPhotoUrl: undefined,
      avatarId: prev.avatarId || 'anime-shinobi'
    }));
    setActiveTab('library');
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await saveAdminProfile(profile);
      setIsSaving(false);
      if (res.success) {
        setSaveSuccess(true);
        setCloudSynced(res.cloudSynced);
        if (onProfileUpdated) onProfileUpdated(res.profile);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        setErrorMessage(res.error || 'Failed to save profile changes.');
      }
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err?.message || 'Error saving profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#4338ca] text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                My Profile & Avatar Customizer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize your Discord-style avatar, presence, and executive credentials.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Discord-Inspired Profile Banner & Live Card */}
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-[#0c0828] via-[#1a0f3d] to-[#251052] text-white p-5 sm:p-6 shadow-xl">
            {/* Top decorative gradient sheen */}
            <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
              {/* Live Avatar Preview */}
              <div className="relative shrink-0">
                <CrmAvatar
                  profile={profile}
                  size="xl"
                  showPresence={true}
                  presenceStatus="online"
                  borderStyle="gradient"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#7c3aed] text-white border-2 border-white dark:border-slate-900 shadow-md hover:bg-[#6d28d9] transition-transform active:scale-95 cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profile Details & Badges */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {profile.displayName || profile.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/30">
                    <Shield className="w-3 h-3 text-purple-300" />
                    Super Admin
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>

                <p className="text-xs text-purple-200/80 font-mono truncate max-w-sm sm:max-w-md">
                  {profile.email}
                </p>

                <p className="text-xs text-slate-300 pt-1 line-clamp-2 max-w-lg">
                  {profile.bio || 'Founder & Creative Director at Rohitwork Creative Studios.'}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-[11px] text-purple-200/70">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-purple-300" />
                    Color: <strong className="text-white font-mono">{profile.backgroundColor}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Mode:{' '}
                    <strong className="text-white capitalize">
                      {profile.avatarType === 'custom'
                        ? 'Custom Photo'
                        : profile.avatarType === 'library'
                        ? `Artwork (${profile.avatarId})`
                        : 'Initials Monogram'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('library');
                setProfile((prev) => ({ ...prev, avatarType: 'library' }));
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Avatar Library (24)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setProfile((prev) => ({ ...prev, avatarType: 'custom' }));
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Custom Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('initials');
                setProfile((prev) => ({ ...prev, avatarType: 'initials' }));
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'initials'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Initials Monogram</span>
            </button>
          </div>

          {/* TAB 1: AVATAR LIBRARY (24 Original Characters) */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                {(['All', 'Anime', '3D Tech', 'Cartoon', 'Illustrated'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-purple-600 text-white shadow-xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'All' ? 'All Characters (24)' : cat}
                  </button>
                ))}
              </div>

              {/* Avatars Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-72 overflow-y-auto p-1 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                {filteredAvatars.map((avatar) => {
                  const isSelected =
                    profile.avatarType === 'library' && profile.avatarId === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectLibraryAvatar(avatar.id)}
                      className={`relative flex flex-col items-center p-2.5 rounded-2xl border transition-all cursor-pointer text-center group ${
                        isSelected
                          ? 'border-purple-600 bg-purple-500/10 shadow-md ring-2 ring-purple-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-purple-300 hover:scale-[1.02]'
                      }`}
                      title={`${avatar.name} (${avatar.category}) - ${avatar.description}`}
                    >
                      {/* Avatar preview rendering on currently selected background */}
                      <div className="w-12 h-12 rounded-full overflow-hidden mb-1.5 shadow-xs">
                        <CrmAvatar
                          profile={{
                            ...profile,
                            avatarType: 'library',
                            avatarId: avatar.id
                          }}
                          size="md"
                          borderStyle="none"
                        />
                      </div>

                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                        {avatar.name}
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 truncate w-full">
                        {avatar.category}
                      </span>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM PHOTO UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center">
                {profile.customPhotoUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg">
                      <img
                        src={profile.customPhotoUrl}
                        alt="Current uploaded profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                        <span>{isUploading ? 'Processing...' : 'Replace Photo'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveCustomPhoto}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Upload custom executive photo
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        PNG, JPG, or WebP up to 10MB. Automatically optimized.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6d28d9] hover:bg-[#5b21b6] text-white shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'Processing Image...' : 'Choose Photo File'}</span>
                    </button>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${storageAvailable ? 'bg-emerald-500' : 'bg-indigo-400'}`} />
                  <span>
                    {storageAvailable
                      ? 'Firebase Storage Bucket Active (Encrypted Cloud Persistence)'
                      : 'Client-Side Canvas Compressed Engine Ready (Local & Cloud Sync)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INITIALS MONOGRAM */}
          {activeTab === 'initials' && (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center space-y-3">
              <CrmAvatar
                profile={{ ...profile, avatarType: 'initials' }}
                size="xl"
                showPresence={true}
                borderStyle="gradient"
              />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Classic Initial Monogram
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Displays your executive initials on your chosen background color.
                </p>
              </div>
            </div>
          )}

          {/* AVATAR BACKGROUND COLOR PALETTE */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Avatar Background Theme</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  Custom:
                </span>
                <input
                  type="color"
                  value={profile.backgroundColor.startsWith('#') ? profile.backgroundColor : '#6d28d9'}
                  onChange={(e) => handleSelectBackground(e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white"
                  title="Choose custom color hex"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {AVATAR_BACKGROUND_PRESETS.map((preset) => {
                const isSelected = profile.backgroundColor === preset.value;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectBackground(preset.value)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-500/10 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full shrink-0 shadow-2xs border border-white/20"
                      style={
                        preset.isGradient
                          ? { background: preset.value }
                          : { backgroundColor: preset.value }
                      }
                    />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ADMIN CREDENTIALS & INFORMATION FORM */}
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Admin Profile Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Display Name (CRM Header)
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                    title="Super Admin email is verified via Firebase Authentication"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+91 7732869027"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Executive Bio / Headline
              </label>
              <div className="relative">
                <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={profile.bio || ''}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Founder & Creative Director at Rohitwork Creative Studios"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
                />
              </div>
            </div>
          </form>

          {/* Feedback & Error alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 font-semibold">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile & avatar customizations successfully saved!</span>
              </div>
              {cloudSynced && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  Cloud Synced
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => handleSaveProfile()}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#6d28d9] to-[#4338ca] hover:from-[#5b21b6] hover:to-[#3730a3] text-white shadow-md shadow-purple-600/30 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
