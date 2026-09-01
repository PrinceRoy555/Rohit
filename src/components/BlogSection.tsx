import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Layers,
  Settings,
  X,
  BookOpen
} from 'lucide-react';
import { Insight } from '../types';
import { fetchInsights } from '../services/firebase/firestore';
import { INITIAL_INSIGHTS } from '../insightsData';

interface BlogSectionProps {
  onSelectInsight?: (insight: Insight) => void;
  onOpenAdmin?: () => void;
}

export default function BlogSection({ onSelectInsight, onOpenAdmin }: BlogSectionProps) {
  const [insights, setInsights] = useState<Insight[]>(INITIAL_INSIGHTS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Fetch published insights from Firestore
  useEffect(() => {
    let isMounted = true;
    fetchInsights(false).then((data) => {
      if (isMounted && data && data.length > 0) {
        setInsights(data);
      }
    }).catch((err) => {
      console.warn('Using initial insights data:', err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Distinct categories
  const categories = ['All', ...Array.from(new Set(insights.map((i) => i.category)))];

  // Filtered insights
  const filteredInsights = insights.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const displayedInsights = filteredInsights.slice(0, visibleCount);

  return (
    <section className="py-24 bg-bg-primary relative overflow-hidden transition-colors duration-300" id="blog">
      {/* Background radial soft colors */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-primary/3 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12" id="blog-header">
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-accent-primary font-bold text-xs uppercase tracking-widest bg-accent-primary/10 px-3.5 py-1.5 rounded-full inline-block"
            >
              My Writings & Industry Breakdowns
            </motion.span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4"
          >
            Latest Insights
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-base leading-relaxed max-w-2xl mx-auto"
          >
            Practical workflow secrets, visual psychology principles, and AI design systems to boost pacing and double client content performance.
          </motion.p>
        </div>

        {/* Filter and Search Controls */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Chips */}
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

          {/* Search Input & Admin Trigger */}
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
                className="p-2.5 rounded-full bg-bg-card border border-border-color hover:border-accent-primary/40 text-text-secondary hover:text-accent-primary transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3.5"
                id="open-cms-admin-btn"
              >
                <Layers className="w-3.5 h-3.5 text-accent-primary" />
                <span className="hidden sm:inline">Manage CMS</span>
              </button>
            )}
          </div>
        </div>

        {/* Blog Cards Grid */}
        {displayedInsights.length === 0 ? (
          <div className="bg-bg-card border border-border-color rounded-3xl p-12 text-center text-text-secondary max-w-lg mx-auto">
            <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-40 text-accent-primary" />
            <h3 className="text-base font-bold text-text-primary mb-1">No insights found</h3>
            <p className="text-xs text-text-secondary mb-4">
              There are no published articles matching "{searchQuery}" in category "{selectedCategory}".
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="text-xs font-bold text-accent-primary hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="blog-grid">
            {displayedInsights.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => onSelectInsight && onSelectInsight(post)}
                className="bg-bg-card border border-border-color hover:border-accent-primary/30 rounded-3xl overflow-hidden cursor-pointer group flex flex-col justify-between shadow-sm transition-all duration-300"
                id={`blog-card-${post.slug || post.id}`}
              >
                {/* Image Frame with hover zoom */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <div className="absolute top-4 left-4 bg-bg-primary/90 backdrop-blur-md text-accent-primary text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full border border-border-color z-10">
                    {post.category}
                  </div>
                  {post.isAiGenerated && (
                    <div className="absolute top-4 right-4 bg-bg-primary/90 backdrop-blur-md text-sky-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-sky-500/20 z-10 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Insight
                    </div>
                  )}
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Blog Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date and Time Info Row */}
                    <div className="flex items-center gap-4 text-text-secondary text-xs font-semibold mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent-primary" />
                        {post.publishDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-accent-primary" />
                        {post.readingTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent-primary transition-colors duration-200 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.shortDescription}
                    </p>
                  </div>

                  {/* Read Article Trigger */}
                  <div className="pt-4 border-t border-border-color/60 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-text-secondary group-hover:text-accent-primary transition-colors">
                      Read Full Article
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                    <span className="text-[11px] text-text-secondary font-medium">
                      By {post.author || 'Rohit Verma'}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Load More Pagination */}
        {filteredInsights.length > visibleCount && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="bg-bg-card hover:bg-bg-secondary border border-border-color hover:border-accent-primary/40 text-text-primary text-xs font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
            >
              Load More Insights ({filteredInsights.length - visibleCount} remaining)
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
