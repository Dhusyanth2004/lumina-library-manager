import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`} />
);

export const BookCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col h-full">
    <div className="flex p-4 gap-4 flex-1">
      <Skeleton className="w-28 h-40 flex-shrink-0 rounded-2xl" />
      <div className="flex-1 flex flex-col space-y-3 pt-2">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-24 h-4" />
        <div className="mt-auto space-y-2">
           <Skeleton className="w-full h-1.5" />
           <Skeleton className="w-12 h-3" />
        </div>
      </div>
    </div>
    <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex gap-2">
      <Skeleton className="h-9 flex-1 rounded-lg" />
      <Skeleton className="h-9 flex-1 rounded-lg" />
      <Skeleton className="w-9 h-9 rounded-lg" />
    </div>
  </div>
);

export const StatsSkeleton: React.FC = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700">
                <Skeleton className="w-8 h-8 rounded-xl mb-3" />
                <Skeleton className="w-20 h-8 mb-1" />
                <Skeleton className="w-12 h-3" />
            </div>
        ))}
    </div>
);
