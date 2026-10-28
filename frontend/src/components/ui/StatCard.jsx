import React from 'react';

const tone = {
  primary: 'text-terra-600',
  accent: 'text-terra-600',
  success: 'text-moss-700',
  warning: 'text-ochre-600',
  danger: 'text-rust-600',
};

export default function StatCard({ icon: Icon, value, label, trend, variant = 'primary', className = '' }) {
  const slug = String(label || 'stat').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div className={`group border-t border-ink-900/80 pt-5 pb-2 ${className}`} data-testid={`stat-${slug}`}>
      <div className="flex items-center justify-between mb-6">
        <p className="lf-eyebrow">{label}</p>
        {Icon && <Icon className={`w-4 h-4 ${tone[variant] || tone.primary} opacity-80`} />}
      </div>
      <div className="font-serif text-4xl lg:text-5xl text-ink-900 leading-none tabular-nums">{value}</div>
      {trend && (
        <p className={`mt-3 text-xs ${trend.positive ? 'text-moss-700' : 'text-rust-600'}`}>
          {trend.positive ? '↑' : '↓'} {trend.label}
        </p>
      )}
    </div>
  );
}
