import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, Play, MessageCircle, Phone, Mail, PenTool, Zap, Users, BarChart3, Calendar } from 'lucide-react';
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

  const DEFAULT_HERO_ROLES = [
    'Graphic Designer',
    'Video Editor',
    'Brand Identity Designer',
    'Creative Designer'
  ];
  const rotatingRoles = (hero?.rotatingRoles && hero.rotatingRoles.length > 0)
    ? hero.rotatingRoles
    : DEFAULT_HERO_ROLES;

  const eyebrow = hero?.headlinePrefix || 'DESIGNING IDEAS INTO IMPACT';
  const isGenericHeadline = (val?: string) => {
    if (!val) return true;
    const lower = val.trim().toLowerCase();
    return (
      lower === 'portfolio' ||
      lower === 'my portfolio' ||
      lower === 'rohit portfolio' ||
      lower === 'untitled' ||
      lower.includes('creative design') ||
      lower.includes('modern brands') ||
      lower.includes('introduction banner') ||
      lower.includes('main banner') ||
      lower.includes('welcome')
    );
  };

  const heroDisplayName = (!isGenericHeadline(branding?.siteName) && branding?.siteName)
    ? branding.siteName.replace(/\.+$/, '')
    : 'Rohit Verma';
  const name = heroDisplayName;
  const professionalRole = hero?.role || branding?.tagline || 'Graphic Designer & Video Editor';
  const location = hero?.location || branding?.location || 'Jaipur, India';

  const rawSubtitle = hero?.subtitle;
  const isPlaceholderSubtitle = !rawSubtitle || rawSubtitle.trim().toLowerCase() === 'main introduction banner on homepage';
  const description = (!isPlaceholderSubtitle && rawSubtitle)
    ? rawSubtitle
    : (branding?.bio || "I'm Rohit Verma, a creative designer & video editor who helps brands communicate through clean, strategic and high-impact visuals across digital and print.");

  const primaryCtaText = hero?.ctaPrimaryText || 'Start a Project';
  const secondaryCtaText = hero?.ctaSecondaryText || 'Explore Portfolio';

  const portrait = getAuthoritativeProfileImage(branding?.avatarImage);

  // Verified CMS statistics for Creative Profile Card
  const yearsExperience = branding?.yearsExperience ? parseInt(branding.yearsExperience, 10) || 3 : 3;
  const projectsCompleted = branding?.projectsCompleted ? parseInt(branding.projectsCompleted, 10) || 100 : 100;

  const [titleIdx, setTitleIdx] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (document.visibilityState === 'visible') {
          setTitleIdx((prev) => (prev + 1) % rotatingRoles.length);
        }
      }, 2800);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (timer) clearInterval(timer);
      } else {
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTimer();

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [rotatingRoles.length]);

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
    if (hero?.ctaPrimaryLink === '#portfolio') {
      scrollToPortfolio();
    } else {
      scrollToContact();
    }
  };

  const handleSecondaryCta = () => {
    if (hero?.ctaSecondaryLink === '#contact') {
      scrollToContact();
    } else {
      scrollToPortfolio();
    }
  };

  // Software dock tools with dedicated visual styles matching the approved creative profile
  const softwareTools = [
    {
      name: 'Photoshop',
      short: 'Ps',
      bgColor: '#001E36',
      borderColor: 'rgba(49, 168, 255, 0.65)',
      textColor: '#31A8FF',
      isCanva: false
    },
    {
      name: 'Illustrator',
      short: 'Ai',
      bgColor: '#331400',
      borderColor: 'rgba(255, 154, 0, 0.65)',
      textColor: '#FF9A00',
      isCanva: false
    },
    {
      name: 'Premiere Pro',
      short: 'Pr',
      bgColor: '#2D003B',
      borderColor: 'rgba(234, 119, 255, 0.65)',
      textColor: '#EA77FF',
      isCanva: false
    },
    {
      name: 'After Effects',
      short: 'Ae',
      bgColor: '#180036',
      borderColor: 'rgba(153, 153, 255, 0.65)',
      textColor: '#9999FF',
      isCanva: false
    },
    {
      name: 'Canva',
      short: 'Canva',
      bgColor: '#00C4CC',
      borderColor: '#00C4CC',
      textColor: '#FFFFFF',
      isCanva: true
    }
  ];

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-60px)] lg:min-h-screen flex flex-col justify-center pt-20 sm:pt-24 lg:pt-28 pb-8 sm:pb-12 lg:pb-16 overflow-hidden transition-colors duration-300 w-full max-w-full"
      style={{
        background: 'var(--bg-gradient)'
      }}
    >
      {/* Background Architectural Fluid Blue Curves & Dot Matrix Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft radial blue ambient lights */}
        <div className="absolute top-1/4 -left-32 w-[520px] h-[520px] rounded-full bg-[#0866F5]/[0.08] dark:bg-[#0866F5]/[0.15] blur-[140px]" />
        <div className="absolute top-1/3 -right-24 w-[600px] h-[600px] rounded-full bg-[#0866F5]/[0.12] dark:bg-[#0866F5]/[0.22] blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#155EEF]/[0.06] dark:bg-[#155EEF]/[0.12] blur-[130px]" />

        {/* Dot Matrix Grid on Upper Left (matching reference mockup) */}
        <div className="absolute top-24 left-6 sm:left-12 lg:left-16 w-32 h-44 opacity-40 dark:opacity-25">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#0866F5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dot-grid)" />
          </svg>
        </div>

        {/* Dynamic Fluid Blue Waves (matching the reference image's sweeping curves) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1600 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -100,200 C 400,120 700,450 1100,250 C 1350,120 1500,220 1750,150 L 1750,950 L -100,950 Z"
            fill="url(#blue-wave-grad-1)"
            opacity={isDark ? "0.35" : "0.55"}
          />
          <path
            d="M 600,0 C 900,180 1200,80 1450,220 C 1600,310 1700,280 1800,250 L 1800,950 L 600,950 Z"
            fill="url(#blue-wave-grad-2)"
            opacity={isDark ? "0.4" : "0.65"}
          />
          <path
            d="M -50,550 C 350,380 750,680 1150,490 C 1450,350 1650,480 1850,380"
            fill="none"
            stroke="#0866F5"
            strokeWidth="1.5"
            strokeOpacity={isDark ? "0.3" : "0.2"}
          />
          <path
            d="M -50,620 C 400,460 800,740 1250,550 C 1500,420 1700,520 1850,450"
            fill="none"
            stroke="#155EEF"
            strokeWidth="1"
            strokeDasharray="4,6"
            strokeOpacity={isDark ? "0.25" : "0.15"}
          />
          <defs>
            <linearGradient id="blue-wave-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0866F5" stopOpacity={isDark ? "0.15" : "0.06"} />
              <stop offset="60%" stopColor="#155EEF" stopOpacity={isDark ? "0.25" : "0.12"} />
              <stop offset="100%" stopColor="#071B49" stopOpacity={isDark ? "0.5" : "0.18"} />
            </linearGradient>
            <linearGradient id="blue-wave-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0866F5" stopOpacity={isDark ? "0.2" : "0.08"} />
              <stop offset="70%" stopColor="#0866F5" stopOpacity={isDark ? "0.35" : "0.16"} />
              <stop offset="100%" stopColor="#071B49" stopOpacity={isDark ? "0.65" : "0.24"} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full box-border relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-10 xl:gap-14 items-center">
          
          {/* =========================================================================
              LEFT COLUMN: Editorial Hierarchy Matching Reference Mockup
             ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-start w-full max-w-full" id="hero-left-content">
            
            {/* Availability Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white dark:bg-[#071B49] border border-[#DCE7F8] dark:border-[#1E3A8A]/50 mb-3 sm:mb-4 text-xs text-text-primary shadow-xs"
              id="hero-availability-status"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-[#071B49] dark:text-white">Available for Freelance Projects</span>
              <span className="text-[#53627C] dark:text-[#B8C9E8]">• Jaipur &amp; Across India</span>
            </motion.div>

            {/* Small Technical Eyebrow Line */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex items-center gap-2.5 mb-2.5 sm:mb-3"
              id="hero-eyebrow-container"
            >
              <span className="w-7 sm:w-9 h-[2px] bg-[#0866F5] rounded-full" aria-hidden="true" />
              <span className="text-[#0866F5] font-mono font-bold text-xs sm:text-sm uppercase tracking-[0.25em]" id="hero-eyebrow">
                {eyebrow === 'DESIGNING IDEAS INTO IMPACT' ? 'CREATIVE EXCELLENCE IN' : eyebrow}
              </span>
            </motion.div>

            {/* Primary Semantic H1: Rohit Verma. Large, dominant focal point */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl min-[375px]:text-5xl sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[6rem] 2xl:text-[7.25rem] font-black sm:font-extrabold text-[#071B49] dark:text-white tracking-tight mb-2 sm:mb-3 leading-[1.04] sm:leading-[0.98] lg:leading-[0.96] whitespace-normal sm:whitespace-nowrap max-w-full"
              style={{
                fontSize: 'clamp(2.4rem, 1rem + 5.5vw, 7.5rem)'
              }}
              id="hero-name"
            >
              {heroDisplayName}<span className="text-[#0866F5]">.</span>
            </motion.h1>

            {/* Supporting Hero Statement: Creative Design for Modern Brands */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-[1.75rem] font-bold text-[#071B49] dark:text-white tracking-tight mb-3 sm:mb-4 flex items-center gap-2 flex-wrap"
              id="hero-supporting-tagline"
            >
              <span>Creative Design for</span>
              <span className="text-[#0866F5] font-extrabold">Modern</span>
              <span>Brands.</span>
            </motion.div>

            {/* Rotating Role and Verified Location */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex items-center gap-2 flex-wrap mb-3.5 sm:mb-4 text-xs min-[360px]:text-sm sm:text-base font-semibold text-text-secondary"
              id="hero-core-profession"
            >
              <span className="text-text-muted">Specializing in</span>
              <div
                className="min-h-[28px] overflow-hidden inline-flex items-center"
                id="hero-title-animation-box"
                aria-live="polite"
                aria-atomic="true"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={titleIdx}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="font-bold text-[#0866F5]"
                    id="hero-animated-title"
                  >
                    {rotatingRoles[titleIdx % rotatingRoles.length]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted">{location}</span>
            </motion.div>

            {/* Verified Introduction Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-text-secondary text-sm sm:text-base lg:text-lg leading-relaxed mb-5 sm:mb-6 max-w-xl font-normal"
              id="hero-description"
            >
              {description}
            </motion.p>

            {/* CTA Buttons Group (Matching Reference Design) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-full sm:max-w-xl mb-5 sm:mb-6"
              id="hero-primary-actions"
            >
              {/* Primary Royal Blue Button */}
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="btn-primary group inline-flex items-center justify-center gap-2.5 bg-[#0866F5] hover:bg-[#155EEF] text-white font-bold px-7 py-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(8,102,245,0.4)] hover:shadow-[0_12px_28px_-5px_rgba(8,102,245,0.5)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0866F5] focus-visible:ring-offset-2 transition-all cursor-pointer text-sm sm:text-base min-h-[46px] sm:min-h-[48px]"
                id="hero-cta-hire"
                aria-label={`${primaryCtaText} - Contact Rohit Verma`}
              >
                <span className="text-white font-bold tracking-wide">{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 text-white stroke-white stroke-[2.5] shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>

              {/* Secondary Dark Navy Card Button with Play icon & Crisp White Text */}
              <button
                type="button"
                onClick={handleSecondaryCta}
                className="group inline-flex items-center justify-center gap-2.5 bg-[#071B49] hover:bg-[#0c286d] text-white border border-[#DCE7F8]/20 dark:border-[#1E3A8A]/50 font-bold px-6 sm:px-7 py-3.5 rounded-full shadow-md hover:shadow-lg active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0866F5] focus-visible:ring-offset-2 transition-all text-sm sm:text-base cursor-pointer min-h-[46px] sm:min-h-[48px]"
                id="hero-cta-work"
                aria-label={`${secondaryCtaText} - View Projects`}
              >
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#0866F5] shrink-0 shadow-xs">
                  <Play className="w-2.5 h-2.5 fill-[#0866F5] text-[#0866F5] ml-0.5" aria-hidden="true" />
                </div>
                <span className="text-white font-bold tracking-wide">{secondaryCtaText}</span>
              </button>
            </motion.div>

            {/* Quick Direct Contacts */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm w-full max-w-full mb-6 sm:mb-8"
              id="hero-quick-contacts"
            >
              <a
                href={WHATSAPP_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Rohit Verma on WhatsApp Business"
                className="inline-flex items-center gap-2.5 bg-[#071B49] hover:bg-[#0c286d] text-white border border-[#DCE7F8]/20 dark:border-[#1E3A8A]/50 font-medium px-4 py-2.5 rounded-full transition-all text-xs sm:text-sm flex-shrink-0 min-h-[44px] shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0866F5] focus-visible:ring-offset-2 active:scale-95"
                id="hero-cta-whatsapp"
              >
                <MessageCircle className="w-4 h-4 text-[#0866F5] shrink-0" />
                <span className="text-white font-semibold">WhatsApp</span>
              </a>
              <a
                href={contactConfig.emailHref}
                aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
                className="inline-flex items-center gap-2.5 bg-[#071B49] hover:bg-[#0c286d] text-white border border-[#DCE7F8]/20 dark:border-[#1E3A8A]/50 font-medium px-4 py-2.5 rounded-full transition-all text-xs sm:text-sm flex-shrink-0 min-h-[44px] shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0866F5] focus-visible:ring-offset-2 active:scale-95 break-all sm:break-normal"
                id="hero-cta-email"
              >
                <Mail className="w-4 h-4 text-[#0866F5] shrink-0" />
                <span className="text-white font-semibold">{contactConfig.emailDisplay}</span>
              </a>
              <a
                href={contactConfig.phoneHref}
                aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
                className="inline-flex items-center gap-2.5 bg-[#071B49] hover:bg-[#0c286d] text-white border border-[#DCE7F8]/20 dark:border-[#1E3A8A]/50 font-medium px-4 py-2.5 rounded-full transition-all text-xs sm:text-sm flex-shrink-0 whitespace-nowrap min-h-[44px] shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0866F5] focus-visible:ring-offset-2 active:scale-95"
                id="hero-cta-call"
              >
                <Phone className="w-4 h-4 text-[#0866F5] shrink-0" />
                <span className="text-white font-semibold">{contactConfig.phoneDisplay}</span>
              </a>
            </motion.div>

            {/* Three Value Prop Cards (Matching Visual Reference) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-[#DCE7F8] dark:border-[#1E3A8A]/40 w-full max-w-xl"
              id="hero-feature-pillars"
            >
              {/* 1. Brand Focused */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-[#071B49]/50 border border-[#DCE7F8]/80 dark:border-[#1E3A8A]/30">
                <div className="w-9 h-9 rounded-full bg-[#EAF2FF] dark:bg-[#0866F5]/20 border border-[#0866F5]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                  <PenTool className="w-4 h-4 text-[#0866F5]" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#071B49] dark:text-white leading-tight">Brand Focused</div>
                  <div className="text-[8px] sm:text-[9px] font-mono tracking-wider text-text-muted uppercase mt-0.5">MEANINGFUL DESIGN</div>
                </div>
              </div>

              {/* 2. Fast & Reliable */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-[#071B49]/50 border border-[#DCE7F8]/80 dark:border-[#1E3A8A]/30">
                <div className="w-9 h-9 rounded-full bg-[#EAF2FF] dark:bg-[#0866F5]/20 border border-[#0866F5]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                  <Zap className="w-4 h-4 text-[#0866F5]" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#071B49] dark:text-white leading-tight">Fast &amp; Reliable</div>
                  <div className="text-[8px] sm:text-[9px] font-mono tracking-wider text-text-muted uppercase mt-0.5">ON-TIME DELIVERY</div>
                </div>
              </div>

              {/* 3. Client Friendly */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-[#071B49]/50 border border-[#DCE7F8]/80 dark:border-[#1E3A8A]/30">
                <div className="w-9 h-9 rounded-full bg-[#EAF2FF] dark:bg-[#0866F5]/20 border border-[#0866F5]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                  <Users className="w-4 h-4 text-[#0866F5]" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#071B49] dark:text-white leading-tight">Client Friendly</div>
                  <div className="text-[8px] sm:text-[9px] font-mono tracking-wider text-text-muted uppercase mt-0.5">CLEAR COMMUNICATION</div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: Creative Profile Card with Window Frame & Tool Dock
             ========================================================================= */}
          <div 
            className="lg:col-span-5 flex flex-col items-center justify-center relative my-3 sm:my-5 lg:my-0 w-full max-w-[440px] xl:max-w-[460px] mx-auto" 
            id="hero-right-content"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full rounded-[28px] sm:rounded-[32px] overflow-hidden relative select-none border border-[#DCE7F8] dark:border-[#1E3A8A] shadow-[0_20px_50px_-15px_rgba(8,102,245,0.22),0_10px_25px_rgba(7,27,73,0.06)] dark:shadow-[0_20px_60px_-15px_rgba(3,11,30,0.8),0_10px_30px_rgba(8,102,245,0.2)] bg-white dark:bg-[#071B49] transition-all duration-300 p-3 sm:p-4"
              id="hero-creative-profile-card"
            >
              {/* Card Top Window Bar: CREATIVE PROFILE Header */}
              <div className="relative z-10 flex items-center justify-between px-2 pt-1 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0866F5] shadow-[0_0_8px_#0866F5]" />
                  <span className="text-[11px] sm:text-xs font-mono tracking-[0.25em] text-[#071B49] dark:text-white font-bold uppercase">
                    CREATIVE PROFILE
                  </span>
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                  <span className="w-2 h-2 rounded-full bg-[#0866F5]" />
                  <span className="w-2 h-2 rounded-full bg-[#0866F5]" />
                  <span className="w-2 h-2 rounded-full bg-[#0866F5]" />
                </div>
              </div>

              {/* Main Portrait Frame with natural proportions & rounded corners */}
              <div 
                className="relative w-full h-[320px] min-[360px]:h-[350px] sm:h-[390px] md:h-[410px] rounded-2xl overflow-hidden bg-[#F3F7FF] dark:bg-[#030B1E] z-[2] border border-[#DCE7F8]/60 dark:border-[#1E3A8A]/40"
                id="hero-portrait-frame"
              >
                <img
                  src={portrait}
                  alt="Rohit Verma – Graphic Designer and Video Editor in Jaipur"
                  width="460"
                  height="440"
                  fetchPriority="high"
                  className="w-full h-full object-cover object-[center_top] sm:object-[center_12%] pointer-events-none"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (e.currentTarget.src !== ROHIT_PROFILE_IMAGE_URL) {
                      e.currentTarget.src = ROHIT_PROFILE_IMAGE_URL;
                    }
                  }}
                />
              </div>

              {/* Metrics Panel: 100+ PROJECTS & 3+ YEARS */}
              <div 
                className="relative z-[3] mt-3 rounded-2xl p-3 flex items-center justify-around shadow-sm transition-colors duration-200 bg-[#F3F7FF] dark:bg-[#030B1E] border border-[#DCE7F8] dark:border-[#1E3A8A]/40"
                id="hero-metrics-panel"
              >
                {/* Completed Projects Metric */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 border border-[#0866F5]/30 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                    <BarChart3 className="w-4.5 h-4.5 text-[#0866F5]" />
                  </div>
                  <div className="flex flex-col">
                    <div 
                      className="text-lg sm:text-xl font-extrabold leading-none tracking-tight text-[#071B49] dark:text-white"
                      id="hero-metric-projects-count"
                    >
                      {projectsCompleted}+
                    </div>
                    <div 
                      className="text-[10px] sm:text-[11px] font-bold uppercase mt-1 select-none tracking-wider text-text-muted"
                      id="hero-metric-projects-label"
                    >
                      PROJECTS
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div 
                  className="w-px h-8 bg-[#DCE7F8] dark:bg-[#1E3A8A]/60" 
                  aria-hidden="true" 
                />

                {/* Years Experience Metric */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] dark:bg-[#0866F5]/20 border border-[#0866F5]/30 flex items-center justify-center text-[#0866F5] shrink-0 shadow-inner">
                    <Calendar className="w-4.5 h-4.5 text-[#0866F5]" />
                  </div>
                  <div className="flex flex-col">
                    <div 
                      className="text-lg sm:text-xl font-extrabold leading-none tracking-tight text-[#071B49] dark:text-white"
                      id="hero-metric-years-count"
                    >
                      {yearsExperience}+
                    </div>
                    <div 
                      className="text-[10px] sm:text-[11px] font-bold uppercase mt-1 select-none tracking-wider text-text-muted"
                      id="hero-metric-years-label"
                    >
                      YEARS
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Software Tool Dock (All 5 tools matching reference mockup) */}
              <div 
                className="relative z-[3] mt-2.5 rounded-2xl p-2.5 sm:p-3 shadow-xs transition-colors duration-200 bg-[#F3F7FF] dark:bg-[#030B1E] border border-[#DCE7F8] dark:border-[#1E3A8A]/40"
                id="hero-tool-dock"
              >
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full items-center justify-items-center">
                  {softwareTools.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex flex-col items-center gap-1 group cursor-default w-full"
                      title={tool.name}
                    >
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 ${tool.isCanva ? 'rounded-full' : 'rounded-xl'} flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0`}
                        style={{
                          backgroundColor: tool.bgColor,
                          borderColor: tool.borderColor,
                          borderWidth: '1px',
                          color: tool.textColor
                        }}
                      >
                        {tool.isCanva ? (
                          <span className="italic text-[10px] sm:text-xs">Canva</span>
                        ) : (
                          tool.short
                        )}
                      </div>
                      <span 
                        className="text-[9px] sm:text-[10px] font-semibold leading-tight text-center truncate max-w-full text-text-secondary"
                      >
                        {tool.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>

        </div>

        {/* Editorial Baseline Footer Line */}
        <div 
          className="w-full flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-text-muted uppercase pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-[#DCE7F8]/70 dark:border-[#1E3A8A]/30 select-none"
          id="hero-footer-baseline"
        >
          <span>— GOOD DESIGN BUILDS BETTER BRANDS</span>
          <span className="hidden sm:inline">CREATIVE / DESIGN / VISUAL STORYTELLING —</span>
        </div>

      </div>
    </section>
  );
}

