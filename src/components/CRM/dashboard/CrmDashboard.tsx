import React, { useState, useEffect, useCallback } from 'react';
import { CrmDashboardMetrics, CrmLead, CrmModuleId } from '../../../types/crm';
import { getCrmDashboardMetrics } from '../../../services/crmService';
import { subscribeCrmStore } from '../../../services/crmStorageService';
import { CrmStatCard } from './CrmStatCard';
import { RevenueOverviewChart } from './RevenueOverviewChart';
import { LeadsPipelineChart } from './LeadsPipelineChart';
import { PaymentsOverviewChart } from './PaymentsOverviewChart';
import { AgencyQuickActions } from './AgencyQuickActions';
import { RecentActivitySection } from './RecentActivitySection';
import { TodayHighlightsSection } from './TodayHighlightsSection';
import {
  BarChart3,
  Users,
  Zap,
  UserCheck,
  Layers,
  CheckSquare,
  IndianRupee,
  CreditCard,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';
import { WHATSAPP_BUSINESS_URL } from '../../../data';

interface CrmDashboardProps {
  onNavigateToModule: (moduleId: CrmModuleId) => void;
  onOpenLeadDetail?: (lead: CrmLead) => void;
}

export const CrmDashboard: React.FC<CrmDashboardProps> = ({
  onNavigateToModule,
  onOpenLeadDetail
}) => {
  const [metrics, setMetrics] = useState<CrmDashboardMetrics>({
    totalLeads: 0,
    newLeads: 0,
    activeClientsCount: 0,
    activeProjectsCount: 0,
    pendingTasksCount: 0,
    monthlyRevenue: 0,
    outstandingPayments: 0,
    freelancerPayoutsDue: 0,
    recentLeads: [],
    upcomingFollowUps: [],
    servicesBreakdown: [],
    leadSourcesBreakdown: [],
    lastUpdated: 'Initializing...',
    isFirestoreConnected: false
  });
  const [refreshing, setRefreshing] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const loadData = useCallback(async (isManual = false) => {
    setRefreshing(true);

    try {
      const data = await getCrmDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('[CRM Dashboard] Failed to load metrics:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeCrmStore(() => {
      loadData();
    });
    return () => {
      unsubscribe();
    };
  }, [loadData]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Page Header (Exact V2 layout with violet icon box) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Left: Icon Box + Title + Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6d28d9] to-[#8b5cf6] text-white flex items-center justify-center shadow-md shadow-purple-600/25 shrink-0">
            <BarChart3 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Agency Dashboard
              </h1>

              {metrics.isFirestoreConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Firestore Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Mock / Local Cache</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              Real-time business overview, verified inquiries, and active creative workflows.
            </p>
          </div>
        </div>

        {/* Right: Last Synced Pill + Open WhatsApp Business */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-400">Last Synced:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-bold">Today, {metrics.lastUpdated}</strong>
            </div>
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50 ml-1"
              title="Refresh Dashboard"
              aria-label="Refresh Dashboard"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
            </button>
          </div>

          <a
            href={WHATSAPP_BUSINESS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open WhatsApp Business</span>
          </a>
        </div>
      </div>

      {/* 2. Production Cloud Status Banner */}
      {!bannerDismissed && metrics.isFirestoreConnected && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs shadow-2xs animate-in fade-in">
          <div className="flex flex-wrap items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Live Production Firestore Active & Synchronized</span>
            </span>
            <span className="hidden sm:inline text-emerald-400">|</span>
            <span className="text-emerald-700/90 dark:text-emerald-400 text-[11px]">
              All metrics strictly reflect verified cloud records. Local demo records are excluded from business metrics.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 p-1 rounded-md"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Primary KPI Metrics Grid (8 Cards: 4 across x 2 rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Inquiries */}
        <CrmStatCard
          title="Total Inquiries"
          value={metrics.totalLeads}
          icon={Users}
          colorScheme="blue"
          badgeType="live"
          trendText={metrics.kpiTrends?.totalLeads?.text || '—'}
          trendDirection={metrics.kpiTrends?.totalLeads?.direction || 'neutral'}
          sparklineData={metrics.kpiTrends?.totalLeads?.sparklineData}
          sublabel="Deduplicated customer leads"
          actionText=""
          onClick={() => onNavigateToModule('leads')}
        />

        {/* Card 2: New Inquiries */}
        <CrmStatCard
          title="New Inquiries"
          value={metrics.newLeads}
          icon={Zap}
          colorScheme="purple"
          badgeType="action_req"
          trendText={metrics.kpiTrends?.newLeads?.text || '—'}
          trendDirection={metrics.kpiTrends?.newLeads?.direction || 'neutral'}
          sparklineData={metrics.kpiTrends?.newLeads?.sparklineData}
          sublabel="Awaiting response"
          actionText="24 Unread →"
          onAction={() => onNavigateToModule('leads')}
          onClick={() => onNavigateToModule('leads')}
        />

        {/* Card 3: Active Clients */}
        <CrmStatCard
          title="Active Clients"
          value={metrics.activeClientsCount}
          icon={UserCheck}
          colorScheme="cyan"
          badgeType="live"
          trendText={metrics.kpiTrends?.activeClients?.text || '—'}
          trendDirection={metrics.kpiTrends?.activeClients?.direction || 'neutral'}
          sparklineData={metrics.kpiTrends?.activeClients?.sparklineData}
          sublabel="Client Directory"
          actionText="View Clients →"
          onAction={() => onNavigateToModule('clients')}
          onClick={() => onNavigateToModule('clients')}
        />

        {/* Card 4: Active Projects */}
        <CrmStatCard
          title="Active Projects"
          value={metrics.activeProjectsCount}
          icon={Layers}
          colorScheme="indigo"
          badgeType="live"
          trendText={metrics.kpiTrends?.activeProjects?.text || '—'}
          trendDirection={metrics.kpiTrends?.activeProjects?.direction || 'neutral'}
          sparklineData={metrics.kpiTrends?.activeProjects?.sparklineData}
          sublabel="Creative Deliverables"
          actionText="Live Tracker →"
          onAction={() => onNavigateToModule('projects')}
          onClick={() => onNavigateToModule('projects')}
        />

        {/* Card 5: Pending Tasks */}
        <CrmStatCard
          title="Pending Tasks"
          value={metrics.pendingTasksCount}
          icon={CheckSquare}
          colorScheme="violet"
          badgeType="live"
          trendText={metrics.kpiTrends?.pendingTasks?.text || '—'}
          trendDirection={metrics.kpiTrends?.pendingTasks?.direction || 'neutral'}
          sparklineData={metrics.kpiTrends?.pendingTasks?.sparklineData}
          sublabel="Active To-Do & Review"
          actionText="Live Tracker →"
          onAction={() => onNavigateToModule('tasks')}
          onClick={() => onNavigateToModule('tasks')}
        />

        {/* Card 6: Received Revenue */}
        <CrmStatCard
          title="Received Revenue"
          value={metrics.monthlyRevenue > 0 ? `₹${metrics.monthlyRevenue.toLocaleString('en-IN')}` : '₹0'}
          icon={IndianRupee}
          colorScheme="emerald"
          badgeType="live"
          trendText={metrics.kpiTrends?.monthlyRevenue?.text || '—'}
          trendDirection={metrics.kpiTrends?.monthlyRevenue?.direction || 'neutral'}
          sparklineData={metrics.kpiTrends?.monthlyRevenue?.sparklineData}
          sublabel="Client Collections"
          actionText="Collected Inflow →"
          onAction={() => onNavigateToModule('payments')}
          onClick={() => onNavigateToModule('payments')}
        />

        {/* Card 7: Outstanding Balances */}
        <CrmStatCard
          title="Outstanding Balances"
          value={metrics.outstandingPayments > 0 ? `₹${metrics.outstandingPayments.toLocaleString('en-IN')}` : '₹0'}
          icon={CreditCard}
          colorScheme="amber"
          badgeType="live"
          trendText={metrics.kpiTrends?.outstandingPayments?.text || '—'}
          trendDirection={metrics.kpiTrends?.outstandingPayments?.direction || 'neutral'}
          sparklineData={metrics.kpiTrends?.outstandingPayments?.sparklineData}
          sublabel="Invoices Due"
          actionText="Active Receivables →"
          onAction={() => onNavigateToModule('invoices')}
          onClick={() => onNavigateToModule('invoices')}
        />

        {/* Card 8: Freelancer Payouts Due */}
        <CrmStatCard
          title="Freelancer Payouts Due"
          value={metrics.freelancerPayoutsDue > 0 ? `₹${metrics.freelancerPayoutsDue.toLocaleString('en-IN')}` : '₹0'}
          icon={Users}
          colorScheme="pink"
          badgeType="live"
          trendText={metrics.kpiTrends?.freelancerPayouts?.text || '—'}
          trendDirection={metrics.kpiTrends?.freelancerPayouts?.direction || 'neutral'}
          sparklineData={metrics.kpiTrends?.freelancerPayouts?.sparklineData}
          sublabel="Pending subcontractor payouts"
          actionText="Live Tracker →"
          onAction={() => onNavigateToModule('freelancers')}
          onClick={() => onNavigateToModule('freelancers')}
        />
      </div>

      {/* 4. Middle Row: 3 Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Panel 1: Revenue Overview (Width ~42%) */}
        <div className="lg:col-span-5 flex flex-col">
          <RevenueOverviewChart
            overview={metrics.revenueOverview}
            onNavigateToFinancials={() => onNavigateToModule('payments')}
          />
        </div>

        {/* Panel 2: Leads Pipeline (Width ~33%) */}
        <div className="lg:col-span-4 flex flex-col">
          <LeadsPipelineChart
            stages={metrics.leadsPipeline}
            conversionRate={metrics.conversionRate}
            conversionRateTrend={metrics.conversionRateTrend}
            onNavigateToLeads={() => onNavigateToModule('leads')}
          />
        </div>

        {/* Panel 3: Payments Overview (Width ~25%) */}
        <div className="lg:col-span-3 flex flex-col">
          <PaymentsOverviewChart
            overview={metrics.paymentsOverview}
            onNavigateToPayments={() => onNavigateToModule('payments')}
          />
        </div>
      </div>

      {/* 5. Bottom Row: 3 Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Section 1: Agency Quick Actions */}
        <div className="flex flex-col">
          <AgencyQuickActions
            onNavigateToModule={onNavigateToModule}
          />
        </div>

        {/* Section 2: Recent Activity */}
        <div className="flex flex-col">
          <RecentActivitySection
            activities={metrics.recentActivities}
            onNavigateToModule={onNavigateToModule}
          />
        </div>

        {/* Section 3: Today's Highlights */}
        <div className="flex flex-col">
          <TodayHighlightsSection
            highlights={metrics.todayHighlights}
          />
        </div>
      </div>
    </div>
  );
};
