import React, { useState, useEffect, useMemo } from 'react';
import {
  CrmExpense,
  CrmExpenseCategory,
  CrmProject
} from '../../../../types/crm';
import {
  initCrmStorage,
  getStoredExpenses,
  getStoredProjects,
  subscribeCrmStore,
  getFinancialSummary
} from '../../../../services/crmStorageService';
import { ExpenseTableView } from './ExpenseTableView';
import { AddExpenseModal } from './AddExpenseModal';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmLoadingState } from '../../shared/CrmLoadingState';
import { CrmEmptyState } from '../../shared/CrmEmptyState';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Repeat,
  Sparkles,
  Download,
  X,
  IndianRupee,
  Layers,
  Code,
  Users,
  Building
} from 'lucide-react';

interface ExpensesModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const ExpensesModule: React.FC<ExpensesModuleProps> = ({ onNavigateToModule }) => {
  const [expenses, setExpenses] = useState<CrmExpense[]>([]);
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recurringFilter, setRecurringFilter] = useState<'all' | 'recurring' | 'one_time'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'amount_desc' | 'amount_asc'>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<CrmExpense | null>(null);

  const loadExpenses = async () => {
    try {
      await initCrmStorage();
      setExpenses(getStoredExpenses());
      setProjects(getStoredProjects());
    } catch (err) {
      console.error('Error loading CRM expenses:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadExpenses();

    const unsubscribe = subscribeCrmStore(() => {
      setExpenses(getStoredExpenses());
      setProjects(getStoredProjects());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadExpenses();
  };

  // KPIs
  const kpis = useMemo(() => {
    const summary = getFinancialSummary();

    // Software & studio tools
    const softwareOverhead = expenses
      .filter((e) => e.category === 'software' || e.category === 'studio_equipment')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      operatingExpenses: summary.totalOperatingExpenses,
      recurringMonthly: summary.recurringMonthlyOverhead,
      softwareOverhead: Math.round(softwareOverhead * 100) / 100,
      freelancerPayouts: summary.totalFreelancerPayouts,
      totalCount: expenses.length
    };
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.vendor && e.vendor.toLowerCase().includes(q)) ||
          (e.projectId && e.projectId.toLowerCase().includes(q)) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((e) => e.category === selectedCategory);
    }

    // Recurring filter
    if (recurringFilter === 'recurring') {
      result = result.filter((e) => !!e.isRecurring);
    } else if (recurringFilter === 'one_time') {
      result = result.filter((e) => !e.isRecurring);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [expenses, searchQuery, selectedCategory, recurringFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredExpenses.length / pageSize) || 1;
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, currentPage, pageSize]);

  // Handlers
  const handleOpenAddModal = () => {
    setSelectedExpenseForEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditExpense = (exp: CrmExpense) => {
    setSelectedExpenseForEdit(exp);
    setIsAddModalOpen(true);
  };

  // CSV Export
  const handleExportCsv = () => {
    if (filteredExpenses.length === 0) return;
    const headers = [
      'Expense Description',
      'Category',
      'Vendor',
      'Amount (INR)',
      'Date',
      'Recurring',
      'Billing Frequency',
      'Tax Deductible',
      'Project',
      'Notes'
    ];

    const rows = filteredExpenses.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.category,
      `"${(e.vendor || '').replace(/"/g, '""')}"`,
      e.amount,
      e.date,
      e.isRecurring ? 'YES' : 'NO',
      e.recurringFrequency || 'none',
      e.taxDeductible !== false ? 'YES' : 'NO',
      `"${(e.projectId || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rohitwork_expenses_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CrmPageHeader
          title="Expense Registry"
          subtitle="Track studio operating costs, SaaS subscriptions, and overheads"
        />
        <CrmLoadingState rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header */}
      <CrmPageHeader
        title="Expense & Overhead Management"
        subtitle="Operational cost tracking, software subscriptions, studio equipment, and tax deductibles"
        icon={Building}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs ${
                isRefreshing ? 'animate-spin text-[#7c3aed]' : ''
              }`}
              title="Refresh expenses"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        }
      />

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Operating Expenses (Without double counting freelancer payouts) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Operating Overhead
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              ₹{kpis.operatingExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Tools, office & gear (deduplicated)
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
            <Building className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 2: Monthly Recurring Overhead */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Recurring Monthly Cost
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
              ₹{kpis.recurringMonthly.toLocaleString('en-IN')}/mo
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Fixed software & rent commitments
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shadow-2xs">
            <Repeat className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 3: Software & Creative Suite */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              SaaS & Studio Subscriptions
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-blue-600 dark:text-blue-400 mt-1 tracking-tight">
              ₹{kpis.softwareOverhead.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Adobe, Figma & production tools
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shadow-2xs">
            <Code className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 4: Subcontractor Costs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#7c3aed] dark:text-purple-400">
              Subcontractor Disbursements
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-[#7c3aed] dark:text-purple-400 mt-1 tracking-tight">
              ₹{kpis.freelancerPayouts.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Direct creative labor payouts
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by expense, vendor, or project..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="software">SaaS & Software</option>
              <option value="freelancer">Freelancer Payouts</option>
              <option value="studio_equipment">Studio & Gear</option>
              <option value="marketing">Marketing & Ads</option>
              <option value="office">Office & Utilities</option>
              <option value="travel">Travel & Shoot</option>
              <option value="legal_professional">Legal & CA</option>
              <option value="other">Other Expenses</option>
            </select>
          </div>

          {/* Recurring Filter */}
          <div className="md:col-span-2">
            <select
              value={recurringFilter}
              onChange={(e) => {
                setRecurringFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Expense Types</option>
              <option value="recurring">Recurring Overhead Only</option>
              <option value="one_time">One-time Expenses Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="newest">Sort: Date (Newest)</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Filter reset row */}
        {(searchQuery || selectedCategory !== 'all' || recurringFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            <span>Filtered results ({filteredExpenses.length} found):</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setRecurringFilter('all');
                setCurrentPage(1);
              }}
              className="text-violet-600 dark:text-violet-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Table */}
      {filteredExpenses.length === 0 ? (
        <CrmEmptyState
          title="No Expenses Found"
          description={
            searchQuery || selectedCategory !== 'all' || recurringFilter !== 'all'
              ? 'No business expenses match your filter criteria.'
              : 'Record business overheads, software tools, or studio expenses to monitor net cashflow.'
          }
          action={
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold"
            >
              Record Expense
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <ExpenseTableView
            expenses={paginatedExpenses}
            onEditExpense={handleEditExpense}
            onRefresh={handleRefresh}
            onNavigateToProject={(projId) => {
              if (onNavigateToModule) onNavigateToModule('projects');
            }}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.min(currentPage * pageSize, filteredExpenses.length)}
                </span>{' '}
                of <span className="font-bold text-slate-900 dark:text-white">{filteredExpenses.length}</span> expenses
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  Previous
                </button>
                <div className="font-bold text-slate-900 dark:text-white px-2">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialExpense={selectedExpenseForEdit}
        onExpenseSaved={() => handleRefresh()}
      />
    </div>
  );
};
