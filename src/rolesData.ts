/**
 * Centralized Master Roles & Specializations Configuration
 * Single source of truth for all approved professional titles and specializations across the website.
 */

export const APPROVED_ROLES_BY_CATEGORY = {
  'Graphic Design': [
    'Graphic Designer',
    'Brand Identity Designer',
    'Logo Designer',
    'Social Media Designer',
    'Packaging Designer',
    'Marketing Designer',
    'Print Designer',
    'Visual Designer',
    'Motion Graphics Designer',
    'Thumbnail Designer',
    'Poster Designer',
    'Flyer Designer',
    'Canva Designer',
    'Photoshop Editor',
    'Image Editor',
    'UI/UX Designer',
  ],
  'Video Editing': [
    'Video Editor',
  ],
  'Social Media': [
    'Social Media Manager',
  ],
  'Additional': [
    'Vibe Coder',
  ],
} as const;

export type RoleCategory = keyof typeof APPROVED_ROLES_BY_CATEGORY;

export const GLOBAL_ROLES: string[] = [
  ...APPROVED_ROLES_BY_CATEGORY['Graphic Design'],
  ...APPROVED_ROLES_BY_CATEGORY['Video Editing'],
  ...APPROVED_ROLES_BY_CATEGORY['Social Media'],
  ...APPROVED_ROLES_BY_CATEGORY['Additional'],
];

export type GlobalRole = (typeof GLOBAL_ROLES)[number];

export const ROLE_CATEGORY_DESCRIPTIONS: Record<RoleCategory, string> = {
  'Graphic Design': 'Visual communication, brand identities, marketing collateral, packaging, and high-impact digital graphics.',
  'Video Editing': 'Cinematic pacing, kinetic typography, reels, shorts, and commercial video editing.',
  'Social Media': 'Strategic social media management, organic audience growth, and community engagement.',
  'Additional': 'Modern vibe coding, creative technical scripting, and rapid interactive digital prototypes.',
};
