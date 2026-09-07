import React, { useState, useMemo } from 'react';
import { InquiryRecord, InquiryStatus } from '../../../types/cms';
import {
  calculateLeadScore,
  getLeadScoreCategory,
  getLeadFollowUpCategory,
  isLeadHot,
  formatFollowUpDateTime,
  formatOverdueDuration,
} from '../../../utils/leadScoring';
import {
  Search,
  Download,
  Phone,
  MessageCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Flame,
  Clock,
  Inbox,
  Filter,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

interface InquiriesDataTableProps {
  inquiries: InquiryRecord[];
  loading: boolean;
  onSelectLead: (lead: InquiryRecord) => void;
  onUpdateStatus: (id: string, status: InquiryStatus) => void;
  onDeleteLead: (id: string) => void;
  onExportCsv: () => void;
  initialFilterStatus?: 'all' | 'new' | 'contacted' | 'closed';
}

export const InquiriesDataTable: React.FC<InquiriesDataTableProps> = ({
  inquiries,
  loading,
  onSelectLead,
  onUpdateStatus,
  onDeleteLead,
  onExportCsv,
  initialFilterStatus = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>(
    initialFilterStatus
  );
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [onlyHot, setOnlyHot] = useState(false);
  const [sortField, setSortField] = useState<'createdAt' | 'name' | 'score'>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter inquiries
  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      // Status filter
      if (statusFilter !== 'all' && inq.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && (inq.priority || 'medium') !== priorityFilter)
        return false;

      // Hot filter
      if (onlyHot && !isLeadHot(inq).isHot) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = [
          inq.name,
          inq.email,
          inq.phone,
          inq.service,
          inq.businessName,
          inq.message,
        ].some((f) => f && f.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [inquiries, statusFilter, priorityFilter, onlyHot, searchQuery]);

  // Sort inquiries
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortField === 'name') {
        const res = (a.name || '').localeCompare(b.name || '');
        return sortAsc ? res : -res;
      }
      if (sortField === 'score') {
        const scoreA = typeof a.leadScore === 'number' ? a.leadScore : calculateLeadScore(a);
        const scoreB = typeof b.leadScore === 'number' ? b.leadScore : calculateLeadScore(b);
        return sortAsc ? scoreA - scoreB : scoreB - scoreA;
      }
      // default createdAt
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [filtered, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pagedItems = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: 'createdAt' | 'name' | 'score') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const statusCounts = useMemo(() => {
    return {
      all: inquiries.length,
      new: inquiries.filter((i) => i.status === 'new').length,
      contacted: inquiries.filter((i) => i.status === 'contacted').length,
      closed: inquiries.filter((i) => i.status === 'closed').length,
    };
  }, [inquiries]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* =================================================================== */}
      {/* 1. TABLE TOOLBAR (Search, Filters, Export)                         */}
      {/* =================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-border-color bg-bg-card shadow-xs">
        {/* Status Filter Tabs (Pill style) */}
        <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 pb-1 md:pb-0 select-none">
          {(['all', 'new', 'contacted', 'closed'] as const).map((st) => {
            const active = statusFilter === st;
            const count = statusCounts[st];
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`flex-shrink-0 min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'bg-bg-secondary hover:bg-bg-card-hover text-text-muted hover:text-text-primary border border-border-color'
                }`}
              >
                <span className="capitalize">{st}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    active
                      ? 'bg-white/20 dark:bg-black/20 text-current'
                      : 'bg-bg-card text-text-muted border border-border-color/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Hot Lead Toggle Filter */}
          <button
            type="button"
            onClick={() => {
              setOnlyHot(!onlyHot);
              setCurrentPage(1);
            }}
            className={`flex-shrink-0 min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              onlyHot
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-bg-secondary hover:bg-bg-card-hover text-text-muted hover:text-text-primary border-border-color'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${onlyHot ? 'fill-current' : ''}`} />
            <span>Hot Only</span>
          </button>
        </div>

        {/* Search input and Export action */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 bg-bg-secondary border border-border-color rounded-lg pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onExportCsv}
            disabled={!inquiries.length}
            className="h-9 px-3 rounded-lg text-xs font-medium bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-text-muted" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. DATA TABLE                                                      */}
      {/* =================================================================== */}
      <div className="rounded-xl border border-border-color bg-bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-color bg-bg-secondary/40 text-text-muted uppercase text-[10px] font-bold tracking-wider select-none">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Lead / Client</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3">Service & Budget</th>
                <th className="py-3 px-3">Status</th>
                <th
                  onClick={() => handleSort('score')}
                  className="py-3 px-3 cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority & Score</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3">Follow-up Due</th>
                <th
                  onClick={() => handleSort('createdAt')}
                  className="py-3 px-3 cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-color/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-text-muted/50" />
                      <span className="font-semibold text-text-primary text-sm">
                        No inquiries found
                      </span>
                      <span className="text-xs text-text-muted max-w-sm">
                        {searchQuery || statusFilter !== 'all' || onlyHot
                          ? 'Try clearing your search or status filter to see all records.'
                          : 'Public inquiries submitted through the contact form will appear here automatically.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedItems.map((inq) => {
                  const hotInfo = isLeadHot(inq);
                  const followUpCat = getLeadFollowUpCategory(inq);
                  const isOverdue = followUpCat === 'overdue';
                  const isDueToday = followUpCat === 'due_today';
                  const score = typeof inq.leadScore === 'number' ? inq.leadScore : calculateLeadScore(inq);
                  const scoreCat = getLeadScoreCategory(score);

                  const cleanPhone = (inq.phone || '').replace(/[^0-9+]/g, '');
                  const waPhone = cleanPhone.replace(/^\+/, '');

                  return (
                    <tr
                      key={inq.id}
                      onClick={() => onSelectLead(inq)}
                      className="hover:bg-bg-secondary/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Lead / Client info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-color text-text-primary font-bold flex items-center justify-center text-xs shrink-0 select-none">
                            {(inq.name || 'L').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-text-primary group-hover:text-accent-primary transition-colors truncate">
                                {inq.name}
                              </span>
                              {hotInfo.isHot && (
                                <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 fill-current shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-text-muted truncate">
                              {inq.businessName ? `${inq.businessName} • ` : ''}
                              {inq.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Service & Budget */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-text-primary truncate max-w-[150px]">
                          {inq.service || 'General Inquiry'}
                        </div>
                        {inq.budgetRange ? (
                          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {inq.budgetRange}
                          </div>
                        ) : (
                          <div className="text-[11px] text-text-muted italic">No budget specified</div>
                        )}
                      </td>

                      {/* 3. Status Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            inq.status === 'new'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : inq.status === 'contacted'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                              : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inq.status === 'new'
                                ? 'bg-rose-500'
                                : inq.status === 'contacted'
                                ? 'bg-indigo-500'
                                : 'bg-neutral-400'
                            }`}
                          />
                          <span className="capitalize">{inq.status}</span>
                        </span>
                      </td>

                      {/* 4. Priority & Score */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold border tabular-nums ${scoreCat.badgeBg}`}
                          >
                            Score {score}
                          </span>
                          <span className="capitalize text-[11px] text-text-muted">
                            {inq.priority || 'medium'}
                          </span>
                        </div>
                      </td>

                      {/* 5. Follow-up Due */}
                      <td className="py-3 px-3">
                        {inq.followUpAt ? (
                          <div
                            className={`flex items-center gap-1 text-[11px] font-medium tabular-nums ${
                              isOverdue
                                ? 'text-red-600 dark:text-red-400 font-semibold'
                                : isDueToday
                                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                : 'text-text-muted'
                            }`}
                          >
                            {isOverdue && <AlertCircle className="w-3 h-3 shrink-0" />}
                            {isDueToday && <Clock className="w-3 h-3 shrink-0" />}
                            <span>{formatFollowUpDateTime(inq.followUpAt)}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-text-muted/60 italic">—</span>
                        )}
                      </td>

                      {/* 6. Created Date */}
                      <td className="py-3 px-3 text-text-muted text-[11px] tabular-nums whitespace-nowrap">
                        {inq.createdAt
                          ? new Date(inq.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* 7. Action Icons */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {inq.phone && (
                            <>
                              <a
                                href={`tel:${cleanPhone}`}
                                title="Call Client"
                                className="w-7 h-7 rounded-md bg-bg-secondary hover:bg-emerald-500/10 text-text-muted hover:text-emerald-600 flex items-center justify-center transition-colors border border-border-color"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <a
                                href={`https://wa.me/${waPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                                className="w-7 h-7 rounded-md bg-bg-secondary hover:bg-emerald-500/10 text-text-muted hover:text-emerald-600 flex items-center justify-center transition-colors border border-border-color"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </>
                          )}
                          <a
                            href={`mailto:${inq.email}`}
                            title="Email Client"
                            className="w-7 h-7 rounded-md bg-bg-secondary hover:bg-accent-primary/10 text-text-muted hover:text-accent-primary flex items-center justify-center transition-colors border border-border-color"
                          >
                            <Mail className="w-3 h-3" />
                          </a>

                          <button
                            type="button"
                            onClick={() => onDeleteLead(inq.id)}
                            title="Delete Inquiry"
                            className="w-7 h-7 rounded-md bg-bg-secondary hover:bg-red-500/10 text-text-muted hover:text-red-600 flex items-center justify-center transition-colors border border-border-color"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================================== */}
        {/* 3. TABLE PAGINATION FOOTER                                         */}
        {/* =================================================================== */}
        <div className="px-4 py-3 border-t border-border-color bg-bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted select-none">
          <div className="tabular-nums">
            Showing <strong className="text-text-primary">{sorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-text-primary">{Math.min(currentPage * pageSize, sorted.length)}</strong> of{' '}
            <strong className="text-text-primary">{sorted.length}</strong> inquiries
          </div>

          <div className="flex items-center gap-2">
            <span className="tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-md border border-border-color bg-bg-secondary hover:bg-bg-card text-text-primary flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="w-7 h-7 rounded-md border border-border-color bg-bg-secondary hover:bg-bg-card text-text-primary flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
