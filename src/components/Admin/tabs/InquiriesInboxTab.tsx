import React, { useState, useEffect } from 'react';
import { InquiryRecord, InquiryStatus } from '../../../types/cms';
import {
  fetchInquiries,
  updateInquiry,
  updateInquiryCrm,
  deleteInquiry
} from '../../../services/cmsApi';
import {
  calculateLeadScore,
  getLeadScoreCategory,
  getLeadFollowUpCategory,
  isLeadHot,
  formatFollowUpDateTime,
  formatOverdueDuration
} from '../../../utils/leadScoring';
import { LeadDetailDrawer } from '../crm/LeadDetailDrawer';
import { TodaysFollowUps } from '../crm/TodaysFollowUps';
import {
  Inbox,
  Clock,
  Flame,
  Search,
  Download,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  Filter,
  Plus
} from 'lucide-react';

interface InquiriesInboxTabProps {
  initialView?: 'inbox' | 'followups' | 'hot_leads';
  initialFollowUpFilter?: 'today' | 'overdue' | 'upcoming' | 'completed';
  initialStatusFilter?: 'all' | 'new' | 'contacted' | 'closed';
}

export const InquiriesInboxTab: React.FC<InquiriesInboxTabProps> = ({
  initialView = 'inbox',
  initialFollowUpFilter = 'today',
  initialStatusFilter = 'all'
}) => {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainView, setMainView] = useState<'inbox' | 'followups' | 'hot_leads'>(initialView);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'contacted' | 'closed'>(initialStatusFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
  const [hotFilter, setHotFilter] = useState<'all' | 'manual' | 'suggested'>('all');

  const loadData = async () => {
    setLoading(true);
    const res = await fetchInquiries();
    if (res.success && res.inquiries) {
      setInquiries(res.inquiries);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync if initial props change
  useEffect(() => {
    if (initialView) setMainView(initialView);
    if (initialStatusFilter) setFilterStatus(initialStatusFilter);
  }, [initialView, initialStatusFilter]);

  const handleUpdateLeadCrm = async (id: string, updates: Partial<InquiryRecord>) => {
    await updateInquiryCrm(id, updates);
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, ...updates } : inq))
    );
    if (selectedInquiry?.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleMarkFollowUpDone = async (id: string) => {
    await handleUpdateLeadCrm(id, {
      followUpStatus: 'completed',
      lastContactedAt: new Date().toISOString()
    });
  };

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    const res = await updateInquiry(id, { status });
    if (res.success) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    const res = await deleteInquiry(id);
    if (res.success) {
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  const handleExportCsv = () => {
    if (!inquiries.length) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Service', 'Budget', 'Status', 'Follow-up At', 'Priority', 'Is Hot Lead', 'Created At', 'Message'];
    const rows = inquiries.map((inq) => [
      inq.id,
      `"${(inq.name || '').replace(/"/g, '""')}"`,
      `"${(inq.email || '').replace(/"/g, '""')}"`,
      `"${(inq.phone || '').replace(/"/g, '""')}"`,
      `"${(inq.service || '').replace(/"/g, '""')}"`,
      `"${(inq.budgetRange || '').replace(/"/g, '""')}"`,
      inq.status,
      inq.followUpAt || '',
      inq.priority || 'medium',
      inq.isHotLead ? 'YES' : 'NO',
      inq.createdAt,
      `"${(inq.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crm-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Counts for top view tabs
  const followUpCount = inquiries.filter((i) => {
    if (!i.followUpAt) return false;
    const cat = getLeadFollowUpCategory(i);
    return cat === 'due_today' || cat === 'overdue';
  }).length;

  const hotCount = inquiries.filter((i) => isLeadHot(i).isHot).length;

  // Filtered leads for Inbox View
  const inboxFiltered = inquiries.filter((inq) => {
    const matchesStatus = filterStatus === 'all' || inq.status === filterStatus;
    const matchesSearch = !searchQuery || [inq.name, inq.email, inq.service, inq.message, inq.businessName]
      .some(field => field && field.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Filtered leads for Hot Leads View
  const hotLeadsFiltered = inquiries.filter((inq) => {
    const hotInfo = isLeadHot(inq);
    if (!hotInfo.isHot) return false;
    if (hotFilter === 'manual' && !hotInfo.isManual) return false;
    if (hotFilter === 'suggested' && hotInfo.isManual) return false;

    if (searchQuery) {
      return [inq.name, inq.email, inq.service, inq.businessName]
        .some(field => field && field.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  }).sort((a, b) => {
    const scoreA = typeof a.leadScore === 'number' ? a.leadScore : calculateLeadScore(a);
    const scoreB = typeof b.leadScore === 'number' ? b.leadScore : calculateLeadScore(b);
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & View Navigator */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2.5">
              <Inbox className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              <span>Lead Inquiries & CRM Suite</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Live submissions from contact forms, Uni AI assistant, and direct quote requests.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={!inquiries.length}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CRM CSV</span>
          </button>
        </div>

        {/* Navigation Tabs (Sections 36 & 37) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-color">
          <button
            onClick={() => setMainView('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              mainView === 'inbox'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>All Inquiries</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px]">{inquiries.length}</span>
          </button>

          <button
            onClick={() => setMainView('followups')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              mainView === 'followups'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today&apos;s Follow-ups</span>
            {followUpCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-extrabold text-[10px]">
                {followUpCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMainView('hot_leads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              mainView === 'hot_leads'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Hot Leads</span>
            {hotCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {hotCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: TODAY'S FOLLOW-UPS VIEW (Section 36)                              */}
      {/* ========================================================================= */}
      {mainView === 'followups' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <TodaysFollowUps
            leads={inquiries}
            onOpenLead={(lead) => setSelectedInquiry(lead)}
            onMarkComplete={handleMarkFollowUpDone}
            isFullView={true}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: HOT LEADS VIEW (Section 37)                                       */}
      {/* ========================================================================= */}
      {mainView === 'hot_leads' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-bg-card border border-border-color">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-text-muted mr-1">Classification:</span>
              <button
                onClick={() => setHotFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  hotFilter === 'all'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
                }`}
              >
                All Hot Leads ({hotCount})
              </button>
              <button
                onClick={() => setHotFilter('manual')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  hotFilter === 'manual'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
                }`}
              >
                Admin Marked ({inquiries.filter((i) => i.isHotLead === true).length})
              </button>
              <button
                onClick={() => setHotFilter('suggested')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  hotFilter === 'suggested'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
                }`}
              >
                AI Suggested ({inquiries.filter((i) => isLeadHot(i).isHot && !i.isHotLead).length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hot leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-secondary border border-border-color rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Hot Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotLeadsFiltered.length === 0 ? (
              <div className="col-span-full py-12 text-center rounded-2xl bg-bg-card border border-border-color p-6">
                <Flame className="w-10 h-10 text-neutral-400 mx-auto mb-2 opacity-50" />
                <h4 className="text-base font-bold text-text-primary">No hot leads match your filters</h4>
                <p className="text-xs text-text-muted mt-1">
                  You can mark any lead as a Hot Lead inside the Lead Details drawer.
                </p>
              </div>
            ) : (
              hotLeadsFiltered.map((lead) => {
                const hotInfo = isLeadHot(lead);
                const score = hotInfo.score;
                const scoreCategory = getLeadScoreCategory(score);
                const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
                const waPhone = cleanPhone.replace(/^\+/, '');

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedInquiry(lead)}
                    className="p-5 rounded-2xl bg-bg-card hover:bg-bg-card-hover border border-border-color hover:border-rose-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        hotInfo.isManual
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{hotInfo.isManual ? 'HOT' : 'SUGGESTED HOT'}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${scoreCategory.badgeBg}`}>
                        Score {score} • {scoreCategory.label}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-text-primary group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {lead.name}
                      </h4>
                      {lead.businessName && (
                        <div className="text-xs text-text-muted truncate">{lead.businessName}</div>
                      )}
                      <div className="text-xs text-text-secondary font-medium">{lead.service}</div>
                      {lead.budgetRange && (
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {lead.budgetRange}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border-color space-y-2 text-xs">
                      <div className="flex items-center justify-between text-text-muted">
                        <span>Status: <strong className="text-text-primary capitalize">{lead.status}</strong></span>
                        <span className="capitalize">{lead.priority || 'medium'} priority</span>
                      </div>

                      <div className="p-2 rounded-lg bg-bg-secondary border border-border-color text-[11px] text-text-muted">
                        {lead.followUpAt ? (
                          <span className="text-text-primary font-medium">
                            Follow-up: {formatFollowUpDateTime(lead.followUpAt)}
                          </span>
                        ) : (
                          <span className="italic">No follow-up scheduled</span>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div
                      className="flex items-center justify-between gap-2 pt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5">
                        {lead.phone && (
                          <>
                            <a
                              href={`tel:${cleanPhone}`}
                              className="p-2 rounded-lg bg-bg-secondary hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color transition-colors"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/${waPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-bg-secondary hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                        <a
                          href={`mailto:${lead.email}`}
                          className="p-2 rounded-lg bg-bg-secondary hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-border-color transition-colors"
                          title="Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <button
                        onClick={() => setSelectedInquiry(lead)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color transition-colors"
                      >
                        Open Lead
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ALL INQUIRIES VIEW                                                */}
      {/* ========================================================================= */}
      {mainView === 'inbox' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-bg-card border border-border-color shadow-sm">
            <div className="flex flex-wrap gap-2">
              {(['all', 'new', 'contacted', 'closed'] as const).map((status) => {
                const count = status === 'all' ? inquiries.length : inquiries.filter((i) => i.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      filterStatus === status
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
                    }`}
                  >
                    <span className="capitalize">{status}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px]">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads, email, scope..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-secondary border border-border-color rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Inquiries List */}
          {loading ? (
            <div className="p-12 text-center text-text-muted text-sm bg-bg-card rounded-2xl border border-border-color">
              Loading inquiries from Firestore...
            </div>
          ) : inboxFiltered.length === 0 ? (
            <div className="p-12 text-center bg-bg-card border border-border-color rounded-2xl">
              <Inbox className="w-10 h-10 text-neutral-400 mx-auto mb-3 opacity-60" />
              <h4 className="text-base font-bold text-text-primary">No inquiries found</h4>
              <p className="text-xs text-text-muted mt-1">
                Submissions from the public website contact form will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inboxFiltered.map((inq) => {
                const isNew = inq.status === 'new';
                const hotInfo = isLeadHot(inq);
                const followUpCategory = getLeadFollowUpCategory(inq);
                const isOverdue = followUpCategory === 'overdue';
                const cleanPhone = (inq.phone || '').replace(/[^0-9+]/g, '');
                const waPhone = cleanPhone.replace(/^\+/, '');

                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                      isNew
                        ? 'bg-bg-card border-rose-500/40 hover:border-rose-500 shadow-sm'
                        : 'bg-bg-card hover:bg-bg-card-hover border-border-color hover:border-rose-500/30'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                          {inq.name}
                        </h4>

                        {inq.businessName && (
                          <span className="text-xs text-text-muted hidden sm:inline truncate">
                            • {inq.businessName}
                          </span>
                        )}

                        {isNew && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                            NEW
                          </span>
                        )}

                        {hotInfo.isHot && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            <Flame className="w-2.5 h-2.5 fill-current" />
                            <span>HOT</span>
                          </span>
                        )}

                        {inq.followUpAt && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            isOverdue
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold'
                              : 'bg-bg-secondary text-text-muted border border-border-color'
                          }`}>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatFollowUpDateTime(inq.followUpAt)}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{inq.email}</span>
                        </span>
                        {inq.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{inq.phone}</span>
                          </span>
                        )}
                        <span className="text-text-primary font-medium">{inq.service}</span>
                        {inq.budgetRange && (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {inq.budgetRange}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-text-muted line-clamp-1 mt-1 max-w-2xl">
                        {inq.message || inq.nextAction || 'No message provided.'}
                      </p>
                    </div>

                    {/* Actions on row */}
                    <div
                      className="flex items-center gap-2 self-end md:self-center flex-wrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {inq.phone && (
                        <>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="p-2 rounded-xl bg-bg-secondary hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-bg-secondary hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}

                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryStatus)}
                        className="bg-bg-secondary border border-border-color rounded-xl px-2.5 py-1.5 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
                      >
                        <option value="new">Mark New</option>
                        <option value="contacted">Mark Contacted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Mark Closed</option>
                      </select>

                      <button
                        onClick={() => handleDelete(inq.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FULL CRM LEAD DETAIL DRAWER (Section 28, 29, 32) */}
      {selectedInquiry && (
        <LeadDetailDrawer
          lead={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onUpdateLead={handleUpdateLeadCrm}
          onDeleteLead={handleDelete}
        />
      )}
    </div>
  );
};
