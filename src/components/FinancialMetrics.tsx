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

  return (
    <div className="space-y-6">
      {/* Valuation Metrics */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Valuation Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="P/E Ratio"
            value={metrics.peRatio}
            status={getMetricStatus(metrics.peRatio, 25, 15, true)}
            tooltip="Price-to-earnings ratio. Lower values may indicate better value."
          />
          <MetricCard
            title="Forward P/E"
            value={metrics.forwardPE}
            status={getMetricStatus(metrics.forwardPE, 20, 12, true)}
            tooltip="Forward price-to-earnings ratio based on expected earnings."
          />
          <MetricCard
            title="PEG Ratio"
            value={metrics.pegRatio}
            status={getMetricStatus(metrics.pegRatio, 1.5, 1, true)}
            tooltip="P/E ratio divided by growth rate. Values below 1 may indicate undervaluation."
          />
          <MetricCard
            title="Price-to-Book"
            value={metrics.priceToBook}
            status={getMetricStatus(metrics.priceToBook, 3, 1.5, true)}
            tooltip="Market value compared to book value per share."
          />
          <MetricCard
            title="Price-to-Sales"
            value={metrics.priceToSales}
            status={getMetricStatus(metrics.priceToSales, 5, 2, true)}
            tooltip="Market cap divided by annual revenue."
          />
          <MetricCard
            title="EV/Revenue"
            value={metrics.evToRevenue}
            status={getMetricStatus(metrics.evToRevenue, 8, 3, true)}
            tooltip="Enterprise value divided by annual revenue."
          />
        </div>
      </div>

      {/* Profitability Analysis */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Profitability Analysis
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <ProgressBar
              value={metrics.profitMargin}
              max={50}
              label="Profit Margin (%)"
            />
            <ProgressBar
              value={metrics.operatingMargin}
              max={40}
              label="Operating Margin (%)"
            />
            <ProgressBar
              value={metrics.grossMargin}
              max={80}
              label="Gross Margin (%)"
            />
            <ProgressBar
              value={metrics.returnOnEquity}
              max={30}
              label="Return on Equity (%)"
            />
            <ProgressBar
              value={metrics.returnOnAssets}
              max={20}
              label="Return on Assets (%)"
            />
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Growth Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Revenue Growth"
            value={`${metrics.revenueGrowth ? metrics.revenueGrowth.toFixed(1) : '0.0'}%`}
            status={getMetricStatus(metrics.revenueGrowth, 15, 5)}
            trend={metrics.revenueGrowth > 0 ? 'up' : 'down'}
            tooltip="Year-over-year revenue growth rate."
          />
          <MetricCard
            title="Earnings Growth"
            value={`${metrics.earningsGrowth ? metrics.earningsGrowth.toFixed(1) : '0.0'}%`}
            status={getMetricStatus(metrics.earningsGrowth, 20, 10)}
            trend={metrics.earningsGrowth > 0 ? 'up' : 'down'}
            tooltip="Year-over-year earnings growth rate."
          />
        </div>
      </div>

      {/* Financial Health */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Financial Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Debt-to-Equity"
            value={metrics.debtToEquity}
            status={getMetricStatus(metrics.debtToEquity, 0.5, 1, true)}
            tooltip="Total debt divided by shareholders' equity. Lower is generally better."
          />
          <MetricCard
            title="Current Ratio"
            value={metrics.currentRatio}
            status={getMetricStatus(metrics.currentRatio, 2, 1)}
            tooltip="Current assets divided by current liabilities. Higher indicates better liquidity."
          />
          <MetricCard
            title="Quick Ratio"
            value={metrics.quickRatio}
            status={getMetricStatus(metrics.quickRatio, 1.5, 1)}
            tooltip="Quick assets divided by current liabilities. Measures short-term liquidity."
          />
          <MetricCard
            title="Cash per Share"
            value={`Rp${metrics.cashPerShare ? metrics.cashPerShare.toFixed(2) : '0.00'}`}
            tooltip="Total cash divided by outstanding shares."
          />
        </div>
      </div>

      {/* Dividend Information */}
      {metrics.dividendYield > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Dividend Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Dividend Yield"
              value={`${metrics.dividendYield ? metrics.dividendYield.toFixed(2) : '0.00'}%`}
              status={getMetricStatus(metrics.dividendYield, 3, 1.5)}
              tooltip="Annual dividend per share divided by stock price."
            />
            <MetricCard
              title="Dividend Rate"
              value={`Rp${metrics.dividendRate ? metrics.dividendRate.toFixed(2) : '0.00'}`}
              tooltip="Annual dividend payment per share."
            />
            <MetricCard
              title="Payout Ratio"
              value={`${metrics.payoutRatio ? metrics.payoutRatio.toFixed(1) : '0.0'}%`}
              status={getMetricStatus(metrics.payoutRatio, 80, 60, true)}
              tooltip="Percentage of earnings paid as dividends. Lower ratios may indicate sustainability."
            />
          </div>
        </div>
      )}
    </div>
  );
}
