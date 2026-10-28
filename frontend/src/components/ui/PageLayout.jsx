import React from 'react';

export function PageContainer({ children, className = '' }) {
  return <div className={`space-y-12 animate-fade-in ${className}`}>{children}</div>;
}

export default function PageSection({ children, className = '', padded = true, glass = true }) {
  return (
    <section className={`rounded-xl border border-rule ${glass ? 'bg-white/70' : ''} ${padded ? 'p-6 sm:p-8' : ''} ${className}`}>
      {children}
    </section>
  );
}
