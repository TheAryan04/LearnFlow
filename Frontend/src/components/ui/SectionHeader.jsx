import React from 'react';
import { motion } from 'framer-motion';

export default function SectionHeader({
  title,
  description,
  action,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 ${className}`}
    >
      <div>
        <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-1">
          {title.split(' ')[0]}
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="self-start sm:self-auto">{action}</div>}
    </motion.div>
  );
}
