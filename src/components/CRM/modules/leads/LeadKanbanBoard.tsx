import React from 'react';
import { CrmLead, LeadPipelineStage } from '../../../../types/crm';
import { updateLeadPipelineStage, normalizePhoneNumber } from '../../../../services/crmStorageService';
import { LeadStatusBadge, getStatusMeta } from './LeadStatusBadge';
import {
  MessageSquare,
  Building,
  Calendar,
  Clock,
  Phone,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

interface LeadKanbanBoardProps {
  leads: CrmLead[];
  onSelectLead: (lead: CrmLead) => void;
  onRefresh?: () => void;
}

const STAGES: { id: LeadPipelineStage; label: string; dot: string; border: string; bg: string }[] = [
  { id: 'new', label: 'New Inquiries', dot: 'bg-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
  { id: 'contacted', label: 'Contacted', dot: 'bg-indigo-500', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5' },
  { id: 'follow_up', label: 'Follow-up Due', dot: 'bg-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
  { id: 'qualified', label: 'Qualified', dot: 'bg-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
  { id: 'won', label: 'Won / Converted', dot: 'bg-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
  { id: 'lost', label: 'Lost / Closed', dot: 'bg-rose-500', border: 'border-rose-500/20', bg: 'bg-rose-500/5' }
];

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({
  leads,
  onSelectLead,
  onRefresh
}) => {
  const handleMoveStage = (leadId: string, currentStage: LeadPipelineStage, direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation();
    const stageIds = STAGES.map((s) => s.id);
    const currentIndex = stageIds.indexOf(currentStage);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < stageIds.length) {
      updateLeadPipelineStage(leadId, stageIds[nextIndex]);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1200px] items-start">
        {STAGES.map((col, colIdx) => {
          const colLeads = leads.filter(
            (l) => (l.pipelineStage || l.status || 'new') === col.id
          );

          return (
            <div
              key={col.id}
              className="flex-1 min-w-[280px] max-w-[320px] rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                    {col.label}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {colLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {colLeads.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl">
                    <p className="text-xs text-slate-400">No leads in this stage</p>
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const cleanPhone = normalizePhoneNumber(lead.phone);
                    const waUrl = cleanPhone
                      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                          `Hi ${lead.name}, Rohit here from RohitWork.`
                        )}`
                      : null;

                    return (
                      <div
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        className="group p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-indigo-500/50 dark:hover:border-indigo-500/50 cursor-pointer transition relative"
                      >
                        {/* Top: Name & Priority */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">
                            {lead.name}
                          </h4>
                          {lead.priority && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                lead.priority === 'urgent'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  : lead.priority === 'high'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {lead.priority}
                            </span>
                          )}
                        </div>

                        {/* Company / Brand */}
                        {(lead.company || lead.businessName) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                            <Building className="w-3 h-3" />
                            <span className="truncate">{lead.company || lead.businessName}</span>
                          </p>
                        )}

                        {/* Service & Budget Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium truncate max-w-[170px]">
                            {lead.service || 'Creative Project'}
                          </span>
                          {(lead.budget || lead.budgetRange) && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold">
                              {lead.budget || lead.budgetRange}
                            </span>
                          )}
                        </div>

                        {/* Follow-up / Source info */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                          <span className="capitalize">
                            {(lead.source || 'website').replace(/[-_]/g, ' ')}
                          </span>

                          {lead.followUpAt ? (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(lead.followUpAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </span>
                          ) : (
                            <span>
                              {lead.createdAt
                                ? new Date(lead.createdAt).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : ''}
                            </span>
                          )}
                        </div>

                        {/* Card Hover Actions: Move left / Move right / WhatsApp */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {colIdx > 0 && (
                              <button
                                type="button"
                                title="Move to previous stage"
                                onClick={(e) => handleMoveStage(lead.id, col.id, 'prev', e)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {colIdx < STAGES.length - 1 && (
                              <button
                                type="button"
                                title="Move to next stage"
                                onClick={(e) => handleMoveStage(lead.id, col.id, 'next', e)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Chat on WhatsApp"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold transition"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
