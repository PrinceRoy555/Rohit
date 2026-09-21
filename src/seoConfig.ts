/**
 * Centralized SEO & Structured Data Configuration
 * Rohit Verma Portfolio — Graphic Designer & Video Editor (Jaipur, Rajasthan, India)
 */

import { contactConfig, ROHIT_PROFILE_IMAGE_URL } from './data';
import { Insight } from './types';

export const PRIMARY_DOMAIN = 'https://www.rohitwork.in';

// Helper to determine the site URL safely across client and server
export function getSiteBaseUrl(): string {
  return PRIMARY_DOMAIN;
}

export interface RouteSeoData {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  noindex?: boolean;
  breadcrumbs?: { name: string; path: string }[];
}

// Confirmed Professional Profiles: Strictly LinkedIn, Behance, and Professional Instagram
export const CONFIRMED_PROFESSIONAL_PROFILES = [
  'https://www.instagram.com/thedesigngeek.rohit/',
  'https://www.linkedin.com/in/rohit-verma-487457374/',
  'https://www.behance.net/workall18'
];

export const VERIFIED_SOCIAL_PROFILES = CONFIRMED_PROFESSIONAL_PROFILES;

export const SEO_ROUTES: Record<string, RouteSeoData> = {
  home: {
    title: 'Rohit Verma | Graphic Designer & Video Editor in Jaipur',
    description: "Graphic designer and video editor in Jaipur specializing in branding, social media creatives, motion graphics and visual design. Explore Rohit Verma's work.",
    canonicalPath: '/',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [{ name: 'Home', path: '/' }]
  },
  'about-rohit': {
    title: 'About Rohit Verma | Graphic Designer & Video Editor in Jaipur',
    description: "Discover Rohit Verma's creative background, 3+ years of experience in graphic design and video editing, creative journey, and design philosophy.",
    canonicalPath: '/about-rohit',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Rohit', path: '/about-rohit' }
    ]
  },
  'rohit-verma': {
    title: 'About Rohit Verma | Graphic Designer & Video Editor in Jaipur',
    description: "Discover Rohit Verma's creative background, 3+ years of experience in graphic design and video editing, creative journey, and design philosophy.",
    canonicalPath: '/about-rohit',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Rohit', path: '/about-rohit' }
    ]
  },
  about: {
    title: 'About Rohit Verma | Graphic Designer & Video Editor in Jaipur',
    description: "Discover Rohit Verma's creative background, 3+ years of experience in graphic design and video editing, creative journey, and design philosophy.",
    canonicalPath: '/about-rohit',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Rohit', path: '/about-rohit' }
    ]
  },
  services: {
    title: 'Design & Video Editing Services | Rohit Verma — Jaipur',
    description: 'Professional graphic design, brand identity, video editing, social media creatives, motion graphics, and UI/UX services by Rohit Verma in Jaipur, India.',
    canonicalPath: '/services',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' }
    ]
  },
  portfolio: {
    title: 'Creative Portfolio & Featured Projects | Rohit Verma',
    description: 'Explore graphic design projects, branding packages, YouTube thumbnails, social media creatives, and commercial video edits by Rohit Verma.',
    canonicalPath: '/portfolio',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Portfolio', path: '/portfolio' }
    ]
  },
  experience: {
    title: 'Work Experience & Career Timeline | Rohit Verma',
    description: 'Professional experience of Rohit Verma featuring 3+ years in graphic design and video editing across creative agencies, educational platforms, and client work.',
    canonicalPath: '/experience',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Experience', path: '/experience' }
    ]
  },
  blog: {
    title: 'Design Insights & Creative Articles | Rohit Verma',
    description: 'Read actionable articles on visual design psychology, video editing workflows, YouTube thumbnail optimization, and creative strategy by Rohit Verma.',
    canonicalPath: '/blog',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' }
    ]
  },
  insights: {
    title: 'Design Insights & Creative Articles | Rohit Verma',
    description: 'Read actionable articles on visual design psychology, video editing workflows, YouTube thumbnail optimization, and creative strategy by Rohit Verma.',
    canonicalPath: '/blog',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' }
    ]
  },
  contact: {
    title: 'Contact Rohit Verma | Graphic Designer & Video Editor in Jaipur',
    description: 'Get in touch with Rohit Verma for graphic design, branding, and video editing inquiries. Direct WhatsApp, phone, email, and project intake brief available.',
    canonicalPath: '/contact',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' }
    ]
  },
  privacy: {
    title: 'Privacy Policy | Rohit Verma Portfolio',
    description: 'Official privacy policy for Rohit Verma Portfolio detailing visitor data protection, contact brief confidentiality, and cookie usage standards.',
    canonicalPath: '/privacy-policy',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy-policy' }
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy | Rohit Verma Portfolio',
    description: 'Official privacy policy for Rohit Verma Portfolio detailing visitor data protection, contact brief confidentiality, and cookie usage standards.',
    canonicalPath: '/privacy-policy',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy-policy' }
    ]
  },
  terms: {
    title: 'Terms & Conditions | Rohit Verma Portfolio',
    description: 'Terms and conditions governing creative design and video editing services, deliverable milestones, and intellectual property terms by Rohit Verma.',
    canonicalPath: '/terms-and-conditions',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms & Conditions', path: '/terms-and-conditions' }
    ]
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions | Rohit Verma Portfolio',
    description: 'Terms and conditions governing creative design and video editing services, deliverable milestones, and intellectual property terms by Rohit Verma.',
    canonicalPath: '/terms-and-conditions',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms & Conditions', path: '/terms-and-conditions' }
    ]
  },
  admin: {
    title: 'Admin Portal | Rohit Verma Portfolio',
    description: 'Restricted administrative and CMS management portal.',
    canonicalPath: '/admin',
    noindex: true
  },
  '404': {
    title: 'Page Not Found (404) | Rohit Verma Portfolio',
    description: "The requested page could not be found. Return to Rohit Verma's graphic design and video editing portfolio homepage.",
    canonicalPath: '/404',
    noindex: true
  }
};

/**
 * Generate Person and WebSite JSON-LD schemas
 */
export function generateStructuredData(route: string = 'home', baseUrl: string = PRIMARY_DOMAIN): object | null {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const currentSeo = SEO_ROUTES[route] || SEO_ROUTES.home;

  // Do not generate public structured data for private or noindex routes
  if (currentSeo.noindex) {
    return null;
  }

  const canonicalUrl = `${cleanBase}${currentSeo.canonicalPath === '/' ? '/' : currentSeo.canonicalPath}`;

  const graph: any[] = [
    {
      '@type': 'Person',
      '@id': `${cleanBase}/#person`,
      name: 'Rohit Verma',
      jobTitle: 'Graphic Designer & Video Editor',
      description: 'Graphic designer and video editor in Jaipur specializing in branding, social media creatives, motion graphics and visual design with 3+ years of professional creative experience.',
      url: `${cleanBase}/`,
      image: ROHIT_PROFILE_IMAGE_URL,
      telephone: contactConfig.phoneDisplay,
      email: contactConfig.emailDisplay,
      sameAs: CONFIRMED_PROFESSIONAL_PROFILES,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jaipur',
        addressRegion: 'Rajasthan',
        addressCountry: 'India'
      },
      knowsAbout: [
        'Graphic Design',
        'Video Editing',
        'Brand Identity Design',
        'Logo Design',
        'Social Media Creatives',
        'Motion Graphics',
        'Visual Design',
        'Adobe Photoshop',
        'Adobe Illustrator',
        'Adobe Premiere Pro',
        'Adobe After Effects'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${cleanBase}/#website`,
      url: `${cleanBase}/`,
      name: 'Rohit Verma Portfolio',
      description: 'Official portfolio of Rohit Verma — Graphic Designer & Video Editor in Jaipur, India.',
      publisher: {
        '@id': `${cleanBase}/#person`
      },
      inLanguage: 'en-US'
    },
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: currentSeo.title,
      description: currentSeo.description,
      isPartOf: {
        '@id': `${cleanBase}/#website`
      },
      about: {
        '@id': `${cleanBase}/#person`
      },
      inLanguage: 'en-US'
    }
  ];

  if (currentSeo.breadcrumbs && currentSeo.breadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: currentSeo.breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: `${cleanBase}${b.path === '/' ? '/' : b.path}`
      }))
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

/**
 * Safely update DOM meta tags for client-side navigation
 */
export function updateDocumentMetadata(route: string): void {
  if (typeof document === 'undefined') return;

  const seoData = SEO_ROUTES[route] || SEO_ROUTES.home;
  const baseUrl = PRIMARY_DOMAIN;
  const canonicalUrl = `${baseUrl}${seoData.canonicalPath === '/' ? '/' : seoData.canonicalPath}`;
  const fullOgImage = seoData.ogImage ? `${baseUrl}${seoData.ogImage}` : `${baseUrl}/images/rohit-verma-og.jpg`;

  // 1. Update Title
  document.title = seoData.title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = seoData.description;

  // 3. Update Robots
  let metaRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    document.head.appendChild(metaRobots);
  }
  metaRobots.content = seoData.noindex ? 'noindex, nofollow' : 'index, follow';

  // 4. Update Canonical
  // A canonical is not required for noindex Admin or arbitrary 404 pages.
  // Do not point unknown URLs to the Homepage canonical.
  let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (seoData.noindex) {
    if (linkCanonical) {
      linkCanonical.remove();
    }
  } else {
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;
  }

  // 5. Update Open Graph Tags
  const setMetaProperty = (prop: string, content: string) => {
    let tag = document.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', prop);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  setMetaProperty('og:type', 'website');
  setMetaProperty('og:title', seoData.title);
  setMetaProperty('og:description', seoData.description);
  setMetaProperty('og:url', canonicalUrl);
  setMetaProperty('og:image', fullOgImage);
  setMetaProperty('og:site_name', 'Rohit Verma Portfolio');

  // 6. Update Twitter Card Tags
  const setMetaName = (name: string, content: string) => {
    let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', seoData.title);
  setMetaName('twitter:description', seoData.description);
  setMetaName('twitter:image', fullOgImage);

  // 7. Update JSON-LD Script
  let jsonLdScript = document.getElementById('primary-jsonld-schema') as HTMLScriptElement | null;
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'primary-jsonld-schema';
    document.head.appendChild(jsonLdScript);
  }

  const structuredData = generateStructuredData(route, baseUrl);
  if (structuredData) {
    jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
  } else {
    jsonLdScript.textContent = '';
  }
}

/**
 * Dedicated metadata updater for published Article/Insight detail pages
 */
export function updateArticleMetadata(insight: Insight): void {
  if (typeof document === 'undefined') return;

  const articleUrl = `${PRIMARY_DOMAIN}/insights/${insight.slug}`;
  const title = insight.seoTitle || `${insight.title} | Rohit Verma`;
  const description = insight.seoDescription || insight.shortDescription || `Read ${insight.title} by Rohit Verma.`;
  const image = insight.featuredImage || `${PRIMARY_DOMAIN}/images/rohit-verma-og.jpg`;

  // 1. Update Title
  document.title = title;

  // 2. Meta description
  let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = description;

  // 3. Robots
  let metaRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    document.head.appendChild(metaRobots);
  }
  metaRobots.content = 'index, follow';

  // 4. Canonical
  let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.rel = 'canonical';
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.href = articleUrl;

  // 5. Open Graph
  const setMetaProperty = (prop: string, content: string) => {
    let tag = document.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', prop);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  setMetaProperty('og:type', 'article');
  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:url', articleUrl);
  setMetaProperty('og:image', image);
  setMetaProperty('og:site_name', 'Rohit Verma Portfolio');

  // 6. Twitter
  const setMetaName = (name: string, content: string) => {
    let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.content = content;
  };

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);
  setMetaName('twitter:image', image);

  // 7. Article Schema JSON-LD
  let jsonLdScript = document.getElementById('primary-jsonld-schema') as HTMLScriptElement | null;
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'primary-jsonld-schema';
    document.head.appendChild(jsonLdScript);
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${articleUrl}#article`,
        isPartOf: {
          '@id': `${PRIMARY_DOMAIN}/#website`
        },
        headline: insight.title,
        description: description,
        url: articleUrl,
        datePublished: insight.publishDate || insight.createdDate,
        dateModified: insight.updatedDate || insight.publishDate || insight.createdDate,
        author: {
          '@type': 'Person',
          '@id': `${PRIMARY_DOMAIN}/#person`,
          name: 'Rohit Verma',
          jobTitle: 'Graphic Designer & Video Editor',
          url: `${PRIMARY_DOMAIN}/`
        },
        publisher: {
          '@type': 'Person',
          '@id': `${PRIMARY_DOMAIN}/#person`,
          name: 'Rohit Verma'
        },
        image: image,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl
        },
        keywords: insight.tags?.join(', ') || 'Graphic Design, Video Editing, Motion Graphics, Creative Strategy'
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${articleUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${PRIMARY_DOMAIN}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${PRIMARY_DOMAIN}/blog`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: insight.title,
            item: articleUrl
          }
        ]
      }
    ]
  };

  jsonLdScript.textContent = JSON.stringify(articleSchema, null, 2);
}

