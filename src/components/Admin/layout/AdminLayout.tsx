import React, { useState, ReactNode, useEffect } from 'react';
import {
  SidebarProvider,
  SidebarInset,
} from './SidebarContext';
import { AppSidebar } from './AppSidebar';
import { AdminHeader } from './AdminHeader';
import { CommandMenu } from './CommandMenu';
import { InquiryRecord } from '../../../types/cms';

interface AdminLayoutProps {
  activeTab: string;
  onSelectTab: (tab: string, options?: any) => void;
  siteName: string;
  version: number;
  adminEmail: string;
  adminRole: 'super_admin' | 'admin' | 'editor';
  onLogout: () => void;
  leads: InquiryRecord[];
  hasUnpublishedChanges: boolean;
  onOpenPublishModal: () => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onViewLiveSite: () => void;
  onToggleTheme: () => void;
  onOpenLead?: (lead: InquiryRecord) => void;
  children: ReactNode;
}

const TAB_METADATA: Record<string, { label: string; category: string }> = {
  dashboard: { label: 'Dashboard Overview', category: 'Overview' },
  inquiries: { label: 'Lead Inquiries & CRM', category: 'CRM & Inquiries' },
  portfolio: { label: 'Portfolio Projects', category: 'Content & Studio' },
  insights: { label: 'AI Studio & Blog', category: 'Content & Studio' },
  media: { label: 'Media Library', category: 'Content & Studio' },
  sections: { label: 'Pages & Layouts', category: 'Content & Studio' },
  testimonials: { label: 'Client Reviews', category: 'Content & Studio' },
  skills: { label: 'Skills & Experience', category: 'Content & Studio' },
  services: { label: 'Services & Pricing', category: 'Content & Studio' },
  customizer: { label: 'Visual Customizer', category: 'Design & Branding' },
  templates: { label: 'Template Reseller', category: 'Design & Branding' },
  navigation: { label: 'Navigation & Footer', category: 'Settings & System' },
  seo: { label: 'SEO & Social Graph', category: 'Settings & System' },
  revisions: { label: 'Revision History', category: 'Settings & System' },
  security: { label: 'Users & Security Audit', category: 'Settings & System' },
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  siteName,
  version,
  adminEmail,
  adminRole,
  onLogout,
  leads,
  hasUnpublishedChanges,
  onOpenPublishModal,
  isPreviewMode,
  onTogglePreview,
  onViewLiveSite,
  onToggleTheme,
  onOpenLead,
  children,
}) => {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const meta = TAB_METADATA[activeTab] || {
    label: 'Overview',
    category: 'Management',
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div
        id="shadcn-admin-root"
        className="fixed inset-0 z-50 flex overflow-hidden bg-bg-primary text-text-primary font-sans antialiased"
      >
        {/* Left App Sidebar */}
        <AppSidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          siteName={siteName}
          version={version}
          adminEmail={adminEmail}
          adminRole={adminRole}
          onLogout={onLogout}
          leads={leads}
          hasUnpublishedChanges={hasUnpublishedChanges}
          onOpenCommandMenu={() => setCommandMenuOpen(true)}
          onOpenPublishModal={onOpenPublishModal}
          isPreviewMode={isPreviewMode}
          onTogglePreview={onTogglePreview}
          onViewLiveSite={onViewLiveSite}
        />

        {/* Inset content area: Header + Main */}
        <SidebarInset>
          {/* Top Admin Header */}
          <AdminHeader
            activeTab={activeTab}
            tabLabel={meta.label}
            tabCategory={meta.category}
            onNavigate={onSelectTab}
            hasUnpublishedChanges={hasUnpublishedChanges}
            onOpenPublishModal={onOpenPublishModal}
            isPreviewMode={isPreviewMode}
            onTogglePreview={onTogglePreview}
            onOpenCommandMenu={() => setCommandMenuOpen(true)}
            onViewLiveSite={onViewLiveSite}
            onLogout={onLogout}
            leads={leads}
            siteName={siteName}
          />

          {/* Main Tab Content View */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-bg-primary">
            {children}
          </main>
        </SidebarInset>

        {/* Global Command Menu Dialog (⌘K) */}
        <CommandMenu
          isOpen={commandMenuOpen}
          onClose={() => setCommandMenuOpen(false)}
          onNavigate={onSelectTab}
          onPublish={onOpenPublishModal}
          onTogglePreview={onTogglePreview}
          isPreviewMode={isPreviewMode}
          hasUnpublishedChanges={hasUnpublishedChanges}
          onToggleTheme={onToggleTheme}
          onViewLiveSite={onViewLiveSite}
          onLogout={onLogout}
          leads={leads}
          onOpenLead={onOpenLead}
        />
      </div>
    </SidebarProvider>
  );
};
