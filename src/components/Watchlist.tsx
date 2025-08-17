import { Star, X, TrendingUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface WatchlistProps {
  onSelectStock: (symbol: string) => void;
}

export function Watchlist({ onSelectStock }: WatchlistProps) {
  const [watchlist, setWatchlist] = useLocalStorage<string[]>('watchlist', []);

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  if (watchlist.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Star className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Watchlist</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No stocks in watchlist. Search for stocks and add them to your watchlist.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <Star className="w-5 h-5 text-yellow-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Watchlist</h3>
      </div>

      <div className="space-y-2">
        {watchlist.map((symbol) => (
          <div
            key={symbol}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <button
              onClick={() => onSelectStock(symbol)}
              className="flex items-center flex-1 text-left"
            >
              <span className="font-medium text-gray-900 dark:text-white mr-2">
                {symbol}
              </span>
              {/* Mock price data - in real app, you'd fetch this */}
              <div className="flex items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400 mr-1">$150.25</span>
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400 text-xs">+2.3%</span>
              </div>
            </button>

            <button
              onClick={() => removeFromWatchlist(symbol)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
