import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Calendar,
  User,
  Eye,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { PROJECTS_DATA, PORTFOLIO_CATEGORIES } from '../data';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useBodyScrollLock } from '../lib/scrollLock';
import { Project, PortfolioCategory } from '../types';
import creativePortfolioCoverAsset from '../assets/images/creative-portfolio-cover.jpg';
import youtubeThumbnailAsset from '../assets/images/youtube-thumbnail-portfolio.png';
import commercialVideoAsset from '../assets/images/commercial-promotional-video.jpg';

interface ProjectImageProps {
  project: Project;
  className?: string;
  imgClassName?: string;
  isModal?: boolean;
}

function ProjectImage({ project, className = '', imgClassName = '', isModal = false }: ProjectImageProps) {
  // Determine fallback chain for this project
  const fallbackSources = project.id === 'p1'
    ? [
        project.image,
        creativePortfolioCoverAsset,
        project.fallbackImage || 'https://lh3.googleusercontent.com/d/18xe8PYnr3fu4LL8KA3z8Jl-SXKdF9PNo=w1600'
      ]
    : project.id === 'p7'
    ? [
        project.image,
        youtubeThumbnailAsset,
        project.fallbackImage || 'https://lh3.googleusercontent.com/d/1voCLZkaqF_ROVJ-eK9kO9H_5DXn5F1NH=w1600'
      ]
    : project.id === 'p8'
    ? [
        project.image,
        commercialVideoAsset,
        project.fallbackImage || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'
      ]
    : [
        project.image,
        ...(project.fallbackImage ? [project.fallbackImage] : [])
      ];

  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentSrc = fallbackSources[sourceIndex] || project.image;

  const handleError = () => {
    if (sourceIndex < fallbackSources.length - 1) {
      setSourceIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div
        className={`w-full ${isModal ? 'aspect-[16/9] min-h-[220px]' : 'aspect-[4/3]'} bg-bg-secondary flex flex-col items-center justify-center p-6 text-center border-b border-border-color relative overflow-hidden ${className}`}
        id={`project-image-fallback-${project.id}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-3">
          <ImageIcon className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-accent-primary mb-1">
          {project.category}
        </span>
        <h4 className="text-sm md:text-base font-bold text-text-primary max-w-xs line-clamp-1">
          {project.title}
        </h4>
        <span className="text-xs text-text-muted mt-1">2026 Creative Portfolio</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden bg-bg-secondary/40 ${isModal ? 'aspect-[16/9]' : 'aspect-[4/3]'} ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-bg-secondary animate-pulse flex items-center justify-center z-0">
          <ImageIcon className="w-6 h-6 text-text-muted/30 animate-pulse" />
        </div>
      )}

      <img
        src={currentSrc}
        alt={`${project.title} - ${project.category} portfolio project`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        referrerPolicy="no-referrer"
        loading={isModal ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

interface CategoryThumbnailProps {
  category: PortfolioCategory;
  isActive: boolean;
}

function CategoryThumbnail({ category, isActive }: CategoryThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(category.image || '');

  if (!category.image || hasError) {
    return null;
  }

  const handleError = () => {
    if (category.fallbackImage && imgSrc !== category.fallbackImage) {
      setImgSrc(category.fallbackImage);
    } else {
      setHasError(true);
    }
  };

  return (
    <span
      className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden shrink-0 mr-2.5 border transition-all duration-300 ${
        isActive
          ? 'border-white/80 ring-2 ring-white/40 shadow-sm'
          : 'border-border-color/60 group-hover:border-accent-primary/50'
      }`}
    >
      {!isLoaded && (
        <span className="absolute inset-0 bg-bg-secondary/60 animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={category.alt || `${category.name} category`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover group-hover:scale-115 transition-transform duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </span>
  );
}

export default function PortfolioSection() {
  const { activeConfig } = useSiteConfig();
  const allProjects: Project[] = (activeConfig?.portfolio && activeConfig.portfolio.length > 0)
    ? activeConfig.portfolio
    : PROJECTS_DATA;

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const tabButtonsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useBodyScrollLock(!!selectedProject, 'portfolio-detail-modal');

  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Filter projects based on active category
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return allProjects;
    const aCat = activeCategory.toLowerCase();
    return allProjects.filter((project) => {
      const pCat = project.category.toLowerCase();
      if (aCat === 'graphic design') {
        const graphicSub = [
          'graphic design',
          'social media design',
          'packaging',
          'print design',
          'marketing design',
          'thumbnail design'
        ];
        return graphicSub.includes(pCat);
      }
      return pCat === aCat;
    });
  }, [allProjects, activeCategory]);

  // Reset index & scroll active tab into view when category changes
  useEffect(() => {
    setCurrentIndex(0);
    const activeBtn = tabButtonsRef.current[activeCategory];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  // Keyboard navigation for categories & modal escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedProject) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setSelectedProject(null);
        }
      } else {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject, filteredProjects]);

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const catList = PORTFOLIO_CATEGORIES.map((c) => c.name);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (index + 1) % catList.length;
      setActiveCategory(catList[nextIdx]);
      tabButtonsRef.current[catList[nextIdx]]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (index - 1 + catList.length) % catList.length;
      setActiveCategory(catList[prevIdx]);
      tabButtonsRef.current[catList[prevIdx]]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveCategory(catList[0]);
      tabButtonsRef.current[catList[0]]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveCategory(catList[catList.length - 1]);
      tabButtonsRef.current[catList[catList.length - 1]]?.focus();
    }
  };

  // Autoplay functionality
  useEffect(() => {
    if (isHovered || filteredProjects.length <= 1 || selectedProject) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredProjects.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, filteredProjects.length, selectedProject]);

  const handlePrev = () => {
    if (filteredProjects.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? filteredProjects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (filteredProjects.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredProjects.length);
  };

  return (
    <section id="portfolio" className="py-24 bg-bg-primary relative overflow-hidden transition-colors duration-300">
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6" id="portfolio-header">
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-accent-primary font-semibold text-xs tracking-widest uppercase mb-2 block"
            >
              My Works
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-3"
            >
              Recent Work<span className="text-accent-primary">.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-text-secondary text-sm md:text-base leading-relaxed"
            >
              A selection of original brand layouts, motion marketing, short social reels, and interactive mockups constructed for educational and commercial outlets.
            </motion.p>
          </div>

          {/* Controls & Behance Link */}
          <div className="flex flex-wrap items-center gap-2.5" id="portfolio-carousel-controls">
            <a
              href="https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-xs active:scale-[0.98] cursor-pointer"
              id="portfolio-behance-main-btn"
            >
              <span>View Behance Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {filteredProjects.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-lg bg-bg-card border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                  id="prev-slide-btn"
                  aria-label="Previous Project"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-9 h-9 rounded-lg bg-bg-card border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                  id="next-slide-btn"
                  aria-label="Next Project"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Categories Menu */}
        <div
          className="portfolio-filters"
          role="tablist"
          aria-label="Portfolio Category Filters"
          id="portfolio-filter-categories"
        >
          {PORTFOLIO_CATEGORIES.map((catObj, idx) => {
            const cat = catObj.name;
            const isActive = activeCategory === cat;
            const isAll = cat === 'All';

            return (
              <button
                key={cat}
                ref={(el) => {
                  tabButtonsRef.current[cat] = el;
                }}
                onClick={() => setActiveCategory(cat)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                role="tab"
                aria-selected={isActive}
                aria-controls="portfolio-slider-outer"
                tabIndex={isActive ? 0 : -1}
                className={`portfolio-filter-button group ${isActive ? 'active' : ''}`}
                id={`filter-tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {isAll ? (
                  <span
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 mr-2.5 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-accent-primary/10 text-accent-primary group-hover:bg-accent-primary/20'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <CategoryThumbnail category={catObj} isActive={isActive} />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Portfolio Carousel Slider Container */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          id="portfolio-slider-outer"
        >
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20 px-6 bg-bg-card border border-border-color rounded-2xl my-6" id="no-projects-fallback">
              <h3 className="text-base font-bold text-text-primary mb-1">No Projects Found</h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto mb-4">
                No portfolio items matched your current filter &quot;{activeCategory}&quot;.
              </p>
              <button
                onClick={() => setActiveCategory('All')}
                className="inline-flex items-center gap-2 bg-accent-primary text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-accent-secondary transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="relative" id="portfolio-slider-inner">
              {/* Desktop Slider Mode - 3 Card Grid */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-6">
                {Array.from({ length: Math.min(3, filteredProjects.length) }).map((_, stepIdx) => {
                  const projectIdx = (currentIndex + stepIdx) % filteredProjects.length;
                  const project = filteredProjects[projectIdx];
                  return (
                    <motion.div
                      key={`${project.id}-${projectIdx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setSelectedProject(project)}
                      className="bg-bg-card border border-border-color rounded-xl overflow-hidden cursor-pointer group hover:border-accent-primary/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                      id={`project-card-desktop-${project.id}`}
                    >
                      {/* Image Frame */}
                      <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/95 via-bg-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-5 z-10 pointer-events-none">
                          <span className="text-xs text-accent-primary font-semibold uppercase tracking-wider mb-1">
                            {project.category}
                          </span>
                          <h4 className="text-base font-bold text-text-primary mb-2 line-clamp-1">
                            {project.title}
                          </h4>
                          <span className="inline-flex items-center gap-1.5 bg-accent-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg self-start">
                            View Project
                            <Eye className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <ProjectImage
                          project={project}
                          imgClassName="group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Info Panel under card */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wider block mb-1.5">
                            {project.category}
                          </span>
                          <h3 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-1 mb-2">
                            {project.title}
                          </h3>
                          <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 mb-3">
                            {project.description}
                          </p>
                        </div>

                        {project.tools && project.tools.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border-color/60">
                            {project.tools.slice(0, 3).map((tool) => (
                              <span
                                key={tool}
                                className="text-[10px] font-medium text-text-secondary bg-bg-secondary px-2 py-0.5 rounded-md border border-border-color"
                              >
                                {tool}
                              </span>
                            ))}
                            {project.tools.length > 3 && (
                              <span className="text-[10px] text-text-muted self-center">
                                +{project.tools.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Tablet & Mobile Slider Mode - Single Column Horizontal Slide */}
              <div className="lg:hidden">
                <AnimatePresence mode="wait">
                  {filteredProjects[currentIndex] && (
                    <motion.div
                      key={filteredProjects[currentIndex].id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedProject(filteredProjects[currentIndex])}
                      className="bg-bg-card border border-border-color rounded-xl overflow-hidden cursor-pointer group active:scale-[0.99] transition-transform"
                      id={`project-card-mobile-${filteredProjects[currentIndex].id}`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-bg-primary/90 backdrop-blur-xs text-text-primary font-semibold text-xs px-2.5 py-1 rounded-lg border border-border-color flex items-center gap-1.5 shadow-xs">
                            <Eye className="w-3.5 h-3.5 text-accent-primary" />
                            View
                          </span>
                        </div>
                        <ProjectImage
                          project={filteredProjects[currentIndex]}
                        />
                      </div>
                      <div className="p-4 sm:p-5">
                        <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wider block mb-1">
                          {filteredProjects[currentIndex].category}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1 line-clamp-1">
                          {filteredProjects[currentIndex].title}
                        </h3>
                        <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 mb-3">
                          {filteredProjects[currentIndex].description}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border-color">
                          <span className="text-xs text-text-muted font-medium">Tap to view details</span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-primary">
                            Details &rarr;
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mobile Previous / Next Touch Buttons */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredProjects.length - 1))}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-bg-card border border-border-color text-text-primary hover:text-accent-primary flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                    aria-label="Previous project"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-bold text-text-muted">
                    {currentIndex + 1} of {filteredProjects.length}
                  </span>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % filteredProjects.length)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-bg-card border border-border-color text-text-primary hover:text-accent-primary flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                    aria-label="Next project"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Slider Pagination Indicators (Dots) */}
              <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8" id="carousel-dots-container">
                {filteredProjects.slice(0, 10).map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentIndex(dotIdx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer min-h-[20px] py-1 flex items-center justify-center ${
                      currentIndex === dotIdx ? 'w-8 bg-accent-primary' : 'w-2.5 bg-text-secondary/20'
                    }`}
                    id={`dot-indicator-${dotIdx}`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Project Detail Modal Portaled to document.body */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
                onClick={() => setSelectedProject(null)}
                id="project-detail-modal-bg"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-bg-primary border border-border-color rounded-2xl w-full max-w-2xl max-h-[calc(100dvh-32px)] overflow-y-auto shadow-2xl relative my-auto"
                  id="project-detail-modal-card"
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-bg-card/80 backdrop-blur-xs text-text-secondary hover:text-text-primary hover:bg-bg-secondary border border-border-color transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                    id="modal-close-btn"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Image Header */}
                  <div className="w-full aspect-[16/9] overflow-hidden relative" id="modal-project-image-container">
                    <ProjectImage
                      project={selectedProject}
                      isModal={true}
                    />
                  </div>

                  {/* Details Content */}
                  <div className="p-6 md:p-8 space-y-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs text-accent-primary font-semibold uppercase tracking-wider bg-accent-primary/10 px-2.5 py-0.5 rounded-full">
                          {selectedProject.category}
                        </span>
                        {selectedProject.date && (
                          <span className="flex items-center gap-1 text-xs text-text-secondary">
                            <Calendar className="w-3.5 h-3.5 text-accent-primary" />
                            {selectedProject.date}
                          </span>
                        )}
                        {selectedProject.client && (
                          <span className="flex items-center gap-1 text-xs text-text-secondary">
                            <User className="w-3.5 h-3.5 text-accent-primary" />
                            {selectedProject.client}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-text-primary">
                        {selectedProject.title}
                      </h3>
                    </div>

                    <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                      {selectedProject.details || selectedProject.description}
                    </p>

                    {/* Tools */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                        Tools & Technologies Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tools.map((tool) => (
                          <span
                            key={tool}
                            className="text-xs font-medium text-text-primary bg-bg-card border border-border-color px-3 py-1 rounded-lg"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-border-color flex justify-end">
                      <a
                        href={selectedProject.link || 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white font-semibold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all shadow-xs active:scale-[0.98]"
                        id="modal-view-portfolio-btn"
                      >
                        <span>View on Behance</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
