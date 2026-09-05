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
    <div className="bg-bg-card border border-border-color rounded-2xl p-5 sm:p-6 shadow-sm text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-color">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Today&apos;s Follow-ups</span>
            </h3>

            {overdueLeads.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>{overdueLeads.length} Overdue</span>
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-secondary text-text-muted border border-border-color">
              {todayLeads.length} Due Today
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Prioritized leads needing client check-in, revised quotes, or call follow-ups.
          </p>
        </div>

        {onViewAll && !isFullView && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors self-start sm:self-auto py-1"
          >
            <span>View All ({leads.filter((l) => Boolean(l.followUpAt)).length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs (Enabled for full view mode) */}
      {isFullView && (
        <div className="flex flex-wrap gap-2 my-4">
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'today'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <span>Due Today</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px]">{todayLeads.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('overdue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <span>Overdue</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px]">{overdueLeads.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'upcoming'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <span>Upcoming</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px]">{upcomingLeads.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'completed'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-color'
            }`}
          >
            <span>Completed</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px]">{completedLeads.length}</span>
          </button>
        </div>
      )}

      {/* Follow-ups List */}
      <div className="mt-4 space-y-3">
        {dashboardDisplayLeads.length === 0 ? (
          <div className="py-10 text-center rounded-xl bg-bg-secondary border border-border-color p-6">
            <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
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
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50 shadow-xs'
                    : isCompleted
                    ? 'bg-bg-secondary border-border-color opacity-75'
                    : 'bg-bg-secondary hover:bg-bg-card-hover border-border-color hover:border-rose-500/30'
                }`}
              >
                {/* Left: Client & Action details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Time Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                        isOverdue
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-bg-card text-text-primary border border-border-color'
                      }`}>
                        {lead.followUpAt ? formatFollowUpDateTime(lead.followUpAt) : 'Scheduled'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {lead.name}
                    </h4>

                    {lead.businessName && (
                      <span className="text-xs text-text-muted hidden sm:inline truncate">
                        • {lead.businessName}
                      </span>
                    )}

                    {lead.isHotLead && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        <span>HOT</span>
                      </span>
                    )}

                    {/* Priority Badge */}
                    {lead.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                        High Priority
                      </span>
                    )}
                    {lead.priority === 'low' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-bg-card text-text-muted border border-border-color">
                        Low
                      </span>
                    )}

                    {/* Overdue Badge */}
                    {isOverdue && lead.followUpAt && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white">
                        {formatOverdueDuration(lead.followUpAt)}
                      </span>
                    )}
                  </div>

                  {/* Service & Contact info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                    <span className="text-text-secondary font-medium">{lead.service}</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-bg-card border border-border-color text-[11px]">
                      {lead.status}
                    </span>
                    {lead.email && <span className="truncate">{lead.email}</span>}
                  </div>

                  {/* Next Action */}
                  <div className="mt-1 flex items-start gap-1.5 text-xs">
                    <span className="font-semibold text-text-secondary flex-shrink-0">Next Action:</span>
                    <span className="text-text-primary font-medium italic">
                      {lead.nextAction || 'Contact client to follow up on inquiry'}
                    </span>
                  </div>
                </div>

                {/* Right: Quick Actions */}
                <div
                  className="flex items-center gap-2 flex-wrap self-end md:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {lead.phone && (
                    <>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="p-2 rounded-xl bg-bg-card hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color hover:border-emerald-500/30 transition-colors"
                        title={`Call ${lead.phone}`}
                        aria-label="Call Client"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hi ${lead.name}, checking in regarding your inquiry for ${lead.service}:`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-bg-card hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color hover:border-emerald-500/30 transition-colors"
                        title="Chat on WhatsApp"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}

                  <a
                    href={`mailto:${lead.email}?subject=${encodeURIComponent(`Follow-up: ${lead.service}`)}`}
                    className="p-2 rounded-xl bg-bg-card hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-border-color hover:border-rose-500/30 transition-colors"
                    title={`Email ${lead.email}`}
                    aria-label="Email Client"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onOpenLead(lead)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-bg-card hover:bg-bg-card-hover text-text-primary border border-border-color transition-colors"
                  >
                    Open Lead
                  </button>

                  {!isCompleted && (
                    <button
                      onClick={(e) => handleDone(e, lead.id)}
                      disabled={completingId === lead.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                      title="Mark follow-up completed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{completingId === lead.id ? 'Saving...' : 'Done'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
