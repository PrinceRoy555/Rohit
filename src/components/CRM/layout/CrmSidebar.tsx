import React from 'react';
import { CrmModuleId } from '../../../types/crm';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FolderKanban,
  Briefcase,
  CheckSquare,
  PackageCheck,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  TrendingDown,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  Database,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  ExternalLink,
  Crown,
  Boxes,
  ShieldCheck,
  HelpCircle,
  X
} from 'lucide-react';
import { WHATSAPP_BUSINESS_URL } from '../../../data';
import { RohitworkBrandLockup } from '../branding/RohitworkLogo';

interface CrmSidebarProps {
  activeModule: CrmModuleId;
  onSelectModule: (moduleId: CrmModuleId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  adminEmail?: string;
  adminRole?: 'super_admin' | 'admin' | 'editor';
  onLogout: () => void;
  onViewWebsite: () => void;
  newLeadsCount?: number;
}

interface NavSection {
  category: string;
  items: {
    id: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    targetModule: CrmModuleId;
    badge?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    category: 'RELATIONSHIPS',
    items: [
      { id: 'leads', label: 'Leads & Inquiries', icon: Users, targetModule: 'leads' },
      { id: 'clients', label: 'Clients', icon: UserCheck, targetModule: 'clients' },
      { id: 'freelancers', label: 'Freelancer Hub', icon: Briefcase, targetModule: 'freelancers' }
    ]
  },
  {
    category: 'EXECUTION',
    items: [
      { id: 'projects', label: 'Projects', icon: FolderKanban, targetModule: 'projects' },
      { id: 'tasks', label: 'Tasks & Activities', icon: CheckSquare, targetModule: 'tasks' },
      { id: 'deliverables', label: 'Deliverables', icon: PackageCheck, targetModule: 'projects' }
    ]
  },
  {
    category: 'FINANCIALS',
    items: [
      { id: 'quotations', label: 'Quotations & Proposals', icon: FileSpreadsheet, targetModule: 'quotations' },
      { id: 'invoices', label: 'Invoices & Billing', icon: Receipt, targetModule: 'invoices' },
      { id: 'payments', label: 'Payments', icon: CreditCard, targetModule: 'payments' },
      { id: 'expenses', label: 'Expenses', icon: TrendingDown, targetModule: 'expenses' }
    ]
  },
  {
    category: 'INTELLIGENCE & TOOLS',
    items: [
      { id: 'ai-assistant', label: 'AI Inquiry Assistant', icon: Sparkles, targetModule: 'ai-assistant' },
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, targetModule: 'reports' },
      { id: 'reminders', label: 'Reminders', icon: Bell, targetModule: 'reminders' },
      { id: 'integrations', label: 'Integrations', icon: Boxes, targetModule: 'settings' }
    ]
  },
  {
    category: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, targetModule: 'settings' },
      { id: 'team', label: 'Team & Access', icon: ShieldCheck, targetModule: 'settings' },
      { id: 'help', label: 'Help & Support', icon: HelpCircle, targetModule: 'settings' }
    ]
  }
];

export const CrmSidebar: React.FC<CrmSidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  adminEmail = 'workall724038@gmail.com',
  adminRole = 'super_admin',
  onLogout,
  onViewWebsite,
  newLeadsCount = 0
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0b091f] via-[#0f0c2a] to-[#150e38] text-slate-200 border-r border-[#1e1552] select-none shadow-2xl">
      {/* 1. Header / Logo Branding (Approved Rohitwork CRM Logo) */}
      <div
        className={`h-16 flex items-center border-b border-[#1e1552]/80 shrink-0 transition-all ${
          isCollapsed ? 'justify-between px-3' : 'justify-between px-3 sm:px-3.5'
        }`}
      >
        <RohitworkBrandLockup
          collapsed={isCollapsed}
          size={isCollapsed ? 'sm' : 'md'}
          onClick={isCollapsed ? onToggleCollapse : undefined}
        />

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
            isCollapsed ? 'ml-0.5' : ''
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700/60">
        {/* Core: Dashboard Button */}
        <div>
          <button
            type="button"
            onClick={() => {
              onSelectModule('dashboard');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
              activeModule === 'dashboard'
                ? 'bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] text-white shadow-md shadow-purple-900/40 ring-1 ring-purple-400/40'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
            title="Dashboard"
          >
            <div className="flex items-center gap-3 min-w-0">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Dashboard</span>}
            </div>

            {!isCollapsed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#10b981]/25 text-[#10b981] border border-[#10b981]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <span>LIVE</span>
              </span>
            )}
          </button>
        </div>

        {/* Section Groups */}
        {NAV_SECTIONS.map((section) => (
          <div key={section.category} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase select-none">
                {section.category}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.targetModule && (item.id === activeModule || (item.id === 'deliverables' && activeModule === 'projects'));
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'help') {
                      window.open(WHATSAPP_BUSINESS_URL, '_blank');
                    } else {
                      onSelectModule(item.targetModule);
                    }
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-700/80 to-indigo-700/80 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 opacity-80" />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.id === 'leads' && newLeadsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                      {newLeadsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3. Bottom Card: Rohitwork CRM Pro */}
      <div className="p-3 border-t border-[#1e1552] shrink-0 space-y-2.5 bg-[#0a0724]/60">
        {!isCollapsed && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#20104e]/90 to-[#32136e]/90 border border-purple-500/30 flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-purple-200" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white tracking-tight truncate">
                Rohitwork CRM Pro
              </div>
              <div className="text-[10px] font-medium text-purple-300/80 truncate">
                Agency Business Suite
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onViewWebsite}
            className="flex items-center gap-1.5 py-1 px-2 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Public Website</span>}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block h-screen fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
