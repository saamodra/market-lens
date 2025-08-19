import React from 'react';
import { Database, RefreshCw, Trash2, Clock, HardDrive } from 'lucide-react';

interface CacheStatusProps {
  isFromCache: boolean;
  lastUpdated?: Date;
  cacheStats: { stockEntries: number; aiEntries: number; totalEntries: number };
  onClearCache: () => void;
  onRefresh: () => void;
}

export function CacheStatus({
  isFromCache,
  lastUpdated,
  cacheStats,
  onClearCache,
  onRefresh
}: CacheStatusProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getCacheSource = () => {
    // Check if data is from localStorage
    const hasLocalStorageData = localStorage.getItem('stockCache') || localStorage.getItem('aiCache');
    return hasLocalStorageData ? 'localStorage' : 'memory';
  };

  const cacheSource = getCacheSource();

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className={`w-4 h-4 ${isFromCache ? 'text-blue-600' : 'text-gray-400'}`} />

          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${isFromCache ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                {isFromCache ? 'From Cache' : 'Fresh Data'}
              </span>

              {isFromCache && lastUpdated && (
                <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(lastUpdated)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 mt-1">
              <span>Cache: {cacheStats.stockEntries} stocks, {cacheStats.aiEntries} AI analyses</span>
              <div className="flex items-center space-x-1">
                <HardDrive className="w-3 h-3" />
                <span className="capitalize">{cacheSource}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onRefresh}
            className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-md transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onClearCache}
            className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-md transition-colors"
            title="Clear cache"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
