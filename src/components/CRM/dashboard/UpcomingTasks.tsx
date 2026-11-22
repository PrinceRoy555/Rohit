import React from 'react';
import { CrmLead } from '../../../types/crm';
import { Calendar, AlertCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface UpcomingTasksProps {
  followUps: CrmLead[];
  onNavigateToLeads: () => void;
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({
  followUps,
  onNavigateToLeads
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Priority Follow-Ups
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Urgent client communications & hot prospects
            </p>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {followUps.length} Pending
          </span>
        </div>

        {followUps.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              No overdue follow-ups!
            </p>
            <p className="text-[11px] mt-1">All incoming leads are currently up to date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {followUps.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name || 'Anonymous Lead'}
                    </span>
                    {item.priority === 'high' && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        High
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.service || 'Service Consultation'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 shrink-0 mt-0.5">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>Awaiting Action</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/60">
        <button
          type="button"
          onClick={onNavigateToLeads}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
        >
          <span>Open Full Lead Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
