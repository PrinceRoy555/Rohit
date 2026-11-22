import React, { useState, useEffect, useMemo } from 'react';
import { CrmLead, LeadPipelineStage } from '../../../../types/crm';
import {
  initCrmStorage,
  getStoredLeads,
  subscribeCrmStore,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';
import { LeadTableView } from './LeadTableView';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { AddLeadModal } from './AddLeadModal';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmLoadingState } from '../../shared/CrmLoadingState';
import { CrmEmptyState } from '../../shared/CrmEmptyState';
import {
  Users,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  RefreshCw,
  Sparkles,
  PhoneCall,
  Calendar,
  CheckCircle2,
  TrendingUp,
  X
} from 'lucide-react';

interface LeadsModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const LeadsModule: React.FC<LeadsModuleProps> = ({ onNavigateToModule }) => {
  // Store & Leads State
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'name'>('newest');

  // View Mode: 'table' or 'kanban'
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Pagination State (for Table View)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultToWhatsApp, setAddModalDefaultToWhatsApp] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<CrmLead | null>(null);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<CrmLead | null>(null);

  // 1. Initial Load & Hydration
  const loadLeads = async () => {
    try {
      await initCrmStorage();
      setLeads(getStoredLeads());
    } catch (err) {
      console.error('Error loading CRM leads:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeads();

    // Subscribe to reactive updates from CRM storage
    const unsubscribe = subscribeCrmStore(() => {
      setLeads(getStoredLeads());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeads();
  };

  // 2. Computed KPI Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(
      (l) => (l.pipelineStage || l.status) === 'new'
    ).length;
    const followUpCount = leads.filter(
      (l) => Boolean(l.followUpAt) || (l.pipelineStage || l.status) === 'follow_up'
    ).length;
    const wonCount = leads.filter(
      (l) => (l.pipelineStage || l.status) === 'won' || l.status === 'completed'
    ).length;

    return { total, newCount, followUpCount, wonCount };
  }, [leads]);

  // 3. Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryDigits = normalizePhoneNumber(query);

    return leads.filter((lead) => {
      // Search Match
      if (query) {
        const leadDigits = normalizePhoneNumber(lead.phone);
        const nameMatch = lead.name?.toLowerCase().includes(query);
        const phoneMatch = queryDigits && leadDigits.includes(queryDigits);
        const emailMatch = lead.email?.toLowerCase().includes(query);
        const serviceMatch = lead.service?.toLowerCase().includes(query);
        const companyMatch =
          lead.company?.toLowerCase().includes(query) ||
          lead.businessName?.toLowerCase().includes(query);
        const notesMatch = lead.notes?.toLowerCase().includes(query);
        const messageMatch = lead.message?.toLowerCase().includes(query);

        if (
          !nameMatch &&
          !phoneMatch &&
          !emailMatch &&
          !serviceMatch &&
          !companyMatch &&
          !notesMatch &&
          !messageMatch
        ) {
          return false;
        }
      }

      // Status Match
      if (selectedStatus !== 'all') {
        const stage = lead.pipelineStage || lead.status;
        if (stage !== selectedStatus) return false;
      }

      // Priority Match
      if (selectedPriority !== 'all') {
        if (lead.priority !== selectedPriority) return false;
      }

      // Source Match
      if (selectedSource !== 'all') {
        const src = lead.source || 'website-contact-form';
        if (src !== selectedSource) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority || 'medium'] || 0) - (pOrder[a.priority || 'medium'] || 0);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });
  }, [leads, searchQuery, selectedStatus, selectedPriority, selectedSource, sortBy]);

  // 4. Paginated Leads (for Table View)
  const paginatedLeads = useMemo(() => {
    if (viewMode === 'kanban') return filteredLeads;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, currentPage, pageSize, viewMode]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;

  // Reset pagination when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedPriority, selectedSource]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    selectedSource !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedSource('all');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <CrmPageHeader
        title="Lead Management"
        subtitle="Track inquiries from Website, WhatsApp & direct outreach. Triage, follow up, and convert to clients."
        icon={Users}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh leads from Firestore"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7c3aed]' : ''}`} />
            </button>

            <button
              onClick={() => {
                setSelectedLeadForEdit(null);
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
                setSelectedLeadForEdit(null);
                setAddModalDefaultToWhatsApp(false);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>
        }
      />

      {/* KPI Stat Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Inquiries
            </span>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {metrics.total}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center font-bold shadow-2xs">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              New Inquiries
            </span>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {metrics.newCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center font-bold shadow-2xs">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Follow-ups Due
            </span>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {metrics.followUpCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center font-bold shadow-2xs">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Won / Converted
            </span>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {metrics.wonCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center font-bold shadow-2xs">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Mode Toggle */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, email, service..."
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

          {/* View Mode Toggle & Results Count */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredLeads.length}</strong> of{' '}
              {leads.length} leads
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
                onClick={() => setViewMode('kanban')}
                title="Kanban Pipeline View"
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'kanban'
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
              <option value="new">New Inquiries</option>
              <option value="contacted">Contacted</option>
              <option value="follow_up">Follow-up Due</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won / Converted</option>
              <option value="lost">Lost / Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Sources</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="website-contact-form">Website Contact</option>
              <option value="ai_chat">AI Chatbot</option>
              <option value="phone_call">Phone Call</option>
              <option value="referral">Referral</option>
              <option value="instagram">Instagram</option>
            </select>

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
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <CrmLoadingState rows={4} />
      ) : leads.length === 0 ? (
        <CrmEmptyState
          title="No Leads Found"
          description="You haven't received any inquiries yet. Add a manual WhatsApp client to start tracking."
          action={
            <button
              onClick={() => {
                setSelectedLeadForEdit(null);
                setAddModalDefaultToWhatsApp(false);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
            >
              + Add First Lead
            </button>
          }
        />
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No leads match your selected filters.
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Try adjusting your search query, priority, or status filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        <LeadKanbanBoard
          leads={filteredLeads}
          onSelectLead={(lead) => setSelectedLeadForDetail(lead)}
          onRefresh={loadLeads}
        />
      ) : (
        <div className="space-y-4">
          <LeadTableView
            leads={paginatedLeads}
            onSelectLead={(lead) => setSelectedLeadForDetail(lead)}
            onEditLead={(lead) => {
              setSelectedLeadForEdit(lead);
              setIsAddModalOpen(true);
            }}
            onRefresh={loadLeads}
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

      {/* Add / Edit Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedLeadForEdit(null);
        }}
        initialLead={selectedLeadForEdit}
        defaultToWhatsApp={addModalDefaultToWhatsApp}
        onLeadAdded={(lead) => {
          loadLeads();
          setSelectedLeadForDetail(lead);
        }}
        onSelectExistingLead={(existingLead) => {
          setSelectedLeadForDetail(existingLead);
        }}
      />

      {/* Lead Detail Slide-over Drawer */}
      <LeadDetailDrawer
        lead={selectedLeadForDetail}
        isOpen={Boolean(selectedLeadForDetail)}
        onClose={() => setSelectedLeadForDetail(null)}
        onEditLead={(lead) => {
          setSelectedLeadForDetail(null);
          setSelectedLeadForEdit(lead);
          setIsAddModalOpen(true);
        }}
        onNavigateToClients={() => {
          setSelectedLeadForDetail(null);
          if (onNavigateToModule) onNavigateToModule('clients');
        }}
      />
    </div>
  );
};
