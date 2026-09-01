import React from 'react';

// Common Filters and Shared Shading Gradients for Glossy 3D App Icons
export function CommonDefs() {
  return (
    <defs>
      {/* 3D App Icon Drop Shadow */}
      <filter id="app3d-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.32" />
      </filter>

      {/* Symbol Inner Drop Shadow */}
      <filter id="symbol-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
      </filter>

      {/* Glow Filter for AI & Motion tools */}
      <filter id="glow-light" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* 1. Photoshop Blue Gradient */}
      <linearGradient id="ps-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00D2FF" />
        <stop offset="45%" stopColor="#0072FF" />
        <stop offset="100%" stopColor="#002C80" />
      </linearGradient>

      {/* 2. Illustrator Orange/Gold Gradient */}
      <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFC837" />
        <stop offset="50%" stopColor="#FF8008" />
        <stop offset="100%" stopColor="#CC3300" />
      </linearGradient>

      {/* 3. Premiere Pro Purple/Pink Gradient */}
      <linearGradient id="pr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E040FB" />
        <stop offset="50%" stopColor="#7C4DFF" />
        <stop offset="100%" stopColor="#2A085C" />
      </linearGradient>

      {/* 4. After Effects Magenta/Violet Gradient */}
      <linearGradient id="ae-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF4081" />
        <stop offset="50%" stopColor="#9C27B0" />
        <stop offset="100%" stopColor="#311B92" />
      </linearGradient>

      {/* 5. Canva Cyan/Teal Gradient */}
      <linearGradient id="canva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="50%" stopColor="#00B0FF" />
        <stop offset="100%" stopColor="#006064" />
      </linearGradient>

      {/* 6. Figma Blend Gradient */}
      <linearGradient id="figma-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF7262" />
        <stop offset="40%" stopColor="#A259FF" />
        <stop offset="100%" stopColor="#1ABCFE" />
      </linearGradient>

      {/* 7. AI Design Tools Crimson Gradient */}
      <linearGradient id="aitools-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF2A55" />
        <stop offset="50%" stopColor="#C50D1E" />
        <stop offset="100%" stopColor="#4A000D" />
      </linearGradient>

      {/* 8. Google AI Studio / Gemini Purple-Indigo Gradient */}
      <linearGradient id="google-ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A88BFA" />
        <stop offset="50%" stopColor="#8E75B2" />
        <stop offset="100%" stopColor="#3B236E" />
      </linearGradient>

      {/* Gold Accent Gradient */}
      <linearGradient id="gold-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="100%" stopColor="#FF9900" />
      </linearGradient>
    </defs>
  );
}

// Helper Gloss Overlay Component for the 3D Sphere Effect
function GlossyOverlay() {
  return (
    <>
      {/* Curved Glossy Top Sheen */}
      <path
        d="M 6 22 C 6 12, 12 6, 24 6 C 36 6, 42 12, 42 22 C 32 17, 16 17, 6 22 Z"
        fill="white"
        opacity="0.4"
      />
      {/* Top Left Soft Highlight Spot */}
      <ellipse cx="16" cy="14" rx="8" ry="5" fill="white" opacity="0.35" transform="rotate(-20 16 14)" />
      {/* Outer 3D Rim Ring */}
      <circle cx="24" cy="24" r="19" stroke="white" strokeWidth="1" opacity="0.3" fill="none" />
    </>
  );
}

// 1. Adobe Photoshop Glossy 3D Circular App Icon
export function Photoshop3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <CommonDefs />
      {/* 3D Spherical App Badge */}
      <circle cx="24" cy="24" r="20" fill="url(#ps-grad)" filter="url(#app3d-shadow)" />
      <GlossyOverlay />

      {/* Centered 3D "Ps" / Photo Canvas Symbol */}
      <g filter="url(#symbol-shadow)">
        {/* Layer 1 Background Plate */}
        <rect x="13" y="13" width="22" height="22" rx="5" fill="#001845" opacity="0.6" />
        {/* Layer 2 Front Glass Canvas */}
        <rect x="11" y="11" width="22" height="22" rx="5" fill="white" opacity="0.95" />
        {/* Stylized "Ps" Typography / Aperture */}
        <path
          d="M 15 15 C 15 15, 18 15, 19.5 16.5 C 21 18, 20.5 20, 18.5 21 C 16.5 22, 15 21.5 15 24 M 15 15 L 15 27"
          stroke="#0052D4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 23 21 C 23 19, 25 18, 27 19.5 C 28.5 20.5, 27.5 22.5, 25 23.5 C 23.5 24, 23 25, 25 26.5 C 27 28, 28.5 26.5, 28.5 26.5"
          stroke="#0052D4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

// 2. Adobe Illustrator Glossy 3D Circular App Icon
export function Illustrator3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <CommonDefs />
      {/* 3D Spherical App Badge */}
      <circle cx="24" cy="24" r="20" fill="url(#ai-grad)" filter="url(#app3d-shadow)" />
      <GlossyOverlay />

      {/* Centered 3D Pen Tool / Vector Symbol */}
      <g filter="url(#symbol-shadow)">
        <path d="M 28 11 L 37 20 L 22 35 L 13 35 L 13 26 Z" fill="#992200" />
        <path d="M 26 10 L 36 20 L 21 35 L 12 35 L 12 26 Z" fill="white" />
        <path d="M 12 35 L 18 35 L 12 29 Z" fill="url(#gold-accent)" />
        <line x1="26" y1="10" x2="16" y2="31" stroke="#CC3300" strokeWidth="2" strokeLinecap="round" />
        <circle cx="21" cy="20" r="2" fill="#CC3300" />
      </g>
    </svg>
  );
}

// 3. Adobe Premiere Pro Glossy 3D Circular App Icon
export function Premiere3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <CommonDefs />
      {/* 3D Spherical App Badge */}
      <circle cx="24" cy="24" r="20" fill="url(#pr-grad)" filter="url(#app3d-shadow)" />
      <GlossyOverlay />

      {/* Centered 3D Video Film Clapper / Play Symbol */}
      <g filter="url(#symbol-shadow)">
        <rect x="12" y="13" width="24" height="22" rx="4" fill="#1A0033" opacity="0.5" />
        <rect x="11" y="12" width="24" height="22" rx="4" fill="white" />
        {/* Play Triangle with Crimson Gradient */}
        <path d="M 20 17 L 30 23 L 20 29 Z" fill="url(#pr-grad)" filter="url(#glow-light)" />
        {/* Film Strip Strips */}
        <rect x="11" y="12" width="24" height="4" fill="#2A085C" />
        <line x1="15" y1="12" x2="17" y2="16" stroke="white" strokeWidth="1.5" />
        <line x1="21" y1="12" x2="23" y2="16" stroke="white" strokeWidth="1.5" />
        <line x1="27" y1="12" x2="29" y2="16" stroke="white" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// 4. Adobe After Effects Glossy 3D Circular App Icon
export function AfterEffects3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <CommonDefs />
      {/* 3D Spherical App Badge */}
      <circle cx="24" cy="24" r="20" fill="url(#ae-grad)" filter="url(#app3d-shadow)" />
      <GlossyOverlay />

      {/* Centered 3D Motion Keyframe & Sparkle Symbol */}
      <g filter="url(#symbol-shadow)">
        {/* Diamond Keyframe 3D Layer */}
        <path d="M 24 11 L 35 22 L 24 33 L 13 22 Z" fill="white" />
        <path d="M 24 14 L 32 22 L 24 30 L 16 22 Z" fill="url(#ae-grad)" />
        <path d="M 24 14 L 32 22 L 24 22 Z" fill="white" opacity="0.4" />
        {/* Core Glowing Dot */}
        <circle cx="24" cy="22" r="3.5" fill="white" />
      </g>
    </svg>
  );
}

// 5. Canva Glossy 3D Circular App Icon
export function Canva3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <CommonDefs />
      {/* 3D Spherical App Badge */}
      <circle cx="24" cy="24" r="20" fill="url(#canva-grad)" filter="url(#app3d-shadow)" />
      <GlossyOverlay />

      {/* Centered 3D Creative Canvas "C" Swoosh Symbol */}
      <g filter="url(#symbol-shadow)">
        <path
          d="M 31 17 C 28 14, 21 14, 17 18 C 13 22, 13 28, 17 32 C 21 36, 28 35, 31 32"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="31" cy="17" r="2.5" fill="url(#gold-accent)" />
        <circle cx="31" cy="32" r="2.5" fill="url(#gold-accent)" />
      </g>
    </svg>
  );
}

// 6. Figma Glossy 3D Circular App Icon
export function Figma3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <CommonDefs />
      {/* 3D Spherical App Badge */}
      <circle cx="24" cy="24" r="20" fill="url(#figma-bg-grad)" filter="url(#app3d-shadow)" />
      <GlossyOverlay />

      {/* Centered 3D Figma Droplets */}
      <g filter="url(#symbol-shadow)">
        {/* Top Left Red Pill */}
        <rect x="14" y="12" width="10" height="10" rx="5" fill="#F24E1E" stroke="white" strokeWidth="0.8" />
        {/* Top Right Orange Pill */}
        <rect x="24" y="12" width="10" height="10" rx="5" fill="#FF7262" stroke="white" strokeWidth="0.8" />
        {/* Middle Left Purple Pill */}
        <rect x="14" y="21" width="10" height="10" rx="5" fill="#A259FF" stroke="white" strokeWidth="0.8" />
        {/* Middle Right Blue Circle */}
        <circle cx="29" cy="26" r="5" fill="#1ABCFE" stroke="white" strokeWidth="0.8" />
        {/* Bottom Left Green Teardrop */}
        <path
          d="M 14 30 C 14 30, 24 30, 24 35 C 24 37.7, 21.7 40, 19 40 C 16.3 40, 14 37.7, 14 35 Z"
          fill="#0ACF83"
          stroke="white"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
}

// 7. AI Design Tools Glossy 3D Circular App Icon
export function AIDesign3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <CommonDefs />
      {/* 3D Spherical App Badge */}
      <circle cx="24" cy="24" r="20" fill="url(#aitools-grad)" filter="url(#app3d-shadow)" />
      <GlossyOverlay />

      {/* Centered 3D AI Magic Sparkle Symbol */}
      <g filter="url(#symbol-shadow)">
        {/* Central Glowing 3D Sparkle */}
        <path
          d="M 24 10 C 24 17, 17 24, 10 24 C 17 24, 24 31, 24 38 C 24 31, 31 24, 38 24 C 31 24, 24 17, 24 10 Z"
          fill="white"
        />
        {/* Center Glowing Gold Core */}
        <circle cx="24" cy="24" r="3.5" fill="url(#gold-accent)" />
        
        {/* Secondary Mini Sparkle */}
        <path
          d="M 33 11 C 33 14, 30 16, 27 16 C 30 16, 33 18, 33 21 C 33 18, 36 16, 39 16 C 36 16, 33 14, 33 11 Z"
          fill="url(#gold-accent)"
        />
      </g>
    </svg>
  );
}

// 8. Google AI Studio / Gemini Glossy 3D Circular App Icon
export function GoogleAIStudio3DIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <CommonDefs />
      {/* 3D Spherical App Badge */}
      <circle cx="24" cy="24" r="20" fill="url(#google-ai-grad)" filter="url(#app3d-shadow)" />
      <GlossyOverlay />

      {/* Centered 3D Gemini 4-Point Sparkle Star */}
      <g filter="url(#symbol-shadow)">
        <path
          d="M 24 12 C 24 18, 18 24, 12 24 C 18 24, 24 30, 24 36 C 24 30, 30 24, 36 24 C 30 24, 24 18, 24 12 Z"
          fill="white"
        />
        <circle cx="24" cy="24" r="2.5" fill="#FFE066" />
      </g>
    </svg>
  );
}

// Alias for backwards compatibility
export const WordPress3DIcon = GoogleAIStudio3DIcon;
