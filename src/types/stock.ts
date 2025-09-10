export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  sector: string;
  industry: string;
  currency: string;
}

export interface FinancialMetrics {
  peRatio: number;
  forwardPE: number;
  pegRatio: number;
  priceToBook: number;
  priceToSales: number;
  evToRevenue: number;
  profitMargin: number;
  operatingMargin: number;
  grossMargin: number;
  returnOnEquity: number;
  returnOnAssets: number;
  revenueGrowth: number;
  earningsGrowth: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  cashPerShare: number;
  dividendYield: number;
  dividendRate: number;
  payoutRatio: number;
}

export interface TechnicalIndicators {
  rsi: number;
  movingAverage50: number;
  movingAverage200: number;
  volatility: number;
  supportLevel: number;
  resistanceLevel: number;
}

export interface AIAnalysis {
  analysis: string;
  recommendations: string[];
}

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockAnalysis {
  quote: StockQuote;
  metrics: FinancialMetrics;
  technical: TechnicalIndicators;
  priceHistory: PriceData[];
  prompt: string;
}

// Stockbit Screener Types - Updated to match actual API response
export interface StockbitScreenerDisplayData {
  stocks: ProcessedStockData[];
  screenName: string;
  totalRows: number;
  currentPage: number;
  perPage: number;
  columns: StockbitColumn[];
  lastUpdated: string;
}

// Re-export the types from stockbitApi for convenience
export type {
  StockbitCompany,
  StockbitResult,
  StockbitCalc,
  StockbitColumn,
  StockbitRule,
  StockbitScreenerData,
  StockbitScreenerResponse,
  ProcessedStockData
} from '../services/stockbitApi';
