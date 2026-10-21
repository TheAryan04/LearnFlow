import React from 'react';
import { Circle } from 'rc-progress';

export default function CircularProgress({
  percent = 0,
  size = 110,
  strokeWidth = 8,
  strokeColor = '#2E75B6',
  trailColor = '#E2E8F0',
  label = '',
  className = '',
}) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Circle
        percent={safePercent}
        strokeWidth={strokeWidth}
        trailWidth={strokeWidth}
        strokeColor={strokeColor}
        trailColor={trailColor}
        strokeLinecap="round"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {safePercent}%
        </span>
        {label && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
