import React from 'react';

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  ...props
}) {
  const variants = {
    default: 'bg-white/55 dark:bg-white/8 border border-white/60 dark:border-white/10 shadow-soft backdrop-blur-2xl',
    strong: 'bg-white/75 dark:bg-white/12 border border-white/70 dark:border-white/20 shadow-elevated backdrop-blur-3xl',
    glow: 'bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-glow backdrop-blur-xl',
    dark: 'bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-glow backdrop-blur-xl',
  };

  return (
    <div
      className={`rounded-3xl ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
