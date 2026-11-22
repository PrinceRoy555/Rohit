import React from 'react';
import { CrmProject, CrmProjectStatus } from '../../../../types/crm';
import { ProjectStatusBadge, ProjectPriorityBadge } from './ProjectStatusBadge';
import { saveStoredProject, getStoredFreelancers } from '../../../../services/crmStorageService';
import {
  FolderKanban,
  Building,
  Calendar,
  ChevronRight,
  Edit,
  ExternalLink,
  Users
} from 'lucide-react';

interface ProjectTableViewProps {
  projects: CrmProject[];
  onSelectProject: (project: CrmProject) => void;
  onEditProject?: (project: CrmProject) => void;
  onRefresh?: () => void;
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  projects,
  onSelectProject,
  onEditProject,
  onRefresh
}) => {
  const allFreelancers = getStoredFreelancers();

  const handleQuickStatus = (
    projectId: string,
    current: CrmProject,
    newStatus: CrmProjectStatus,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.stopPropagation();
    saveStoredProject({
      id: projectId,
      title: current.title,
      clientId: current.clientId,
      status: e.target.value as CrmProjectStatus
    });
    if (onRefresh) onRefresh();
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4">Project & Service</th>
            <th className="py-3.5 px-4">Client</th>
            <th className="py-3.5 px-4">Status & Priority</th>
            <th className="py-3.5 px-4">Progress</th>
            <th className="py-3.5 px-4">Deadline</th>
            <th className="py-3.5 px-4">Team</th>
            <th className="py-3.5 px-4">Budget & Balance</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {projects.map((p) => {
            const pending = p.pendingBalance ?? Math.max(0, (p.budget || 0) - (p.amountPaid || 0));
            const now = new Date().getTime();
            const deadlineTime = p.deadline ? new Date(p.deadline).getTime() : now;
            const daysLeft = Math.ceil((deadlineTime - now) / (1000 * 60 * 60 * 24));

            const assignedFreelancers = allFreelancers.filter((f) =>
              (p.assignedFreelancerIds || []).includes(f.id)
            );

            return (
              <tr
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* 1. Project Title & Service */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.serviceCategory}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. Client */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.clientName}</span>
                  </div>
                </td>

                {/* 3. Status & Priority */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <ProjectStatusBadge status={p.status} />
                      <select
                        value={p.status}
                        onChange={(e) => handleQuickStatus(p.id, p, e.target.value as CrmProjectStatus, e)}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-transparent border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 focus:outline-none"
                      >
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <ProjectPriorityBadge priority={p.priority} />
                    </div>
                  </div>
                </td>

                {/* 4. Progress Bar */}
                <td className="py-3.5 px-4 min-w-[130px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {p.progress || 0}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {(p.milestones || []).filter((m) => m.completed).length}/{(p.milestones || []).length} done
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          p.progress === 100
                            ? 'bg-emerald-500'
                            : (p.progress || 0) > 50
                            ? 'bg-indigo-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${p.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* 5. Deadline */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{p.deadline || 'No Date'}</span>
                    </span>
                    {p.status !== 'completed' && p.deadline && (
                      <span className={`text-[10px] font-semibold ${
                        daysLeft < 0 ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                      </span>
                    )}
                  </div>
                </td>

                {/* 6. Team Avatars */}
                <td className="py-3.5 px-4">
                  {assignedFreelancers.length === 0 ? (
                    <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                  ) : (
                    <div className="flex items-center -space-x-1.5">
                      {assignedFreelancers.slice(0, 3).map((f) => (
                        <div
                          key={f.id}
                          className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm"
                          title={`${f.name} (${f.specialty})`}
                        >
                          {f.name.charAt(0)}
                        </div>
                      ))}
                      {assignedFreelancers.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                          +{assignedFreelancers.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </td>

                {/* 7. Budget & Balance */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{(p.budget || 0).toLocaleString('en-IN')}
                    </span>
                    <span className={`text-[10px] font-semibold ${
                      pending > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
                    }`}>
                      {pending > 0 ? `₹${pending.toLocaleString('en-IN')} Due` : 'Fully Paid'}
                    </span>
                  </div>
                </td>

                {/* 8. Actions */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {onEditProject && (
                      <button
                        onClick={() => onEditProject(p)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Project"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectProject(p)}
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
