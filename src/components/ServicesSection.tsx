import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import * as Icons from 'lucide-react';
import {
  SERVICES_LIST,
  SERVICE_CATEGORIES,
  ALL_CATEGORY_FILTERS,
  FEATURED_SERVICE_TITLES,
  DetailedService,
  getServicesByCategory
} from '../servicesData';
import { ServiceCategory } from '../types';
import ServiceDetailModal from './ServiceDetailModal';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
}

// Category metadata with icons and role count
const CATEGORY_CARDS_DATA = [
  {
    name: 'All Services',
    icon: 'LayoutGrid',
    count: '19 Roles',
    shortDesc: 'Complete catalog of all creative, video, social & coding specializations.',
  },
  {
    name: 'Graphic Design',
    icon: 'Palette',
    count: '16 Roles',
    shortDesc: 'Brand identities, logos, marketing collateral, social creatives & UI/UX.',
  },
  {
    name: 'Video Editing',
    icon: 'Video',
    count: '1 Role',
    shortDesc: 'Cinematic video editing, high-retention Reels, Shorts & promo videos.',
  },
  {
    name: 'Social Media',
    icon: 'Share2',
    count: '1 Role',
    shortDesc: 'Strategic social media management, content planning & brand growth.',
  },
  {
    name: 'Additional',
    icon: 'Sparkles',
    count: '1 Role',
    shortDesc: 'Modern vibe coding, rapid interactive prototyping & creative workflows.',
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

  return (
    <section id="services" className="py-20 md:py-24 bg-bg-primary relative overflow-hidden transition-colors duration-300">
      {/* Background ambient lighting decoration */}
      <div className="absolute top-1/4 -right-24 w-80 h-80 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-80 h-80 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ================= 1. PAGE HEADING ================= */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16" id="services-header">
          <motion.span
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent-primary font-bold text-xs uppercase tracking-widest bg-accent-primary/10 border border-accent-primary/20 px-3.5 py-1.5 rounded-full inline-block mb-3.5"
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
            className="text-text-secondary text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          >
            Graphic design, brand identity, video editing, social media management, and vibe coding solutions designed to help businesses build distinctive brands and grow their audience.
          </motion.p>
        </div>

        {/* ================= 2. FEATURED SERVICES SECTION ================= */}
        <div className="mb-20" id="featured-services-block">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 pb-4 border-b border-border-color">
            <div>
              <div className="flex items-center gap-2 text-accent-primary font-bold text-xs uppercase tracking-wider mb-1">
                <Icons.Sparkles className="w-3.5 h-3.5" />
                <span>Selected Highlights</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                Featured Services
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md">
              Most requested solutions for creative graphic design, brand identity, video editing, and modern vibe coding.
            </p>
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
                className="service-card group cursor-pointer"
                id={`featured-service-card-${service.id}`}
                onClick={() => setSelectedServiceDetail(service)}
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
                        setSelectedServiceDetail(service);
                      }}
                      className="learn-more text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      id={`featured-learn-${service.id}`}
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
                      className="service-quote-btn text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all duration-200 group-hover:shadow-sm"
                      id={`featured-quote-${service.id}`}
                    >
                      <span>Quote</span>
                      <Icons.ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ================= 3. EXPLORE ALL CATEGORIES SECTION ================= */}
        <div className="mb-8" id="all-categories-section">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-10" id="category-boxes-grid">
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
                  onClick={() => setActiveTab(cat.name)}
                  className={`service-card group cursor-pointer transition-all duration-200 ${
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

                    {/* Bottom Status / Indicator */}
                    <div className="service-card-divider pt-2.5 border-t border-border-color flex items-center justify-between text-xs font-semibold">
                      <span className={isActive ? 'text-accent-primary font-bold' : 'text-text-muted'}>
                        {isActive ? 'Active View' : 'Click to Filter'}
                      </span>
                      <Icons.ArrowRight className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 ${
                        isActive ? 'text-accent-primary' : 'text-text-muted'
                      }`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Active Category Header Bar */}
          <div className="flex items-center justify-between bg-bg-card border border-border-color rounded-2xl px-5 py-3.5 mb-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-text-primary">
                Showing {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'} in <span className="text-accent-primary font-extrabold">{activeTab}</span>
              </span>
            </div>
            {activeTab !== 'All Services' && (
              <button
                onClick={() => setActiveTab('All Services')}
                className="text-xs font-bold text-accent-primary hover:underline cursor-pointer flex items-center gap-1"
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
                className="service-card group cursor-pointer"
                id={`service-card-${service.id}`}
                onClick={() => setSelectedServiceDetail(service)}
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
                          <span className="service-feature-bullet w-1 h-1 rounded-full flex-shrink-0" />
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
                        setSelectedServiceDetail(service);
                      }}
                      className="learn-more text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      id={`service-btn-learn-${service.id}`}
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
                      className="service-quote-btn text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all duration-200 group-hover:shadow-sm"
                      id={`service-btn-quote-${service.id}`}
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

