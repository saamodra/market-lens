import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'good' | 'warning' | 'danger';
  tooltip?: string;
  compact?: boolean;
}

export function MetricCard({ title, value, subtitle, trend, status, tooltip, compact = false }: MetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'danger': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-900 dark:text-white';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  if (compact) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          {tooltip && (
            <div className="group relative">
              <AlertCircle className="w-3 h-3 text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-40 p-2 bg-black text-white text-xs rounded
                            opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {tooltip}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-bold ${getStatusColor()}`}>
              {typeof value === 'number' ? value.toFixed(2) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          {getTrendIcon()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {tooltip && (
          <div className="group relative">
            <AlertCircle className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black text-white text-xs rounded
                          opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xl font-bold ${getStatusColor()}`}>
            {typeof value === 'number' ? value.toFixed(2) : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {getTrendIcon()}
      </div>
    </div>
  );
}
