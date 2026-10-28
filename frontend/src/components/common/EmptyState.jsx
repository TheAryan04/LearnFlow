import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = BookOpen,
  title = 'Nothing here yet',
  description = 'When something is added, it will appear on this page.',
  actionLabel,
  actionLink,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-start p-8 sm:p-10 rounded-xl border border-dashed border-ink-300 bg-surface/40 ${className}`} data-testid="empty-state">
      <div className="w-11 h-11 rounded-full border border-rule bg-white flex items-center justify-center text-terra-600 mb-5">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-serif text-2xl text-ink-900 mb-1.5">{title}</h3>
      <p className="text-sm text-ink-500 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLink && actionLabel && (
        <Link to={actionLink} className="lf-btn-primary" data-testid="empty-state-action">
          {actionLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
      {onAction && actionLabel && (
        <button onClick={onAction} className="lf-btn-primary" data-testid="empty-state-action">
          {actionLabel} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
