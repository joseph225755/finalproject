import React from 'react';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Calendar, Edit3, Trash2, Tag } from 'lucide-react';

export const TaskList = ({ tasks = [], onEdit, onDelete, onStatusChange }) => {
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Title</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-slate-900 text-sm">{task.title}</p>
                  {task.description && (
                    <p className="text-slate-500 line-clamp-1 mt-0.5">{task.description}</p>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="py-3.5 px-4">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task._id, e.target.value)}
                    className="text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 py-1 px-2 border-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(task.dueDate)}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-medium">
                    {task.category || 'General'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
