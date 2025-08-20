"""
Utility classes and functions for data processing.
Following Single Responsibility Principle - this file handles data cleaning and formatting.
"""
import math
import numpy as np
from typing import Dict, Any, List
import yfinance as yf
from models import StockQuote, FinancialMetrics, TechnicalIndicators, PriceData


class DataCleaner:
    """Handles data cleaning to make it JSON compliant."""
    
    @staticmethod
    def clean_data_for_json(data):
        """Recursively clean data to make it JSON compliant"""
        if isinstance(data, dict):
            return {key: DataCleaner.clean_data_for_json(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [DataCleaner.clean_data_for_json(item) for item in data]
        elif isinstance(data, (np.float64, np.float32)):
            # Convert numpy floats to regular Python floats
            if np.isnan(data):
                return None
            elif np.isinf(data):
                return None
            else:
                return float(data)
        elif isinstance(data, (np.int64, np.int32)):
            return int(data)
        elif isinstance(data, float):
            # Handle regular Python floats that might be NaN or inf
            if math.isnan(data):
                return None
            elif math.isinf(data):
                return None
            else:
                return data
        else:
            return data


class StockDataFormatter:
    """Formats raw stock analysis data into structured models."""
    
    @staticmethod
    def format_stock_data(analysis: Dict[str, Any], ticker: str) -> Dict[str, Any]:
        """Format the analysis data to match the frontend expectations"""
        
        # Get current price and calculate change
        current_price = analysis.get('current_price', 0)
        
        # Get historical data for price change calculation
        stock = yf.Ticker(ticker)
        hist = stock.history(period="5d")
        
        if not hist.empty and len(hist) > 1:
            prev_close = hist['Close'].iloc[-2]
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100
        else:
            change = 0
            change_percent = 0
        
        # Get currency information from yfinance
        info = stock.info
        currency = info.get('currency', 'USD')  # Default to USD if not available
        
        # Format quote data
        quote = {
            "symbol": ticker.upper(),
            "name": analysis.get('company_name', f'{ticker.upper()} Corporation'),
            "price": current_price,
            "change": change,
            "changePercent": change_percent,
            "volume": int(analysis.get('avg_volume', 0)),
            "marketCap": analysis.get('market_cap', 0),
            "high52Week": analysis.get('52_week_high', 0),
            "low52Week": analysis.get('52_week_low', 0),
            "sector": analysis.get('sector', 'N/A'),
            "industry": analysis.get('industry', 'N/A'),
            "currency": currency
        }
        
        # Format financial metrics
        metrics = {
            "peRatio": analysis.get('pe_ratio'),
            "forwardPE": analysis.get('forward_pe'),
            "pegRatio": analysis.get('peg_ratio'),
            "priceToBook": analysis.get('price_to_book'),
            "priceToSales": analysis.get('price_to_sales'),
            "evToRevenue": analysis.get('enterprise_value_revenue'),
            "profitMargin": analysis.get('profit_margin'),
            "operatingMargin": analysis.get('operating_margin'),
            "grossMargin": None,  # Not available in yfinance
            "returnOnEquity": analysis.get('return_on_equity'),
            "returnOnAssets": analysis.get('return_on_assets'),
            "revenueGrowth": analysis.get('revenue_growth'),
            "earningsGrowth": analysis.get('earnings_growth'),
            "debtToEquity": analysis.get('debt_to_equity'),
            "currentRatio": analysis.get('current_ratio'),
            "quickRatio": analysis.get('quick_ratio'),
            "cashPerShare": analysis.get('cash_per_share'),
            "dividendYield": analysis.get('dividend_yield'),
            "dividendRate": analysis.get('dividend_rate'),
            "payoutRatio": analysis.get('payout_ratio')
        }
        
        # Format technical indicators
        technical = {
            "rsi": analysis.get('rsi'),
            "movingAverage50": analysis.get('ma_50'),
            "movingAverage200": analysis.get('ma_200'),
            "volatility": analysis.get('volatility'),
            "supportLevel": analysis.get('52_week_low', 0) * 0.9,  # Estimate
            "resistanceLevel": analysis.get('52_week_high', 0) * 1.1  # Estimate
        }
        
        # Get price history
        hist_1y = stock.history(period="1y")
        price_history = []
        
        if not hist_1y.empty:
            for date, row in hist_1y.iterrows():
                price_history.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close']),
                    "volume": int(row['Volume'])
                })
        
        return {
            "quote": quote,
            "metrics": metrics,
            "technical": technical,
            "priceHistory": price_history
        }


class PromptGenerator:
    """Generates AI analysis prompts."""
    
    @staticmethod
    def generate_analysis_prompt(analysis: Dict[str, Any], ticker: str) -> str:
        """Generate the AI analysis prompt with stock data."""
        return f"""
        Kamu adalah **analis saham profesional**.
        Aku akan memberikan **data saham dalam format JSON hasil dari yfinance**.

        Tugasmu adalah menyusun **ringkasan analisis saham** dengan format berikut:

        1. **Valuasi**
        * Bandingkan metrik valuasi (PER, PBV, EV/EBITDA) dengan standar umum pasar.
        * Berikan kesimpulan apakah saham tergolong **murah, sedang, atau mahal**.

        2. **Tren Kinerja Keuangan**
        * Uraikan pertumbuhan pendapatan, laba, margin usaha, dan margin bersih.
        * Gunakan format angka ribuan dengan satuan (contoh: 1,234B, 125M).

        3. **Posisi Neraca**
        * Analisis likuiditas (Current Ratio, Quick Ratio, posisi kas).
        * Komentari tingkat utang (Debt to Equity).
        * Simpulkan apakah neraca tergolong **sehat atau tidak**.

        4. **Arus Kas**
        * Tinjau arus kas operasi, investasi, dan pendanaan.
        * Sebutkan apakah arus kas secara umum **positif atau negatif**.

        5. **Momentum Perdagangan**
        * Gunakan data teknikal (harga saat ini, range 52 minggu, RSI, volume, volatilitas).
        * Berikan pandangan singkat mengenai potensi pergerakan jangka pendek (**gap up atau gap down**).

        6. **Rekomendasi Trading**
        * Akhiri dengan rekomendasi ringkas untuk strategi **"beli sore – jual pagi"**.
        * Sebutkan **harga beli ideal (support/entry point)** dan **harga jual target (resistance/exit point)**.
        * Tampilkan dalam bentuk **tabel teknikal sederhana** dengan kolom:
            * Support
            * Resistance
            * Target Entry
            * Target Exit
        * Gunakan bahasa Indonesia yang profesional, ringkas, dan mudah dipahami trader harian.

        **Gaya penulisan:**
        * Ringkas, jelas, menggunakan poin-poin bila perlu.
        * Hindari penjelasan akademis yang terlalu panjang.
        * Fokus pada insight praktis untuk trader (entry & exit level).

        Berikut adalah data JSON yang akan dianalisis:
        {{
          "symbol": "{ticker}",
          "company_name": "{analysis.get('company_name', 'N/A')}",
          "current_price": {analysis.get('current_price', 0)},
          "market_cap": {analysis.get('market_cap', 0)},

          "valuation": {{
            "pe_ratio": {analysis.get('pe_ratio', 'N/A')},
            "forward_pe": {analysis.get('forward_pe', 'N/A')},
            "price_to_book": {analysis.get('price_to_book', 'N/A')},
            "price_to_sales": {analysis.get('price_to_sales', 'N/A')},
            "price_to_cashflow": {analysis.get('price_to_cashflow', 'N/A')},
            "ev_to_ebitda": {analysis.get('ev_to_ebitda', 'N/A')},
            "enterprise_value": {analysis.get('enterprise_value', 'N/A')}
          }},

          "per_share": {{
            "eps_ttm": {analysis.get('eps_ttm', 'N/A')},
            "eps_forward": {analysis.get('eps_forward', 'N/A')},
            "eps_annualized": {analysis.get('eps_annualized', 'N/A')},
            "revenue_per_share": {analysis.get('revenue_per_share', 'N/A')},
            "cash_per_share": {analysis.get('cash_per_share', 'N/A')},
            "book_value_per_share": {analysis.get('book_value_per_share', 'N/A')},
            "free_cash_flow_per_share": {analysis.get('free_cash_flow_per_share', 'N/A')}
          }},

          "solvency": {{
            "current_ratio": {analysis.get('current_ratio', 'N/A')},
            "quick_ratio": {analysis.get('quick_ratio', 'N/A')},
            "debt_to_equity": {analysis.get('debt_to_equity', 'N/A')}
          }},

          "profitability": {{
            "profit_margin": {analysis.get('profit_margin', 'N/A')},
            "operating_margin": {analysis.get('operating_margin', 'N/A')},
            "return_on_equity": {analysis.get('return_on_equity', 'N/A')},
            "return_on_assets": {analysis.get('return_on_assets', 'N/A')}
          }},

          "income_statement": {{
            "revenue": {analysis.get('revenue_ttm', analysis.get('total_revenue', 'N/A'))},
            "gross_profit": {analysis.get('gross_profit_ttm', analysis.get('gross_profits', 'N/A'))},
            "ebitda": {analysis.get('ebitda_ttm', analysis.get('ebitda', 'N/A'))},
            "net_income": {analysis.get('net_income_ttm', analysis.get('net_income', 'N/A'))}
          }},

          "balance_sheet": {{
            "cash": {analysis.get('cash_balance', analysis.get('total_cash', 'N/A'))},
            "total_assets": {analysis.get('total_assets_bs', analysis.get('total_assets', 'N/A'))},
            "total_liabilities": {analysis.get('total_liabilities_bs', analysis.get('total_liabilities', 'N/A'))},
            "total_debt": {analysis.get('total_debt_bs', analysis.get('total_debt', 'N/A'))},
            "total_equity": {analysis.get('total_equity_bs', analysis.get('total_equity', 'N/A'))},
            "working_capital": {analysis.get('working_capital_calc', analysis.get('working_capital', 'N/A'))}
          }},

          "cash_flow": {{
            "operating_cash_flow": {analysis.get('operating_cf_ttm', analysis.get('operating_cash_flow', 'N/A'))},
            "investing_cash_flow": {analysis.get('investing_cf_ttm', analysis.get('investing_cash_flow', 'N/A'))},
            "financing_cash_flow": {analysis.get('financing_cf_ttm', analysis.get('financing_cash_flow', 'N/A'))},
            "capital_expenditure": {analysis.get('capex_ttm', analysis.get('capital_expenditure', 'N/A'))},
            "free_cash_flow": {analysis.get('free_cf_ttm', analysis.get('free_cash_flow', 'N/A'))}
          }},

          "market_data": {{
            "shares_outstanding": {analysis.get('shares_outstanding', 'N/A')},
            "free_float": {analysis.get('free_float', 'N/A')},
            "shares_short": {analysis.get('shares_short', 'N/A')},
            "short_ratio": {analysis.get('short_ratio', 'N/A')}
          }},

          "technical": {{
            "52_week_high": {analysis.get('52_week_high', 0)},
            "52_week_low": {analysis.get('52_week_low', 0)},
            "avg_volume": {analysis.get('avg_volume', 0)},
            "volatility": {analysis.get('volatility', 'N/A')},
            "ma_50": {analysis.get('ma_50', 'N/A')},
            "ma_200": {analysis.get('ma_200', 'N/A')},
            "rsi": {analysis.get('rsi', 'N/A')}
          }},

          "growth": {{
            "revenue_growth": {analysis.get('revenue_growth', 'N/A')},
            "earnings_growth": {analysis.get('earnings_growth', 'N/A')}
          }}
        }}
        """
