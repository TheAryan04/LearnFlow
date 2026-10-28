import React from 'react';

export default function Marquee({ items, className = '', speed = 60 }) {
  const row = (offset) =>
    items.map((item, i) => (
      <span key={i + offset} className="whitespace-nowrap text-sm text-ink-600 flex items-center gap-3">
        <span className="font-serif italic text-terra-600">§</span>
        {item.text}
      </span>
    ));
  return (
    <div className={`relative overflow-hidden h-10 flex items-center ${className}`} aria-label="Announcements" data-testid="announcement-ticker">
      <div className="flex items-center gap-12 animate-marquee" style={{ animationDuration: `${speed * 1.5}s` }}>
        {row(0)}
        {row(items.length)}
      </div>
    </div>
  );
}
