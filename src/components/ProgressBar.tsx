import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  min?: number;
  label?: string;
  className?: string;
  showValue?: boolean;
  compact?: boolean;
}

export function ProgressBar({
  value,
  max,
  min = 0,
  label,
  className = '',
  showValue = true,
  compact = false
}: ProgressBarProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const getColor = () => {
    if (clampedPercentage < 33) return 'bg-red-500';
    if (clampedPercentage < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (compact) {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {showValue ? (value ? value.toFixed(1) : '-') : 'N/A'}
            </span>
          </div>
        )}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {showValue ? (value ? value.toFixed(1) : '-') : 'N/A'}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}
