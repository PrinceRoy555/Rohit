import React from 'react';
import { InquiryRecord } from '../../../types/cms';
import {
  calculateLeadScore,
  getLeadScoreCategory,
  isLeadHot,
  formatFollowUpDateTime
} from '../../../utils/leadScoring';
import {
  Flame,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  DollarSign,
  Briefcase,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface HotLeadsSectionProps {
  leads: InquiryRecord[];
  onOpenLead: (lead: InquiryRecord) => void;
  onViewAll?: () => void;
}

export const HotLeadsSection: React.FC<HotLeadsSectionProps> = ({
  leads,
  onOpenLead,
  onViewAll
}) => {
  // Filter for leads that are manually marked hot OR calculated score >= 70
  const evaluatedLeads = leads.map((lead) => {
    const score = typeof lead.leadScore === 'number' ? lead.leadScore : calculateLeadScore(lead);
    const hotInfo = isLeadHot(lead);
    return {
      lead,
      score,
      isHot: hotInfo.isHot,
      isManual: hotInfo.isManual
    };
  });

  // Hot leads sorted by score descending, max 6 for dashboard display
  const hotLeads = evaluatedLeads
    .filter((item) => item.isHot)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <div className="bg-bg-card border border-border-color rounded-2xl p-5 sm:p-6 shadow-sm text-text-primary transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-color">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 fill-current" />
              <span>Hot Leads</span>
            </h3>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              {hotLeads.length} High Priority
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Highest-intent leads based on verified budgets, advanced progress, or admin designation.
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors self-start sm:self-auto py-1"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Leads Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotLeads.length === 0 ? (
          <div className="col-span-full py-10 text-center rounded-xl bg-bg-secondary border border-border-color p-6">
            <Sparkles className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-70" />
            <h4 className="text-sm font-bold text-text-primary">No active hot leads</h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              Leads with high budgets or marked by admin as Hot will appear here automatically.
            </p>
          </div>
        ) : (
          hotLeads.map(({ lead, score, isManual }) => {
            const category = getLeadScoreCategory(score);
            const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
            const waPhone = cleanPhone.replace(/^\+/, '');

            return (
              <div
                key={lead.id}
                onClick={() => onOpenLead(lead)}
                className="p-5 rounded-2xl bg-bg-secondary hover:bg-bg-card-hover border border-border-color hover:border-rose-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md"
              >
                {/* Top Badge Strip */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isManual
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{isManual ? 'HOT' : 'SUGGESTED HOT'}</span>
                  </span>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${category.badgeBg}`}>
                    Score {score}
                  </span>
                </div>

                {/* Client & Service */}
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-text-primary group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                    {lead.name}
                  </h4>

                  {lead.businessName && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted truncate">
                      <Building className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{lead.businessName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                    <Briefcase className="w-3 h-3 text-text-muted flex-shrink-0" />
                    <span className="truncate">{lead.service}</span>
                  </div>

                  {lead.budgetRange && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3 h-3 flex-shrink-0" />
                      <span>{lead.budgetRange}</span>
                    </div>
                  )}
                </div>

                {/* Status & Next Follow-up info */}
                <div className="pt-3 border-t border-border-color space-y-2 text-xs">
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Status: <strong className="text-text-primary capitalize">{lead.status}</strong></span>
                    <span className="capitalize">{lead.priority || 'Medium'} priority</span>
                  </div>

                  <div className="p-2 rounded-lg bg-bg-card border border-border-color text-[11px] text-text-muted">
                    {lead.followUpAt ? (
                      <span className="flex items-center gap-1 text-text-secondary">
                        <Calendar className="w-3 h-3 text-rose-500" />
                        <span>Follow-up: <strong>{formatFollowUpDateTime(lead.followUpAt)}</strong></span>
                      </span>
                    ) : (
                      <span className="italic">No follow-up scheduled</span>
                    )}
                  </div>
                </div>

                {/* Bottom Quick Actions */}
                <div
                  className="flex items-center justify-between gap-2 pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5">
                    {lead.phone && (
                      <>
                        <a
                          href={`tel:${cleanPhone}`}
                          className="p-2 rounded-lg bg-bg-card hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color transition-colors"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hi ${lead.name}, regarding your project inquiry:`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-bg-card hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-border-color transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}

                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(`Project Inquiry: ${lead.service}`)}`}
                      className="p-2 rounded-lg bg-bg-card hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-border-color transition-colors"
                      title="Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    onClick={() => onOpenLead(lead)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-bg-card hover:bg-bg-card-hover text-text-primary border border-border-color transition-colors"
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
  );
};
