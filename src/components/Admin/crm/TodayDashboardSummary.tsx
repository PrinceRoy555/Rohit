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
      color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: newEnquiriesCount > 0 ? 'Action Needed' : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
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
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Today&apos;s CRM Pulse</span>
        </div>
        <span className="text-[11px] text-text-muted">Live sync from Firestore</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSelectMetric(card.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm hover:shadow-md flex flex-col justify-between ${
                card.isAlert
                  ? 'bg-red-500/5 dark:bg-red-500/10 border-red-500/40 hover:border-red-500'
                  : 'bg-bg-card hover:bg-bg-card-hover border-border-color hover:border-rose-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-1">
                  {card.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  )}
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-mono">
                  {card.count}
                </div>
                <div className="text-xs font-bold text-text-primary mt-0.5">{card.label}</div>
                <div className="text-[11px] text-text-muted mt-0.5 truncate">{card.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
