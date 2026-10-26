import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    // Priority
    high: 'bg-rose-50 text-rose-700 border-rose-200/80',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/80',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',

    // Status
    todo: 'bg-slate-100 text-slate-700 border-slate-200',
    inProgress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    completed: 'bg-teal-50 text-teal-700 border-teal-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    reviewed: 'bg-emerald-50 text-emerald-700 border-emerald-200',

    // General
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[11px] font-medium',
    sm: 'px-2.5 py-1 text-xs font-semibold',
    md: 'px-3 py-1.5 text-sm font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium ${variants[variant] || variants.default} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const p = (priority || 'medium').toLowerCase();
  return (
    <Badge variant={p === 'high' ? 'high' : p === 'low' ? 'low' : 'medium'}>
      {priority || 'Medium'}
    </Badge>
  );
};

export const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  let variant = 'default';

  if (s.includes('progress')) variant = 'inProgress';
  else if (s.includes('complete')) variant = 'completed';
  else if (s.includes('todo') || s.includes('to do')) variant = 'todo';
  else if (s.includes('pending')) variant = 'pending';
  else if (s.includes('review')) variant = 'reviewed';
  else if (s.includes('submit')) variant = 'submitted';

  return <Badge variant={variant}>{status || 'Status'}</Badge>;
};
