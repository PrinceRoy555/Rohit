import React, { useState, useEffect, useMemo } from 'react';
import { CrmClient, CrmClientStatus } from '../../../../types/crm';
import {
  initCrmStorage,
  getStoredClients,
  subscribeCrmStore,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';
import { ClientTableView } from './ClientTableView';
import { ClientCardGrid } from './ClientCardGrid';
import { AddClientModal } from './AddClientModal';
import { ClientProfileDrawer } from './ClientProfileDrawer';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmLoadingState } from '../../shared/CrmLoadingState';
import { CrmEmptyState } from '../../shared/CrmEmptyState';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  RefreshCw,
  PhoneCall,
  DollarSign,
  Building,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';

interface ClientsModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const ClientsModule: React.FC<ClientsModuleProps> = ({ onNavigateToModule }) => {
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'billed' | 'projects'>('newest');

  // View Mode: 'table' or 'grid'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultToWhatsApp, setAddModalDefaultToWhatsApp] = useState(false);
  const [selectedClientForProfile, setSelectedClientForProfile] = useState<CrmClient | null>(null);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<CrmClient | null>(null);

  // 1. Initial Load
  const loadClients = async () => {
    try {
      await initCrmStorage();
      setClients(getStoredClients());
    } catch (err) {
      console.error('Error loading CRM clients:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();

    const unsubscribe = subscribeCrmStore(() => {
      setClients(getStoredClients());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadClients();
  };

  // 2. Computed KPIs
  const metrics = useMemo(() => {
    const realClients = clients.filter((c) => !c.isDemo);
    const demoClients = clients.filter((c) => c.isDemo);
    const total = realClients.length;
    const active = realClients.filter((c) => c.status === 'active').length;
    const inactive = realClients.filter((c) => c.status === 'inactive' || c.status === 'archived').length;
    const totalBilledSum = realClients.reduce((sum, c) => sum + (c.totalBilled || 0), 0);

    return { total, active, inactive, totalBilledSum, demoCount: demoClients.length };
  }, [clients]);

  // Available tags across clients
  const allTags = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      (c.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [clients]);

  // 3. Filtered & Sorted Clients
  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryDigits = normalizePhoneNumber(query);

    return clients.filter((client) => {
      // Search Match
      if (query) {
        const clientDigits = normalizePhoneNumber(client.phone);
        const nameMatch = client.name?.toLowerCase().includes(query);
        const phoneMatch = queryDigits && clientDigits.includes(queryDigits);
        const emailMatch = client.email?.toLowerCase().includes(query);
        const companyMatch = client.company?.toLowerCase().includes(query);
        const notesMatch = client.notes?.toLowerCase().includes(query);
        const addressMatch = client.address?.toLowerCase().includes(query);
        const tagMatch = client.tags?.some((t) => t.toLowerCase().includes(query));

        if (
          !nameMatch &&
          !phoneMatch &&
          !emailMatch &&
          !companyMatch &&
          !notesMatch &&
          !addressMatch &&
          !tagMatch
        ) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatus !== 'all') {
        if (client.status !== selectedStatus) return false;
      }

      // Tag Filter
      if (selectedTag !== 'all') {
        if (!client.tags?.includes(selectedTag)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'billed') {
        return (b.totalBilled || 0) - (a.totalBilled || 0);
      }
      if (sortBy === 'projects') {
        return (b.totalProjects || 0) - (a.totalProjects || 0);
      }
      return 0;
    });
  }, [clients, searchQuery, selectedStatus, selectedTag, sortBy]);

  // 4. Pagination
  const paginatedClients = useMemo(() => {
    if (viewMode === 'grid') return filteredClients;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredClients.slice(startIndex, startIndex + pageSize);
  }, [filteredClients, currentPage, pageSize, viewMode]);

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedTag]);

  const hasActiveFilters =
    searchQuery !== '' || selectedStatus !== 'all' || selectedTag !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedTag('all');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <CrmPageHeader
        title="Client Management"
        subtitle="Manage agency client profiles, communication records, active project deliverables & billing history."
        icon={UserCheck}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh clients list"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7c3aed]' : ''}`} />
            </button>

            <button
              onClick={() => {
                setSelectedClientForEdit(null);
                setAddModalDefaultToWhatsApp(true);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition cursor-pointer active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+ WhatsApp Client</span>
            </button>

            <button
              onClick={() => {
                setSelectedClientForEdit(null);
                setAddModalDefaultToWhatsApp(false);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Clients
            </span>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {metrics.total}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center font-bold shadow-2xs">
            <UserCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Active Accounts
            </span>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {metrics.active}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center font-bold shadow-2xs">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Inactive / On-Hold
            </span>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {metrics.inactive}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center font-bold shadow-2xs">
            <Building className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#7c3aed] dark:text-purple-400">
              Total Invoiced
            </span>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              ₹{metrics.totalBilledSum.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center font-bold shadow-2xs">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Demo Status Banner */}
      {metrics.demoCount > 0 && metrics.total === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>
            Displaying {metrics.demoCount} local sample demo clients. Verified Cloud Firestore has 0 live clients. Create a client to persist directly to production Firestore.
          </span>
        </div>
      )}

      {/* Control Bar: Search, Filter, View Mode */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, phone, email, tags..."
              className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-purple-300 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Count & View Mode Toggle */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredClients.length}</strong> of{' '}
              {clients.length} clients
            </span>

            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-[#7c3aed] dark:text-purple-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Cards Grid View"
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-[#7c3aed] dark:text-purple-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </span>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="archived">Archived Only</option>
            </select>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="py-1 px-2 text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="newest">Recently Added</option>
              <option value="name">Client Name (A-Z)</option>
              <option value="billed">Highest Billed</option>
              <option value="projects">Most Projects</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <CrmLoadingState rows={4} />
      ) : clients.length === 0 ? (
        <CrmEmptyState
          title="No Clients Registered Yet"
          description="Your client directory is currently empty. Convert an inquiry from Lead Management or manually add a WhatsApp client."
          action={
            <button
              onClick={() => {
                setSelectedClientForEdit(null);
                setAddModalDefaultToWhatsApp(false);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
            >
              + Add First Client
            </button>
          }
        />
      ) : filteredClients.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No clients match your selected filters.
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Try adjusting your search query, status, or tag filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <ClientCardGrid
          clients={filteredClients}
          onSelectClient={(c) => setSelectedClientForProfile(c)}
          onEditClient={(c) => {
            setSelectedClientForEdit(c);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          <ClientTableView
            clients={paginatedClients}
            onSelectClient={(c) => setSelectedClientForProfile(c)}
            onEditClient={(c) => {
              setSelectedClientForEdit(c);
              setIsAddModalOpen(true);
            }}
            onRefresh={loadClients}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedClientForEdit(null);
        }}
        initialClient={selectedClientForEdit}
        defaultToWhatsApp={addModalDefaultToWhatsApp}
        onClientSaved={(c) => {
          loadClients();
          setSelectedClientForProfile(c);
        }}
        onSelectExistingClient={(c) => {
          setSelectedClientForProfile(c);
        }}
      />

      {/* Client Profile Slide-over Drawer */}
      <ClientProfileDrawer
        client={selectedClientForProfile}
        isOpen={Boolean(selectedClientForProfile)}
        onClose={() => setSelectedClientForProfile(null)}
        onEditClient={(c) => {
          setSelectedClientForProfile(null);
          setSelectedClientForEdit(c);
          setIsAddModalOpen(true);
        }}
        onNavigateToModule={onNavigateToModule}
      />
    </div>
  );
};
