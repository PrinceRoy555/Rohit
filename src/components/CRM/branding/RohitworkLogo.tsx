import React from 'react';

export interface RohitworkLogoIconProps {
  size?: number | string;
  className?: string;
}

/**
 * Approved Rohitwork CRM Stylized "R" Monogram Icon.
 * Pure vector SVG with embedded glowing purple squircle,
 * sharp white dynamic "R", and electric magenta/violet swoosh ribbon.
 */
export const RohitworkLogoIcon: React.FC<RohitworkLogoIconProps> = ({
  size = 38,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Rohitwork Logo"
    >
      <defs>
        {/* Squircle Dark Violet Background */}
        <linearGradient id="rw_logo_bg" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#581c87" />
          <stop offset="35%" stopColor="#3b0764" />
          <stop offset="100%" stopColor="#14072b" />
        </linearGradient>

        {/* Luminous Purple Border */}
        <linearGradient id="rw_logo_border" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="30%" stopColor="#c084fc" />
          <stop offset="70%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>

        {/* Electric Magenta / Violet Dynamic Ribbon */}
        <linearGradient id="rw_logo_swoosh" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="40%" stopColor="#c026d3" />
          <stop offset="80%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>

        {/* Soft Ambient Neon Glow */}
        <filter id="rw_logo_glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#a855f7" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* 1. Squircle Base Container with Outer Glow */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="25"
        fill="url(#rw_logo_bg)"
        stroke="url(#rw_logo_border)"
        strokeWidth="2.5"
        filter="url(#rw_logo_glow)"
      />

      {/* 2. Top Subtle Glass Highlight */}
      <rect x="7" y="7" width="86" height="38" rx="22" fill="#ffffff" opacity="0.07" />

      {/* 3. Top Loop and Upper Horizontal Bar of "R" (Crisp White) */}
      <path
        d="M 23 22 L 59 22 C 73 22, 81 29, 81 41.5 C 81 52, 73 58.5, 58 58.5 L 48 58.5 L 43.5 48.5 L 57 48.5 C 64 48.5, 69 45.5, 69 41 C 69 36, 64 32.5, 57 32.5 L 32 32.5 L 23 22 Z"
        fill="#ffffff"
      />

      {/* 4. Left Diagonal White Stem (Slanted Geometric Angle) */}
      <polygon points="32,32.5 22,60 16,60 23,22" fill="#ffffff" />
      <polygon points="21,62.5 16,77 22,77 27,62.5" fill="#ffffff" />

      {/* 5. Right Diagonal White Leg of "R" */}
      <polygon points="49.5,54.5 61.5,54.5 81.5,79 69.5,79" fill="#ffffff" />

      {/* 6. Dynamic Sweeping Magenta / Violet Wave Ribbon */}
      <path
        d="M 14.5 75.5 C 22 63.5, 34 52.5, 51 51.5 C 57 51.5, 59 54.5, 55 58.5 C 43 60.5, 31 66.5, 21.5 78 Z"
        fill="url(#rw_logo_swoosh)"
      />
    </svg>
  );
};

export interface RohitworkBrandLockupProps {
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

/**
 * Complete Approved Rohitwork CRM Brand Lockup:
 * - Approved stylized "R" icon
 * - Elegant vertical divider
 * - "Rohitwork" bold wordmark
 * - Glowing purple "CRM" capsule badge
 * - "Business Management Portal" subtitle
 */
export const RohitworkBrandLockup: React.FC<RohitworkBrandLockupProps> = ({
  collapsed = false,
  size = 'md',
  className = '',
  onClick
}) => {
  const iconDimensions = size === 'sm' ? 32 : size === 'lg' ? 44 : 38;

  if (collapsed) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
        title="Rohitwork CRM — Business Management Portal"
      >
        <RohitworkLogoIcon size={iconDimensions} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* 1. Stylized "R" Squircle Icon */}
      <RohitworkLogoIcon size={iconDimensions} />

      {/* 2. Vertical Divider */}
      <div
        className="h-6 w-[1px] bg-white/20 dark:bg-purple-900/50 mx-2 shrink-0"
        aria-hidden="true"
      />

      {/* 3. Wordmark & Subtitle */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-black text-[15px] text-white tracking-tight select-none">
            Rohitwork
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] border border-purple-400/40 text-[10px] font-black text-white tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.45)] select-none">
            CRM
          </span>
        </div>
        <span className="text-[9.5px] font-medium text-slate-400 tracking-tight whitespace-nowrap select-none mt-1">
          Business Management Portal
        </span>
      </div>
    </div>
  );
};
