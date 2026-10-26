import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import { StatCard } from '../components/dashboard/StatCard';
import { SkeletonPage } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  Shield,
  Users,
  Briefcase,
  CheckSquare,
  Clock,
  Eye,
  CheckCircle,
  MessageSquare,
  Edit,
  Building,
  UserCheck
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student Dossier Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Assign Internship Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignStudentId, setAssignStudentId] = useState(null);
  const [assignForm, setAssignForm] = useState({
    title: '',
    company: '',
    supervisorName: '',
    supervisorEmail: '',
    startDate: '',
    endDate: '',
    status: 'In Progress'
  });
  const [isAssigning, setIsAssigning] = useState(false);

  // Moderation Modal for Log
  const [isModeratingModalOpen, setIsModeratingModalOpen] = useState(false);
  const [moderatingLog, setModeratingLog] = useState(null);
  const [moderationForm, setModerationForm] = useState({
    status: 'Reviewed',
    mentorFeedback: ''
  });
  const [isModerating, setIsModerating] = useState(false);

  const toast = useToast();

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllStudents()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (studentsRes.success) setStudents(studentsRes.students || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load administrator data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // View Student Dossier
  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setLoadingDossier(true);
    try {
      const res = await adminService.getStudentDossier(student._id);
      if (res.success) {
        setDossier(res);
      }
    } catch (err) {
      toast.error('Failed to load student details');
    } finally {
      setLoadingDossier(false);
    }
  };

  // Open Assign Internship Modal
  const handleOpenAssign = (student) => {
    setAssignStudentId(student._id);
    const existing = student.internship;
    setAssignForm({
      title: existing?.title || 'Full Stack Engineering Intern',
      company: existing?.company || '',
      supervisorName: existing?.supervisorName || '',
      supervisorEmail: existing?.supervisorEmail || '',
      startDate: existing?.startDate ? new Date(existing.startDate).toISOString().split('T')[0] : '',
      endDate: existing?.endDate ? new Date(existing.endDate).toISOString().split('T')[0] : '',
      status: existing?.status || 'In Progress'
    });
    setIsAssignModalOpen(true);
  };

  const handleSaveInternshipAssignment = async (e) => {
    e.preventDefault();
    setIsAssigning(true);
    try {
      await adminService.assignInternship(assignStudentId, assignForm);
      toast.success('Student internship successfully updated!');
      setIsAssignModalOpen(false);
      loadAdminData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to assign internship.'));
    } finally {
      setIsAssigning(false);
    }
  };

  // Moderate Activity Log
  const handleOpenModerateLog = (log) => {
    setModeratingLog(log);
    setModerationForm({
      status: log.status || 'Reviewed',
      mentorFeedback: log.mentorFeedback || 'Approved. Work aligns with curriculum objectives.'
    });
    setIsModeratingModalOpen(true);
  };

  const handleSaveModeration = async (e) => {
    e.preventDefault();
    if (!moderatingLog) return;
    setIsModerating(true);
    try {
      await adminService.moderateActivity(moderatingLog._id, moderationForm);
      toast.success('Activity log status and feedback updated!');
      setIsModeratingModalOpen(false);
      // Refresh dossier
      if (selectedStudent) {
        const res = await adminService.getStudentDossier(selectedStudent._id);
        if (res.success) setDossier(res);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to moderate log.'));
    } finally {
      setIsModerating(false);
    }
  };

  if (loading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2 border border-rose-100">
            <Shield className="w-3.5 h-3.5" />
            <span>Academic Supervision Portal</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrator Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            System-wide analytics, registered student portfolios, placement assignments, and log moderation
          </p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled interns"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Active Placements"
          value={stats?.activeInternships || 0}
          subtitle={`${stats?.completedInternships || 0} completed`}
          icon={Briefcase}
          color="teal"
        />
        <StatCard
          title="System Tasks"
          value={stats?.totalTasks || 0}
          subtitle={`${stats?.taskCompletionRate || 0}% completed rate`}
          icon={CheckSquare}
          color="emerald"
        />
        <StatCard
          title="Total Logged Hours"
          value={`${stats?.totalLoggedHours || 0} hrs`}
          subtitle="Across all student logs"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Students Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Registered Students Roster</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and manage internship status for all college student candidates
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
            {students.length} Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Internship Placement</th>
                <th className="py-3.5 px-4">Supervisor</th>
                <th className="py-3.5 px-4">Tasks</th>
                <th className="py-3.5 px-4">Logs</th>
                <th className="py-3.5 px-4">Placement Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => (
                <tr key={st._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{st.name}</p>
                    <p className="text-[11px] text-slate-500">{st.email}</p>
                    {st.studentId && (
                      <span className="text-[10px] text-indigo-600 font-semibold">
                        ID: {st.studentId}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {st.internship ? (
                      <div>
                        <p className="font-semibold text-slate-800">{st.internship.company}</p>
                        <p className="text-[11px] text-slate-500">{st.internship.title}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not Assigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {st.internship?.supervisorName ? (
                      <div>
                        <p className="font-medium text-slate-800">{st.internship.supervisorName}</p>
                        <p className="text-[11px] text-slate-400">{st.internship.supervisorEmail}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {st.completedTaskCount} / {st.taskCount}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-700">
                    {st.activityCount} entries
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        st.internship?.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.internship?.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {st.internship?.status || 'No Placement'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewStudent(st)}
                        icon={Eye}
                      >
                        Dossier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAssign(st)}
                        icon={Edit}
                      >
                        Assign
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`Student Dossier: ${selectedStudent?.name}`}
        subtitle={`Evaluation view for ${selectedStudent?.email}`}
        maxWidth="max-w-3xl"
      >
        {loadingDossier ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading student dossier...</div>
        ) : dossier ? (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Academic Info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">College:</span>
                <span className="font-bold">{dossier.student?.college || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Department:</span>
                <span className="font-bold">{dossier.student?.department || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Tasks:</span>
                <span className="font-bold text-indigo-700">
                  {dossier.tasks?.filter((t) => t.status === 'Completed').length} / {dossier.tasks?.length}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Projects:</span>
                <span className="font-bold text-teal-700">{dossier.projects?.length || 0}</span>
              </div>
            </div>

            {/* Submitted Activities & Moderation */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-2 mb-3">
                Daily Activity Logs & Mentor Moderation ({dossier.activities?.length || 0})
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {dossier.activities?.length === 0 ? (
                  <p className="text-slate-400 italic">No activity logs recorded yet.</p>
                ) : (
                  dossier.activities.map((act) => (
                    <div
                      key={act._id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {new Date(act.date).toLocaleDateString()}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                            {act.hoursSpent} hrs
                          </span>
                          <span className="text-slate-500 font-semibold">[{act.status}]</span>
                        </div>
                        <p className="text-slate-700 mt-1 leading-relaxed">{act.workCompleted}</p>
                        {act.mentorFeedback && (
                          <p className="text-emerald-700 mt-1 italic">
                            Mentor Feedback: {act.mentorFeedback}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModerateLog(act)}
                        icon={MessageSquare}
                      >
                        Moderate
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Moderation Form Modal */}
      <Modal
        isOpen={isModeratingModalOpen}
        onClose={() => setIsModeratingModalOpen(false)}
        title="Moderate Activity Log"
        subtitle="Approve or provide mentor guidance for this submission"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveModeration} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Review Status
            </label>
            <select
              value={moderationForm.status}
              onChange={(e) => setModerationForm({ ...moderationForm, status: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              <option value="Reviewed">Reviewed & Approved</option>
              <option value="Needs Revision">Needs Revision</option>
              <option value="Submitted">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Supervisor / Mentor Feedback
            </label>
            <textarea
              rows="3"
              value={moderationForm.mentorFeedback}
              onChange={(e) =>
                setModerationForm({ ...moderationForm, mentorFeedback: e.target.value })
              }
              placeholder="e.g. Excellent progress on REST API validation. Approved."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModeratingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isModerating}>
              Save Moderation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Internship Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign / Manage Student Internship"
        subtitle="Configure organization, mentor, and period"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveInternshipAssignment} className="space-y-4">
          <Input
            label="Position Title"
            value={assignForm.title}
            onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
            required
          />

          <Input
            label="Company / Organization"
            value={assignForm.company}
            onChange={(e) => setAssignForm({ ...assignForm, company: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Supervisor Name"
              value={assignForm.supervisorName}
              onChange={(e) => setAssignForm({ ...assignForm, supervisorName: e.target.value })}
              required
            />

            <Input
              label="Supervisor Email"
              type="email"
              value={assignForm.supervisorEmail}
              onChange={(e) => setAssignForm({ ...assignForm, supervisorEmail: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={assignForm.startDate}
              onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
              required
            />

            <Input
              label="End Date"
              type="date"
              value={assignForm.endDate}
              onChange={(e) => setAssignForm({ ...assignForm, endDate: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isAssigning}>
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
