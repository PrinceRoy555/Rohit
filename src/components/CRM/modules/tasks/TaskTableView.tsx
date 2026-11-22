import React from 'react';
import {
  FolderKanban,
  Building,
  CheckCircle2,
  Circle,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckSquare
} from 'lucide-react';
import { CrmTask, CrmTaskStatus } from '../../../../types/crm';
import {
  TaskStatusBadge,
  TaskPriorityBadge,
  TaskDueDateBadge
} from './TaskStatusBadge';

interface TaskTableViewProps {
  tasks: CrmTask[];
  onSelectTask: (task: CrmTask) => void;
  onEditTask: (task: CrmTask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: CrmTaskStatus) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onUpdateStatus
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
              <th className="py-3.5 pl-6 pr-2 w-10">Done</th>
              <th className="py-3.5 px-4">Task & Project</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Subcontractor</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Checklist</th>
              <th className="py-3.5 px-4">Deadline</th>
              <th className="py-3.5 pr-6 pl-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {tasks.map((task) => {
              const completedCount = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;
              const totalCount = task.subtasks ? task.subtasks.length : 0;
              const isDone = task.status === 'completed';
              const latestSubmission = task.submissions && task.submissions.length > 0 ? task.submissions[0] : null;

              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${
                    isDone ? 'bg-slate-50/30 dark:bg-slate-900/30' : ''
                  }`}
                >
                  {/* Done toggle checkbox */}
                  <td
                    className="py-4 pl-6 pr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(task.id);
                    }}
                  >
                    <button
                      type="button"
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title={isDone ? 'Mark as To Do' : 'Mark as Completed'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                  </td>

                  {/* Task & Project */}
                  <td className="py-4 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {task.title}
                    </div>
                    {task.projectTitle ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        <FolderKanban className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{task.projectTitle}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic mt-0.5">Standalone Task</div>
                    )}
                  </td>

                  {/* Client */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {task.clientName ? (
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <Building className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate max-w-[140px]">{task.clientName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Direct</span>
                    )}
                  </td>

                  {/* Subcontractor Assignee */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {task.assignedFreelancerName ? task.assignedFreelancerName.charAt(0) : 'H'}
                      </div>
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[120px]">
                        {task.assignedFreelancerName || 'In-House'}
                      </span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>

                  {/* Status Dropdown */}
                  <td
                    className="py-4 px-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={task.status === 'todo' ? 'to_do' : task.status === 'review' ? 'in_review' : task.status}
                      onChange={(e) => onUpdateStatus(task.id, e.target.value as CrmTaskStatus)}
                      className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="to_do">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </td>

                  {/* Subtask Checklist Progress */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {totalCount > 0 ? (
                      <div className="space-y-1 w-28">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>
                            {completedCount}/{totalCount} subtasks
                          </span>
                          <span>{task.progress || Math.round((completedCount / totalCount) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              completedCount === totalCount
                                ? 'bg-emerald-500'
                                : completedCount > 0
                                ? 'bg-indigo-600'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No checklist</span>
                    )}
                  </td>

                  {/* Due Date with Overdue Indicator */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <TaskDueDateBadge dueDate={task.dueDate} isCompleted={isDone} />
                  </td>

                  {/* Actions */}
                  <td
                    className="py-4 pr-6 pl-2 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {latestSubmission && (
                        <a
                          href={latestSubmission.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={`Review Submission (R${latestSubmission.revisionRound})`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => onSelectTask(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
