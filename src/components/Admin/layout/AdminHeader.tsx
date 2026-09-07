import React from 'react';
import {
  SidebarTrigger,
  useSidebar,
} from './SidebarContext';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import { CrmNotificationsPopover } from '../crm/CrmNotificationsPopover';
import ThemeToggle from '../../ThemeToggle';
import {
  Search,
  Send,
  Eye,
  Globe,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import { InquiryRecord } from '../../../types/cms';

interface AdminHeaderProps {
  activeTab: string;
  tabLabel: string;
  tabCategory: string;
  onNavigate: (tab: string, options?: any) => void;
  hasUnpublishedChanges: boolean;
  onOpenPublishModal: () => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onOpenCommandMenu: () => void;
  onViewLiveSite: () => void;
  onLogout: () => void;
  leads: InquiryRecord[];
  siteName: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  tabLabel,
  tabCategory,
  onNavigate,
  hasUnpublishedChanges,
  onOpenPublishModal,
  isPreviewMode,
  onTogglePreview,
  onOpenCommandMenu,
  onViewLiveSite,
  onLogout,
  leads,
  siteName,
}) => {
  const { toggleSidebar, isMobile } = useSidebar();

  // Breadcrumb structure
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: tabCategory || 'Management',
      onClick: () => onNavigate('dashboard'),
    },
    {
      label: tabLabel || 'Dashboard',
      active: true,
    },
  ];

  return (
    <header className="h-14 sm:h-16 border-b border-border-color bg-bg-card px-3 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Left side: Sidebar trigger & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger />

        <div className="h-4 w-px bg-border-color mx-0.5 hidden xs:block" />

        {/* Dynamic Breadcrumbs */}
        <div className="min-w-0">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      {/* Right side: Global actions & indicators */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Search / Command Dialog trigger */}
        <button
          type="button"
          onClick={onOpenCommandMenu}
          className="h-9 px-2.5 sm:px-3 rounded-lg bg-bg-secondary/60 hover:bg-bg-secondary border border-border-color text-text-muted hover:text-text-primary text-xs flex items-center gap-2 transition-colors cursor-pointer"
          title="Search CMS (⌘K)"
          aria-label="Search CMS"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-flex px-1.5 py-0.2 rounded bg-bg-card border border-border-color text-[10px] font-medium text-text-muted">
            ⌘K
          </kbd>
        </button>

        {/* Changes status indicator badge */}
        <div className="hidden sm:flex items-center">
          {hasUnpublishedChanges ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Draft modified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="hidden lg:inline">Published Live</span>
            </div>
          )}
        </div>

        {/* 1-Click Publish Button */}
        <button
          type="button"
          onClick={onOpenPublishModal}
          className={`h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            hasUnpublishedChanges
              ? 'bg-accent-primary hover:bg-accent-secondary text-white shadow-xs'
              : 'bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color'
          }`}
          title="Publish draft changes to live site"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Publish</span>
        </button>

        {/* Draft Preview Mode Switch */}
        <button
          type="button"
          onClick={onTogglePreview}
          className={`h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
            isPreviewMode
              ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-xs'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary border-border-color hover:bg-bg-secondary/80'
          }`}
          title={isPreviewMode ? 'Exit Draft Preview' : 'Preview Working Draft'}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {isPreviewMode ? 'Previewing Draft' : 'Preview'}
          </span>
        </button>

        <div className="h-4 w-px bg-border-color mx-0.5" />

        {/* In-App CRM Notifications Popover */}
        <CrmNotificationsPopover
          leads={leads}
          onNavigateToInquiries={(filterTab) => {
            if (filterTab === 'followups_today') {
              onNavigate('inquiries', { view: 'followups', followUpFilter: 'today' });
            } else if (filterTab === 'followups_overdue') {
              onNavigate('inquiries', { view: 'followups', followUpFilter: 'overdue' });
            } else if (filterTab === 'new') {
              onNavigate('inquiries', { view: 'inbox', statusFilter: 'new' });
            } else {
              onNavigate('inquiries');
            }
          }}
        />

        {/* Theme Switcher */}
        <div className="flex items-center">
          <ThemeToggle id="admin-top-header-theme-toggle" />
        </div>

        {/* View Public Website */}
        <button
          type="button"
          onClick={onViewLiveSite}
          className="h-9 px-2.5 sm:px-3 rounded-lg bg-bg-secondary hover:bg-bg-card-hover text-text-secondary hover:text-text-primary border border-border-color flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
          title="Exit Admin & View Public Website"
        >
          <Globe className="w-3.5 h-3.5 text-text-muted" />
          <span className="hidden xl:inline">Live Site</span>
        </button>

        {/* Header Quick Sign Out Icon Button */}
        <button
          type="button"
          onClick={onLogout}
          className="h-9 w-9 rounded-lg text-text-muted hover:text-red-600 hover:bg-bg-secondary border border-border-color/60 flex items-center justify-center transition-colors cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
