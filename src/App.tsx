import React, { useState, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { StockQuote } from './components/StockQuote';
import { FinancialMetrics } from './components/FinancialMetrics';
import { TechnicalIndicators } from './components/TechnicalIndicators';
import { PriceChart } from './components/PriceChart';
import { AIAnalysisCard } from './components/AIAnalysisCard';
import { RecentSearches } from './components/RecentSearches';
import { CacheStatus } from './components/CacheStatus';
import { ThemeToggle } from './components/ThemeToggle';
import { MetricCardSkeleton, ChartSkeleton } from './components/LoadingSkeleton';
import { StockAnalysis, AIAnalysis } from './types/stock';
import { useStockCache } from './hooks/useStockCache';
import { createCachedStockApi } from './services/cachedStockApi';

function App() {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initialize caching system
  const cacheHook = useStockCache();
  const cachedApi = useMemo(() => createCachedStockApi(
    cacheHook.getCachedStockData,
    cacheHook.getCachedAIAnalysis,
    cacheHook.setCachedStockData,
    cacheHook.setCachedAIAnalysis,
    cacheHook.clearCache,
    cacheHook.getCacheStats
  ), [cacheHook]);

  const handleSearch = async (symbol: string) => {
    if (!symbol.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setAiAnalysis(null);
    setIsFromCache(false);
    setLastUpdated(null);

    try {
      // Check if we have cached data first
      const cachedData = cacheHook.getCachedStockData(symbol);
      if (cachedData) {
        setAnalysis(cachedData);
        setIsFromCache(true);
        setLastUpdated(new Date());
        toast.success(`Cached analysis loaded for ${symbol}`);
        // Store data for recent searches even if it's from cache
        storeStockDataForRecentSearches(symbol, cachedData);
      } else {
        // Fetch fresh data
        const data = await cachedApi.getStockData(symbol);
        setAnalysis(data);
        setIsFromCache(false);
        setLastUpdated(new Date());
        toast.success(`Fresh analysis loaded for ${symbol}`);
        // Store data for recent searches
        storeStockDataForRecentSearches(symbol, data);
      }

      // Get AI analysis using separate API call
      setIsLoadingAI(true);
      try {
        const aiData = await cachedApi.getAIAnalysis(symbol, "Berikan analisis lengkap saham ini dengan format keystats dan rekomendasi trading");
        setAiAnalysis(aiData);
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        // Don't fail the entire search if AI analysis fails
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stock data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingAI(false);
    }
  };

  const handleRefreshAI = async () => {
    if (!analysis?.quote.symbol) return;

    setIsLoadingAI(true);
    try {
      const aiData = await cachedApi.getAIAnalysis(analysis.quote.symbol, "Berikan analisis lengkap saham ini dengan format keystats dan rekomendasi trading", true); // Force refresh
      setAiAnalysis(aiData);
      setIsFromCache(false);
      setLastUpdated(new Date());
      toast.success('AI analysis refreshed');
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      toast.error('Failed to refresh AI analysis');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleForceRefresh = async () => {
    if (!analysis?.quote.symbol) return;
    await handleSearch(analysis.quote.symbol);
  };

  const handleClearCache = () => {
    cachedApi.clearCache();
    toast.success('Cache cleared');
  };

  // Store stock data in localStorage for RecentSearches component
  const storeStockDataForRecentSearches = (symbol: string, data: StockAnalysis) => {
    try {
      const existingData = JSON.parse(localStorage.getItem('recentSearchesData') || '{}');
      existingData[symbol] = {
        symbol,
        price: data.quote.price,
        change: data.quote.change,
        changePercent: data.quote.changePercent,
        currency: data.quote.currency,
        timestamp: Date.now(),
      };
      localStorage.setItem('recentSearchesData', JSON.stringify(existingData));
    } catch (error) {
      console.error('Failed to store stock data for recent searches:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Market Lens Pro
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Recent Searches - Sticky below header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <RecentSearches onSelectStock={handleSearch} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Cache Status */}
        {analysis && (
          <div className="mb-6">
            <CacheStatus
              isFromCache={isFromCache}
              lastUpdated={lastUpdated || undefined}
              cacheStats={cachedApi.getCacheStats()}
              onClearCache={handleClearCache}
              onRefresh={handleForceRefresh}
            />
          </div>
        )}

        {isLoading && !analysis && (
          <div className="space-y-6">
            <ChartSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <MetricCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Stock Quote */}
            <StockQuote quote={analysis.quote} />

            {/* Price Chart */}
            <PriceChart
              data={analysis.priceHistory}
              symbol={analysis.quote.symbol}
              currency={analysis.quote.currency}
              movingAverage50={analysis.technical.movingAverage50}
              movingAverage200={analysis.technical.movingAverage200}
            />

            {/* AI Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Analisis AI
                </h3>
                {analysis && (
                  <button
                    onClick={handleRefreshAI}
                    disabled={isLoadingAI}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
                  >
                    {isLoadingAI ? 'Refreshing...' : 'Refresh AI'}
                  </button>
                )}
              </div>

              {(aiAnalysis || isLoadingAI) && (
                <AIAnalysisCard
                  analysis={aiAnalysis!}
                  isLoading={isLoadingAI}
                />
              )}
            </div>

            {/* Financial Metrics and Technical Indicators in a grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FinancialMetrics metrics={analysis.metrics} />
              <TechnicalIndicators
                indicators={analysis.technical}
                currentPrice={analysis.quote.price}
                currency={analysis.quote.currency}
                high52Week={analysis.quote.high52Week}
                low52Week={analysis.quote.low52Week}
              />
            </div>
          </div>
        )}

        {!isLoading && !analysis && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Welcome to Market Lens Pro
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Search for any Indonesian stock symbol (e.g., BBCA, BBRI) to get comprehensive analysis including
              financial metrics, technical indicators, and AI analysis. .JK will be added automatically.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
