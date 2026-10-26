import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const ActivityModal = ({
  isOpen,
  onClose,
  onSave,
  activity = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursSpent: '6.0',
    workCompleted: '',
    skillsLearned: '',
    challenges: '',
    nextSteps: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activity) {
      setFormData({
        date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : '',
        hoursSpent: activity.hoursSpent !== undefined ? String(activity.hoursSpent) : '6.0',
        workCompleted: activity.workCompleted || '',
        skillsLearned: activity.skillsLearned || '',
        challenges: activity.challenges || '',
        nextSteps: activity.nextSteps || ''
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        hoursSpent: '6.0',
        workCompleted: '',
        skillsLearned: '',
        challenges: '',
        nextSteps: ''
      });
    }
    setErrors({});
  }, [activity, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.workCompleted.trim()) {
      newErrors.workCompleted = 'Work completed description is required';
    }
    if (!formData.skillsLearned.trim()) {
      newErrors.skillsLearned = 'Skills or technologies learned is required';
    }
    const hours = parseFloat(formData.hoursSpent);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      newErrors.hoursSpent = 'Hours spent must be between 0.25 and 24';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      hoursSpent: hours
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Daily Activity Log' : 'Record Daily Work Activity'}
      subtitle="Document your daily tasks, learning outcomes, and technical challenges"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Activity Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <Input
            label="Hours Spent"
            type="number"
            step="0.5"
            min="0.25"
            max="24"
            name="hoursSpent"
            value={formData.hoursSpent}
            onChange={handleChange}
            error={errors.hoursSpent}
            placeholder="e.g. 7.5"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Work Completed <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="workCompleted"
            rows="3"
            value={formData.workCompleted}
            onChange={handleChange}
            placeholder="Describe the tasks, features, or modules worked on today..."
            className={`w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 placeholder-slate-400 ${
              errors.workCompleted
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
            }`}
          />
          {errors.workCompleted && (
            <p className="mt-1 text-xs text-rose-500">{errors.workCompleted}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Skills & Technologies Learned <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="skillsLearned"
            value={formData.skillsLearned}
            onChange={handleChange}
            placeholder="e.g. Express middleware, JWT tokens, MongoDB indexing"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 placeholder-slate-400 ${
              errors.skillsLearned
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
            }`}
          />
          {errors.skillsLearned && (
            <p className="mt-1 text-xs text-rose-500">{errors.skillsLearned}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Challenges Encountered
            </label>
            <textarea
              name="challenges"
              rows="2"
              value={formData.challenges}
              onChange={handleChange}
              placeholder="Any bugs, blockers or technical obstacles..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Next Steps / Plan
            </label>
            <textarea
              name="nextSteps"
              rows="2"
              value={formData.nextSteps}
              onChange={handleChange}
              placeholder="What do you plan to tackle next tomorrow?..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {activity ? 'Update Log' : 'Save Daily Log'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
