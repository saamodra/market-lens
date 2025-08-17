import React from 'react';
import { TechnicalIndicators as TechnicalIndicatorsType } from '../types/stock';
import { MetricCard } from './MetricCard';
import { ProgressBar } from './ProgressBar';
import { formatCurrency } from '../utils/currency';

interface TechnicalIndicatorsProps {
  indicators: TechnicalIndicatorsType;
  currentPrice: number;
  currency: string;
}

export function TechnicalIndicators({ indicators, currentPrice, currency }: TechnicalIndicatorsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Technical Indicators
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RSI */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Relative Strength Index (RSI)
            </h4>
            <div className="mb-2">
              <ProgressBar
                value={indicators.rsi}
                max={100}
                label="RSI (14-day)"
                className="mb-2"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Oversold (30)</span>
              <span>Neutral (50)</span>
              <span>Overbought (70)</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {indicators.rsi > 70 ? 'Stock may be overbought' :
               indicators.rsi < 30 ? 'Stock may be oversold' :
               'Neutral momentum'}
            </p>
          </div>

          {/* Moving Averages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Moving Averages
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">50-day MA</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(indicators.movingAverage50, currency)}
                  </span>
                </div>
                <div className={`text-xs ${
                  currentPrice > indicators.movingAverage50
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {currentPrice > indicators.movingAverage50 ? 'Above MA50' : 'Below MA50'}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">200-day MA</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(indicators.movingAverage200, currency)}
                  </span>
                </div>
                <div className={`text-xs ${
                  currentPrice > indicators.movingAverage200
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {currentPrice > indicators.movingAverage200 ? 'Above MA200' : 'Below MA200'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support and Resistance */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Volatility"
            value={`${indicators.volatility.toFixed(1)}%`}
            status={indicators.volatility > 40 ? 'danger' : indicators.volatility > 25 ? 'warning' : 'good'}
            tooltip="Measure of price fluctuation. Higher values indicate more volatile stock."
          />
          <MetricCard
            title="Support Level"
            value={formatCurrency(indicators.supportLevel, currency)}
            tooltip="Price level where stock has historically found buying support."
          />
          <MetricCard
            title="Resistance Level"
            value={formatCurrency(indicators.resistanceLevel, currency)}
            tooltip="Price level where stock has historically faced selling pressure."
          />
          <MetricCard
            title="Price Position"
            value={`${(((currentPrice - indicators.supportLevel) / (indicators.resistanceLevel - indicators.supportLevel)) * 100).toFixed(1)}%`}
            subtitle="Between Support & Resistance"
            tooltip="Current price position relative to support and resistance levels."
          />
        </div>
      </div>
    </div>
  );
}
