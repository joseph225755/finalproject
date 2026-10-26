import React, { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useToast } from '../context/ToastContext';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskKanban } from '../components/tasks/TaskKanban';
import { TaskList } from '../components/tasks/TaskList';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonPage } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // In Kanban view, fetch all tasks for smooth column distribution
      const params = {
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
        page: viewMode === 'kanban' ? 1 : page,
        limit: viewMode === 'kanban' ? 100 : 15,
        all: viewMode === 'kanban' ? 'true' : 'false'
      };

      const res = await taskService.getTasks(params);
      if (res.success) {
        setTasks(res.tasks || []);
        setTotalPages(res.totalPages || 1);
        setTotalTasks(res.total || res.count || 0);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to fetch tasks.'));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, page, viewMode]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle Save (Create or Edit)
  const handleSaveTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      if (selectedTask) {
        const res = await taskService.updateTask(selectedTask._id, taskData);
        toast.success('Task updated successfully!');
        // Immediate UI state update
        setTasks((prev) =>
          prev.map((t) => (t._id === selectedTask._id ? res.task : t))
        );
      } else {
        const res = await taskService.createTask(taskData);
        toast.success('Task created successfully!');
        setTasks((prev) => [res.task, ...prev]);
        setTotalTasks((prev) => prev + 1);
      }
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save task.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Change (Kanban or dropdown)
  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await taskService.updateTask(taskId, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      setTasks(previousTasks); // Revert
      toast.error('Failed to update task status');
    }
  };

  // Handle Delete Confirmation
  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(taskToDelete._id);
      toast.success('Task deleted successfully!');
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      setTotalTasks((prev) => Math.max(0, prev - 1));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete task.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const openNewTaskModal = (defaultStatus = 'To Do') => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Task Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize, prioritize, and track all internship assignments and project deliverables
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <Button onClick={() => openNewTaskModal()} icon={Plus} size="sm">
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search tasks by title, category, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks View: Kanban or Table List */}
      {loading ? (
        <SkeletonPage />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Tasks Found"
          description={
            search || statusFilter !== 'All' || priorityFilter !== 'All'
              ? 'Try adjusting your search query or filters to find tasks.'
              : 'You have not added any tasks yet. Create your first task to start organizing your work.'
          }
          actionText="Create New Task"
          actionIcon={Plus}
          onAction={() => openNewTaskModal()}
        />
      ) : viewMode === 'kanban' ? (
        <TaskKanban
          tasks={tasks}
          onEdit={openEditTaskModal}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
          onAddNew={(colStatus) => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
        />
      ) : (
        <>
          <TaskList
            tasks={tasks}
            onEdit={openEditTaskModal}
            onDelete={handleDeleteClick}
            onStatusChange={handleStatusChange}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-xs">
              <span className="text-slate-500">
                Page {page} of {totalPages} ({totalTasks} total tasks)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        task={selectedTask}
        isLoading={isSubmitting}
      />

      {/* Task Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"?`}
        confirmText="Delete Task"
        isLoading={isDeleting}
      />
    </div>
  );
};
