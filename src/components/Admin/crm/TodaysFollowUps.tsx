import React, { useState } from 'react';
import { InquiryRecord, LeadPriority } from '../../../types/cms';
import {
  formatFollowUpDateTime,
  formatOverdueDuration,
  getLeadFollowUpCategory
} from '../../../utils/leadScoring';
import {
  Clock,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ExternalLink,
  Flame,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface TodaysFollowUpsProps {
  leads: InquiryRecord[];
  onOpenLead: (lead: InquiryRecord) => void;
  onMarkComplete: (leadId: string) => Promise<void>;
  onViewAll?: () => void;
  isFullView?: boolean;
}

export const TodaysFollowUps: React.FC<TodaysFollowUpsProps> = ({
  leads,
  onOpenLead,
  onMarkComplete,
  onViewAll,
  isFullView = false
}) => {
  const [activeFilter, setActiveFilter] = useState<'today' | 'overdue' | 'upcoming' | 'completed'>('today');
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Classify all leads with scheduled follow-ups
  const categorized = leads
    .filter((lead) => Boolean(lead.followUpAt))
    .map((lead) => ({
      lead,
      category: getLeadFollowUpCategory(lead)
    }));

  const overdueLeads = categorized.filter((c) => c.category === 'overdue').map((c) => c.lead);
  const todayLeads = categorized.filter((c) => c.category === 'due_today').map((c) => c.lead);
  const upcomingLeads = categorized.filter((c) => c.category === 'upcoming').map((c) => c.lead);
  const completedLeads = categorized.filter((c) => c.category === 'completed').map((c) => c.lead);

  // Primary list for dashboard view: overdue first, then today
  const dashboardDisplayLeads = isFullView
    ? (activeFilter === 'overdue'
        ? overdueLeads
        : activeFilter === 'today'
        ? todayLeads
        : activeFilter === 'upcoming'
        ? upcomingLeads
        : completedLeads)
    : [...overdueLeads, ...todayLeads].slice(0, 6);

  const totalDueCount = overdueLeads.length + todayLeads.length;

  const handleDone = async (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation();
    setCompletingId(leadId);
    await onMarkComplete(leadId);
    setCompletingId(null);
  };

  return (
    <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-border-color">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-xl font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-accent-primary" />
              <span>Today&apos;s Follow-ups</span>
            </h3>

            {overdueLeads.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>{overdueLeads.length} Overdue</span>
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-bg-secondary text-text-muted border border-border-color">
              {todayLeads.length} Due Today
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted">
            Prioritized leads needing client check-in, revised quotes, or call follow-ups.
          </p>
        </div>

        {onViewAll && !isFullView && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-accent-primary hover:text-accent-secondary transition-colors self-start sm:self-auto py-1 min-h-[36px]"
          >
            <span>View All ({leads.filter((l) => Boolean(l.followUpAt)).length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs (Enabled for full view mode) */}
      {isFullView && (
        <div className="flex gap-2 overflow-x-auto pb-1.5 my-3.5 no-scrollbar">
          <button
            onClick={() => setActiveFilter('today')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeFilter === 'today'
                ? 'bg-accent-primary text-white shadow-xs'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <span>Due Today</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/20 text-[10px]">{todayLeads.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('overdue')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeFilter === 'overdue'
                ? 'bg-accent-primary text-white shadow-xs'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <span>Overdue</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/20 text-[10px]">{overdueLeads.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeFilter === 'upcoming'
                ? 'bg-accent-primary text-white shadow-xs'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <span>Upcoming</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/20 text-[10px]">{upcomingLeads.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeFilter === 'completed'
                ? 'bg-accent-primary text-white shadow-xs'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/20 text-[10px]">{completedLeads.length}</span>
          </button>
        </div>
      )}

      {/* Follow-ups List */}
      <div className="mt-3.5 space-y-3">
        {dashboardDisplayLeads.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-bg-secondary border border-border-color p-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-text-primary">No follow-ups due today</h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              You are completely caught up! Schedule next actions from the Lead Inbox to see them here.
            </p>
          </div>
        ) : (
          dashboardDisplayLeads.map((lead) => {
            const category = getLeadFollowUpCategory(lead);
            const isOverdue = category === 'overdue';
            const isCompleted = category === 'completed';
            const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
            const waPhone = cleanPhone.replace(/^\+/, '');

            return (
              <div
                key={lead.id}
                onClick={() => onOpenLead(lead)}
                className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 ${
                  isOverdue
                    ? 'bg-red-500/5 dark:bg-red-500/10 border-red-500/30 hover:border-red-500/50 shadow-xs'
                    : isCompleted
                    ? 'bg-bg-secondary border-border-color opacity-75'
                    : 'bg-bg-secondary hover:bg-bg-card-hover border-border-color hover:border-accent-primary/30'
                }`}
              >
                {/* Left: Client & Action details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
                    {/* Time Badge */}
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold tabular-nums ${
                      isOverdue
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                        : 'bg-bg-card text-text-primary border border-border-color'
                    }`}>
                      {lead.followUpAt ? formatFollowUpDateTime(lead.followUpAt) : 'Scheduled'}
                    </span>

                    <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-accent-primary transition-colors">
                      {lead.name}
                    </h4>

                    {lead.businessName && (
                      <span className="text-xs text-text-muted hidden sm:inline truncate">
                        • {lead.businessName}
                      </span>
                    )}

                    {lead.isHotLead && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        <span>HOT</span>
                      </span>
                    )}

                    {/* Priority Badge */}
                    {lead.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        High
                      </span>
                    )}

                    {/* Overdue Badge */}
                    {isOverdue && lead.followUpAt && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white">
                        {formatOverdueDuration(lead.followUpAt)}
                      </span>
                    )}
                  </div>

                  {/* Service & Contact info */}
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-muted">
                    <span className="text-text-secondary font-medium">{lead.service}</span>
                    <span className="capitalize px-1.5 py-0.2 rounded bg-bg-card border border-border-color text-[10px]">
                      {lead.status}
                    </span>
                    {lead.email && <span className="truncate text-text-muted/80">{lead.email}</span>}
                  </div>

                  {/* Next Action */}
                  <div className="mt-1 flex items-start gap-1.5 text-xs">
                    <span className="font-semibold text-text-secondary flex-shrink-0">Next Action:</span>
                    <span className="text-text-primary font-medium italic truncate">
                      {lead.nextAction || 'Contact client to follow up on inquiry'}
                    </span>
                  </div>
                </div>

                {/* Right: Quick Actions - Full width row on mobile */}
                <div
                  className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t border-border-color/50 md:border-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5">
                    {lead.phone && (
                      <>
                        <a
                          href={`tel:${cleanPhone}`}
                          className="w-9 h-9 rounded-xl bg-bg-card hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color hover:border-emerald-500/30 transition-colors flex items-center justify-center active:scale-95"
                          title={`Call ${lead.phone}`}
                          aria-label="Call Client"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hi ${lead.name}, checking in regarding your inquiry for ${lead.service}:`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-bg-card hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color hover:border-emerald-500/30 transition-colors flex items-center justify-center active:scale-95"
                          title="Chat on WhatsApp"
                          aria-label="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </>
                    )}

                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(`Follow-up: ${lead.service}`)}`}
                      className="w-9 h-9 rounded-xl bg-bg-card hover:bg-accent-primary/10 text-accent-primary border border-border-color hover:border-accent-primary/30 transition-colors flex items-center justify-center active:scale-95"
                      title={`Email ${lead.email}`}
                      aria-label="Email Client"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenLead(lead)}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold bg-bg-card hover:bg-bg-card-hover text-text-primary border border-border-color transition-colors active:scale-95"
                    >
                      Open Lead
                    </button>

                    {!isCompleted && (
                      <button
                        onClick={(e) => handleDone(e, lead.id)}
                        disabled={completingId === lead.id}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                        title="Mark follow-up completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{completingId === lead.id ? 'Saving...' : 'Done'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
