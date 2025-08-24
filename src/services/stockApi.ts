const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to add .JK postfix to stock symbols
const addJKPostfix = (symbol: string): string => {
  // If symbol already ends with .JK, return as is
  if (symbol.endsWith('.JK')) {
    return symbol;
  }
  // Add .JK postfix
  return `${symbol}.JK`;
};

export const getStockData = async (symbol: string) => {
  try {
    const symbolWithJK = addJKPostfix(symbol);
    const response = await fetch(`${API_BASE_URL}/stocks/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol: symbolWithJK }),
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
    const symbolWithJK = addJKPostfix(symbol);
    const response = await fetch(`${API_BASE_URL}/stocks/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol: symbolWithJK }),
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

export const getAIAnalysis = async (prompt: string, question?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, question }),
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
