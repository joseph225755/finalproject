import React from 'react';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { Button } from '../common/Button';

export const TaskKanban = ({ tasks = [], onEdit, onDelete, onStatusChange, onAddNew }) => {
  const columns = [
    { id: 'To Do', title: 'To Do', color: 'border-slate-300', countBadge: 'bg-slate-100 text-slate-700' },
    { id: 'In Progress', title: 'In Progress', color: 'border-indigo-400', countBadge: 'bg-indigo-50 text-indigo-700' },
    { id: 'Completed', title: 'Completed', color: 'border-emerald-400', countBadge: 'bg-emerald-50 text-emerald-700' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="bg-slate-100/60 rounded-2xl p-4 border border-slate-200/80 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{col.title}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.countBadge}`}>
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddNew(col.id)}
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Content */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-center p-4">
                  <p className="text-xs text-slate-400">No tasks in {col.title}</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
