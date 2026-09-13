import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  BookOpen,
  Layers,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Insight } from '../types';
import { fetchInsights } from '../services/firebase/firestore';
import {
  getCategoryFallbackCover,
  GENERAL_DEFAULT_COVER
} from '../utils/insightImage';

const ROTATING_SUBTITLES = [
  'Practical creative workflows, visual psychology principles, and AI-powered design systems for better content.',
  'Actionable ideas for stronger branding, engaging visuals, and more effective digital experiences.',
  'Explore design processes, video-editing techniques, and creative strategies built for modern brands.',
  'Simple insights to improve visual communication, content quality, and client-focused creative work.'
];

interface BlogSectionProps {
  isFullPage?: boolean;
  onSelectInsight?: (insight: Insight) => void;
  onOpenAdmin?: () => void;
  onViewAll?: () => void;
}

/**
 * Helper to safely extract a numeric timestamp from publishDate or createdDate for sorting
 */
function getArticleTimestamp(item: Insight): number {
  if (item.publishDate) {
    const parsed = Date.parse(item.publishDate);
    if (!isNaN(parsed)) return parsed;
  }
  if (item.createdDate) {
    const parsed = Date.parse(item.createdDate);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

/**
 * Individual skeleton placeholder to prevent layout shifts during article fetching
 */
function InsightCardSkeleton() {
  return (
    <div
      className="bg-bg-card border border-border-color rounded-3xl overflow-hidden flex flex-col justify-between h-full animate-pulse shadow-sm min-h-[460px]"
      aria-hidden="true"
    >
      <div className="relative aspect-[16/10] w-full bg-border-color/30">
        <div className="absolute top-4 left-4 h-6 w-24 bg-border-color/60 rounded-full" />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="h-4 w-24 bg-border-color/40 rounded" />
            <div className="h-4 w-16 bg-border-color/40 rounded" />
          </div>
          <div className="h-6 w-5/6 bg-border-color/60 rounded mb-2" />
          <div className="h-6 w-3/4 bg-border-color/60 rounded mb-4" />
          <div className="space-y-2 mb-6">
            <div className="h-3.5 w-full bg-border-color/30 rounded" />
            <div className="h-3.5 w-full bg-border-color/30 rounded" />
            <div className="h-3.5 w-2/3 bg-border-color/30 rounded" />
          </div>
        </div>
        <div className="pt-4 border-t border-border-color/60 flex items-center justify-between">
          <div className="h-4 w-28 bg-border-color/40 rounded" />
          <div className="h-3.5 w-20 bg-border-color/30 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Article Card component with robust 3-tier image fallback:
 * 1. Valid manually uploaded post.featuredImage
 * 2. Category-based local default image (with content keyword fallback)
 * 3. General local fallback image
 */
interface ArticleCardProps {
  post: Insight;
  idx: number;
  onSelectInsight?: (insight: Insight) => void;
  priority?: boolean;
}

function ArticleCard({ post, idx, onSelectInsight, priority = false }: ArticleCardProps) {
  const manualImage = (post.featuredImage || (post as any).imageUrl || (post as any).image || '').trim();
  const categoryCover = useMemo(() => getCategoryFallbackCover(post), [post.category, post.title, post.shortDescription]);

  // Track fallback progression: 'manual' -> 'category' -> 'default' -> 'failed'
  const [imgStage, setImgStage] = useState<'manual' | 'category' | 'default' | 'failed'>(
    manualImage ? 'manual' : 'category'
  );

  // Automatically reset image state when post or its image/category changes
  useEffect(() => {
    const hasManual = Boolean(
      (post.featuredImage || (post as any).imageUrl || (post as any).image || '').trim()
    );
    setImgStage(hasManual ? 'manual' : 'category');
  }, [post.id, post.featuredImage, (post as any).imageUrl, post.category]);

  const handleImageError = () => {
    setImgStage((prev) => {
      if (prev === 'manual') return 'category';
      if (prev === 'category') return 'default';
      return 'failed';
    });
  };

  let currentSrc: string | null = null;
  if (imgStage === 'manual') {
    currentSrc = manualImage;
  } else if (imgStage === 'category') {
    currentSrc = categoryCover;
  } else if (imgStage === 'default') {
    currentSrc = GENERAL_DEFAULT_COVER;
  } else {
    currentSrc = null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelectInsight) {
      onSelectInsight(post);
    }
  };

  return (
    <article
      className="group relative bg-bg-card border border-border-color hover:border-accent-primary/40 rounded-3xl overflow-hidden flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-offset-2 focus-within:ring-offset-bg-primary select-text"
      id={`blog-card-${post.slug || post.id}`}
    >
      {/* Media Frame with reserved 16:10 aspect ratio to prevent CLS */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg-secondary">
        <div className="absolute top-4 left-4 bg-bg-primary/95 backdrop-blur-md text-accent-primary text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full border border-border-color z-10 shadow-sm pointer-events-none">
          {post.category || 'Graphic Design'}
        </div>

        {post.isAiGenerated && (
          <div className="absolute top-4 right-4 bg-bg-primary/95 backdrop-blur-md text-sky-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-500/20 z-10 flex items-center gap-1 pointer-events-none">
            <Sparkles className="w-3 h-3" />
            <span>AI Insight</span>
          </div>
        )}

        {currentSrc ? (
          <img
            src={currentSrc}
            alt={`Cover image for ${post.title || 'article'}`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-bg-secondary text-text-secondary/60 p-4 text-center">
            <BookOpen className="w-8 h-8 mb-2 opacity-50 text-accent-primary" />
            <span className="text-xs font-semibold">{post.category || 'Article'}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Date & Reading Time */}
          <div className="flex items-center gap-4 text-text-secondary text-xs font-semibold mb-3">
            {post.publishDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent-primary" aria-hidden="true" />
                <span>{post.publishDate}</span>
              </span>
            )}
            {post.readingTime && post.readingTime.trim() !== '' && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent-primary" aria-hidden="true" />
                <span>{post.readingTime}</span>
              </span>
            )}
          </div>

          {/* Title with accessible stretched link */}
          <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent-primary transition-colors duration-200 line-clamp-2 leading-snug">
            <a
              href={`/insights/${post.slug}`}
              onClick={handleClick}
              className="focus:outline-none after:absolute after:inset-0"
              aria-label={`Read article: ${post.title}`}
            >
              {post.title}
            </a>
          </h3>

          {/* Excerpt */}
          <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-3">
            {post.shortDescription}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-4 border-t border-border-color/60 flex items-center justify-between text-xs font-semibold mt-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary group-hover:text-accent-primary transition-colors">
            <span>Read Full Article</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" aria-hidden="true" />
          </span>
          <span className="text-[11px] text-text-secondary font-medium">
            By {post.author || 'Rohit Verma'}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function BlogSection({
  isFullPage = false,
  onSelectInsight,
  onOpenAdmin,
  onViewAll
}: BlogSectionProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Subtitle rotation states
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [isSubtitlePaused, setIsSubtitlePaused] = useState(false);
  const [isTabInactive, setIsTabInactive] = useState(false);

  // Respect system reduced motion preferences
  const shouldReduceMotion = useReducedMotion();

  // Full page controls
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visiblePageCount, setVisiblePageCount] = useState<number>(6);

  // 1. Data Fetching
  const loadPublishedArticles = useCallback(async (isMountedCheck?: () => boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInsights(false);
      if (isMountedCheck && !isMountedCheck()) return;
      // Strictly enforce published status & newest-first real publication date sorting
      const published = (data || [])
        .filter((item) => item.status === 'published')
        .sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));

      setInsights(published);
    } catch (err) {
      if (isMountedCheck && !isMountedCheck()) return;
      console.warn('[Latest Insights] Failed to retrieve articles:', err);
      setError('Unable to load articles right now. Please check your connection and try again.');
    } finally {
      if (!isMountedCheck || isMountedCheck()) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkMounted = () => isMounted;

    loadPublishedArticles(checkMounted);

    // Listen for real-time CMS mutations (publish/unpublish/create/delete)
    const handleCmsUpdate = () => {
      if (isMounted) {
        loadPublishedArticles(checkMounted);
      }
    };

    window.addEventListener('insights-updated', handleCmsUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('insights-updated', handleCmsUpdate);
    };
  }, [loadPublishedArticles]);

  // 2. Tab Visibility Listener for Subtitle & Carousel Pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabInactive(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 3. Subtitle Rotation Timer (5 seconds)
  useEffect(() => {
    if (shouldReduceMotion || isSubtitlePaused || isTabInactive) return;

    const interval = setInterval(() => {
      setCurrentSubtitleIndex((prev) => (prev + 1) % ROTATING_SUBTITLES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion, isSubtitlePaused, isTabInactive]);

  // Filter logic for full page view
  const categories = ['All', ...Array.from(new Set(insights.map((i) => i.category || 'General')))];

  const filteredInsights = insights.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const fullPageDisplayed = filteredInsights.slice(0, visiblePageCount);

  return (
    <section
      className="py-20 md:py-24 bg-bg-primary relative overflow-hidden transition-colors duration-300"
      id="blog"
      aria-labelledby="latest-insights-heading"
    >
      {/* Background ambient radial highlight */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-primary/3 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12" id="blog-header">
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-accent-primary font-bold text-xs uppercase tracking-widest bg-accent-primary/10 px-3.5 py-1.5 rounded-full inline-block"
            >
              My Writings & Industry Breakdowns
            </motion.span>
          </div>

          <motion.h2
            id="latest-insights-heading"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4"
          >
            Latest Insights
          </motion.h2>

          {/* 
            Rotating Subtitle Container:
            - Min height reserved to eliminate layout shifts (CLS = 0)
            - Pauses on hover and keyboard focus
            - Screen readers are not repeatedly interrupted (static text for SR, visual rotator marked aria-hidden)
            - If prefers-reduced-motion is true: renders static primary subtitle
          */}
          <p className="sr-only">
            {ROTATING_SUBTITLES[0]}
          </p>

          <div
            onMouseEnter={() => setIsSubtitlePaused(true)}
            onMouseLeave={() => setIsSubtitlePaused(false)}
            onFocus={() => setIsSubtitlePaused(true)}
            onBlur={() => setIsSubtitlePaused(false)}
            tabIndex={0}
            aria-label="Insights overview topics. Hover or focus to pause rotation."
            className="min-h-[4.5rem] sm:min-h-[3.25rem] md:min-h-[2.75rem] flex items-center justify-center px-2 outline-none focus-visible:ring-1 focus-visible:ring-accent-primary/40 rounded-xl transition-all"
          >
            {shouldReduceMotion ? (
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                {ROTATING_SUBTITLES[0]}
              </p>
            ) : (
              <div aria-hidden="true" className="w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentSubtitleIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
                  >
                    {ROTATING_SUBTITLES[currentSubtitleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Full Page Controls: Search and Categories (when isFullPage) */}
        {isFullPage && (
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCategory === cat
                      ? 'bg-accent-primary text-white border-accent-primary shadow-sm'
                      : 'bg-bg-card text-text-secondary border-border-color hover:border-accent-primary/30 hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar & Admin CMS Button */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search insights..."
                  className="w-full bg-bg-card border border-border-color rounded-full pl-10 pr-4 py-2 text-base sm:text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  title="Open Insights CMS & AI Hub"
                  className="p-2.5 rounded-full bg-bg-card border border-border-color hover:border-accent-primary/40 text-text-secondary hover:text-accent-primary transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5"
                  id="open-cms-admin-btn"
                >
                  <Layers className="w-3.5 h-3.5 text-accent-primary" />
                  <span className="hidden sm:inline">Manage CMS</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 
          Main Content States:
          1. Loading skeleton cards
          2. Error state with retry
          3. Empty state ("Insights Coming Soon")
          4. Carousel (on homepage) or Paginated Grid (on full page)
        */}
        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            id="insights-loading-skeleton"
            aria-busy="true"
          >
            <InsightCardSkeleton />
            <InsightCardSkeleton />
            <InsightCardSkeleton />
          </div>
        ) : error && insights.length === 0 ? (
          /* Error State */
          <div
            className="bg-bg-card border border-border-color rounded-3xl p-10 md:p-12 text-center text-text-secondary max-w-lg mx-auto shadow-sm"
            role="alert"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Unable to Load Insights
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto mb-6">
              {error}
            </p>
            <button
              onClick={() => loadPublishedArticles()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent-primary text-white text-xs font-bold hover:bg-accent-secondary transition-colors cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : (isFullPage ? fullPageDisplayed : insights).length === 0 ? (
          /* Empty State */
          <div
            className="bg-bg-card border border-border-color rounded-3xl p-10 md:p-12 text-center text-text-secondary max-w-lg mx-auto shadow-sm"
            id="insights-empty-state"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 text-accent-primary flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Insights Coming Soon
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              New articles on design, branding, video editing and creative workflows will be published here soon.
            </p>
            {isFullPage && (selectedCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 text-xs font-bold text-accent-primary hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : !isFullPage ? (
          /* Homepage Static Responsive Grid (3 cards max: 3 cols desktop, 2 cols tablet, 1 col mobile) */
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            id="blog-grid"
          >
            {insights.slice(0, 3).map((post, idx) => (
              <ArticleCard
                key={post.id}
                post={post}
                idx={idx}
                onSelectInsight={onSelectInsight}
                priority={idx === 0}
              />
            ))}
          </div>
        ) : (
          /* Full Page Grid View */
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            id="blog-grid-fullpage"
          >
            {fullPageDisplayed.map((post, idx) => (
              <ArticleCard
                key={post.id}
                post={post}
                idx={idx}
                onSelectInsight={onSelectInsight}
              />
            ))}
          </div>
        )}

        {/* View All Insights Button (Homepage mode) */}
        {!isFullPage && insights.length > 0 && !loading && (
          <div className="text-center mt-12">
            <a
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                if (onViewAll) {
                  onViewAll();
                } else if (typeof window !== 'undefined') {
                  window.location.hash = 'blog';
                }
              }}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-bg-card hover:bg-bg-secondary text-text-primary border border-border-color hover:border-accent-primary/40 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-accent-primary"
              id="view-all-insights-btn"
            >
              <span>View All Insights</span>
              <ArrowRight className="w-4 h-4 text-accent-primary group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </a>
          </div>
        )}

        {/* Full Page Pagination (Load More) */}
        {isFullPage && filteredInsights.length > visiblePageCount && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisiblePageCount((prev) => prev + 6)}
              className="bg-bg-card hover:bg-bg-secondary border border-border-color hover:border-accent-primary/40 text-text-primary text-xs font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <span>Load More Insights ({filteredInsights.length - visiblePageCount} remaining)</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

