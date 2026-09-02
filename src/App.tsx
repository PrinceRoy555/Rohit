import { useState, useEffect, ReactNode, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import ServicesSection from './components/ServicesSection';
import ExperienceSection from './components/ExperienceSection';
import PortfolioSection from './components/PortfolioSection';
import TestimonialSection from './components/TestimonialSection';
import PricingSection from './components/PricingSection';
import BlogSection from './components/BlogSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import FloatingElements from './components/FloatingElements';
import AIChatbot from './components/AIChatbot';
import Preloader from './components/Preloader';
import { updateDocumentMetadata } from './seoConfig';
import { Insight } from './types';
import { fetchInsightBySlug } from './services/firebase/firestore';
import { useTheme } from './context/ThemeContext';
import { useSiteConfig } from './context/SiteConfigContext';

// Code splitting / Lazy-loaded subpages and heavy modules
const NotFound = lazy(() => import('./components/NotFound'));
const MaintenancePage = lazy(() => import('./components/MaintenancePage'));
const AboutRohitPage = lazy(() => import('./components/AboutRohitPage'));
const InsightDetailPage = lazy(() => import('./components/InsightDetailPage'));
const PrivacyPolicyContent = lazy(() => import('./components/PrivacyPolicyContent'));
const TermsAndConditionsContent = lazy(() => import('./components/TermsAndConditionsContent'));
const AdminPanel = lazy(() => import('./components/Admin/AdminPanel').then(m => ({ default: m.AdminPanel })));

interface AnimatedSectionProps {
  children: ReactNode;
}

function AnimatedSection({ children }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function SubpageFallback() {
  return (
    <div className="min-h-[400px] flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [activeInsight, setActiveInsight] = useState<Insight | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const { resolvedTheme: theme, toggleTheme } = useTheme();
  const { activeConfig } = useSiteConfig();

  // Check Maintenance Mode (configurable via CMS or system settings)
  const isMaintenanceMode = Boolean(
    (activeConfig?.branding as any)?.maintenanceMode === true ||
    (activeConfig as any)?.isMaintenanceMode === true ||
    (typeof window !== 'undefined' && (window as any).__MAINTENANCE_MODE__ === true)
  );

  // Track scroll position to update active header link
  useEffect(() => {
    if (currentRoute !== 'home') {
      setActiveSection(currentRoute);
      return;
    }

    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'portfolio', 'experience', 'blog', 'contact'];
      const scrollPosition = window.scrollY + 160;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentRoute]);

  // Support pathname and hash routing with clean fallbacks and dynamic path parsing
  useEffect(() => {
    const handleRouteCheck = async () => {
      const rawPath = window.location.pathname.replace(/^\/|\/$/g, '');
      const rawHash = window.location.hash.replace('#', '').replace(/^\/|\/$/g, '');

      // Clean up lingering #404 hash if on a valid path or homepage
      if (rawHash === '404' && rawPath !== '404') {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }

      const pathSegments = rawPath.split('/').filter(Boolean);
      const topPath = pathSegments[0] ? pathSegments[0].toLowerCase() : '';
      const subPath = pathSegments[1] ? pathSegments[1].toLowerCase() : '';

      const hashSegments = rawHash.split('/').filter(Boolean);
      const topHash = hashSegments[0] ? hashSegments[0].toLowerCase() : '';
      const subHash = hashSegments[1] ? hashSegments[1].toLowerCase() : '';

      // Check if Admin route
      if (topPath === 'admin' || topHash === 'admin') {
        setIsAdminOpen(true);
      }

      // Check if dynamic /insights/[slug] or /blog/[slug] route
      if ((topPath === 'insights' || topPath === 'blog') && subPath) {
        const found = await fetchInsightBySlug(subPath);
        if (found) {
          setActiveInsight(found);
          setCurrentRoute('insight-detail');
          return;
        }
      }
      if ((topHash === 'insights' || topHash === 'blog') && subHash) {
        const found = await fetchInsightBySlug(subHash);
        if (found) {
          setActiveInsight(found);
          setCurrentRoute('insight-detail');
          return;
        }
      }

      // Route lookup map
      const ROUTE_MAP: Record<string, string> = {
        'home': 'home',
        'about-rohit': 'about-rohit',
        'rohit-verma': 'about-rohit',
        'about': 'about',
        'services': 'services',
        'portfolio': 'portfolio',
        'experience': 'experience',
        'unicivix': 'about-rohit',
        'unicivix-solutions': 'about-rohit',
        'blog': 'blog',
        'insights': 'blog',
        'contact': 'contact',
        'pricing': 'services',
        'privacy': 'privacy',
        'privacy-policy': 'privacy',
        'terms': 'terms',
        'terms-and-conditions': 'terms',
        '404': '404'
      };

      // 1. Primary check: If pathname has a non-empty top segment
      if (topPath) {
        if (ROUTE_MAP[topPath]) {
          setActiveInsight(null);
          setCurrentRoute(ROUTE_MAP[topPath]);
        } else {
          // Check if topPath is directly an insight slug (e.g. /visual-psychology-high-ctr)
          const found = await fetchInsightBySlug(topPath);
          if (found) {
            setActiveInsight(found);
            setCurrentRoute('insight-detail');
          } else {
            setCurrentRoute('404');
          }
        }
        return;
      }

      // 2. Secondary check: Pathname is empty (homepage /)
      if (topHash) {
        if (topHash === '404') {
          setCurrentRoute('404');
          return;
        }
        if (ROUTE_MAP[topHash]) {
          setActiveInsight(null);
          setCurrentRoute(ROUTE_MAP[topHash]);
          return;
        }
        // Section hash on homepage like #skills, #testimonials, #about, #services, etc.
        setCurrentRoute('home');
        return;
      }

      // Default to homepage
      setActiveInsight(null);
      setCurrentRoute('home');
    };

    // Keyboard shortcut to open Admin Panel: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleRouteCheck);
    window.addEventListener('popstate', handleRouteCheck);
    handleRouteCheck();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleRouteCheck);
      window.removeEventListener('popstate', handleRouteCheck);
    };
  }, []);

  // Dynamic SEO, Canonical & Structured Data updates per route
  useEffect(() => {
    if (currentRoute !== 'insight-detail') {
      updateDocumentMetadata(currentRoute);
    }
  }, [currentRoute]);

  // Disable browser automatic scroll restoration override
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const handleNavigate = (routeId: string) => {
    const cleanRoute = routeId.toLowerCase().trim();
    setActiveInsight(null);

    if (cleanRoute === 'home' || cleanRoute === '/') {
      if (currentRoute === 'home') {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', '/');
        } else {
          window.location.hash = '';
        }
      } else {
        setCurrentRoute('home');
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', '/');
        } else {
          window.location.hash = '';
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    } else if (cleanRoute === '404') {
      setCurrentRoute('404');
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '/404');
      } else {
        window.location.hash = '404';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else if (cleanRoute === 'admin') {
      setIsAdminOpen(true);
    } else {
      setCurrentRoute(cleanRoute);
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', `/${cleanRoute}`);
      } else {
        window.location.hash = cleanRoute;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  };

  const handleSelectInsight = (insight: Insight) => {
    setActiveInsight(insight);
    setCurrentRoute('insight-detail');
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', `/insights/${insight.slug}`);
    } else {
      window.location.hash = `insights/${insight.slug}`;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Smooth scroll to top on page navigation
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [currentRoute]);

  // Handle Maintenance Mode for public visitors (Admin portal access remains available)
  if (isMaintenanceMode && !isAdminOpen && currentRoute !== 'admin') {
    return (
      <div className="bg-bg-primary text-text-primary min-h-screen flex flex-col justify-between">
        <Suspense fallback={<SubpageFallback />}>
          <MaintenancePage onAdminBypass={() => setIsAdminOpen(true)} />
        </Suspense>
      </div>
    );
  }

  // 404 Screen for non-existent paths
  if (currentRoute === '404') {
    return (
      <div className="bg-bg-primary text-text-primary min-h-screen flex flex-col justify-between">
        <Preloader />
        <Header activeSection="404" currentRoute="404" theme={theme} toggleTheme={toggleTheme} onNavigate={handleNavigate} />
        <Suspense fallback={<SubpageFallback />}>
          <NotFound onBackToHome={() => handleNavigate('home')} />
        </Suspense>
        <Footer onNavigate={handleNavigate} />
        <FloatingElements />
      </div>
    );
  }

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen selection:bg-accent-primary selection:text-white transition-colors duration-300" id="portfolio-app-root">
      {/* Global Preloader */}
      <Preloader />

      {/* Sticky Premium Header */}
      <Header activeSection={activeSection} currentRoute={currentRoute} theme={theme} toggleTheme={toggleTheme} onNavigate={handleNavigate} />

      {/* Standalone Page Banner and Info */}
      {currentRoute !== 'home' && currentRoute !== 'about-rohit' && currentRoute !== 'rohit-verma' && (
        <div className="pt-28 pb-10 bg-gradient-to-b from-bg-secondary to-bg-primary border-b border-border-color relative overflow-hidden">
          {/* Ambient light glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Navigation Path Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-text-secondary/60 font-semibold mb-3">
              <button onClick={() => handleNavigate('home')} className="hover:text-accent-primary transition-colors cursor-pointer">Home</button>
              <span>/</span>
              <span className="text-accent-primary capitalize">{currentRoute}</span>
            </div>

            {/* Title with styled gradient or subtle underline */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-color pb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full mb-3 inline-block">
                  Separate Page View
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight capitalize">
                  {currentRoute === 'about' ? 'About Me & Expertise' : currentRoute === 'services' ? 'My Creative Services' : currentRoute === 'portfolio' ? 'Featured Masterpieces' : currentRoute === 'experience' ? 'Professional Career' : currentRoute === 'blog' ? 'Latest Thoughts & News' : currentRoute === 'privacy' ? 'Privacy Policy' : currentRoute === 'terms' ? 'Terms & Conditions' : 'Get In Touch'}
                </h1>
                <p className="text-text-secondary text-sm md:text-base mt-2 max-w-2xl">
                  {currentRoute === 'about' && "Discover my creative background, technical skill matrix, and professional journey."}
                  {currentRoute === 'services' && "Explore premium creative design, motion graphics packages, and tailor-made pricing."}
                  {currentRoute === 'portfolio' && "A handpicked selection of premium graphic designs, video edits, and branding campaigns."}
                  {currentRoute === 'experience' && "A detailed look at my agency work experience, visual director roles, and key career milestones."}
                  {currentRoute === 'blog' && "Insightful design tips, video editing guides, and industry wisdom straight from my desk."}
                  {currentRoute === 'contact' && "Let's bring your creative vision to life. Fill out the project intake brief below to get started."}
                  {currentRoute === 'privacy' && "Our official privacy policy outlining data collection, usage, client confidentiality, and security standards."}
                  {currentRoute === 'terms' && "Standard terms, service scopes, advance payment policies, and intellectual property ownership guidelines."}
                </p>
              </div>

              {/* Toggle Back to Single-Page Home Option */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleNavigate('home')}
                  className="bg-bg-card border border-border-color hover:border-accent-primary hover:bg-bg-card-hover text-xs font-bold text-text-primary px-5 py-3 rounded-2xl flex-row items-center gap-2 transition-all duration-200 cursor-pointer flex"
                >
                  View All Sections on Home Page
                  <span className="text-accent-primary ml-1">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {currentRoute === 'home' ? (
        <main id="main-content">
          {/* 1. Hero Section */}
          <HeroSection />

          {/* 2. Featured Portfolio Section (Main Focus) */}
          <AnimatedSection>
            <PortfolioSection />
          </AnimatedSection>

          {/* 3. Featured Services & Explore All Categories Section */}
          <AnimatedSection>
            <ServicesSection />
          </AnimatedSection>

          {/* 4. About Section */}
          <AnimatedSection>
            <AboutSection onNavigate={handleNavigate} />
          </AnimatedSection>

          {/* 5. Work Experience Section */}
          <AnimatedSection>
            <ExperienceSection />
          </AnimatedSection>

          {/* 6. Skills & Creative Tools Section */}
          <AnimatedSection>
            <SkillsSection />
          </AnimatedSection>

          {/* 7. Client Testimonials Section */}
          <AnimatedSection>
            <TestimonialSection />
          </AnimatedSection>

          {/* 8. Pricing Packages Section */}
          <AnimatedSection>
            <PricingSection />
          </AnimatedSection>

          {/* 9. Blog & Creative Insights Section */}
          <AnimatedSection>
            <BlogSection
              onSelectInsight={handleSelectInsight}
              onOpenAdmin={() => setIsAdminOpen(true)}
            />
          </AnimatedSection>

          {/* 10. Contact Section */}
          <AnimatedSection>
            <ContactSection />
          </AnimatedSection>
        </main>
      ) : (
        <div className="py-0">
          <Suspense fallback={<SubpageFallback />}>
            {currentRoute === 'insight-detail' && activeInsight && (
              <InsightDetailPage
                insight={activeInsight}
                onBack={() => handleNavigate('home')}
                onSelectInsight={handleSelectInsight}
                onOpenContact={() => handleNavigate('contact')}
              />
            )}
            {(currentRoute === 'about-rohit' || currentRoute === 'rohit-verma') && <AboutRohitPage />}
            {currentRoute === 'about' && (
              <div className="py-6">
                <AboutSection onNavigate={handleNavigate} />
                <SkillsSection />
              </div>
            )}
            {currentRoute === 'services' && (
              <div className="py-6">
                <ServicesSection />
                <PricingSection />
              </div>
            )}
            {currentRoute === 'portfolio' && (
              <div className="py-6">
                <PortfolioSection />
                <TestimonialSection />
              </div>
            )}
            {currentRoute === 'experience' && <div className="py-6"><ExperienceSection /></div>}
            {currentRoute === 'blog' && (
              <div className="py-6">
                <BlogSection
                  onSelectInsight={handleSelectInsight}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                />
              </div>
            )}
            {currentRoute === 'contact' && <div className="py-6"><ContactSection /></div>}
            {currentRoute === 'privacy' && <div className="py-10 px-6"><PrivacyPolicyContent /></div>}
            {currentRoute === 'terms' && <div className="py-10 px-6"><TermsAndConditionsContent /></div>}
          </Suspense>
        </div>
      )}

      {/* Full-Featured Admin Panel & CMS Management Overlay */}
      {(isAdminOpen || currentRoute === 'admin') && (
        <Suspense fallback={<SubpageFallback />}>
          <AdminPanel
            onClose={() => {
              setIsAdminOpen(false);
              if (currentRoute === 'admin') handleNavigate('home');
            }}
            onLogout={() => {
              setIsAdminOpen(false);
              if (currentRoute === 'admin') handleNavigate('home');
            }}
          />
        </Suspense>
      )}

      {/* 4-Column Detailed Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Interactive Back to Top, WhatsApp and Scroll indicators */}
      <FloatingElements />

      {/* AI Chatbot Component */}
      <AIChatbot />
    </div>
  );
}
