import React, { useState, useEffect, useMemo } from 'react';
import {
  CrmQuotation,
  CrmQuotationStatus,
  CrmClient,
  CrmProject
} from '../../../../types/crm';
import {
  initCrmStorage,
  getStoredQuotations,
  getStoredClients,
  getStoredProjects,
  subscribeCrmStore
} from '../../../../services/crmStorageService';
import { QuotationTableView } from './QuotationTableView';
import { AddQuotationModal } from './AddQuotationModal';
import { QuotationPreviewDrawer } from './QuotationPreviewDrawer';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmLoadingState } from '../../shared/CrmLoadingState';
import { CrmEmptyState } from '../../shared/CrmEmptyState';
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  IndianRupee,
  Receipt,
  Sparkles
} from 'lucide-react';

interface QuotationsModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const QuotationsModule: React.FC<QuotationsModuleProps> = ({ onNavigateToModule }) => {
  const [quotations, setQuotations] = useState<CrmQuotation[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'newest' | 'validity' | 'amount_desc' | 'amount_asc' | 'number'
  >('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuotationForPreview, setSelectedQuotationForPreview] =
    useState<CrmQuotation | null>(null);
  const [selectedQuotationForEdit, setSelectedQuotationForEdit] =
    useState<CrmQuotation | null>(null);

  // 1. Initial Load & Subscription
  const loadQuotations = async () => {
    try {
      await initCrmStorage();
      setQuotations(getStoredQuotations());
      setClients(getStoredClients());
      setProjects(getStoredProjects());
    } catch (err) {
      console.error('Error loading CRM quotations:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuotations();

    const unsubscribe = subscribeCrmStore(() => {
      setQuotations(getStoredQuotations());
      setClients(getStoredClients());
      setProjects(getStoredProjects());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadQuotations();
  };

  // 2. Computed Financial & Operational Metrics
  const metrics = useMemo(() => {
    const activeQuotations = quotations.filter((q) => !q.archived);
    const totalCount = activeQuotations.length;
    const totalPipelineValue = activeQuotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    const acceptedList = activeQuotations.filter((q) => q.status === 'accepted');
    const acceptedCount = acceptedList.length;
    const acceptedValue = acceptedList.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    const pendingDecisionList = activeQuotations.filter(
      (q) => q.status === 'sent' || q.status === 'draft'
    );
    const pendingCount = pendingDecisionList.length;
    const pendingValue = pendingDecisionList.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    const decidedCount = activeQuotations.filter((q) =>
      ['accepted', 'rejected', 'declined', 'expired'].includes(q.status)
    ).length;

    const winRate =
      decidedCount > 0 ? Math.round((acceptedCount / decidedCount) * 100) : 0;

    return {
      totalCount,
      totalPipelineValue,
      acceptedCount,
      acceptedValue,
      pendingCount,
      pendingValue,
      winRate
    };
  }, [quotations]);

  // 3. Filtered & Sorted Quotations
  const filteredQuotations = useMemo(() => {
    return quotations
      .filter((q) => !q.archived)
      .filter((q) => {
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesNum = q.quotationNumber.toLowerCase().includes(query);
          const matchesClient = q.clientName.toLowerCase().includes(query);
          const matchesCompany = (q.clientCompany || '').toLowerCase().includes(query);
          const matchesProject = (q.projectTitle || '').toLowerCase().includes(query);
          const matchesScope = (q.proposalScope || '').toLowerCase().includes(query);
          const matchesItems = (q.items || []).some((item) =>
            item.description.toLowerCase().includes(query)
          );

          if (
            !matchesNum &&
            !matchesClient &&
            !matchesCompany &&
            !matchesProject &&
            !matchesScope &&
            !matchesItems
          ) {
            return false;
          }
        }

        // Status Filter
        if (selectedStatus !== 'all') {
          const normStatus = q.status === 'declined' ? 'rejected' : q.status;
          if (normStatus !== selectedStatus) return false;
        }

        // Client Filter
        if (selectedClientId !== 'all') {
          if (q.clientId !== selectedClientId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.issueDate || b.createdAt).getTime() - new Date(a.issueDate || a.createdAt).getTime();
        }
        if (sortBy === 'validity') {
          return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
        }
        if (sortBy === 'amount_desc') {
          return b.totalAmount - a.totalAmount;
        }
        if (sortBy === 'amount_asc') {
          return a.totalAmount - b.totalAmount;
        }
        if (sortBy === 'number') {
          return b.quotationNumber.localeCompare(a.quotationNumber);
        }
        return 0;
      });
  }, [quotations, searchQuery, selectedStatus, selectedClientId, sortBy]);

  // 4. Pagination Slicing
  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / pageSize));
  const paginatedQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredQuotations.slice(startIndex, startIndex + pageSize);
  }, [filteredQuotations, currentPage, pageSize]);

  // Handlers
  const handleOpenAddModal = () => {
    setSelectedQuotationForEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditQuotation = (quote: CrmQuotation) => {
    setSelectedQuotationForEdit(quote);
    setIsAddModalOpen(true);
    if (selectedQuotationForPreview) {
      setSelectedQuotationForPreview(null);
    }
  };

  const handleDuplicateQuotation = (duplicated: CrmQuotation) => {
    loadQuotations();
    setSelectedQuotationForPreview(duplicated);
  };

  const handleQuotationSaved = (saved: CrmQuotation) => {
    loadQuotations();
    setIsAddModalOpen(false);
    setSelectedQuotationForEdit(null);
    setSelectedQuotationForPreview(saved);
  };

  const handleNavigateToInvoice = (invoiceId: string) => {
    setSelectedQuotationForPreview(null);
    if (onNavigateToModule) {
      onNavigateToModule('invoices');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <CrmLoadingState rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <CrmPageHeader
        title="Quotation & Proposal Management"
        subtitle="Author formal scope estimates, track proposal approvals, generate branded printable PDF quotes, and convert winning proposals into invoices."
        icon={FileText}
        badge="Commercial Hub"
        badgeColor="purple"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7c3aed]' : ''}`} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quotation</span>
            </button>
          </div>
        }
      />

      {/* KPI Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Pipeline Value */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Proposed
            </p>
            <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              ₹{metrics.totalPipelineValue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Across {metrics.totalCount} issued proposals
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Metric 2: Accepted & Won Value */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Accepted Value
            </p>
            <h3 className="text-2xl sm:text-[26px] font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
              ₹{metrics.acceptedValue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {metrics.acceptedCount} winning quote{metrics.acceptedCount === 1 ? '' : 's'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Metric 3: Pending Decision */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Awaiting Decision
            </p>
            <h3 className="text-2xl sm:text-[26px] font-black text-sky-600 dark:text-sky-400 mt-1 tracking-tight">
              ₹{metrics.pendingValue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {metrics.pendingCount} sent / under review
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center shadow-2xs">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Metric 4: Win Rate % */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7c3aed] dark:text-purple-400 uppercase tracking-wider">
              Proposal Win Rate
            </p>
            <h3 className="text-2xl sm:text-[26px] font-black text-[#7c3aed] dark:text-purple-300 mt-1 tracking-tight">
              {metrics.winRate}%
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Commercial conversion ratio
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, and Sorting */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by quote #, client, project, or scope items..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-purple-300 transition"
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

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Declined</option>
              <option value="expired">Expired</option>
            </select>

            {/* Client Filter */}
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="validity">Sort: Expiry Date</option>
              <option value="amount_desc">Sort: Amount (High to Low)</option>
              <option value="amount_asc">Sort: Amount (Low to High)</option>
              <option value="number">Sort: Quote Number</option>
            </select>

            {/* Reset Filters */}
            {(searchQuery || selectedStatus !== 'all' || selectedClientId !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedClientId('all');
                  setCurrentPage(1);
                }}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredQuotations.length === 0 ? (
        <CrmEmptyState
          title="No quotations found"
          description={
            searchQuery || selectedStatus !== 'all' || selectedClientId !== 'all'
              ? 'Try modifying your search or filter criteria to find quotations.'
              : 'Start by creating your first client quotation or project proposal.'
          }
          action={
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quotation</span>
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <QuotationTableView
            quotations={paginatedQuotations}
            onSelectQuotation={(q) => setSelectedQuotationForPreview(q)}
            onEditQuotation={handleEditQuotation}
            onDuplicateQuotation={handleDuplicateQuotation}
            onRefresh={loadQuotations}
            onNavigateToInvoice={handleNavigateToInvoice}
          />

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                Showing{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {Math.min(currentPage * pageSize, filteredQuotations.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {filteredQuotations.length}
                </span>{' '}
                quotations
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg font-semibold transition ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Quotation Modal */}
      <AddQuotationModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedQuotationForEdit(null);
        }}
        onQuotationSaved={handleQuotationSaved}
        initialQuotation={selectedQuotationForEdit}
      />

      {/* Quotation Inspection & Printable Proposal Drawer */}
      <QuotationPreviewDrawer
        quotation={selectedQuotationForPreview}
        isOpen={!!selectedQuotationForPreview}
        onClose={() => setSelectedQuotationForPreview(null)}
        onEditQuotation={handleEditQuotation}
        onDuplicateQuotation={handleDuplicateQuotation}
        onStatusChanged={loadQuotations}
        onNavigateToInvoice={handleNavigateToInvoice}
      />
    </div>
  );
};
