import React, { useState, useEffect, useMemo } from 'react';
import { CrmProject, CrmProjectStatus, CrmClient } from '../../../../types/crm';
import {
  initCrmStorage,
  getStoredProjects,
  getStoredClients,
  subscribeCrmStore
} from '../../../../services/crmStorageService';
import { ProjectTableView } from './ProjectTableView';
import { ProjectCardGrid } from './ProjectCardGrid';
import { ProjectKanbanBoard } from './ProjectKanbanBoard';
import { AddProjectModal } from './AddProjectModal';
import { ProjectProfileDrawer } from './ProjectProfileDrawer';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmLoadingState } from '../../shared/CrmLoadingState';
import { CrmEmptyState } from '../../shared/CrmEmptyState';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Columns,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';

interface ProjectsModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({ onNavigateToModule }) => {
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'newest' | 'budget' | 'progress' | 'title'>('deadline');

  // View Mode: 'table' | 'grid' | 'kanban'
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'kanban'>('table');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectForProfile, setSelectedProjectForProfile] = useState<CrmProject | null>(null);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<CrmProject | null>(null);

  // 1. Initial Load
  const loadProjects = async () => {
    try {
      await initCrmStorage();
      setProjects(getStoredProjects());
      setClients(getStoredClients());
    } catch (err) {
      console.error('Error loading CRM projects:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();

    const unsubscribe = subscribeCrmStore(() => {
      setProjects(getStoredProjects());
      setClients(getStoredClients());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Computed Metrics
  const metrics = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === 'in_progress').length;
    const inReview = projects.filter((p) => p.status === 'in_review').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalDue = projects.reduce(
      (sum, p) => sum + (p.pendingBalance ?? Math.max(0, (p.budget || 0) - (p.amountPaid || 0))),
      0
    );

    return {
      total,
      inProgress,
      inReview,
      completed,
      totalBudget,
      totalDue
    };
  }, [projects]);

  // 3. Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesClient = p.clientName.toLowerCase().includes(q);
        const matchesService = p.serviceCategory.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);

        if (!matchesTitle && !matchesClient && !matchesService && !matchesDesc) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatus !== 'all') {
        if (p.status !== selectedStatus) return false;
      }

      // Priority Filter
      if (selectedPriority !== 'all') {
        if (p.priority !== selectedPriority) return false;
      }

      // Client Filter
      if (selectedClientId !== 'all') {
        if (p.clientId !== selectedClientId) return false;
      }

      return true;
    });
  }, [projects, searchQuery, selectedStatus, selectedPriority, selectedClientId]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (sortBy === 'deadline') {
        const timeA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const timeB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return timeA - timeB;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'budget') {
        return (b.budget || 0) - (a.budget || 0);
      }
      if (sortBy === 'progress') {
        return (b.progress || 0) - (a.progress || 0);
      }
      // 'newest'
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [filteredProjects, sortBy]);

  // 4. Pagination
  const totalPages = Math.ceil(sortedProjects.length / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProjects.slice(start, start + pageSize);
  }, [sortedProjects, currentPage, pageSize]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProjects();
  };

  const handleOpenAddModal = () => {
    setSelectedProjectForEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditProject = (p: CrmProject) => {
    setSelectedProjectForEdit(p);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <CrmPageHeader
        title="Project Management"
        subtitle="Deliverable milestones, subcontractor task allocation, client approval tracking & budget execution."
        icon={FolderKanban}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        }
      />

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Projects */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
              <FolderKanban className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.total}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Active pipeline: ₹{metrics.totalBudget.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Metric 2: In Production */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[#7c3aed] dark:text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Production</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.inProgress}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Active editing & renders
          </p>
        </div>

        {/* Metric 3: In Review */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shadow-2xs">
              <AlertCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {metrics.inReview}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Client feedback / revision pass
          </p>
        </div>

        {/* Metric 4: Completed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-2xs">
              <CheckCircle className="w-4 h-4 stroke-[2.2]" />
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
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by project name, client, service category..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-purple-300 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters & View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Stages</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
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

          {/* Client Filter */}
          <select
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="deadline">Soonest Deadline</option>
            <option value="newest">Newest Created</option>
            <option value="budget">Highest Budget</option>
            <option value="progress">Highest Progress</option>
            <option value="title">Project Name</option>
          </select>

          {/* View Mode Toggle: Table / Grid / Kanban */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
            title="Refresh Projects List"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. Main Content: Table, Card Grid, or Kanban */}
      {isLoading ? (
        <CrmLoadingState rows={4} />
      ) : sortedProjects.length === 0 ? (
        <CrmEmptyState
          title={searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' ? 'No matching projects found' : 'No projects created yet'}
          description={
            searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all'
              ? 'Try clearing search filters or selecting all project stages.'
              : 'Launch your first creative video editing, 3D motion, or UI/UX project to begin tracking milestones and subcontractor tasks.'
          }
          action={
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
            >
              + Create First Project
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        <ProjectTableView
          projects={paginatedProjects}
          onSelectProject={(p) => setSelectedProjectForProfile(p)}
          onEditProject={handleEditProject}
          onRefresh={loadProjects}
        />
      ) : viewMode === 'grid' ? (
        <ProjectCardGrid
          projects={paginatedProjects}
          onSelectProject={(p) => setSelectedProjectForProfile(p)}
          onEditProject={handleEditProject}
        />
      ) : (
        <ProjectKanbanBoard
          projects={sortedProjects}
          onSelectProject={(p) => setSelectedProjectForProfile(p)}
          onRefresh={loadProjects}
        />
      )}

      {/* 5. Pagination (for Table & Grid views) */}
      {viewMode !== 'kanban' && sortedProjects.length > pageSize && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedProjects.length)} of{' '}
            {sortedProjects.length} projects
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 6. Add/Edit Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedProjectForEdit(null);
        }}
        onProjectSaved={(saved) => {
          loadProjects();
          setSelectedProjectForProfile(saved);
        }}
        initialProject={selectedProjectForEdit}
      />

      {/* 7. Project Profile Slide-over Drawer */}
      <ProjectProfileDrawer
        project={selectedProjectForProfile}
        isOpen={Boolean(selectedProjectForProfile)}
        onClose={() => setSelectedProjectForProfile(null)}
        onEditProject={handleEditProject}
        onNavigateToModule={onNavigateToModule}
      />
    </div>
  );
};
