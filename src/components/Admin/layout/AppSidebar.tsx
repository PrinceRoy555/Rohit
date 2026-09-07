import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Clock,
  Flame,
  Briefcase,
  Wrench,
  MessageSquare,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Palette,
  Layers,
  Sliders,
  Menu as MenuIcon,
  Search,
  Globe,
  History,
  Shield,
  Send,
  Eye,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { InquiryRecord } from '../../../types/cms';
import { Avatar } from '../../ui/Avatar';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  badge?: number | string;
  badgeColor?: string;
  viewOptions?: {
    view?: 'inbox' | 'followups' | 'hot_leads';
    followUpFilter?: 'today' | 'overdue' | 'upcoming' | 'completed';
    statusFilter?: 'all' | 'new' | 'contacted' | 'closed';
  };
}

export interface NavGroupConfig {
  title: string;
  items: NavItemConfig[];
}

interface AppSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string, options?: any) => void;
  siteName: string;
  version: number;
  adminEmail: string;
  adminRole: 'super_admin' | 'admin' | 'editor';
  onLogout: () => void;
  leads: InquiryRecord[];
  hasUnpublishedChanges: boolean;
  onOpenCommandMenu: () => void;
  onOpenPublishModal: () => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onViewLiveSite: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onSelectTab,
  siteName,
  version,
  adminEmail,
  adminRole,
  onLogout,
  leads,
  hasUnpublishedChanges,
  onOpenCommandMenu,
  onOpenPublishModal,
  isPreviewMode,
  onTogglePreview,
  onViewLiveSite,
}) => {
  const { open, openMobile, setOpenMobile, isMobile } = useSidebar();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [userMenuOpen]);

  // Compute CRM badge numbers
  const newLeadsCount = leads.filter((l) => l.status === 'new').length;
  const dueFollowUpsCount = leads.filter((l) => {
    if (!l.followUpAt) return false;
    const d = new Date(l.followUpAt);
    const now = new Date();
    return d <= now || d.toDateString() === now.toDateString();
  }).length;
  const hotLeadsCount = leads.filter((l) => l.isHotLead).length;

  const NAV_GROUPS: NavGroupConfig[] = [
    {
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
          category: 'Overview',
        },
      ],
    },
    {
      title: 'CRM & Inquiries',
      items: [
        {
          id: 'inquiries',
          label: 'All Inquiries',
          icon: Inbox,
          category: 'CRM & Inquiries',
          badge: newLeadsCount > 0 ? newLeadsCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
          viewOptions: { view: 'inbox' },
        },
        {
          id: 'inquiries_followups',
          label: 'Due Follow-ups',
          icon: Clock,
          category: 'CRM & Inquiries',
          badge: dueFollowUpsCount > 0 ? dueFollowUpsCount : undefined,
          badgeColor: 'bg-amber-500 text-neutral-950 font-bold',
          viewOptions: { view: 'followups', followUpFilter: 'today' },
        },
        {
          id: 'inquiries_hot',
          label: 'Hot Leads',
          icon: Flame,
          category: 'CRM & Inquiries',
          badge: hotLeadsCount > 0 ? hotLeadsCount : undefined,
          badgeColor: 'bg-rose-600 text-white',
          viewOptions: { view: 'hot_leads' },
        },
      ],
    },
    {
      title: 'Content & Studio',
      items: [
        {
          id: 'portfolio',
          label: 'Portfolio Projects',
          icon: Briefcase,
          category: 'Content & Studio',
        },
        {
          id: 'insights',
          label: 'AI Studio & Blog',
          icon: FileText,
          category: 'Content & Studio',
        },
        {
          id: 'media',
          label: 'Media Library',
          icon: ImageIcon,
          category: 'Content & Studio',
        },
        {
          id: 'sections',
          label: 'Pages & Layouts',
          icon: Sliders,
          category: 'Content & Studio',
        },
        {
          id: 'testimonials',
          label: 'Client Reviews',
          icon: MessageSquare,
          category: 'Content & Studio',
        },
        {
          id: 'skills',
          label: 'Skills & Experience',
          icon: Sparkles,
          category: 'Content & Studio',
        },
        {
          id: 'services',
          label: 'Services & Pricing',
          icon: Wrench,
          category: 'Content & Studio',
        },
      ],
    },
    {
      title: 'Design & Branding',
      items: [
        {
          id: 'customizer',
          label: 'Visual Customizer',
          icon: Palette,
          category: 'Design & Branding',
        },
        {
          id: 'templates',
          label: 'Template Reseller',
          icon: Layers,
          category: 'Design & Branding',
        },
      ],
    },
    {
      title: 'Settings & System',
      items: [
        {
          id: 'navigation',
          label: 'Navigation & Footer',
          icon: MenuIcon,
          category: 'Settings & System',
        },
        {
          id: 'seo',
          label: 'SEO & Social Graph',
          icon: Search,
          category: 'Settings & System',
        },
        {
          id: 'revisions',
          label: 'Revision History',
          icon: History,
          category: 'Settings & System',
        },
        {
          id: 'security',
          label: 'Users & Security',
          icon: Shield,
          category: 'Settings & System',
        },
      ],
    },
  ];

  // Helper to determine if an item is active
  const isItemActive = (item: NavItemConfig) => {
    if (item.id === 'inquiries_followups' || item.id === 'inquiries_hot') {
      return false;
    }
    return activeTab === item.id;
  };

  const handleItemClick = (item: NavItemConfig) => {
    if (item.id === 'inquiries_followups') {
      onSelectTab('inquiries', item.viewOptions);
    } else if (item.id === 'inquiries_hot') {
      onSelectTab('inquiries', item.viewOptions);
    } else {
      onSelectTab(item.id, item.viewOptions);
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && !open;

  // Sidebar container classes
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && openMobile && (
        <div
          onClick={() => setOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* App Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`bg-bg-card border-r border-border-color flex flex-col justify-between overflow-hidden shrink-0 z-50 transition-all duration-200 ease-in-out ${
          isMobile
            ? `fixed inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl ${
                openMobile ? 'translate-x-0' : '-translate-x-full'
              }`
            : isCollapsed
            ? 'w-16 relative'
            : 'w-64 relative'
        }`}
      >
        {/* ================================================================= */}
        {/* SIDEBAR HEADER: Team / Site Switcher Look                         */}
        {/* ================================================================= */}
        <div className="h-14 sm:h-16 px-3 flex items-center justify-between border-b border-border-color bg-bg-secondary/30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Branding Monogram / Logo */}
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs select-none">
              RV
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="font-bold text-xs sm:text-sm text-text-primary truncate">
                    {siteName || 'Rohit Verma'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-bg-secondary border border-border-color text-text-muted shrink-0">
                    v{version || 1}
                  </span>
                </div>
                <div className="text-[11px] text-text-muted truncate mt-0.5">
                  CMS & CRM Suite
                </div>
              </div>
            )}
          </div>

          {/* Close button on mobile drawer */}
          {isMobile && (
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary border border-border-color transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search trigger button in expanded sidebar */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1">
            <button
              type="button"
              onClick={onOpenCommandMenu}
              className="w-full h-8 px-2.5 rounded-lg bg-bg-secondary/60 hover:bg-bg-secondary border border-border-color text-text-muted hover:text-text-primary text-xs flex items-center justify-between transition-colors select-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>Search sections...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-border-color text-[10px] font-medium text-text-muted">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* SIDEBAR NAVIGATION CONTENT: Grouped Nav Items                     */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 no-scrollbar">
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-text-muted/80 select-none">
                  {group.title}
                </div>
              ) : (
                <div className="h-px bg-border-color/60 my-2 mx-2" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between rounded-lg transition-all select-none cursor-pointer group ${
                        isCollapsed
                          ? 'h-10 justify-center px-0'
                          : 'min-h-[36px] px-2.5 py-1.5 text-xs'
                      } ${
                        active
                          ? 'bg-accent-primary/10 text-accent-primary dark:text-accent-secondary font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            active
                              ? 'text-accent-primary dark:text-accent-secondary'
                              : 'text-text-muted group-hover:text-text-primary'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {/* Item Badges / Counts */}
                      {!isCollapsed && item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold shrink-0 ${
                            item.badgeColor || 'bg-bg-secondary text-text-muted'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ================================================================= */}
        {/* SIDEBAR FOOTER: User Profile & Popover Menu (NavUser)            */}
        {/* ================================================================= */}
        <div
          ref={userMenuRef}
          className="p-2 border-t border-border-color bg-bg-secondary/30 shrink-0 relative"
        >
          {/* User Profile Trigger Bar */}
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`w-full flex items-center justify-between rounded-lg p-1.5 hover:bg-bg-card transition-colors select-none cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="User Settings & Account"
            aria-label="User Settings"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                fallbackName={siteName || 'Rohit Verma'}
                size="sm"
                status="online"
                className="shrink-0"
              />

              {!isCollapsed && (
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {siteName || 'Rohit Verma'}
                    </span>
                    {adminRole === 'super_admin' ? (
                      <ShieldCheck className="w-3 h-3 text-rose-500 shrink-0" />
                    ) : (
                      <Shield className="w-3 h-3 text-indigo-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-text-muted truncate mt-1">
                    {adminEmail || 'Admin User'}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <ChevronsUpDown className="w-3.5 h-3.5 text-text-muted shrink-0 ml-1" />
            )}
          </button>

          {/* User Popover Menu */}
          {userMenuOpen && (
            <div
              className={`absolute bottom-full mb-2 bg-bg-card border border-border-color rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-1 animate-in zoom-in-95 duration-150 text-text-primary ${
                isCollapsed ? 'left-2 w-56' : 'left-2 right-2'
              }`}
            >
              {/* Account summary header */}
              <div className="px-2 py-1.5 border-b border-border-color/60">
                <div className="font-semibold text-text-primary truncate">
                  {siteName || 'Rohit Verma'}
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  {adminEmail}
                </div>
                <div className="mt-1">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {adminRole === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                  </span>
                </div>
              </div>

              {/* Quick Actions in Popover */}
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onTogglePreview();
                }}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-text-muted" />
                  <span>{isPreviewMode ? 'Exit Draft Preview' : 'Preview Draft Mode'}</span>
                </div>
                {isPreviewMode && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onViewLiveSite();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-left"
              >
                <Globe className="w-3.5 h-3.5 text-text-muted" />
                <span>View Live Website</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onSelectTab('revisions');
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-left"
              >
                <History className="w-3.5 h-3.5 text-text-muted" />
                <span>Revision History</span>
              </button>

              <div className="h-px bg-border-color/60 my-1" />

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors cursor-pointer text-left font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
