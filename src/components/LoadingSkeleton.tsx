import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <LoadingSkeleton className="h-4 w-24 mb-2" />
      <LoadingSkeleton className="h-6 w-16 mb-4" />
      <LoadingSkeleton className="h-2 w-full" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <LoadingSkeleton className="h-6 w-32 mb-4" />
      <LoadingSkeleton className="h-64 w-full" />
    </div>
  );
}