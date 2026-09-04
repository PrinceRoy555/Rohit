import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, FileText, MessageCircle } from 'lucide-react';
import { WHATSAPP_BUSINESS_URL, contactConfig } from '../data';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useTheme } from '../context/ThemeContext';
import { useBodyScrollLock } from '../lib/scrollLock';
import ThemeToggle from './ThemeToggle';
import avatarImg from '../assets/images/rohit-verma-portrait.jpg';

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
  const siteName = branding?.siteName || 'Rohit';
  const avatar = branding?.avatarImage || avatarImg;
  const resumeUrl = branding?.resumeUrl || contactConfig.resumePdfUrl;

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
        className={`site-header ${isScrolled ? 'py-3 shadow-md' : 'py-4'}`}
        id="app-header"
      >
        <div className="header-inner header-container">
          {/* Left: Rohit Brand Link */}
          <a
            className="header-brand group cursor-pointer"
            href="/"
            onClick={handleHomeNavigation}
            id="logo-container"
            aria-label="Rohit Verma Homepage"
          >
            <img
              src={avatar}
              alt={siteName}
              width="36"
              height="36"
              className="header-avatar header-brand-image object-cover object-[50%_25%] group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + '/images/rohit-avatar.jpg') {
                  e.currentTarget.src = '/images/rohit-avatar.jpg';
                }
              }}
            />
            <span className="header-brand-text header-brand-name text-text-primary">
              {siteName}<span className="brand-dot text-accent-primary">.</span>
            </span>
          </a>

          {/* Centre: Navigation Capsule */}
          <nav className="header-navigation main-navigation desktop-navigation" aria-label="Primary navigation">
            {navLinks.map((link) => {
              const active = isLinkActive(link.id);
              const isHome = link.id === 'home';
              return (
                <a
                  key={link.id}
                  href={isHome ? '/' : `/${link.id}`}
                  onClick={(e) => (isHome ? handleHomeNavigation(e) : scrollToSection(link.id, e))}
                  className={`relative inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary cursor-pointer ${
                    active ? 'active' : ''
                  }`}
                  aria-current={active ? 'page' : undefined}
                  id={`nav-link-${link.id}`}
                >
                  {active && (
                    <motion.span
                      layoutId="activePillBg"
                      className="absolute inset-0 rounded-full -z-10 pointer-events-none bg-accent-primary/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right: Action Controls Group */}
          <div className="header-actions">
            {/* WhatsApp Button */}
            <a
              href={WHATSAPP_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-button hidden sm:inline-flex items-center justify-center gap-2 h-[42px] min-h-[42px] px-4 rounded-full text-white font-bold text-xs sm:text-sm whitespace-nowrap active:scale-95 transition-all duration-200 shadow-md bg-accent-primary hover:bg-accent-secondary"
              id="header-whatsapp-btn"
              aria-label="Contact Rohit Verma on WhatsApp Business"
            >
              <MessageCircle className="w-4 h-4 text-white stroke-[2.25] flex-shrink-0" />
              <span className="text-white font-bold">WhatsApp</span>
            </a>

            {/* Animated Sun/Moon Theme Toggle */}
            <ThemeToggle
              theme={theme}
              toggleTheme={toggleTheme}
              id="header-theme-toggle"
            />

            {/* View Resume Button */}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="resume-button hidden sm:inline-flex items-center justify-center gap-2 h-[42px] min-h-[42px] px-5 rounded-full text-white font-bold text-xs sm:text-sm whitespace-nowrap active:scale-95 transition-all duration-200 shadow-md bg-accent-primary hover:bg-accent-secondary"
              id="download-resume-btn"
              aria-label="Open Rohit Verma Resume PDF"
            >
              <FileText className="w-4 h-4 text-white stroke-[2.25] flex-shrink-0" aria-hidden="true" />
              <span className="text-white font-bold">View Resume</span>
            </a>

            {/* Hamburger Menu Toggle (Mobile / Tablet) - 44x44px Touch Target */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-border-color bg-bg-card text-accent-primary hover:bg-accent-primary hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[70px] sm:top-[76px] z-50 flex flex-col justify-between p-6 sm:p-8 lg:hidden overflow-y-auto bg-bg-primary text-text-primary shadow-2xl border-t border-border-color pb-[max(32px,env(safe-area-inset-bottom))] px-[max(20px,env(safe-area-inset-left))]"
            style={{ minHeight: 'calc(100dvh - 70px)' }}
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link, idx) => {
                const active = isLinkActive(link.id);
                const isHome = link.id === 'home';
                return (
                  <motion.a
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    key={link.id}
                    href={isHome ? '/' : `/${link.id}`}
                    onClick={(e) => (isHome ? handleHomeNavigation(e) : scrollToSection(link.id, e))}
                    className={`text-left text-xl font-bold py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-between cursor-pointer ${
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

            <div className="flex flex-col gap-3.5 pt-6 border-t border-border-color mt-6">
              {/* Theme Toggle inside Mobile Drawer */}
              <div className="flex items-center justify-between py-2 px-1">
                <span className="text-sm font-semibold text-text-secondary">Theme Mode</span>
                <ThemeToggle
                  theme={theme}
                  toggleTheme={toggleTheme}
                  id="mobile-theme-toggle"
                />
              </div>

              {/* WhatsApp Option inside Drawer */}
              <a
                href={WHATSAPP_BUSINESS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Contact Rohit Verma on WhatsApp Business"
                className="flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-full text-sm active:scale-95 transition-all duration-200 bg-accent-primary hover:bg-accent-secondary shadow-md"
                id="mobile-header-whatsapp-btn"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Chat on WhatsApp
              </a>

              {/* View Resume Option inside Drawer */}
              <a
                href={contactConfig.resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-full text-sm active:scale-95 transition-all duration-200 bg-accent-primary hover:bg-accent-secondary shadow-md"
                id="mobile-download-resume-btn"
                aria-label="Open Rohit Verma Resume PDF"
              >
                <FileText className="w-4 h-4 text-white flex-shrink-0" aria-hidden="true" />
                <span>View Resume</span>
              </a>

              <div className="text-center text-xs font-medium text-text-muted mt-2">
                Jaipur, Rajasthan, India • Rohit Verma Portfolio
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
