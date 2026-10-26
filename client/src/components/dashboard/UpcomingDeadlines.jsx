import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export const UpcomingDeadlines = ({ tasks = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysRemaining = (dateString) => {
    if (!dateString) return null;
    const diffTime = new Date(dateString).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Upcoming Deadlines</h3>
          <p className="text-xs text-slate-500 mt-0.5">Tasks due in the next 7 days</p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No upcoming deadlines within the next 7 days.
          </p>
        ) : (
          tasks.map((task) => {
            const daysRemaining = getDaysRemaining(task.dueDate);
            const isUrgent = daysRemaining?.includes('today') || daysRemaining?.includes('overdue');

            return (
              <div
                key={task._id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <p className="text-xs font-semibold text-slate-900 truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(task.dueDate)}
                    </span>
                    <span>&bull;</span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                    isUrgent ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {daysRemaining}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
