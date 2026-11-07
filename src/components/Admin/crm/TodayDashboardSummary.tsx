import React from 'react';
import { InquiryRecord } from '../../../types/cms';
import { getLeadFollowUpCategory, isLeadHot } from '../../../utils/leadScoring';
import {
  Inbox,
  Clock,
  AlertCircle,
  Flame,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface TodayDashboardSummaryProps {
  leads: InquiryRecord[];
  onSelectMetric: (metric: 'new' | 'followups_today' | 'overdue' | 'hot_leads') => void;
}

export const TodayDashboardSummary: React.FC<TodayDashboardSummaryProps> = ({
  leads,
  onSelectMetric
}) => {
  // 1. Calculate actual numbers
  const newEnquiriesCount = leads.filter((l) => l.status === 'new').length;

  let followUpsTodayCount = 0;
  let overdueCount = 0;

  leads.forEach((l) => {
    if (l.followUpAt) {
      const cat = getLeadFollowUpCategory(l);
      if (cat === 'due_today') followUpsTodayCount++;
      if (cat === 'overdue') overdueCount++;
    }
  });

  const hotLeadsCount = leads.filter((l) => isLeadHot(l).isHot).length;

  const cards = [
    {
      id: 'new' as const,
      label: 'New Enquiries',
      count: newEnquiriesCount,
      subtext: 'Uncontacted leads',
      icon: Inbox,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      badge: newEnquiriesCount > 0 ? 'Action Needed' : undefined,
      badgeColor: 'bg-red-500/20 text-red-500'
    },
    {
      id: 'followups_today' as const,
      label: 'Follow-ups Today',
      count: followUpsTodayCount,
      subtext: 'Scheduled for today',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: followUpsTodayCount > 0 ? 'Due Today' : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
    },
    {
      id: 'overdue' as const,
      label: 'Overdue Follow-ups',
      count: overdueCount,
      subtext: overdueCount > 0 ? 'Urgent attention' : 'All up to date',
      icon: AlertCircle,
      color: overdueCount > 0
        ? 'text-red-600 dark:text-red-400 bg-red-500/15 border-red-500/30'
        : 'text-neutral-500 dark:text-neutral-400 bg-neutral-500/10 border-neutral-500/20',
      badge: overdueCount > 0 ? 'Overdue' : undefined,
      badgeColor: 'bg-red-600 text-white font-bold animate-pulse',
      isAlert: overdueCount > 0
    },
    {
      id: 'hot_leads' as const,
      label: 'Hot Leads',
      count: hotLeadsCount,
      subtext: 'High-value opportunities',
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
      badge: hotLeadsCount > 0 ? 'High Intent' : undefined,
      badgeColor: 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>Today&apos;s CRM Pulse</span>
        </div>
        <span className="text-[11px] text-text-muted">Live sync from Firestore</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSelectMetric(card.id)}
              className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between select-none active:scale-98 ${
                card.isAlert
                  ? 'bg-red-500/5 dark:bg-red-500/10 border-red-500/40 hover:border-red-500'
                  : 'bg-bg-card hover:bg-bg-card-hover border-border-color hover:border-accent-primary/40'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className={`w-8 sm:w-9 h-8 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center border flex-shrink-0 ${card.color}`}>
                  <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>

                <div className="flex items-center gap-1 flex-wrap justify-end">
                  {card.badge && (
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  )}
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 hidden xs:block" />
                </div>
              </div>

              <div className="mt-2.5 sm:mt-3">
                <div className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight tabular-nums">
                  {card.count}
                </div>
                <div className="text-xs font-semibold text-text-primary mt-0.5 truncate">{card.label}</div>
                <div className="text-[10px] sm:text-[11px] text-text-muted mt-0.5 truncate">{card.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
