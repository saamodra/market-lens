import { StockQuote, FinancialMetrics, TechnicalIndicators, PriceData } from '../types/stock';

const API_BASE_URL = 'http://localhost:8000/api';

export const searchStocks = async (query: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search stocks');
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    // Fallback to mock results if API fails
    const mockResults = [
      'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'
    ];
    return mockResults.filter(symbol =>
      symbol.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }
};

export const getStockData = async (symbol: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw new Error('Failed to fetch stock data');
  }
};

export const getMultipleStocks = async (symbols: string[]) => {
  const promises = symbols.map(symbol => getStockData(symbol));
  return Promise.all(promises);
};

export const getStockEvaluation = async (symbol: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stock evaluation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stock evaluation:', error);
    throw new Error('Failed to fetch stock evaluation');
  }
};

export const getAIAnalysis = async (symbol: string, question: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol, question }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI analysis');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting AI analysis:', error);
    throw new Error('Failed to get AI analysis');
  }
};
