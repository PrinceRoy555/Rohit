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
  creativeToolsCount?: string;
  countriesServed?: string;
  resumeUrl: string;
  socials: SocialLinkItem[];
}

export type ThemeBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ThemeConfig {
  presetName?: string;
  primaryAccent: string;     // e.g. #0866F5 or #155EEF
  secondaryAccent: string;   // e.g. #155EEF or #257BFD
  accentDark?: string;       // e.g. #071B49
  bgPrimary: string;         // e.g. #FFFFFF or #030B1E
  bgSecondary: string;       // e.g. #F3F7FF or #05112E
  bgCard: string;            // e.g. #FFFFFF or #071B49
  bgCardHover: string;       // e.g. #EAF2FF or #0D2A6B
  textPrimary: string;       // e.g. #101C38 or #FFFFFF
  textSecondary: string;     // e.g. #53627C or #B8C9E8
  borderColor: string;       // e.g. #DCE7F8 or rgba(220,231,248,0.14)
  fontHeading: string;       // e.g. 'Manrope', 'Plus Jakarta Sans', 'Syne', 'Outfit', 'Space Grotesk'
  fontBody: string;          // e.g. 'Manrope', 'Plus Jakarta Sans', 'Inter'
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
    role?: string;
    location?: string;
    rotatingRoles?: string[];
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
  sourceCollection?: 'leads' | 'contactEnquiries' | 'chatbotLeads' | 'quoteRequests' | string;
  sourceDocumentId?: string;
}

export interface NewsletterSubscriberRecord {
  id: string;
  email: string;
  status: string;
  source?: string;
  subscribedAt: string;
}

export interface FirestoreHealthRecord {
  collection: string;
  count: number;
  status: 'healthy' | 'warning' | 'empty' | 'error';
  latencyMs?: number;
  lastChecked: string;
  sampleId?: string;
  error?: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  password?: string;
  status?: 'active' | 'inactive' | 'disabled';
  lastLogin?: string;
  createdAt?: string;
}
