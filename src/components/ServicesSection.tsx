import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import * as Icons from 'lucide-react';
import {
  SERVICES_LIST,
  DetailedService,
  getServiceByTitle,
  getServiceById
} from '../servicesData';
import { WHATSAPP_BUSINESS_URL } from '../data';
import ServiceDetailModal from './ServiceDetailModal';
import { useSiteConfig } from '../context/SiteConfigContext';
import { StaggeredText } from './ui/staggered-text';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} aria-hidden="true" />;
}

export type CategoryFilterId =
  | 'All Services'
  | 'Graphic Design'
  | 'Branding'
  | 'Video & Motion'
  | 'Web & UI/UX'
  | 'Marketing';

interface CategoryFilterOption {
  id: CategoryFilterId;
  label: string;
}

const CATEGORY_FILTERS: CategoryFilterOption[] = [
  { id: 'All Services', label: 'All Services' },
  { id: 'Graphic Design', label: 'Graphic Design' },
  { id: 'Branding', label: 'Branding' },
  { id: 'Video & Motion', label: 'Video & Motion' },
  { id: 'Web & UI/UX', label: 'Web & UI/UX' },
  { id: 'Marketing', label: 'Marketing' },
];

// Map of the six priority featured services to their existing records
const PRIORITY_SERVICE_IDS = [
  's-gd-1',  // 1. Graphic Design -> Graphic Designer
  's-gd-2',  // 2. Branding & Brand Identity -> Brand Identity Designer
  's-gd-4',  // 3. Social Media Creatives -> Social Media Designer
  's-ve-1',  // 4. Video Editing & Motion Graphics -> Video Editor
  's-gd-16', // 5. Website Design & Development -> UI/UX Designer
  's-sm-1',  // 6. Digital Marketing -> Social Media Manager
];

// Mapping each of the 19 services to the refined category filters
const SERVICE_CATEGORY_MAP: Record<string, CategoryFilterId[]> = {
  's-gd-1': ['Graphic Design'],
  's-gd-2': ['Branding'],
  's-gd-3': ['Branding'],
  's-gd-4': ['Marketing', 'Graphic Design'],
  's-gd-5': ['Branding', 'Graphic Design'],
  's-gd-6': ['Marketing', 'Graphic Design'],
  's-gd-7': ['Graphic Design'],
  's-gd-8': ['Graphic Design', 'Branding'],
  's-gd-9': ['Video & Motion', 'Graphic Design'],
  's-gd-10': ['Video & Motion', 'Graphic Design'],
  's-gd-11': ['Graphic Design'],
  's-gd-12': ['Graphic Design', 'Marketing'],
  's-gd-13': ['Graphic Design', 'Marketing'],
  's-gd-14': ['Graphic Design'],
  's-gd-15': ['Graphic Design'],
  's-gd-16': ['Web & UI/UX'],
  's-ve-1': ['Video & Motion'],
  's-sm-1': ['Marketing'],
  's-vc-1': ['Web & UI/UX'],
};

export default function ServicesSection() {
  const { activeConfig } = useSiteConfig();
  const servicesConfig = activeConfig?.sections?.services;

  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>('All Services');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<DetailedService | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Merge CMS configured services with detailed service base
  const allServices = useMemo(() => {
    if (!activeConfig?.services || activeConfig.services.length === 0) {
      return SERVICES_LIST;
    }
    const cmsMap = new Map(activeConfig.services.map((s) => [s.id || s.title, s]));

    const updated = SERVICES_LIST.map((srv) => {
      const cmsItem = cmsMap.get(srv.id) || cmsMap.get(srv.title);
      if (cmsItem) {
        return {
          ...srv,
          title: cmsItem.title || srv.title,
          description: cmsItem.description || srv.description,
          iconName: (cmsItem as any).iconName || (cmsItem as any).icon || srv.iconName,
          features: cmsItem.features && cmsItem.features.length ? cmsItem.features : srv.features,
        };
      }
      return srv;
    });

    const existingIds = new Set(SERVICES_LIST.map((s) => s.id));
    const existingTitles = new Set(SERVICES_LIST.map((s) => s.title.toLowerCase()));

    activeConfig.services.forEach((cmsItem) => {
      if (!existingIds.has(cmsItem.id) && !existingTitles.has((cmsItem.title || '').toLowerCase())) {
        const newService: DetailedService = {
          id: cmsItem.id || `s-custom-${Math.random().toString(36).slice(2, 7)}`,
          title: cmsItem.title,
          description: cmsItem.description,
          category: 'Graphic Design',
          categories: ['Graphic Design'],
          iconName: (cmsItem as any).iconName || (cmsItem as any).icon || 'Sparkles',
          features: cmsItem.features || [],
          details: {
            introduction: cmsItem.description,
            included: cmsItem.features || [],
            suitableClients: ['Startups, business owners & creators'],
            process: ['Consultation & Scope', 'Concept & Design Draft', 'Client Review & Refinements', 'Final Delivery'],
            tools: ['Photoshop', 'Illustrator', 'Figma'],
            deliverables: ['High-res PNG, JPG, and Source Files'],
            faqs: [
              { question: 'What is the turnaround time?', answer: 'Timelines vary based on scope, typically 2-5 business days.' }
            ]
          }
        };
        updated.push(newService);
      }
    });

    return updated;
  }, [activeConfig?.services]);

  // Helper to open modal for details
  const handleOpenServiceDetail = useCallback((serviceOrIdentifier: DetailedService | string) => {
    if (!serviceOrIdentifier) return;
    if (typeof serviceOrIdentifier === 'string') {
      const found = allServices.find((s) => s.id === serviceOrIdentifier || s.title === serviceOrIdentifier) ||
        getServiceById(serviceOrIdentifier) ||
        getServiceByTitle(serviceOrIdentifier);
      if (found) {
        setSelectedServiceDetail(found);
      }
    } else {
      setSelectedServiceDetail(serviceOrIdentifier);
    }
  }, [allServices]);

  // Helper to trigger quote inquiry flow
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

  // Compute services matching active category
  const matchingServices = useMemo(() => {
    if (activeCategory === 'All Services') {
      return allServices;
    }
    return allServices.filter((s) => {
      const mapped = SERVICE_CATEGORY_MAP[s.id];
      if (mapped && mapped.includes(activeCategory)) return true;
      if (activeCategory === 'Graphic Design' && s.category === 'Graphic Design') return true;
      return false;
    });
  }, [activeCategory, allServices]);

  // Compute services to render based on initial display rule:
  // In "All Services": show 6 priority services initially, expand to all when isExpanded is true.
  // In specific category: show all matching services directly without 6-card limit.
  const displayedServices = useMemo(() => {
    if (activeCategory === 'All Services') {
      if (isExpanded) {
        // Return priority services first, followed by the rest
        const priorityServices = PRIORITY_SERVICE_IDS.map((id) =>
          allServices.find((s) => s.id === id)
        ).filter(Boolean) as DetailedService[];

        const remainingServices = allServices.filter(
          (s) => !PRIORITY_SERVICE_IDS.includes(s.id)
        );

        return [...priorityServices, ...remainingServices];
      }
      // Initial 6 priority services
      const initialPriority = PRIORITY_SERVICE_IDS.map((id) =>
        allServices.find((s) => s.id === id)
      ).filter(Boolean) as DetailedService[];

      if (initialPriority.length === 0) {
        return allServices.slice(0, 6);
      }
      return initialPriority;
    }

    return matchingServices;
  }, [activeCategory, isExpanded, matchingServices, allServices]);

  // Counts for each category filter badge
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilterId, number> = {
      'All Services': allServices.length,
      'Graphic Design': 0,
      'Branding': 0,
      'Video & Motion': 0,
      'Web & UI/UX': 0,
      'Marketing': 0,
    };

    allServices.forEach((s) => {
      const mapped = SERVICE_CATEGORY_MAP[s.id] || [];
      mapped.forEach((cat) => {
        if (counts[cat] !== undefined) {
          counts[cat] += 1;
        }
      });
    });

    return counts;
  }, [allServices]);

  // Handle category selection
  const handleCategoryClick = useCallback((categoryId: CategoryFilterId) => {
    setActiveCategory(categoryId);
    // When switching categories, reset expansion state
    setIsExpanded(false);
  }, []);

  // Handle Toggle View All / Show Less without disruptive jump
  const handleToggleExpand = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
      // Smoothly return user to the top of the services grid container
      const gridContainer = document.getElementById('services-grid-container');
      if (gridContainer) {
        const offset = 90;
        const top = gridContainer.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    } else {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  // Support URL hash navigation
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash.toLowerCase();
      if (!hash) return;

      if (hash.includes('graphic')) {
        setActiveCategory('Graphic Design');
      } else if (hash.includes('brand')) {
        setActiveCategory('Branding');
      } else if (hash.includes('video') || hash.includes('motion')) {
        setActiveCategory('Video & Motion');
      } else if (hash.includes('web') || hash.includes('ui') || hash.includes('vibe') || hash.includes('additional')) {
        setActiveCategory('Web & UI/UX');
      } else if (hash.includes('market') || hash.includes('social')) {
        setActiveCategory('Marketing');
      } else if (hash === '#services' || hash === '#all-services') {
        setActiveCategory('All Services');
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  if (servicesConfig && servicesConfig.isVisible === false) {
    return null;
  }

  return (
    <section
      id="services"
      className="py-20 md:py-24 bg-bg-primary relative overflow-hidden transition-colors duration-300"
      aria-label="Services and capabilities"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ================= 1. FEATURED SERVICES (HEADER & INTRO) ================= */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-14" id="services-header">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-bold uppercase tracking-wider mb-3"
          >
            <Icons.Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{servicesConfig?.badge || 'Featured Services'}</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4"
          >
            <StaggeredText
              text={servicesConfig?.title || 'My Creative Services'}
              as="span"
              segmentBy="words"
              delay={50}
              duration={0.5}
              direction="bottom"
              blur={true}
              staggerDirection="forward"
              respectReducedMotion={true}
            />
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
          >
            {servicesConfig?.subtitle || 'Comprehensive graphic design, brand identity, video editing, social media management, and web design solutions tailored for brands seeking distinctive visual impact.'}
          </motion.p>
        </div>

        {/* ================= 2. CATEGORY FILTERS ================= */}
        <div className="mb-6" id="services-filter-bar">
          <div
            className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-2 px-1 -mx-4 sm:mx-0 px-4 sm:px-0 scroll-smooth"
            role="tablist"
            aria-label="Filter services by category"
          >
            {CATEGORY_FILTERS.map((filter) => {
              const isActive = activeCategory === filter.id;
              const count = categoryCounts[filter.id] || 0;

              return (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  id={`service-filter-${filter.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  aria-selected={isActive}
                  aria-controls="services-grid-container"
                  onClick={() => handleCategoryClick(filter.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 border min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary select-none ${
                    isActive
                      ? 'bg-accent-primary text-white border-accent-primary shadow-xs'
                      : 'bg-bg-card text-text-secondary border-border-color hover:text-text-primary hover:border-accent-primary/40 hover:bg-bg-card/80'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-bg-primary text-text-muted border border-border-color/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= 3. SERVICES RESULT COUNT ================= */}
        <div
          className="flex items-center justify-between py-3 px-1 mb-8 border-b border-border-color/80"
          id="services-result-header"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary">
            <span className="font-extrabold text-text-primary">
              {activeCategory === 'All Services' && !isExpanded
                ? `Showing 6 of ${SERVICES_LIST.length} Services`
                : `${displayedServices.length} ${displayedServices.length === 1 ? 'Service' : 'Services'}`}
            </span>
            <span className="text-text-muted">•</span>
            <span className="text-accent-primary font-semibold">
              {activeCategory}
            </span>
          </div>

          {activeCategory !== 'All Services' && (
            <button
              type="button"
              onClick={() => handleCategoryClick('All Services')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-primary hover:text-accent-secondary transition-colors cursor-pointer min-h-[36px] px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              aria-label="Reset filter to view all services"
            >
              <span>Reset to All</span>
              <Icons.RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ================= 4. SERVICE-CARD GRID ================= */}
        <div
          id="services-grid-container"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedServices.map((service, index) => {
              const isPriority = PRIORITY_SERVICE_IDS.includes(service.id);

              return (
                <motion.article
                  key={service.id}
                  layout={!shouldReduceMotion}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, delay: shouldReduceMotion ? 0 : Math.min(index * 0.03, 0.2) }}
                  className="service-card group flex flex-col justify-between h-full bg-bg-card border border-border-color rounded-2xl p-6 transition-all duration-200 shadow-xs focus-within:ring-2 focus-within:ring-accent-primary"
                  id={`service-card-${service.id}`}
                >
                  <div>
                    {/* Header: Icon & Category Badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="service-icon w-11 h-11 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                        <DynamicIcon name={service.iconName} className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {isPriority && activeCategory === 'All Services' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/25">
                            <Icons.Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                            <span>Featured</span>
                          </span>
                        )}
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-bg-secondary text-text-secondary border border-border-color">
                          {service.category}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="service-title text-lg sm:text-xl font-bold text-text-primary tracking-tight mb-2 group-hover:text-accent-primary transition-colors leading-snug">
                      {service.title}
                    </h3>

                    {/* Short Description (Strict 2-line clamp) */}
                    <p className="service-description text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed mb-4">
                      {service.description}
                    </p>

                    {/* Key Features (Maximum 3) */}
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-1.5 mb-5" aria-label="Key features">
                        {service.features.slice(0, 3).map((feature, fIdx) => (
                          <li
                            key={fIdx}
                            className="flex items-center gap-2 text-xs text-text-secondary"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-accent-primary/75 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="truncate">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Actions Aligned at Bottom */}
                  <div className="service-card-divider pt-4 border-t border-border-color/80 flex items-center justify-between gap-3 mt-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenServiceDetail(service)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent-primary py-2 px-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                      id={`service-learn-btn-${service.id}`}
                      aria-label={`View full details for ${service.title}`}
                    >
                      <Icons.Info className="w-4 h-4" aria-hidden="true" />
                      <span>View Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGetQuote(service.title)}
                      className="inline-flex items-center justify-center gap-1.5 bg-accent-primary hover:bg-accent-secondary text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
                      id={`service-quote-btn-${service.id}`}
                      aria-label={`Get a quote for ${service.title}`}
                    >
                      <span>Get a Quote</span>
                      <Icons.ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty Category Fallback */}
        {displayedServices.length === 0 && (
          <div className="text-center py-14 px-4 bg-bg-card border border-border-color rounded-2xl">
            <Icons.Layers className="w-8 h-8 text-text-muted mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-base font-bold text-text-primary mb-1">
              No services found in this category
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Try selecting another category or view all creative solutions.
            </p>
            <button
              type="button"
              onClick={() => handleCategoryClick('All Services')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-bold hover:bg-accent-secondary transition-colors cursor-pointer min-h-[44px]"
            >
              <span>View All Services</span>
            </button>
          </div>
        )}

        {/* ================= 5. VIEW ALL / SHOW LESS CONTROL ================= */}
        {activeCategory === 'All Services' && SERVICES_LIST.length > PRIORITY_SERVICE_IDS.length && (
          <div className="mt-12 text-center" id="services-expand-control">
            <button
              type="button"
              onClick={handleToggleExpand}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-bg-card hover:bg-accent-primary text-text-primary hover:text-white border border-border-color hover:border-accent-primary transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              id="services-toggle-view-all-btn"
              aria-expanded={isExpanded}
              aria-controls="services-grid-container"
            >
              <span>
                {isExpanded
                  ? 'Show Less'
                  : `View All Services (${SERVICES_LIST.length})`}
              </span>
              {isExpanded ? (
                <Icons.ChevronUp className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Icons.ChevronDown className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        {/* ================= 6. CUSTOM PROJECT CTA ================= */}
        <div
          className="mt-16 md:mt-20 p-6 sm:p-8 md:p-10 rounded-2xl bg-bg-card border border-border-color shadow-xs relative overflow-hidden"
          id="custom-project-cta"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-accent-primary uppercase tracking-wider mb-2">
                <Icons.Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Tailored Solutions</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
                Need Something Custom?
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Tell me about your requirements and receive a custom solution and quotation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleGetQuote('Custom Project')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-accent-primary hover:bg-accent-secondary text-white font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                id="custom-project-start-btn"
              >
                <span>Start a Project</span>
                <Icons.ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href={WHATSAPP_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-bg-primary hover:bg-bg-secondary text-text-primary hover:text-accent-primary border border-border-color hover:border-accent-primary/40 font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                id="custom-project-whatsapp-btn"
              >
                <Icons.MessageSquare className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* ================= SERVICE DETAIL MODAL ================= */}
        <ServiceDetailModal
          service={selectedServiceDetail}
          onClose={() => setSelectedServiceDetail(null)}
          onGetQuote={handleGetQuote}
        />
      </div>
    </section>
  );
}
