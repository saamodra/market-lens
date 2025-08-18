import React, { useEffect } from 'react';
import { Clock, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatCurrency } from '../utils/currency';

interface RecentSearchesProps {
  onSelectStock: (symbol: string) => void;
}

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  timestamp: number;
}

export function RecentSearches({ onSelectStock }: RecentSearchesProps) {
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recentSearches', []);
  const [stockData, setStockData] = useLocalStorage<{ [symbol: string]: StockData }>('recentSearchesData', {});

  // Update stock data when recent searches change
  useEffect(() => {
    // Clean up stock data for symbols that are no longer in recent searches
    const currentSymbols = new Set(recentSearches);
    const updatedStockData = { ...stockData };

    Object.keys(updatedStockData).forEach(symbol => {
      if (!currentSymbols.has(symbol)) {
        delete updatedStockData[symbol];
      }
    });

    if (JSON.stringify(updatedStockData) !== JSON.stringify(stockData)) {
      setStockData(updatedStockData);
    }
  }, [recentSearches, stockData, setStockData]);

  const removeFromRecentSearches = (symbol: string) => {
    setRecentSearches(recentSearches.filter(s => s !== symbol));
    // Remove from stock data as well
    setStockData(prev => {
      const newData = { ...prev };
      delete newData[symbol];
      return newData;
    });
  };

  const handleStockSelect = (symbol: string) => {
    onSelectStock(symbol);
  };

  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  if (recentSearches.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Clock className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Searches</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No recent searches. Search for stocks to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Searches</h3>
      </div>

      <div className="space-y-2">
        {recentSearches.map((symbol) => {
          const data = stockData[symbol];
          const isPositive = data?.change >= 0;
          const isNegative = data?.change < 0;

          return (
            <div
              key={symbol}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <button
                onClick={() => handleStockSelect(symbol)}
                className="flex items-start flex-1 text-left flex-col justify-center"
              >
                <span className="font-medium text-gray-900 dark:text-white mr-2">
                  {symbol}
                </span>

                {data ? (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400 mr-1">
                      {formatCurrency(data.price, data.currency)}
                    </span>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : isNegative ? (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    ) : null}
                    <span
                      className={`text-xs ${
                        isPositive
                          ? 'text-green-600 dark:text-green-400'
                          : isNegative
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {formatChangePercent(data.changePercent)}
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No price data
                  </div>
                )}
              </button>

              <button
                onClick={() => removeFromRecentSearches(symbol)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
