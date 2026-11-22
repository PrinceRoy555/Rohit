import React, { useState } from 'react';
import { AdminUserProfile } from '../../../types/crmProfile';
import { renderAvatarSvg } from '../../../data/crmAvatarLibrary';

export interface CrmAvatarProps {
  profile?: AdminUserProfile;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showPresence?: boolean;
  presenceStatus?: 'online' | 'idle' | 'dnd' | 'offline';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  borderStyle?: 'subtle' | 'gradient' | 'none';
}

const SIZE_CONFIGS = {
  xs: {
    container: 'w-6 h-6 text-[10px]',
    presence: 'w-2 h-2 -bottom-0.5 -right-0.5 border-[1.5px]'
  },
  sm: {
    container: 'w-8 h-8 text-xs',
    presence: 'w-2.5 h-2.5 bottom-0 right-0 border-2'
  },
  md: {
    container: 'w-10 h-10 text-sm',
    presence: 'w-3 h-3 bottom-0 right-0 border-2'
  },
  lg: {
    container: 'w-14 h-14 text-base font-bold',
    presence: 'w-4 h-4 bottom-0 right-0 border-2'
  },
  xl: {
    container: 'w-20 h-20 text-2xl font-black',
    presence: 'w-5 h-5 bottom-0.5 right-0.5 border-[2.5px]'
  },
  '2xl': {
    container: 'w-28 h-28 text-3xl font-black',
    presence: 'w-6 h-6 bottom-1 right-1 border-3'
  }
};

const PRESENCE_COLORS = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-400',
  dnd: 'bg-rose-500',
  offline: 'bg-slate-400'
};

export const CrmAvatar: React.FC<CrmAvatarProps> = ({
  profile,
  size = 'sm',
  showPresence = false,
  presenceStatus = 'online',
  className = '',
  onClick,
  interactive = false,
  borderStyle = 'subtle'
}) => {
  const [imgError, setImgError] = useState(false);

  // Compute initials
  const getInitials = (): string => {
    const name = profile?.displayName || profile?.name || 'Rohit Verma';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.substring(0, 2) || 'RV').toUpperCase();
  };

  const sizeCfg = SIZE_CONFIGS[size] || SIZE_CONFIGS.sm;
  const avatarType = profile?.avatarType || 'library';
  const avatarId = profile?.avatarId || 'anime-shinobi';
  const customPhotoUrl = profile?.customPhotoUrl;
  const bgColor = profile?.backgroundColor || '#6d28d9';

  // Border styling
  let borderClasses = 'border border-slate-200/80 dark:border-slate-700/80 shadow-2xs';
  if (borderStyle === 'gradient') {
    borderClasses = 'ring-2 ring-purple-500/40 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md';
  } else if (borderStyle === 'none') {
    borderClasses = '';
  }

  const renderContent = () => {
    // 1. Custom Uploaded Photo
    if (avatarType === 'custom' && customPhotoUrl && !imgError) {
      return (
        <img
          src={customPhotoUrl}
          alt={profile?.displayName || 'Admin Avatar'}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
        />
      );
    }

    // 2. Vector SVG Library Avatar
    if (avatarType === 'library' && avatarId) {
      const isGradient = bgColor.includes('gradient');
      return (
        <div
          className="w-full h-full rounded-full flex items-center justify-center p-0.5 overflow-hidden select-none"
          style={isGradient ? { background: bgColor } : { backgroundColor: bgColor }}
        >
          {renderAvatarSvg(avatarId)}
        </div>
      );
    }

    // 3. Fallback Initials
    const isGradient = bgColor.includes('gradient');
    return (
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-black text-white tracking-wider select-none"
        style={isGradient ? { background: bgColor } : { backgroundColor: bgColor }}
      >
        {getInitials()}
      </div>
    );
  };

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${sizeCfg.container} ${borderClasses} ${
        interactive ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all' : ''
      } ${className}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
        {renderContent()}
      </div>

      {/* Discord-style Online Status Pip */}
      {showPresence && (
        <span
          className={`absolute rounded-full border-white dark:border-slate-900 ${
            PRESENCE_COLORS[presenceStatus]
          } ${sizeCfg.presence}`}
          title={`Status: ${presenceStatus}`}
        />
      )}
    </div>
  );
};
