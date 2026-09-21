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
      {/* Background Architectural Glows & Refined Concentric Curves */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft pale blush radial light on the left */}
        <div className="absolute top-1/4 -left-48 w-[480px] h-[480px] rounded-full bg-accent-primary/[0.04] blur-[140px]" />

        {/* Ambient crimson glow centered behind the right profile card */}
        <div className="absolute top-1/3 -right-24 w-[540px] h-[540px] rounded-full bg-accent-primary/[0.07] blur-[150px]" />

        {/* Fluid circular and contour lines from the visual reference */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="80%" cy="40%" r="360" fill="none" stroke="var(--accent-primary)" strokeOpacity="0.06" strokeWidth="1" />
          <circle cx="80%" cy="40%" r="520" fill="none" stroke="var(--accent-primary)" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="6,6" />
          <circle cx="80%" cy="40%" r="700" fill="none" stroke="var(--accent-primary)" strokeOpacity="0.02" strokeWidth="1" />
          <path d="M -100,320 C 350,180 700,500 1200,280 S 1600,420 2000,260" fill="none" stroke="var(--accent-primary)" strokeOpacity="0.03" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full box-border relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-10 xl:gap-14 items-center">
          
          {/* =========================================================================
              LEFT COLUMN: Strong Editorial Hierarchy & Verified Content
             ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col items-start w-full max-w-full" id="hero-left-content">
            
            {/* Availability Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-3 sm:mb-4 text-xs text-text-primary"
              id="hero-availability-status"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-accent-primary">Available for Freelance Projects</span>
              <span className="hidden sm:inline text-text-muted">• Jaipur &amp; Across India</span>
            </motion.div>

            {/* Small Technical Eyebrow Line */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex items-center gap-2.5 mb-2.5 sm:mb-3"
              id="hero-eyebrow-container"
            >
              <span className="w-7 sm:w-9 h-[2px] bg-accent-primary rounded-full" aria-hidden="true" />
              <span className="text-accent-primary font-mono font-bold text-xs sm:text-sm uppercase tracking-[0.25em]" id="hero-eyebrow">
                {eyebrow}
              </span>
            </motion.div>

            {/* Primary Semantic H1: Rohit Verma. Large, dominant focal point */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl min-[375px]:text-5xl sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[6rem] 2xl:text-[7.25rem] font-black sm:font-extrabold text-text-primary tracking-tight mb-2 sm:mb-3 leading-[1.04] sm:leading-[0.98] lg:leading-[0.96] whitespace-normal sm:whitespace-nowrap max-w-full"
              style={{
                fontSize: 'clamp(2.4rem, 1rem + 5.5vw, 7.5rem)'
              }}
              id="hero-name"
            >
              {heroDisplayName}<span className="text-accent-primary">.</span>
            </motion.h1>

            {/* Supporting Hero Statement: Subtle, non-competing supporting kicker */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-text-muted tracking-normal mb-3 sm:mb-4 flex items-center gap-1.5 flex-wrap"
              id="hero-supporting-tagline"
            >
              <span>Creative Design for</span>
              <span className="text-text-primary font-semibold">Modern Brands.</span>
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
                    className="font-bold text-accent-primary"
                    id="hero-animated-title"
                  >
                    {rotatingRoles[titleIdx % rotatingRoles.length]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted">{location}</span>
            </motion.div>

            {/* Verified CMS Introduction Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-text-secondary text-sm sm:text-base lg:text-lg leading-relaxed mb-5 sm:mb-6 max-w-xl"
              id="hero-description"
            >
              {description}
            </motion.p>

            {/* CTA Buttons Group */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-full sm:max-w-xl mb-5 sm:mb-6"
              id="hero-primary-actions"
            >
              {/* Primary Pill Button: Guaranteed white text & icon on crimson/red background */}
              <button
                onClick={handlePrimaryCta}
                className="btn-primary group flex items-center justify-center gap-2.5 bg-accent-primary hover:bg-accent-secondary !text-white font-bold px-7 py-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(229,9,20,0.38)] active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base min-h-[46px]"
                id="hero-cta-hire"
                aria-label={`${primaryCtaText} - Contact Rohit Verma`}
              >
                <span className="!text-white font-bold">{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 !text-white !stroke-white stroke-[2.5] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>

              {/* Secondary Button: Clean Outlined action */}
              <button
                onClick={handleSecondaryCta}
                className="flex items-center justify-center gap-2.5 bg-bg-card hover:bg-bg-secondary text-text-primary border border-border-color hover:border-accent-primary/40 font-semibold px-6 py-3.5 rounded-full shadow-xs active:scale-[0.98] transition-all text-sm sm:text-base cursor-pointer min-h-[46px]"
                id="hero-cta-work"
                aria-label={`${secondaryCtaText} - View Projects`}
              >
                <div className="w-6 h-6 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary shrink-0">
                  <Play className="w-2.5 h-2.5 fill-accent-primary ml-0.5" aria-hidden="true" />
                </div>
                <span>{secondaryCtaText}</span>
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
                className="flex items-center gap-2 bg-bg-card hover:bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-color hover:border-accent-primary/40 font-medium px-3.5 sm:px-4 py-2 rounded-xl transition-colors text-xs sm:text-sm flex-shrink-0 min-h-[40px] shadow-xs"
                id="hero-cta-whatsapp"
              >
                <MessageCircle className="w-4 h-4 text-accent-primary shrink-0" />
                <span>WhatsApp</span>
              </a>
              <a
                href={contactConfig.emailHref}
                aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
                className="flex items-center gap-2 bg-bg-card hover:bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-color hover:border-accent-primary/40 font-medium px-3.5 sm:px-4 py-2 rounded-xl transition-colors contact-email text-xs sm:text-sm flex-shrink-0 min-h-[40px] shadow-xs"
                id="hero-cta-email"
              >
                <Mail className="w-4 h-4 text-accent-primary shrink-0" />
                <span>{contactConfig.emailDisplay}</span>
              </a>
              <a
                href={contactConfig.phoneHref}
                aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
                className="flex items-center gap-2 bg-bg-card hover:bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-color hover:border-accent-primary/40 font-medium px-3.5 sm:px-4 py-2 rounded-xl transition-colors text-xs sm:text-sm flex-shrink-0 whitespace-nowrap min-h-[40px] shadow-xs"
                id="hero-cta-call"
              >
                <Phone className="w-4 h-4 text-accent-primary shrink-0" />
                <span>{contactConfig.phoneDisplay}</span>
              </a>
            </motion.div>

            {/* Three Value Prop Cards (from visual reference) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-border-color/60 w-full max-w-xl"
              id="hero-feature-pillars"
            >
              {/* 1. Brand Focused */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-text-primary leading-tight">Brand Focused</div>
                  <div className="text-[8px] sm:text-[9px] font-mono tracking-wider text-text-muted uppercase mt-0.5">MEANINGFUL DESIGN</div>
                </div>
              </div>

              {/* 2. Fast & Reliable */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-text-primary leading-tight">Fast &amp; Reliable</div>
                  <div className="text-[8px] sm:text-[9px] font-mono tracking-wider text-text-muted uppercase mt-0.5">ON-TIME DELIVERY</div>
                </div>
              </div>

              {/* 3. Client Friendly */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-text-primary leading-tight">Client Friendly</div>
                  <div className="text-[8px] sm:text-[9px] font-mono tracking-wider text-text-muted uppercase mt-0.5">CLEAR COMMUNICATION</div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: Integrated Premium Creative Profile Card
             ========================================================================= */}
          <div 
            className="lg:col-span-5 flex flex-col items-center justify-center relative my-3 sm:my-5 lg:my-0 w-full max-w-[440px] xl:max-w-[460px] mx-auto" 
            id="hero-right-content"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full rounded-[28px] sm:rounded-[32px] overflow-hidden relative select-none border border-accent-primary/30 dark:border-[#7A1318]/60 shadow-[0_20px_50px_-15px_rgba(229,9,20,0.18),0_10px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_-15px_rgba(117,1,4,0.4),0_10px_30px_rgba(0,0,0,0.6)] bg-gradient-to-b from-[#FFF5F6] via-[#FFEBEF] to-[#FDE4E8] dark:bg-[#0D0B0E] transition-all duration-300"
              id="hero-creative-profile-card"
            >
              {/* Dark mode internal crimson ambient radial glow */}
              <div 
                className="absolute inset-0 pointer-events-none hidden dark:block"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 32%, #700105 0%, #420003 40%, #1A0205 68%, #0D0B0E 96%)'
                }}
                aria-hidden="true"
              />

              {/* Card Top Bar: CREATIVE PROFILE Header */}
              <div className="relative z-10 flex items-center justify-between px-4 sm:px-5 pt-3.5 sm:pt-4 pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse shadow-[0_0_8px_#E50914]" />
                  <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-neutral-800 dark:text-neutral-300 font-bold uppercase">
                    CREATIVE PROFILE
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-60">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 dark:bg-neutral-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 dark:bg-neutral-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 dark:bg-neutral-300" />
                </div>
              </div>

              {/* Background Architectural Micro-Details */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]" aria-hidden="true">
                {/* Left vertical technical text */}
                <div className="absolute left-3 top-14 flex flex-col gap-1 text-[8px] font-mono tracking-[0.22em] text-neutral-400 dark:text-white/20 uppercase select-none">
                  <span>DESIGN</span>
                  <span>EDIT</span>
                  <span>CREATE</span>
                </div>

                {/* Right vertical technical text */}
                <div className="absolute right-3 top-14 flex flex-col gap-1 text-[8px] font-mono tracking-[0.22em] text-right text-neutral-400 dark:text-white/20 uppercase select-none">
                  <span>TURNING</span>
                  <span>IDEAS</span>
                  <span>REAL</span>
                </div>

                {/* Watermark Signature */}
                <div className="absolute left-3 top-20 select-none opacity-25 dark:opacity-20 -rotate-12 pointer-events-none">
                  <span className="font-serif italic text-2xl sm:text-3xl text-accent-primary/40 dark:text-rose-300/40 tracking-wider font-light">
                    Rohit Verma
                  </span>
                </div>

                {/* Technical grid lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-15" xmlns="http://www.w3.org/2000/svg">
                  <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#E50914" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#E50914" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#E50914" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="72%" x2="100%" y2="72%" stroke="#E50914" strokeWidth="0.5" strokeDasharray="3,3" />
                </svg>
              </div>

              {/* Main Portrait Container with Object-Cover and natural proportions */}
              <div 
                className="relative w-full h-[320px] min-[360px]:h-[350px] sm:h-[390px] md:h-[420px] lg:h-[440px] flex items-end justify-center overflow-hidden z-[2]"
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

              {/* Metrics Panel (Floating High-Contrast Panel) */}
              <div 
                className="relative z-[3] -mt-6 sm:-mt-8 mx-3 sm:mx-4 mb-2.5 sm:mb-3 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 flex items-center justify-around shadow-md dark:shadow-2xl transition-colors duration-200"
                id="hero-metrics-panel"
                style={{
                  backgroundColor: isDark ? 'rgba(10, 8, 10, 0.88)' : '#F5F2F4',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0, 0, 0, 0.12)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  opacity: 1
                }}
              >
                {/* Completed Projects Metric */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent-primary/15 dark:bg-accent-primary/25 border border-accent-primary/40 dark:border-accent-primary/60 flex items-center justify-center text-accent-primary shrink-0 shadow-inner">
                    <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-accent-primary" />
                  </div>
                  <div className="flex flex-col">
                    <div 
                      className="text-base sm:text-lg font-black leading-none tracking-tight"
                      id="hero-metric-projects-count"
                      style={{
                        color: isDark ? '#FFFFFF' : '#1A1719',
                        opacity: 1
                      }}
                    >
                      {projectsCompleted}+
                    </div>
                    <div 
                      className="text-[10px] sm:text-[11px] font-bold uppercase mt-1 select-none"
                      id="hero-metric-projects-label"
                      style={{
                        color: isDark ? '#D6D1D3' : '#4B4447',
                        opacity: 1,
                        letterSpacing: '0.1em'
                      }}
                    >
                      PROJECTS
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div 
                  className="w-px h-8" 
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)'
                  }}
                  aria-hidden="true" 
                />

                {/* Years Experience Metric */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent-primary/15 dark:bg-accent-primary/25 border border-accent-primary/40 dark:border-accent-primary/60 flex items-center justify-center text-accent-primary shrink-0 shadow-inner">
                    <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-accent-primary" />
                  </div>
                  <div className="flex flex-col">
                    <div 
                      className="text-base sm:text-lg font-black leading-none tracking-tight"
                      id="hero-metric-years-count"
                      style={{
                        color: isDark ? '#FFFFFF' : '#1A1719',
                        opacity: 1
                      }}
                    >
                      {yearsExperience}+
                    </div>
                    <div 
                      className="text-[10px] sm:text-[11px] font-bold uppercase mt-1 select-none"
                      id="hero-metric-years-label"
                      style={{
                        color: isDark ? '#D6D1D3' : '#4B4447',
                        opacity: 1,
                        letterSpacing: '0.1em'
                      }}
                    >
                      YEARS
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Software Tool Dock (All 5 tools evenly distributed, slogan removed) */}
              <div 
                className="relative z-[3] mx-3 sm:mx-4 mb-3 sm:mb-4 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 shadow-md dark:shadow-2xl transition-colors duration-200"
                id="hero-tool-dock"
                style={{
                  backgroundColor: isDark ? 'rgba(10, 8, 10, 0.88)' : '#F5F2F4',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0, 0, 0, 0.12)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  opacity: 1
                }}
              >
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full items-center justify-items-center">
                  {softwareTools.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex flex-col items-center gap-1 group cursor-default w-full"
                      title={tool.name}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 ${tool.isCanva ? 'rounded-full' : 'rounded-lg'} flex items-center justify-center font-bold text-xs sm:text-sm shadow-md transition-transform duration-200 group-hover:scale-105 shrink-0`}
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
                        className="text-[9px] sm:text-[10px] font-semibold leading-tight text-center truncate max-w-full"
                        style={{
                          color: isDark ? '#D6D1D3' : '#4B4447',
                          opacity: 1
                        }}
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
          className="w-full flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-text-muted uppercase pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-border-color/40 select-none"
          id="hero-footer-baseline"
        >
          <span>— GOOD DESIGN BUILDS BETTER BRANDS</span>
          <span className="hidden sm:inline">CREATIVE / DESIGN / VISUAL STORYTELLING —</span>
        </div>

      </div>
    </section>
  );
}

