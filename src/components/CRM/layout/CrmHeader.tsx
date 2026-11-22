import React, { useState, useRef, useEffect } from 'react';
import { CrmModuleId } from '../../../types/crm';
import { CRM_MODULES } from '../crmModules';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
  Shield,
  CheckCircle2,
  Clock,
  RotateCw,
  MessageSquare,
  Plus,
  UserPlus,
  Layers,
  Receipt,
  IndianRupee,
  Sparkles
} from 'lucide-react';
import { WHATSAPP_BUSINESS_URL } from '../../../data';
import { CrmAvatar } from '../profile/CrmAvatar';
import { getAdminProfile, subscribeAdminProfile } from '../../../services/crmProfileService';
import { AdminUserProfile } from '../../../types/crmProfile';

interface CrmHeaderProps {
  activeModule: CrmModuleId;
  onOpenMobileSidebar: () => void;
  adminEmail?: string;
  adminRole?: 'super_admin' | 'admin' | 'editor';
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onViewWebsite: () => void;
  onOpenSearch: () => void;
  onNavigateToModule: (moduleId: CrmModuleId) => void;
  newLeadsCount?: number;
  onRefreshData?: () => void;
  onOpenProfile?: () => void;
}

export const CrmHeader: React.FC<CrmHeaderProps> = ({
  activeModule,
  onOpenMobileSidebar,
  adminEmail = '',
  adminRole = 'editor',
  theme,
  onToggleTheme,
  onLogout,
  onViewWebsite,
  onOpenSearch,
  onNavigateToModule,
  newLeadsCount = 0,
  onRefreshData,
  onOpenProfile
}) => {
  const [profile, setProfile] = useState<AdminUserProfile>(getAdminProfile());
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickCreateRef = useRef<HTMLDivElement>(null);

  // Subscribe to live profile changes
  useEffect(() => {
    const unsubscribe = subscribeAdminProfile((updated) => {
      setProfile(updated);
    });
    return () => unsubscribe();
  }, []);

  const activeMeta = CRM_MODULES.find((m) => m.id === activeModule) || CRM_MODULES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target as Node)) {
        setQuickCreateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualRefresh = () => {
    setIsRotating(true);
    if (onRefreshData) onRefreshData();
    setTimeout(() => setIsRotating(false), 800);
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4 transition-colors">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          type="button"
          id="crm-header-hamburger"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 select-none">
          <span
            className="text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            onClick={() => onNavigateToModule('dashboard')}
          >
            Rohitwork CRM
          </span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-extrabold text-slate-900 dark:text-white capitalize">
            {activeMeta.label}
          </span>
        </div>
      </div>

      {/* Center: Global Search Trigger (Wide rounded pill matching reference image) */}
      <div className="flex-1 max-w-lg mx-1 sm:mx-3">
        <button
          type="button"
          id="crm-header-search-btn"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-400 dark:text-slate-400 text-xs transition-all shadow-2xs hover:border-indigo-300 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-400">Search leads, clients, projects, invoices...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-medium bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 shrink-0 shadow-2xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: WhatsApp, Plus Quick Action, Refresh, Bell, Theme & Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* 1. Green WhatsApp Button (Pill matching image) */}
        <a
          href={WHATSAPP_BUSINESS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs transition-all cursor-pointer active:scale-95"
          title="Open WhatsApp Business"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        {/* 2. Quick Action (+) Create Button & Dropdown */}
        <div className="relative" ref={quickCreateRef}>
          <button
            type="button"
            onClick={() => setQuickCreateOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white flex items-center justify-center shadow-xs cursor-pointer transition-transform active:scale-95"
            title="Quick Create"
            aria-label="Quick Create"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {quickCreateOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 text-xs font-semibold animate-in fade-in-50 zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  onNavigateToModule('leads');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-left"
              >
                <UserPlus className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Add Lead</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateToModule('projects');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-left"
              >
                <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>New Project</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateToModule('invoices');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-left"
              >
                <Receipt className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Create Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateToModule('payments');
                  setQuickCreateOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-left"
              >
                <IndianRupee className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Record Payment</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Circular Refresh Button */}
        <button
          type="button"
          onClick={handleManualRefresh}
          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 hover:bg-slate-100 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* 4. Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 hover:bg-slate-100 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          aria-label="Toggle theme appearance"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        {/* 5. Circular Notification Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 hover:bg-slate-100 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all relative cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {newLeadsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 text-left z-50 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifications
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {newLeadsCount} New
                </span>
              </div>

              <div className="py-3 space-y-2.5 max-h-60 overflow-y-auto">
                {newLeadsCount > 0 ? (
                  <div
                    onClick={() => {
                      onNavigateToModule('leads');
                      setNotificationsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{newLeadsCount} Inquiries Awaiting Response</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Click to review the new lead submissions in your pipeline.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500/40 mx-auto mb-1.5" />
                    <span>No unread alerts. You are completely caught up!</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToModule('dashboard');
                    setNotificationsOpen(false);
                  }}
                  className="w-full text-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-1 cursor-pointer"
                >
                  View Agency Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 6. Profile Badge & Discord-Style Executive Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
            aria-label="Open profile menu"
          >
            <CrmAvatar
              profile={profile}
              size="sm"
              showPresence={true}
              presenceStatus="online"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                {profile.displayName || profile.name || 'Administrator'}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 leading-tight capitalize">
                {(adminRole || profile.role || 'editor').replace('_', ' ')}
              </span>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 text-left z-50 animate-in fade-in-50 zoom-in-95 duration-100">
              {/* Discord-style Profile Banner Card */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#0c0828] via-[#1a0f3d] to-[#251052] text-white mb-1.5 border border-purple-500/20 shadow-md">
                <div className="flex items-center gap-3">
                  <CrmAvatar
                    profile={profile}
                    size="md"
                    showPresence={true}
                    presenceStatus="online"
                    borderStyle="gradient"
                  />
                  <div className="overflow-hidden">
                    <div className="text-xs font-black text-white truncate">
                      {profile.displayName || profile.name || 'Administrator'}
                    </div>
                    <div className="text-[10px] text-purple-200/80 font-mono truncate">
                      {adminEmail || profile.email || 'Administrator'}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                        {(adminRole || profile.role || 'editor').replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>My Profile & Avatar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateToModule('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Portal Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onViewWebsite();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Public Website</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of CRM</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
