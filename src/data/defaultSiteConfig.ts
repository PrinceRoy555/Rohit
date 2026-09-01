import { SiteConfig, SiteTemplate } from '../types/cms';
import {
  PROJECTS_DATA,
  SERVICES_DATA,
  TESTIMONIALS_DATA,
  EXPERIENCE_DATA,
  PORTFOLIO_CATEGORIES,
  SOCIAL_LINKS,
  WHATSAPP_BUSINESS_URL,
  RESUME_PDF_URL,
  contactConfig
} from '../data';

export const INITIAL_SKILLS = [
  { id: 's1', name: 'Adobe Photoshop', category: 'Graphic Design', percentage: 95, iconName: 'photoshop' },
  { id: 's2', name: 'Adobe Illustrator', category: 'Graphic Design', percentage: 92, iconName: 'illustrator' },
  { id: 's3', name: 'CorelDRAW', category: 'Graphic Design', percentage: 88, iconName: 'coreldraw' },
  { id: 's4', name: 'Canva', category: 'Graphic Design', percentage: 94, iconName: 'canva' },
  { id: 's5', name: 'Figma', category: 'UI/UX Design', percentage: 86, iconName: 'figma' },
  { id: 's6', name: 'Adobe Firefly', category: 'AI & Automation', percentage: 90, iconName: 'firefly' },
  { id: 's7', name: 'Adobe Premiere Pro', category: 'Video Editing', percentage: 94, iconName: 'premiere' },
  { id: 's8', name: 'Adobe After Effects', category: 'Motion Graphics', percentage: 90, iconName: 'aftereffects' }
];

export const INITIAL_PRICING_TIERS = [
  {
    id: 'tier-starter',
    name: 'Starter Creative',
    price: '₹9,999',
    period: 'per project',
    description: 'Perfect for startups and creators needing essential high-converting social creatives or basic video edits.',
    features: [
      '5 High-Impact Social Media Creatives',
      '2 Short-Form Reels / YouTube Shorts (Up to 60s)',
      'High-Resolution CMYK / RGB Export',
      '2 Iteration Rounds Included',
      '48-Hour Turnaround Time'
    ],
    isPopular: false,
    ctaText: 'Get Started',
    ctaLink: '#contact'
  },
  {
    id: 'tier-pro',
    name: 'Brand & Motion Pro',
    price: '₹24,999',
    period: 'per package',
    description: 'Comprehensive brand identity, kinetic motion graphics, and full visual campaign suite for growing businesses.',
    features: [
      'Full Brand Identity & Vector Logo Suite',
      '15 Custom Social Media & Carousel Designs',
      '5 Premium Kinetic Motion Video Reels',
      'Complete Source Files (AI, PSD, AE, PR)',
      'Priority 24/7 WhatsApp & Email Support',
      'Unlimited Minor Revisions'
    ],
    isPopular: true,
    ctaText: 'Claim Pro Package',
    ctaLink: '#contact'
  },
  {
    id: 'tier-enterprise',
    name: 'Agency Retainer',
    price: '₹49,999',
    period: 'per month',
    description: 'Dedicated end-to-end creative direction, daily visual assets, long-form video production, and vibe coding.',
    features: [
      'Unlimited Graphic Design Requests',
      'Up to 15 Full Video Edits + Motion Ads / Month',
      'YouTube Thumbnail Strategy & A/B Variants',
      'Custom UI/UX Prototypes & Web Vibe Coding',
      'Dedicated Project Manager & Daily Syncs',
      'Fast-Track Same-Day Rush Delivery'
    ],
    isPopular: false,
    ctaText: 'Discuss Agency Retainer',
    ctaLink: '#contact'
  }
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  id: 'site-config-live',
  version: 1,
  lastUpdated: new Date().toISOString(),
  lastPublishedAt: new Date().toISOString(),
  publishedBy: 'Rohit Verma',
  branding: {
    siteName: 'Rohit Verma',
    tagline: 'Graphic Designer, Video Editor & Founder of Unicivix Solutions',
    bio: 'Professional graphic designer, video editor, and creative director with over 5 years of experience delivering high-converting visual branding and cinematic digital content.',
    avatarImage: '/images/rohit-verma-portrait.jpg',
    logoText: 'Rohit Verma',
    faviconUrl: '/favicon.ico',
    email: contactConfig.emailDisplay,
    phone: contactConfig.phoneDisplay,
    whatsappUrl: WHATSAPP_BUSINESS_URL,
    location: 'Jaipur, Rajasthan, India',
    availableForWork: true,
    yearsExperience: '5+ Years',
    projectsCompleted: '120+',
    satisfiedClients: '85+',
    resumeUrl: RESUME_PDF_URL,
    socials: SOCIAL_LINKS
  },
  theme: {
    presetName: 'Scarlet Prestige (Default)',
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
    fontHeading: 'Plus Jakarta Sans',
    fontBody: 'Plus Jakarta Sans',
    borderRadius: 'full',
    mode: 'system'
  },
  seo: {
    siteTitle: 'Rohit Verma | Graphic Designer, Video Editor & Creative Director Jaipur',
    metaDescription: 'Official portfolio of Rohit Verma. Expert graphic designer, video editor, and founder of Unicivix Solutions based in Jaipur, India. Specializing in branding, social creatives, and motion graphics.',
    keywords: 'Rohit Verma, Graphic Designer Jaipur, Video Editor Jaipur, Unicivix Solutions, Brand Identity, Motion Graphics, Thumbnail Designer, Photoshop, After Effects',
    ogTitle: 'Rohit Verma | Creative Portfolio & Agency',
    ogDescription: 'Explore award-winning graphic design, brand identity, video editing, and motion graphics by Rohit Verma.',
    ogImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
    twitterCard: 'summary_large_image',
    canonicalUrl: 'https://rohitverma.design'
  },
  navigation: {
    items: [
      { id: 'nav-home', label: 'Home', route: 'home', isVisible: true },
      { id: 'nav-about', label: 'About', route: 'about', isVisible: true },
      { id: 'nav-services', label: 'Services', route: 'services', isVisible: true },
      { id: 'nav-portfolio', label: 'Portfolio', route: 'portfolio', isVisible: true },
      { id: 'nav-experience', label: 'Experience', route: 'experience', isVisible: true },
      { id: 'nav-blog', label: 'Blog', route: 'blog', isVisible: true },
      { id: 'nav-contact', label: 'Contact', route: 'contact', isVisible: true }
    ],
    ctaButton: {
      label: 'Hire Me',
      route: 'contact',
      isVisible: true
    }
  },
  footer: {
    tagline: 'Designing high-impact visuals, cinematic video edits, and modern branding campaigns that accelerate business growth.',
    copyright: `© ${new Date().getFullYear()} Rohit Verma & Unicivix Solutions. All rights reserved.`,
    showSocials: true,
    showQuickLinks: true,
    customNote: 'Crafted with precision, creative strategy, and cutting-edge digital aesthetics in Jaipur, India.'
  },
  sections: {
    hero: {
      id: 'hero',
      title: 'Hero Section',
      subtitle: 'Main introduction banner on homepage',
      isVisible: true,
      order: 1,
      headlinePrefix: 'Creative Excellence in',
      headlineHighlight: 'Graphic Design & Video Editing',
      headlineSuffix: 'for Growing Brands',
      ctaPrimaryText: 'Explore Portfolio',
      ctaPrimaryLink: '#portfolio',
      ctaSecondaryText: 'Start a Project',
      ctaSecondaryLink: '#contact'
    },
    portfolio: {
      id: 'portfolio',
      title: 'Featured Masterpieces',
      subtitle: 'A handpicked curation of branding, graphic design, and cinematic video edits.',
      badge: 'Portfolio Showcase',
      isVisible: true,
      order: 2
    },
    services: {
      id: 'services',
      title: 'My Creative Services',
      subtitle: 'Comprehensive creative solutions tailored to amplify your brand presence and engagement.',
      badge: 'Capabilities & Solutions',
      isVisible: true,
      order: 3
    },
    about: {
      id: 'about',
      title: 'About Rohit Verma',
      subtitle: 'Discover my creative background, professional achievements, and design philosophy.',
      badge: 'Who I Am',
      isVisible: true,
      order: 4
    },
    experience: {
      id: 'experience',
      title: 'Career & Work Experience',
      subtitle: 'A timeline of agency leadership, freelance projects, and creative milestones.',
      badge: 'Professional Journey',
      isVisible: true,
      order: 5
    },
    skills: {
      id: 'skills',
      title: 'Skills & Creative Software',
      subtitle: 'Mastery of industry-standard tools and design frameworks.',
      badge: 'Technical Proficiency',
      isVisible: true,
      order: 6
    },
    testimonials: {
      id: 'testimonials',
      title: 'Client Testimonials',
      subtitle: 'What founders, directors, and agency leaders say about working with me.',
      badge: 'Proven Track Record',
      isVisible: true,
      order: 7
    },
    pricing: {
      id: 'pricing',
      title: 'Flexible Investment Packages',
      subtitle: 'Transparent, value-driven pricing plans designed for every stage of brand growth.',
      badge: 'Pricing & Tiers',
      isVisible: true,
      order: 8
    },
    blog: {
      id: 'blog',
      title: 'Insights & Design Wisdom',
      subtitle: 'Deep dives into design psychology, AI workflows, and viral video editing techniques.',
      badge: 'Articles & Guides',
      isVisible: true,
      order: 9
    },
    contact: {
      id: 'contact',
      title: 'Let’s Build Something Remarkable',
      subtitle: 'Have a project in mind? Reach out today and let’s bring your vision to life.',
      badge: 'Get In Touch',
      isVisible: true,
      order: 10
    },
    unicivix: {
      id: 'unicivix',
      title: 'Unicivix Solutions',
      subtitle: 'Creative and digital growth agency founded by Rohit Verma.',
      badge: 'Agency Arm',
      isVisible: true,
      order: 11
    }
  },
  portfolio: PROJECTS_DATA,
  portfolioCategories: PORTFOLIO_CATEGORIES,
  services: SERVICES_DATA,
  testimonials: TESTIMONIALS_DATA,
  skills: INITIAL_SKILLS,
  experiences: EXPERIENCE_DATA,
  pricingTiers: INITIAL_PRICING_TIERS,
  customPages: [
    {
      id: 'page-privacy',
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: '# Privacy Policy\n\nYour privacy is paramount to us...',
      metaDescription: 'Official privacy policy for client confidentiality and data security.',
      isPublished: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'page-terms',
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      content: '# Terms and Conditions\n\nCommercial service terms and licensing agreements...',
      metaDescription: 'Official terms and conditions for design services and digital deliverables.',
      isPublished: true,
      updatedAt: new Date().toISOString()
    }
  ]
};

export const BUILT_IN_TEMPLATES: SiteTemplate[] = [
  {
    id: 'tpl-rohit-verma',
    name: 'Rohit Verma (Default Creator)',
    description: 'The signature high-converting portfolio designed for graphic designers, video editors, and motion creators.',
    category: 'Creator & Motion',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
    author: 'Rohit Verma',
    config: DEFAULT_SITE_CONFIG
  },
  {
    id: 'tpl-apex-agency',
    name: 'Apex Studio (Creative Agency)',
    description: 'A bold, high-contrast agency template featuring royal indigo accents, client case studies, and enterprise pricing.',
    category: 'Creative Agency',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80',
    isBuiltIn: true,
    createdAt: '2026-02-01T00:00:00Z',
    author: 'Unicivix Design System',
    config: {
      ...DEFAULT_SITE_CONFIG,
      branding: {
        ...DEFAULT_SITE_CONFIG.branding,
        siteName: 'Apex Creative Studio',
        tagline: 'Premier Digital Branding & Motion Advertising Agency',
        bio: 'We transform ambitious startups into category leaders through high-impact visual design, 3D motion, and full-funnel digital storytelling.',
        logoText: 'Apex Studio'
      },
      theme: {
        presetName: 'Royal Indigo Agency',
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
    }
  },
  {
    id: 'tpl-vanguard-minimal',
    name: 'Vanguard Minimalist (Art Director)',
    description: 'An editorial, monochromatic aesthetic featuring serif display typography, expansive whitespace, and refined grid layouts.',
    category: 'Minimalist',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    isBuiltIn: true,
    createdAt: '2026-02-15T00:00:00Z',
    author: 'Vanguard Collective',
    config: {
      ...DEFAULT_SITE_CONFIG,
      branding: {
        ...DEFAULT_SITE_CONFIG.branding,
        siteName: 'Vanguard Editorial',
        tagline: 'Art Direction, Typography & Monochromatic Branding',
        bio: 'Refining brands through minimalist design systems, rigorous typographic hierarchies, and timeless editorial aesthetics.'
      },
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
        fontHeading: 'Plus Jakarta Sans',
        fontBody: 'Plus Jakarta Sans',
        borderRadius: 'sm',
        mode: 'light'
      }
    }
  },
  {
    id: 'tpl-nova-tech',
    name: 'Nova Tech (SaaS & Digital Product)',
    description: 'A vibrant emerald and cyan theme tailored for SaaS product builders, vibe coders, and digital tech studios.',
    category: 'SaaS & Tech',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    isBuiltIn: true,
    createdAt: '2026-03-01T00:00:00Z',
    author: 'Nova Labs',
    config: {
      ...DEFAULT_SITE_CONFIG,
      branding: {
        ...DEFAULT_SITE_CONFIG.branding,
        siteName: 'Nova Digital Labs',
        tagline: 'Vibe Coding, AI UI/UX & Web Product Studio',
        bio: 'Building the next generation of web applications, AI interfaces, and viral interactive experiences.'
      },
      theme: {
        presetName: 'Emerald Tech Glow',
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
    }
  }
];
