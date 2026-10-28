import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-ink-200/60 ${className}`} />;
}

function SkeletonBlock() {
  return (
    <div className="w-full space-y-6 p-2" data-testid="loading-skeleton">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-2/3 max-w-md" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}

export default function LoadingSpinner({ message = 'Loading…', fullScreen = false, size }) {
  if (size === 'sm') {
    return <span className="inline-block w-4 h-4 rounded-full border-2 border-ink-300 border-t-terra-600 animate-spin" aria-label={message} />;
  }
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-paper/90">
        <span className="w-8 h-8 rounded-full border-2 border-ink-300 border-t-terra-600 animate-spin" />
        <p className="font-serif italic text-ink-500">{message}</p>
      </div>
    );
  }
  return <SkeletonBlock />;
}
