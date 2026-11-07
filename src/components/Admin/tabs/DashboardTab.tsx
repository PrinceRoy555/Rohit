import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { InquiryRecord } from '../../../types/cms';
import { fetchInquiries, updateInquiryCrm, deleteInquiry } from '../../../services/cmsApi';
import ThemeToggle from '../../ThemeToggle';
import { TodayDashboardSummary } from '../crm/TodayDashboardSummary';
import { TodaysFollowUps } from '../crm/TodaysFollowUps';
import { HotLeadsSection } from '../crm/HotLeadsSection';
import { LeadDetailDrawer } from '../crm/LeadDetailDrawer';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  Send,
  Eye,
  FileCheck,
  Palette,
  ArrowRight,
  Briefcase,
  Wrench,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardTabProps {
  setActiveTab: (tab: string, options?: {
    view?: 'inbox' | 'followups' | 'hot_leads';
    followUpFilter?: 'today' | 'overdue' | 'upcoming' | 'completed';
    statusFilter?: 'all' | 'new' | 'contacted' | 'closed';
  }) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ setActiveTab }) => {
  const { config, hasUnpublishedChanges, isPublishing, publish, isPreviewMode, setPreviewMode } = useSiteConfig();

  const [leads, setLeads] = useState<InquiryRecord[]>([]);
  const [selectedLead, setSelectedLead] = useState<InquiryRecord | null>(null);

  // Fetch real Firestore leads
  const loadLeads = async () => {
    try {
      const res = await fetchInquiries();
      if (res.success && res.inquiries) {
        setLeads(res.inquiries);
      }
    } catch (e) {
      console.warn('[Dashboard] Could not fetch inquiries:', e);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleUpdateLeadCrm = async (id: string, updates: Partial<InquiryRecord>) => {
    await updateInquiryCrm(id, updates);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
    if (selectedLead?.id === id) {
      setSelectedLead((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleMarkFollowUpDone = async (id: string) => {
    await handleUpdateLeadCrm(id, {
      followUpStatus: 'completed',
      lastContactedAt: new Date().toISOString()
    });
  };

  const handleDeleteLead = async (id: string) => {
    const res = await deleteInquiry(id);
    if (res.success) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    }
  };

  const handleMetricClick = (metric: 'new' | 'followups_today' | 'overdue' | 'hot_leads') => {
    if (metric === 'new') {
      setActiveTab('inquiries', { view: 'inbox', statusFilter: 'new' });
    } else if (metric === 'followups_today') {
      setActiveTab('inquiries', { view: 'followups', followUpFilter: 'today' });
    } else if (metric === 'overdue') {
      setActiveTab('inquiries', { view: 'followups', followUpFilter: 'overdue' });
    } else if (metric === 'hot_leads') {
      setActiveTab('inquiries', { view: 'hot_leads' });
    }
  };

  const stats = [
    {
      label: 'Portfolio Projects',
      value: config.portfolio?.length || 0,
      icon: Briefcase,
      color: 'text-accent-primary bg-accent-primary/10 border-accent-primary/20',
      action: () => setActiveTab('portfolio')
    },
    {
      label: 'Creative Services',
      value: config.services?.length || 0,
      icon: Wrench,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      action: () => setActiveTab('services')
    },
    {
      label: 'Client Testimonials',
      value: config.testimonials?.length || 0,
      icon: MessageSquare,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      action: () => setActiveTab('testimonials')
    },
    {
      label: 'Active Skills',
      value: config.skills?.length || 0,
      icon: Sparkles,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      action: () => setActiveTab('skills')
    }
  ];

  return (
    <div className="space-y-5 sm:space-y-8 max-w-6xl mx-auto">
      {/* 1. PAGE HEADER (Section 39) */}
      <div id="d4x7qm" className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-7 lg:p-8 border border-border-color bg-bg-card text-text-primary shadow-xs transition-colors duration-200">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent-primary/5 dark:bg-accent-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-primary/10 text-accent-primary border border-accent-primary/20 mb-2 sm:mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
              <span>Executive CRM & CMS Command Suite</span>
            </div>
            <h1 id="e3m1cz" className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-text-primary">
              Management & Operations Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-text-muted max-w-xl">
              Live site: <span className="font-semibold text-text-primary">{config.branding?.siteName || 'Rohit Verma'}</span> • Version {config.version || 1} • Preset: <span className="font-semibold text-text-primary">{config.theme?.presetName || 'Scarlet Prestige'}</span>
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
            <div title="Toggle Light / Dark Theme" className="hidden xs:flex items-center justify-center">
              <ThemeToggle id="admin-dashboard-theme-toggle" />
            </div>

            <button
              onClick={() => setPreviewMode(!isPreviewMode)}
              className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border select-none active:scale-98 ${
                isPreviewMode
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-xs font-bold'
                  : 'bg-bg-secondary hover:bg-bg-card-hover text-text-primary border-border-color'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{isPreviewMode ? 'Exit Draft Preview' : 'Preview Draft'}</span>
            </button>

            {hasUnpublishedChanges && (
              <button
                onClick={() => publish()}
                disabled={isPublishing}
                className="min-h-[42px] px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent-primary hover:bg-accent-secondary text-white shadow-md shadow-accent-primary/30 flex items-center justify-center gap-2 transition-all select-none active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>{isPublishing ? 'Publishing...' : 'Publish Changes'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Callout */}
        {hasUnpublishedChanges ? (
          <div className="mt-3.5 sm:mt-5 pt-3.5 sm:pt-5 border-t border-border-color flex items-center gap-2 sm:gap-3 text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 animate-pulse text-amber-600 dark:text-amber-400" />
            <span>You have working draft changes. Tap <strong className="font-semibold text-amber-800 dark:text-amber-200">Publish Changes</strong> to push them live to all visitors.</span>
          </div>
        ) : (
          <div className="mt-3.5 sm:mt-5 pt-3.5 sm:pt-5 border-t border-border-color flex items-center gap-2 sm:gap-3 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>All CMS changes are published and live on the public website.</span>
          </div>
        )}
      </div>

      {/* 2. TODAY SUMMARY (Section 35 & 39) */}
      <TodayDashboardSummary
        leads={leads}
        onSelectMetric={handleMetricClick}
      />

      {/* 3. TODAY'S FOLLOW-UPS (Section 27 & 39) */}
      <TodaysFollowUps
        leads={leads}
        onOpenLead={(lead) => setSelectedLead(lead)}
        onMarkComplete={handleMarkFollowUpDone}
        onViewAll={() => setActiveTab('inquiries', { view: 'followups', followUpFilter: 'today' })}
      />

      {/* 4. HOT LEADS (Section 31 & 39) */}
      <HotLeadsSection
        leads={leads}
        onOpenLead={(lead) => setSelectedLead(lead)}
        onViewAll={() => setActiveTab('inquiries', { view: 'hot_leads' })}
      />

      {/* 5. MAIN CONTENT KPIs (Section 39) */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Website Content Overview
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                onClick={stat.action}
                className="bg-bg-card hover:bg-bg-card-hover border border-border-color hover:border-accent-primary/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 cursor-pointer transition-all duration-200 group shadow-xs hover:shadow-md select-none active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border ${stat.color}`}>
                    <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                  </div>
                  <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all hidden xs:block" />
                </div>
                <div className="mt-2.5 sm:mt-3">
                  <div className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight tabular-nums">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-text-muted font-medium mt-0.5 truncate">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. QUICK ACCESS MODULES (Section 39) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
        {/* Module 1: Website Customizer */}
        <div
          onClick={() => setActiveTab('customizer')}
          className="bg-bg-card hover:bg-bg-card-hover border border-border-color hover:border-accent-primary/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer group transition-all shadow-xs hover:shadow-md select-none active:scale-99"
        >
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
            <Palette className="w-5 sm:w-6 h-5 sm:h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
            Website Customizer & Theme
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-1.5 sm:mt-2">
            Change color schemes, typography, border radius, site logos, bio text, and branding without writing code.
          </p>
          <div className="mt-3 sm:mt-4 flex items-center gap-1.5 text-xs font-semibold text-accent-primary group-hover:underline">
            <span>Open Customizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Module 2: Template System */}
        <div
          onClick={() => setActiveTab('templates')}
          className="bg-bg-card hover:bg-bg-card-hover border border-border-color hover:border-indigo-500/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer group transition-all shadow-xs hover:shadow-md select-none active:scale-99"
        >
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
            <Layers className="w-5 sm:w-6 h-5 sm:h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Template Reselling System
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-1.5 sm:mt-2">
            1-click switch between pre-built creator, agency, or minimal themes. Export and import templates to sell to clients.
          </p>
          <div className="mt-3 sm:mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
            <span>Browse Templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Module 3: Page & Section Manager */}
        <div
          onClick={() => setActiveTab('sections')}
          className="bg-bg-card hover:bg-bg-card-hover border border-border-color hover:border-amber-500/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer group transition-all shadow-xs hover:shadow-md select-none active:scale-99"
        >
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
            <LayoutDashboard className="w-5 sm:w-6 h-5 sm:h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            Page & Section Manager
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-1.5 sm:mt-2">
            Turn sections on or off, reorder homepage blocks, customize headlines, badges, and standalone pages.
          </p>
          <div className="mt-3 sm:mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:underline">
            <span>Manage Sections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 7. SYSTEM STATUS & ARCHITECTURE (Section 39) */}
      <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs transition-colors duration-200">
        <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>System Status & Multi-Tenancy Architecture</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-sm">
          <div className="p-3.5 sm:p-4 rounded-xl bg-bg-secondary border border-border-color">
            <div className="text-text-muted text-xs font-medium">Public Site Link</div>
            <div className="text-text-primary font-semibold mt-1 truncate">/ (Live Website)</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              <span>Synced with Firestore</span>
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl bg-bg-secondary border border-border-color">
            <div className="text-text-muted text-xs font-medium">Revision Engine</div>
            <div className="text-text-primary font-semibold mt-1">Automatic Snapshots</div>
            <div className="text-xs text-text-muted mt-1">1-Click instant rollback</div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl bg-bg-secondary border border-border-color">
            <div className="text-text-muted text-xs font-medium">Security Access</div>
            <div className="text-text-primary font-semibold mt-1">Role-Based Access</div>
            <div className="text-xs text-text-muted mt-1">CRM fields protected for admin</div>
          </div>
        </div>
      </div>

      {/* Lead Detail Drawer on Dashboard */}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLeadCrm}
          onDeleteLead={handleDeleteLead}
        />
      )}
    </div>
  );
};
