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
  const description = branding?.bio || 'I combine branding, motion mechanics, visual storytelling, and advanced AI systems to develop engaging digital content, social media creatives, and premium web layouts that help businesses stand out and connect with their audience.';
  const primaryCtaText = hero?.ctaPrimaryText || "Let's Work Together";
  const secondaryCtaText = hero?.ctaSecondaryText || 'View Portfolio';
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

  // Software floating cards details with dedicated brand accents & balanced radial orbit positioning
  const softwareCards = [
    {
      name: 'Photoshop',
      label: 'Ps',
      color: '#31A8FF',
      bgColor: 'rgba(49, 168, 255, 0.18)',
      borderColor: 'rgba(49, 168, 255, 0.45)',
      posClass: 'top-0 left-0 sm:left-[2%] sm:top-[8%]',
      direction: -1,
    },
    {
      name: 'Illustrator',
      label: 'Ai',
      color: '#FF9A00',
      bgColor: 'rgba(255, 154, 0, 0.18)',
      borderColor: 'rgba(255, 154, 0, 0.45)',
      posClass: 'top-0 right-0 sm:right-[2%] sm:top-[8%]',
      direction: 1,
    },
    {
      name: 'Premiere Pro',
      label: 'Pr',
      color: '#EA77FF',
      bgColor: 'rgba(234, 119, 255, 0.18)',
      borderColor: 'rgba(234, 119, 255, 0.45)',
      posClass: 'top-[52%] -left-1 sm:left-0 sm:top-[48%] sm:-translate-y-1/2',
      direction: 1,
    },
    {
      name: 'After Effects',
      label: 'Ae',
      color: '#9999FF',
      bgColor: 'rgba(153, 153, 255, 0.18)',
      borderColor: 'rgba(153, 153, 255, 0.45)',
      posClass: 'top-[52%] -right-1 sm:right-0 sm:top-[48%] sm:-translate-y-1/2',
      direction: -1,
    },
    {
      name: 'Canva',
      label: 'Cv',
      color: '#00C4CC',
      bgColor: 'rgba(0, 196, 204, 0.18)',
      borderColor: 'rgba(0, 196, 204, 0.45)',
      posClass: 'bottom-0 left-[2%] sm:left-[7%] sm:bottom-[6%]',
      direction: -1,
    },
  ];

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-76px)] lg:min-h-screen flex items-center justify-center pt-24 lg:pt-28 pb-16 lg:pb-20 overflow-hidden transition-colors duration-300"
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

      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center">
        {/* Left Side Content */}
        <div className="lg:col-span-7 flex flex-col items-start w-full max-w-full" id="hero-left-content">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-accent-primary font-semibold text-sm sm:text-base lg:text-lg uppercase tracking-wider mb-2 sm:mb-3"
            id="hero-greeting"
          >
            {greeting}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-text-primary tracking-tight mb-2 sm:mb-3 break-words max-w-full"
            id="hero-name"
          >
            {name}<span className="text-accent-primary">.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-xs sm:text-sm md:text-base font-bold text-text-secondary tracking-wide uppercase mb-2 flex items-center gap-2 flex-wrap"
            id="hero-core-profession"
          >
            <span>Graphic Designer & Video Editor</span>
            <span className="text-accent-primary">•</span>
            <span>Jaipur, India</span>
          </motion.div>

          {/* Animated Professional Title */}
          <div
            className="min-h-[48px] sm:min-h-[60px] lg:min-h-[76px] xl:min-h-[84px] mb-4 sm:mb-6 overflow-hidden flex items-center w-full max-w-full"
            id="hero-title-animation-box"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={titleIdx}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -24 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-dark bg-clip-text text-transparent leading-tight py-1 block w-full truncate sm:overflow-visible sm:whitespace-normal"
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
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-xl mb-5"
            id="hero-primary-actions"
          >
            <button
              onClick={scrollToContact}
              className="group flex items-center justify-center gap-2.5 bg-accent-primary hover:bg-accent-secondary text-white border border-accent-primary font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-full shadow-lg hover:shadow-[0_12px_32px_var(--shadow-color)] active:scale-95 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-sm sm:text-base w-full sm:w-auto"
              id="hero-cta-hire"
            >
              {primaryCtaText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={scrollToPortfolio}
              className="flex items-center justify-center gap-2 bg-bg-card hover:bg-bg-secondary text-text-primary hover:text-accent-primary border border-border-color hover:border-accent-primary font-bold px-6 py-3.5 sm:px-7 sm:py-4 rounded-full active:scale-95 hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base cursor-pointer w-full sm:w-auto"
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
            className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs w-full max-w-full"
            id="hero-quick-contacts"
          >
            <a
              href={WHATSAPP_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Rohit Verma on WhatsApp Business"
              className="flex items-center gap-1.5 bg-bg-card hover:bg-accent-primary/10 text-text-secondary hover:text-accent-primary border border-border-color hover:border-accent-primary font-semibold px-3.5 py-2 sm:px-4 sm:py-2 rounded-full transition-all duration-200 text-xs"
              id="hero-cta-whatsapp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-accent-primary fill-current" />
              <span>WhatsApp</span>
            </a>
            <a
              href={contactConfig.emailHref}
              aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
              className="flex items-center gap-1.5 bg-bg-card hover:bg-accent-primary/10 text-text-secondary hover:text-accent-primary border border-border-color hover:border-accent-primary font-semibold px-3.5 py-2 sm:px-4 sm:py-2 rounded-full transition-all duration-200 contact-email text-xs max-w-full truncate"
              id="hero-cta-email"
            >
              <Mail className="w-3.5 h-3.5 text-accent-primary shrink-0" />
              <span className="truncate">{contactConfig.emailDisplay}</span>
            </a>
            <a
              href={contactConfig.phoneHref}
              aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
              className="flex items-center gap-1.5 bg-bg-card hover:bg-accent-primary/10 text-text-secondary hover:text-accent-primary border border-border-color hover:border-accent-primary font-semibold px-3.5 py-2 sm:px-4 sm:py-2 rounded-full transition-all duration-200 text-xs"
              id="hero-cta-call"
            >
              <Phone className="w-3.5 h-3.5 text-accent-primary" />
              <span>{contactConfig.phoneDisplay}</span>
            </a>
          </motion.div>
        </div>

        {/* Right Side Portrait and Floating Badges */}
        <div className="lg:col-span-5 flex justify-center items-center relative my-6 sm:my-8 lg:my-0 w-full max-w-full overflow-visible" id="hero-right-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-[270px] h-[270px] min-[380px]:w-[310px] min-[380px]:h-[310px] sm:w-[380px] sm:h-[380px] md:w-[420px] md:h-[420px] lg:w-[440px] lg:h-[440px] xl:w-[480px] xl:h-[480px] mx-auto select-none overflow-visible max-w-full"
            id="portrait-container"
          >
            {/* 1. Outer Red Orbit Ring (Dashed) - Concentric at 50%/50% (z-index: 1) */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] rounded-full border border-dashed border-accent-primary/45 pointer-events-none z-[1]"
              aria-hidden="true"
            />

            {/* 2. Inner Orbit Halo Ring with soft ring frame - Concentric at 50%/50% (z-index: 1) */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[84%] h-[84%] rounded-full border border-accent-primary/30 bg-bg-secondary/40 pointer-events-none z-[1]"
              aria-hidden="true"
            />

            {/* 3. Bright radial glowing circle behind portrait (Crimson/Ruby) at 50%/50% (z-index: 1) */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[74%] h-[74%] rounded-full blur-xl opacity-75 z-[1] animate-pulse pointer-events-none"
              style={{
                background: 'radial-gradient(circle, var(--shadow-color) 0%, rgba(165, 12, 24, 0.25) 50%, transparent 72%)'
              }}
              aria-hidden="true"
            />

            {/* 4. Central Portrait & Main Red Circular Frame - Centered at 50%/50% (z-index: 2) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] h-[72%] rounded-full p-2 sm:p-2.5 border-[3px] border-accent-primary shadow-[0_0_35px_var(--shadow-color)] bg-bg-secondary flex items-center justify-center z-[2]">
              <div className="w-full h-full rounded-full overflow-hidden bg-bg-secondary relative flex items-center justify-center">
                <img
                  src={portrait}
                  alt="Portrait of Rohit Verma - Graphic Designer and Video Editor in Jaipur, India"
                  width="440"
                  height="440"
                  fetchPriority="high"
                  className="w-full h-full object-cover object-center scale-[1.12]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (e.currentTarget.src !== window.location.origin + '/images/rohit-verma-portrait.jpg') {
                      e.currentTarget.src = '/images/rohit-verma-portrait.jpg';
                    }
                  }}
                />
              </div>
            </div>

            {/* 5. Floating Software Cards (z-index: 3) */}
            {softwareCards.map((software, idx) => (
              <div
                key={software.name}
                className={`absolute ${software.posClass} z-[3] pointer-events-none`}
              >
                <motion.div
                  className="software-floating-card p-1.5 sm:p-2 lg:p-2.5 rounded-2xl bg-bg-secondary/95 backdrop-blur-md border flex items-center gap-2 sm:gap-2.5 shadow-[0_10px_25px_var(--shadow-color)] whitespace-nowrap"
                  style={{
                    borderColor: software.borderColor,
                  }}
                  animate={shouldReduceMotion ? {} : {
                    y: [0, software.direction * 6, 0],
                  }}
                  transition={{
                    duration: idx % 2 === 0 ? 5 : 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: idx * 0.35,
                  }}
                  id={`software-card-${software.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center font-extrabold text-xs sm:text-sm lg:text-base shrink-0"
                    style={{
                      backgroundColor: software.bgColor,
                      color: software.color,
                    }}
                  >
                    {software.label}
                  </div>
                  <span className="text-text-primary text-[11px] sm:text-xs lg:text-sm font-bold pr-1">{software.name}</span>
                </motion.div>
              </div>
            ))}

            {/* 6. Floating 150+ Creative Projects Badge (z-index: 4) */}
            <div className="absolute right-[1%] sm:right-[3%] bottom-[3%] sm:bottom-[4%] z-[4] pointer-events-none">
              <motion.div
                className="bg-accent-primary text-white py-2 px-4 sm:py-3 sm:px-6 lg:py-3.5 lg:px-7 rounded-2xl sm:rounded-3xl shadow-2xl shadow-accent-primary/40 border border-accent-secondary/40 flex flex-col items-center whitespace-nowrap"
                animate={shouldReduceMotion ? {} : {
                  y: [0, 6, 0],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                id="hero-floating-badge"
              >
                <span className="text-base sm:text-xl lg:text-2xl font-black tracking-tight leading-tight">150+</span>
                <span className="text-[8px] sm:text-[10px] lg:text-[11px] uppercase font-extrabold tracking-wider text-white/95 leading-tight mt-0.5">Creative Projects</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
