import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, MessageCircle, Phone, Mail } from 'lucide-react';
import { WHATSAPP_BUSINESS_URL, contactConfig } from '../data';
import { GLOBAL_ROLES } from '../rolesData';
import { useSiteConfig } from '../context/SiteConfigContext';
import portraitImg from '../assets/images/rohit-verma-portrait.jpg';

export default function HeroSection() {
  const { activeConfig } = useSiteConfig();
  const hero = activeConfig?.sections?.hero;
  const branding = activeConfig?.branding;

  const professionalTitles = GLOBAL_ROLES;
  const greeting = 'Hello,';
  const name = branding?.siteName || 'Rohit Verma';
  const description = branding?.bio || 'Professional Graphic Designer, Video Editor, Website Developer and Digital Marketing Professional based in Jaipur, India. Dedicated to helping businesses build memorable visual brands with clarity and craft.';
  const primaryCtaText = hero?.ctaPrimaryText || 'Start a Project';
  const secondaryCtaText = hero?.ctaSecondaryText || 'Explore Portfolio';
  const portrait = branding?.avatarImage || portraitImg;

  const [titleIdx, setTitleIdx] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (document.visibilityState === 'visible') {
          setTitleIdx((prev) => (prev + 1) % professionalTitles.length);
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
  }, [professionalTitles.length]);

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

  // Software floating cards details with dedicated brand accents & balanced radial orbit positioning
  const softwareCards = [
    {
      name: 'Photoshop',
      label: 'Ps',
      color: '#31A8FF',
      bgColor: 'rgba(49, 168, 255, 0.18)',
      borderColor: 'rgba(49, 168, 255, 0.45)',
      posClass: 'top-1 left-1 sm:left-[2%] sm:top-[8%]',
      direction: -1,
    },
    {
      name: 'Illustrator',
      label: 'Ai',
      color: '#FF9A00',
      bgColor: 'rgba(255, 154, 0, 0.18)',
      borderColor: 'rgba(255, 154, 0, 0.45)',
      posClass: 'top-1 right-1 sm:right-[2%] sm:top-[8%]',
      direction: 1,
    },
    {
      name: 'Premiere Pro',
      label: 'Pr',
      color: '#EA77FF',
      bgColor: 'rgba(234, 119, 255, 0.18)',
      borderColor: 'rgba(234, 119, 255, 0.45)',
      posClass: 'top-[48%] -left-1 sm:left-0 sm:top-[48%] sm:-translate-y-1/2',
      direction: 1,
    },
    {
      name: 'After Effects',
      label: 'Ae',
      color: '#9999FF',
      bgColor: 'rgba(153, 153, 255, 0.18)',
      borderColor: 'rgba(153, 153, 255, 0.45)',
      posClass: 'top-[48%] -right-1 sm:right-0 sm:top-[48%] sm:-translate-y-1/2',
      direction: -1,
    },
    {
      name: 'Canva',
      label: 'Cv',
      color: '#00C4CC',
      bgColor: 'rgba(0, 196, 204, 0.18)',
      borderColor: 'rgba(0, 196, 204, 0.45)',
      posClass: 'bottom-1 left-2 sm:left-[7%] sm:bottom-[6%]',
      direction: -1,
    },
  ];

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-60px)] lg:min-h-screen flex items-center justify-center pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 overflow-hidden transition-colors duration-300 w-full max-w-full"
      style={{
        background: 'var(--bg-gradient)'
      }}
    >
      {/* Background Radial Glows and Decorative Lines */}
      <div className="absolute inset-0 z-0">
        {/* Soft red glow on left */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-accent-primary/5 blur-[120px]" />

        {/* Dark red glow on right */}
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full bg-accent-secondary/10 blur-[120px]" />

        {/* Thin decorative circular lines in background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50%" cy="50%" r="220" fill="none" stroke="var(--accent-primary)" strokeOpacity="0.05" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="380" fill="none" stroke="var(--accent-primary)" strokeOpacity="0.03" strokeWidth="1" strokeDasharray="5,5" />
          <path d="M 0,200 Q 300,100 600,300 T 1200,200" fill="none" stroke="var(--accent-primary)" strokeOpacity="0.02" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 w-full box-border relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
        {/* Left Side Content */}
        <div className="lg:col-span-7 flex flex-col items-start w-full max-w-full" id="hero-left-content">
          {/* Availability Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-3 text-xs text-text-primary"
            id="hero-availability-status"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="font-bold text-accent-primary">Available for Freelance Projects</span>
            <span className="hidden sm:inline text-text-muted">• Jaipur &amp; Across India</span>
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-accent-primary font-semibold text-xs sm:text-base lg:text-lg uppercase tracking-wider mb-1.5 sm:mb-2.5"
            id="hero-greeting"
          >
            {greeting}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl min-[360px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-text-primary tracking-tight mb-2 sm:mb-3 leading-[1.15] break-words max-w-full"
            id="hero-name"
          >
            {name}<span className="text-accent-primary">.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-[11px] min-[360px]:text-xs sm:text-sm md:text-base font-bold text-text-secondary tracking-wide uppercase mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 flex-wrap"
            id="hero-core-profession"
          >
            <span>Graphic Designer & Video Editor</span>
            <span className="text-accent-primary">•</span>
            <span>Jaipur, India</span>
          </motion.div>

          {/* Animated Professional Title */}
          <div
            className="min-h-[38px] sm:min-h-[56px] lg:min-h-[76px] xl:min-h-[84px] mb-3 sm:mb-5 overflow-hidden flex items-center w-full max-w-full"
            id="hero-title-animation-box"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={titleIdx}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-xl min-[360px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-dark bg-clip-text text-transparent leading-tight py-1 block w-full truncate sm:overflow-visible sm:whitespace-normal"
                id="hero-animated-title"
              >
                {professionalTitles[titleIdx % professionalTitles.length]}
              </motion.span>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-text-secondary text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed mb-6 sm:mb-8 max-w-xl lg:max-w-2xl"
            id="hero-description"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 w-full max-w-full sm:max-w-xl mb-5"
            id="hero-primary-actions"
          >
            <button
              onClick={handlePrimaryCta}
              className="group flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white border border-transparent font-semibold px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl shadow-xs active:scale-[0.98] transition-all duration-150 cursor-pointer text-sm sm:text-base w-full sm:w-auto min-h-[44px]"
              id="hero-cta-hire"
            >
              <span>{primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
            </button>

            <button
              onClick={handleSecondaryCta}
              className="flex items-center justify-center gap-2 bg-bg-card hover:bg-bg-secondary text-text-primary border border-border-color hover:border-text-primary/30 font-semibold px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl active:scale-[0.98] transition-all duration-150 text-sm sm:text-base cursor-pointer w-full sm:w-auto min-h-[44px]"
              id="hero-cta-work"
            >
              {secondaryCtaText}
            </button>
          </motion.div>

          {/* Quick Direct Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs w-full max-w-full"
            id="hero-quick-contacts"
          >
            <a
              href={WHATSAPP_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Rohit Verma on WhatsApp Business"
              className="flex items-center gap-2 bg-bg-card hover:bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-color hover:border-border-color/80 font-medium px-3.5 py-2 rounded-lg transition-colors text-xs flex-shrink-0 min-h-[36px]"
              id="hero-cta-whatsapp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-accent-primary shrink-0" />
              <span>WhatsApp</span>
            </a>
            <a
              href={contactConfig.emailHref}
              aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
              className="flex items-center gap-2 bg-bg-card hover:bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-color hover:border-border-color/80 font-medium px-3.5 py-2 rounded-lg transition-colors contact-email text-xs min-w-0 max-w-full min-h-[36px]"
              id="hero-cta-email"
            >
              <Mail className="w-3.5 h-3.5 text-accent-primary shrink-0" />
              <span className="truncate">{contactConfig.emailDisplay}</span>
            </a>
            <a
              href={contactConfig.phoneHref}
              aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
              className="flex items-center gap-2 bg-bg-card hover:bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-color hover:border-border-color/80 font-medium px-3.5 py-2 rounded-lg transition-colors text-xs flex-shrink-0 whitespace-nowrap min-h-[36px]"
              id="hero-cta-call"
            >
              <Phone className="w-3.5 h-3.5 text-accent-primary shrink-0" />
              <span>{contactConfig.phoneDisplay}</span>
            </a>
          </motion.div>
        </div>

        {/* Right Side Portrait and Refined Badges */}
        <div className="lg:col-span-5 flex justify-center items-center relative my-4 sm:my-8 lg:my-0 w-full max-w-full overflow-hidden sm:overflow-visible" id="hero-right-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative w-[230px] h-[230px] min-[360px]:w-[250px] min-[360px]:h-[250px] min-[400px]:w-[290px] min-[400px]:h-[290px] sm:w-[360px] sm:h-[360px] md:w-[400px] md:h-[400px] lg:w-[420px] lg:h-[420px] xl:w-[460px] xl:h-[460px] mx-auto select-none max-w-full"
            id="portrait-container"
          >
            {/* 1. Concentric Subtle Geometric Frame Ring (z-index: 1) */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] h-[92%] rounded-full border border-border-color/60 bg-bg-secondary/20 pointer-events-none z-[1]"
              aria-hidden="true"
            />

            {/* 2. Central Portrait & Clean Circular Frame - Centered at 50%/50% (z-index: 2) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[76%] h-[76%] rounded-full p-2 border-2 border-accent-primary/80 shadow-lg bg-bg-secondary flex items-center justify-center z-[2]">
              <div className="w-full h-full rounded-full overflow-hidden bg-bg-secondary relative flex items-center justify-center">
                <img
                  src={portrait}
                  alt="Portrait of Rohit Verma - Graphic Designer and Video Editor in Jaipur, India"
                  width="440"
                  height="440"
                  fetchPriority="high"
                  className="w-full h-full object-cover object-center scale-[1.08]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (e.currentTarget.src !== window.location.origin + '/images/rohit-verma-portrait.jpg') {
                      e.currentTarget.src = '/images/rohit-verma-portrait.jpg';
                    }
                  }}
                />
              </div>
            </div>

            {/* 3. Floating Software Badges (z-index: 3) */}
            {softwareCards.map((software) => (
              <div
                key={software.name}
                className={`absolute ${software.posClass} z-[3] pointer-events-none`}
              >
                <div
                  className="software-floating-card px-2.5 py-1.5 rounded-lg bg-bg-card/95 backdrop-blur-sm border border-border-color flex items-center gap-2 shadow-xs whitespace-nowrap"
                  id={`software-card-${software.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0"
                    style={{
                      backgroundColor: software.bgColor,
                      color: software.color,
                    }}
                  >
                    {software.label}
                  </div>
                  <span className="text-text-primary text-xs font-semibold">{software.name}</span>
                </div>
              </div>
            ))}

            {/* 4. Sleek 100+ Creative Projects Metric Badge (z-index: 4) */}
            <div className="absolute right-[2%] bottom-[2%] sm:bottom-[3%] z-[4] pointer-events-none">
              <div
                className="bg-bg-card/95 backdrop-blur-sm text-text-primary px-3.5 py-2.5 rounded-xl shadow-md border border-border-color flex items-center gap-3 whitespace-nowrap"
                id="hero-floating-badge"
              >
                <div className="w-2 h-8 rounded-full bg-accent-primary shrink-0" />
                <div>
                  <div className="text-base sm:text-lg font-extrabold text-text-primary leading-none">100+</div>
                  <div className="text-[10px] sm:text-[11px] uppercase font-semibold text-text-muted leading-tight mt-0.5">Creative Projects</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
