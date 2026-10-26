import React from 'react';
import { Clock, BookOpen, CheckCircle } from 'lucide-react';

export const ActivityTimeline = ({ activities = [] }) => {
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-base">Recent Work Activity</h3>
        <p className="text-xs text-slate-500 mt-0.5">Latest chronological submissions and log updates</p>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No work logs recorded yet. Start logging your daily tasks and skills learned!
          </p>
        ) : (
          <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
            {activities.map((act) => (
              <div key={act._id} className="relative group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-indigo-50 border-2 border-indigo-500 flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-3 h-3" />
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 group-hover:border-slate-200 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900">
                      {formatDate(act.date)}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {act.hoursSpent} hrs
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed line-clamp-2">
                    {act.workCompleted}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      Skills: {act.skillsLearned}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
