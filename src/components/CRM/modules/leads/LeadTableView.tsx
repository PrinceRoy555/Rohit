import React from 'react';
import { CrmLead, LeadPipelineStage } from '../../../../types/crm';
import { LeadStatusBadge } from './LeadStatusBadge';
import {
  updateLeadPipelineStage,
  normalizePhoneNumber,
  convertLeadToClient
} from '../../../../services/crmStorageService';
import {
  Phone,
  Mail,
  Building,
  Calendar,
  MessageSquare,
  ExternalLink,
  UserCheck,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

interface LeadTableViewProps {
  leads: CrmLead[];
  onSelectLead: (lead: CrmLead) => void;
  onEditLead?: (lead: CrmLead) => void;
  onRefresh?: () => void;
}

export const LeadTableView: React.FC<LeadTableViewProps> = ({
  leads,
  onSelectLead,
  onEditLead,
  onRefresh
}) => {
  const handleQuickStatus = (leadId: string, stage: LeadPipelineStage, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    updateLeadPipelineStage(leadId, e.target.value as LeadPipelineStage);
    if (onRefresh) onRefresh();
  };

  const handleQuickConvert = (lead: CrmLead, e: React.MouseEvent) => {
    e.stopPropagation();
    convertLeadToClient(lead);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4">Lead / Contact</th>
            <th className="py-3.5 px-4">Service & Budget</th>
            <th className="py-3.5 px-4">Status & Pipeline</th>
            <th className="py-3.5 px-4">Priority & Source</th>
            <th className="py-3.5 px-4">Follow-up</th>
            <th className="py-3.5 px-4">Received</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {leads.map((lead) => {
            const cleanPhone = normalizePhoneNumber(lead.phone);
            const waUrl = cleanPhone
              ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                  `Hi ${lead.name}, Rohit here from RohitWork.`
                )}`
              : null;

            const isFollowUpDue = lead.followUpAt
              ? new Date(lead.followUpAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000
              : false;

            return (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition group"
              >
                {/* 1. Lead / Contact */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {lead.name}
                  </div>
                  {(lead.company || lead.businessName) && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3" />
                      <span>{lead.company || lead.businessName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {lead.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {lead.phone}
                      </span>
                    )}
                    {lead.email ? (
                      <span className="flex items-center gap-1 truncate max-w-[130px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {lead.email}
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                        Phone Only
                      </span>
                    )}
                  </div>
                </td>

                {/* 2. Service & Budget */}
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {lead.service || 'Creative Project'}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {lead.budget || lead.budgetRange || 'Flexible'}
                  </div>
                </td>

                {/* 3. Status & Pipeline */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <LeadStatusBadge status={lead.pipelineStage || lead.status} />
                    <select
                      value={lead.pipelineStage || lead.status || 'new'}
                      onChange={(e) => handleQuickStatus(lead.id, lead.pipelineStage || 'new', e)}
                      className="text-[11px] py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="follow_up">Follow-up</option>
                      <option value="qualified">Qualified</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                </td>

                {/* 4. Priority & Source */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        lead.priority === 'urgent'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : lead.priority === 'high'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {lead.priority || 'medium'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                      {(lead.source || 'website').replace(/[-_]/g, ' ')}
                    </span>
                  </div>
                </td>

                {/* 5. Follow-up */}
                <td className="py-3.5 px-4">
                  {lead.followUpAt ? (
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium ${
                        isFollowUpDue
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(lead.followUpAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">—</span>
                  )}
                </td>

                {/* 6. Received Date */}
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                  {lead.createdAt
                    ? new Date(lead.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </td>

                {/* 7. Actions */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Direct WhatsApp */}
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    {/* Quick Convert */}
                    {!lead.convertedClientId && lead.pipelineStage !== 'won' && (
                      <button
                        type="button"
                        onClick={(e) => handleQuickConvert(lead, e)}
                        title="Convert to Client"
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}

                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => onSelectLead(lead)}
                      title="View Details"
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
