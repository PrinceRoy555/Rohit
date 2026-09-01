export interface PortfolioCategory {
  name: string;
  image?: string;
  fallbackImage?: string;
  alt?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  fallbackImage?: string;
  description: string;
  tools: string[];
  link?: string;
  externalLink?: string;
  videoUrl?: string;
  details?: string;
  client?: string;
  date?: string;
  year?: string;
  isFeatured?: boolean;
}

export interface Experience {
  id: string;
  year?: string;
  period?: string;
  role: string;
  company: string;
  description?: string;
  responsibilities?: string[];
  highlights?: string[];
  isCurrent?: boolean;
  link?: string;
}

export type ServiceCategory = 'Graphic Design' | 'Video Editing' | 'Social Media' | 'Additional';

export interface Service {
  id: string;
  title: string;
  description: string;
  category?: ServiceCategory;
  categories?: ServiceCategory[];
  iconName?: string; // Lucide icon name
  icon?: string;
  features: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  priceStartingAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image?: string;
  avatar?: string;
  rating: number;
  feedback?: string;
  content?: string;
  project?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  author: string;
  tags: string[];
}

export interface ProfileHero {
  label: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface ProfileIntro {
  title: string;
  content1: string;
  content2: string;
  image: string;
  signature: string;
  designation: string;
}

export interface QuickCard {
  title: string;
  value: string;
  icon: string;
}

export interface JourneyEntry {
  role: string;
  duration: string;
  organisation: string;
  description: string;
  keyExperience: string[];
}

export interface TrainingData {
  institute: string;
  programme: string;
  description: string;
  learningAreas: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface UnicivixSection {
  title: string;
  heading: string;
  description: string;
  services: string[];
  mission: string;
}

export interface PhilosophyCard {
  title: string;
  description: string;
}

export interface AchievementCard {
  title: string;
  subtitle: string;
  icon: string;
}

export type InsightStatus = 'draft' | 'review' | 'scheduled' | 'published';

export interface Insight {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string; // Markdown formatted
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: string; // e.g. "Oct 24, 2025" or ISO string
  readingTime: string; // e.g. "5 min read"
  seoTitle: string;
  seoDescription: string;
  status: InsightStatus;
  schedulePublishDate?: string | null;
  viewsCount?: number;
  createdDate: string;
  updatedDate: string;
  isAiGenerated?: boolean;
}

export interface InsightAutomationSettings {
  autoPublishEnabled: boolean;
  cadence: 'daily' | 'weekly' | 'bi-weekly' | 'manual';
  mode: 'auto-publish' | 'save-as-review' | 'schedule';
  targetCategories: string[];
  lastRunTime?: string;
  nextScheduledRun?: string;
  totalGenerated?: number;
}


