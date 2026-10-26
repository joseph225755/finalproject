import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const ProductivityChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Weekly Productivity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Hours logged per day over the last 7 days</p>
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 || data.every((d) => d.hours === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <p>No activity hours recorded for this period yet.</p>
            <p className="mt-1 text-indigo-500 font-medium">Log your daily work to see productivity trends.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}
                formatter={(val) => [`${val} hours`, 'Hours Logged']}
              />
              <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
