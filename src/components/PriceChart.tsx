import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { PriceData } from '../types/stock';
import { format } from 'date-fns';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

interface PriceChartProps {
  data: PriceData[];
  symbol: string;
  currency: string;
  movingAverage50?: number;
  movingAverage200?: number;
}

type TimeFrame = '1M' | '3M' | '6M' | '1Y' | '5Y';
type ChartType = 'line' | 'candlestick';

export function PriceChart({ data, symbol, currency, movingAverage50, movingAverage200 }: PriceChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [chartType, setChartType] = useState<ChartType>('line');

  const getFilteredData = () => {
    let daysBack: number;

    switch (timeFrame) {
      case '1M': daysBack = 30; break;
      case '3M': daysBack = 90; break;
      case '6M': daysBack = 180; break;
      case '1Y': daysBack = 365; break;
      case '5Y': daysBack = 1825; break;
      default: daysBack = 365;
    }

    return data.slice(-daysBack);
  };

  const filteredData = getFilteredData();

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {label ? format(new Date(label), 'MMM dd, yyyy') : ''}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Close: {formatCurrency(payload[0].value, currency)}
          </p>
          {payload[1] && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Volume: {(payload[1].value / 1000000).toFixed(2)}M
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {symbol} Price Chart
        </h3>

        <div className="flex gap-2">
          {/* Time Frame Buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['1M', '3M', '6M', '1Y', '5Y'] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeFrame === tf
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['line', 'candlestick'] as ChartType[]).map((ct) => (
              <button
                key={ct}
                onClick={() => setChartType(ct)}
                className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                  chartType === ct
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {ct}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              stroke="#6B7280"
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => `${getCurrencySymbol(currency)}${value.toFixed(0)}`}
              stroke="#6B7280"
            />
            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="close"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6' }}
            />

            {movingAverage50 && (
              <ReferenceLine
                y={movingAverage50}
                stroke="#10B981"
                strokeDasharray="5 5"
                label={{ value: "MA50", position: "top" }}
              />
            )}

            {movingAverage200 && (
              <ReferenceLine
                y={movingAverage200}
                stroke="#F59E0B"
                strokeDasharray="5 5"
                label={{ value: "MA200", position: "top" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
