import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  Building,
  UserCheck
} from 'lucide-react';
import { CrmTask } from '../../../../types/crm';
import {
  TaskStatusBadge,
  TaskPriorityBadge,
  TaskDueDateBadge
} from './TaskStatusBadge';

interface TaskCalendarViewProps {
  tasks: CrmTask[];
  onSelectTask: (task: CrmTask) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onSelectTask
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group tasks by deadline timeline categories
  const overdueTasks: CrmTask[] = [];
  const dueTodayTasks: CrmTask[] = [];
  const dueThisWeekTasks: CrmTask[] = [];
  const dueLaterTasks: CrmTask[] = [];
  const completedTasks: CrmTask[] = [];
  const noDeadlineTasks: CrmTask[] = [];

  tasks.forEach((t) => {
    if (t.status === 'completed') {
      completedTasks.push(t);
      return;
    }

    if (!t.dueDate) {
      noDeadlineTasks.push(t);
      return;
    }

    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      overdueTasks.push(t);
    } else if (diffDays === 0) {
      dueTodayTasks.push(t);
    } else if (diffDays <= 7) {
      dueThisWeekTasks.push(t);
    } else {
      dueLaterTasks.push(t);
    }
  });

  const sections = [
    {
      title: 'Overdue Deadlines',
      badge: `${overdueTasks.length} Overdue`,
      badgeClass: 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400',
      icon: AlertCircle,
      iconColor: 'text-red-500',
      tasks: overdueTasks,
      borderClass: 'border-red-200 dark:border-red-900/60'
    },
    {
      title: 'Due Today',
      badge: `${dueTodayTasks.length} Urgent`,
      badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400',
      icon: Clock,
      iconColor: 'text-amber-500',
      tasks: dueTodayTasks,
      borderClass: 'border-amber-200 dark:border-amber-900/60'
    },
    {
      title: 'Due This Week (Next 7 Days)',
      badge: `${dueThisWeekTasks.length} Tasks`,
      badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400',
      icon: CalendarIcon,
      iconColor: 'text-indigo-500',
      tasks: dueThisWeekTasks,
      borderClass: 'border-indigo-200 dark:border-indigo-900/60'
    },
    {
      title: 'Upcoming & Later Deadlines',
      badge: `${dueLaterTasks.length} Scheduled`,
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      icon: CalendarIcon,
      iconColor: 'text-slate-500',
      tasks: dueLaterTasks,
      borderClass: 'border-slate-200 dark:border-slate-800'
    },
    {
      title: 'Delivered & Completed',
      badge: `${completedTasks.length} Done`,
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      tasks: completedTasks,
      borderClass: 'border-slate-200 dark:border-slate-800'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Calendar Overview Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800">
            Chronological Task Schedule
          </span>
          <h3 className="text-xl font-black mt-2">
            Creative Deliverables & Deadlines Calendar
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time deadline prioritization, overdue tracking, and subcontractor milestone roadmap.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Overdue</span>
            <span className="text-lg font-black text-red-400">{overdueTasks.length}</span>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">This Week</span>
            <span className="text-lg font-black text-indigo-300">{dueThisWeekTasks.length + dueTodayTasks.length}</span>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Completed</span>
            <span className="text-lg font-black text-emerald-300">{completedTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Timeline Sections */}
      <div className="space-y-6">
        {sections.map((sec, idx) => {
          if (sec.tasks.length === 0) return null;
          const Icon = sec.icon;

          return (
            <div
              key={idx}
              className={`bg-white dark:bg-slate-900 rounded-3xl border ${sec.borderClass} p-5 shadow-xs space-y-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-5 h-5 ${sec.iconColor}`} />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {sec.title}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sec.badgeClass}`}>
                    {sec.badge}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {sec.tasks.map((task) => {
                  const completedSubtasks = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;
                  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="p-4 bg-slate-50/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <TaskPriorityBadge priority={task.priority} size="sm" />
                        <TaskStatusBadge status={task.status} size="sm" />
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 transition-colors">
                          {task.title}
                        </h5>
                        {task.projectTitle && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                            <FolderKanban className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{task.projectTitle}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {task.assignedFreelancerName ? task.assignedFreelancerName.charAt(0) : 'H'}
                          </div>
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[100px]">
                            {task.assignedFreelancerName || 'In-House'}
                          </span>
                        </div>

                        <TaskDueDateBadge dueDate={task.dueDate} isCompleted={task.status === 'completed'} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
