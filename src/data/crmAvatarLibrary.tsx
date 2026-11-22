import React from 'react';
import { AvatarLibraryItem, AvatarBackgroundPreset } from '../types/crmProfile';

export const AVATAR_BACKGROUND_PRESETS: AvatarBackgroundPreset[] = [
  { id: 'royal-purple', name: 'Royal Velvet', value: '#6d28d9' },
  { id: 'deep-navy', name: 'Midnight Navy', value: '#0c0828' },
  { id: 'indigo-dream', name: 'Deep Indigo', value: '#4338ca' },
  { id: 'emerald-crest', name: 'Emerald Crest', value: '#059669' },
  { id: 'electric-cyan', name: 'Electric Cyan', value: '#0891b2' },
  { id: 'crimson-blaze', name: 'Crimson Blaze', value: '#e11d48' },
  { id: 'amber-sunset', name: 'Amber Sunset', value: '#d97706' },
  { id: 'fuchsia-neon', name: 'Fuchsia Pop', value: '#c026d3' },
  { id: 'slate-midnight', name: 'Slate Midnight', value: '#1e293b' },
  { id: 'cosmic-gradient', name: 'Cosmic Gradient', value: 'linear-gradient(135deg, #6d28d9 0%, #3b82f6 100%)', isGradient: true },
  { id: 'sunset-gradient', name: 'Sunset Gradient', value: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)', isGradient: true },
  { id: 'aurora-gradient', name: 'Aurora Gradient', value: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)', isGradient: true }
];

export const AVATAR_LIBRARY_CATALOG: AvatarLibraryItem[] = [
  // 1. ANIME & MANGA (6)
  {
    id: 'anime-shinobi',
    name: 'Shadow Shinobi',
    category: 'Anime',
    description: 'Cyber ninja with dark violet cowl and glowing violet optics.',
    tags: ['ninja', 'stealth', 'purple', 'cyber']
  },
  {
    id: 'anime-astral-mage',
    name: 'Astral Mage',
    category: 'Anime',
    description: 'Celestial wizard with starlight crown and lavender aura.',
    tags: ['magic', 'cosmic', 'stars', 'fantasy']
  },
  {
    id: 'anime-cosmic-ronin',
    name: 'Cosmic Ronin',
    category: 'Anime',
    description: 'Samurai with holographic eyepatch and high cyber collar.',
    tags: ['samurai', 'cyberpunk', 'sword', 'neon']
  },
  {
    id: 'anime-lofi-scholar',
    name: 'Lo-Fi Scholar',
    category: 'Anime',
    description: 'Creative thinker with oversized studio monitors and spectacles.',
    tags: ['lofi', 'chill', 'headphones', 'student']
  },
  {
    id: 'anime-solar-hero',
    name: 'Solar Champion',
    category: 'Anime',
    description: 'Anime protagonist with spiked golden hair and red scarf.',
    tags: ['hero', 'gold', 'brave', 'anime']
  },
  {
    id: 'anime-valkyrie',
    name: 'Cyber Valkyrie',
    category: 'Anime',
    description: 'Sleek silver hair with glowing cyan tactical visor.',
    tags: ['valkyrie', 'silver', 'visor', 'scifi']
  },

  // 2. 3D TECH & GAMING (6)
  {
    id: 'tech-vr-pioneer',
    name: 'VR Pioneer',
    category: '3D Tech',
    description: 'Spatial metaverse explorer with glowing purple lens visor.',
    tags: ['vr', 'metaverse', 'gaming', 'future']
  },
  {
    id: 'tech-neon-bot',
    name: 'Neon Bot 3000',
    category: '3D Tech',
    description: 'Friendly 3D robot companion with curved OLED smile.',
    tags: ['robot', 'cute', 'ai', 'tech']
  },
  {
    id: 'tech-pixel-paladin',
    name: 'Pixel Paladin',
    category: '3D Tech',
    description: '3D voxel commander with neon armor plates and crest.',
    tags: ['voxel', 'knight', 'gold', 'retro']
  },
  {
    id: 'tech-mecha-pilot',
    name: 'Mecha Pilot',
    category: '3D Tech',
    description: 'Tactical helmet with green HUD readout display.',
    tags: ['mecha', 'pilot', 'hud', 'scifi']
  },
  {
    id: 'tech-quantum-cube',
    name: 'Quantum Entity',
    category: '3D Tech',
    description: 'Abstract 3D faceted geometry with neon pulse ring.',
    tags: ['abstract', 'geometry', 'crypto', 'quantum']
  },
  {
    id: 'tech-cyber-synth',
    name: 'Retro Synthwave',
    category: '3D Tech',
    description: '80s arcade hero with glowing neon shutter glasses.',
    tags: ['synthwave', '80s', 'neon', 'arcade']
  },

  // 3. CARTOON & CREATIVE ANIMALS (6)
  {
    id: 'cartoon-golden-shiba',
    name: 'Gamer Shiba',
    category: 'Cartoon',
    description: 'Joyful Shiba Inu dog with gaming headset and bandanna.',
    tags: ['dog', 'shiba', 'gamer', 'pet']
  },
  {
    id: 'cartoon-cyber-kitty',
    name: 'Cyber Kitty',
    category: 'Cartoon',
    description: 'Sleek dark feline with emerald eyes and gold bell.',
    tags: ['cat', 'kitty', 'stealth', 'cute']
  },
  {
    id: 'cartoon-wizard-owl',
    name: 'Professor Owl',
    category: 'Cartoon',
    description: 'Wise owl with tiny wizard hat and golden monocle.',
    tags: ['owl', 'wise', 'wizard', 'smart']
  },
  {
    id: 'cartoon-laser-panda',
    name: 'Laser Panda',
    category: 'Cartoon',
    description: 'Chill bamboo panda with futuristic visor and purple hoodie.',
    tags: ['panda', 'chill', 'hoodie', 'bear']
  },
  {
    id: 'cartoon-space-fox',
    name: 'Cosmo Fox',
    category: 'Cartoon',
    description: 'Orange fox in a miniature glass astronaut helmet.',
    tags: ['fox', 'space', 'astronaut', 'cute']
  },
  {
    id: 'cartoon-boba-bear',
    name: 'Boba Bear',
    category: 'Cartoon',
    description: 'Cozy brown bear with beanie sipping tapioca milk tea.',
    tags: ['bear', 'boba', 'cozy', 'winter']
  },

  // 4. ILLUSTRATED AGENCY & MODERN (6)
  {
    id: 'illust-creative-director',
    name: 'Creative Director',
    category: 'Illustrated',
    description: 'Agency lead with designer spectacles and neat beard silhouette.',
    tags: ['agency', 'director', 'glasses', 'executive']
  },
  {
    id: 'illust-brand-architect',
    name: 'Brand Architect',
    category: 'Illustrated',
    description: 'Geometric face silhouette with vibrant gradient hair splash.',
    tags: ['design', 'architect', 'gradient', 'modern']
  },
  {
    id: 'illust-code-alchemist',
    name: 'Code Alchemist',
    category: 'Illustrated',
    description: 'Full-stack developer with dark hoodie and green terminal eyes.',
    tags: ['developer', 'code', 'terminal', 'hoodie']
  },
  {
    id: 'illust-sound-sculptor',
    name: 'Sound Sculptor',
    category: 'Illustrated',
    description: 'Music & audio creator with studio headphones and sound wave bar.',
    tags: ['audio', 'sound', 'music', 'producer']
  },
  {
    id: 'illust-vector-artisan',
    name: 'Vector Artisan',
    category: 'Illustrated',
    description: 'Illustrator with French beret and glowing digital stylus.',
    tags: ['artist', 'vector', 'drawing', 'stylus']
  },
  {
    id: 'illust-hyper-synth',
    name: 'Vaporwave Muse',
    category: 'Illustrated',
    description: 'Surrealist pastel character with neon halo ring.',
    tags: ['vaporwave', 'pastel', 'halo', 'creative']
  }
];

/**
 * High-definition vector SVG render engine for all 24 avatars.
 * Original custom artwork that scales smoothly from 24px to 512px.
 */
export const renderAvatarSvg = (avatarId: string): React.ReactNode => {
  switch (avatarId) {
    // ------------------------------------------------------------------
    // 1. Anime & Manga
    // ------------------------------------------------------------------
    case 'anime-shinobi':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="shinobi_mask" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="shinobi_band" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          {/* Hood / Cowl */}
          <path d="M22 88 C20 40, 28 20, 50 18 C72 20, 80 40, 78 88 Z" fill="url(#shinobi_mask)" />
          {/* Headband */}
          <rect x="26" y="36" width="48" height="12" rx="4" fill="url(#shinobi_band)" />
          {/* Ninja Metal Plate */}
          <rect x="42" y="38" width="16" height="8" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="50" cy="42" r="2" fill="#6d28d9" />
          {/* Eyes Slot */}
          <rect x="30" y="50" width="40" height="13" rx="3" fill="#090d16" />
          {/* Glowing Eyes */}
          <ellipse cx="39" cy="56" rx="4" ry="2.5" fill="#c084fc" />
          <circle cx="39" cy="56" r="1.5" fill="#ffffff" />
          <ellipse cx="61" cy="56" rx="4" ry="2.5" fill="#c084fc" />
          <circle cx="61" cy="56" r="1.5" fill="#ffffff" />
          {/* Mask Crease */}
          <path d="M36 74 Q50 82 64 74" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'anime-astral-mage':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="mage_hair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e9d5ff" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="mage_skin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          {/* Back Hair */}
          <path d="M20 90 C15 50, 25 30, 50 25 C75 30, 85 50, 80 90 Z" fill="url(#mage_hair)" />
          {/* Face */}
          <circle cx="50" cy="54" r="24" fill="url(#mage_skin)" />
          {/* Front Bangs */}
          <path d="M28 42 Q38 48 50 44 Q62 48 72 42 Q68 62 50 56 Q32 62 28 42 Z" fill="#c084fc" />
          {/* Eyes */}
          <ellipse cx="40" cy="56" rx="3.5" ry="5" fill="#4c1d95" />
          <circle cx="41" cy="54" r="1.5" fill="#ffffff" />
          <ellipse cx="60" cy="56" rx="3.5" ry="5" fill="#4c1d95" />
          <circle cx="61" cy="54" r="1.5" fill="#ffffff" />
          {/* Smile */}
          <path d="M46 68 Q50 71 54 68" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
          {/* Star Tiara */}
          <polygon points="50,18 53,26 61,27 55,33 57,41 50,37 43,41 45,33 39,27 47,26" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
        </svg>
      );

    case 'anime-cosmic-ronin':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="ronin_hair" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>
          {/* High Collar */}
          <path d="M25 90 L32 66 L68 66 L75 90 Z" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
          {/* Face */}
          <polygon points="34,42 66,42 58,74 42,74" fill="#fed7aa" />
          {/* Spiky Anime Hair */}
          <path d="M22 44 L28 26 L38 34 L50 16 L62 34 L72 26 L78 44 L68 40 L50 36 L32 40 Z" fill="url(#ronin_hair)" />
          {/* Cyber Eyepatch */}
          <polygon points="35,48 48,48 45,60 33,58" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="40" cy="54" r="2.5" fill="#38bdf8" />
          {/* Normal Right Eye */}
          <ellipse cx="60" cy="54" rx="3.5" ry="4" fill="#0f172a" />
          <circle cx="61" cy="52" r="1.5" fill="#ffffff" />
          {/* Mouth */}
          <line x1="46" y1="68" x2="54" y2="67" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'anime-lofi-scholar':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="lofi_hair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#78716c" />
              <stop offset="100%" stopColor="#44403c" />
            </linearGradient>
          </defs>
          {/* Sweater */}
          <path d="M26 90 C26 75, 74 75, 74 90 Z" fill="#6d28d9" />
          {/* Face */}
          <circle cx="50" cy="52" r="22" fill="#fed7aa" />
          {/* Hair */}
          <path d="M30 42 C32 26, 68 26, 70 42 Q50 36 30 42 Z" fill="url(#lofi_hair)" />
          {/* Round Glasses */}
          <circle cx="41" cy="52" r="7" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <circle cx="59" cy="52" r="7" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <line x1="48" y1="52" x2="52" y2="52" stroke="#fbbf24" strokeWidth="2" />
          {/* Eyes */}
          <ellipse cx="41" cy="52" rx="2.5" ry="2" fill="#292524" />
          <ellipse cx="59" cy="52" rx="2.5" ry="2" fill="#292524" />
          {/* Headphones */}
          <path d="M22 52 C22 28, 78 28, 78 52" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" fill="none" />
          <rect x="18" y="46" width="8" height="15" rx="3" fill="#fb7185" />
          <rect x="74" y="46" width="8" height="15" rx="3" fill="#fb7185" />
        </svg>
      );

    case 'anime-solar-hero':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="solar_hair" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>
          {/* Scarf */}
          <path d="M28 88 L50 72 L72 88 L50 82 Z" fill="#dc2626" />
          {/* Face */}
          <circle cx="50" cy="54" r="22" fill="#fde68a" />
          {/* Big Anime Eyes */}
          <ellipse cx="40" cy="54" rx="4" ry="5.5" fill="#0284c7" />
          <circle cx="41" cy="52" r="2" fill="#ffffff" />
          <ellipse cx="60" cy="54" rx="4" ry="5.5" fill="#0284c7" />
          <circle cx="61" cy="52" r="2" fill="#ffffff" />
          {/* Smile */}
          <path d="M44 66 Q50 72 56 66" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
          {/* Spiky Sun Hair */}
          <path d="M20 46 L26 22 L38 32 L50 14 L62 32 L74 22 L80 46 Q50 36 20 46 Z" fill="url(#solar_hair)" stroke="#ca8a04" strokeWidth="1" />
        </svg>
      );

    case 'anime-valkyrie':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="valk_hair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
          {/* Hair Bob */}
          <path d="M24 88 C20 40, 26 24, 50 20 C74 24, 80 40, 76 88 L68 56 Q50 50 32 56 Z" fill="url(#valk_hair)" />
          {/* Face */}
          <circle cx="50" cy="54" r="21" fill="#fef08a" />
          {/* Glowing Cyan Visor */}
          <rect x="30" y="48" width="40" height="10" rx="4" fill="#06b6d4" opacity="0.9" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="34" y1="53" x2="66" y2="53" stroke="#e0f2fe" strokeWidth="1.5" />
          {/* Winged Earpieces */}
          <polygon points="18,48 28,42 26,56" fill="#38bdf8" />
          <polygon points="82,48 72,42 74,56" fill="#38bdf8" />
          {/* Lips */}
          <path d="M47 68 Q50 70 53 68" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // ------------------------------------------------------------------
    // 2. 3D Tech & Gaming
    // ------------------------------------------------------------------
    case 'tech-vr-pioneer':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="vr_vis" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {/* Head & Neck */}
          <rect x="42" y="72" width="16" height="18" fill="#475569" />
          <ellipse cx="50" cy="50" rx="28" ry="30" fill="#334155" />
          {/* VR Goggles Box */}
          <rect x="20" y="38" width="60" height="26" rx="8" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
          {/* Glass Visor with Glow */}
          <rect x="24" y="42" width="52" height="18" rx="6" fill="url(#vr_vis)" />
          <line x1="28" y1="46" x2="48" y2="46" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" strokeLinecap="round" />
          {/* Headstrap */}
          <line x1="20" y1="51" x2="10" y2="51" stroke="#64748b" strokeWidth="4" />
          <line x1="80" y1="51" x2="90" y2="51" stroke="#64748b" strokeWidth="4" />
          {/* Status LED */}
          <circle cx="70" cy="46" r="2" fill="#22c55e" />
        </svg>
      );

    case 'tech-neon-bot':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="bot_body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          {/* Antenna */}
          <line x1="50" y1="24" x2="50" y2="12" stroke="#64748b" strokeWidth="3" />
          <circle cx="50" cy="11" r="5" fill="#f43f5e" />
          {/* Robot Head */}
          <rect x="22" y="24" width="56" height="50" rx="14" fill="url(#bot_body)" stroke="#0369a1" strokeWidth="2" />
          {/* OLED Screen */}
          <rect x="30" y="34" width="40" height="30" rx="8" fill="#090d16" />
          {/* Glowing Eyes */}
          <circle cx="41" cy="47" r="4" fill="#4ade80" />
          <circle cx="59" cy="47" r="4" fill="#4ade80" />
          {/* Pixel Smile */}
          <path d="M43 56 Q50 61 57 56" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          {/* Bolt Ears */}
          <rect x="16" y="44" width="6" height="12" rx="2" fill="#94a3b8" />
          <rect x="78" y="44" width="6" height="12" rx="2" fill="#94a3b8" />
        </svg>
      );

    case 'tech-pixel-paladin':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Voxel Knight Helmet */}
          <rect x="24" y="24" width="52" height="52" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
          {/* Golden Crest */}
          <polygon points="50,10 58,24 42,24" fill="#f59e0b" />
          {/* T-Visor Slot */}
          <path d="M30 46 H70 V54 H55 V66 H45 V54 H30 Z" fill="#38bdf8" />
          {/* Armor Collar */}
          <path d="M20 78 L50 88 L80 78 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        </svg>
      );

    case 'tech-mecha-pilot':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="mecha_vis" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          {/* Outer Shell */}
          <polygon points="50,16 78,32 74,76 50,90 26,76 22,32" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
          {/* Hex Visor */}
          <polygon points="50,34 70,44 66,62 50,70 34,62 30,44" fill="url(#mecha_vis)" />
          {/* HUD Line */}
          <line x1="38" y1="52" x2="62" y2="52" stroke="#a7f3d0" strokeWidth="1.5" />
          <circle cx="50" cy="52" r="3" stroke="#a7f3d0" strokeWidth="1" fill="none" />
        </svg>
      );

    case 'tech-quantum-cube':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Isometric Quantum Box Entity */}
          <polygon points="50,18 80,35 50,52 20,35" fill="#8b5cf6" />
          <polygon points="20,35 50,52 50,84 20,67" fill="#6d28d9" />
          <polygon points="50,52 80,35 80,67 50,84" fill="#4c1d95" />
          {/* Glowing Core Orbit */}
          <circle cx="50" cy="51" r="9" fill="#38bdf8" opacity="0.9" />
          <circle cx="50" cy="51" r="5" fill="#ffffff" />
        </svg>
      );

    case 'tech-cyber-synth':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="synth_hair" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          {/* Face */}
          <rect x="28" y="38" width="44" height="42" rx="10" fill="#fecdd3" />
          {/* Big Neon Shades */}
          <polygon points="22,46 78,46 72,64 28,64" fill="#0f172a" stroke="#ec4899" strokeWidth="2" />
          <line x1="28" y1="52" x2="72" y2="52" stroke="#38bdf8" strokeWidth="2" />
          <line x1="30" y1="58" x2="70" y2="58" stroke="#38bdf8" strokeWidth="2" />
          {/* Synth Hair */}
          <path d="M22 38 C24 16, 76 16, 78 38 L68 34 Q50 28 32 34 Z" fill="url(#synth_hair)" />
          {/* Smile */}
          <path d="M44 72 Q50 76 56 72" stroke="#be185d" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // ------------------------------------------------------------------
    // 3. Cartoon & Creative Animals
    // ------------------------------------------------------------------
    case 'cartoon-golden-shiba':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Ears */}
          <polygon points="24,44 26,18 46,34" fill="#d97706" />
          <polygon points="28,40 30,24 42,34" fill="#fde68a" />
          <polygon points="76,44 74,18 54,34" fill="#d97706" />
          <polygon points="72,40 70,24 58,34" fill="#fde68a" />
          {/* Head */}
          <circle cx="50" cy="55" r="28" fill="#f59e0b" />
          {/* White Cheeks */}
          <ellipse cx="50" cy="62" rx="18" ry="14" fill="#fffbeb" />
          {/* Eyes */}
          <circle cx="41" cy="52" r="3.5" fill="#1c1917" />
          <circle cx="42" cy="51" r="1.2" fill="#ffffff" />
          <circle cx="59" cy="52" r="3.5" fill="#1c1917" />
          <circle cx="60" cy="51" r="1.2" fill="#ffffff" />
          {/* Cute Nose & Mouth */}
          <polygon points="50,58 47,55 53,55" fill="#1c1917" />
          <path d="M46 63 Q50 67 54 63" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Gamer Headband */}
          <path d="M26 42 C26 24, 74 24, 74 42" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="24" cy="44" r="5" fill="#7c3aed" />
          <circle cx="76" cy="44" r="5" fill="#7c3aed" />
        </svg>
      );

    case 'cartoon-cyber-kitty':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Cat Ears */}
          <polygon points="24,45 28,16 48,35" fill="#0f172a" />
          <polygon points="28,40 31,23 44,35" fill="#ec4899" />
          <polygon points="76,45 72,16 52,35" fill="#0f172a" />
          <polygon points="72,40 69,23 56,35" fill="#ec4899" />
          {/* Cat Face */}
          <circle cx="50" cy="56" r="26" fill="#1e293b" />
          {/* Glowing Turquoise Eyes */}
          <ellipse cx="40" cy="54" rx="5" ry="6.5" fill="#06b6d4" />
          <ellipse cx="40" cy="54" rx="1.5" ry="5.5" fill="#082f49" />
          <circle cx="42" cy="51" r="1.5" fill="#ffffff" />
          <ellipse cx="60" cy="54" rx="5" ry="6.5" fill="#06b6d4" />
          <ellipse cx="60" cy="54" rx="1.5" ry="5.5" fill="#082f49" />
          <circle cx="62" cy="51" r="1.5" fill="#ffffff" />
          {/* Nose & Whiskers */}
          <polygon points="50,62 48,60 52,60" fill="#f43f5e" />
          <line x1="28" y1="62" x2="16" y2="59" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="28" y1="65" x2="18" y2="67" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="72" y1="62" x2="84" y2="59" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="72" y1="65" x2="82" y2="67" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          {/* Golden Bell Collar */}
          <path d="M36 78 Q50 84 64 78" stroke="#f59e0b" strokeWidth="4" />
          <circle cx="50" cy="83" r="4.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        </svg>
      );

    case 'cartoon-wizard-owl':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Owl Body */}
          <circle cx="50" cy="58" r="26" fill="#78350f" />
          {/* Eye Patches */}
          <circle cx="40" cy="56" r="10" fill="#fef3c7" />
          <circle cx="60" cy="56" r="10" fill="#fef3c7" />
          {/* Eyes */}
          <circle cx="40" cy="56" r="4" fill="#1e293b" />
          <circle cx="41" cy="54" r="1.5" fill="#ffffff" />
          <circle cx="60" cy="56" r="4" fill="#1e293b" />
          <circle cx="61" cy="54" r="1.5" fill="#ffffff" />
          {/* Monocle on right eye */}
          <circle cx="60" cy="56" r="10" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <line x1="68" y1="64" x2="74" y2="78" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Beak */}
          <polygon points="50,61 46,57 54,57" fill="#d97706" />
          {/* Wizard Hat */}
          <polygon points="50,12 30,38 70,38" fill="#4c1d95" />
          <ellipse cx="50" cy="38" rx="24" ry="4" fill="#6d28d9" />
          <circle cx="50" cy="12" r="3" fill="#fbbf24" />
        </svg>
      );

    case 'cartoon-laser-panda':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Ears */}
          <circle cx="28" cy="34" r="9" fill="#0f172a" />
          <circle cx="72" cy="34" r="9" fill="#0f172a" />
          {/* Head */}
          <circle cx="50" cy="54" r="27" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
          {/* Eye Patches */}
          <ellipse cx="38" cy="52" rx="8" ry="6" fill="#0f172a" transform="rotate(-15 38 52)" />
          <ellipse cx="62" cy="52" rx="8" ry="6" fill="#0f172a" transform="rotate(15 62 52)" />
          {/* Eyes */}
          <circle cx="39" cy="52" r="2.5" fill="#ffffff" />
          <circle cx="61" cy="52" r="2.5" fill="#ffffff" />
          {/* Bamboo Green Visor */}
          <rect x="26" y="44" width="48" height="9" rx="3" fill="#10b981" opacity="0.85" />
          {/* Nose */}
          <ellipse cx="50" cy="64" rx="4" ry="3" fill="#0f172a" />
          <path d="M47 68 Q50 71 53 68" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'cartoon-space-fox':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Space Dome Helmet */}
          <circle cx="50" cy="52" r="32" fill="#38bdf8" fillOpacity="0.15" stroke="#7dd3fc" strokeWidth="2.5" />
          {/* Fox Ears */}
          <polygon points="28,45 32,24 48,38" fill="#ea580c" />
          <polygon points="32,41 35,28 44,38" fill="#ffedd5" />
          <polygon points="72,45 68,24 52,38" fill="#ea580c" />
          <polygon points="68,41 65,28 56,38" fill="#ffedd5" />
          {/* Fox Face */}
          <polygon points="30,48 70,48 50,72" fill="#ea580c" />
          <polygon points="36,48 64,48 50,66" fill="#fff7ed" />
          {/* Eyes */}
          <ellipse cx="43" cy="51" rx="3" ry="3.5" fill="#1c1917" />
          <ellipse cx="57" cy="51" rx="3" ry="3.5" fill="#1c1917" />
          {/* Nose */}
          <circle cx="50" cy="70" r="3" fill="#1c1917" />
          {/* Glass Highlight */}
          <path d="M30 32 A 26 26 0 0 1 65 24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        </svg>
      );

    case 'cartoon-boba-bear':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Bear Ears */}
          <circle cx="28" cy="32" r="9" fill="#92400e" />
          <circle cx="28" cy="32" r="5" fill="#fde68a" />
          <circle cx="72" cy="32" r="9" fill="#92400e" />
          <circle cx="72" cy="32" r="5" fill="#fde68a" />
          {/* Yellow Beanie */}
          <path d="M26 40 C26 22, 74 22, 74 40 Z" fill="#eab308" />
          <rect x="22" y="38" width="56" height="8" rx="3" fill="#facc15" />
          <circle cx="50" cy="21" r="4.5" fill="#fef08a" />
          {/* Bear Face */}
          <circle cx="50" cy="56" r="24" fill="#b45309" />
          {/* Snout */}
          <ellipse cx="50" cy="62" rx="12" ry="9" fill="#fef3c7" />
          {/* Eyes */}
          <circle cx="42" cy="52" r="3" fill="#1c1917" />
          <circle cx="58" cy="52" r="3" fill="#1c1917" />
          {/* Nose */}
          <ellipse cx="50" cy="59" rx="3.5" ry="2.5" fill="#1c1917" />
          {/* Straw */}
          <line x1="50" y1="74" x2="60" y2="88" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    // ------------------------------------------------------------------
    // 4. Illustrated Agency & Modern
    // ------------------------------------------------------------------
    case 'illust-creative-director':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Dark Turtleneck */}
          <path d="M26 88 L34 68 L66 68 L74 88 Z" fill="#0f172a" />
          {/* Face */}
          <circle cx="50" cy="50" r="22" fill="#fed7aa" />
          {/* Trimmed Beard */}
          <path d="M38 52 C38 68, 62 68, 62 52 L62 58 C62 70, 38 70, 38 58 Z" fill="#334155" />
          {/* Designer Round Glasses */}
          <circle cx="42" cy="48" r="6.5" stroke="#0f172a" strokeWidth="2.5" fill="none" />
          <circle cx="58" cy="48" r="6.5" stroke="#0f172a" strokeWidth="2.5" fill="none" />
          <line x1="48.5" y1="48" x2="51.5" y2="48" stroke="#0f172a" strokeWidth="2.5" />
          {/* Eyes */}
          <circle cx="42" cy="48" r="2" fill="#1e293b" />
          <circle cx="58" cy="48" r="2" fill="#1e293b" />
          {/* Sleek Hair */}
          <path d="M30 38 C32 20, 68 20, 70 38 Q50 30 30 38 Z" fill="#1e293b" />
        </svg>
      );

    case 'illust-brand-architect':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="brand_grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          {/* Geometric Face */}
          <polygon points="50,24 74,48 50,76 26,48" fill="#fde68a" />
          {/* Abstract Gradient Hair */}
          <path d="M26 48 C20 18, 70 12, 74 48 L62 34 Q50 24 38 34 Z" fill="url(#brand_grad)" />
          {/* Minimalist Eyes */}
          <rect x="36" y="46" width="8" height="3" rx="1.5" fill="#0f172a" />
          <rect x="56" y="46" width="8" height="3" rx="1.5" fill="#0f172a" />
          {/* Mouth */}
          <line x1="46" y1="60" x2="54" y2="60" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'illust-code-alchemist':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Indigo Hoodie */}
          <path d="M20 88 C18 42, 28 22, 50 20 C72 22, 82 42, 80 88 Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
          {/* Face in Shadow */}
          <ellipse cx="50" cy="56" rx="20" ry="24" fill="#090d16" />
          {/* Neon Code Eyes */}
          <text x="36" y="58" fill="#4ade80" fontSize="13" fontWeight="900" fontFamily="monospace">&#123;</text>
          <text x="56" y="58" fill="#4ade80" fontSize="13" fontWeight="900" fontFamily="monospace">&#125;</text>
          {/* Binary Spark */}
          <circle cx="50" cy="68" r="1.5" fill="#38bdf8" />
        </svg>
      );

    case 'illust-sound-sculptor':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Face */}
          <circle cx="50" cy="52" r="22" fill="#fed7aa" />
          {/* Headphones */}
          <path d="M22 52 C22 26, 78 26, 78 52" stroke="#64748b" strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="18" y="44" width="9" height="17" rx="4" fill="#0284c7" />
          <rect x="73" y="44" width="9" height="17" rx="4" fill="#0284c7" />
          {/* Eyes Closed Enjoying Music */}
          <path d="M38 52 Q42 56 46 52" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <path d="M54 52 Q58 56 62 52" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          {/* Equalizer Bars on Cheek */}
          <rect x="36" y="62" width="2" height="6" fill="#06b6d4" />
          <rect x="40" y="60" width="2" height="8" fill="#06b6d4" />
          <rect x="44" y="63" width="2" height="5" fill="#06b6d4" />
        </svg>
      );

    case 'illust-vector-artisan':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Face */}
          <circle cx="50" cy="54" r="21" fill="#fef08a" />
          {/* French Artist Beret */}
          <ellipse cx="48" cy="34" rx="26" ry="11" fill="#be123c" transform="rotate(-10 48 34)" />
          <circle cx="36" cy="24" r="2.5" fill="#9f1239" />
          {/* Eyes */}
          <circle cx="42" cy="52" r="3" fill="#1e293b" />
          <circle cx="58" cy="52" r="3" fill="#1e293b" />
          {/* Stylus Behind Ear */}
          <line x1="68" y1="36" x2="82" y2="52" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Paint Smudge */}
          <circle cx="38" cy="62" r="2.5" fill="#38bdf8" opacity="0.8" />
        </svg>
      );

    case 'illust-hyper-synth':
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="hyper_skin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          {/* Halo Ring */}
          <ellipse cx="50" cy="22" rx="24" ry="6" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.8" />
          {/* Minimalist Face */}
          <circle cx="50" cy="52" r="23" fill="url(#hyper_skin)" />
          {/* Star Sunglasses */}
          <polygon points="40,46 43,51 49,51 44,55 46,60 40,57 34,60 36,55 31,51 37,51" fill="#ffffff" />
          <polygon points="60,46 63,51 69,51 64,55 66,60 60,57 54,60 56,55 51,51 57,51" fill="#ffffff" />
          {/* Smile */}
          <path d="M46 66 Q50 69 54 66" stroke="#4a044e" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
