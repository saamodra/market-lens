import React from 'react';
import { TechnicalIndicators as TechnicalIndicatorsType } from '../types/stock';
import { MetricCard } from './MetricCard';
import { ProgressBar } from './ProgressBar';
import { formatCurrency } from '../utils/currency';

interface TechnicalIndicatorsProps {
  indicators: TechnicalIndicatorsType;
  currentPrice: number;
  currency: string;
  high52Week: number;
  low52Week: number;
}

export function TechnicalIndicators({ indicators, currentPrice, currency, high52Week, low52Week }: TechnicalIndicatorsProps) {
  const formatTechnicalValue = (value: number | null | undefined, format: 'number' | 'percentage' | 'currency' = 'number') => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }

    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return formatCurrency(value, currency);
      default:
        return value.toFixed(1);
    }
  };

  const getTechnicalStatusSafe = (value: number | null | undefined, dangerThreshold: number, warningThreshold: number) => {
    if (value === null || value === undefined || isNaN(value)) {
      return undefined;
    }
    if (value > dangerThreshold) return 'danger';
    if (value > warningThreshold) return 'warning';
    return 'good';
  };

  const canCalculatePricePosition = () => {
    return indicators.supportLevel !== null &&
           indicators.resistanceLevel !== null &&
           !isNaN(indicators.supportLevel) &&
           !isNaN(indicators.resistanceLevel) &&
           indicators.resistanceLevel !== indicators.supportLevel;
  };

  const calculatePricePosition = () => {
    if (!canCalculatePricePosition()) return 'N/A';
    const position = ((currentPrice - indicators.supportLevel!) / (indicators.resistanceLevel! - indicators.supportLevel!)) * 100;
    return `${position.toFixed(1)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Technical Indicators
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {/* RSI */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            RSI (14-day)
          </h4>
          <div className="mb-2">
            <ProgressBar
              value={indicators.rsi || 0}
              max={100}
              label=""
              compact={true}
              showValue={indicators.rsi !== null && !isNaN(indicators.rsi)}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Oversold (30)</span>
            <span>Neutral (50)</span>
            <span>Overbought (70)</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {indicators.rsi && !isNaN(indicators.rsi) ? (
              indicators.rsi > 70 ? 'Stock may be overbought' :
              indicators.rsi < 30 ? 'Stock may be oversold' :
              'Neutral momentum'
            ) : 'RSI data not available'}
          </p>
        </div>

        {/* Moving Averages */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Moving Averages
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">50-day MA</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {formatTechnicalValue(indicators.movingAverage50, 'currency')}
                </span>
              </div>
              <div className={`text-xs ${
                indicators.movingAverage50 && !isNaN(indicators.movingAverage50) && currentPrice > indicators.movingAverage50
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {indicators.movingAverage50 && !isNaN(indicators.movingAverage50) ?
                  (currentPrice > indicators.movingAverage50 ? 'Above MA50' : 'Below MA50') :
                  'MA50 not available'}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">200-day MA</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {formatTechnicalValue(indicators.movingAverage200, 'currency')}
                </span>
              </div>
              <div className={`text-xs ${
                indicators.movingAverage200 && !isNaN(indicators.movingAverage200) && currentPrice > indicators.movingAverage200
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {indicators.movingAverage200 && !isNaN(indicators.movingAverage200) ?
                  (currentPrice > indicators.movingAverage200 ? 'Above MA200' : 'Below MA200') :
                  'MA200 not available'}
              </div>
            </div>
          </div>
        </div>

        {/* Support and Resistance */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            title="Volatility"
            value={formatTechnicalValue(indicators.volatility, 'percentage')}
            status={getTechnicalStatusSafe(indicators.volatility, 40, 25)}
            tooltip="Measure of price fluctuation. Higher values indicate more volatile stock."
            compact={true}
          />
          <MetricCard
            title="Support"
            value={formatTechnicalValue(indicators.supportLevel, 'currency')}
            tooltip="Price level where stock has historically found buying support."
            compact={true}
          />
          <MetricCard
            title="Resistance"
            value={formatTechnicalValue(indicators.resistanceLevel, 'currency')}
            tooltip="Price level where stock has historically faced selling pressure."
            compact={true}
          />
          <MetricCard
            title="52W High"
            value={formatTechnicalValue(high52Week, 'currency')}
            tooltip="Highest price in the last 52 weeks."
            compact={true}
          />
        </div>

        {/* Additional Technical Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            title="52W Low"
            value={formatTechnicalValue(low52Week, 'currency')}
            tooltip="Lowest price in the last 52 weeks."
            compact={true}
          />
          <MetricCard
            title="Price Position"
            value={calculatePricePosition()}
            subtitle="Between Support & Resistance"
            tooltip="Current price position relative to support and resistance levels."
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}
