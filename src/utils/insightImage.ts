/**
 * Centralized Category-to-Cover Image Resolution System
 *
 * Resolves article cover images according to strict priority:
 * 1. Valid manually uploaded CMS featured image (post.featuredImage)
 * 2. Normalized category-based local WebP cover image
 * 3. Content-based keyword fallback (title & shortDescription inspection)
 * 4. General default local WebP cover image
 *
 * Note: Never modifies the stored Firestore database records or overwrites post.featuredImage.
 * All operations are purely frontend rendering fallbacks.
 */

import { Insight } from '../types';

export const GENERAL_DEFAULT_COVER = '/images/insights/categories/default.webp';

export const CATEGORY_COVER_MAP: Record<string, string> = {
  'Graphic Design': '/images/insights/categories/graphic-design.webp',
  'Branding': '/images/insights/categories/branding.webp',
  'Brand Identity': '/images/insights/categories/branding.webp',
  'Logo Design': '/images/insights/categories/logo-design.webp',
  'Social Media': '/images/insights/categories/social-media.webp',
  'Video Editing': '/images/insights/categories/video-editing.webp',
  'Motion Graphics': '/images/insights/categories/motion-graphics.webp',
  'Website Development': '/images/insights/categories/website-development.webp',
  'UI/UX': '/images/insights/categories/ui-ux.webp',
  'Digital Marketing': '/images/insights/categories/digital-marketing.webp',
  'AI & Automation': '/images/insights/categories/ai-automation.webp',
  'Default': GENERAL_DEFAULT_COVER,
};

/**
 * Normalizes CMS category string to matching local category cover.
 * Returns null if no direct category match is found.
 */
export function normalizeCategoryToCover(rawCategory?: string | null): string | null {
  if (!rawCategory) return null;
  const cat = rawCategory.trim().toLowerCase();

  if (cat === '' || cat === 'all' || cat === 'general' || cat === 'custom' || cat === 'default') {
    return null;
  }

  // 1. AI & Automation
  if (
    cat.includes('ai') ||
    cat.includes('automation') ||
    cat.includes('artificial intelligence') ||
    cat.includes('generative')
  ) {
    return CATEGORY_COVER_MAP['AI & Automation'];
  }

  // 2. Motion Graphics
  if (
    cat.includes('motion') ||
    cat.includes('animation') ||
    cat.includes('after effects')
  ) {
    return CATEGORY_COVER_MAP['Motion Graphics'];
  }

  // 3. Video Editing
  if (
    cat.includes('video') ||
    cat.includes('editing') ||
    cat.includes('cinematography') ||
    cat.includes('film')
  ) {
    return CATEGORY_COVER_MAP['Video Editing'];
  }

  // 4. Logo Design
  if (cat.includes('logo') || cat.includes('logomark')) {
    return CATEGORY_COVER_MAP['Logo Design'];
  }

  // 5. Branding / Brand Identity
  if (
    cat.includes('brand') ||
    cat.includes('identity') ||
    cat.includes('creative direction')
  ) {
    return CATEGORY_COVER_MAP['Branding'];
  }

  // 6. UI/UX
  if (
    cat.includes('ui/ux') ||
    cat.includes('ui-ux') ||
    cat.includes('ux') ||
    cat.includes('ui') ||
    cat.includes('interface') ||
    cat.includes('product design')
  ) {
    return CATEGORY_COVER_MAP['UI/UX'];
  }

  // 7. Website Development
  if (
    cat.includes('web') ||
    cat.includes('website') ||
    cat.includes('development') ||
    cat.includes('frontend') ||
    cat.includes('fullstack')
  ) {
    return CATEGORY_COVER_MAP['Website Development'];
  }

  // 8. Social Media
  if (
    cat.includes('social') ||
    cat.includes('instagram') ||
    cat.includes('youtube') ||
    cat.includes('tiktok')
  ) {
    return CATEGORY_COVER_MAP['Social Media'];
  }

  // 9. Digital Marketing
  if (
    cat.includes('marketing') ||
    cat.includes('seo') ||
    cat.includes('growth') ||
    cat.includes('advertising')
  ) {
    return CATEGORY_COVER_MAP['Digital Marketing'];
  }

  // 10. Graphic Design
  if (
    cat.includes('graphic') ||
    cat.includes('design') ||
    cat.includes('print') ||
    cat.includes('packaging') ||
    cat.includes('illustration')
  ) {
    return CATEGORY_COVER_MAP['Graphic Design'];
  }

  return null;
}

/**
 * Inspects article title and shortDescription for safe keyword matching
 * when category is missing, generic, or unknown.
 */
export function detectCoverFromContent(
  title?: string | null,
  shortDescription?: string | null
): string | null {
  const content = `${title || ''} ${shortDescription || ''}`.toLowerCase();
  if (!content.trim()) return null;

  // Safe keyword matching in order of specificity
  if (/\b(logo|logomark|monogram|wordmark)\b/.test(content)) {
    return CATEGORY_COVER_MAP['Logo Design'];
  }
  if (/\b(brand|identity|rebrand|style guide|brandbook)\b/.test(content)) {
    return CATEGORY_COVER_MAP['Branding'];
  }
  if (/\b(reel|video|editing|premiere|davinci|cutter|footage)\b/.test(content)) {
    return CATEGORY_COVER_MAP['Video Editing'];
  }
  if (/\b(motion|animation|after effects|kinetic|keyframes)\b/.test(content)) {
    return CATEGORY_COVER_MAP['Motion Graphics'];
  }
  if (/\b(website|react|web development|frontend|html|css|tailwind)\b/.test(content)) {
    return CATEGORY_COVER_MAP['Website Development'];
  }
  if (/\b(ui|ux|user interface|wireframe|figma|prototype)\b/.test(content)) {
    return CATEGORY_COVER_MAP['UI/UX'];
  }
  if (/\b(social media|instagram|youtube|tiktok|ctr|thumbnail|feed)\b/.test(content)) {
    return CATEGORY_COVER_MAP['Social Media'];
  }
  if (/\b(marketing|seo|ads|campaign|conversion|roi|funnel)\b/.test(content)) {
    return CATEGORY_COVER_MAP['Digital Marketing'];
  }
  if (/\b(ai|automation|generative|llm|neural|firefly|gpt)\b/.test(content)) {
    return CATEGORY_COVER_MAP['AI & Automation'];
  }
  if (/\b(graphic|photoshop|illustrator|typography|vector|poster)\b/.test(content)) {
    return CATEGORY_COVER_MAP['Graphic Design'];
  }

  return null;
}

/**
 * Gets the automatic category cover for an article (or content keyword fallback),
 * falling back to GENERAL_DEFAULT_COVER.
 */
export function getCategoryFallbackCover(post?: Partial<Insight> | null): string {
  if (!post) return GENERAL_DEFAULT_COVER;

  // 1. Try category name normalization first (highest priority for fallback)
  const categoryMatch = normalizeCategoryToCover(post.category);
  if (categoryMatch) return categoryMatch;

  // 2. Try content keyword matching if category is missing or generic
  const contentMatch = detectCoverFromContent(post.title, post.shortDescription);
  if (contentMatch) return contentMatch;

  // 3. Fallback to general default cover
  return GENERAL_DEFAULT_COVER;
}

/**
 * Strict Image Priority Resolver:
 * 1. Valid manually provided post.featuredImage (or legacy imageUrl / image properties)
 * 2. Matching category-based local default image
 * 3. Content-based keyword fallback
 * 4. General fallback image
 */
export function resolveInsightCover(post?: Partial<Insight> | null): string {
  if (!post) return GENERAL_DEFAULT_COVER;

  const rawImage = (
    post.featuredImage ||
    (post as Record<string, unknown>).imageUrl ||
    (post as Record<string, unknown>).image ||
    ''
  );

  if (typeof rawImage === 'string' && rawImage.trim().length > 0) {
    return rawImage.trim();
  }

  return getCategoryFallbackCover(post);
}
