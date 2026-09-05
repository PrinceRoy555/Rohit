import { Project, Experience, Service, Testimonial, BlogPost, QuickCard, JourneyEntry, TrainingData, SkillCategory, UnicivixSection, PhilosophyCard, AchievementCard, PortfolioCategory } from '../types';

export type PortfolioItem = Project;
export type ServiceItem = Service;
export type TestimonialItem = Testimonial;
export type ExperienceItem = Experience;
export type ConfigRevision = SiteRevision;

export interface SocialLinkItem {
  id?: string;
  name?: string;
  platform?: string;
  url: string;
  label?: string;
  icon?: string;
  isVisible?: boolean;
}

export interface BrandingConfig {
  siteName: string;
  tagline: string;
  bio: string;
  avatarImage: string;
  logoText: string;
  faviconUrl: string;
  email: string;
  phone: string;
  whatsappUrl: string;
  location: string;
  availableForWork: boolean;
  yearsExperience: string;
  projectsCompleted: string;
  satisfiedClients: string;
  resumeUrl: string;
  socials: SocialLinkItem[];
}

export type ThemeBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ThemeConfig {
  presetName?: string;
  primaryAccent: string;     // e.g. #A50C18 or #6366F1
  secondaryAccent: string;   // e.g. #D31322 or #4F46E5
  accentDark?: string;       // e.g. #35070B
  bgPrimary: string;         // e.g. #F8F5F2 or #080607
  bgSecondary: string;       // e.g. #EFE8E5 or #100A0B
  bgCard: string;            // e.g. #FFFFFF or #1D0709
  bgCardHover: string;       // e.g. #F5ECEA or #35070B
  textPrimary: string;       // e.g. #1A090A or #FFFFFF
  textSecondary: string;     // e.g. rgba(26,9,10,0.82) or rgba(255,255,255,0.85)
  borderColor: string;       // e.g. rgba(26,9,10,0.12)
  fontHeading: string;       // e.g. 'Plus Jakarta Sans', 'Syne', 'Outfit', 'Space Grotesk'
  fontBody: string;          // e.g. 'Plus Jakarta Sans', 'Inter', 'Manrope'
  borderRadius: ThemeBorderRadius;
  mode: 'light' | 'dark' | 'system';
}

export interface SeoConfig {
  siteTitle?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterHandle?: string;
  canonicalUrl?: string;
  googleAnalyticsId?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  route?: string;
  path?: string;
  order?: number;
  isVisible?: boolean;
}

export interface NavigationConfig {
  navigation?: NavigationItem[];
  items?: NavigationItem[];
  ctaButton?: {
    label?: string;
    text?: string;
    route?: string;
    link?: string;
    isVisible?: boolean;
  };
}

export interface FooterConfig {
  tagline?: string;
  copyright?: string;
  copyrightText?: string;
  showSocials?: boolean;
  showQuickLinks?: boolean;
  customNote?: string;
  bottomSubtext?: string;
}

export interface SectionVisibilityItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  isVisible: boolean;
  order: number;
}

export interface SectionsConfig {
  hero: SectionVisibilityItem & {
    headlinePrefix: string;
    headlineHighlight: string;
    headlineSuffix: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
  };
  portfolio: SectionVisibilityItem;
  services: SectionVisibilityItem;
  about: SectionVisibilityItem;
  experience: SectionVisibilityItem;
  skills: SectionVisibilityItem;
  testimonials: SectionVisibilityItem;
  pricing: SectionVisibilityItem;
  blog: SectionVisibilityItem;
  contact: SectionVisibilityItem;
  unicivix: SectionVisibilityItem;
}

export interface PricingTierItem {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  percentage?: number;
  level?: number;
  iconName?: string;
}

export interface CustomPageItem {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown or HTML
  metaDescription: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface SiteConfig {
  id: string;
  version: number;
  lastUpdated: string;
  lastPublishedAt?: string;
  publishedBy?: string;
  branding: BrandingConfig;
  theme: ThemeConfig;
  seo: SeoConfig;
  navigation: NavigationConfig;
  header?: NavigationConfig;
  footer: FooterConfig;
  socialLinks?: SocialLinkItem[];
  sections: SectionsConfig;
  portfolio: Project[];
  portfolioCategories: PortfolioCategory[];
  services: Service[];
  testimonials: Testimonial[];
  skills: SkillItem[];
  experiences: Experience[];
  experience?: Experience[];
  pricing?: PricingTierItem[];
  pricingTiers: PricingTierItem[];
  customPages: CustomPageItem[];
}

export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Creator & Motion' | 'Creative Agency' | 'Minimalist' | 'SaaS & Tech' | 'Custom';
  thumbnail: string;
  isBuiltIn: boolean;
  createdAt: string;
  author: string;
  config: Partial<SiteConfig>;
}

export interface SiteRevision {
  id: string;
  version: number;
  timestamp: string;
  author: string;
  changeSummary?: string;
  summary?: string;
  type?: 'publish' | 'template_activate' | 'manual_save' | 'restore';
  config: SiteConfig;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
  category: string;
  uploadedAt?: string;
  dimensions?: string;
  tags?: string[];
}

export type InquiryStatus = 'new' | 'contacted' | 'in_progress' | 'completed' | 'archived' | 'closed';
export type FollowUpStatus = 'pending' | 'completed';
export type LeadPriority = 'low' | 'medium' | 'high';

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  service: string;
  message: string;
  status: InquiryStatus;
  source: 'contact_form' | 'ai_chat' | 'website-contact-form' | string;
  createdAt: string;
  notes?: string;
  budgetRange?: string;
  attachmentUrl?: string | null;
  // Optional CRM-specific fields
  followUpAt?: string | null;
  followUpStatus?: FollowUpStatus | null;
  nextAction?: string;
  lastContactedAt?: string | null;
  priority?: LeadPriority;
  leadScore?: number;
  isHotLead?: boolean;
  tags?: string[];
  internalNotes?: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  password?: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
  createdAt?: string;
}
