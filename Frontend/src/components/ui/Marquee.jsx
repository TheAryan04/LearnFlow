import React from 'react';

export default function Marquee({ items, className = '', speed = 40 }) {
  return (
    <div
      className={`relative overflow-hidden h-10 ${className}`}
      aria-label="Announcements"
    >
      <div className="flex items-center gap-8 animate-marquee" style={{ animationDuration: `${speed}s` }}>
        {items.map((item, i) => (
          <div key={i} className="whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
            {item.icon && <span className="text-primary">{item.icon}</span>}
            {item.text}
          </div>
        ))}
        {items.map((item, i) => (
          <div key={i + items.length} className="whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
            {item.icon && <span className="text-primary">{item.icon}</span>}
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
