import React from 'react';

export function PageContainer({ children, className = '' }) {
  return (
    <div className={`space-y-10 ${className}`}>
      {children}
    </div>
  );
}

export default function PageSection({
  children,
  className = '',
  padded = true,
  glass = true,
}) {
  return (
    <div
      className={`rounded-[2rem] border border-white/20 dark:border-white/10 shadow-soft ${glass ? 'glass' : ''} p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
