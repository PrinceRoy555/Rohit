import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import * as Icons from 'lucide-react';
import {
  SERVICES_LIST,
  SERVICE_CATEGORIES,
  ALL_CATEGORY_FILTERS,
  FEATURED_SERVICE_TITLES,
  DetailedService,
  getServicesByCategory,
  getServiceByTitle,
  getServiceById
} from '../servicesData';
import { ServiceCategory } from '../types';
import ServiceDetailModal from './ServiceDetailModal';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
}

// Category metadata with icons, count and associated primary service
interface CategoryCardMeta {
  name: string;
  icon: string;
  count: string;
  shortDesc: string;
  actionText: string;
  primaryServiceTitle?: string;
}

const CATEGORY_CARDS_DATA: CategoryCardMeta[] = [
  {
    name: 'All Services',
    icon: 'LayoutGrid',
    count: '19 Roles',
    shortDesc: 'Complete catalog of all creative, video, social & coding specializations.',
    actionText: 'View All 19 Roles',
  },
  {
    name: 'Graphic Design',
    icon: 'Palette',
    count: '16 Roles',
    shortDesc: 'Brand identities, logos, marketing collateral, social creatives & UI/UX.',
    actionText: 'View 16 Roles',
    primaryServiceTitle: 'Graphic Designer',
  },
  {
    name: 'Video Editing',
    icon: 'Video',
    count: '1 Role',
    shortDesc: 'Cinematic video editing, high-retention Reels, Shorts & promo videos.',
    actionText: 'View Video Role',
    primaryServiceTitle: 'Video Editor',
  },
  {
    name: 'Social Media',
    icon: 'Share2',
    count: '1 Role',
    shortDesc: 'Strategic social media management, content planning & brand growth.',
    actionText: 'View Social Role',
    primaryServiceTitle: 'Social Media Manager',
  },
  {
    name: 'Additional',
    icon: 'Sparkles',
    count: '1 Role',
    shortDesc: 'Modern vibe coding, rapid interactive prototyping & creative workflows.',
    actionText: 'View Coding Role',
    primaryServiceTitle: 'Vibe Coder',
  },
];

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState<string>('All Services');
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<DetailedService | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Filter services by category
  const filteredServices = getServicesByCategory(activeTab as ServiceCategory | 'All Services');

  // Featured services list
  const featuredServices = SERVICES_LIST.filter((s) =>
    FEATURED_SERVICE_TITLES.includes(s.title as any)
  );

  const handleOpenServiceDetail = useCallback((serviceOrIdentifier: DetailedService | string) => {
    if (!serviceOrIdentifier) return;
    if (typeof serviceOrIdentifier === 'string') {
      const found = getServiceById(serviceOrIdentifier) || getServiceByTitle(serviceOrIdentifier);
      if (found) {
        setSelectedServiceDetail(found);
      }
    } else {
      setSelectedServiceDetail(serviceOrIdentifier);
    }
  }, []);

  const handleGetQuote = (serviceTitle: string) => {
    window.dispatchEvent(
      new CustomEvent('select-service-enquiry', {
        detail: { serviceTitle }
      })
    );
    const element = document.getElementById('contact');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Smooth category select with guaranteed scroll to categorized results
  const handleCategorySelect = useCallback((categoryName: string, shouldScroll = true) => {
    setActiveTab(categoryName);
    if (shouldScroll) {
      setTimeout(() => {
        const target = document.getElementById('active-category-bar') || document.getElementById('services-grid');
        if (target) {
          const headerOffset = window.innerWidth < 768 ? 70 : 85;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, []);

  // Main "Explore All Categories" action handler
  const handleExploreAllCategories = useCallback((shouldScroll = true) => {
    setActiveTab('All Services');
    if (shouldScroll) {
      setTimeout(() => {
        const target = document.getElementById('all-categories-section');
        if (target) {
          const headerOffset = window.innerWidth < 768 ? 70 : 85;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, []);

  // Sync with URL hashes if user navigates to specific category or section
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#all-categories' || hash === '#all-categories-section') {
        handleExploreAllCategories(true);
      } else if (hash.includes('graphic-design')) {
        handleCategorySelect('Graphic Design', true);
      } else if (hash.includes('video-editing')) {
        handleCategorySelect('Video Editing', true);
      } else if (hash.includes('social-media')) {
        handleCategorySelect('Social Media', true);
      } else if (hash.includes('vibe-coder') || hash.includes('additional')) {
        handleCategorySelect('Additional', true);
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, [handleExploreAllCategories, handleCategorySelect]);

  return (
    <section id="services" className="py-20 md:py-24 bg-bg-primary relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ================= 1. PAGE HEADING ================= */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16" id="services-header">
          <motion.span
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent-primary font-semibold text-xs tracking-widest uppercase mb-2 block"
          >
            Capabilities & Solutions
          </motion.span>
          <motion.h2
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4"
          >
            Professional Services
          </motion.h2>
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
          >
            Graphic design, brand identity, video editing, social media management, and vibe coding solutions designed to help businesses build distinctive brands and grow their audience.
          </motion.p>
        </div>

        {/* ================= 2. FEATURED SERVICES SECTION ================= */}
        <div className="mb-20" id="featured-services-block">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-border-color">
            <div>
              <div className="flex items-center gap-2 text-accent-primary font-bold text-xs uppercase tracking-wider mb-1">
                <Icons.Sparkles className="w-3.5 h-3.5" />
                <span>Selected Highlights</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                Featured Services
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-xs sm:text-sm text-text-secondary max-w-md">
                Most requested solutions for creative graphic design, brand identity, video editing, and modern vibe coding.
              </p>
              {/* Main "Explore All Categories" button */}
              <button
                type="button"
                onClick={() => handleExploreAllCategories(true)}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-accent-primary/10 hover:bg-accent-primary text-accent-primary hover:text-white border border-accent-primary/30 transition-all duration-200 cursor-pointer active:scale-95 shadow-xs shrink-0 self-start sm:self-auto min-h-[44px]"
                id="featured-services-explore-all-btn"
                aria-label="Explore All 19 Service Categories"
              >
                <Icons.Layers className="w-3.5 h-3.5" />
                <span>Explore All Categories</span>
                <Icons.ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Compact, Modern, Professional Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" id="featured-services-grid">
            {featuredServices.map((service, index) => (
              <motion.div
                key={`feat-${service.id}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
                role="button"
                tabIndex={0}
                aria-label={`View ${service.title} details`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenServiceDetail(service);
                  }
                }}
                className="service-card group cursor-pointer"
                id={`featured-service-card-${service.id}`}
                onClick={() => handleOpenServiceDetail(service)}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    {/* Header: Icon & Category/Popular Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="service-icon w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                        <DynamicIcon name={service.iconName} className="w-5 h-5" />
                      </div>
                      <span className="popular-service-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Icons.Sparkles className="w-2.5 h-2.5" />
                        Featured
                      </span>
                    </div>

                    {/* Service Title */}
                    <h4 className="service-title text-base sm:text-lg font-bold leading-snug mb-1.5 group-hover:text-accent-primary transition-colors duration-200">
                      {service.title}
                    </h4>

                    {/* 1-Line Description */}
                    <p className="service-description text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                      {service.description}
                    </p>
                  </div>

                  {/* Card Bottom: Indicator & Actions */}
                  <div className="service-card-divider pt-3 border-t border-border-color flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenServiceDetail(service);
                      }}
                      className="learn-more text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors min-h-[38px] px-2 py-1 rounded-md"
                      id={`featured-learn-${service.id}`}
                      aria-label={`Learn more about ${service.title}`}
                    >
                      <Icons.Info className="w-3.5 h-3.5" />
                      <span>Learn More</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetQuote(service.title);
                      }}
                      className="service-quote-btn text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all duration-200 group-hover:shadow-xs min-h-[38px] active:scale-95"
                      id={`featured-quote-${service.id}`}
                      aria-label={`Get a quote for ${service.title}`}
                    >
                      <span>Quote</span>
                      <Icons.ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bridge to Explore All Categories */}
          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-bg-card border border-border-color flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                <Icons.LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-text-primary">
                  Looking for all 19 creative specializations?
                </h4>
                <p className="text-xs text-text-secondary">
                  Browse complete roles across Graphic Design, Video Editing, Social Media, and Vibe Coding.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleExploreAllCategories(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-accent-primary hover:bg-accent-secondary text-white transition-all duration-200 cursor-pointer active:scale-95 shadow-xs shrink-0 min-h-[44px]"
              id="featured-services-bottom-explore-btn"
            >
              <span>Explore All Categories</span>
              <Icons.ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= 3. EXPLORE ALL CATEGORIES SECTION ================= */}
        <div className="mb-8 scroll-mt-24" id="all-categories-section">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 pb-4 border-b border-border-color">
            <div>
              <div className="flex items-center gap-2 text-accent-primary font-bold text-xs uppercase tracking-wider mb-1">
                <Icons.Layers className="w-3.5 h-3.5" />
                <span>Comprehensive Specializations</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                Explore All Categories
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md">
              Select a category box below to filter and view all 19 professional roles and custom creative capabilities.
            </p>
          </div>

          {/* Unified Category Boxes (Same design system as Featured Services) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-10" id="category-boxes-grid">
            {CATEGORY_CARDS_DATA.map((cat, idx) => {
              const isActive = activeTab === cat.name;
              return (
                <motion.div
                  key={cat.name}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  whileHover={shouldReduceMotion ? {} : { y: -3 }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`Select ${cat.name} category (${cat.count})`}
                  onClick={() => handleCategorySelect(cat.name, true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategorySelect(cat.name, true);
                    }
                  }}
                  className={`service-card group cursor-pointer transition-all duration-200 select-none ${
                    isActive
                      ? '!border-accent-primary ring-2 ring-accent-primary/20 shadow-md'
                      : ''
                  }`}
                  id={`category-box-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      {/* Top row: Icon & Count Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                          isActive
                            ? 'bg-accent-primary text-white'
                            : 'service-icon'
                        }`}>
                          <DynamicIcon name={cat.icon} className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30 font-extrabold'
                            : 'popular-service-badge'
                        }`}>
                          {cat.count}
                        </span>
                      </div>

                      {/* Category Name */}
                      <h4 className="service-title text-sm sm:text-base font-bold mb-1 leading-snug">
                        {cat.name}
                      </h4>

                      {/* Short 1-Line Description */}
                      <p className="service-description text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
                        {cat.shortDesc}
                      </p>
                    </div>

                    {/* Bottom Status / Action Indicator */}
                    <div className="service-card-divider pt-2.5 border-t border-border-color flex items-center justify-between text-xs font-semibold gap-2 mt-auto">
                      <span className={isActive ? 'text-accent-primary font-bold' : 'text-text-muted'}>
                        {isActive ? 'Active View' : cat.actionText}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {cat.primaryServiceTitle && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenServiceDetail(cat.primaryServiceTitle!);
                            }}
                            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-accent-primary transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                            title={`Quick view ${cat.primaryServiceTitle} details`}
                            aria-label={`Quick view ${cat.primaryServiceTitle} details`}
                          >
                            <Icons.Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Icons.ArrowRight className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 ${
                          isActive ? 'text-accent-primary' : 'text-text-muted'
                        }`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Active Category Header Bar */}
          <div className="flex items-center justify-between bg-bg-card border border-border-color rounded-2xl px-5 py-3.5 mb-6 shadow-xs scroll-mt-24" id="active-category-bar">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-text-primary">
                Showing {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'} in <span className="text-accent-primary font-extrabold">{activeTab}</span>
              </span>
            </div>
            {activeTab !== 'All Services' && (
              <button
                type="button"
                onClick={() => handleCategorySelect('All Services', false)}
                className="text-xs font-bold text-accent-primary hover:underline cursor-pointer flex items-center gap-1 min-h-[36px] px-2 py-1 rounded-lg hover:bg-accent-primary/10 transition-colors"
                aria-label="Reset filter to show all services"
              >
                <span>Reset to All</span>
                <Icons.RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ================= 4. CATEGORIZED SERVICES GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" id="services-grid">
          <AnimatePresence mode="wait">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, delay: (index % 8) * 0.02 }}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
                role="button"
                tabIndex={0}
                aria-label={`View ${service.title} details`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenServiceDetail(service);
                  }
                }}
                className="service-card group cursor-pointer"
                id={`service-card-${service.id}`}
                onClick={() => handleOpenServiceDetail(service)}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    {/* Header: Icon & Category Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="service-icon w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                        <DynamicIcon name={service.iconName} className="w-5 h-5" />
                      </div>
                      <span className="service-category-badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {service.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="service-title text-base sm:text-lg font-bold leading-snug mb-1.5 group-hover:text-accent-primary transition-colors duration-200">
                      {service.title}
                    </h4>

                    {/* Short 1-Line Description */}
                    <p className="service-description text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
                      {service.description}
                    </p>

                    {/* Key features bullets */}
                    <ul className="space-y-1 mb-4">
                      {service.features.slice(0, 2).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                          <span className="service-feature-bullet w-1 h-1 rounded-full shrink-0" />
                          <span className="service-feature-text truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="service-card-divider pt-3 border-t border-border-color flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenServiceDetail(service);
                      }}
                      className="learn-more text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors min-h-[38px] px-2 py-1 rounded-md"
                      id={`service-btn-learn-${service.id}`}
                      aria-label={`Learn more about ${service.title}`}
                    >
                      <Icons.Info className="w-3.5 h-3.5" />
                      <span>Learn More</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetQuote(service.title);
                      }}
                      className="service-quote-btn text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all duration-200 group-hover:shadow-xs min-h-[38px] active:scale-95"
                      id={`service-btn-quote-${service.id}`}
                      aria-label={`Get a quote for ${service.title}`}
                    >
                      <span>Quote</span>
                      <Icons.ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state safeguard */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-text-secondary text-sm bg-bg-card rounded-2xl border border-border-color">
            No services found for this category. Please select another filter.
          </div>
        )}

        {/* ================= 5. SERVICE DETAIL MODAL ================= */}
        <ServiceDetailModal
          service={selectedServiceDetail}
          onClose={() => setSelectedServiceDetail(null)}
          onGetQuote={handleGetQuote}
        />
      </div>
    </section>
  );
}

