import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      )}
      {actionText && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} icon={actionIcon} size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
