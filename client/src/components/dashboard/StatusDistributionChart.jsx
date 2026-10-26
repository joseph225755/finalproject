import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const StatusDistributionChart = ({ data = [] }) => {
  const COLORS = ['#94a3b8', '#38bdf8', '#10b981'];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-base">Task Status Breakdown</h3>
        <p className="text-xs text-slate-500 mt-0.5">Distribution across To Do, In Progress, & Completed</p>
      </div>

      <div className="h-64 w-full">
        {total === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <p>No tasks created yet.</p>
            <p className="mt-1 text-teal-600 font-medium">Add tasks to visualize status balance.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
