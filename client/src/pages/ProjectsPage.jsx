import React, { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import { useToast } from '../context/ToastContext';
import { ProjectModal } from '../components/projects/ProjectModal';
import { MilestoneModal } from '../components/projects/MilestoneModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonPage } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import {
  FolderGit2,
  Plus,
  Github,
  Globe,
  Calendar,
  Layers,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals for Project
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  // Modals for Milestone
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);

  // Delete Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, item: null, projectId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects();
      if (res.success) {
        setProjects(res.projects || []);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load projects.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Project Handlers
  const handleSaveProject = async (data) => {
    setIsSubmittingProject(true);
    try {
      if (selectedProject) {
        const res = await projectService.updateProject(selectedProject._id, data);
        toast.success('Project updated successfully!');
        setProjects((prev) =>
          prev.map((p) => (p._id === selectedProject._id ? { ...p, ...res.project } : p))
        );
      } else {
        const res = await projectService.createProject(data);
        toast.success('Project created successfully!');
        setProjects((prev) => [res.project, ...prev]);
      }
      setIsProjectModalOpen(false);
      setSelectedProject(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save project.'));
    } finally {
      setIsSubmittingProject(false);
    }
  };

  // Milestone Handlers
  const handleOpenAddMilestone = (projectId) => {
    setTargetProjectId(projectId);
    setSelectedMilestone(null);
    setIsMilestoneModalOpen(true);
  };

  const handleOpenEditMilestone = (projectId, milestone) => {
    setTargetProjectId(projectId);
    setSelectedMilestone(milestone);
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = async (data) => {
    setIsSubmittingMilestone(true);
    try {
      if (selectedMilestone) {
        await projectService.updateMilestone(selectedMilestone._id, data);
        toast.success('Milestone updated successfully!');
      } else {
        await projectService.createMilestone(targetProjectId, data);
        toast.success('Milestone added to project!');
      }
      setIsMilestoneModalOpen(false);
      setSelectedMilestone(null);
      fetchProjects(); // Refresh to recalculate progress percentages
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save milestone.'));
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  // Deletion confirmation
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'project') {
        await projectService.deleteProject(deleteTarget.item._id);
        toast.success('Project deleted successfully!');
        setProjects((prev) => prev.filter((p) => p._id !== deleteTarget.item._id));
      } else if (deleteTarget.type === 'milestone') {
        await projectService.deleteMilestone(deleteTarget.item._id);
        toast.success('Milestone deleted successfully!');
        fetchProjects();
      }
      setIsDeleteModalOpen(false);
      setDeleteTarget({ type: null, item: null, projectId: null });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete item.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Projects & Milestones
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track full-stack applications, development sprints, repository links, and target completion
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedProject(null);
            setIsProjectModalOpen(true);
          }}
          icon={Plus}
          size="sm"
        >
          New Project
        </Button>
      </div>

      {loading ? (
        <SkeletonPage />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No Projects Created"
          description="Track your software deliverables and full-stack modules by creating your first project."
          actionText="Create New Project"
          actionIcon={Plus}
          onAction={() => {
            setSelectedProject(null);
            setIsProjectModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
            >
              {/* Project Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{project.title}</h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        project.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-3xl">
                      {project.description}
                    </p>
                  )}

                  {/* Tech stack badges */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border border-slate-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Actions & External Links */}
                <div className="flex items-center gap-2">
                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                      title="GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors border border-indigo-200"
                      title="Live Deployment"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsProjectModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit Project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setDeleteTarget({ type: 'project', item: project });
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Overall Project Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-600">Overall Milestone Progress</span>
                  <span className="text-indigo-600 font-bold">{project.overallProgress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${project.overallProgress || 0}%` }}
                  />
                </div>
              </div>

              {/* Milestones Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Milestones ({project.milestones?.length || 0})
                  </h4>
                  <Button
                    onClick={() => handleOpenAddMilestone(project._id)}
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    className="text-indigo-600 hover:bg-indigo-50"
                  >
                    Add Milestone
                  </Button>
                </div>

                {project.milestones && project.milestones.length > 0 ? (
                  <div className="space-y-2.5">
                    {project.milestones.map((m) => (
                      <div
                        key={m._id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{m.title}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                m.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>
                          {m.description && (
                            <p className="text-slate-500 mt-1">{m.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Target: {new Date(m.targetDate).toLocaleDateString()}
                            </span>
                            <span>&bull;</span>
                            <span className="font-semibold text-indigo-600">
                              {m.completionPercentage}% complete
                            </span>
                          </div>
                        </div>

                        {/* Actions for Milestone */}
                        <div className="flex items-center gap-1 self-end sm:self-center">
                          <button
                            onClick={() => handleOpenEditMilestone(project._id, m)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                            title="Edit Milestone"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget({ type: 'milestone', item: m, projectId: project._id });
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No milestones added to this project yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProject(null);
        }}
        onSave={handleSaveProject}
        project={selectedProject}
        isLoading={isSubmittingProject}
      />

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => {
          setIsMilestoneModalOpen(false);
          setSelectedMilestone(null);
        }}
        onSave={handleSaveMilestone}
        milestone={selectedMilestone}
        isLoading={isSubmittingMilestone}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget({ type: null, item: null, projectId: null });
        }}
        onConfirm={handleConfirmDelete}
        title={deleteTarget.type === 'project' ? 'Delete Project' : 'Delete Milestone'}
        message={`Are you sure you want to permanently delete "${deleteTarget.item?.title}"? ${
          deleteTarget.type === 'project'
            ? 'All associated milestones will also be removed.'
            : ''
        }`}
        confirmText="Confirm Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
