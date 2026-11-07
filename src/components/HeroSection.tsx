import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
      className="relative w-full pt-4 sm:pt-6 lg:pt-8 pb-10 sm:pb-14 overflow-hidden transition-colors duration-300 bg-[#F7F9FF] dark:bg-[#030B1E]"
    >
      {/* Background Soft Organic Lights & Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft radial ambient lights */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-[#0866F5]/[0.05] dark:bg-[#0866F5]/[0.10] blur-[140px]" />
        <div className="absolute top-1/4 -right-24 w-[550px] h-[550px] rounded-full bg-[#0866F5]/[0.08] dark:bg-[#0866F5]/[0.15] blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] rounded-full bg-[#155EEF]/[0.04] dark:bg-[#155EEF]/[0.08] blur-[130px]" />

        {/* Dynamic sweeping blue organic curves in background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-35 dark:opacity-15"
          viewBox="0 0 1600 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -100,180 C 350,120 680,440 1120,240 C 1380,120 1520,200 1750,150 L 1750,950 L -100,950 Z"
            fill="url(#hero-soft-grad-1)"
          />
          <defs>
            <linearGradient id="hero-soft-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0866F5" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#155EEF" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#071B49" stopOpacity="0.10" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full box-border relative z-10">
        
        {/* TWO-COLUMN HERO LAYOUT: Left 52%, Right 48%, Vertically Centered */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 xl:gap-14 w-full">
          
          {/* =========================================================================
              LEFT COLUMN (52% width on desktop): Clean Typography & CTAs
             ========================================================================= */}
          <div className="w-full lg:w-[52%] flex flex-col items-start text-left" id="hero-left-content">
            
            {/* Small Availability Badge: Available for Freelance Projects · Jaipur & Across India */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#071B49] border border-[#DCE7F8] dark:border-[#1E3A8A]/50 mb-4 sm:mb-5 shadow-[0_2px_10px_rgba(7,27,73,0.04)]"
              id="hero-availability-status"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-xs sm:text-sm text-[#071B49] dark:text-white tracking-tight">
                Available for Freelance Projects
              </span>
              <span className="text-xs text-[#94A3B8] font-bold">·</span>
              <span className="text-xs sm:text-sm font-semibold text-[#0866F5] dark:text-[#60A5FA]">
                {location}
              </span>
            </motion.div>

            {/* Main Primary Heading: Rohit Verma. (Large, prominent, one line on desktop) */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="text-4xl min-[400px]:text-5xl sm:text-6xl md:text-7xl lg:text-[68px] xl:text-[80px] font-black text-[#071B49] dark:text-white tracking-tight leading-[1.02] mb-3 select-none lg:whitespace-nowrap"
              id="hero-name"
            >
              Rohit <span className="text-[#0866F5]">Verma.</span>
            </motion.h1>

            {/* Subtitle with Hand-drawn Underline Swoop: Creative Design for Modern Brands. */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="relative inline-block mb-4 sm:mb-5"
              id="hero-subtitle-container"
            >
              <h2 className="text-xl min-[400px]:text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-extrabold text-[#071B49] dark:text-white tracking-tight leading-tight">
                Creative Design for{' '}
                <span className="text-[#0866F5] relative inline-block">
                  Modern
                  {/* Hand-drawn blue underline swoop beneath 'Modern' */}
                  <svg
                    className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full h-2.5 sm:h-3 text-[#0866F5] overflow-visible pointer-events-none"
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

            {/* Description Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="text-[#53627C] dark:text-[#94A3B8] text-sm sm:text-base lg:text-[17px] leading-relaxed mb-6 sm:mb-7 max-w-xl font-normal"
              id="hero-description"
            >
              {description}
            </motion.p>

            {/* CTA Buttons Group (Side by side) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="flex flex-row items-center gap-3 sm:gap-4 w-full max-w-xl mb-5 sm:mb-6"
              id="hero-primary-actions"
            >
              {/* Primary Royal Blue Button: Start a Project -> */}
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="group inline-flex items-center justify-center gap-2 bg-[#0866F5] hover:bg-[#155EEF] text-white font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-[0_10px_25px_rgba(8,102,245,0.35)] hover:shadow-[0_12px_28px_rgba(8,102,245,0.48)] active:scale-[0.98] transition-all cursor-pointer text-xs sm:text-sm min-h-[44px] whitespace-nowrap"
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
                className="group inline-flex items-center justify-center gap-2.5 bg-white dark:bg-[#071B49] hover:bg-[#F8FAFC] dark:hover:bg-[#0A2566] text-[#071B49] dark:text-white border border-[#DCE7F8] dark:border-[#1E3A8A]/50 font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-full shadow-[0_2px_10px_rgba(7,27,73,0.04)] hover:shadow-md hover:border-[#0866F5]/40 active:scale-[0.98] transition-all cursor-pointer text-xs sm:text-sm min-h-[44px] whitespace-nowrap"
                id="hero-cta-work"
                aria-label={`${secondaryCtaText} - View Projects`}
              >
                <div className="w-5 h-5 rounded-full bg-[#071B49] dark:bg-white flex items-center justify-center text-white dark:text-[#071B49] shrink-0 shadow-xs">
                  <Play className="w-2 h-2 fill-current ml-0.5" />
                </div>
                <span className="font-bold tracking-wide">{secondaryCtaText}</span>
              </button>
            </motion.div>

            {/* Clean Horizontal Contact Details Row (In one aligned row) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.26 }}
              className="inline-flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 rounded-full bg-white dark:bg-[#071B49] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-[0_4px_16px_rgba(7,27,73,0.04)] text-xs sm:text-sm font-semibold text-[#1E293B] dark:text-[#E2E8F0]"
              id="hero-contact-row"
            >
              <a
                href={WHATSAPP_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#0866F5] transition-colors whitespace-nowrap"
                id="hero-contact-whatsapp"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]/20 shrink-0" />
                <span>WhatsApp</span>
              </a>
              <span className="text-[#CBD5E1] dark:text-[#334155]">•</span>
              <a
                href={contactConfig.emailHref}
                className="inline-flex items-center gap-1.5 hover:text-[#0866F5] transition-colors whitespace-nowrap truncate max-w-[200px] sm:max-w-none"
                id="hero-contact-email"
              >
                <Mail className="w-4 h-4 text-[#0866F5] shrink-0" />
                <span>{contactConfig.emailDisplay}</span>
              </a>
              <span className="text-[#CBD5E1] dark:text-[#334155]">•</span>
              <a
                href={contactConfig.phoneHref}
                className="inline-flex items-center gap-1.5 hover:text-[#0866F5] transition-colors whitespace-nowrap"
                id="hero-contact-phone"
              >
                <Phone className="w-4 h-4 text-[#0866F5] shrink-0" />
                <span>{contactConfig.phoneDisplay}</span>
              </a>
            </motion.div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN (48% width on desktop): Prominent Portrait & Floating Cards
             ========================================================================= */}
          <div 
            className="w-full lg:w-[48%] relative flex items-center justify-center my-4 lg:my-0 min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] xl:min-h-[620px]"
            id="hero-right-content"
          >
            {/* 1. Dot Matrix Grid Pattern (Top-Right) */}
            <div className="absolute top-0 right-2 sm:right-6 w-28 h-24 pointer-events-none opacity-45 dark:opacity-20 z-0" aria-hidden="true">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hero-dot-matrix-2" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.75" fill="#0866F5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-dot-matrix-2)" />
              </svg>
            </div>

            {/* 2. Handwritten Decorative Phrase: "Turning Ideas Into Impact" with sketched arrow */}
            <div 
              className="absolute -top-2 sm:top-0 right-4 sm:right-8 z-20 pointer-events-none text-right select-none"
              style={{ transform: 'rotate(-4deg)' }}
            >
              <p className="font-handwriting text-xl sm:text-2xl font-bold text-[#071B49] dark:text-[#E2E8F0] leading-tight">
                Turning Ideas<br />Into Impact
              </p>
              {/* Sketched curved arrow pointing down toward Rohit */}
              <svg 
                className="w-9 h-9 ml-auto mr-3 text-[#071B49] dark:text-[#60A5FA] mt-0.5" 
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

            {/* 3. The Organic Blue Abstract Shape (Layered behind portrait) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
              <svg
                className="w-[360px] sm:w-[460px] md:w-[520px] lg:w-[540px] xl:w-[580px] h-[360px] sm:h-[460px] md:h-[520px] lg:h-[540px] xl:h-[580px] overflow-visible"
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="hero-blob-grad" x1="15%" y1="10%" x2="85%" y2="90%">
                    <stop offset="0%" stopColor="#0866F5" />
                    <stop offset="50%" stopColor="#155EEF" />
                    <stop offset="100%" stopColor="#071B49" />
                  </linearGradient>
                  <radialGradient id="hero-blob-glow" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#0866F5" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0866F5" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="250" cy="250" r="230" fill="url(#hero-blob-glow)" />
                <path
                  d="M410 290C450 370 380 460 300 480C210 500 130 460 80 390C30 320 20 220 70 140C120 70 220 50 300 70C390 100 450 160 440 240C430 300 400 240 410 290Z"
                  fill="url(#hero-blob-grad)"
                />
              </svg>
            </div>

            {/* 4. Rohit's Prominent Portrait (object-fit: contain, no cropping, scaled up) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative z-10 w-[320px] sm:w-[400px] md:w-[450px] lg:w-[480px] xl:w-[530px] flex items-center justify-center pointer-events-none select-none"
              id="hero-portrait-container"
            >
              <img
                src={cutoutImage}
                alt="Rohit Verma – Graphic Designer and Video Editor in Jaipur"
                width="617"
                height="1024"
                fetchPriority="high"
                className="w-full h-auto max-h-[500px] sm:max-h-[560px] md:max-h-[600px] lg:max-h-[630px] xl:max-h-[670px] object-contain object-center drop-shadow-[0_20px_35px_rgba(7,27,73,0.28)]"
                onError={(e) => {
                  if (e.currentTarget.src !== portrait) {
                    e.currentTarget.src = portrait;
                  }
                }}
              />
            </motion.div>

            {/* 5. Floating Service Card 1: Creative Designer (Top-Left of Portrait, not overlapping face) */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0, y: [0, -6, 0] }}
              transition={shouldReduceMotion ? { duration: 0.4 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-10 sm:top-14 -left-2 sm:-left-4 lg:-left-6 z-20 bg-white dark:bg-[#071B49] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_12px_28px_rgba(7,27,73,0.10)] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 flex items-center gap-2.5 sm:gap-3 pointer-events-auto select-none"
              id="hero-card-creative-designer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-[#0866F5]" />
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

            {/* 6. Floating Service Card 2: Video Editor (Mid-Right of Portrait, well below text) */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0, y: [0, 6, 0] }}
              transition={shouldReduceMotion ? { duration: 0.4, delay: 0.2 } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-36 sm:top-40 -right-2 sm:-right-4 lg:-right-6 z-20 bg-white dark:bg-[#071B49] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_12px_28px_rgba(7,27,73,0.10)] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 flex items-center gap-2.5 sm:gap-3 pointer-events-auto select-none"
              id="hero-card-video-editor"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#0866F5]" />
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

            {/* 7. Floating Service Card 3: Web Developer (Bottom-Right near waist/elbow) */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0, y: [0, -5, 0] }}
              transition={shouldReduceMotion ? { duration: 0.4, delay: 0.3 } : { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-12 sm:bottom-16 -right-2 sm:right-0 lg:right-2 z-20 bg-white dark:bg-[#071B49] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_12px_28px_rgba(7,27,73,0.10)] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 flex items-center gap-2.5 sm:gap-3 pointer-events-auto select-none"
              id="hero-card-web-developer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Code className="w-4 h-4 sm:w-5 sm:h-5 text-[#0866F5]" />
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

            {/* 8. Subtle Jaipur Palace Heritage Silhouette (Bottom-Right Corner) */}
            <div className="absolute -bottom-8 -right-6 w-40 sm:w-48 pointer-events-none opacity-40 dark:opacity-20 z-[2]" aria-hidden="true">
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
            STATISTICS SECTION: Large White Rounded Horizontal Card (4 Equal Columns)
           ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="mt-8 sm:mt-10 lg:mt-12 w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-[#071B49] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-[0_12px_35px_rgba(7,27,73,0.06)] dark:shadow-[0_20px_50px_rgba(3,11,30,0.6)] p-5 sm:p-6 lg:p-7 relative z-20"
          id="hero-stats-card"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] dark:divide-[#1E3A8A]/40">
            
            {/* Stat 1: 100+ Projects Completed */}
            <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 pt-3 sm:pt-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#0866F5]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#071B49] dark:text-white leading-none tracking-tight">
                  {projectsCompleted}+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Projects Completed
                </div>
              </div>
            </div>

            {/* Stat 2: 3+ Years Experience */}
            <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 pt-3 sm:pt-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#0866F5]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#071B49] dark:text-white leading-none tracking-tight">
                  {yearsExperience}+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Years Experience
                </div>
              </div>
            </div>

            {/* Stat 3: 98% Client Satisfaction */}
            <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 pt-3 sm:pt-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-[#0866F5]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#071B49] dark:text-white leading-none tracking-tight">
                  98%
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Client Satisfaction
                </div>
              </div>
            </div>

            {/* Stat 4: Trusted by Growing Businesses */}
            <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-4 pt-3 sm:pt-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-[#0866F5]" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-[24px] font-black text-[#071B49] dark:text-white leading-none tracking-tight">
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
