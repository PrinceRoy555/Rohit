import React, { useState, ReactNode } from 'react';
import { CrmModuleId, CrmLead } from '../../../types/crm';
import { CrmSidebar } from './CrmSidebar';
import { CrmHeader } from './CrmHeader';
import { CrmSearchModal } from './CrmSearchModal';
import { CrmProfileModal } from '../profile/CrmProfileModal';

interface CrmLayoutProps {
  activeModule: CrmModuleId;
  onSelectModule: (moduleId: CrmModuleId) => void;
  adminEmail?: string;
  adminRole?: 'super_admin' | 'admin' | 'editor';
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onViewWebsite: () => void;
  newLeadsCount?: number;
  leads?: CrmLead[];
  onSelectLead?: (lead: CrmLead) => void;
  onOpenProfileModal?: () => void;
  children: ReactNode;
}

export const CrmLayout: React.FC<CrmLayoutProps> = ({
  activeModule,
  onSelectModule,
  adminEmail = 'workall724038@gmail.com',
  adminRole = 'super_admin',
  theme,
  onToggleTheme,
  onLogout,
  onViewWebsite,
  newLeadsCount = 0,
  leads = [],
  onSelectLead,
  children
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* 1. Global Search Modal (Ctrl+K) */}
      <CrmSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectModule={onSelectModule}
        leads={leads}
        onSelectLead={onSelectLead}
      />

      {/* 1b. My Profile & Avatar Customizer Modal */}
      <CrmProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* 2. Responsive Sidebar (Desktop Fixed & Mobile Drawer) */}
      <CrmSidebar
        activeModule={activeModule}
        onSelectModule={onSelectModule}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        adminEmail={adminEmail}
        adminRole={adminRole}
        onLogout={onLogout}
        onViewWebsite={onViewWebsite}
        newLeadsCount={newLeadsCount}
      />

      {/* 3. Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Top Navigation Bar */}
        <CrmHeader
          activeModule={activeModule}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          adminEmail={adminEmail}
          adminRole={adminRole}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
          onViewWebsite={onViewWebsite}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateToModule={onSelectModule}
          newLeadsCount={newLeadsCount}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1550px] w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>
      </div>
    </div>
  );
};
