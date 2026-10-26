import React from 'react';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Calendar, Tag, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formattedDueDate = formatDate(task.dueDate);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <PriorityBadge priority={task.priority} />
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h4 className="font-bold text-slate-900 text-sm leading-snug">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          {formattedDueDate ? (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formattedDueDate}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">No date</span>
          )}
        </div>

        {/* Quick status dropdown selector */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 py-1 px-2 border-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
};
