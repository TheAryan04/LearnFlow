import React from 'react';

const variants = {
  default: 'bg-surface text-ink-700 border-rule',
  primary: 'bg-terra-100 text-terra-700 border-terra-300',
  accent: 'bg-terra-100 text-terra-700 border-terra-300',
  success: 'bg-moss-100 text-moss-700 border-moss-200',
  warning: 'bg-ochre-100 text-ochre-600 border-ochre-200',
  danger: 'bg-rust-50 text-rust-600 border-rust-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
};

const sizes = { sm: 'text-[10px] px-2 py-0.5', md: 'text-xs px-2.5 py-1', lg: 'text-sm px-3 py-1.5' };

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium tracking-wide border ${variants[variant] || variants.default} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
