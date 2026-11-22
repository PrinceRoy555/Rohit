import React from 'react';
import {
  Clock,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FolderKanban,
  Building,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { CrmTask, CrmTaskStatus } from '../../../../types/crm';
import {
  TaskPriorityBadge,
  TaskDueDateBadge
} from './TaskStatusBadge';

interface TaskKanbanBoardProps {
  tasks: CrmTask[];
  onSelectTask: (task: CrmTask) => void;
  onUpdateStatus: (taskId: string, status: CrmTaskStatus) => void;
  onAddTaskWithStatus?: (status: CrmTaskStatus) => void;
}

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onAddTaskWithStatus
}) => {
  const columns: Array<{
    id: CrmTaskStatus;
    label: string;
    icon: React.ElementType;
    headerColor: string;
    countBadgeColor: string;
    prevStatus?: CrmTaskStatus;
    nextStatus?: CrmTaskStatus;
  }> = [
    {
      id: 'to_do',
      label: 'To Do',
      icon: Clock,
      headerColor: 'text-slate-700 dark:text-slate-300',
      countBadgeColor: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
      nextStatus: 'in_progress'
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      icon: PlayCircle,
      headerColor: 'text-indigo-600 dark:text-indigo-400',
      countBadgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      prevStatus: 'to_do',
      nextStatus: 'in_review'
    },
    {
      id: 'in_review',
      label: 'In Review',
      icon: AlertCircle,
      headerColor: 'text-amber-600 dark:text-amber-400',
      countBadgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      prevStatus: 'in_progress',
      nextStatus: 'completed'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      headerColor: 'text-emerald-600 dark:text-emerald-400',
      countBadgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      prevStatus: 'in_review'
    },
    {
      id: 'blocked',
      label: 'Blocked',
      icon: XCircle,
      headerColor: 'text-rose-600 dark:text-rose-400',
      countBadgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
      prevStatus: 'in_progress'
    }
  ];

  // Helper to normalize status mapping
  const getColumnTasks = (colId: CrmTaskStatus) => {
    return tasks.filter((t) => {
      const norm = t.status === 'todo' ? 'to_do' : t.status === 'review' ? 'in_review' : t.status;
      return norm === colId;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
      {columns.map((col) => {
        const colTasks = getColumnTasks(col.id);
        const Icon = col.icon;
        const totalEstHours = colTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

        return (
          <div
            key={col.id}
            className="bg-slate-50/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 min-w-[260px] flex flex-col flex-1"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${col.headerColor}`} />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {col.label}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.countBadgeColor}`}
                >
                  {colTasks.length}
                </span>
              </div>

              {totalEstHours > 0 && (
                <span className="text-[10px] font-semibold text-slate-400">
                  {totalEstHours}h
                </span>
              )}
            </div>

            {/* Task Cards */}
            <div className="space-y-3 flex-1 min-h-[300px]">
              {colTasks.length > 0 ? (
                colTasks.map((task) => {
                  const completedSubtasks = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;
                  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
                  const latestSubmission = task.submissions && task.submissions.length > 0 ? task.submissions[0] : null;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group space-y-2.5"
                    >
                      {/* Priority & Revision Round */}
                      <div className="flex items-center justify-between gap-2">
                        <TaskPriorityBadge priority={task.priority} size="sm" />
                        {(task.revisionRound || 0) > 0 && (
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md">
                            R{task.revisionRound}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Project Link */}
                      {task.projectTitle && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          <FolderKanban className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{task.projectTitle}</span>
                        </div>
                      )}

                      {/* Subtasks Progress */}
                      {totalSubtasks > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span>Checklist</span>
                            <span>
                              {completedSubtasks}/{totalSubtasks}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer: Assignee & Due Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {task.assignedFreelancerName ? task.assignedFreelancerName.charAt(0) : 'H'}
                          </div>
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                            {task.assignedFreelancerName ? task.assignedFreelancerName.split(' ')[0] : 'In-House'}
                          </span>
                        </div>

                        <TaskDueDateBadge dueDate={task.dueDate} isCompleted={task.status === 'completed'} />
                      </div>

                      {/* Stage Shift Controls */}
                      <div
                        className="flex items-center justify-between pt-1 text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {col.prevStatus ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(task.id, col.prevStatus!)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-0.5"
                            title={`Move back to ${col.prevStatus.replace('_', ' ')}`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold">Prev</span>
                          </button>
                        ) : (
                          <div />
                        )}

                        {col.nextStatus ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(task.id, col.nextStatus!)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-0.5 ml-auto"
                            title={`Advance to ${col.nextStatus.replace('_', ' ')}`}
                          >
                            <span className="text-[10px] font-semibold">Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span className="text-xs text-slate-400">No tasks in {col.label}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
