import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  variant = 'primary',
  className = '',
}) {
  const colorMap = {
    primary: { bg: 'bg-primary/10 dark:bg-primary/20', text: 'text-primary', border: 'border-primary/20' },
    accent: { bg: 'bg-accent/10 dark:bg-accent/20', text: 'text-accent', border: 'border-accent/20' },
    success: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    warning: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500/20' },
    danger: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-500', border: 'border-rose-500/20' },
  };

  const c = colorMap[variant];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-[2rem] p-7 glass border ${c.bg} ${c.border} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.bg} ${c.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-[11px] font-bold ${trend.positive ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
            {trend.positive ? <span className="w-3 h-3 text-emerald-500"><svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></span> : <span className="w-3 h-3 text-rose-500"><svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 0l-8-8-4 4-6-6"/></svg></span>}
            {trend.label}
          </span>
        )}
      </div>
      <div className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
        {value}
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 tracking-wider uppercase opacity-80">
        {label}
      </p>
    </motion.div>
  );
}
