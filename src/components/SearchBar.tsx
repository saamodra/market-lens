import React, { useState, useRef } from 'react';
import { Search, Clock } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SearchBarProps {
  onSearch: (symbol: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recentSearches', []);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (symbol: string) => {
    if (symbol.trim()) {
      const upperSymbol = symbol.toUpperCase().trim();
      onSearch(upperSymbol);

      // Add to recent searches
      const updated = [upperSymbol, ...recentSearches.filter(s => s !== upperSymbol)].slice(0, 5);
      setRecentSearches(updated);

      setQuery('');
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks (e.g., AAPL, GOOGL)"
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {showSuggestions && (query.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800
                      border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">

          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">Recent Searches</div>
              {recentSearches.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleSearch(symbol)}
                  className="w-full flex items-center px-3 py-2 text-left
                           hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">{symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
