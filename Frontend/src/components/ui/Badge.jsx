import React from 'react';

const variants = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
  primary: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent border border-primary/20',
  accent: 'bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent-400 border border-accent/20',
  success: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  danger: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  info: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) {
  const sizeMap = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold border ${variants[variant]} ${sizeMap[size]} ${className}`}
    >
      {children}
    </span>
  );
}
