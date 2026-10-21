import React from 'react';
import { BookOpen, AlertCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = BookOpen,
  title = 'No items found',
  description = 'There are currently no records available in this section.',
  actionLabel,
  actionLink,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-accent-50 dark:bg-accent-950/40 text-accent flex items-center justify-center mb-4 ring-8 ring-accent-50/50 dark:ring-accent-900/20">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>

      {actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-accent hover:bg-accent-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Link>
      )}

      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-accent hover:bg-accent-600 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
