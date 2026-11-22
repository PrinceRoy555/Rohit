import React, { useState, useEffect, useMemo } from 'react';
import {
  CrmInvoice,
  CrmInvoiceStatus,
  CrmClient,
  CrmProject,
  CrmPayment
} from '../../../../types/crm';
import {
  initCrmStorage,
  getStoredInvoices,
  getStoredClients,
  getStoredProjects,
  getStoredPayments,
  subscribeCrmStore,
  getFinancialSummary
} from '../../../../services/crmStorageService';
import { InvoiceTableView } from './InvoiceTableView';
import { AddInvoiceModal } from './AddInvoiceModal';
import { InvoicePreviewDrawer } from './InvoicePreviewDrawer';
import { RecordPaymentModal } from '../payments/RecordPaymentModal';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmLoadingState } from '../../shared/CrmLoadingState';
import { CrmEmptyState } from '../../shared/CrmEmptyState';
import {
  Receipt,
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
  CreditCard,
  FileText,
  Sparkles,
  Download
} from 'lucide-react';

interface InvoicesModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const InvoicesModule: React.FC<InvoicesModuleProps> = ({ onNavigateToModule }) => {
  const [invoices, setInvoices] = useState<CrmInvoice[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedTaxFilter, setSelectedTaxFilter] = useState<'all' | 'gst' | 'non_gst'>('all');
  const [sortBy, setSortBy] = useState<
    'newest' | 'due_date' | 'amount_desc' | 'amount_asc' | 'number'
  >('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<CrmInvoice | null>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<CrmInvoice | null>(null);
  const [invoiceForPayment, setInvoiceForPayment] = useState<CrmInvoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Load master data
  const loadInvoices = async () => {
    try {
      await initCrmStorage();
      setInvoices(getStoredInvoices());
      setClients(getStoredClients());
      setProjects(getStoredProjects());
    } catch (err) {
      console.error('Error loading CRM invoices:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvoices();

    const unsubscribe = subscribeCrmStore(() => {
      setInvoices(getStoredInvoices());
      setClients(getStoredClients());
      setProjects(getStoredProjects());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInvoices();
  };

  // KPIs
  const kpis = useMemo(() => {
    const summary = getFinancialSummary();
    const totalCount = invoices.length;
    const paidCount = invoices.filter((i) => i.status === 'paid').length;
    const partiallyPaidCount = invoices.filter((i) => i.status === 'partially_paid').length;
    const overdueCount = summary.overdueCount;
    const overdueAmount = summary.overdueAmount;

    return {
      totalInvoiced: summary.totalInvoiced,
      totalCollected: summary.totalCollected,
      totalOutstanding: summary.totalOutstanding,
      overdueCount,
      overdueAmount,
      totalCount,
      paidCount,
      partiallyPaidCount
    };
  }, [invoices]);

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    let result = invoices.filter((inv) => !inv.archived);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q) ||
          (inv.clientCompany && inv.clientCompany.toLowerCase().includes(q)) ||
          (inv.projectTitle && inv.projectTitle.toLowerCase().includes(q)) ||
          (inv.quotationNumber && inv.quotationNumber.toLowerCase().includes(q)) ||
          inv.items.some((item) => item.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((inv) => inv.status === selectedStatus);
    }

    // Client filter
    if (selectedClientId !== 'all') {
      result = result.filter((inv) => inv.clientId === selectedClientId);
    }

    // Tax filter
    if (selectedTaxFilter === 'gst') {
      result = result.filter((inv) => inv.isGstEnabled);
    } else if (selectedTaxFilter === 'non_gst') {
      result = result.filter((inv) => !inv.isGstEnabled);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      }
      if (sortBy === 'due_date') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'amount_desc') {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === 'amount_asc') {
        return a.totalAmount - b.totalAmount;
      }
      if (sortBy === 'number') {
        return b.invoiceNumber.localeCompare(a.invoiceNumber);
      }
      return 0;
    });

    return result;
  }, [invoices, searchQuery, selectedStatus, selectedClientId, selectedTaxFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  // Handlers
  const handleOpenAddModal = () => {
    setSelectedInvoiceForEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditInvoice = (inv: CrmInvoice) => {
    setSelectedInvoiceForEdit(inv);
    setIsAddModalOpen(true);
  };

  const handleOpenPaymentModal = (inv: CrmInvoice) => {
    setInvoiceForPayment(inv);
    setIsPaymentModalOpen(true);
  };

  // Export invoices as CSV
  const handleExportCsv = () => {
    if (filteredInvoices.length === 0) return;
    const headers = [
      'Invoice Number',
      'Client Name',
      'Client Company',
      'Status',
      'Issue Date',
      'Due Date',
      'Subtotal (INR)',
      'Tax (INR)',
      'Total Amount (INR)',
      'Paid (INR)',
      'Balance Due (INR)',
      'GST Enabled'
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.clientName.replace(/"/g, '""')}"`,
      `"${(inv.clientCompany || '').replace(/"/g, '""')}"`,
      inv.status,
      inv.issueDate,
      inv.dueDate,
      inv.subtotal,
      inv.taxAmount || 0,
      inv.totalAmount,
      inv.amountPaid || 0,
      inv.balanceDue ?? (inv.totalAmount - (inv.amountPaid || 0)),
      inv.isGstEnabled ? 'YES' : 'NO'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rohitwork_invoices_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CrmPageHeader
          title="Invoices & Billing"
          subtitle="Manage client billings, payment milestones, and formal tax invoices"
        />
        <CrmLoadingState rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header */}
      <CrmPageHeader
        title="Invoices & Receivables"
        subtitle="Commercial billing registry, milestone invoices, and payment tracking"
        icon={Receipt}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs ${
                isRefreshing ? 'animate-spin text-[#7c3aed]' : ''
              }`}
              title="Refresh ledger"
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
              <span>Create Invoice</span>
            </button>
          </div>
        }
      />

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Invoiced */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Invoiced
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              ₹{kpis.totalInvoiced.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across {kpis.totalCount} issued invoices
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
            <Receipt className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 2: Total Collected */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Collected Revenue
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
              ₹{kpis.totalCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
              {kpis.paidCount} fully settled, {kpis.partiallyPaidCount} partial
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 3: Outstanding Receivables */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Outstanding Balance
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
              ₹{kpis.totalOutstanding.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-600/80 font-medium mt-0.5">
              Pending client clearance
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shadow-2xs">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 4: Overdue Invoices */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Overdue Receivables
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-rose-600 dark:text-rose-400 mt-1 tracking-tight">
              ₹{kpis.overdueAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-rose-600/80 font-medium mt-0.5">
              {kpis.overdueCount} {kpis.overdueCount === 1 ? 'invoice' : 'invoices'} past due
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Search, Filters, Sorters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice #, client, scope, or item..."
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

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Client Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tax Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedTaxFilter}
              onChange={(e) => {
                setSelectedTaxFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All Invoices (GST & Non-GST)</option>
              <option value="non_gst">Non-GST Only (Default)</option>
              <option value="gst">GST Registered Only (18%)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="due_date">Sort: Due Date</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="number">Invoice Number</option>
            </select>
          </div>
        </div>

        {/* Active Filters Row */}
        {(searchQuery || selectedStatus !== 'all' || selectedClientId !== 'all' || selectedTaxFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            <span>Filtered results ({filteredInvoices.length} found):</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedClientId('all');
                setSelectedTaxFilter('all');
                setCurrentPage(1);
              }}
              className="text-violet-600 dark:text-violet-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Directory Table */}
      {filteredInvoices.length === 0 ? (
        <CrmEmptyState
          title="No Invoices Found"
          description={
            searchQuery || selectedStatus !== 'all' || selectedClientId !== 'all' || selectedTaxFilter !== 'all'
              ? 'No invoices match your selected search criteria.'
              : 'Create your first branded invoice or convert an accepted quotation to start billing clients.'
          }
          action={
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold"
            >
              Create Invoice
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <InvoiceTableView
            invoices={paginatedInvoices}
            onSelectInvoice={(inv) => setSelectedInvoiceForPreview(inv)}
            onEditInvoice={handleEditInvoice}
            onDuplicateInvoice={() => handleRefresh()}
            onRecordPayment={handleOpenPaymentModal}
            onRefresh={handleRefresh}
            onNavigateToQuotation={(quoteId) => {
              if (onNavigateToModule) onNavigateToModule('quotations');
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
                  {Math.min(currentPage * pageSize, filteredInvoices.length)}
                </span>{' '}
                of <span className="font-bold text-slate-900 dark:text-white">{filteredInvoices.length}</span> invoices
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

      {/* 5. Modals & Drawers */}
      {/* Create / Edit Invoice Modal */}
      <AddInvoiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialInvoice={selectedInvoiceForEdit}
        onInvoiceSaved={(saved) => {
          handleRefresh();
          setSelectedInvoiceForPreview(saved);
        }}
      />

      {/* Branded Printable Preview Drawer */}
      <InvoicePreviewDrawer
        invoice={selectedInvoiceForPreview}
        isOpen={!!selectedInvoiceForPreview}
        onClose={() => setSelectedInvoiceForPreview(null)}
        onEditInvoice={handleEditInvoice}
        onDuplicateInvoice={() => handleRefresh()}
        onRecordPayment={(inv) => handleOpenPaymentModal(inv)}
        onStatusChanged={() => handleRefresh()}
        onNavigateToQuotation={(quoteId) => {
          if (onNavigateToModule) onNavigateToModule('quotations');
        }}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setInvoiceForPayment(null);
        }}
        initialInvoice={invoiceForPayment}
        initialPaymentType="client_payment"
        onPaymentRecorded={() => {
          handleRefresh();
          if (selectedInvoiceForPreview && invoiceForPayment && selectedInvoiceForPreview.id === invoiceForPayment.id) {
            // reload preview drawer with updated data
            const refreshed = getStoredInvoices().find((i) => i.id === selectedInvoiceForPreview.id);
            if (refreshed) setSelectedInvoiceForPreview(refreshed);
          }
        }}
      />
    </div>
  );
};
