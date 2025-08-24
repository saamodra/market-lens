import { getStockData, getAIAnalysis } from './stockApi';
import { StockAnalysis, AIAnalysis } from '../types/stock';

export interface CachedStockApi {
  getStockData: (symbol: string, forceRefresh?: boolean) => Promise<StockAnalysis>;
  getAIAnalysis: (prompt: string, question?: string, forceRefresh?: boolean) => Promise<AIAnalysis>;
  clearCache: () => void;
  getCacheStats: () => { stockEntries: number; aiEntries: number; totalEntries: number };
}

export function createCachedStockApi(
  getCachedStockData: (symbol: string) => StockAnalysis | null,
  getCachedAIAnalysis: (prompt: string, question?: string) => AIAnalysis | null,
  setCachedStockData: (symbol: string, data: StockAnalysis) => void,
  setCachedAIAnalysis: (prompt: string, question: string, data: AIAnalysis) => void,
  clearCache: () => void,
  getCacheStats: () => { stockEntries: number; aiEntries: number; totalEntries: number }
): CachedStockApi {

  const cachedGetStockData = async (symbol: string, forceRefresh = false): Promise<StockAnalysis> => {
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cached = getCachedStockData(symbol);
      if (cached) {
        console.log(`[Cache] Using cached stock data for ${symbol}`);
        return cached;
      }
    }

    // Fetch from API if not in cache or force refresh
    console.log(`[Cache] Fetching fresh stock data for ${symbol}`);
    const data = await getStockData(symbol);

    // Store in cache
    setCachedStockData(symbol, data);

    return data;
  };

  const cachedGetAIAnalysis = async (prompt: string, question?: string, forceRefresh = false): Promise<AIAnalysis> => {
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cached = getCachedAIAnalysis(prompt, question);
      if (cached) {
        console.log(`[Cache] Using cached AI analysis for prompt:${prompt.substring(0, 30)}...`);
        return cached;
      }
    }

    // Fetch from API if not in cache or force refresh
    console.log(`[Cache] Fetching fresh AI analysis for prompt`);
    const data = await getAIAnalysis(prompt, question);

    // Store in cache
    setCachedAIAnalysis(prompt, question || '', data);

    return data;
  };

  return {
    getStockData: cachedGetStockData,
    getAIAnalysis: cachedGetAIAnalysis,
    clearCache,
    getCacheStats,
  };
}
