import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { StockQuote } from './components/StockQuote';
import { FinancialMetrics } from './components/FinancialMetrics';
import { TechnicalIndicators } from './components/TechnicalIndicators';
import { PriceChart } from './components/PriceChart';
import { AIAnalysisCard } from './components/AIAnalysisCard';
import { Watchlist } from './components/Watchlist';
import { ThemeToggle } from './components/ThemeToggle';
import { MetricCardSkeleton, ChartSkeleton } from './components/LoadingSkeleton';
import { StockAnalysis } from './types/stock';
import { getStockData } from './services/stockApi';
import { generateAIAnalysis } from './services/geminiApi';

function App() {
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (symbol: string) => {
    if (!symbol.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const data = await getStockData(symbol);
      setAnalysis(data);

      // Generate AI analysis
      setIsLoadingAI(true);
      const aiAnalysis = await generateAIAnalysis(data.quote, data.metrics, data.technical);
      console.log(aiAnalysis);
      setAnalysis(prev => prev ? { ...prev, aiAnalysis } : null);

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
                Stock Analyzer Pro
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
        {/* Disclaimer */}
        <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Investment Disclaimer
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This tool is for educational purposes only and does not constitute financial advice.
                Past performance does not guarantee future results. Always consult with a qualified
                financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </div>

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
            <Watchlist onSelectStock={handleSearch} />
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
                {(analysis.aiAnalysis || isLoadingAI) && (
                  <AIAnalysisCard
                    analysis={analysis.aiAnalysis!}
                    isLoading={isLoadingAI}
                  />
                )}

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
                  Welcome to Stock Analyzer Pro
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
