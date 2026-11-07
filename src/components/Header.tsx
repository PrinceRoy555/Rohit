import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, FileText, MessageCircle, ArrowRight } from 'lucide-react';
import { WHATSAPP_BUSINESS_URL, contactConfig, ROHIT_PROFILE_IMAGE_URL, getAuthoritativeProfileImage } from '../data';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useTheme } from '../context/ThemeContext';
import { useBodyScrollLock } from '../lib/scrollLock';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  activeSection: string;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  currentRoute?: string;
  onNavigate?: (routeId: string) => void;
}

const navLinks = [
  { label: 'Home', id: 'home' },
  { label: 'About Rohit', id: 'about-rohit' },
  { label: 'Services', id: 'services' },
  { label: 'Portfolio', id: 'portfolio' },
  { label: 'Experience', id: 'experience' },
  { label: 'Blog', id: 'blog' },
  { label: 'Contact', id: 'contact' },
];

export default function Header({ activeSection, theme: propTheme, toggleTheme: propToggleTheme, currentRoute = 'home', onNavigate }: HeaderProps) {
  const { activeConfig } = useSiteConfig();
  const themeContext = useTheme();
  const theme = propTheme || themeContext.resolvedTheme;
  const toggleTheme = propToggleTheme || themeContext.toggleTheme;
  const branding = activeConfig?.branding;
  const siteName = branding?.siteName || branding?.logoText || 'Rohit';
  const avatar = getAuthoritativeProfileImage(branding?.avatarImage);
  const EXACT_RESUME_URL = "https://ik.imagekit.io/auhuory9w/website%20work/resume/Rohit%20Verma%20(2)%20(3).pdf";
  const resumeUrl = branding?.resumeUrl || EXACT_RESUME_URL;

  const navItems = React.useMemo(() => {
    if (activeConfig?.navigation?.items && activeConfig.navigation.items.length > 0) {
      return activeConfig.navigation.items
        .filter((item) => item.isVisible !== false)
        .map((item) => ({
          label: item.label,
          id: item.route || item.id.replace(/^nav-/, ''),
        }));
    }
    return navLinks;
  }, [activeConfig?.navigation?.items]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Centralized scroll lock for mobile menu
  useBodyScrollLock(isMobileMenuOpen, 'header-mobile-menu');

  useEffect(() => {
    let ticking = false;
    let isScrolledVal = false;

    const updateScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolledVal) {
        isScrolledVal = scrolled;
        setIsScrolled(scrolled);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      ticking = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const isHomeRoute = currentRoute === 'home' || !currentRoute || currentRoute === '/';

  const isLinkActive = (linkId: string) => {
    if (linkId === 'home') {
      return isHomeRoute && (activeSection === 'home' || !activeSection);
    }
    if (linkId === 'about-rohit') {
      return activeSection === 'about-rohit' || activeSection === 'rohit-verma' || (isHomeRoute && activeSection === 'about');
    }
    if (linkId === 'services') {
      return activeSection === 'services' || activeSection.startsWith('service');
    }
    if (linkId === 'portfolio') {
      return activeSection === 'portfolio' || activeSection.startsWith('portfolio');
    }
    if (linkId === 'experience') {
      return activeSection === 'experience';
    }
    if (linkId === 'blog') {
      return activeSection === 'blog' || activeSection.startsWith('blog');
    }
    if (linkId === 'contact') {
      return activeSection === 'contact';
    }
    return activeSection === linkId;
  };

  const handleHomeNavigation = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }

    // 1. Close mobile navigation menu if open
    setIsMobileMenuOpen(false);

    // 2. Trigger route navigation to '/'
    if (onNavigate) {
      onNavigate('home');
    } else {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '/');
        window.dispatchEvent(new Event('popstate'));
      } else {
        window.location.hash = '';
      }
    }

    // 3. Scroll homepage to top cleanly on click
    const scrollBehavior = isHomeRoute ? 'smooth' : 'auto';
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: scrollBehavior
    });
  };

  const scrollToSection = (id: string, e?: React.MouseEvent) => {
    if (id === 'home') {
      handleHomeNavigation(e);
      return;
    }

    setIsMobileMenuOpen(false);

    if (id === 'about-rohit') {
      if (onNavigate) {
        onNavigate('about-rohit');
      } else {
        window.location.hash = 'about-rohit';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    if (isHomeRoute) {
      const targetElement = document.getElementById(id) || document.getElementById(id === 'about-rohit' ? 'about' : id);
      if (targetElement) {
        const headerOffset = window.innerWidth < 768 ? 68 : 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', `#${id}`);
        } else {
          window.location.hash = id;
        }
      }
    } else {
      if (onNavigate) {
        onNavigate(id);
      } else {
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', `/${id}`);
          window.dispatchEvent(new Event('popstate'));
        } else {
          window.location.hash = id;
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  };

  return (
    <>
      <header
        className={`site-header ${isScrolled ? 'py-2 sm:py-3 shadow-md' : 'py-2.5 sm:py-4'}`}
        id="app-header"
      >
        <div className="header-inner header-container">
          {/* Left: Rohit Brand Link */}
          <a
            className="header-brand group cursor-pointer min-w-0 flex-shrink"
            href="/"
            onClick={handleHomeNavigation}
            id="logo-container"
            aria-label="Rohit Verma Homepage"
          >
            <img
              src={avatar}
              alt="Rohit Verma – Graphic Designer and Video Editor in Jaipur"
              width="36"
              height="36"
              className="header-avatar header-brand-image object-cover object-[center_top] group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (e.currentTarget.src !== ROHIT_PROFILE_IMAGE_URL) {
                  e.currentTarget.src = ROHIT_PROFILE_IMAGE_URL;
                }
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="header-brand-text header-brand-name text-text-primary truncate">
                {siteName}<span className="brand-dot text-accent-primary">.</span>
              </span>
              {isHomeRoute && (
                <span className="hidden sm:block text-[8px] font-mono tracking-[0.2em] text-text-muted uppercase leading-none mt-0.5">
                  CREATIVE DESIGNER
                </span>
              )}
            </div>
          </a>

          {/* Centre: Navigation Capsule */}
          <nav className="header-navigation main-navigation desktop-navigation" aria-label="Primary navigation">
            {navItems.map((link) => {
              const active = isLinkActive(link.id);
              const isHome = link.id === 'home';
              return (
                <a
                  key={link.id}
                  href={isHome ? '/' : `/${link.id}`}
                  onClick={(e) => (isHome ? handleHomeNavigation(e) : scrollToSection(link.id, e))}
                  className={`relative inline-flex items-center justify-center rounded-full whitespace-nowrap transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary cursor-pointer px-4 py-2 ${
                    active
                      ? 'active text-white font-bold'
                      : 'text-[#101C38] dark:text-[#B8C9E8] hover:text-[#0866F5] dark:hover:text-white font-semibold'
                  }`}
                  style={{
                    color: active ? '#FFFFFF' : undefined,
                    zIndex: active ? 2 : 1
                  }}
                  aria-current={active ? 'page' : undefined}
                  id={`nav-link-${link.id}`}
                >
                  {active && (
                    <motion.span
                      layoutId="activePillBg"
                      className="absolute inset-0 rounded-full pointer-events-none bg-[#0866F5] shadow-xs"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className="relative transition-colors duration-150"
                    style={{
                      zIndex: 1,
                      color: active ? '#FFFFFF' : undefined
                    }}
                  >
                    {link.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Right: Action Controls Group */}
          <div className="header-actions">
            {/* WhatsApp Button - Visible on tablet/desktop (>= 640px) - Deep Navy */}
            <a
              href={WHATSAPP_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-button hidden sm:inline-flex items-center justify-center gap-1.5 h-9 sm:h-[42px] px-3.5 sm:px-4 rounded-full text-white font-bold text-xs sm:text-sm whitespace-nowrap active:scale-95 transition-all duration-200 shadow-sm bg-[#071B49] hover:bg-[#0c286d] flex-shrink-0"
              id="header-whatsapp-btn"
              aria-label="Contact Rohit Verma on WhatsApp Business"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.25] flex-shrink-0" />
              <span className="text-white font-bold">WhatsApp</span>
            </a>

            {/* Animated Sun/Moon Theme Toggle - Always visible, 44-46px touch target */}
            <ThemeToggle
              theme={theme}
              toggleTheme={toggleTheme}
              id="header-theme-toggle"
              aria-label="Toggle dark mode"
            />

            {/* View Resume Button - Visible on desktop (>= 1024px) - Deep Navy */}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="resume-button hidden lg:inline-flex items-center justify-center gap-2 h-[42px] min-h-[42px] px-5 rounded-full text-white font-bold text-xs sm:text-sm whitespace-nowrap active:scale-95 transition-all duration-200 shadow-sm bg-[#071B49] hover:bg-[#0c286d] flex-shrink-0"
              id="download-resume-btn"
              aria-label="Open Rohit Verma Resume PDF"
            >
              <FileText className="w-4 h-4 text-white stroke-[2.25] flex-shrink-0" aria-hidden="true" />
              <span className="text-white font-bold">Resume</span>
            </a>

            {/* Let's Work Together Button - Homepage wide desktop (>= 1440px only, avoiding any crowded spacing below 1440px) - Royal Blue */}
            {isHomeRoute && (
              <a
                href="#contact"
                onClick={(e) => scrollToSection('contact', e)}
                className="hidden min-[1440px]:inline-flex items-center justify-center gap-2 h-[42px] min-h-[42px] px-5 rounded-full !text-white font-bold text-xs sm:text-sm whitespace-nowrap active:scale-95 transition-all duration-200 shadow-md bg-accent-primary hover:bg-accent-secondary shadow-accent-primary/25 flex-shrink-0"
                id="header-work-together-btn"
                aria-label="Let's Work Together - Contact Rohit Verma"
              >
                <span className="!text-white">Let&apos;s Work Together</span>
                <ArrowRight className="w-3.5 h-3.5 !text-white" aria-hidden="true" />
              </a>
            )}

            {/* Hamburger Menu Toggle (Mobile & Tablet < 1024px) - 44x44px Touch Target */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-border-color bg-bg-card text-accent-primary hover:bg-accent-primary hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-[54px] sm:top-[60px] z-[9999] flex flex-col justify-between p-5 sm:p-7 lg:hidden overflow-y-auto bg-bg-primary text-text-primary shadow-2xl border-t border-border-color pb-[max(28px,env(safe-area-inset-bottom))] px-[max(16px,env(safe-area-inset-left))]"
            style={{ minHeight: 'calc(100dvh - 58px)' }}
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="flex flex-col gap-4">
              {/* Quick Primary Actions: WhatsApp & Resume */}
              <div className="grid grid-cols-2 gap-3" id="mobile-menu-quick-actions">
                <a
                  href={WHATSAPP_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Contact Rohit Verma on WhatsApp Business"
                  className="flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white font-bold py-3 px-3 rounded-2xl text-sm shadow-md active:scale-95 transition-all min-h-[46px] text-center cursor-pointer"
                  id="mobile-menu-whatsapp-btn"
                >
                  <MessageCircle className="w-4 h-4 fill-current flex-shrink-0" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setTimeout(() => setIsMobileMenuOpen(false), 150);
                  }}
                  aria-label="Open Rohit Verma Resume PDF"
                  className="flex items-center justify-center gap-2 border border-border-color bg-bg-card hover:bg-bg-secondary text-text-primary hover:text-accent-primary font-bold py-3 px-3 rounded-2xl text-sm shadow-xs active:scale-95 transition-all min-h-[46px] text-center cursor-pointer"
                  id="mobile-menu-resume-btn"
                >
                  <FileText className="w-4 h-4 text-accent-primary flex-shrink-0" aria-hidden="true" />
                  <span>Resume</span>
                </a>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border-color/60">
                {navItems.map((link, idx) => {
                  const active = isLinkActive(link.id);
                  const isHome = link.id === 'home';
                  return (
                    <motion.a
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      key={link.id}
                      href={isHome ? '/' : `/${link.id}`}
                      onClick={(e) => (isHome ? handleHomeNavigation(e) : scrollToSection(link.id, e))}
                      className={`text-left text-lg font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-accent-primary/15 text-accent-primary border-l-4 border-accent-primary font-extrabold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/60'
                      }`}
                      id={`mobile-nav-link-${link.id}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span>{link.label}</span>
                      {active && <span className="w-2 h-2 rounded-full bg-accent-primary pointer-events-none" />}
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Bottom: Theme Mode & Location Footer */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border-color mt-5">
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-bg-card/60 border border-border-color/70">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary">Theme Appearance</span>
                  <span className="text-xs text-text-secondary capitalize">{theme === 'dark' ? 'Dark theme active' : 'Light theme active'}</span>
                </div>
                <ThemeToggle
                  theme={theme}
                  toggleTheme={toggleTheme}
                  id="mobile-theme-toggle"
                  aria-label="Toggle dark mode"
                />
              </div>

              <div className="text-center text-xs font-medium text-text-muted mt-1">
                Jaipur, Rajasthan, India • Rohit Verma Portfolio
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
