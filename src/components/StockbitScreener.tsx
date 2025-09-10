import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { BarChart3, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Search, ExternalLink, Clock } from 'lucide-react';
import StockbitAPI from '../services/stockbitApi';
import { StockbitTokenInput } from './StockbitTokenInput';
import { useScreenerCache } from '../hooks/useScreenerCache';
import {
  StockbitScreenerDisplayData,
  ProcessedStockData,
  StockbitScreenerResponse
} from '../types/stock';

interface StockbitScreenerProps {
  onSelectStock?: (symbol: string) => void;
}

export const StockbitScreener: React.FC<StockbitScreenerProps> = ({ onSelectStock }) => {
  const [screenerData, setScreenerData] = useState<StockbitScreenerDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(StockbitAPI.isAuthenticated());
  const [isFromCache, setIsFromCache] = useState(false);
  const hasInitialLoad = useRef(false);

  // Initialize cache hook
  const screenerCache = useScreenerCache();

  const fetchScreenerResults = useCallback(async (forceRefresh: boolean = false, showToast: boolean = true) => {
    if (!isAuthenticated) {
      setError('Please provide a valid Stockbit token first');
      if (showToast) {
        toast.error('Authentication required');
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      const templateId = '4848138'; // Default template ID

      // Check if data will come from cache BEFORE making the request
      const cachedData = !forceRefresh ? screenerCache.getCachedScreenerData(templateId) : null;
      const isDataFromCache = !!cachedData;

      const response: StockbitScreenerResponse = await StockbitAPI.getScreenerResults(
        templateId,
        forceRefresh,
        screenerCache.getCachedScreenerData,
        screenerCache.setCachedScreenerData
      );

      const processedStocks = StockbitAPI.processScreenerData(response);

      const transformedData: StockbitScreenerDisplayData = {
        stocks: processedStocks,
        screenName: response.data.screen_name,
        totalRows: response.data.totalrows,
        currentPage: response.data.curpage,
        perPage: response.data.perpage,
        columns: response.data.columns,
        lastUpdated: new Date().toISOString()
      };

      setScreenerData(transformedData);
      setLastUpdated(new Date());
      setIsFromCache(isDataFromCache);

      // Show appropriate toast message
      if (showToast) {
        if (isDataFromCache) {
          toast.success(`Loaded ${transformedData.stocks.length} stocks from "${transformedData.screenName}" (cached)`);
        } else {
          toast.success(`Loaded ${transformedData.stocks.length} stocks from "${transformedData.screenName}"`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch screener results';
      setError(errorMessage);

      // If authentication error, clear auth status
      if (errorMessage.includes('token') || errorMessage.includes('auth') || errorMessage.includes('401')) {
        setIsAuthenticated(false);
      }

      if (showToast) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, screenerCache]);

  const handleTokenSet = () => {
    const wasAuthenticated = isAuthenticated;
    const nowAuthenticated = StockbitAPI.isAuthenticated();

    setIsAuthenticated(nowAuthenticated);
    setError(null);

    // Reset the initial load flag if authentication status changed
    if (!wasAuthenticated && nowAuthenticated) {
      hasInitialLoad.current = false;
    }
  };

  const handleRefresh = () => {
    fetchScreenerResults(true); // Force refresh
  };

  const handleClearCache = () => {
    screenerCache.clearCache();
    toast.success('Screener cache cleared');
  };

  const handleStockClick = (stock: ProcessedStockData) => {
    if (onSelectStock && stock.company.symbol) {
      // Remove .JK suffix if present as our stock analyzer will add it
      const symbol = stock.company.symbol.replace('.JK', '');
      onSelectStock(symbol);
    }
  };

  const formatValue = (value: number): string => {
    if (value >= 1e12) {
      return `${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    } else {
      return value.toFixed(0);
    }
  };

  const formatNumber = (num: number | undefined, decimals: number = 2): string => {
    if (num === undefined || num === null || isNaN(num)) return 'N/A';
    return num.toLocaleString('en-US', { maximumFractionDigits: decimals });
  };

  const formatPercentage = (percent: number | undefined): string => {
    if (percent === undefined || percent === null || isNaN(percent)) return 'N/A';
    return `${percent.toFixed(2)}%`;
  };

  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || price === null || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };


  useEffect(() => {
    if (isAuthenticated && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
      // Only fetch on initial load, don't show toast
      fetchScreenerResults(false, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="space-y-6">
      {/* Token Input */}
      {!isAuthenticated && (
        <StockbitTokenInput onTokenSet={handleTokenSet} />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-blue-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {screenerData?.screenName || 'Stockbit Screener'}
              </h2>
              {screenerData && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Showing {screenerData.stocks.length} of {screenerData.totalRows} results
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Cache Status */}
            {screenerData && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                {isFromCache ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Cached (15m TTL)</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live</span>
                  </>
                )}
              </div>
            )}

            {/* Refresh Button */}
            {isAuthenticated && screenerData && (
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}

            {/* Clear Cache Button */}
            {isAuthenticated && screenerData && (
              <button
                onClick={handleClearCache}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Cache
              </button>
            )}

            {/* Change Token Button */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  StockbitAPI.clearToken();
                  setIsAuthenticated(false);
                  setScreenerData(null);
                  toast.success('Token cleared');
                }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Change Token
              </button>
            )}
            <a
              href="https://stockbit.com/screener"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in Stockbit
            </a>
            <button
              onClick={() => fetchScreenerResults()}
              disabled={isLoading || !isAuthenticated}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      {screenerData && screenerData.stocks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prev Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Returns %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Value (IDR)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    MA5
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {screenerData.stocks.map((stock, index) => (
                  <tr
                    key={stock.company.id || stock.company.symbol || index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={stock.company.icon_url}
                          alt={stock.company.symbol}
                          className="w-8 h-8 rounded mr-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {stock.company.symbol}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                            {stock.company.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatPrice(stock.price)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPrice(stock.previousPrice)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {stock.dayReturns !== undefined && !isNaN(stock.dayReturns) && (
                          <>
                            {stock.dayReturns >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                stock.dayReturns >= 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {formatPercentage(stock.dayReturns)}
                            </span>
                          </>
                        )}
                        {(stock.dayReturns === undefined || isNaN(stock.dayReturns)) && (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatNumber(stock.volume, 0)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stock.value ? formatValue(stock.value) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPrice(stock.priceMA5)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleStockClick(stock)}
                        className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-xs"
                        title={`Analyze ${stock.company.symbol}`}
                      >
                        <Search className="w-3 h-3 mr-1" />
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {screenerData.stocks.length} of {screenerData.totalRows} results
              (Page {screenerData.currentPage})
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {screenerData && screenerData.stocks.length === 0 && !isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No Results Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            The screener didn't return any results. Try refreshing or check your connection.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !screenerData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
          <RefreshCw className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Loading Screener Results
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Fetching the latest stock screener data from Stockbit...
          </p>
        </div>
      )}
    </div>
  );
};
