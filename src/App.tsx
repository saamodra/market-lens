import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { StockQuote } from './components/StockQuote';
import { FinancialMetrics } from './components/FinancialMetrics';
import { TechnicalIndicators } from './components/TechnicalIndicators';
import { PriceChart } from './components/PriceChart';
import { AIAnalysisCard } from './components/AIAnalysisCard';
import { RecentSearches } from './components/RecentSearches';
import { ThemeToggle } from './components/ThemeToggle';
import { MetricCardSkeleton, ChartSkeleton } from './components/LoadingSkeleton';
import { StockAnalysis, AIAnalysis } from './types/stock';
import { getStockData, getAIAnalysis } from './services/stockApi';

function App() {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiQuestion, setAiQuestion] = useState<string>("Berikan analisis lengkap saham ini dengan format keystats dan rekomendasi trading");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (symbol: string) => {
    if (!symbol.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setAiAnalysis(null);

    try {
      const data = await getStockData(symbol);
      setAnalysis(data);

      // Get AI analysis using separate API call
      setIsLoadingAI(true);
      try {
        const aiData = await getAIAnalysis(symbol, aiQuestion);
        setAiAnalysis(aiData);
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        // Don't fail the entire search if AI analysis fails
      }

      toast.success(`Analysis loaded for ${symbol}`);
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
      const aiData = await getAIAnalysis(analysis.quote.symbol, aiQuestion);
      setAiAnalysis(aiData);
      toast.success('AI analysis refreshed');
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      toast.error('Failed to refresh AI analysis');
    } finally {
      setIsLoadingAI(false);
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
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <RecentSearches onSelectStock={handleSearch} />
          </div>

          {/* Main Analysis */}
          <div className="lg:col-span-3 space-y-8">
            {isLoading && !analysis && (
              <div className="space-y-6">
                <ChartSkeleton />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <MetricCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            )}

            {analysis && (
              <>
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

                  <div className="mb-4">
                    <label htmlFor="ai-question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanyakan AI tentang saham ini:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="ai-question"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        placeholder="e.g., Berikan analisis lengkap saham ini dengan format keystats dan rekomendasi trading"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                                              <button
                          onClick={handleRefreshAI}
                          disabled={isLoadingAI || !analysis}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
                        >
                          Tanya AI
                        </button>
                    </div>
                  </div>

                  {(aiAnalysis || isLoadingAI) && (
                    <AIAnalysisCard
                      analysis={aiAnalysis!}
                      isLoading={isLoadingAI}
                    />
                  )}
                </div>

                {/* Financial Metrics */}
                <FinancialMetrics metrics={analysis.metrics} />

                {/* Technical Indicators */}
                <TechnicalIndicators
                  indicators={analysis.technical}
                  currentPrice={analysis.quote.price}
                  currency={analysis.quote.currency}
                />
              </>
            )}

            {!isLoading && !analysis && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Welcome to Market Lens Pro
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Search for any stock symbol to get comprehensive analysis including
                  financial metrics, technical indicators, and AI-powered insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
