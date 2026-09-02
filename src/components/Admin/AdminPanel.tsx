import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { logoutAdmin, checkAdminSession, loginAdmin, syncFirebaseAdminSession } from '../../services/adminApi';
import {
  signInAdmin,
  signInAdminWithGoogle,
  signOutAdmin,
  observeAuthState,
  verifyAdminRole
} from '../../services/firebase/auth';
import {
  LayoutDashboard,
  Palette,
  Layers,
  Sliders,
  Briefcase,
  Wrench,
  MessageSquare,
  Sparkles,
  Inbox,
  Image as ImageIcon,
  Menu,
  Search,
  History,
  Shield,
  FileText,
  Eye,
  Send,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Globe,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

import { DashboardTab } from './tabs/DashboardTab';
import { CustomizerTab } from './tabs/CustomizerTab';
import { TemplateSystemTab } from './tabs/TemplateSystemTab';
import { SectionsManagerTab } from './tabs/SectionsManagerTab';
import { PortfolioManagerTab } from './tabs/PortfolioManagerTab';
import { ServicesPricingTab } from './tabs/ServicesPricingTab';
import { TestimonialsManagerTab } from './tabs/TestimonialsManagerTab';
import { SkillsExperienceTab } from './tabs/SkillsExperienceTab';
import { InquiriesInboxTab } from './tabs/InquiriesInboxTab';
import { MediaLibraryTab } from './tabs/MediaLibraryTab';
import { NavigationFooterTab } from './tabs/NavigationFooterTab';
import { SeoMetaTab } from './tabs/SeoMetaTab';
import { RevisionsTab } from './tabs/RevisionsTab';
import { UsersRolesTab } from './tabs/UsersRolesTab';
import AdminInsightsDashboard from './AdminInsightsDashboard';

interface AdminPanelProps {
  onClose: () => void;
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, category: 'Core' },
  { id: 'customizer', label: 'Visual Customizer & Colors', icon: Palette, category: 'Design & Branding' },
  { id: 'templates', label: 'Template Reselling Hub', icon: Layers, category: 'Design & Branding' },
  { id: 'sections', label: 'Pages & Section Layouts', icon: Sliders, category: 'Content' },
  { id: 'portfolio', label: 'Portfolio Projects', icon: Briefcase, category: 'Content' },
  { id: 'services', label: 'Services & Pricing', icon: Wrench, category: 'Content' },
  { id: 'testimonials', label: 'Client Testimonials', icon: MessageSquare, category: 'Content' },
  { id: 'skills', label: 'Skills & Experience', icon: Sparkles, category: 'Content' },
  { id: 'insights', label: 'AI Insights & Blog Studio', icon: FileText, category: 'Content' },
  { id: 'inquiries', label: 'Lead Inquiries & CRM', icon: Inbox, category: 'Growth' },
  { id: 'media', label: 'Media & Asset Library', icon: ImageIcon, category: 'Growth' },
  { id: 'navigation', label: 'Navigation & Footer', icon: Menu, category: 'Settings' },
  { id: 'seo', label: 'SEO & Social Graph', icon: Search, category: 'Settings' },
  { id: 'revisions', label: 'Revision History & Rollback', icon: History, category: 'System' },
  { id: 'security', label: 'Users & Security Audit', icon: Shield, category: 'System' }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminRole, setAdminRole] = useState<'super_admin' | 'admin' | 'editor'>('admin');
  const [isUnauthorizedUser, setIsUnauthorizedUser] = useState<boolean>(false);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string>('');

  // Login form state (Empty defaults to prevent credential exposure)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  // Tab & Modal State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSummary, setPublishSummary] = useState('');
  const [publishSuccessMsg, setPublishSuccessMsg] = useState(false);

  const {
    config,
    hasUnpublishedChanges,
    isPublishing,
    publish,
    isPreviewMode,
    setPreviewMode,
    refreshConfig
  } = useSiteConfig();

  // Verify auth on mount via Firebase Auth listener & server fallback
  useEffect(() => {
    let isMounted = true;
    setAuthChecking(true);

    const unsubscribe = observeAuthState(async (user) => {
      if (!isMounted) return;

      if (user) {
        // Authenticated with Firebase: Verify Admin Authorization
        const roleRes = await verifyAdminRole(user);
        if (!isMounted) return;

        if (roleRes.authorized) {
          setIsUnauthorizedUser(false);
          setIsAuthenticated(true);
          setAdminEmail(user.email || 'admin');
          setAdminRole(roleRes.role);

          try {
            const idToken = await user.getIdToken();
            await syncFirebaseAdminSession(user.email || '', idToken);
            await refreshConfig();
          } catch (e) {
            console.warn('[AdminPanel] Session sync warning:', e);
          }
          setAuthChecking(false);
        } else {
          // Firebase authenticated, but NOT an authorized administrator
          setIsUnauthorizedUser(true);
          setUnauthorizedEmail(user.email || '');
          setIsAuthenticated(false);
          // Purge Firebase session to prevent privilege escalation
          await signOutAdmin();
          setAuthChecking(false);
        }
      } else {
        // Not authenticated in Firebase, check existing server session as fallback
        try {
          const session = await checkAdminSession();
          if (!isMounted) return;
          if (session.authenticated && session.adminEmail) {
            setIsAuthenticated(true);
            setAdminEmail(session.adminEmail);
            setIsUnauthorizedUser(false);
            await refreshConfig();
          } else {
            setIsAuthenticated(false);
          }
        } catch {
          if (isMounted) setIsAuthenticated(false);
        } finally {
          if (isMounted) setAuthChecking(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [refreshConfig]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim();
    const cleanPass = loginPassword;
    if (!cleanEmail || !cleanPass) {
      setLoginError('Please enter both admin email and password.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);
    setIsUnauthorizedUser(false);

    // 1. Primary: Authenticate via Firebase Authentication
    const firebaseResult = await signInAdmin(cleanEmail, cleanPass);
    if (firebaseResult.success && firebaseResult.user) {
      const roleCheck = await verifyAdminRole(firebaseResult.user);
      if (roleCheck.authorized) {
        const idToken = await firebaseResult.user.getIdToken();
        await syncFirebaseAdminSession(cleanEmail, idToken);
        setIsAuthenticated(true);
        setAdminEmail(cleanEmail);
        setAdminRole(roleCheck.role);
        setLoginPassword('');
        await refreshConfig();
        setIsLoggingIn(false);
        return;
      } else {
        await signOutAdmin();
        setLoginError('Access Denied: This account is not registered as an authorized administrator.');
        setIsUnauthorizedUser(true);
        setUnauthorizedEmail(cleanEmail);
        setIsLoggingIn(false);
        return;
      }
    }

    // 2. Secondary fallback: Attempt server credential verification if server has ADMIN_PASSWORD set
    const serverResult = await loginAdmin(cleanEmail, cleanPass);
    if (serverResult.success) {
      setIsAuthenticated(true);
      setAdminEmail(serverResult.adminEmail || cleanEmail);
      setLoginPassword('');
      await refreshConfig();
    } else {
      setLoginError(firebaseResult.error || serverResult.error || 'Invalid administrator credentials.');
    }
    setIsLoggingIn(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    setLoginError(null);
    setIsUnauthorizedUser(false);

    const res = await signInAdminWithGoogle();
    if (res.success && res.user) {
      const roleCheck = await verifyAdminRole(res.user);
      if (roleCheck.authorized) {
        const idToken = await res.user.getIdToken();
        await syncFirebaseAdminSession(res.user.email || '', idToken);
        setIsAuthenticated(true);
        setAdminEmail(res.user.email || '');
        setAdminRole(roleCheck.role);
        await refreshConfig();
      } else {
        await signOutAdmin();
        setLoginError('Access Denied: This Google account is not authorized as an administrator.');
        setIsUnauthorizedUser(true);
        setUnauthorizedEmail(res.user.email || '');
      }
    } else if (res.error) {
      setLoginError(res.error);
    }
    setIsGoogleLoggingIn(false);
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      await logoutAdmin();
    } catch (e) {
      console.warn('[AdminPanel] Logout error:', e);
    } finally {
      setIsAuthenticated(false);
      setIsUnauthorizedUser(false);
      setAdminEmail('');
      setLoginPassword('');
      if (onLogout) {
        onLogout();
      } else {
        onClose();
      }
    }
  };

  const handleConfirmPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await publish(publishSummary || 'Website updates published');
    if (success) {
      setShowPublishModal(false);
      setPublishSummary('');
      setPublishSuccessMsg(true);
      setTimeout(() => setPublishSuccessMsg(false), 4000);
    }
  };

  // 1. Loading State (Prevents UI flicker while checking session)
  if (authChecking) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0a09] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
          <span className="text-sm text-neutral-400">Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthorized Account Screen (Firebase authenticated, but not permitted in Admin CMS)
  if (isUnauthorizedUser && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0a09]/95 backdrop-blur-md flex items-center justify-center p-4 font-sans">
        <div className="bg-neutral-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Access Restricted</h3>
                <p className="text-xs text-neutral-400">Unauthorized User Account</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 space-y-2">
            <p className="font-semibold text-rose-300">
              The account <span className="underline font-mono">{unauthorizedEmail}</span> is authenticated, but is not registered with administrator privileges.
            </p>
            <p className="text-neutral-400">
              To manage site content, please sign in using an authorized administrator account or contact the super administrator.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setIsUnauthorizedUser(false);
                setLoginError(null);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign In with Different Account</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Login Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0a09]/95 backdrop-blur-md flex items-center justify-center p-4 font-sans">
        <div className="bg-neutral-900 border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-600/30 text-sm">
                CMS
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Administrator Access</h3>
                <p className="text-xs text-neutral-400">Firebase Authenticated Portal</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Close and Return to Site"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Google Sign In Option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoggingIn || isLoggingIn}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
          >
            <Globe className="w-4 h-4 text-rose-400" />
            <span>{isGoogleLoggingIn ? 'Connecting with Google...' : 'Sign in with Google Admin'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">or email credentials</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Admin Email</label>
              <input
                type="email"
                required
                placeholder="admin@rohitverma.design"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-rose-500 focus:outline-none transition-colors"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || isGoogleLoggingIn}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protected with Firebase Auth & Role-Based Access Control</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated Admin Dashboard
  return (
    <div className="fixed inset-0 z-50 bg-[#0c0a09] text-white flex flex-col overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/10 bg-neutral-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-600/30 text-sm">
              CMS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white">
                  {config.branding?.siteName || 'Rohit Verma'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-neutral-300">
                  v{config.version || 1}
                </span>
                <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  adminRole === 'super_admin'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {adminRole === 'super_admin' ? 'Super Admin' : adminRole.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Draft indicator */}
          {hasUnpublishedChanges ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Draft modified</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Published Live</span>
            </div>
          )}

          {/* Draft Preview Mode Switch */}
          <button
            onClick={() => setPreviewMode(!isPreviewMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isPreviewMode
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-neutral-300 hover:text-white border-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPreviewMode ? 'Previewing Draft' : 'Preview'}</span>
          </button>

          {/* Publish Action */}
          <button
            onClick={() => setShowPublishModal(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              hasUnpublishedChanges
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>

          {/* View Public Website */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Close Admin & View Live Site"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop for Sidebar Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 lg:hidden"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar */}
        <aside
          className={`w-64 max-w-[85vw] bg-neutral-900/95 border-r border-white/10 flex flex-col justify-between p-4 pb-[max(16px,env(safe-area-inset-bottom))] overflow-y-auto flex-shrink-0 z-30 transition-all duration-200 lg:static fixed inset-y-16 left-0 shadow-2xl lg:shadow-none ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-6">
            {['Core', 'Design & Branding', 'Content', 'Growth', 'Settings', 'System'].map((cat) => {
              const items = NAV_ITEMS.filter((i) => i.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    {cat}
                  </div>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-neutral-500">
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate font-mono">{adminEmail}</span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-1 capitalize">Role: {adminRole.replace('_', ' ')}</div>
          </div>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0a0807]">
          {publishSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Website successfully published live! All visitors now see the latest changes.</span>
            </div>
          )}

          {activeTab === 'dashboard' && <DashboardTab setActiveTab={setActiveTab} />}
          {activeTab === 'customizer' && <CustomizerTab />}
          {activeTab === 'templates' && <TemplateSystemTab />}
          {activeTab === 'sections' && <SectionsManagerTab />}
          {activeTab === 'portfolio' && <PortfolioManagerTab />}
          {activeTab === 'services' && <ServicesPricingTab />}
          {activeTab === 'testimonials' && <TestimonialsManagerTab />}
          {activeTab === 'skills' && <SkillsExperienceTab />}
          {activeTab === 'insights' && (
            <AdminInsightsDashboard onClose={() => setActiveTab('dashboard')} />
          )}
          {activeTab === 'inquiries' && <InquiriesInboxTab />}
          {activeTab === 'media' && <MediaLibraryTab />}
          {activeTab === 'navigation' && <NavigationFooterTab />}
          {activeTab === 'seo' && <SeoMetaTab />}
          {activeTab === 'revisions' && <RevisionsTab />}
          {activeTab === 'security' && <UsersRolesTab />}
        </main>
      </div>

      {/* MODAL: Publish Website Confirmation */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-rose-500" />
              <span>Publish Changes Live</span>
            </h3>
            <p className="text-xs text-neutral-400">
              This will update the public website for all visitors and create a permanent recovery snapshot in Revision History.
            </p>

            <form onSubmit={handleConfirmPublish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Change Summary / Version Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Updated pricing tiers, added 2 new portfolio items"
                  value={publishSummary}
                  onChange={(e) => setPublishSummary(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPublishing ? 'Publishing...' : 'Confirm & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
