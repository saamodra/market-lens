import { useState, useCallback, useRef, useEffect } from 'react';
import { StockbitScreenerResponse } from '../types/stock';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface ScreenerCache {
  [templateId: string]: CacheEntry<StockbitScreenerResponse>;
}

const SCREENER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds
const SCREENER_CACHE_KEY = 'screenerCache';

export function useScreenerCache() {
  const [screenerCache, setScreenerCache] = useState<ScreenerCache>({});
  const cacheRef = useRef({ screenerCache });

  // Load cache from localStorage on component mount
  useEffect(() => {
    try {
      const storedScreenerCache = localStorage.getItem(SCREENER_CACHE_KEY);
      if (storedScreenerCache) {
        const parsed = JSON.parse(storedScreenerCache);
        console.log(`[Screener Cache] Loaded ${Object.keys(parsed).length} screener entries from localStorage`);
        setScreenerCache(parsed);
        cacheRef.current.screenerCache = parsed;
      }
    } catch (error) {
      console.error('Error loading screener cache from localStorage:', error);
      // Clear corrupted cache
      localStorage.removeItem(SCREENER_CACHE_KEY);
    }
  }, []);

  // Update ref when state changes
  cacheRef.current = { screenerCache };

  const isExpired = useCallback(<T,>(entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const saveToLocalStorage = useCallback((data: ScreenerCache) => {
    try {
      localStorage.setItem(SCREENER_CACHE_KEY, JSON.stringify(data));
      const entryCount = Object.keys(data).length;
      console.log(`[Screener Cache] Saved ${entryCount} entries to localStorage`);
    } catch (error) {
      console.error('Error saving screener cache to localStorage:', error);
    }
  }, []);

  const getCachedScreenerData = useCallback((templateId: string): StockbitScreenerResponse | null => {
    const entry = cacheRef.current.screenerCache[templateId];
    if (entry && !isExpired(entry)) {
      console.log(`[Screener Cache] Using cached data for template ${templateId}`);
      return entry.data;
    }
    return null;
  }, [isExpired]);

  const setCachedScreenerData = useCallback((templateId: string, data: StockbitScreenerResponse) => {
    const entry: CacheEntry<StockbitScreenerResponse> = {
      data,
      timestamp: Date.now(),
      ttl: SCREENER_CACHE_TTL,
    };

    const newCache = {
      ...cacheRef.current.screenerCache,
      [templateId]: entry,
    };

    setScreenerCache(newCache);
    cacheRef.current.screenerCache = newCache;
    saveToLocalStorage(newCache);

    console.log(`[Screener Cache] Cached data for template ${templateId} (expires in ${SCREENER_CACHE_TTL / 60000} minutes)`);
  }, [saveToLocalStorage]);

  const clearExpiredEntries = useCallback(() => {
    const now = Date.now();
    let hasChanges = false;

    // Clear expired screener cache entries
    const newScreenerCache: ScreenerCache = {};
    Object.entries(cacheRef.current.screenerCache).forEach(([templateId, entry]) => {
      if (now - entry.timestamp <= entry.ttl) {
        newScreenerCache[templateId] = entry;
      } else {
        console.log(`[Screener Cache] Expired entry removed for template ${templateId}`);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setScreenerCache(newScreenerCache);
      cacheRef.current.screenerCache = newScreenerCache;
      saveToLocalStorage(newScreenerCache);
    }
  }, [saveToLocalStorage]);

  const clearCache = useCallback(() => {
    setScreenerCache({});
    cacheRef.current.screenerCache = {};
    localStorage.removeItem(SCREENER_CACHE_KEY);
    console.log('[Screener Cache] Cache cleared');
  }, []);

  const getCacheStats = useCallback(() => {
    const screenerKeys = Object.keys(cacheRef.current.screenerCache);
    const validEntries = screenerKeys.filter(key => {
      const entry = cacheRef.current.screenerCache[key];
      return entry && !isExpired(entry);
    });

    return {
      screenerEntries: screenerKeys.length,
      validEntries: validEntries.length,
      expiredEntries: screenerKeys.length - validEntries.length,
    };
  }, [isExpired]);

  const getCacheInfo = useCallback((templateId: string) => {
    const entry = cacheRef.current.screenerCache[templateId];
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const remainingTime = entry.ttl - age;
    const isExpiredEntry = isExpired(entry);

    return {
      timestamp: entry.timestamp,
      age: Math.floor(age / 1000), // in seconds
      remainingTime: Math.floor(remainingTime / 1000), // in seconds
      isExpired: isExpiredEntry,
      expiresAt: new Date(entry.timestamp + entry.ttl),
    };
  }, [isExpired]);

  // Clean up expired entries every minute
  useEffect(() => {
    const interval = setInterval(clearExpiredEntries, 60 * 1000);
    return () => clearInterval(interval);
  }, [clearExpiredEntries]);

  return {
    getCachedScreenerData,
    setCachedScreenerData,
    clearExpiredEntries,
    clearCache,
    getCacheStats,
    getCacheInfo,
    isExpired,
  };
}
