import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const ProjectModal = ({ isOpen, onClose, onSave, project = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    startDate: '',
    targetCompletionDate: '',
    status: 'In Progress',
    repositoryUrl: '',
    liveUrl: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        targetCompletionDate: project.targetCompletionDate
          ? new Date(project.targetCompletionDate).toISOString().split('T')[0]
          : '',
        status: project.status || 'In Progress',
        repositoryUrl: project.repositoryUrl || '',
        liveUrl: project.liveUrl || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        techStack: '',
        startDate: new Date().toISOString().split('T')[0],
        targetCompletionDate: '',
        status: 'In Progress',
        repositoryUrl: '',
        liveUrl: ''
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrors({ title: 'Project title is required' });
      return;
    }

    onSave({
      ...formData,
      techStack: formData.techStack
        ? formData.techStack.split(',').map((t) => t.trim()).filter(Boolean)
        : []
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create New Project'}
      subtitle="Track full-stack applications, repositories, and technical deliverables"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g., Enterprise Telemetry Portal"
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Project Description
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="High-level overview, objectives, and problem solved..."
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
          />
        </div>

        <Input
          label="Technology Stack (Comma Separated)"
          name="techStack"
          value={formData.techStack}
          onChange={handleChange}
          placeholder="e.g. React, Node.js, Express, MongoDB, Tailwind"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />

          <Input
            label="Target Completion Date"
            type="date"
            name="targetCompletionDate"
            value={formData.targetCompletionDate}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Repository URL (GitHub)"
            type="url"
            name="repositoryUrl"
            value={formData.repositoryUrl}
            onChange={handleChange}
            placeholder="https://github.com/org/repo"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        <Input
          label="Live Demo URL"
          type="url"
          name="liveUrl"
          value={formData.liveUrl}
          onChange={handleChange}
          placeholder="https://app-demo.onrender.com"
        />

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
