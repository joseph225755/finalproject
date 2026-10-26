import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`} />;
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
};

export const SkeletonPage = () => {
  return (
    <div className="space-y-6 w-full p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 h-80 border border-slate-100 shadow-sm">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl p-6 h-80 border border-slate-100 shadow-sm">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};
