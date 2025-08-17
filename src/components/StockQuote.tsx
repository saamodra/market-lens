import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { StockQuote as StockQuoteType } from '../types/stock';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

interface StockQuoteProps {
  quote: StockQuoteType;
}

export function StockQuote({ quote }: StockQuoteProps) {
  const isPositive = quote.change >= 0;
  const formatNumber = (num: number, currency: string) => {
    const symbol = getCurrencySymbol(currency);
    if (num >= 1e9) return `${symbol}${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${symbol}${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${symbol}${(num / 1e3).toFixed(1)}K`;
    return formatCurrency(num, currency);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
    return vol.toString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {quote.symbol}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{quote.name}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-4">{quote.sector}</span>
            <span>{quote.industry}</span>
          </div>
        </div>

        <div className="text-right mt-4 lg:mt-0">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(quote.price, quote.currency)}
          </div>
          <div className={`flex items-center justify-end ${
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}{quote.change.toFixed(2)}
              ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatNumber(quote.marketCap, quote.currency)}</p>
          </div>
        </div>

        <div className="flex items-center">
          <BarChart3 className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatVolume(quote.volume)}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">52W High</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(quote.high52Week, quote.currency)}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">52W Low</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(quote.low52Week, quote.currency)}</p>
        </div>
      </div>
    </div>
  );
}
