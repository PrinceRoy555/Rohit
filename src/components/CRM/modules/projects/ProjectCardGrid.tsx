import React from 'react';
import { CrmProject } from '../../../../types/crm';
import { ProjectStatusBadge, ProjectPriorityBadge } from './ProjectStatusBadge';
import { getStoredFreelancers } from '../../../../services/crmStorageService';
import {
  FolderKanban,
  Building,
  Calendar,
  Users,
  Clock,
  Edit,
  DollarSign
} from 'lucide-react';

interface ProjectCardGridProps {
  projects: CrmProject[];
  onSelectProject: (project: CrmProject) => void;
  onEditProject?: (project: CrmProject) => void;
}

export const ProjectCardGrid: React.FC<ProjectCardGridProps> = ({
  projects,
  onSelectProject,
  onEditProject
}) => {
  const allFreelancers = getStoredFreelancers();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => {
        const pending = p.pendingBalance ?? Math.max(0, (p.budget || 0) - (p.amountPaid || 0));
        const now = new Date().getTime();
        const deadlineTime = p.deadline ? new Date(p.deadline).getTime() : now;
        const daysLeft = Math.ceil((deadlineTime - now) / (1000 * 60 * 60 * 24));

        const assignedFreelancers = allFreelancers.filter((f) =>
          (p.assignedFreelancerIds || []).includes(f.id)
        );

        return (
          <div
            key={p.id}
            onClick={() => onSelectProject(p)}
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Top Row: Title, Service & Status */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 shadow-sm">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {p.clientName}
                      </span>
                    </p>
                  </div>
                </div>

                <ProjectStatusBadge status={p.status} />
              </div>

              {/* Service & Priority Strip */}
              <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-3">
                <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[170px]">
                  {p.serviceCategory}
                </span>
                <ProjectPriorityBadge priority={p.priority} />
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Progress: {p.progress || 0}%
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {(p.milestones || []).filter((m) => m.completed).length}/{(p.milestones || []).length} milestones
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
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
            </div>

            {/* Bottom Row: Team, Deadlines & Financials */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                {/* Team Avatars */}
                <div className="flex items-center gap-1.5">
                  {assignedFreelancers.length === 0 ? (
                    <span className="text-slate-400 italic text-[11px]">Unassigned team</span>
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
                </div>

                {/* Deadline */}
                {p.deadline && (
                  <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                    p.status === 'completed'
                      ? 'text-emerald-600'
                      : daysLeft < 0
                      ? 'text-red-500'
                      : daysLeft <= 3
                      ? 'text-amber-500'
                      : 'text-slate-500'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</span>
                  </span>
                )}
              </div>

              {/* Financial Summary */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Budget</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    ₹{(p.budget || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Balance Due</span>
                  <p className="font-bold">
                    {pending > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        ₹{pending.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Fully Settled
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
