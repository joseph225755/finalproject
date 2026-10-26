import React, { useState, useEffect, useCallback } from 'react';
import { activityService } from '../services/activityService';
import { useToast } from '../context/ToastContext';
import { ActivityModal } from '../components/activities/ActivityModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonPage } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { getErrorMessage } from '../services/api';

export const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined
      };

      const res = await activityService.getActivities(params);
      if (res.success) {
        setActivities(res.activities || []);
        setTotalHours(res.totalHours || 0);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load activity logs.'));
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, statusFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleSaveActivity = async (data) => {
    setIsSubmitting(true);
    try {
      if (selectedActivity) {
        const res = await activityService.updateActivity(selectedActivity._id, data);
        toast.success('Activity log updated successfully!');
        setActivities((prev) =>
          prev.map((a) => (a._id === selectedActivity._id ? res.activity : a))
        );
      } else {
        const res = await activityService.createActivity(data);
        toast.success('Daily activity recorded successfully!');
        setActivities((prev) => [res.activity, ...prev]);
        setTotalHours((prev) => Number((prev + (res.activity.hoursSpent || 0)).toFixed(1)));
      }
      setIsModalOpen(false);
      setSelectedActivity(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save activity log.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (activity) => {
    setActivityToDelete(activity);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!activityToDelete) return;
    setIsDeleting(true);
    try {
      await activityService.deleteActivity(activityToDelete._id);
      toast.success('Activity log deleted successfully!');
      setActivities((prev) => prev.filter((a) => a._id !== activityToDelete._id));
      setTotalHours((prev) =>
        Math.max(0, Number((prev - (activityToDelete.hoursSpent || 0)).toFixed(1)))
      );
      setIsDeleteModalOpen(false);
      setActivityToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete activity log.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Activity Logs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain daily work documentation, learning points, hours, and mentor reviews
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-700">Total Logged:</span>
            <span className="text-xs font-black text-indigo-700">{totalHours} hrs</span>
          </div>

          <Button
            onClick={() => {
              setSelectedActivity(null);
              setIsModalOpen(true);
            }}
            icon={Plus}
            size="sm"
          >
            Record Daily Log
          </Button>
        </div>
      </div>

      {/* Filter and Date Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by work completed or skills learned..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 px-2.5 py-1.5 bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 px-2.5 py-1.5 bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 px-3 py-1.5 bg-white"
          >
            <option value="All">All Reviews</option>
            <option value="Submitted">Submitted</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Needs Revision">Needs Revision</option>
          </select>
        </div>
      </div>

      {/* Activities Timeline Cards */}
      {loading ? (
        <SkeletonPage />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Activity Logs Recorded"
          description={
            search || startDate || endDate
              ? 'No activity logs matched your filter criteria.'
              : 'Keep track of your daily accomplishments by creating your first work entry.'
          }
          actionText="Record Daily Activity"
          actionIcon={Plus}
          onAction={() => {
            setSelectedActivity(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {activities.map((act) => (
            <div
              key={act._id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    {formatDate(act.date)}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {act.hoursSpent} Hours
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      act.status === 'Reviewed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : act.status === 'Needs Revision'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Work Completed
                  </h4>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {act.workCompleted}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Skills & Tech Learned
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {act.skillsLearned.split(',').map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200/60"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {(act.challenges || act.nextSteps) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    {act.challenges && act.challenges !== 'None' && (
                      <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                        <span className="font-bold text-amber-800">Challenges:</span>
                        <p className="text-slate-700 mt-0.5">{act.challenges}</p>
                      </div>
                    )}
                    {act.nextSteps && (
                      <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                        <span className="font-bold text-indigo-800">Next Steps:</span>
                        <p className="text-slate-700 mt-0.5">{act.nextSteps}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Mentor / Supervisor Feedback */}
                {act.mentorFeedback && (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-900">Mentor Feedback:</span>
                      <p className="text-emerald-800 mt-0.5 leading-relaxed">{act.mentorFeedback}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start pt-2 md:pt-0">
                <button
                  onClick={() => {
                    setSelectedActivity(act);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  title="Edit Log"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(act)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedActivity(null);
        }}
        onSave={handleSaveActivity}
        activity={selectedActivity}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActivityToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Activity Log"
        message="Are you sure you want to permanently delete this daily work log? Logged hours will be deducted from your total."
        confirmText="Delete Log"
        isLoading={isDeleting}
      />
    </div>
  );
};
