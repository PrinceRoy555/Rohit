import React from 'react';
import { CrmFreelancer, CrmFreelancerStatus } from '../../../../types/crm';
import { FreelancerStatusBadge } from './FreelancerStatusBadge';
import { saveStoredFreelancer, normalizePhoneNumber } from '../../../../services/crmStorageService';
import {
  Phone,
  Mail,
  Briefcase,
  Globe,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Edit,
  Send,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FreelancerTableViewProps {
  freelancers: CrmFreelancer[];
  onSelectFreelancer: (freelancer: CrmFreelancer) => void;
  onEditFreelancer?: (freelancer: CrmFreelancer) => void;
  onRefresh?: () => void;
}

export const FreelancerTableView: React.FC<FreelancerTableViewProps> = ({
  freelancers,
  onSelectFreelancer,
  onEditFreelancer,
  onRefresh
}) => {
  const handleQuickStatus = (
    freelancerId: string,
    current: CrmFreelancer,
    newStatus: CrmFreelancerStatus,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.stopPropagation();
    saveStoredFreelancer({
      id: freelancerId,
      name: current.name,
      phone: current.phone,
      status: e.target.value as CrmFreelancerStatus
    });
    if (onRefresh) onRefresh();
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4">Freelancer / Specialty</th>
            <th className="py-3.5 px-4">Skills & Tools</th>
            <th className="py-3.5 px-4">Availability</th>
            <th className="py-3.5 px-4">Tasks & Projects</th>
            <th className="py-3.5 px-4">Payouts & Balances</th>
            <th className="py-3.5 px-4">Direct Contact</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {freelancers.map((f) => {
            const cleanPhone = normalizePhoneNumber(f.phone);
            const waUrl = cleanPhone
              ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                  `Hi ${f.name}, reaching out from Rohitwork regarding active project assignments.`
                )}`
              : '#';

            const agreed = f.agreedAmount || 0;
            const paid = f.paidAmount || 0;
            const pending = f.pendingBalance ?? Math.max(0, agreed - paid);

            return (
              <tr
                key={f.id}
                onClick={() => onSelectFreelancer(f)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* 1. Name & Specialty */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
                      {f.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <span>{f.name}</span>
                        {f.portfolioUrl && (
                          <a
                            href={f.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Open Portfolio"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>{f.specialty || 'Creative Specialist'}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Skills Tags */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {(f.skills || []).slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {(f.skills || []).length > 2 && (
                      <span className="text-[10px] text-slate-400 font-medium px-1">
                        +{f.skills.length - 2} more
                      </span>
                    )}
                  </div>
                </td>

                {/* 3. Availability Status with Quick Dropdown */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <FreelancerStatusBadge status={f.status} />
                    <select
                      value={f.status}
                      onChange={(e) => handleQuickStatus(f.id, f, e.target.value as CrmFreelancerStatus, e)}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-transparent border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 focus:outline-none"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </td>

                {/* 4. Tasks & Active Assignments */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {f.activeProjectsCount || 0} Active Project{(f.activeProjectsCount || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {f.revisionsRecordedCount || 0} Revisions Recorded
                    </span>
                  </div>
                </td>

                {/* 5. Financials & Payouts */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{agreed.toLocaleString('en-IN')}
                      </span>
                      {pending > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                          ₹{pending.toLocaleString('en-IN')} Due
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                          Settled
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Paid: ₹{paid.toLocaleString('en-IN')}
                    </span>
                  </div>
                </td>

                {/* 6. Direct Contact Actions */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {/* WhatsApp */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
                      title="Open WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>

                    {/* Phone */}
                    {cleanPhone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                        title={`Call ${cleanPhone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </td>

                {/* 7. Row Actions */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {onEditFreelancer && (
                      <button
                        onClick={() => onEditFreelancer(f)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectFreelancer(f)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="View Details"
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
