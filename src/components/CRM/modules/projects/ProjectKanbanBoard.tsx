import React from 'react';
import { CrmProject, CrmProjectStatus } from '../../../../types/crm';
import { ProjectPriorityBadge } from './ProjectStatusBadge';
import { saveStoredProject, getStoredFreelancers } from '../../../../services/crmStorageService';
import {
  FolderKanban,
  Building,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Users
} from 'lucide-react';

interface ProjectKanbanBoardProps {
  projects: CrmProject[];
  onSelectProject: (project: CrmProject) => void;
  onRefresh?: () => void;
}

interface ColumnConfig {
  id: CrmProjectStatus;
  title: string;
  headerBg: string;
  dotColor: string;
}

const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'planning',
    title: 'Planning & Scope',
    headerBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    dotColor: 'bg-blue-500'
  },
  {
    id: 'in_progress',
    title: 'In Production',
    headerBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    dotColor: 'bg-indigo-500'
  },
  {
    id: 'in_review',
    title: 'In Review & Revisions',
    headerBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    dotColor: 'bg-amber-500'
  },
  {
    id: 'completed',
    title: 'Delivered & Closed',
    headerBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    dotColor: 'bg-emerald-500'
  }
];

export const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
  projects,
  onSelectProject,
  onRefresh
}) => {
  const allFreelancers = getStoredFreelancers();

  const handleMoveStage = (
    e: React.MouseEvent,
    project: CrmProject,
    direction: 'next' | 'prev'
  ) => {
    e.stopPropagation();

    const stages: CrmProjectStatus[] = ['planning', 'in_progress', 'in_review', 'completed'];
    const currentIdx = stages.indexOf(project.status as any);
    if (currentIdx === -1) return;

    const nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx < 0 || nextIdx >= stages.length) return;

    const nextStatus = stages[nextIdx];
    saveStoredProject({
      id: project.id,
      title: project.title,
      clientId: project.clientId,
      status: nextStatus
    });

    if (onRefresh) onRefresh();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => {
        const colProjects = projects.filter((p) => p.status === col.id);
        const colBudget = colProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-200 dark:border-slate-800/80 min-w-[280px]"
          >
            {/* Column Header */}
            <div className={`p-3 rounded-xl border mb-3 flex items-center justify-between ${col.headerBg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <h4 className="text-xs font-bold uppercase tracking-wider">{col.title}</h4>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 shadow-xs">
                  {colProjects.length}
                </span>
              </div>
            </div>

            {/* Column Budget Sub-header */}
            <div className="px-1 mb-2 text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Column Budget:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                ₹{colBudget.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
              {colProjects.length === 0 ? (
                <div className="text-center py-10 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  No projects in this stage
                </div>
              ) : (
                colProjects.map((p) => {
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
                      className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow hover:border-indigo-500/40 cursor-pointer transition-all space-y-2.5"
                    >
                      {/* Top: Priority & Client */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                          {p.clientName}
                        </span>
                        <ProjectPriorityBadge priority={p.priority} />
                      </div>

                      {/* Project Title */}
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {p.title}
                      </h5>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Progress</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {p.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
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

                      {/* Team & Deadline Row */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                        {assignedFreelancers.length > 0 ? (
                          <div className="flex items-center -space-x-1.5">
                            {assignedFreelancers.slice(0, 2).map((f) => (
                              <div
                                key={f.id}
                                className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs"
                              >
                                {f.name.charAt(0)}
                              </div>
                            ))}
                            {assignedFreelancers.length > 2 && (
                              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-slate-900">
                                +{assignedFreelancers.length - 2}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-[10px] text-slate-400">Unassigned</span>
                        )}

                        {p.deadline && (
                          <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                            p.status === 'completed'
                              ? 'text-emerald-600'
                              : daysLeft < 0
                              ? 'text-red-500'
                              : daysLeft <= 3
                              ? 'text-amber-500'
                              : 'text-slate-400'
                          }`}>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</span>
                          </span>
                        )}
                      </div>

                      {/* Footer: Budget & Stage Mover Buttons */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          ₹{(p.budget || 0).toLocaleString('en-IN')}
                        </span>

                        <div className="flex items-center gap-1">
                          {col.id !== 'planning' && (
                            <button
                              onClick={(e) => handleMoveStage(e, p, 'prev')}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Move to Previous Stage"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col.id !== 'completed' && (
                            <button
                              onClick={(e) => handleMoveStage(e, p, 'next')}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded transition-colors"
                              title="Move to Next Stage"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
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
  );
};
