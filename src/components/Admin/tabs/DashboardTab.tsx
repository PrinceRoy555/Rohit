import React from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  Send,
  Eye,
  FileCheck,
  Palette,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Wrench,
  MessageSquare
} from 'lucide-react';

interface DashboardTabProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ setActiveTab }) => {
  const { config, draftConfig, hasUnpublishedChanges, isPublishing, publish, isPreviewMode, setPreviewMode } = useSiteConfig();

  const stats = [
    {
      label: 'Portfolio Projects',
      value: config.portfolio?.length || 0,
      icon: Briefcase,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Welcome Banner */}
      <div id="d4x7qm" className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-border-color bg-bg-card text-text-primary shadow-sm transition-colors duration-200">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/5 dark:bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Full CMS & Template Control Suite</span>
            </div>
            <h1 id="e3m1cz" className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Website Management Overview
            </h1>
            <p className="mt-1 text-sm sm:text-base text-text-muted max-w-xl">
              Live site name: <span className="font-semibold text-text-primary">{config.branding?.siteName || 'Rohit Verma'}</span> • Version {config.version || 1} • Theme: <span className="font-semibold text-text-primary">{config.theme?.presetName || 'Scarlet Prestige'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPreviewMode(!isPreviewMode)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border ${
                isPreviewMode
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
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
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isPublishing ? 'Publishing...' : 'Publish Changes'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Callout */}
        {hasUnpublishedChanges ? (
          <div className="mt-6 pt-6 border-t border-border-color flex items-center gap-3 text-amber-700 dark:text-amber-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-600 dark:text-amber-400" />
            <span>You have working draft changes. Click <strong className="font-semibold text-amber-800 dark:text-amber-200">Publish Changes</strong> to push them live to all visitors.</span>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-border-color flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>All changes are published and live on the public website.</span>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={stat.action}
              className="bg-bg-card hover:bg-bg-card-hover border border-border-color hover:border-rose-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">{stat.value}</div>
                <div className="text-xs sm:text-sm text-text-muted font-medium mt-1">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Website Customizer */}
        <div
          onClick={() => setActiveTab('customizer')}
          className="bg-bg-card hover:bg-bg-card-hover border border-border-color hover:border-rose-500/40 rounded-2xl p-6 cursor-pointer group transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text-primary group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            Website Customizer & Theme
          </h3>
          <p className="text-sm text-text-muted mt-2">
            Change color schemes, typography, border radius, site logos, bio text, and branding without writing code.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:underline">
            <span>Open Customizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Module 2: Template System */}
        <div
          onClick={() => setActiveTab('templates')}
          className="bg-bg-card hover:bg-bg-card-hover border border-border-color hover:border-indigo-500/40 rounded-2xl p-6 cursor-pointer group transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Template Reselling System
          </h3>
          <p className="text-sm text-text-muted mt-2">
            1-click switch between pre-built creator, agency, or minimal themes. Export and import templates to sell to clients.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
            <span>Browse Templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Module 3: Page & Section Manager */}
        <div
          onClick={() => setActiveTab('sections')}
          className="bg-bg-card hover:bg-bg-card-hover border border-border-color hover:border-amber-500/40 rounded-2xl p-6 cursor-pointer group transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text-primary group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            Page & Section Manager
          </h3>
          <p className="text-sm text-text-muted mt-2">
            Turn sections on or off, reorder homepage blocks, customize headlines, badges, and standalone pages.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:underline">
            <span>Manage Sections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Safety Guarantees */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6 shadow-sm transition-colors duration-200">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>System Status & Multi-Tenancy Architecture</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-color">
            <div className="text-text-muted text-xs font-medium">Public Site Link</div>
            <div className="text-text-primary font-semibold mt-1 truncate">/ (Live Website)</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              <span>Synced with CMS</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-color">
            <div className="text-text-muted text-xs font-medium">Revision Engine</div>
            <div className="text-text-primary font-semibold mt-1">Automatic Snapshots</div>
            <div className="text-xs text-text-muted mt-1">1-Click instant rollback</div>
          </div>
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-color">
            <div className="text-text-muted text-xs font-medium">Security Access</div>
            <div className="text-text-primary font-semibold mt-1">HTTP-Only Admin Cookie</div>
            <div className="text-xs text-text-muted mt-1">No plaintext frontend keys</div>
          </div>
        </div>
      </div>
    </div>
  );
};
