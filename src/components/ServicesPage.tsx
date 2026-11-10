import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  PenTool,
  Video,
  Monitor,
  Megaphone,
  Zap,
  ShieldCheck,
  Headphones,
  Trophy,
  Star,
  CheckCircle2,
  Info,
  ArrowRight,
  X,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { SERVICES_LIST, DetailedService } from '../servicesData';
import { WHATSAPP_BUSINESS_URL } from '../data';
import { useBodyScrollLock } from '../lib/scrollLock';
import WhatsAppIcon from './WhatsAppIcon';

interface ServicesPageProps {
  onNavigate?: (routeId: string) => void;
}

const SERVICE_FILTER_TABS = [
  { name: 'All Services', count: 19, id: 'all' },
  { name: 'Graphic Design', count: 13, id: 'graphic-design' },
  { name: 'Branding', count: 4, id: 'branding' },
  { name: 'Video & Motion', count: 3, id: 'video-motion' },
  { name: 'Web & UI/UX', count: 1, id: 'web-uiux' },
  { name: 'Marketing', count: 5, id: 'marketing' },
];

export interface VisualServiceCard {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  filterCategory: string;
  isFeatured?: boolean;
  features: string[];
  image: string;
  fallbackImage: string;
  originalServiceId: string;
}

// 6 Core prominent visual services matching the approved reference screenshot
const PROMINENT_SERVICES: VisualServiceCard[] = [
  {
    id: 's1',
    title: 'Graphic Design',
    subtitle: 'High-impact visual communication, custom graphics, marketing banners, and commercial design assets.',
    category: 'GRAPHIC DESIGN',
    filterCategory: 'Graphic Design',
    isFeatured: true,
    features: ['Custom Graphic Assets', 'Creative Composition', 'Brand-Compliant Artwork'],
    image: '/images/categories/graphic-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    originalServiceId: 'graphic-design'
  },
  {
    id: 's2',
    title: 'Brand Identity Design',
    subtitle: 'Complete brand ecosystems including logo, visual identity guidelines, color palettes, and typography systems.',
    category: 'BRANDING',
    filterCategory: 'Branding',
    isFeatured: true,
    features: ['Brand Identity Systems', 'Style Guidelines', 'Typography Pairing'],
    image: '/images/portfolio/brand-identity.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=600&q=80',
    originalServiceId: 'brand-identity'
  },
  {
    id: 's3',
    title: 'Social Media Design',
    subtitle: 'Scroll-stopping Instagram carousels, Facebook banners, LinkedIn creatives, and social story templates.',
    category: 'SOCIAL MEDIA',
    filterCategory: 'Marketing',
    isFeatured: true,
    features: ['Multi-Slide Carousels', 'Curated Grid Templates', 'Story & Reel Graphics'],
    image: '/images/portfolio/social-media-campaign.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
    originalServiceId: 'social-media-design'
  },
  {
    id: 's4',
    title: 'Video Editing',
    subtitle: 'High-pacing video editing, YouTube long-form cuts, Reels, motion graphics, and sound design.',
    category: 'VIDEO EDITING',
    filterCategory: 'Video & Motion',
    isFeatured: true,
    features: ['High-Retention Pacing', 'Animated Kinetic Subtitles', 'Sound Design & SFX'],
    image: '/images/portfolio/video-editing.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    originalServiceId: 'video-editing'
  },
  {
    id: 's5',
    title: 'UI/UX Design',
    subtitle: 'Intuitive user interface designs, wireframes, interactive prototypes, and responsive layouts.',
    category: 'UI/UX DESIGN',
    filterCategory: 'Web & UI/UX',
    isFeatured: true,
    features: ['Figma Component Systems', 'Interactive Prototyping', 'Mobile-First UI Layouts'],
    image: '/images/portfolio/ui-ux-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
    originalServiceId: 'ui-ux-design'
  },
  {
    id: 's6',
    title: 'Packaging Design',
    subtitle: 'Premium product packaging with modern label design, retail die-cuts, and print-ready assets.',
    category: 'PACKAGING',
    filterCategory: 'Graphic Design',
    isFeatured: true,
    features: ['Product Packaging', 'Label Design', 'Print Files'],
    image: '/images/portfolio/packaging-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    originalServiceId: 'packaging-design'
  }
];

export default function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All Services');
  const [selectedService, setSelectedService] = useState<VisualServiceCard | null>(null);

  useBodyScrollLock(!!selectedService, 'services-detail-modal-portal');

  // Filter prominent services based on active tab
  const filteredServices = useMemo(() => {
    if (activeFilter === 'All Services') return PROMINENT_SERVICES;
    const target = activeFilter.toLowerCase();
    return PROMINENT_SERVICES.filter((s) => {
      const fCat = s.filterCategory.toLowerCase();
      const cat = s.category.toLowerCase();
      if (target === 'graphic design') {
        return fCat === 'graphic design' || cat.includes('graphic') || cat.includes('packaging');
      }
      if (target === 'branding') {
        return fCat === 'branding' || cat.includes('branding');
      }
      if (target.includes('video') || target.includes('motion')) {
        return fCat.includes('video') || cat.includes('video');
      }
      if (target.includes('web') || target.includes('ui')) {
        return fCat.includes('ui') || cat.includes('ui');
      }
      if (target.includes('marketing')) {
        return fCat.includes('marketing') || cat.includes('social');
      }
      return fCat === target || cat === target;
    });
  }, [activeFilter]);

  const handleGetQuote = (serviceTitle: string) => {
    const msg = `Hi Rohit, I am interested in getting a quote for ${serviceTitle}. Can you share package details and delivery timelines?`;
    window.open(`https://wa.me/919376569027?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#030B1E] text-[#071B49] dark:text-[#E2E8F0] min-h-screen relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient background soft light-blue gradients matching reference screenshot */}
      <div
        className="absolute top-0 right-0 w-[650px] h-[650px] bg-gradient-to-br from-[#3B82F6]/10 via-[#60A5FA]/5 to-transparent rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-[35%] left-[-150px] w-[500px] h-[500px] bg-gradient-to-tr from-[#0866F5]/8 via-[#38BDF8]/5 to-transparent rounded-full blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24 relative z-10">

        {/* =========================================================================
            1. HERO SECTION (Matching Approved Services Reference Image)
           ========================================================================= */}
        <section className="mb-14 sm:mb-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Column: Copy & 4 Trust Highlights */}
            <div className="lg:col-span-7 flex flex-col items-start">
              
              {/* Badge: "Our Services" */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#DBEAFE] dark:border-[#3B82F6]/30 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] mb-5 shadow-xs">
                <Layers className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Our Services</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-[#071B49] dark:text-white leading-[1.1] mb-5">
                My Creative <span className="text-[#0866F5]">Services</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#64748B] dark:text-[#94A3B8] max-w-xl leading-relaxed mb-8">
                Comprehensive creative solutions tailored to amplify your brand presence and engagement.
              </p>

              {/* 4 Trust Badges Matching Reference Screenshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#F1F5F9] dark:border-[#1E3A8A]/40 w-full">
                
                {/* Badge 1: Fast & Reliable Delivery */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <Zap className="w-4 h-4 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#071B49] dark:text-white leading-tight">Fast &amp; Reliable</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Delivery</div>
                  </div>
                </div>

                {/* Badge 2: Quality & Brand Focused */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#071B49] dark:text-white leading-tight">Quality &amp;</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Brand Focused</div>
                  </div>
                </div>

                {/* Badge 3: Ongoing Support */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <Headphones className="w-4 h-4 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#071B49] dark:text-white leading-tight">Ongoing</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Support</div>
                  </div>
                </div>

                {/* Badge 4: Creative & Unique Designs */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <Trophy className="w-4 h-4 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#071B49] dark:text-white leading-tight">Creative &amp;</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Unique Designs</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Hero Column: Laptop, Graphics Tablet & Creative Software Badges */}
            <div className="lg:col-span-5 relative flex items-center justify-center py-6 sm:py-8">
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#3B82F6]/25 to-[#60A5FA]/15 blur-3xl pointer-events-none" />

              <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center">
                
                {/* 3D Modern Laptop Display Mockup */}
                <div className="relative w-[320px] sm:w-[360px] bg-[#0F172A] p-2.5 rounded-t-2xl rounded-b-lg shadow-[0_25px_50px_rgba(7,27,73,0.18)] border border-[#334155] transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="relative aspect-[16/10] bg-[#070D1E] rounded-lg overflow-hidden border border-[#1E293B] flex items-center justify-center p-6">
                    <div className="relative flex flex-col items-center justify-center text-center">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0866F5] via-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-[0_0_35px_rgba(8,102,245,0.6)] mb-2">
                        <span className="text-4xl font-black text-white tracking-tighter">R</span>
                      </div>
                      <div className="text-[11px] font-bold text-white tracking-widest uppercase opacity-90">RohitWork</div>
                      <div className="text-[9px] text-[#38BDF8] font-semibold tracking-wider">Design &amp; Services</div>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gradient-to-b from-[#334155] to-[#1E293B] rounded-b-lg mt-1 flex items-center justify-center">
                    <div className="w-16 h-0.5 bg-[#475569] rounded-full" />
                  </div>
                </div>

                {/* Graphics Tablet & Stylus Mockup */}
                <div className="absolute -bottom-3 left-4 w-28 h-18 bg-[#1E293B] rounded-xl border border-slate-700 shadow-xl transform -rotate-6 p-1.5 flex items-center justify-center">
                  <div className="w-full h-full bg-[#0F172A] rounded-lg border border-slate-800 flex items-center justify-center">
                    <div className="w-16 h-0.5 bg-[#38BDF8] rounded-full opacity-60" />
                  </div>
                </div>

                {/* Floating Creative Software Badges (Ps, Ai, Figma, Ae, Pr) */}
                <motion.div
                  animate={{ y: [-4, 5, -4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 left-6 w-11 h-11 rounded-xl bg-[#001E36] border border-[#00A4E4] flex items-center justify-center shadow-lg text-[#00A4E4] font-black text-sm"
                >
                  Ps
                </motion.div>

                <motion.div
                  animate={{ y: [5, -4, 5] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-8 left-16 w-11 h-11 rounded-xl bg-[#330000] border border-[#FF9A00] flex items-center justify-center shadow-lg text-[#FF9A00] font-black text-sm"
                >
                  Ai
                </motion.div>

                <motion.div
                  animate={{ y: [-5, 4, -5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-6 right-8 w-11 h-11 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-lg"
                >
                  <div className="w-6 h-6 flex flex-col justify-between">
                    <div className="flex gap-0.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F24E1E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FF7262]" /></div>
                    <div className="flex gap-0.5"><div className="w-2.5 h-2.5 rounded-full bg-[#A259FF]" /><div className="w-2.5 h-2.5 rounded-full bg-[#1ABCFE]" /></div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [4, -5, 4] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-1 right-8 w-11 h-11 rounded-xl bg-[#00005B] border border-[#9999FF] flex items-center justify-center shadow-lg text-[#9999FF] font-black text-sm"
                >
                  Ae
                </motion.div>

                <motion.div
                  animate={{ y: [-3, 5, -3] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-14 right-2 w-11 h-11 rounded-xl bg-[#330033] border border-[#EA77FF] flex items-center justify-center shadow-lg text-[#EA77FF] font-black text-sm"
                >
                  Pr
                </motion.div>

              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. SERVICE CATEGORY FILTER PILLS (Matching Reference Image)
           ========================================================================= */}
        <section className="mb-12 sm:mb-14">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3" role="tablist" aria-label="Service Categories">
            {SERVICE_FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.name;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.name)}
                  role="tab"
                  aria-selected={isActive}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? 'bg-[#0866F5] text-white shadow-[0_6px_20px_rgba(8,102,245,0.35)] scale-[1.02]'
                      : 'bg-white dark:bg-[#071B49] text-[#334155] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-xs hover:border-[#0866F5] hover:text-[#0866F5] hover:shadow-sm'
                  }`}
                  id={`service-filter-${tab.id}`}
                >
                  <span>{tab.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-[#F1F5F9] dark:bg-[#1E3A8A]/50 text-[#64748B] dark:text-[#94A3B8]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            3. THREE-COLUMN SERVICES CARDS GRID (Matching Approved Reference Image)
           ========================================================================= */}
        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredServices.map((service) => {
              return (
                <div
                  key={service.id}
                  className="group bg-white dark:bg-[#071B49] rounded-3xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-[0_4px_20px_rgba(7,27,73,0.04)] hover:shadow-[0_16px_36px_rgba(8,102,245,0.12)] dark:hover:shadow-[0_16px_36px_rgba(3,11,30,0.8)] hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between"
                  id={`service-card-${service.id}`}
                >
                  <div>
                    {/* Badges: Featured & Category Pill */}
                    <div className="flex items-center gap-2 mb-3">
                      {service.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0866F5] text-white shadow-xs">
                          <Star className="w-3 h-3 fill-white" />
                          <span>FEATURED</span>
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] dark:bg-[#1E3A8A]/40 text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E3A8A]/50">
                        {service.category}
                      </span>
                    </div>

                    {/* Service Title */}
                    <h3 className="text-lg sm:text-xl font-black text-[#071B49] dark:text-white mb-1.5 tracking-tight group-hover:text-[#0866F5] dark:group-hover:text-[#60A5FA] transition-colors">
                      {service.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-4 line-clamp-2">
                      {service.subtitle}
                    </p>

                    {/* 3 Checklist Items with Blue Checkmark */}
                    <div className="space-y-1.5 mb-5">
                      {service.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-xs font-semibold text-[#071B49] dark:text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0866F5] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Visual Mockup Thumbnail on Right/Center */}
                    <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-slate-100 dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E3A8A]/50">
                      <img
                        src={service.image}
                        alt={`${service.title} creative mockup`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = service.fallbackImage;
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom Action Bar: View Details & Get a Quote */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9] dark:border-[#1E3A8A]/40">
                    <button
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className="text-xs font-bold text-[#64748B] hover:text-[#0866F5] dark:text-[#94A3B8] dark:hover:text-[#60A5FA] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGetQuote(service.title)}
                      className="bg-[#0866F5] hover:bg-[#0654ce] text-white font-bold text-xs px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                    >
                      <span>Get a Quote</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* =========================================================================
          4. SERVICE DETAIL MODAL (Portal to document.body)
         ========================================================================= */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedService && (
              <div
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
                onClick={() => setSelectedService(null)}
                id="service-detail-modal"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-[#071B49] border border-[#E2E8F0] dark:border-[#1E3A8A]/60 rounded-3xl w-full max-w-2xl max-h-[calc(100dvh-32px)] overflow-y-auto shadow-2xl relative my-auto p-6 sm:p-8"
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedService(null)}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center shadow-xs active:scale-95"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-[#0866F5] dark:text-[#60A5FA] uppercase tracking-wider bg-[#EFF6FF] dark:bg-[#0866F5]/15 px-3 py-1 rounded-full border border-[#DBEAFE] dark:border-[#0866F5]/30">
                      {selectedService.category}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">
                      Professional Creative Package
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-[#071B49] dark:text-white tracking-tight mb-3">
                    {selectedService.title}
                  </h3>

                  <p className="text-[#475569] dark:text-[#94A3B8] text-sm leading-relaxed mb-6">
                    {selectedService.subtitle} Every deliverable is engineered with strategic alignment, strict revision stages, and print/digital production standards.
                  </p>

                  {/* Included Deliverables */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#071B49] dark:text-white mb-3">
                      Package Highlights &amp; Scope
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedService.features.map((feat) => (
                        <div
                          key={feat}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 text-xs font-semibold text-[#071B49] dark:text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#0866F5] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Turnaround & Revisions Info */}
                  <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#DBEAFE] dark:border-[#3B82F6]/30">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#0866F5]" />
                      <div className="text-xs">
                        <span className="font-bold text-[#071B49] dark:text-white block">Typical Delivery</span>
                        <span className="text-[#64748B] dark:text-[#94A3B8]">2 – 5 Business Days</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#0866F5]" />
                      <div className="text-xs">
                        <span className="font-bold text-[#071B49] dark:text-white block">Revisions</span>
                        <span className="text-[#64748B] dark:text-[#94A3B8]">2 Structured Rounds</span>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#1E3A8A]/40">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="px-5 py-2.5 rounded-full text-xs font-bold border border-[#E2E8F0] dark:border-[#1E3A8A] text-[#64748B] hover:text-[#071B49] cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGetQuote(selectedService.title)}
                      className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#0866F5] hover:bg-[#0654ce] text-white flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Get Instant Quote</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

    </div>
  );
}
