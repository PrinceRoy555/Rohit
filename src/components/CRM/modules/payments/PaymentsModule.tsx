import React, { useState, useEffect, useMemo } from 'react';
import {
  CrmPayment,
  CrmPaymentType,
  CrmPaymentMethod,
  CrmPaymentStatus,
  CrmClient,
  CrmFreelancer
} from '../../../../types/crm';
import {
  initCrmStorage,
  getStoredPayments,
  getStoredClients,
  getStoredFreelancers,
  subscribeCrmStore,
  getFinancialSummary
} from '../../../../services/crmStorageService';
import { PaymentTableView } from './PaymentTableView';
import { RecordPaymentModal } from './RecordPaymentModal';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmLoadingState } from '../../shared/CrmLoadingState';
import { CrmEmptyState } from '../../shared/CrmEmptyState';
import {
  CreditCard,
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
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Download,
  Building,
  UserCheck
} from 'lucide-react';

interface PaymentsModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const PaymentsModule: React.FC<PaymentsModuleProps> = ({ onNavigateToModule }) => {
  const [payments, setPayments] = useState<CrmPayment[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [freelancers, setFreelancers] = useState<CrmFreelancer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'client_payment' | 'freelancer_payout'>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'amount_desc' | 'amount_asc'>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [defaultPaymentType, setDefaultPaymentType] = useState<CrmPaymentType>('client_payment');

  const loadPayments = async () => {
    try {
      await initCrmStorage();
      setPayments(getStoredPayments());
      setClients(getStoredClients());
      setFreelancers(getStoredFreelancers());
    } catch (err) {
      console.error('Error loading CRM payments:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayments();

    const unsubscribe = subscribeCrmStore(() => {
      setPayments(getStoredPayments());
      setClients(getStoredClients());
      setFreelancers(getStoredFreelancers());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPayments();
  };

  // KPIs
  const kpis = useMemo(() => {
    const summary = getFinancialSummary();
    const clientPayments = payments.filter((p) => p.paymentType === 'client_payment' && p.status === 'completed');
    const flPayouts = payments.filter((p) => p.paymentType === 'freelancer_payout' && p.status === 'completed');

    return {
      totalCollected: summary.totalCollected,
      totalFreelancerPayouts: summary.totalFreelancerPayouts,
      netCashflow: summary.netCashflow,
      transactionCount: payments.length,
      clientCount: clientPayments.length,
      payoutCount: flPayouts.length
    };
  }, [payments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
          (p.clientName && p.clientName.toLowerCase().includes(q)) ||
          (p.freelancerName && p.freelancerName.toLowerCase().includes(q)) ||
          (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q)) ||
          (p.projectTitle && p.projectTitle.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter((p) => p.paymentType === selectedType);
    }

    // Method filter
    if (selectedMethod !== 'all') {
      result = result.filter((p) => p.paymentMethod === selectedMethod);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
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
  }, [payments, searchQuery, selectedType, selectedMethod, selectedStatus, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  // CSV Export
  const handleExportCsv = () => {
    if (filteredPayments.length === 0) return;
    const headers = [
      'Transaction Ref',
      'Type',
      'Party Name',
      'Invoice Number',
      'Project Title',
      'Amount (INR)',
      'Method',
      'Payment Date',
      'Status',
      'Notes'
    ];

    const rows = filteredPayments.map((p) => [
      `"${p.transactionRef || ''}"`,
      p.paymentType,
      `"${(p.clientName || p.freelancerName || '').replace(/"/g, '""')}"`,
      p.invoiceNumber || '',
      `"${(p.projectTitle || '').replace(/"/g, '""')}"`,
      p.amount,
      p.paymentMethod,
      p.paymentDate,
      p.status,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rohitwork_payments_ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CrmPageHeader
          title="Payment Ledger"
          subtitle="Track verified client remittances and subcontractor payouts"
        />
        <CrmLoadingState rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header */}
      <CrmPageHeader
        title="Payment Management & Ledger"
        subtitle="Centralized transaction history, client collections, and verified freelancer payouts"
        icon={IndianRupee}
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
              onClick={() => {
                setDefaultPaymentType('client_payment');
                setIsRecordModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
          </div>
        }
      />

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Collected Inflows */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Client Collections
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
              +₹{kpis.totalCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {kpis.clientCount} cleared client remittances
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-2xs">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 2: Freelancer Payouts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Freelancer Payouts
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-[#7c3aed] dark:text-purple-400 mt-1 tracking-tight">
              -₹{kpis.totalFreelancerPayouts.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {kpis.payoutCount} subcontractor disbursements
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
            <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 3: Net Cashflow */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Net Agency Cashflow
            </div>
            <div className={`text-2xl sm:text-[26px] font-black mt-1 tracking-tight ${kpis.netCashflow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              ₹{kpis.netCashflow.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Revenue minus all costs
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 4: Total Transactions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Recorded Entries
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {kpis.transactionCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Reconciled across bank accounts
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shadow-2xs">
            <CreditCard className="w-5 h-5 stroke-[2.2]" />
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
              placeholder="Search by UTR ref, party name, invoice #, project..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          {/* Type Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Transactions (Inflows & Outflows)</option>
              <option value="client_payment">Client Collections (+ Inflows)</option>
              <option value="freelancer_payout">Freelancer Disbursements (- Outflows)</option>
            </select>
          </div>

          {/* Method Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI / QR Code</option>
              <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
              <option value="stripe">Stripe / Card</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-1">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="newest">Sort: Date (Newest)</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Row */}
        {(searchQuery || selectedType !== 'all' || selectedMethod !== 'all' || selectedStatus !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            <span>Filtered results ({filteredPayments.length} found):</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedMethod('all');
                setSelectedStatus('all');
                setCurrentPage(1);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Table */}
      {filteredPayments.length === 0 ? (
        <CrmEmptyState
          title="No Transactions Found"
          description={
            searchQuery || selectedType !== 'all' || selectedMethod !== 'all' || selectedStatus !== 'all'
              ? 'No payments match your search criteria.'
              : 'Record client incoming payments or freelancer payouts to maintain an audit-proof ledger.'
          }
          action={
            <button
              onClick={() => {
                setDefaultPaymentType('client_payment');
                setIsRecordModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Record Transaction
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <PaymentTableView
            payments={paginatedPayments}
            onRefresh={handleRefresh}
            onNavigateToInvoice={(invId) => {
              if (onNavigateToModule) onNavigateToModule('invoices');
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
                  {Math.min(currentPage * pageSize, filteredPayments.length)}
                </span>{' '}
                of <span className="font-bold text-slate-900 dark:text-white">{filteredPayments.length}</span> transactions
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
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        initialPaymentType={defaultPaymentType}
        onPaymentRecorded={() => handleRefresh()}
      />
    </div>
  );
};
