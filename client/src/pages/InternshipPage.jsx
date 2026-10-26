import React, { useState, useEffect } from 'react';
import { internshipService } from '../services/internshipService';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { SkeletonPage } from '../components/common/Skeleton';
import {
  Briefcase,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Save,
  CheckCircle2
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export const InternshipPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    supervisorName: '',
    supervisorEmail: '',
    supervisorPhone: '',
    department: '',
    location: 'Remote',
    stipend: 'Unpaid',
    startDate: '',
    endDate: '',
    status: 'In Progress',
    description: '',
    objectives: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [internshipId, setInternshipId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const res = await internshipService.getMyInternship();
        if (res.internship) {
          setInternshipId(res.internship._id);
          setFormData({
            title: res.internship.title || '',
            company: res.internship.company || '',
            supervisorName: res.internship.supervisorName || '',
            supervisorEmail: res.internship.supervisorEmail || '',
            supervisorPhone: res.internship.supervisorPhone || '',
            department: res.internship.department || '',
            location: res.internship.location || 'Remote',
            stipend: res.internship.stipend || 'Unpaid',
            startDate: res.internship.startDate
              ? new Date(res.internship.startDate).toISOString().split('T')[0]
              : '',
            endDate: res.internship.endDate
              ? new Date(res.internship.endDate).toISOString().split('T')[0]
              : '',
            status: res.internship.status || 'In Progress',
            description: res.internship.description || '',
            objectives: res.internship.objectives || ''
          });
        }
      } catch (err) {
        toast.error('Failed to load internship details');
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.company.trim() || !formData.supervisorName.trim()) {
      toast.warning('Please provide position title, organization, and mentor name.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.warning('Please select both start and end dates.');
      return;
    }

    setSaving(true);
    try {
      const res = await internshipService.saveInternship(formData);
      toast.success('Internship details saved successfully!');
      if (res.internship) {
        setInternshipId(res.internship._id);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save internship record.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonPage />;
  }

  // Calculate duration and completion
  let durationText = 'Not specified';
  let progressPercentage = 0;
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate).getTime();
    const end = new Date(formData.endDate).getTime();
    const now = new Date().getTime();
    const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(0, Math.round((now - start) / (1000 * 60 * 60 * 24)));

    durationText = `${totalDays} days (${Math.round(totalDays / 7)} weeks)`;
    if (now >= end) progressPercentage = 100;
    else if (now > start) {
      progressPercentage = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Internship Profile</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your active placement record, mentor details, and educational objectives
          </p>
        </div>
      </div>

      {/* Progress & Duration Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Internship Duration & Timeline
            </span>
            <h4 className="text-lg font-bold text-slate-900 mt-1">
              {formData.title || 'Position Title'} @ {formData.company || 'Company'}
            </h4>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-indigo-600">{progressPercentage}%</span>
            <p className="text-xs text-slate-500">Duration: {durationText}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Details Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            1. Placement & Organization Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Position / Role Title"
              name="title"
              icon={Briefcase}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Full Stack Developer Intern"
              required
            />

            <Input
              label="Organization / Company Name"
              name="company"
              icon={Building}
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. TechNova Solutions Inc."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Department / Unit"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Cloud Engineering"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Mode
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <Input
              label="Stipend / Compensation"
              name="stipend"
              icon={DollarSign}
              value={formData.stipend}
              onChange={handleChange}
              placeholder="e.g. $2,000 / month or Unpaid"
            />
          </div>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 pt-4">
            2. Mentor & Supervisor Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Mentor / Supervisor Name"
              name="supervisorName"
              icon={User}
              value={formData.supervisorName}
              onChange={handleChange}
              placeholder="e.g. David Vance"
              required
            />

            <Input
              label="Supervisor Email"
              name="supervisorEmail"
              type="email"
              icon={Mail}
              value={formData.supervisorEmail}
              onChange={handleChange}
              placeholder="d.vance@company.com"
            />

            <Input
              label="Supervisor Phone"
              name="supervisorPhone"
              icon={Phone}
              value={formData.supervisorPhone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 pt-4">
            3. Internship Timeline & Objectives
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              name="startDate"
              icon={Calendar}
              value={formData.startDate}
              onChange={handleChange}
              required
            />

            <Input
              label="Expected End Date"
              type="date"
              name="endDate"
              icon={Calendar}
              value={formData.endDate}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Description & Key Responsibilities
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline the responsibilities and scope of your internship..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Educational Learning Objectives
            </label>
            <textarea
              name="objectives"
              rows="3"
              value={formData.objectives}
              onChange={handleChange}
              placeholder="e.g. 1. Master React components and state management&#10;2. Architect secure REST APIs with Node.js and Express&#10;3. Gain experience in MongoDB schema modeling and indexing"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" isLoading={saving} icon={Save} size="md">
              Save Internship Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
