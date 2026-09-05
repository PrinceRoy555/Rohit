import React, { useState, useRef, useEffect } from 'react';
import { InquiryRecord } from '../../../types/cms';
import { getLeadFollowUpCategory } from '../../../utils/leadScoring';
import {
  Bell,
  Inbox,
  Clock,
  AlertCircle,
  X,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface CrmNotificationsPopoverProps {
  leads: InquiryRecord[];
  onNavigateToInquiries: (filterTab?: string) => void;
  onOpenLead?: (lead: InquiryRecord) => void;
}

export const CrmNotificationsPopover: React.FC<CrmNotificationsPopoverProps> = ({
  leads,
  onNavigateToInquiries,
  onOpenLead
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compute notification metrics
  const newEnquiries = leads.filter((l) => l.status === 'new');
  const overdueFollowUps = leads.filter((l) => l.followUpAt && getLeadFollowUpCategory(l) === 'overdue');
  const todayFollowUps = leads.filter((l) => l.followUpAt && getLeadFollowUpCategory(l) === 'due_today');

  const totalActionCount = newEnquiries.length + overdueFollowUps.length + todayFollowUps.length;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-bg-secondary hover:bg-bg-card-hover border border-border-color text-text-muted hover:text-text-primary transition-colors"
        title="CRM Notifications"
        aria-label="CRM Notifications"
      >
        <Bell className="w-4 h-4" />
        {totalActionCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse shadow-sm">
            {totalActionCount > 9 ? '9+' : totalActionCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-bg-card border border-border-color shadow-2xl z-50 text-text-primary p-4 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-border-color">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Today&apos;s CRM Activity
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {/* Overdue Follow-ups item */}
            {overdueFollowUps.length > 0 && (
              <div
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToInquiries('followups_overdue');
                }}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-rose-600 dark:text-rose-400">
                      {overdueFollowUps.length} follow-up{overdueFollowUps.length > 1 ? 's' : ''} overdue
                    </div>
                    <div className="text-[11px] text-text-muted">Immediate action required</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            )}

            {/* Follow-ups Due Today item */}
            {todayFollowUps.length > 0 && (
              <div
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToInquiries('followups_today');
                }}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-600 dark:text-amber-400">
                      {todayFollowUps.length} follow-up{todayFollowUps.length > 1 ? 's' : ''} due today
                    </div>
                    <div className="text-[11px] text-text-muted">Client check-ins scheduled</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            )}

            {/* New Enquiries item */}
            {newEnquiries.length > 0 && (
              <div
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToInquiries('new');
                }}
                className="p-3 rounded-xl bg-bg-secondary hover:bg-bg-card-hover border border-border-color cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">
                      {newEnquiries.length} new contact inquir{newEnquiries.length > 1 ? 'ies' : 'y'}
                    </div>
                    <div className="text-[11px] text-text-muted">Awaiting initial review</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            )}

            {totalActionCount === 0 && (
              <div className="py-6 text-center text-text-muted space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <div className="font-bold text-text-primary text-xs">All caught up!</div>
                <div className="text-[11px]">No urgent follow-ups or pending inquiries today.</div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border-color text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateToInquiries();
              }}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Open Lead Inquiries & CRM →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
