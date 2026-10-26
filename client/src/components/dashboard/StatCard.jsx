import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorSchemes = {
    indigo: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600',
      text: 'text-indigo-600'
    },
    teal: {
      bg: 'bg-teal-50/70',
      border: 'border-teal-100',
      iconBg: 'bg-teal-600',
      text: 'text-teal-600'
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500',
      text: 'text-amber-600'
    },
    rose: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-100',
      iconBg: 'bg-rose-600',
      text: 'text-rose-600'
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600',
      text: 'text-emerald-600'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${scheme.iconBg} text-white shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
