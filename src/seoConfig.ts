/**
 * Centralized SEO & Structured Data Configuration
 * Rohit Verma Portfolio — Graphic Designer & Video Editor (Jaipur, Rajasthan, India)
 */

import { contactConfig } from './data';

// Helper to determine the site URL safely across client and server
export function getSiteBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    // If running in browser and VITE_SITE_URL is specified, prefer it; otherwise use window.location.origin
    const envUrl = (import.meta as any)?.env?.VITE_SITE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim() && !envUrl.includes('rohitverma.portfolio')) {
      return envUrl.trim().replace(/\/+$/, '');
    }
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://rohitverma.com';
}

export interface RouteSeoData {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  noindex?: boolean;
  breadcrumbs?: { name: string; path: string }[];
}

export const VERIFIED_SOCIAL_PROFILES = [
  'https://www.linkedin.com/in/rohit-verma-487457374',
  'https://github.com/PrinceRoy555',
  'https://www.instagram.com/thedesigngeek.rohit/',
  'https://www.instagram.com/the1rohit__/',
  'https://www.instagram.com/unicivix_solutions/'
];

export const SEO_ROUTES: Record<string, RouteSeoData> = {
  home: {
    title: 'Rohit Verma | Graphic Designer & Video Editor in Jaipur, India',
    description: 'Professional portfolio of Rohit Verma, Graphic Designer & Video Editor in Jaipur, India. Specializing in brand identity, social media creatives, promotional videos, and motion graphics.',
    canonicalPath: '/',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [{ name: 'Home', path: '/' }]
  },
  'about-rohit': {
    title: 'About Rohit Verma | Graphic Designer, Video Editor & Founder of Unicivix Solutions',
    description: 'Learn about Rohit Verma’s professional journey, experience at CBT and Hodu Academy, professional training at Red Sketch, and creative agency leadership in Jaipur, India.',
    canonicalPath: '/about-rohit',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Rohit', path: '/about-rohit' }
    ]
  },
  'rohit-verma': {
    title: 'About Rohit Verma | Graphic Designer, Video Editor & Founder of Unicivix Solutions',
    description: 'Learn about Rohit Verma’s professional journey, experience at CBT and Hodu Academy, professional training at Red Sketch, and creative agency leadership in Jaipur, India.',
    canonicalPath: '/about-rohit',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Rohit', path: '/about-rohit' }
    ]
  },
  about: {
    title: 'About Me & Creative Expertise | Rohit Verma',
    description: 'Creative design background, technical skills across Photoshop, Illustrator, Premiere Pro, and After Effects by Rohit Verma in Jaipur, Rajasthan.',
    canonicalPath: '/about',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' }
    ]
  },
  services: {
    title: 'Graphic Design & Video Editing Services | Rohit Verma — Jaipur',
    description: 'Explore creative design, logo & brand identity, video editing, social media management, motion graphics, and vibe coding services tailored for growing businesses.',
    canonicalPath: '/services',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' }
    ]
  },
  portfolio: {
    title: 'Featured Projects & Creative Portfolio | Rohit Verma',
    description: 'Explore real-world graphic design projects, branding packages, social media campaigns, YouTube thumbnails, and video edits by Rohit Verma.',
    canonicalPath: '/portfolio',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Portfolio', path: '/portfolio' }
    ]
  },
  experience: {
    title: 'Career Experience & Timeline | Rohit Verma',
    description: 'Professional career timeline of Rohit Verma: Graphic Designer at Hodu Academy, CBT (Center for Business & Technology), freelance clients, and Founder of Unicivix Solutions.',
    canonicalPath: '/experience',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Experience', path: '/experience' }
    ]
  },
  blog: {
    title: 'Creative Insights & Design Articles | Rohit Verma',
    description: 'Read insightful articles on graphic design principles, motion graphics workflows, social media branding, and AI creative tools by Rohit Verma.',
    canonicalPath: '/blog',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' }
    ]
  },
  contact: {
    title: 'Contact Rohit Verma | Graphic Designer & Video Editor in Jaipur',
    description: 'Get in touch with Rohit Verma for project inquiries, freelance design, video editing, and brand collaborations. Contact via email, direct phone, or WhatsApp.',
    canonicalPath: '/contact',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' }
    ]
  },
  privacy: {
    title: 'Privacy Policy | Rohit Verma Portfolio',
    description: 'Privacy policy for Rohit Verma Portfolio and Unicivix Solutions detailing user privacy, secure communications, and client confidentiality standards.',
    canonicalPath: '/privacy-policy',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy-policy' }
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy | Rohit Verma Portfolio',
    description: 'Privacy policy for Rohit Verma Portfolio and Unicivix Solutions detailing user privacy, secure communications, and client confidentiality standards.',
    canonicalPath: '/privacy-policy',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy-policy' }
    ]
  },
  terms: {
    title: 'Terms & Conditions | Rohit Verma Portfolio',
    description: 'Terms and conditions for creative design and video editing services provided by Rohit Verma and Unicivix Solutions.',
    canonicalPath: '/terms-and-conditions',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms & Conditions', path: '/terms-and-conditions' }
    ]
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions | Rohit Verma Portfolio',
    description: 'Terms and conditions for creative design and video editing services provided by Rohit Verma and Unicivix Solutions.',
    canonicalPath: '/terms-and-conditions',
    ogImage: '/images/rohit-verma-og.jpg',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms & Conditions', path: '/terms-and-conditions' }
    ]
  },
  '404': {
    title: 'Page Not Found (404) | Rohit Verma Portfolio',
    description: 'The requested page could not be found. Please navigate back to Rohit Verma’s graphic design and video editing portfolio homepage.',
    canonicalPath: '/404',
    noindex: true
  }
};

/**
 * Generate Person and WebSite JSON-LD schemas
 */
export function generateStructuredData(route: string = 'home', baseUrl: string): object {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const currentSeo = SEO_ROUTES[route] || SEO_ROUTES.home;
  const canonicalUrl = `${cleanBase}${currentSeo.canonicalPath === '/' ? '' : currentSeo.canonicalPath}`;

  const graph: any[] = [
    {
      '@type': 'Person',
      '@id': `${cleanBase}/#person`,
      name: 'Rohit Verma',
      jobTitle: 'Graphic Designer & Video Editor',
      description: 'Jaipur-based Graphic Designer, Video Editor, Brand Strategist and Founder of Unicivix Solutions with over 5 years of professional creative experience.',
      url: cleanBase,
      image: `${cleanBase}/images/rohit-verma-portrait.webp`,
      telephone: contactConfig.phoneDisplay,
      email: contactConfig.emailDisplay,
      sameAs: VERIFIED_SOCIAL_PROFILES,
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
        'Adobe Photoshop',
        'Adobe Illustrator',
        'Adobe Premiere Pro',
        'Adobe After Effects'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${cleanBase}/#website`,
      url: cleanBase,
      name: 'Rohit Verma Portfolio',
      description: 'Official portfolio and creative services website of Rohit Verma — Graphic Designer & Video Editor in Jaipur, India.',
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
        item: `${cleanBase}${b.path === '/' ? '' : b.path}`
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
  const baseUrl = getSiteBaseUrl();
  const canonicalUrl = `${baseUrl}${seoData.canonicalPath === '/' ? '' : seoData.canonicalPath}`;
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
  let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.rel = 'canonical';
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.href = canonicalUrl;

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
  jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
}
