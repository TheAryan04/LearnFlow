import React from 'react';
import { Line } from 'rc-progress';

export default function ProgressBar({
  percent = 0,
  showLabel = true,
  strokeColor = '#8C3322',
  trailColor = '#E7E2D7',
  strokeWidth = 3,
  className = '',
}) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div className="flex-1">
        <Line
          percent={safePercent}
          strokeWidth={strokeWidth}
          trailWidth={strokeWidth}
          strokeColor={strokeColor}
          trailColor={trailColor}
          strokeLinecap="round"
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-10 text-right">
          {safePercent}%
        </span>
      )}
    </div>
  );
}
