import React, { useState } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  MessageSquare,
  Plus,
  Send,
  Building,
  FolderKanban,
  UserCheck,
  FileText,
  AlertTriangle,
  History
} from 'lucide-react';
import {
  CrmTask,
  CrmTaskStatus,
  CrmProject,
  CrmClient,
  CrmFreelancer
} from '../../../../types/crm';
import {
  TaskStatusBadge,
  TaskPriorityBadge,
  TaskDueDateBadge
} from './TaskStatusBadge';
import {
  updateTaskStatus,
  toggleTaskSubtask,
  addTaskSubtask,
  addTaskSubmission,
  addTaskComment,
  deleteStoredTask,
  deleteTaskWithCloud
} from '../../../../services/crmStorageService';

interface TaskProfileDrawerProps {
  task: CrmTask | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: CrmTask) => void;
  onTaskUpdated: (task: CrmTask) => void;
  onTaskDeleted: (taskId: string) => void;
  project?: CrmProject;
  client?: CrmClient;
  freelancer?: CrmFreelancer;
}

export const TaskProfileDrawer: React.FC<TaskProfileDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onTaskUpdated,
  onTaskDeleted,
  project,
  client,
  freelancer
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'subtasks' | 'submissions' | 'activity'>('overview');

  // Subtask form
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Submission form
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionRound, setSubmissionRound] = useState<number>(1);

  // Comment form
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !task) return null;

  const currentRound = (task.revisionRound || 0) + 1;

  const handleStatusChange = (newStatus: CrmTaskStatus) => {
    const updated = updateTaskStatus(task.id, newStatus);
    if (updated) onTaskUpdated(updated);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updated = toggleTaskSubtask(task.id, subtaskId);
    if (updated) onTaskUpdated(updated);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const updated = addTaskSubtask(task.id, newSubtaskTitle.trim());
    if (updated) {
      onTaskUpdated(updated);
      setNewSubtaskTitle('');
    }
  };

  const handleAddSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) return;
    const updated = addTaskSubmission(task.id, {
      url: submissionUrl.trim(),
      notes: submissionNotes.trim() || undefined,
      revisionRound: submissionRound || currentRound,
      submittedBy: freelancer ? freelancer.name : 'Subcontractor'
    });
    if (updated) {
      onTaskUpdated(updated);
      setSubmissionUrl('');
      setSubmissionNotes('');
      setShowSubmissionForm(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const updated = addTaskComment(task.id, {
      content: newComment.trim(),
      authorName: 'Rohit Verma (Admin)'
    });
    if (updated) {
      onTaskUpdated(updated);
      setNewComment('');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      const res = await deleteTaskWithCloud(task.id);
      if (!res.success && res.errorCode === 'permission-denied') {
        alert('Permission Denied: You do not have permission to delete task records.');
        return;
      }
      onTaskDeleted(task.id);
      onClose();
    }
  };

  // WhatsApp Freelancer Link
  const rawPhone = freelancer?.whatsapp || freelancer?.phone?.replace(/\D/g, '') || '';
  const waUrl = rawPhone
    ? `https://wa.me/${rawPhone.startsWith('91') ? rawPhone : '91' + rawPhone}?text=${encodeURIComponent(
        `Hi ${freelancer?.name || ''}, regarding task "${task.title}" on project "${task.projectTitle || ''}":\n\nDeadline: ${task.dueDate || 'Flexible'}\nPriority: ${task.priority.toUpperCase()}`
      )}`
    : '';

  const completedSubtasksCount = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;
  const totalSubtasksCount = task.subtasks ? task.subtasks.length : 0;
  const progressPercent =
    totalSubtasksCount > 0
      ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100)
      : task.status === 'completed'
      ? 100
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <TaskStatusBadge status={task.status} size="sm" />
                <TaskPriorityBadge priority={task.priority} size="sm" />
                <TaskDueDateBadge dueDate={task.dueDate} isCompleted={task.status === 'completed'} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight break-words">
                {task.title}
              </h2>
              {task.projectTitle && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>{task.projectTitle}</span>
                  {task.clientName && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 dark:text-slate-300">{task.clientName}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Edit Task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close Drawer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Status & Progress Bar */}
          <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Change Status:
              </span>
              <select
                value={task.status === 'todo' ? 'to_do' : task.status === 'review' ? 'in_review' : task.status}
                onChange={(e) => handleStatusChange(e.target.value as CrmTaskStatus)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="to_do">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPercent === 100
                      ? 'bg-emerald-500'
                      : progressPercent > 50
                      ? 'bg-indigo-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {progressPercent}% Complete
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Overview & Scope
            </button>
            <button
              onClick={() => setActiveTab('subtasks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'subtasks'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Checklist</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'subtasks' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {completedSubtasksCount}/{totalSubtasksCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'submissions'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Submissions & Links</span>
              {(task.submissions?.length || 0) > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'submissions' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {task.submissions?.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Comments & Audit</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Task Brief & Technical Scope
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {task.description || (
                    <span className="italic text-slate-400">No brief provided. Click edit to add instructions.</span>
                  )}
                </div>
              </div>

              {/* Subcontractor Allocation Card */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Assigned Subcontractor
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                      {freelancer ? freelancer.name.charAt(0) : 'H'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {freelancer ? freelancer.name : task.assignedFreelancerName || 'In-House / Admin'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {freelancer ? freelancer.specialty : 'Direct creative execution'}
                      </div>
                    </div>
                  </div>

                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Brief</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Timing & Hours Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Start Date
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.startDate || 'Immediate'}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Due Date
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.dueDate || 'Flexible'}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Est. Hours
                  </span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {task.estimatedHours ? `${task.estimatedHours}h` : 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Revision Pass
                  </span>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    R{task.revisionRound || 0}
                  </div>
                </div>
              </div>

              {/* Linked Client & Project Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <FolderKanban className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Project Scope</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    {task.projectTitle || 'Standalone Task'}
                  </div>
                  {project && (
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>Category: {project.serviceCategory}</div>
                      <div>Project Status: {project.status.toUpperCase()}</div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Client Brand</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    {task.clientName || 'Direct / Rohitwork Client'}
                  </div>
                  {client && (
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>Company: {client.company || 'Private'}</div>
                      <div>Phone: {client.phone}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              {task.notes && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Admin Internal Notes
                  </h3>
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                    {task.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUBTASKS & CHECKLIST */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Task Subtask Checklist
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any checkbox to immediately toggle completion and recalibrate progress.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {completedSubtasksCount} of {totalSubtasksCount} Completed
                </span>
              </div>

              {/* Subtask items list */}
              <div className="space-y-2">
                {task.subtasks && task.subtasks.length > 0 ? (
                  task.subtasks.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => handleToggleSubtask(st.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        st.completed
                          ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40 text-slate-500 line-through'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {st.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs font-medium truncate">{st.title}</span>
                      </div>
                      {st.completedAt && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(st.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    No subtasks yet. Add items below to track execution steps.
                  </div>
                )}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add another subtask to this checklist..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subtask</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SUBMISSIONS & WORK REVIEWS */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Work Submission URLs & Review Rounds
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Frame.io previews, Google Drive masters, and Figma review links.
                  </p>
                </div>
                <button
                  onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showSubmissionForm ? 'Cancel' : 'Log Submission'}</span>
                </button>
              </div>

              {/* Submission Form */}
              {showSubmissionForm && (
                <form
                  onSubmit={handleAddSubmission}
                  className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Record New Work Submission (Round {currentRound})
                  </h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Deliverable URL (Frame.io, Google Drive, Figma) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      placeholder="https://frame.io/preview/sample-cut-v3"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Revision Round
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={submissionRound}
                        onChange={(e) => setSubmissionRound(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Revision Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        placeholder="e.g. Applied skin tone qualifiers"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    Save & Move Task to In Review
                  </button>
                </form>
              )}

              {/* Submissions List */}
              <div className="space-y-2.5">
                {task.submissions && task.submissions.length > 0 ? (
                  task.submissions.map((subm) => (
                    <div
                      key={subm.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            Round {subm.revisionRound}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              subm.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : subm.status === 'revision_requested'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {subm.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(subm.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <a
                          href={subm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate max-w-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{subm.url}</span>
                        </a>
                        <span className="text-[11px] text-slate-500 shrink-0">
                          by {subm.submittedBy || 'Subcontractor'}
                        </span>
                      </div>

                      {subm.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg mt-1">
                          {subm.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    No submissions recorded yet. Click "Log Submission" to record a delivery preview.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMMENTS & AUDIT TRAIL */}
          {activeTab === 'activity' && (
            <div className="space-y-5">
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post internal admin comment or client feedback..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>

              {/* Comments Feed */}
              {task.comments && task.comments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Internal Comments ({task.comments.length})
                  </h4>
                  {task.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {comm.authorName || comm.authorEmail}
                        </span>
                        <span className="text-slate-400">
                          {new Date(comm.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        {comm.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity / Audit Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  System Audit Trail
                </h4>
                {task.activities && task.activities.length > 0 ? (
                  <div className="space-y-2">
                    {task.activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/30"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div>{act.description || (act as any).content}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(act.timestamp).toLocaleString()} • {act.author}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No activity recorded yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
