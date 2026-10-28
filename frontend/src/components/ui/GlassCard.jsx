import React from 'react';

const variants = {
  default: 'bg-white/70 border border-rule',
  strong: 'bg-white border border-rule shadow-card',
  glow: 'bg-surface/60 border border-rule',
  dark: 'bg-ink-900 text-ink-50 border border-ink-800',
};

export default function GlassCard({ children, className = '', variant = 'default', ...props }) {
  return (
    <div className={`rounded-xl ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </div>
  );
}
