import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Calendar,
  Filter,
  ShieldCheck,
  RefreshCw,
  FolderKanban,
  Receipt,
  CreditCard,
  Building,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Database
} from 'lucide-react';
import { CrmReportDateRange } from '../../../../types/crm';
import {
  getComprehensiveReports,
  getFinancialSummary,
  initCrmStorage,
  subscribeCrmStore
} from '../../../../services/crmStorageService';
import { CrmPageHeader } from '../../shared/CrmPageHeader';

interface ReportsModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ onNavigateToModule }) => {
  const [dateRange, setDateRange] = useState<CrmReportDateRange>('all');
  const [reports, setReports] = useState(getComprehensiveReports('all'));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadReports = async () => {
    try {
      await initCrmStorage();
      setReports(getComprehensiveReports(dateRange));
    } catch (err) {
      console.error('Error loading CRM reports:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();

    const unsubscribe = subscribeCrmStore(() => {
      setReports(getComprehensiveReports(dateRange));
    });

    return () => {
      unsubscribe();
    };
  }, [dateRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadReports();
  };

  // CSV Export for CA and Accounting
  const handleExportCsv = () => {
    const lines = [
      ['Rohitwork Premium CRM — Performance & Financial Audit Report'],
      [`Generated At: ${new Date().toISOString()}`],
      [`Date Range Filter: ${dateRange.toUpperCase()}`],
      [''],
      ['FINANCIAL METRICS (INR)'],
      ['Total Invoiced Revenue', reports.totalInvoiced],
      ['Total Collected Inflows', reports.totalCollected],
      ['Outstanding Balance Due', reports.totalOutstanding],
      ['Total Freelancer Subcontractor Payouts', reports.totalFreelancerPayouts],
      ['Direct Studio Operating Expenses', reports.totalOperatingExpenses],
      ['Net Agency Profit / Cashflow', reports.netProfit],
      ['Profit Margin (%)', `${reports.profitMargin}%`],
      [''],
      ['SALES & FUNNEL CONVERSION'],
      ['Total Inquiries / Leads', reports.totalLeads],
      ['Qualified Prospects', reports.qualifiedLeads],
      ['Won Deals / Active Clients', reports.wonLeads],
      ['Lost Inquiries', reports.lostLeads],
      ['Conversion Rate (%)', `${reports.conversionRate}%`],
      [''],
      ['OPERATIONAL VELOCITY'],
      ['Total Projects in Scope', reports.totalProjects],
      ['Total Tasks Tracked', reports.totalTasks],
      ['Completed Tasks', reports.completedTasks],
      ['Task Completion Rate (%)', `${reports.taskCompletionRate}%`],
      [''],
      ['DATA ORIGIN DISCLOSURE'],
      ['Real Firestore Contact Inquiries', reports.firestoreLeadsCount],
      ['Verified Local Demo Records', reports.demoLeadsCount]
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      lines.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rohitwork_crm_analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Page Header */}
      <CrmPageHeader
        title="Reports & Financial Analytics"
        subtitle="Executive cashflow performance, lead conversion funnel, and operational efficiency"
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-2.5">
            {/* Date Range Selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold shadow-2xs">
              {[
                { id: '30d', label: '30 Days' },
                { id: '90d', label: 'Quarter' },
                { id: 'year', label: 'Year' },
                { id: 'all', label: 'All Time' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setDateRange(r.id as CrmReportDateRange)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    dateRange === r.id
                      ? 'bg-white dark:bg-slate-900 text-[#7c3aed] dark:text-purple-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs ${
                isRefreshing ? 'animate-spin text-[#7c3aed]' : ''
              }`}
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit CSV</span>
            </button>
          </div>
        }
      />

      {/* 2. Data Integrity & Origin Transparency Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Data Origin Audit</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">
                Transparent Pipeline
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Distinguishing real cloud data streams from verified local demo workflows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud Firestore Leads: {reports.firestoreLeadsCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Local Seeded Demo Records: {reports.demoLeadsCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Executive Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Invoiced */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Invoiced Revenue
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              ₹{reports.totalInvoiced.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Gross billed commercial scope
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
            <Receipt className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 2: Total Collected */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Collected Inflows
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{reports.totalCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
              Confirmed bank remittances
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Net Profit & Margin */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Net Agency Cashflow
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{reports.netProfit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {reports.profitMargin}% Operating Margin
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Outstanding Receivables */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Outstanding Balances
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              ₹{reports.totalOutstanding.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-600/80 font-medium mt-0.5">
              Pending client clearance
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Two-Column Breakdown: Cashflow Comparison & Lead Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 Cols): Cashflow Breakdown */}
        <div className="lg:col-span-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-violet-500" />
              <span>Cashflow & Cost Allocation</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Deduplicated Net Calculation
            </span>
          </div>

          {/* Visual Stack Bar */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Client Collections (+ Received)</span>
                </span>
                <span className="font-mono">₹{reports.totalCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Freelancer Subcontractor Payouts (-)</span>
                </span>
                <span className="font-mono">₹{reports.totalFreelancerPayouts.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{
                    width: `${reports.totalCollected > 0 ? Math.min(100, Math.round((reports.totalFreelancerPayouts / reports.totalCollected) * 100)) : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>Studio Operating Overhead (-)</span>
                </span>
                <span className="font-mono">₹{reports.totalOperatingExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${reports.totalCollected > 0 ? Math.min(100, Math.round((reports.totalOperatingExpenses / reports.totalCollected) * 100)) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Net Cashflow Summary Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Net Retained Studio Profit:
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{reports.netProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Right Column (6 Cols): Sales Funnel & Conversion Velocity */}
        <div className="lg:col-span-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Lead Conversion Funnel</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {reports.conversionRate}% Conversion Rate
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Step 1: Total Leads */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">1. Total Inquiries Captured</span>
                <span className="font-bold text-slate-900 dark:text-white">{reports.totalLeads}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Step 2: Qualified Leads */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">2. Qualified Prospects</span>
                <span className="font-bold text-slate-900 dark:text-white">{reports.qualifiedLeads}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${Math.round((reports.qualifiedLeads / reports.totalLeads) * 100)}%` }}
                />
              </div>
            </div>

            {/* Step 3: Won Deals */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">3. Won & Converted Clients</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{reports.wonLeads}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.round((reports.wonLeads / reports.totalLeads) * 100)}%` }}
                />
              </div>
            </div>

            {/* Step 4: Lost */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">4. Unconverted / Dropped</span>
                <span className="font-bold text-slate-400">{reports.lostLeads}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${Math.round((reports.lostLeads / reports.totalLeads) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
            High conversion velocity supported by rapid AI WhatsApp draft responses and formal scope proposals.
          </div>
        </div>
      </div>

      {/* 5. Acquisition Sources & Operational Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Acquisition Sources (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Lead Acquisition Channels</span>
          </h3>

          <div className="space-y-2.5">
            {Object.entries(reports.sourceMap).map(([source, count]) => {
              const pct = Math.round((count / reports.totalLeads) * 100) || 0;
              return (
                <div key={source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {source}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational & Task Completion (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-500" />
              <span>Project & Task Execution Velocity</span>
            </h3>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {reports.taskCompletionRate}% Completed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Projects</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {reports.totalProjects}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Commercial creative briefs</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Completed Tasks</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {reports.completedTasks} / {reports.totalTasks}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Subtasks and milestones</div>
            </div>
          </div>

          {/* Project Status Badges */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Projects by Stage:
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(reports.projectStatusMap).map(([st, count]) => (
                <span
                  key={st}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  <span className="capitalize">{st.replace('_', ' ')}</span>: <strong>{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
