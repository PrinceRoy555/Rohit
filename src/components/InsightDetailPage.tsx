import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Tag,
  Share2,
  Check,
  Twitter,
  Linkedin,
  MessageCircle,
  Eye,
  Sparkles,
  BookOpen,
  ArrowRight,
  Send
} from 'lucide-react';
import { Insight } from '../types';
import { fetchInsights } from '../services/firebase/firestore';

interface InsightDetailPageProps {
  insight: Insight;
  onBack: () => void;
  onSelectInsight: (insight: Insight) => void;
  onOpenContact?: () => void;
}

export default function InsightDetailPage({
  insight,
  onBack,
  onSelectInsight,
  onOpenContact
}: InsightDetailPageProps) {
  const [copied, setCopied] = useState(false);
  const [relatedInsights, setRelatedInsights] = useState<Insight[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update document title for SEO
    const prevTitle = document.title;
    document.title = insight.seoTitle || `${insight.title} | Rohit Verma`;

    // Fetch related insights in same or other categories
    fetchInsights(false).then((all) => {
      const filtered = all
        .filter((i) => i.id !== insight.id && i.slug !== insight.slug)
        .sort((a, b) => (a.category === insight.category ? -1 : 1))
        .slice(0, 3);
      setRelatedInsights(filtered);
    });

    // Reading progress listener
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scrollPercent = (totalScroll / windowHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, scrollPercent)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      document.title = prevTitle;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [insight]);

  const handleCopyLink = () => {
    const url = window.location.origin + `/insights/${insight.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.origin + `/insights/${insight.slug}`);
    const text = encodeURIComponent(`Check out "${insight.title}" by Rohit Verma:`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.origin + `/insights/${insight.slug}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(window.location.origin + `/insights/${insight.slug}`);
    const text = encodeURIComponent(`Insight: ${insight.title} - ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <article className="min-h-screen bg-bg-primary text-text-primary pt-24 pb-20 relative overflow-hidden" id="insight-detail-page">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-border-color z-50">
        <div
          className="h-full bg-accent-primary transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Ambient background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-card border border-border-color hover:border-accent-primary/40 hover:text-accent-primary text-text-secondary text-sm font-semibold transition-colors cursor-pointer"
            id="insight-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Insights
          </button>

          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy Article Link"
              className="p-2 rounded-full bg-bg-card border border-border-color hover:border-accent-primary/40 text-text-secondary hover:text-accent-primary transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={handleShareTwitter}
              title="Share on X / Twitter"
              className="p-2 rounded-full bg-bg-card border border-border-color hover:text-sky-400 hover:border-sky-500/30 text-text-secondary transition-colors cursor-pointer"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareLinkedIn}
              title="Share on LinkedIn"
              className="p-2 rounded-full bg-bg-card border border-border-color hover:text-blue-500 hover:border-blue-500/30 text-text-secondary transition-colors cursor-pointer"
            >
              <Linkedin className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              className="p-2 rounded-full bg-bg-card border border-border-color hover:text-emerald-400 hover:border-emerald-500/30 text-text-secondary transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category & AI Tag */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="bg-accent-primary/10 text-accent-primary border border-accent-primary/20 px-3.5 py-1 rounded-full uppercase tracking-wider text-xs font-bold">
            {insight.category}
          </span>
          {insight.isAiGenerated && (
            <span className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              AI Synthesized & Curated
            </span>
          )}
          {insight.viewsCount !== undefined && insight.viewsCount > 0 && (
            <span className="inline-flex items-center gap-1 text-text-secondary text-xs font-medium">
              <Eye className="w-3.5 h-3.5" />
              {insight.viewsCount} views
            </span>
          )}
        </div>

        {/* Article Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary mb-6 leading-tight" id="insight-title">
          {insight.title}
        </h1>

        {/* Short Summary Lead */}
        {insight.shortDescription && (
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 font-normal border-l-4 border-accent-primary pl-4 py-1">
            {insight.shortDescription}
          </p>
        )}

        {/* Author and Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border-color mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center font-bold text-accent-primary text-sm">
              RV
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                {insight.author || 'Rohit Verma'}
                <span className="text-[10px] bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full font-semibold">Author</span>
              </div>
              <div className="text-xs text-text-secondary">Graphic Designer & Motion Artist</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-text-secondary font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent-primary" />
              {insight.publishDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent-primary" />
              {insight.readingTime || '4 min read'}
            </span>
          </div>
        </div>

        {/* Featured Cover Image */}
        {insight.featuredImage && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-12 border border-border-color shadow-lg">
            <img
              src={insight.featuredImage}
              alt={insight.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Markdown Content Frame */}
        <div className="prose prose-invert max-w-none text-text-secondary text-base md:text-lg leading-relaxed space-y-6 mb-12" id="insight-content-body">
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mt-10 mb-4 tracking-tight border-b border-border-color pb-2" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-8 mb-3 tracking-tight" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-text-secondary leading-relaxed mb-5" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-outside pl-6 space-y-2 mb-6 text-text-secondary" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-outside pl-6 space-y-2 mb-6 text-text-secondary" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-text-secondary" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-accent-primary bg-bg-card/50 p-4 rounded-r-xl italic my-6 text-text-primary" {...props} />
              ),
              code: ({ node, className, children, ...props }) => (
                <code className="bg-bg-card border border-border-color px-2 py-1 rounded text-xs sm:text-sm font-mono text-accent-primary" {...props}>
                  {children}
                </code>
              ),
              hr: () => <hr className="border-border-color my-8" />
            }}
          >
            {insight.content}
          </ReactMarkdown>
        </div>

        {/* Tags Section */}
        {insight.tags && insight.tags.length > 0 && (
          <div className="pt-6 border-t border-border-color mb-12 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 mr-2">
              <Tag className="w-3.5 h-3.5 text-accent-primary" />
              Related Topics:
            </span>
            {insight.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-text-secondary bg-bg-card border border-border-color px-3 py-1.5 rounded-lg hover:border-accent-primary/30 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Project Contact CTA Box */}
        <div className="bg-gradient-to-br from-bg-card via-bg-card to-accent-primary/10 border border-border-color rounded-3xl p-8 mb-16 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6 shadow-xl">
          <div className="mb-6 sm:mb-0">
            <span className="text-accent-primary font-bold text-xs uppercase tracking-widest block mb-2">
              Have A Creative Project In Mind?
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary mb-2">
              Let's create high-impact designs & video together.
            </h3>
            <p className="text-text-secondary text-sm max-w-md">
              From scroll-stopping social creatives to kinetic motion graphics and brand identity systems.
            </p>
          </div>
          <button
            onClick={onOpenContact || onBack}
            className="inline-flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-hover text-white font-bold text-sm px-6 py-3.5 rounded-full shadow-lg shadow-accent-primary/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            Get in Touch
          </button>
        </div>

        {/* Related Insights */}
        {relatedInsights.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-accent-primary" />
                Related Insights
              </h2>
              <button
                onClick={onBack}
                className="text-xs font-bold uppercase tracking-wider text-accent-primary hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedInsights.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectInsight(rel)}
                  className="bg-bg-card border border-border-color hover:border-accent-primary/30 rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={rel.featuredImage}
                      alt={rel.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-bg-primary/90 text-accent-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-border-color">
                      {rel.category}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-text-primary text-sm line-clamp-2 group-hover:text-accent-primary transition-colors mb-3">
                      {rel.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-text-secondary">
                      <span>{rel.publishDate}</span>
                      <span>{rel.readingTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
