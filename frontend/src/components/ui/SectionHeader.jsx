import React from 'react';

export default function SectionHeader({ title, description, action, eyebrow, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-rule animate-fade-in ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && <span className="lf-eyebrow block mb-3">{eyebrow}</span>}
        <h2 className="font-serif text-3xl sm:text-4xl text-ink-900 leading-tight">{title}</h2>
        {description && <p className="text-sm text-ink-500 mt-2 leading-relaxed">{description}</p>}
      </div>
      {action && <div className="self-start sm:self-auto">{action}</div>}
    </div>
  );
}
