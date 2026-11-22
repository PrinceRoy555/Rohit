import React, { useState, useEffect, useMemo } from 'react';
import {
  CrmTask,
  CrmTaskStatus,
  CrmTaskPriority,
  CrmProject,
  CrmClient,
  CrmFreelancer
} from '../../../../types/crm';
import {
  getStoredTasks,
  getStoredProjects,
  getStoredClients,
  getStoredFreelancers,
  initCrmStorage,
  subscribeCrmStore,
  deleteStoredTask,
  deleteTaskWithCloud,
  toggleTaskStatus,
  updateTaskStatus
} from '../../../../services/crmStorageService';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmLoadingState } from '../../shared/CrmLoadingState';
import { CrmEmptyState } from '../../shared/CrmEmptyState';
import { TaskTableView } from './TaskTableView';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import { TaskCalendarView } from './TaskCalendarView';
import { AddTaskModal } from './AddTaskModal';
import { TaskProfileDrawer } from './TaskProfileDrawer';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  List,
  Columns,
  Calendar,
  RefreshCw,
  Clock,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

interface TasksModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const TasksModule: React.FC<TasksModuleProps> = ({ onNavigateToModule }) => {
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [freelancers, setFreelancers] = useState<CrmFreelancer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'newest' | 'title' | 'progress'>('dueDate');

  // View Mode: 'table' | 'kanban' | 'calendar'
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar'>('table');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTaskForProfile, setSelectedTaskForProfile] = useState<CrmTask | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<CrmTask | null>(null);

  // 1. Initial Load
  const loadTasks = async () => {
    try {
      await initCrmStorage();
      setTasks(getStoredTasks());
      setProjects(getStoredProjects());
      setClients(getStoredClients());
      setFreelancers(getStoredFreelancers());
    } catch (err) {
      console.error('Error loading CRM tasks:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();

    const unsubscribe = subscribeCrmStore(() => {
      setTasks(getStoredTasks());
      setProjects(getStoredProjects());
      setClients(getStoredClients());
      setFreelancers(getStoredFreelancers());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Computed Metrics
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const inReview = tasks.filter((t) => t.status === 'in_review' || (t.status as any) === 'review').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;

    // Overdue or Due Soon (within 3 days)
    const dueSoonOrOverdue = tasks.filter((t) => {
      if (t.status === 'completed' || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 3;
    }).length;

    return {
      total,
      inProgress,
      inReview,
      completed,
      dueSoonOrOverdue
    };
  }, [tasks]);

  // 3. Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.projectTitle && t.projectTitle.toLowerCase().includes(q)) ||
          (t.clientName && t.clientName.toLowerCase().includes(q)) ||
          (t.assignedFreelancerName && t.assignedFreelancerName.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((t) => {
        const norm = t.status === 'todo' ? 'to_do' : t.status === 'review' ? 'in_review' : t.status;
        return norm === selectedStatus;
      });
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      result = result.filter((t) => t.priority === selectedPriority);
    }

    // Project filter
    if (selectedProjectId !== 'all') {
      result = result.filter((t) => t.projectId === selectedProjectId);
    }

    // Freelancer filter
    if (selectedFreelancerId !== 'all') {
      result = result.filter((t) => t.assignedFreelancerId === selectedFreelancerId);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'progress') {
        return (b.progress || 0) - (a.progress || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [tasks, searchQuery, selectedStatus, selectedPriority, selectedProjectId, selectedFreelancerId, sortBy]);

  // 4. Pagination
  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTasks.slice(startIndex, startIndex + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTasks();
  };

  const handleToggleTaskStatus = (taskId: string) => {
    toggleTaskStatus(taskId);
    setTasks(getStoredTasks());
    if (selectedTaskForProfile && selectedTaskForProfile.id === taskId) {
      const match = getStoredTasks().find((t) => t.id === taskId);
      if (match) setSelectedTaskForProfile(match);
    }
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: CrmTaskStatus) => {
    const updated = updateTaskStatus(taskId, newStatus);
    setTasks(getStoredTasks());
    if (updated && selectedTaskForProfile && selectedTaskForProfile.id === taskId) {
      setSelectedTaskForProfile(updated);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const res = await deleteTaskWithCloud(taskId);
      if (!res.success && res.errorCode === 'permission-denied') {
        alert('Permission Denied: You do not have permission to delete task records.');
        return;
      }
      setTasks(getStoredTasks());
      if (selectedTaskForProfile?.id === taskId) {
        setSelectedTaskForProfile(null);
      }
    }
  };

  const handleTaskSaved = (savedTask: CrmTask) => {
    setTasks(getStoredTasks());
    setSelectedTaskForProfile(savedTask);
  };

  if (isLoading) {
    return <CrmLoadingState rows={5} />;
  }

  // Linked entities for selected task profile drawer
  const linkedProject = selectedTaskForProfile?.projectId
    ? projects.find((p) => p.id === selectedTaskForProfile.projectId)
    : undefined;
  const linkedClient = selectedTaskForProfile?.clientId
    ? clients.find((c) => c.id === selectedTaskForProfile.clientId)
    : linkedProject
    ? clients.find((c) => c.id === linkedProject.clientId)
    : undefined;
  const linkedFreelancer = selectedTaskForProfile?.assignedFreelancerId
    ? freelancers.find((f) => f.id === selectedTaskForProfile.assignedFreelancerId)
    : undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Page Header */}
      <CrmPageHeader
        title="Task Management"
        subtitle="Manage creative project deliverables, subtask checklists, deadlines & subcontractor assignments."
        icon={CheckSquare}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              title="Refresh Task Stream"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7c3aed]' : ''}`} />
            </button>
            <button
              onClick={() => {
                setSelectedTaskForEdit(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        }
      />

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Tasks */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
              <CheckSquare className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.total}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Active & completed scope
          </p>
        </div>

        {/* Metric 2: In Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[#7c3aed] dark:text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
              <PlayCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.inProgress}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Active creative execution
          </p>
        </div>

        {/* Metric 3: Due Soon / Overdue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Due Soon / Overdue</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shadow-2xs">
              <AlertCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.dueSoonOrOverdue}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Within 3 days or past deadline
          </p>
        </div>

        {/* Metric 4: Completed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.completed}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Delivered creative assets
          </p>
        </div>
      </div>

      {/* 3. Toolbar: Search, Filters & View Mode */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search tasks, deliverables, projects, freelancers..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters & View Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="to_do">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium max-w-[150px] truncate"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Freelancer Filter */}
          <select
            value={selectedFreelancerId}
            onChange={(e) => {
              setSelectedFreelancerId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium max-w-[150px] truncate"
          >
            <option value="all">All Freelancers</option>
            {freelancers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="dueDate">Soonest Due</option>
            <option value="priority">Highest Priority</option>
            <option value="progress">Highest Progress</option>
            <option value="newest">Newest Created</option>
            <option value="title">Task Title</option>
          </select>

          {/* View Mode Toggle: Table / Kanban / Calendar */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Calendar View"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main View Display */}
      {filteredTasks.length === 0 ? (
        <CrmEmptyState
          title="No tasks found"
          description={
            searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedProjectId !== 'all'
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'Create your first creative project deliverable task to get started.'
          }
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedPriority('all');
                setSelectedProjectId('all');
                setSelectedFreelancerId('all');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        <div className="space-y-4">
          <TaskTableView
            tasks={paginatedTasks}
            onSelectTask={setSelectedTaskForProfile}
            onEditTask={(task) => {
              setSelectedTaskForEdit(task);
              setIsAddModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onToggleStatus={handleToggleTaskStatus}
            onUpdateStatus={handleUpdateTaskStatus}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-900 dark:text-white px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        <TaskKanbanBoard
          tasks={filteredTasks}
          onSelectTask={setSelectedTaskForProfile}
          onUpdateStatus={handleUpdateTaskStatus}
          onAddTaskWithStatus={(status) => {
            setSelectedTaskForEdit(null);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <TaskCalendarView
          tasks={filteredTasks}
          onSelectTask={setSelectedTaskForProfile}
        />
      )}

      {/* 5. Modals & Drawers */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedTaskForEdit(null);
        }}
        onTaskSaved={handleTaskSaved}
        initialTask={selectedTaskForEdit}
      />

      <TaskProfileDrawer
        task={selectedTaskForProfile}
        isOpen={Boolean(selectedTaskForProfile)}
        onClose={() => setSelectedTaskForProfile(null)}
        onEdit={(task) => {
          setSelectedTaskForEdit(task);
          setIsAddModalOpen(true);
        }}
        onTaskUpdated={(updated) => {
          setSelectedTaskForProfile(updated);
          setTasks(getStoredTasks());
        }}
        onTaskDeleted={(taskId) => {
          setSelectedTaskForProfile(null);
          setTasks(getStoredTasks());
        }}
        project={linkedProject}
        client={linkedClient}
        freelancer={linkedFreelancer}
      />
    </div>
  );
};
