import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading LearnFlow...',
  fullScreen = false,
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size] || 'w-8 h-8';

  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className={`${sizeClasses} text-accent animate-spin`} />
      {message && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
