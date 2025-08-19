import React from 'react';
import { FinancialMetrics as FinancialMetricsType } from '../types/stock';
import { MetricCard } from './MetricCard';
import { ProgressBar } from './ProgressBar';

interface FinancialMetricsProps {
  metrics: FinancialMetricsType;
}

export function FinancialMetrics({ metrics }: FinancialMetricsProps) {
  const getMetricStatus = (value: number, good: number, warning: number, isReverse = false) => {
    if (isReverse) {
      if (value <= good) return 'good';
      if (value <= warning) return 'warning';
      return 'danger';
    } else {
      if (value >= good) return 'good';
      if (value >= warning) return 'warning';
      return 'danger';
    }
  };

  const formatMetricValue = (value: number | null | undefined, format: 'number' | 'percentage' | 'currency' = 'number') => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }

    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return value.toFixed(2);
      default:
        return value.toFixed(2);
    }
  };

  const getMetricStatusSafe = (value: number | null | undefined, good: number, warning: number, isReverse = false) => {
    if (value === null || value === undefined || isNaN(value)) {
      return undefined;
    }
    return getMetricStatus(value, good, warning, isReverse);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Financial Metrics
      </h3>

      {/* Valuation Metrics */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Valuation
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            title="P/E Ratio"
            value={formatMetricValue(metrics.peRatio)}
            status={getMetricStatusSafe(metrics.peRatio, 25, 15, true)}
            tooltip="Price-to-earnings ratio. Lower values may indicate better value."
            compact={true}
          />
          <MetricCard
            title="Forward P/E"
            value={formatMetricValue(metrics.forwardPE)}
            status={getMetricStatusSafe(metrics.forwardPE, 20, 12, true)}
            tooltip="Forward price-to-earnings ratio based on expected earnings."
            compact={true}
          />
          <MetricCard
            title="PEG Ratio"
            value={formatMetricValue(metrics.pegRatio)}
            status={getMetricStatusSafe(metrics.pegRatio, 1.5, 1, true)}
            tooltip="P/E ratio divided by growth rate. Values below 1 may indicate undervaluation."
            compact={true}
          />
          <MetricCard
            title="P/B Ratio"
            value={formatMetricValue(metrics.priceToBook)}
            status={getMetricStatusSafe(metrics.priceToBook, 3, 1.5, true)}
            tooltip="Market value compared to book value per share."
            compact={true}
          />
          <MetricCard
            title="P/S Ratio"
            value={formatMetricValue(metrics.priceToSales)}
            status={getMetricStatusSafe(metrics.priceToSales, 5, 2, true)}
            tooltip="Market cap divided by annual revenue."
            compact={true}
          />
          <MetricCard
            title="EV/Revenue"
            value={formatMetricValue(metrics.evToRevenue)}
            status={getMetricStatusSafe(metrics.evToRevenue, 8, 3, true)}
            tooltip="Enterprise value divided by annual revenue."
            compact={true}
          />
        </div>
      </div>

      {/* Profitability Analysis */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Profitability
        </h4>
        <div className="space-y-2">
          <ProgressBar
            value={metrics.profitMargin || 0}
            max={50}
            label="Profit Margin"
            compact={true}
            showValue={metrics.profitMargin !== null && !isNaN(metrics.profitMargin)}
          />
          <ProgressBar
            value={metrics.operatingMargin || 0}
            max={40}
            label="Operating Margin"
            compact={true}
            showValue={metrics.operatingMargin !== null && !isNaN(metrics.operatingMargin)}
          />
          <ProgressBar
            value={metrics.grossMargin || 0}
            max={80}
            label="Gross Margin"
            compact={true}
            showValue={metrics.grossMargin !== null && !isNaN(metrics.grossMargin)}
          />
          <ProgressBar
            value={metrics.returnOnEquity || 0}
            max={30}
            label="ROE"
            compact={true}
            showValue={metrics.returnOnEquity !== null && !isNaN(metrics.returnOnEquity)}
          />
          <ProgressBar
            value={metrics.returnOnAssets || 0}
            max={20}
            label="ROA"
            compact={true}
            showValue={metrics.returnOnAssets !== null && !isNaN(metrics.returnOnAssets)}
          />
        </div>
      </div>

      {/* Growth Metrics */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Growth
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            title="Revenue Growth"
            value={formatMetricValue(metrics.revenueGrowth, 'percentage')}
            status={getMetricStatusSafe(metrics.revenueGrowth, 15, 8)}
            tooltip="Year-over-year revenue growth rate."
            compact={true}
          />
          <MetricCard
            title="EPS Growth"
            value={formatMetricValue(metrics.earningsGrowth, 'percentage')}
            status={getMetricStatusSafe(metrics.earningsGrowth, 20, 10)}
            tooltip="Year-over-year earnings per share growth rate."
            compact={true}
          />
          <MetricCard
            title="Debt/Equity"
            value={formatMetricValue(metrics.debtToEquity)}
            status={getMetricStatusSafe(metrics.debtToEquity, 0.5, 1, true)}
            tooltip="Total debt divided by shareholders' equity."
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}
