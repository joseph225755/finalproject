import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const MilestoneModal = ({
  isOpen,
  onClose,
  onSave,
  milestone = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    completionPercentage: 0,
    status: 'Pending',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (milestone) {
      setFormData({
        title: milestone.title || '',
        description: milestone.description || '',
        targetDate: milestone.targetDate
          ? new Date(milestone.targetDate).toISOString().split('T')[0]
          : '',
        completionPercentage: milestone.completionPercentage || 0,
        status: milestone.status || 'Pending',
        notes: milestone.notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        targetDate: '',
        completionPercentage: 0,
        status: 'Pending',
        notes: ''
      });
    }
    setErrors({});
  }, [milestone, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-synchronize status if percentage is 100
      if (name === 'completionPercentage') {
        const num = Number(value);
        if (num === 100) updated.status = 'Completed';
        else if (num > 0) updated.status = 'In Progress';
        else updated.status = 'Pending';
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Milestone title is required';
    if (!formData.targetDate) newErrors.targetDate = 'Target date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      completionPercentage: Number(formData.completionPercentage)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={milestone ? 'Edit Project Milestone' : 'Add Project Milestone'}
      subtitle="Break down your project roadmap into measurable milestones"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Milestone Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g., API Schema & Auth Implementation"
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            placeholder="What deliverables constitute completing this milestone?..."
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
          />
        </div>

        <Input
          label="Target Completion Date"
          type="date"
          name="targetDate"
          value={formData.targetDate}
          onChange={handleChange}
          error={errors.targetDate}
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Completion Progress
            </label>
            <span className="text-xs font-bold text-indigo-600">
              {formData.completionPercentage}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            name="completionPercentage"
            value={formData.completionPercentage}
            onChange={handleChange}
            className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
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
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes & Review Comments
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Awaiting pull request review"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {milestone ? 'Update Milestone' : 'Save Milestone'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
