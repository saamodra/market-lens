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

    // Clear from stock cache
    try {
      const stockCache = localStorage.getItem('stockCache');
      if (stockCache) {
        const parsed = JSON.parse(stockCache);
        delete parsed[symbol];
        localStorage.setItem('stockCache', JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('Error clearing stock cache for symbol:', symbol, error);
    }

    // Clear from AI cache (all entries for this symbol)
    try {
      const aiCache = localStorage.getItem('aiCache');
      if (aiCache) {
        const parsed = JSON.parse(aiCache);
        const keysToRemove = Object.keys(parsed).filter(key => key.startsWith(`${symbol}:`));
        keysToRemove.forEach(key => delete parsed[key]);
        localStorage.setItem('aiCache', JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('Error clearing AI cache for symbol:', symbol, error);
    }
  };

  const handleStockSelect = (symbol: string) => {
    onSelectStock(symbol);
  };

  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  // Limit to 10 most recent searches
  const limitedSearches = recentSearches.slice(0, 10);

  if (limitedSearches.length === 0) {
    return (
      <div className="flex items-center">
        <Clock className="w-4 h-4 text-blue-500 mr-2" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          No recent searches
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Clock className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3 flex-shrink-0">
        Recent:
      </span>

      <div className="flex-1 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-2 min-w-max">
          {limitedSearches.map((symbol) => {
            const data = stockData[symbol];
            const isPositive = data?.change >= 0;
            const isNegative = data?.change < 0;

            return (
              <div
                key={symbol}
                className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0 group"
              >
                <button
                  onClick={() => handleStockSelect(symbol)}
                  className="flex items-center text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm mr-2">
                    {symbol}
                  </span>

                  {data ? (
                    <div className="flex items-center text-xs">
                      <span className="text-gray-600 dark:text-gray-400 mr-1">
                        {formatCurrency(data.price, data.currency)}
                      </span>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : isNegative ? (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      ) : null}
                      <span
                        className={`${
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
                    <span className="text-xs text-gray-500">
                      No data
                    </span>
                  )}
                </button>

                <button
                  onClick={() => removeFromRecentSearches(symbol)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
