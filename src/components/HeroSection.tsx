import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  ArrowRight, 
  Play, 
  MessageCircle, 
  Phone, 
  Mail, 
  Palette, 
  Video, 
  Code, 
  Award, 
  Users, 
  Smile, 
  Handshake 
} from 'lucide-react';
import { WHATSAPP_BUSINESS_URL, contactConfig, ROHIT_PROFILE_IMAGE_URL, getAuthoritativeProfileImage } from '../data';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useTheme } from '../context/ThemeContext';

export default function HeroSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { activeConfig } = useSiteConfig();
  const hero = activeConfig?.sections?.hero;
  const branding = activeConfig?.branding;

  if (hero && hero.isVisible === false) {
    return null;
  }

  const eyebrow = hero?.headlinePrefix || 'Available for Freelance Projects';
  const location = hero?.location || branding?.location || 'Jaipur & Across India';

  const rawSubtitle = hero?.subtitle;
  const isPlaceholderSubtitle = !rawSubtitle || rawSubtitle.trim().toLowerCase() === 'main introduction banner on homepage';
  const description = (!isPlaceholderSubtitle && rawSubtitle)
    ? rawSubtitle
    : (branding?.bio || "Professional Graphic Designer, Video Editor, Website Developer and Digital Marketing Professional based in Jaipur, India. Dedicated to helping businesses build memorable visual brands with clarity and craft.");

  const primaryCtaText = hero?.ctaPrimaryText || 'Start a Project';
  const secondaryCtaText = hero?.ctaSecondaryText || 'Explore Portfolio';

  const portrait = getAuthoritativeProfileImage(branding?.avatarImage);
  const cutoutImage = '/images/rohit-cutout.png';

  // Verified CMS statistics
  const yearsExperience = branding?.yearsExperience ? parseInt(branding.yearsExperience, 10) || 3 : 3;
  const projectsCompleted = branding?.projectsCompleted ? parseInt(branding.projectsCompleted, 10) || 100 : 100;

  const shouldReduceMotion = useReducedMotion();

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handlePrimaryCta = () => {
    if (hero?.ctaPrimaryLink && hero.ctaPrimaryLink !== '#contact') {
      if (hero.ctaPrimaryLink.startsWith('http') || hero.ctaPrimaryLink.startsWith('mailto:') || hero.ctaPrimaryLink.startsWith('tel:')) {
        window.open(hero.ctaPrimaryLink, '_blank', 'noopener,noreferrer');
        return;
      }
      if (hero.ctaPrimaryLink.startsWith('#')) {
        const id = hero.ctaPrimaryLink.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }
    scrollToContact();
  };

  const handleSecondaryCta = () => {
    if (hero?.ctaSecondaryLink && hero.ctaSecondaryLink !== '#portfolio') {
      if (hero.ctaSecondaryLink.startsWith('http')) {
        window.open(hero.ctaSecondaryLink, '_blank', 'noopener,noreferrer');
        return;
      }
      if (hero.ctaSecondaryLink.startsWith('#')) {
        const id = hero.ctaSecondaryLink.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }
    scrollToPortfolio();
  };

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-60px)] lg:min-h-screen flex flex-col justify-center pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 overflow-hidden transition-colors duration-300 w-full max-w-full bg-[#F7F9FF] dark:bg-[#030B1E]"
    >
      {/* =========================================================================
          BACKGROUND DESIGN: Clean, luminous white + soft light blue & organic shapes
         ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft radial ambient lights */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#0866F5]/[0.06] dark:bg-[#0866F5]/[0.12] blur-[150px]" />
        <div className="absolute top-1/4 -right-32 w-[650px] h-[650px] rounded-full bg-[#0866F5]/[0.09] dark:bg-[#0866F5]/[0.18] blur-[160px]" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full bg-[#155EEF]/[0.05] dark:bg-[#155EEF]/[0.10] blur-[140px]" />

        {/* Dynamic sweeping blue organic curves in background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-20"
          viewBox="0 0 1600 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -100,220 C 350,140 680,480 1120,280 C 1380,150 1520,240 1750,180 L 1750,950 L -100,950 Z"
            fill="url(#hero-soft-grad-1)"
          />
          <path
            d="M -50,600 C 380,440 760,700 1200,520 C 1460,390 1680,490 1850,420"
            fill="none"
            stroke="#0866F5"
            strokeWidth="1.5"
            strokeOpacity="0.15"
          />
          <defs>
            <linearGradient id="hero-soft-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0866F5" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#155EEF" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#071B49" stopOpacity="0.12" />
            </linearGradient>
          </defs>
        </svg>

        {/* Fluid wave corner accent on bottom-left */}
        <svg
          className="absolute -bottom-10 -left-10 w-[350px] h-[250px] pointer-events-none opacity-60 dark:opacity-30"
          viewBox="0 0 350 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 250V120C60 130 110 170 160 150C220 130 260 80 350 100V250H0Z"
            fill="url(#corner-wave-grad)"
          />
          <defs>
            <linearGradient id="corner-wave-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0866F5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#EAF2FF" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full box-border relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 xl:gap-12 items-center">
          
          {/* =========================================================================
              LEFT COLUMN: Introduction & Typography (Matching Reference Mockup 100%)
             ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-start w-full max-w-full" id="hero-left-content">
            
            {/* Small Availability Badge: Available for Freelance Projects · Jaipur & Across India */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white dark:bg-[#071B49] border border-[#DCE7F8] dark:border-[#1E3A8A]/50 mb-5 sm:mb-6 shadow-[0_4px_16px_rgba(7,27,73,0.04)]"
              id="hero-availability-status"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-xs sm:text-sm text-[#071B49] dark:text-white tracking-tight">
                Available for Freelance Projects
              </span>
              <span className="text-xs text-[#94A3B8] font-bold">·</span>
              <span className="text-xs sm:text-sm font-semibold text-[#0866F5] dark:text-[#60A5FA]">
                {location}
              </span>
            </motion.div>

            {/* Main Primary Heading: Rohit Verma. */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl min-[400px]:text-6xl sm:text-7xl md:text-8xl lg:text-[76px] xl:text-[88px] font-black text-[#071B49] dark:text-white tracking-[-0.03em] leading-[1.02] mb-4 select-none"
              id="hero-name"
            >
              Rohit <span className="text-[#0866F5]">Verma.</span>
            </motion.h1>

            {/* Subtitle with Hand-drawn Underline Swoop: Creative Design for Modern Brands. */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="relative inline-block mb-5 sm:mb-6"
              id="hero-subtitle-container"
            >
              <h2 className="text-2xl min-[400px]:text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#071B49] dark:text-white tracking-tight leading-tight">
                Creative Design for{' '}
                <span className="text-[#0866F5] relative inline-block">
                  Modern
                  {/* Hand-drawn blue underline swoop beneath 'Modern' */}
                  <svg
                    className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-2.5 sm:h-3 text-[#0866F5] overflow-visible pointer-events-none"
                    viewBox="0 0 100 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 9C26 3 70 2 98 8"
                      stroke="#0866F5"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{' '}
                Brands.
              </h2>
            </motion.div>

            {/* Verified Introduction Description */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="text-[#53627C] dark:text-[#94A3B8] text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-xl font-normal"
              id="hero-description"
            >
              {description}
            </motion.p>

            {/* CTA Buttons Group (Matching Reference Design: Start a Project -> | Play Explore Portfolio) */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full max-w-full sm:max-w-xl mb-6 sm:mb-8"
              id="hero-primary-actions"
            >
              {/* Primary Royal Blue Button: Start a Project -> */}
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="group inline-flex items-center justify-center gap-2.5 bg-[#0866F5] hover:bg-[#155EEF] text-white font-bold px-7 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-[0_10px_25px_rgba(8,102,245,0.35)] hover:shadow-[0_14px_30px_rgba(8,102,245,0.48)] active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base min-h-[48px]"
                id="hero-cta-hire"
                aria-label={`${primaryCtaText} - Contact Rohit Verma`}
              >
                <span className="text-white font-bold tracking-wide">{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 text-white stroke-[2.5] shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary Clean Button: Play Explore Portfolio */}
              <button
                type="button"
                onClick={handleSecondaryCta}
                className="group inline-flex items-center justify-center gap-3 bg-white dark:bg-[#071B49] hover:bg-[#F8FAFC] dark:hover:bg-[#0A2566] text-[#071B49] dark:text-white border border-[#DCE7F8] dark:border-[#1E3A8A]/50 font-bold px-6 sm:px-7 py-3.5 sm:py-4 rounded-full shadow-[0_4px_16px_rgba(7,27,73,0.04)] hover:shadow-md hover:border-[#0866F5]/40 active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base min-h-[48px]"
                id="hero-cta-work"
                aria-label={`${secondaryCtaText} - View Projects`}
              >
                <div className="w-6 h-6 rounded-full bg-[#071B49] dark:bg-white flex items-center justify-center text-white dark:text-[#071B49] shrink-0 shadow-xs">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span className="font-bold tracking-wide">{secondaryCtaText}</span>
              </button>
            </motion.div>

            {/* Clean Horizontal Contact Information Row Card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="inline-flex flex-wrap items-center gap-3.5 sm:gap-5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white dark:bg-[#071B49] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-[0_6px_20px_rgba(7,27,73,0.04)] text-xs sm:text-sm font-semibold text-[#1E293B] dark:text-[#E2E8F0]"
              id="hero-contact-row"
            >
              <a
                href={WHATSAPP_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-[#0866F5] transition-colors"
                id="hero-contact-whatsapp"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]/20 shrink-0" />
                <span>WhatsApp</span>
              </a>
              <span className="text-[#CBD5E1] dark:text-[#334155]">•</span>
              <a
                href={contactConfig.emailHref}
                className="inline-flex items-center gap-2 hover:text-[#0866F5] transition-colors"
                id="hero-contact-email"
              >
                <Mail className="w-4 h-4 text-[#0866F5] shrink-0" />
                <span>{contactConfig.emailDisplay}</span>
              </a>
              <span className="text-[#CBD5E1] dark:text-[#334155]">•</span>
              <a
                href={contactConfig.phoneHref}
                className="inline-flex items-center gap-2 hover:text-[#0866F5] transition-colors"
                id="hero-contact-phone"
              >
                <Phone className="w-4 h-4 text-[#0866F5] shrink-0" />
                <span>{contactConfig.phoneDisplay}</span>
              </a>
            </motion.div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: Profile Visual with Organic Blue Shape & 3 Floating Cards
             ========================================================================= */}
          <div 
            className="lg:col-span-5 relative flex items-center justify-center my-6 lg:my-0 w-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px]"
            id="hero-right-content"
          >
            {/* 1. Dot Matrix Grid Pattern (Top-Right Corner) */}
            <div className="absolute -top-4 right-2 sm:right-6 w-32 h-28 pointer-events-none opacity-45 dark:opacity-25 z-0" aria-hidden="true">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hero-dot-matrix" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.75" fill="#0866F5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-dot-matrix)" />
              </svg>
            </div>

            {/* 2. Handwritten Decorative Element: "Turning Ideas Into Impact" with sketched arrow */}
            <div 
              className="absolute top-2 right-4 sm:right-10 z-20 pointer-events-none text-right select-none"
              style={{ transform: 'rotate(-4deg)' }}
            >
              <p className="font-handwriting text-xl sm:text-2xl md:text-[26px] font-bold text-[#071B49] dark:text-[#E2E8F0] leading-tight">
                Turning Ideas<br />Into Impact
              </p>
              {/* Sketched curved arrow pointing down toward Rohit */}
              <svg 
                className="w-10 h-10 ml-auto mr-4 text-[#071B49] dark:text-[#60A5FA] mt-1" 
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M28 4C28 14 22 24 10 28M10 28L16 22M10 28L14 34" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>

            {/* 3. The Organic Blue Abstract Shape (behind portrait) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
              <svg
                className="w-[340px] sm:w-[440px] md:w-[500px] lg:w-[540px] h-[340px] sm:h-[440px] md:h-[500px] lg:h-[540px] overflow-visible"
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="organic-blob-grad" x1="15%" y1="10%" x2="85%" y2="90%">
                    <stop offset="0%" stopColor="#0866F5" />
                    <stop offset="50%" stopColor="#155EEF" />
                    <stop offset="100%" stopColor="#071B49" />
                  </linearGradient>
                  <radialGradient id="organic-glow-grad" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#0866F5" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0866F5" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Ambient outer halo */}
                <circle cx="250" cy="250" r="230" fill="url(#organic-glow-grad)" />
                {/* Organic fluid shape matching reference mockup curves */}
                <path
                  d="M410 290C450 370 380 460 300 480C210 500 130 460 80 390C30 320 20 220 70 140C120 70 220 50 300 70C390 100 450 160 440 240C430 300 400 240 410 290Z"
                  fill="url(#organic-blob-grad)"
                />
              </svg>
            </div>

            {/* 4. Rohit's Verified Professional Cutout Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative z-10 w-[290px] min-[360px]:w-[320px] sm:w-[380px] md:w-[420px] lg:w-[450px] xl:w-[480px] flex items-end justify-center pointer-events-none select-none"
              id="hero-portrait-container"
            >
              <img
                src={cutoutImage}
                alt="Rohit Verma – Graphic Designer and Video Editor in Jaipur"
                width="617"
                height="1024"
                fetchPriority="high"
                className="w-full h-auto max-h-[480px] sm:max-h-[540px] md:max-h-[580px] object-contain object-bottom drop-shadow-[0_20px_35px_rgba(7,27,73,0.3)]"
                onError={(e) => {
                  if (e.currentTarget.src !== portrait) {
                    e.currentTarget.src = portrait;
                  }
                }}
              />
            </motion.div>

            {/* 5. Floating Service Card 1: Creative Designer (Top-Left of Portrait) */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 1, x: 0, y: [0, -8, 0] }}
              transition={shouldReduceMotion ? { duration: 0.4 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-12 left-0 sm:-left-4 md:-left-8 z-20 bg-white dark:bg-[#071B49] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_15px_35px_rgba(7,27,73,0.12)] border border-[#E2E8F0] dark:border-[#1E3A8A]/60 flex items-center gap-3 pointer-events-auto select-none"
              id="hero-card-creative-designer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Palette className="w-5 h-5 text-[#0866F5]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#071B49] dark:text-white leading-tight">
                  Creative
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#0866F5] leading-tight">
                  Designer
                </p>
              </div>
            </motion.div>

            {/* 6. Floating Service Card 2: Video Editor (Mid-Right of Portrait) */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 1, x: 0, y: [0, 8, 0] }}
              transition={shouldReduceMotion ? { duration: 0.4, delay: 0.2 } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-44 -right-2 sm:-right-4 md:-right-6 z-20 bg-white dark:bg-[#071B49] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_15px_35px_rgba(7,27,73,0.12)] border border-[#E2E8F0] dark:border-[#1E3A8A]/60 flex items-center gap-3 pointer-events-auto select-none"
              id="hero-card-video-editor"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Video className="w-5 h-5 text-[#0866F5]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#071B49] dark:text-white leading-tight">
                  Video
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#0866F5] leading-tight">
                  Editor
                </p>
              </div>
            </motion.div>

            {/* 7. Floating Service Card 3: Web Developer (Bottom-Right of Portrait) */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 1, x: 0, y: [0, -6, 0] }}
              transition={shouldReduceMotion ? { duration: 0.4, delay: 0.3 } : { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-16 -right-2 sm:right-2 md:right-0 z-20 bg-white dark:bg-[#071B49] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_15px_35px_rgba(7,27,73,0.12)] border border-[#E2E8F0] dark:border-[#1E3A8A]/60 flex items-center gap-3 pointer-events-auto select-none"
              id="hero-card-web-developer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Code className="w-5 h-5 text-[#0866F5]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#071B49] dark:text-white leading-tight">
                  Web
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#0866F5] leading-tight">
                  Developer
                </p>
              </div>
            </motion.div>

            {/* 8. Subtle Jaipur Palace Illustration in Bottom-Right Corner */}
            <div className="absolute -bottom-10 -right-8 w-44 sm:w-52 pointer-events-none opacity-40 dark:opacity-20 z-[2]" aria-hidden="true">
              <img
                src="/images/jaipur-palace.png"
                alt="Jaipur Heritage Architecture Silhouette"
                width="204"
                height="130"
                className="w-full h-auto object-contain filter grayscale contrast-125"
              />
            </div>

          </div>

        </div>

        {/* =========================================================================
            STATS SECTION: Large White Rounded Horizontal Card (4 Columns / 2x2 Grid)
           ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 sm:mt-16 lg:mt-20 w-full rounded-3xl bg-white dark:bg-[#071B49] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-[0_15px_40px_rgba(7,27,73,0.06)] dark:shadow-[0_20px_50px_rgba(3,11,30,0.6)] p-5 sm:p-7 lg:p-8"
          id="hero-stats-card"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] dark:divide-[#1E3A8A]/40">
            
            {/* Stat 1: 100+ Projects Completed */}
            <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Award className="w-6 h-6 text-[#0866F5]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#071B49] dark:text-white leading-none tracking-tight">
                  {projectsCompleted}+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Projects Completed
                </div>
              </div>
            </div>

            {/* Stat 2: 3+ Years Experience */}
            <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Users className="w-6 h-6 text-[#0866F5]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#071B49] dark:text-white leading-none tracking-tight">
                  {yearsExperience}+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Years Experience
                </div>
              </div>
            </div>

            {/* Stat 3: 98% Client Satisfaction */}
            <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Smile className="w-6 h-6 text-[#0866F5]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#071B49] dark:text-white leading-none tracking-tight">
                  98%
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Client Satisfaction
                </div>
              </div>
            </div>

            {/* Stat 4: Trusted by Growing Businesses */}
            <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Handshake className="w-6 h-6 text-[#0866F5]" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-[26px] font-black text-[#071B49] dark:text-white leading-none tracking-tight">
                  Trusted by
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Growing Businesses
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
