import { useState, useCallback, useRef, useEffect } from 'react';
import { StockAnalysis, AIAnalysis } from '../types/stock';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface StockCache {
  [symbol: string]: CacheEntry<StockAnalysis>;
}

interface AIAnalysisCache {
  [key: string]: CacheEntry<AIAnalysis>; // key = prompt:question
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds
const STOCK_CACHE_KEY = 'stockCache';
const AI_CACHE_KEY = 'aiCache';

export function useStockCache() {
  const [stockCache, setStockCache] = useState<StockCache>({});
  const [aiCache, setAiCache] = useState<AIAnalysisCache>({});
  const cacheRef = useRef({ stockCache, aiCache });

  // Load cache from localStorage on component mount
  useEffect(() => {
    try {
      // Load stock cache
      const storedStockCache = localStorage.getItem(STOCK_CACHE_KEY);
      if (storedStockCache) {
        const parsed = JSON.parse(storedStockCache);
        console.log(`[Cache] Loaded ${Object.keys(parsed).length} stock entries from localStorage`);
        setStockCache(parsed);
        cacheRef.current.stockCache = parsed;
      }

      // Load AI cache
      const storedAiCache = localStorage.getItem(AI_CACHE_KEY);
      if (storedAiCache) {
        const parsed = JSON.parse(storedAiCache);
        console.log(`[Cache] Loaded ${Object.keys(parsed).length} AI entries from localStorage`);
        setAiCache(parsed);
        cacheRef.current.aiCache = parsed;
      }
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
      // Clear corrupted cache
      localStorage.removeItem(STOCK_CACHE_KEY);
      localStorage.removeItem(AI_CACHE_KEY);
    }
  }, []);

  // Update ref when state changes
  cacheRef.current = { stockCache, aiCache };

  const isExpired = useCallback(<T,>(entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const saveToLocalStorage = useCallback((key: string, data: StockCache | AIAnalysisCache) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      const entryCount = Object.keys(data).length;
      console.log(`[Cache] Saved ${entryCount} entries to localStorage (${key})`);
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, []);

  const getCachedStockData = useCallback((symbol: string): StockAnalysis | null => {
    const entry = cacheRef.current.stockCache[symbol];
    if (entry && !isExpired(entry)) {
      return entry.data;
    }
    return null;
  }, [isExpired]);

  const getCachedAIAnalysis = useCallback((prompt: string, question?: string): AIAnalysis | null => {
    const key = `${prompt}:${question || ''}`;
    const entry = cacheRef.current.aiCache[key];
    if (entry && !isExpired(entry)) {
      return entry.data;
    }
    return null;
  }, [isExpired]);

  const setCachedStockData = useCallback((symbol: string, data: StockAnalysis) => {
    const entry: CacheEntry<StockAnalysis> = {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL,
    };

    const newCache = {
      ...cacheRef.current.stockCache,
      [symbol]: entry,
    };

    setStockCache(newCache);
    cacheRef.current.stockCache = newCache;
    saveToLocalStorage(STOCK_CACHE_KEY, newCache);
  }, [saveToLocalStorage]);

  const setCachedAIAnalysis = useCallback((prompt: string, question: string, data: AIAnalysis) => {
    const key = `${prompt}:${question}`;
    const entry: CacheEntry<AIAnalysis> = {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL,
    };

    const newCache = {
      ...cacheRef.current.aiCache,
      [key]: entry,
    };

    setAiCache(newCache);
    cacheRef.current.aiCache = newCache;
    saveToLocalStorage(AI_CACHE_KEY, newCache);
  }, [saveToLocalStorage]);

  const clearExpiredEntries = useCallback(() => {
    const now = Date.now();
    let hasChanges = false;

    // Clear expired stock cache entries
    const newStockCache: StockCache = {};
    Object.entries(cacheRef.current.stockCache).forEach(([symbol, entry]) => {
      if (now - entry.timestamp <= entry.ttl) {
        newStockCache[symbol] = entry;
      } else {
        hasChanges = true;
      }
    });

    // Clear expired AI cache entries
    const newAiCache: AIAnalysisCache = {};
    Object.entries(cacheRef.current.aiCache).forEach(([key, entry]) => {
      if (now - entry.timestamp <= entry.ttl) {
        newAiCache[key] = entry;
      } else {
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setStockCache(newStockCache);
      setAiCache(newAiCache);
      cacheRef.current.stockCache = newStockCache;
      cacheRef.current.aiCache = newAiCache;

      // Update localStorage
      saveToLocalStorage(STOCK_CACHE_KEY, newStockCache);
      saveToLocalStorage(AI_CACHE_KEY, newAiCache);
    }
  }, [saveToLocalStorage]);

  const clearCache = useCallback(() => {
    setStockCache({});
    setAiCache({});
    cacheRef.current.stockCache = {};
    cacheRef.current.aiCache = {};

    // Clear from localStorage
    localStorage.removeItem(STOCK_CACHE_KEY);
    localStorage.removeItem(AI_CACHE_KEY);
  }, []);

  const getCacheStats = useCallback(() => {
    const stockKeys = Object.keys(cacheRef.current.stockCache);
    const aiKeys = Object.keys(cacheRef.current.aiCache);

    return {
      stockEntries: stockKeys.length,
      aiEntries: aiKeys.length,
      totalEntries: stockKeys.length + aiKeys.length,
    };
  }, []);

  // Clean up expired entries every minute
  useEffect(() => {
    const interval = setInterval(clearExpiredEntries, 60 * 1000);
    return () => clearInterval(interval);
  }, [clearExpiredEntries]);

  return {
    getCachedStockData,
    getCachedAIAnalysis,
    setCachedStockData,
    setCachedAIAnalysis,
    clearExpiredEntries,
    clearCache,
    getCacheStats,
    isExpired,
  };
}
