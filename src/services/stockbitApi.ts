// Stockbit API service for screener functionality with manual token authentication


export interface StockbitCompany {
  country: string;
  exchange: string;
  id: string;
  name: string;
  symbol: string;
  symbol_2: string;
  symbol_3: string;
  type: string;
  badges: {
    is_new: boolean;
  };
  icon_url: string;
}

export interface StockbitResult {
  display: string;
  id: number;
  item: string;
  raw: string;
}

export interface StockbitCalc {
  company: StockbitCompany;
  results: StockbitResult[];
}

export interface StockbitColumn {
  coloring: string;
  id: number;
  name: string;
  removable: string;
}

export interface StockbitRule {
  item1: number;
  item1_name: string;
  item2: string;
  item2_name: string;
  multiplier: string;
  operator: string;
  type: string;
}

export interface StockbitScreenerData {
  calcs: StockbitCalc[];
  rules: StockbitRule[];
  columns: StockbitColumn[];
  curpage: number;
  favorite: boolean;
  isguru: boolean;
  order: number;
  perpage: number;
  screen_desc: string;
  screen_name: string;
  screenerid: number;
  sequence: string[];
  sort: string;
  totalrows: number;
  universe: string;
  type: string;
}

export interface StockbitScreenerResponse {
  data: StockbitScreenerData;
  message: string;
}

// Processed stock data for display
export interface ProcessedStockData {
  company: StockbitCompany;
  volume?: number;
  previousVolume?: number;
  previousPrice?: number;
  price?: number;
  priceMA5?: number;
  value?: number;
  dayReturns?: number;
  volumeMA20?: number;
  // Raw results for any additional processing
  results: StockbitResult[];
}

class StockbitAPI {
  private static readonly API_BASE_URL = 'http://localhost:8000/api';
  private static readonly STORAGE_KEY = 'stockbit_token';

  /**
   * Get stored authentication token from localStorage
   */
  private static getStoredToken(): string | null {
    try {
      const tokenData = localStorage.getItem(this.STORAGE_KEY);
      if (!tokenData) return null;

      const parsed = JSON.parse(tokenData);
      const now = new Date();
      const expiry = new Date(parsed.expired_at);

      // Check if token is still valid (with 5 minute buffer)
      if (expiry.getTime() - now.getTime() > 5 * 60 * 1000) {
        return parsed.token;
      }

      // Token expired, remove it
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading stored token:', error);
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  /**
   * Store authentication token in localStorage
   */
  private static storeToken(token: string, expiredAt: string): void {
    try {
      const tokenData = {
        token,
        expired_at: expiredAt,
        stored_at: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }


  /**
   * Get valid authentication token (from storage or manual input)
   */
  private static async getValidToken(): Promise<string> {
    // Try to get stored token first
    const storedToken = this.getStoredToken();
    if (storedToken) {
      return storedToken;
    }

    // If no valid stored token, check for manually entered token
    const manualToken = this.getManualToken();
    if (manualToken) {
      return manualToken;
    }

    // If no token available, throw error asking user to provide one
    throw new Error('No valid Stockbit token available. Please provide a valid bearer token.');
  }

  /**
   * Get manually entered token from localStorage
   */
  private static getManualToken(): string | null {
    try {
      return localStorage.getItem('stockbit_manual_token');
    } catch {
      return null;
    }
  }

  /**
   * Set manual token (for user-provided tokens)
   */
  static setManualToken(token: string, expiresIn24Hours: boolean = true): void {
    try {
      localStorage.setItem('stockbit_manual_token', token);

      // Store with expiration (24 hours by default for manual tokens)
      if (expiresIn24Hours) {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        this.storeToken(token, expiry.toISOString());
      }
    } catch (error) {
      console.error('Error storing manual token:', error);
    }
  }

  /**
   * Get screener results from Stockbit API via backend proxy (with caching support)
   */
  static async getScreenerResults(
    templateId: string = '4848138',
    forceRefresh: boolean = false,
    getCachedData?: (templateId: string) => StockbitScreenerResponse | null,
    setCachedData?: (templateId: string, data: StockbitScreenerResponse) => void
  ): Promise<StockbitScreenerResponse> {
    console.log(`📊 Fetching screener results for template ${templateId}${forceRefresh ? ' (force refresh)' : ''}...`);

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh && getCachedData) {
      const cached = getCachedData(templateId);
      if (cached) {
        console.log(`[Cache] Using cached screener data for template ${templateId}`);
        return cached;
      }
    }
    try {
      const token = await this.getValidToken();

      const response = await fetch(`${this.API_BASE_URL}/stockbit/screener`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ templateId })
      });

      // If unauthorized, clear token and throw error for user to provide new token
      if (response.status === 401) {
        console.log('Token expired or unauthorized');
        localStorage.removeItem(this.STORAGE_KEY);
        throw new Error('Authentication token expired or invalid. Please provide a new token.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      // Store in cache if cache functions are provided
      if (setCachedData) {
        setCachedData(templateId, data);
      }

      console.log(`[API] Fresh screener data fetched for template ${templateId}`);
      return data;
    } catch (error) {
      console.error('Error fetching screener results:', error);
      throw new Error('Failed to fetch screener results from Stockbit');
    }
  }

  /**
   * Process raw screener data into a more usable format
   */
  static processScreenerData(response: StockbitScreenerResponse): ProcessedStockData[] {
    if (!response.data?.calcs) {
      return [];
    }

    return response.data.calcs.map(calc => {
      const processed: ProcessedStockData = {
        company: calc.company,
        results: calc.results
      };

      // Extract common metrics by ID
      calc.results.forEach(result => {
        const value = parseFloat(result.raw);

        switch (result.id) {
          case 12469: // Volume
            processed.volume = value;
            break;
          case 15490: // Previous Volume
            processed.previousVolume = value;
            break;
          case 13622: // Previous Price
            processed.previousPrice = value;
            break;
          case 2661: // Price
            processed.price = value;
            break;
          case 12459: // Price MA 5
            processed.priceMA5 = value;
            break;
          case 13620: // Value
            processed.value = value;
            break;
          case 15629: // 1 Day Price Returns (%)
            processed.dayReturns = value;
            break;
          case 12464: // Volume MA 20
            processed.volumeMA20 = value;
            break;
        }
      });

      return processed;
    });
  }

  /**
   * Get a specific metric value from results array
   */
  static getMetricValue(results: StockbitResult[], itemName: string): string | null {
    const result = results.find(r => r.item === itemName);
    return result ? result.display : null;
  }

  /**
   * Get raw numeric value of a metric
   */
  static getMetricRawValue(results: StockbitResult[], itemName: string): number | null {
    const result = results.find(r => r.item === itemName);
    return result ? parseFloat(result.raw) : null;
  }

  /**
   * Clear stored authentication tokens
   */
  static clearToken(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('stockbit_manual_token');
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  static isAuthenticated(): boolean {
    return this.getStoredToken() !== null || this.getManualToken() !== null;
  }

  /**
   * Get current token info for display
   */
  static getTokenInfo(): { hasToken: boolean; isManual: boolean; expiresAt?: string } {
    const storedToken = this.getStoredToken();
    const manualToken = this.getManualToken();

    if (storedToken) {
      try {
        const parsed = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        return {
          hasToken: true,
          isManual: parsed.manual || false,
          expiresAt: parsed.expired_at
        };
      } catch {
        return { hasToken: true, isManual: false };
      }
    }

    if (manualToken) {
      return { hasToken: true, isManual: true };
    }

    return { hasToken: false, isManual: false };
  }

}

export default StockbitAPI;
