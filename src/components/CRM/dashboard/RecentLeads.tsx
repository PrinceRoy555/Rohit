import React from 'react';
import { CrmLead } from '../../../types/crm';
import { Mail, Phone, ExternalLink, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { WHATSAPP_BUSINESS_URL } from '../../../data';

interface RecentLeadsProps {
  leads: CrmLead[];
  onViewAllLeads: () => void;
  onOpenLeadDetail?: (lead: CrmLead) => void;
}

export const RecentLeads: React.FC<RecentLeadsProps> = ({
  leads,
  onViewAllLeads,
  onOpenLeadDetail
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            New
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Contacted
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            In Progress
          </span>
        );
      case 'completed':
      case 'closed':
        return (
          <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recent Inquiries & Leads
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deduplicated stream from contact forms, quote requests & AI chat
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAllLeads}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
        >
          <span>View Pipeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">
          No inquiries found in Firestore collections.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-5 sm:px-0">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th scope="col" className="pb-3 pr-4">Prospect</th>
                  <th scope="col" className="pb-3 px-4">Service</th>
                  <th scope="col" className="pb-3 px-4">Status</th>
                  <th scope="col" className="pb-3 px-4">Date</th>
                  <th scope="col" className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Prospect Info */}
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-[200px]">
                        {lead.name || 'Anonymous Visitor'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 truncate max-w-[160px] sm:max-w-[200px]">
                        {lead.email && <span className="truncate">{lead.email}</span>}
                        {lead.phone && <span>• {lead.phone}</span>}
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-200">
                      <span className="truncate max-w-[150px] block">
                        {lead.service || 'General Inquiry'}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {lead.source?.replace(/[-_]/g, ' ') || 'Website'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                            title="Message on WhatsApp"
                            aria-label={`Message ${lead.name} on WhatsApp`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Send Email"
                            aria-label={`Send email to ${lead.name}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {onOpenLeadDetail && (
                          <button
                            type="button"
                            onClick={() => onOpenLeadDetail(lead)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                            title="View Full Inquiry Brief"
                            aria-label="View Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
