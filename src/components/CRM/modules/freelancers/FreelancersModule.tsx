import React, { useState, useEffect, useMemo } from 'react';
import { CrmFreelancer, CrmFreelancerStatus } from '../../../../types/crm';
import {
  initCrmStorage,
  getStoredFreelancers,
  subscribeCrmStore,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';
import { FreelancerTableView } from './FreelancerTableView';
import { FreelancerCardGrid } from './FreelancerCardGrid';
import { AddFreelancerModal } from './AddFreelancerModal';
import { FreelancerProfileDrawer } from './FreelancerProfileDrawer';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmLoadingState } from '../../shared/CrmLoadingState';
import { CrmEmptyState } from '../../shared/CrmEmptyState';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  RefreshCw,
  PhoneCall,
  DollarSign,
  TrendingDown,
  Sparkles,
  CheckCircle,
  Clock,
  Send,
  X
} from 'lucide-react';

interface FreelancersModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const FreelancersModule: React.FC<FreelancersModuleProps> = ({ onNavigateToModule }) => {
  const [freelancers, setFreelancers] = useState<CrmFreelancer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'balance' | 'rating'>('newest');

  // View Mode: 'table' or 'grid'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultToWhatsApp, setAddModalDefaultToWhatsApp] = useState(false);
  const [selectedFreelancerForProfile, setSelectedFreelancerForProfile] = useState<CrmFreelancer | null>(null);
  const [selectedFreelancerForEdit, setSelectedFreelancerForEdit] = useState<CrmFreelancer | null>(null);

  // 1. Initial Load
  const loadFreelancers = async () => {
    try {
      await initCrmStorage();
      setFreelancers(getStoredFreelancers());
    } catch (err) {
      console.error('Error loading CRM freelancers:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFreelancers();

    // Subscribe to store updates
    const unsubscribe = subscribeCrmStore(() => {
      setFreelancers(getStoredFreelancers());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Computed Metrics
  const metrics = useMemo(() => {
    const total = freelancers.length;
    const available = freelancers.filter((f) => f.status === 'available').length;
    const busy = freelancers.filter((f) => f.status === 'busy').length;
    const inactive = freelancers.filter((f) => f.status === 'inactive').length;
    const totalPayoutsDue = freelancers.reduce(
      (sum, f) => sum + (f.pendingBalance ?? f.paymentPending ?? Math.max(0, (f.agreedAmount || 0) - (f.paidAmount || 0))),
      0
    );
    const totalPaid = freelancers.reduce((sum, f) => sum + (f.paidAmount || f.paymentPaidTotal || 0), 0);

    return {
      total,
      available,
      busy,
      inactive,
      totalPayoutsDue,
      totalPaid
    };
  }, [freelancers]);

  // Extract all unique skills across freelancers
  const allUniqueSkills = useMemo(() => {
    const set = new Set<string>();
    freelancers.forEach((f) => {
      (f.skills || []).forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [freelancers]);

  // 3. Filtered & Sorted Freelancers
  const filteredFreelancers = useMemo(() => {
    return freelancers.filter((f) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesSpecialty = (f.specialty || '').toLowerCase().includes(q);
        const matchesPhone = f.phone.includes(q) || normalizePhoneNumber(f.phone).includes(q);
        const matchesEmail = (f.email || '').toLowerCase().includes(q);
        const matchesSkills = (f.skills || []).some((s) => s.toLowerCase().includes(q));

        if (!matchesName && !matchesSpecialty && !matchesPhone && !matchesEmail && !matchesSkills) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatus !== 'all') {
        if (f.status !== selectedStatus) return false;
      }

      // Skill Filter
      if (selectedSkill !== 'all') {
        if (!(f.skills || []).includes(selectedSkill)) return false;
      }

      return true;
    });
  }, [freelancers, searchQuery, selectedStatus, selectedSkill]);

  const sortedFreelancers = useMemo(() => {
    return [...filteredFreelancers].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'balance') {
        const balA = a.pendingBalance ?? Math.max(0, (a.agreedAmount || 0) - (a.paidAmount || 0));
        const balB = b.pendingBalance ?? Math.max(0, (b.agreedAmount || 0) - (b.paidAmount || 0));
        return balB - balA;
      }
      if (sortBy === 'rating') {
        return (b.rating || 5) - (a.rating || 5);
      }
      // 'newest'
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [filteredFreelancers, sortBy]);

  // 4. Pagination
  const totalPages = Math.ceil(sortedFreelancers.length / pageSize) || 1;
  const paginatedFreelancers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedFreelancers.slice(start, start + pageSize);
  }, [sortedFreelancers, currentPage, pageSize]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFreelancers();
  };

  const handleOpenAddModal = (isWhatsApp = false) => {
    setSelectedFreelancerForEdit(null);
    setAddModalDefaultToWhatsApp(isWhatsApp);
    setIsAddModalOpen(true);
  };

  const handleEditFreelancer = (f: CrmFreelancer) => {
    setSelectedFreelancerForEdit(f);
    setAddModalDefaultToWhatsApp(false);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <CrmPageHeader
        title="Freelancer Hub"
        subtitle="Admin-only subcontractor directory, task assignments, work submission tracking & pending payouts."
        icon={Briefcase}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Add phone-only freelancer via WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Fast Intake</span>
            </button>
            <button
              onClick={() => handleOpenAddModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Freelancer</span>
            </button>
          </div>
        }
      />

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Freelancers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Subcontractors</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
              <Briefcase className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.total}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Admin-managed roster
          </p>
        </div>

        {/* Metric 2: Available Now */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Available Now</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-2xs">
              <CheckCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.available}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Ready for project intake
          </p>
        </div>

        {/* Metric 3: Busy on Projects */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Busy / Assigned</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.busy}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Active deliverable tasks
          </p>
        </div>

        {/* Metric 4: Payouts Due */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[#7c3aed] dark:text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">Payouts Due</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
              <TrendingDown className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            ₹{metrics.totalPayoutsDue.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Total pending balances
          </p>
        </div>
      </div>

      {/* 3. Toolbar: Search, Filters & View Mode */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by freelancer name, specialty, skills, phone..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-purple-300 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="busy">Busy / Assigned</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Skill Filter */}
          <select
            value={selectedSkill}
            onChange={(e) => {
              setSelectedSkill(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Skills</option>
            {allUniqueSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="newest">Newest Added</option>
            <option value="name">Name (A-Z)</option>
            <option value="balance">Highest Balance Due</option>
            <option value="rating">Top Rated</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
            title="Refresh Freelancer Roster"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. Main Content: Table or Grid View */}
      {isLoading ? (
        <CrmLoadingState rows={4} />
      ) : sortedFreelancers.length === 0 ? (
        <CrmEmptyState
          title={searchQuery || selectedStatus !== 'all' || selectedSkill !== 'all' ? 'No matching freelancers found' : 'No freelancers registered yet'}
          description={
            searchQuery || selectedStatus !== 'all' || selectedSkill !== 'all'
              ? 'Try adjusting your search keywords, availability filter, or skill selection.'
              : 'Add your first creative video editor, 3D artist, or UI/UX designer to start assigning tasks and tracking payouts.'
          }
          action={
            <button
              onClick={() => handleOpenAddModal(false)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
            >
              + Add Freelancer Record
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        <FreelancerTableView
          freelancers={paginatedFreelancers}
          onSelectFreelancer={(f) => setSelectedFreelancerForProfile(f)}
          onEditFreelancer={handleEditFreelancer}
          onRefresh={loadFreelancers}
        />
      ) : (
        <FreelancerCardGrid
          freelancers={paginatedFreelancers}
          onSelectFreelancer={(f) => setSelectedFreelancerForProfile(f)}
          onEditFreelancer={handleEditFreelancer}
        />
      )}

      {/* 5. Pagination Bar */}
      {sortedFreelancers.length > pageSize && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedFreelancers.length)} of{' '}
            {sortedFreelancers.length} freelancers
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 6. Add/Edit Freelancer Modal */}
      <AddFreelancerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedFreelancerForEdit(null);
        }}
        onFreelancerSaved={(saved) => {
          loadFreelancers();
          setSelectedFreelancerForProfile(saved);
        }}
        onSelectExistingFreelancer={(existing) => {
          setSelectedFreelancerForProfile(existing);
        }}
        initialFreelancer={selectedFreelancerForEdit}
        defaultToWhatsApp={addModalDefaultToWhatsApp}
      />

      {/* 7. Freelancer Profile Slide-over Drawer */}
      <FreelancerProfileDrawer
        freelancer={selectedFreelancerForProfile}
        isOpen={Boolean(selectedFreelancerForProfile)}
        onClose={() => setSelectedFreelancerForProfile(null)}
        onEditFreelancer={handleEditFreelancer}
        onNavigateToModule={onNavigateToModule}
      />
    </div>
  );
};
